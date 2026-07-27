'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Database } from '@/lib/types/database.types';

type JobStatus = Database['public']['Enums']['job_status'];

export interface JobFormData {
  // Pozisyon Bilgileri
  title: string;
  department: string;
  location: string;
  employment_type: string;
  seniority: string;
  description: string;
  status: JobStatus;

  // Eleme Kriterleri
  required_skills: string[];
  nice_to_have_skills: string[];
  min_experience_years: number;
  education_level: string;
  languages: string[];
  scoring_weights: {
    skills: number;
    experience: number;
    education: number;
    other: number;
  };
  pass_threshold: number;
  reject_threshold: number;
  knockout_rules: string[];

  // Otonom Mülakat
  interview_enabled: boolean;
  interview_questions: string[];
  interview_language: string;
  interview_max_minutes: number;
  interview_pass_threshold: number;
  require_manual_call_approval: boolean;

  // Kısa Liste
  shortlist_size: number;
  ranking_weights: {
    cv: number;
    interview: number;
  };
}

export async function createJob(data: JobFormData) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.user || !authData.activeOrg) {
    return { error: 'Yetkisiz işlem. Lütfen oturum açın ve bir organizasyon seçin.' };
  }

  const { user, activeOrg } = authData;

  // Doğrulamalar (Validation)
  const scoringSum = 
    Number(data.scoring_weights.skills || 0) + 
    Number(data.scoring_weights.experience || 0) + 
    Number(data.scoring_weights.education || 0) + 
    Number(data.scoring_weights.other || 0);

  if (scoringSum !== 100) {
    return { error: `Skorlama ağırlıkları toplamı tam 100 olmalıdır (Mevcut toplam: ${scoringSum}).` };
  }

  const rankingSum = Number(data.ranking_weights.cv || 0) + Number(data.ranking_weights.interview || 0);
  if (rankingSum !== 100) {
    return { error: `Sıralama ağırlıkları toplamı tam 100 olmalıdır (Mevcut toplam: ${rankingSum}).` };
  }

  if (Number(data.reject_threshold) >= Number(data.pass_threshold)) {
    return { error: 'Red barajı (Reject threshold), potansiyel barajından (Pass threshold) kesinlikle küçük olmalıdır.' };
  }

  if (Number(data.shortlist_size) < 1) {
    return { error: 'Kısa liste boyutu en az 1 olmalıdır.' };
  }

  const supabase = await createClient();

  // 1. Pozisyon (jobs) kaydı at
  const { data: newJob, error: jobErr } = await supabase
    .from('jobs')
    .insert({
      org_id: activeOrg.id,
      title: data.title.trim(),
      department: data.department.trim() || null,
      location: data.location.trim() || null,
      employment_type: data.employment_type || 'full_time',
      seniority: data.seniority || 'mid',
      description: data.description.trim() || null,
      status: data.status || 'draft',
      created_by: user.id
    })
    .select()
    .single();

  if (jobErr || !newJob) {
    return { error: `Pozisyon oluşturulamadı: ${jobErr?.message}` };
  }

  // 2. Aynı server action içinde, yalnızca job_id + org_id vererek job_settings satırını oluştur (Diğer tüm alanlar schema.sql DB varsayılanlarından gelir)
  const { error: settingsErr } = await supabase
    .from('job_settings')
    .insert({
      job_id: newJob.id,
      org_id: activeOrg.id,
    });

  if (settingsErr) {
    // Geri alma (rollback)
    await supabase.from('jobs').delete().eq('id', newJob.id);
    return { error: `Pozisyon ayarları oluşturulamadı: ${settingsErr.message}` };
  }

  revalidatePath('/dashboard/jobs');
  revalidatePath('/dashboard');
  return { success: true, jobId: newJob.id };
}

