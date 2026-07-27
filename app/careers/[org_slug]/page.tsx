import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/service';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Sparkles, 
  ArrowRight,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface OrgCareerPageProps {
  params: Promise<{ org_slug: string }>;
}

export default async function OrgCareerPage({ params }: OrgCareerPageProps) {
  const { org_slug } = await params;
  const supabase = createAdminClient();

  // 1. Fetch Organization by slug (bypasses RLS to ensure public visitors can always read)
  const { data: org, error: orgErr } = await supabase
    .from('orgs')
    .select('*')
    .eq('slug', org_slug)
    .single();

  if (orgErr || !org) {
    notFound();
  }

  // 2. Fetch jobs for this organization that are not closed
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('org_id', org.id)
    .neq('status', 'closed')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 py-12 px-4 sm:px-6 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Org Header Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg glow-primary font-black text-2xl text-white">
                {org.name[0].toUpperCase()}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resmi Kariyer Portalı</span>
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {org.name}
                </h1>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>/{org.slug}</span>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            {org.name} bünyesindeki açık pozisyonları inceleyebilir, otonom değerlendirme altyapımız üzerinden kolayca özgeçmişinizi iletebilirsiniz.
          </p>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Açık Pozisyonlar ({jobs?.length || 0})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              HireAI™ Otonom İşe Alım ve Önyargısız Değerlendirme Motoru Aktif
            </span>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Şu Anda Açık Pozisyon Bulunmuyor</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                {org.name} şu an için tüm pozisyonlarını doldurmuş veya yeni ilan açmamış olabilir. Lütfen daha sonra tekrar ziyaret ediniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/careers/${org.slug}/${job.id}`}
                  className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {job.title}
                      </h3>
                      {job.status === 'draft' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Taslak (Önizleme)</span>
                        </span>
                      )}
                      {job.status === 'published' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Başvuruya Açık</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      {job.department && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <span>{job.department}</span>
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 capitalize">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <span>{job.employment_type?.replace('_', ' ') || 'tam zamanlı'}</span>
                      </span>
                    </div>

                    {job.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors sm:pl-4 self-end sm:self-center">
                    <span>İncele & Başvur</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
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
