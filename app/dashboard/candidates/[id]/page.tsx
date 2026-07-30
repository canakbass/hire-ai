import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { User, Mail, Phone, Calendar, Briefcase, FileText, ChevronLeft, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import CVDownloadButton from '@/components/dashboard/CVDownloadButton';

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Fetch the candidate and all their applications
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select(`
      *,
      applications (
        *,
        jobs (title),
        cv_analyses (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !candidate) {
    return (
      <div className="p-12 text-center text-slate-400">
        Aday bilgileri bulunamadı.
      </div>
    );
  }

  const applications = Array.isArray(candidate.applications) ? candidate.applications : [];
  // Sort applications by created_at descending
  applications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <Link href="/dashboard/candidates" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Aday Havuzuna Dön
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#151c2f] border border-[#1e293b] p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl">
              {(candidate.full_name || candidate.email || 'A').substring(0,2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{candidate.full_name || 'İsimsiz Aday'}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                {candidate.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {candidate.email}</span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {candidate.phone}</span>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" /> Kayıt: {new Date(candidate.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          Adayın Başvuruları ({applications.length})
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app: any) => {
            const analysis = app.cv_analyses?.[0];
            const statusInfo = {
              new: { label: 'Yeni', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
              review: { label: 'İncelemede', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
              potential: { label: 'Potansiyel', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
              irrelevant: { label: 'Alakasız', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
              shortlisted: { label: 'Kısa Listede (Önerilen)', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
              hired: { label: 'İşe Alındı', color: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' },
              rejected: { label: 'Reddedildi', color: 'bg-slate-800 text-slate-400 border-slate-700' },
            }[app.status as string] || { label: app.status, color: 'bg-slate-800 text-slate-400 border-slate-700' };

            return (
              <div key={app.id} className="bg-[#0b0f19] border border-[#1e293b] p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-indigo-500/30 transition-colors">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{app.jobs?.title || 'Bilinmeyen Pozisyon'}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Başvuru: {new Date(app.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="bg-[#151c2f] p-4 rounded-xl border border-[#1e293b]">
                    <h5 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> AI Uygunluk Analizi
                    </h5>
                    {analysis ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-indigo-500/20 bg-[#0b0f19]">
                            <span className="font-extrabold text-indigo-400 text-sm">%{analysis.match_score}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3 py-1">
                              "{analysis.verdict}"
                            </p>
                          </div>
                        </div>
                        {analysis.extracted?.skills && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(analysis.extracted.skills as string[]).map((s: string, idx: number) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded border border-white/5 bg-white/5 text-slate-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Bu başvuru için henüz yapay zeka analizi oluşturulmamış.</p>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-[#1e293b] pt-4 md:pt-0 md:pl-6">
                  {app.cv_storage_path && (
                    <CVDownloadButton storagePath={app.cv_storage_path} applicationId={app.id} />
                  )}
                  {app.status === 'shortlisted' && (
                    <div className="w-full px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4" /> Yıldızlı Aday
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
