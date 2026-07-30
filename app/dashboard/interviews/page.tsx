import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { PhoneCall, Play, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function InterviewsPage({ searchParams }: { searchParams: { q?: string } }) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications (
        id,
        status,
        candidates (
          full_name
        ),
        jobs!inner (
          title,
          status
        )
      )
    `)
    .eq('org_id', authData.activeOrg.id)
    .neq('applications.jobs.status', 'closed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Interviews fetch error:", error);
  }

  let interviewList = interviews || [];
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    interviewList = interviewList.filter(interview => {
      const app = Array.isArray(interview.applications) ? interview.applications[0] : interview.applications;
      return app?.candidates?.full_name?.toLowerCase().includes(q) || 
             app?.jobs?.title?.toLowerCase().includes(q) ||
             interview.id.toLowerCase().includes(q);
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-indigo-400" />
            AI Otonom Mülakatlar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Yapay zeka tarafından gerçekleştirilen sesli mülakatların kayıtlarını ve değerlendirmelerini inceleyin.
          </p>
        </div>
        <form className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              name="q"
              type="text" 
              defaultValue={searchParams.q || ''}
              placeholder="Aday veya pozisyon ara..." 
              className="bg-[#0b0f19] border border-[#1e293b] text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors w-64"
            />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-[#151c2f] border border-[#1e293b] hover:bg-[#1e293b] text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" /> Ara / Filtrele
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        {interviewList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <PhoneCall className="w-8 h-8 text-indigo-400 opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Henüz mülakat kaydı yok</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Adaylar otonom sesli mülakata girdiklerinde ses kayıtları, transkriptler ve AI değerlendirmeleri burada listelenecektir.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0b0f19]/50 text-xs uppercase text-slate-400 font-semibold border-b border-[#1e293b]">
                <tr>
                  <th className="px-6 py-4">Aday</th>
                  <th className="px-6 py-4">Pozisyon</th>
                  <th className="px-6 py-4">Mülakat Tarihi</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">AI Skoru</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {interviewList.map((interview) => {
                  const app = Array.isArray(interview.applications) ? interview.applications[0] : interview.applications;
                  const candidate = app?.candidates;
                  const job = app?.jobs;
                  
                  return (
                    <tr key={interview.id} className="hover:bg-[#1e293b]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {candidate?.full_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{candidate?.full_name || 'İsimsiz Aday'}</div>
                            <div className="text-xs text-slate-500">ID: {interview.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {job?.title || 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(interview.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                          </span>
                        ) : interview.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Hata / Koptu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" /> Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white">{interview.overall_score || 0}</div>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${interview.overall_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {interview.recording_url && (
                            <a 
                              href={interview.recording_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="Ses Kaydını Dinle"
                            >
                              <Play className="w-4 h-4" />
                            </a>
                          )}
                          <Link 
                            href={`/dashboard/applications`} 
                            className="px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white transition-colors"
                          >
                            Detay
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
