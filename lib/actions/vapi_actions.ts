'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase with service role key to bypass RLS in server actions
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function startVoiceInterview(applicationId: string) {
  try {
    // 1. Check if Vapi ENV vars are set
    const vapiApiKey = process.env.VAPI_API_KEY || process.env.VAPI_PRIVATE_API_KEY;
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID;
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    if (!vapiApiKey || !vapiAssistantId || !vapiPhoneNumberId) {
      return { error: 'Vapi API ayarları (.env.local) eksik. Lütfen yapılandırın.' };
    }

    // 2. Fetch Application and Candidate Data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        candidates (full_name, phone)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return { error: 'Başvuru bulunamadı.' };
    }

    // @ts-ignore
    const candidatePhone = application.candidates?.phone;
    // @ts-ignore
    const candidateName = application.candidates?.full_name || 'Aday';

    if (!candidatePhone) {
      return { error: 'Adayın telefon numarası sistemde kayıtlı değil.' };
    }

    // Format phone number (Vapi requires E.164 format, e.g., +905551234567)
    // Basic cleanup - ideally should use a library like google-libphonenumber
    let formattedPhone = candidatePhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('90') && formattedPhone.length === 10) {
      formattedPhone = '90' + formattedPhone;
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // 3. Make Outbound Call to Vapi
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: vapiPhoneNumberId,
        assistantId: vapiAssistantId,
        customer: {
          number: formattedPhone,
          name: candidateName
        },
        assistantOverrides: {
          variableValues: {
            candidateName: candidateName
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vapi Call Error:', errorData);
      return { error: `Vapi araması başlatılamadı: ${errorData.message || response.statusText}` };
    }

    const vapiCall = await response.json();

    // 4. Update Database
    // Create interview record
    await supabase.from('interviews').insert({
      application_id: applicationId,
      org_id: application.org_id,
      vapi_call_id: vapiCall.id,
      status: 'in_progress',
      transcript: 'Mülakat devam ediyor veya çağrı henüz sonuçlanmadı...'
    });

    // Update application status
    await supabase.from('applications')
      .update({ status: 'interview_pending' })
      .eq('id', applicationId);

    return { success: true, callId: vapiCall.id };

  } catch (error: any) {
    console.error('Start Voice Interview Error:', error);
    return { error: error.message || 'Mülakat başlatılırken beklenmeyen bir hata oluştu.' };
  }
}
