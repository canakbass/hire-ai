import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { 
  Briefcase, 
  Plus, 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  XCircle, 
  ExternalLink,
  Edit,
  Sparkles
} from 'lucide-react';
import JobCardActions from '@/components/dashboard/JobCardActions';

export default async function JobsPage() {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login?redirect_to=%2Fdashboard%2Fjobs');
  }

  const { activeOrg } = authData;
  const supabase = await createClient();

  // Fetch all jobs for this org along with their settings
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_settings(*)')
    .eq('org_id', activeOrg.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pozisyon Yönetimi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              {jobs?.length || 0} Pozisyon
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {activeOrg.name} bünyesindeki açık pozisyonlar, AI eleme kriterleri ve mülakat barajları.
          </p>
        </div>

        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg glow-primary transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Pozisyon Aç</span>
        </Link>
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 flex flex-col items-center justify-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 glow-primary">
            <Briefcase className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Henüz Açık Pozisyon Bulunmuyor</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            AI skorlama rubriği, otonom mülakat soruları ve kısa liste ayarlarıyla ilk pozisyonunuzu oluşturun.
          </p>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg glow-primary transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Pozisyonu Oluştur</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const settings = Array.isArray(job.job_settings) ? job.job_settings[0] : job.job_settings;
            const statusBadge = {
              draft: { label: 'Taslak (Draft)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock },
              published: { label: 'Yayında (Published)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
              paused: { label: 'Durduruldu', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: PauseCircle },
              closed: { label: 'Kapandı', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
            }[job.status] || { label: job.status, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock };

            const BadgeIcon = statusBadge.icon;

            return (
              <div
                key={job.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-white hover:text-indigo-300 transition-colors">
                      {job.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusBadge.color}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{statusBadge.label}</span>
                    </span>
                    {settings && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium flex items-center gap-1">
                        <Sliders className="w-3 h-3" />
                        <span>Pass: {settings.pass_threshold || 70} Puan</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                    {job.department && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{job.department}</span>
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{job.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 capitalize">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{job.employment_type?.replace('_', ' ') || 'full time'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
                    </span>
                  </div>

                  {/* Quick criteria preview */}
                  {settings?.required_skills && settings.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {settings.required_skills.slice(0, 5).map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] border border-white/5 font-mono">
                          {skill}
                        </span>
                      ))}
                      {settings.required_skills.length > 5 && (
                        <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-400 text-[11px]">
                          +{settings.required_skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {job.status === 'published' && (
                    <Link
                      href={`/careers/${activeOrg.slug}/${job.id}`}
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
                      title="Public Kariyer Sayfasını Gör"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Kariyer Sayfası</span>
                    </Link>
                  )}

                  <Link
                    href={`/dashboard/jobs/${job.id}/edit`}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Düzenle</span>
                  </Link>

                  <JobCardActions jobId={job.id} currentStatus={job.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