export async function updateJob(jobId: string, data: JobFormData) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.user || !authData.activeOrg) {
    return { error: 'Yetkisiz işlem.' };
  }

  const { activeOrg } = authData;

  const scoringSum = 
    Number(data.scoring_weights.skills || 0) + 
    Number(data.scoring_weights.experience || 0) + 
    Number(data.scoring_weights.education || 0) + 
    Number(data.scoring_weights.other || 0);

  if (scoringSum !== 100) {
    return { error: `Skorlama ağırlıkları toplamı tam 100 olmalıdır (Mevcut toplam: ${scoringSum}).` };
  }

  const rankingSum = Number(data.ranking_weights.cv || 0) + Number(data.ranking_weights.interview || 0);
  if (rankingSum !== 100) {
    return { error: `Sıralama ağırlıkları toplamı tam 100 olmalıdır (Mevcut toplam: ${rankingSum}).` };
  }

  if (Number(data.reject_threshold) >= Number(data.pass_threshold)) {
    return { error: 'Red barajı, potansiyel barajından küçük olmalıdır.' };
  }

  if (Number(data.shortlist_size) < 1) {
    return { error: 'Kısa liste boyutu en az 1 olmalıdır.' };
  }

  const supabase = await createClient();

  // 1. Pozisyonu güncelle (RLS ile org_id kontrolü yapıyoruz)
  const { error: jobErr } = await supabase
    .from('jobs')
    .update({
      title: data.title.trim(),
      department: data.department.trim() || null,
      location: data.location.trim() || null,
      employment_type: data.employment_type || 'full_time',
      seniority: data.seniority || 'mid',
      description: data.description.trim() || null,
      status: data.status || 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('org_id', activeOrg.id);

  if (jobErr) {
    return { error: `Pozisyon güncellenemedi: ${jobErr.message}` };
  }

  // 2. job_settings'i güncelle (veya yoksa oluştur)
  const { error: settingsErr } = await supabase
    .from('job_settings')
    .upsert({
      job_id: jobId,
      org_id: activeOrg.id,
      required_skills: data.required_skills || [],
      nice_to_have_skills: data.nice_to_have_skills || [],
      min_experience_years: Number(data.min_experience_years) || 0,
      education_level: data.education_level || 'lisans',
      languages: data.languages || [],
      scoring_weights: data.scoring_weights,
      pass_threshold: Number(data.pass_threshold) || 70,
      reject_threshold: Number(data.reject_threshold) || 40,
      knockout_rules: data.knockout_rules || [],
      interview_enabled: data.interview_enabled ?? true,
      interview_questions: data.interview_questions || [],
      interview_language: data.interview_language || 'tr',
      interview_max_minutes: Number(data.interview_max_minutes) || 6,
      interview_pass_threshold: Number(data.interview_pass_threshold) || 70,
      shortlist_size: Number(data.shortlist_size) || 5,
      ranking_weights: data.ranking_weights,
      require_manual_call_approval: data.require_manual_call_approval ?? true,
    });

  if (settingsErr) {
    return { error: `Ayarlar güncellenemedi: ${settingsErr.message}` };
  }

  revalidatePath('/dashboard/jobs');
  revalidatePath(`/dashboard/jobs/${jobId}/edit`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleJobStatus(jobId: string, currentStatus: JobStatus) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    return { error: 'Yetkisiz işlem.' };
  }

  const newStatus: JobStatus = currentStatus === 'published' ? 'draft' : 'published';
  const supabase = await createClient();

  const { error } = await supabase
    .from('jobs')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('org_id', authData.activeOrg.id);

  if (error) {
    return { error: `Durum güncellenemedi: ${error.message}` };
  }

  revalidatePath('/dashboard/jobs');
  revalidatePath('/dashboard');
  return { success: true, newStatus };
}

export async function deleteJob(jobId: string) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    return { error: 'Yetkisiz işlem.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('org_id', authData.activeOrg.id);

  if (error) {
    return { error: `Pozisyon silinemedi: ${error.message}` };
  }

  revalidatePath('/dashboard/jobs');
  revalidatePath('/dashboard');
  return { success: true };
}
