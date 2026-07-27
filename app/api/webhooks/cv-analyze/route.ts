import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Next.js App Router API Route for Vercel Serverless
// This endpoint perfectly replicates and improves upon the old n8n workflow.
export async function POST(req: Request) {
  try {
    // 1. Validate X-Webhook-Secret for Security
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body safely
    const body = await req.json();
    const applicationId = body.application_id || body.record?.id; // Support both explicit payloads and direct Supabase triggers

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client (Bypass RLS for server-side processing)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Fetch Application and Job Details
    const { data: appData, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(*, job_settings(*))')
      .eq('id', applicationId)
      .single();

    if (appError || !appData) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 5. Idempotency Check: Prevent duplicate evaluations
    if (appData.status !== 'new' || !appData.cv_storage_path) {
      return NextResponse.json(
        { success: true, idempotent_skip: true, message: 'Application is not in new status or lacks CV file.' },
        { status: 200 }
      );
    }

    // 6. Download CV File from Supabase Storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('cv-files')
      .download(appData.cv_storage_path);

    if (fileError || !fileData) {
      console.error('CV Download Error:', fileError);
      return NextResponse.json({ error: 'Failed to download CV file' }, { status: 500 });
    }

    // 7. Convert File to Base64 for Gemini Vision/File API
    const buffer = await fileData.arrayBuffer();
    const fileBase64 = Buffer.from(buffer).toString('base64');
    const mimeType = fileData.type || 'application/pdf';

    // 8. Prepare Gemini Prompt based on strict Job Settings Rubric
    const job = appData.jobs;
    // Extract job settings safely (handles both array and single object relations)
    const settings = Array.isArray(job?.job_settings) ? job.job_settings[0] : (job?.job_settings || {});

    const blindAssessmentInstruction = `
KRİTİK TALİMAT — ÖNYARGI KORUMASI (BLIND ASSESSMENT):
Bu adayı değerlendirirken ad, soyad, yaş, cinsiyet, medeni durum, uyruk, etnik köken, din, fotoğraf veya doğum yeri gibi demografik unsurları KESİNLİKLE dikkate alma, pozitif veya negatif ayrımcılık yapma.
Yalnızca teknik yetkinlikler, mesleki tecrübe yılları, eğitim düzeyi ve pozisyon rubriği kriterlerine göre tarafsız puanlama yap.
`;

    const rubricInstruction = `
POZİSYON VE RUBRİK BİLGİLERİ:
- Pozisyon Başlığı: ${job?.title || 'Genel Başvuru'}
- Departman: ${job?.department || 'Belirtilmedi'}
- İş Tanımı: ${job?.description || 'Belirtilmedi'}
- Zorunlu Yetkinlikler (Required Skills): ${JSON.stringify(settings.required_skills || [])}
- İsteğe Bağlı Yetkinlikler (Nice to Have): ${JSON.stringify(settings.nice_to_have_skills || [])}
- Minimum Tecrübe Yılı: ${settings.min_experience_years || 0}
- Aranan Eğitim Düzeyi: ${settings.education_level || 'Belirtilmedi'}
- Diller: ${JSON.stringify(settings.languages || [])}
- Puanlama Ağırlıkları: ${JSON.stringify(settings.scoring_weights || {})}
- Temel Ön Şartlar (Knockout Rules): ${JSON.stringify(settings.knockout_rules || [])}
`;

    const outputSchemaInstruction = `
ÇIKTI FORMATI:
Yalnızca aşağıdaki JSON şemasında geçerli ve eksiksiz bir JSON nesnesi döndür. Markdown backtick kullanma, sadece ham JSON nesnesi ver:
{
  "match_score": 85,
  "extracted": {
    "name": "Aday Adı",
    "skills": ["beceri1", "beceri2"],
    "experience_years": 4,
    "education_level": "lisans",
    "languages": ["İngilizce"]
  },
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "gaps": ["eksik yön 1"],
  "knockout_violation": false,
  "knockout_reason": null
}
`;

    const fullPrompt = blindAssessmentInstruction + rubricInstruction + outputSchemaInstruction;

    // 9. Call Gemini API natively
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await aiModel.generateContent([
      fullPrompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Parse Gemini JSON Response Safely
    let parsedResult;
    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json({ error: 'Invalid AI response format from Gemini' }, { status: 500 });
    }

    // Determine Status / Verdict
    const matchScore = parsedResult.match_score || 0;
    const passThreshold = settings.pass_threshold ?? 70;
    const rejectThreshold = settings.reject_threshold ?? 40;
    
    let verdict = 'review';
    if (parsedResult.knockout_violation || matchScore < rejectThreshold) {
      verdict = 'rejected';
    } else if (matchScore >= passThreshold) {
      verdict = 'shortlisted';
    }

    // 10. Save Analysis to Database
    const { error: insertError } = await supabaseAdmin
      .from('cv_analyses')
      .insert({
        application_id: appData.id,
        org_id: appData.org_id,
        match_score: matchScore,
        extracted: parsedResult.extracted || {},
        strengths: parsedResult.strengths || [],
        gaps: parsedResult.gaps || [],
        verdict: verdict,
        model: 'gemini-1.5-flash'
      });

    if (insertError) {
      console.error('Failed to insert cv_analysis:', insertError);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    // 11. Update Application Status
    const { error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ status: 'analyzed' })
      .eq('id', appData.id);

    if (updateError) {
      console.error('Failed to update application status:', updateError);
      return NextResponse.json({ error: 'Database update failed for application' }, { status: 500 });
    }

    // Success!
    return NextResponse.json({ success: true, verdict, match_score: matchScore });

  } catch (err: any) {
    console.error('CV Analyze Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
