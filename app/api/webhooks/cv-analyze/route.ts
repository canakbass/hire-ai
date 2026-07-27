import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Core AI Analysis Logic extracted for reusability (can be called by webhook or Server Action)
export async function processCvAnalysis(applicationId: string, force: boolean = false) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch Application and Job Details
  const { data: appData, error: appError } = await supabaseAdmin
    .from('applications')
    .select('*, jobs(*, job_settings(*))')
    .eq('id', applicationId)
    .single();

  if (appError || !appData) {
    throw new Error('Başvuru bulunamadı.');
  }

  // 2. Idempotency Check
  if (!force && appData.status !== 'new' && appData.status !== 'error') {
    if (!appData.cv_storage_path) {
      return { success: true, idempotent_skip: true, message: 'CV dosyası eksik.' };
    }
    return { success: true, idempotent_skip: true, message: 'Başvuru zaten işlenmiş.' };
  }

  if (!appData.cv_storage_path) {
    throw new Error('Adaya ait CV belgesi bulunamadı.');
  }

  // 3. Download CV File
  const { data: fileData, error: fileError } = await supabaseAdmin
    .storage
    .from('cv-files')
    .download(appData.cv_storage_path);

  if (fileError || !fileData) {
    console.error('CV Download Error:', fileError);
    throw new Error('CV dosyası Storage üzerinden indirilemedi.');
  }

  // 4. Convert File to Base64
  const buffer = await fileData.arrayBuffer();
  const fileBase64 = Buffer.from(buffer).toString('base64');
  const mimeType = fileData.type || 'application/pdf';

  // 5. Prepare Gemini Prompt
  const job = appData.jobs;
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

  // 6. Call Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const aiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const result = await aiModel.generateContent([
    fullPrompt,
    { inlineData: { data: fileBase64, mimeType: mimeType } },
  ]);

  const responseText = result.response.text();
  
  // 7. Parse AI Response
  let parsedResult;
  try {
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedResult = JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse Gemini response:', responseText);
    throw new Error('Gemini API geçersiz bir JSON formatı döndürdü.');
  }

  // 8. Determine Status
  const matchScore = parsedResult.match_score || 0;
  const passThreshold = settings.pass_threshold ?? 70;
  const rejectThreshold = settings.reject_threshold ?? 40;
  
  let verdict = 'review';
  if (parsedResult.knockout_violation || matchScore < rejectThreshold) {
    verdict = 'rejected';
  } else if (matchScore >= passThreshold) {
    verdict = 'shortlisted';
  }

  // 9. Save Analysis
  const analysisPayload = {
    application_id: appData.id,
    org_id: appData.org_id,
    match_score: matchScore,
    extracted: parsedResult.extracted || {},
    strengths: parsedResult.strengths || [],
    gaps: parsedResult.gaps || [],
    verdict: verdict,
    model: 'gemini-flash-latest'
  };

  const { data: existingAnalysis } = await supabaseAdmin
    .from('cv_analyses')
    .select('id')
    .eq('application_id', appData.id)
    .single();

  let insertError;
  if (existingAnalysis) {
    const { error } = await supabaseAdmin
      .from('cv_analyses')
      .update(analysisPayload)
      .eq('id', existingAnalysis.id);
    insertError = error;
  } else {
    const { error } = await supabaseAdmin
      .from('cv_analyses')
      .insert(analysisPayload);
    insertError = error;
  }

  if (insertError) {
    console.error('Failed to insert cv_analysis:', insertError);
    throw new Error('Analiz sonucu veritabanına kaydedilemedi.');
  }

  // 10. Update Application Status
  const { error: updateError } = await supabaseAdmin
    .from('applications')
    .update({ status: 'analyzed' })
    .eq('id', appData.id);

  if (updateError) {
    console.error('Failed to update application status:', updateError);
    throw new Error('Başvuru durumu güncellenemedi.');
  }

  return { success: true, verdict, match_score: matchScore };
}

// Next.js App Router API Route for Webhooks
export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const applicationId = body.application_id || body.record?.id;

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const result = await processCvAnalysis(applicationId, !!body.force);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('CV Analyze Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
