import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Vapi sends different types of messages. We are interested in end-of-call-report
    if (body.message?.type === 'end-of-call-report') {
      const call = body.message.call;
      const vapiCallId = call.id;
      const transcript = body.message.transcript;
      const recordingUrl = body.message.recordingUrl;
      const summary = body.message.summary;

      console.log(`[VAPI Webhook] Call Ended: ${vapiCallId}`);

      // 1. Get the interview record from our DB
      const { data: interview, error: fetchError } = await supabase
        .from('interviews')
        .select('*')
        .eq('vapi_call_id', vapiCallId)
        .single();

      if (fetchError || !interview) {
        console.error('Interview not found for call ID:', vapiCallId);
        return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
      }

      // 2. Evaluate Transcript with Gemini (Score 0-100)
      let overallScore = 0;
      let aiAnalysis = 'Değerlendirme yapılamadı.';
      
      try {
        if (process.env.GEMINI_API_KEY && transcript) {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const prompt = `
          Sen uzman bir İK Yöneticisisin. Aşağıda adayın yapay zeka ile yaptığı bir mülakatın dökümü (transkripti) bulunuyor. 
          Lütfen bu mülakatı teknik yeterlilik, iletişim becerisi ve probleme yaklaşım açısından değerlendir.
          Adaya 0 ile 100 arasında bir puan (score) ver. 
          Çıktı FORMATIN KESİNLİKLE AŞAĞIDAKİ JSON GİBİ OLMALIDIR, BAŞKA METİN YAZMA:
          {"score": 85, "analysis": "Adayın iletişim yeteneği güçlü..."}

          Transkript:
          ${transcript}
          `;

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          
          overallScore = parsed.score || 0;
          aiAnalysis = parsed.analysis || '';
        }
      } catch (geminiError) {
        console.error('Gemini eval error:', geminiError);
      }

      // 3. Update Interviews Table
      await supabase
        .from('interviews')
        .update({
          status: 'completed',
          transcript: transcript,
          recording_url: recordingUrl,
          overall_score: overallScore,
          scores: { analysis: aiAnalysis, summary: summary }
        })
        .eq('id', interview.id);

      // 4. Update Applications Table
      await supabase
        .from('applications')
        .update({ status: 'interviewed' })
        .eq('id', interview.application_id);

      return NextResponse.json({ success: true });
    }

    // Acknowledge other event types (e.g., status-update)
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Vapi Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
