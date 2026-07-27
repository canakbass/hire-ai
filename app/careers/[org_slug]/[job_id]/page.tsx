import React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/service';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Sparkles, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import ApplicationForm from '@/components/careers/ApplicationForm';

interface PublicJobPageProps {
  params: Promise<{ org_slug: string; job_id: string }>;
}

export default async function PublicJobPage({ params }: PublicJobPageProps) {
  const { org_slug, job_id } = await params;
  const supabase = createAdminClient();

  // 1. Fetch Organization by slug (bypasses RLS for public visitors)
  const { data: org, error: orgErr } = await supabase
    .from('orgs')
    .select('*')
    .eq('slug', org_slug)
    .single();

  if (orgErr || !org) {
    notFound();
  }

  // 2. Fetch Job by id and check status != 'closed'
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', job_id)
    .eq('org_id', org.id)
    .single();

  if (jobErr || !job || job.status === 'closed') {
    notFound();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlexguiiewyxfbkgpocp.supabase.co';

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 py-12 px-4 sm:px-6 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Org Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg glow-primary font-extrabold text-lg text-white">
              {org.name[0].toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Kariyer Fırsatları
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {org.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-mono self-start sm:self-center">
            <span>/{org.slug}</span>
          </div>
        </div>

        {/* Job Title Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {job.title}
              </h1>
              {job.status === 'draft' && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Taslak (Önizleme Modu)</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
              {job.department && (
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>{job.department}</span>
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{job.location}</span>
                </span>
              )}
              <span className="flex items-center gap-2 capitalize">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{job.employment_type?.replace('_', ' ') || 'tam zamanlı'}</span>
              </span>
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">İş Tanımı ve Rol Sorumlulukları</h3>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>
          )}
        </div>

        {/* Application Form Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Bu Pozisyona Başvur</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Başvurunuz HireAI™ otonom değerlendirme altyapısı üzerinden güvenle alınır. Bilgileriniz üçüncü şahıslarla paylaşılmaz.
            </p>
          </div>

          <ApplicationForm
            orgSlug={org.slug}
            jobId={job.id}
            jobTitle={job.title}
            orgName={org.name}
            supabaseUrl={supabaseUrl}
          />
        </div>

        {/* Footer */}
        <div className="text-center pt-8 text-xs text-slate-500 space-y-2">
          <p>
            Powered by <strong className="text-slate-400">HireAI™</strong> — Otonom & Önyargısız İşe Alım Altyapısı
          </p>
          <p>
            Gizlilik Politikası & KVKK Aydınlatma Metni kapsamındadır.
          </p>
        </div>
      </div>
    </div>
  );
}
