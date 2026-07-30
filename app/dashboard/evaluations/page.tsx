import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { SlidersHorizontal, Search, Star, FileText, PhoneCall, Trophy, Filter } from 'lucide-react';

export default async function EvaluationsPage({ searchParams }: { searchParams: { q?: string } }) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: evaluations, error } = await supabase
    .from('evaluations')
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
    .order('final_score', { ascending: false });

  if (error) {
    console.error("Evaluations fetch error:", error);
  }

  let evals = evaluations || [];
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    evals = evals.filter(ev => {
      const app = Array.isArray(ev.applications) ? ev.applications[0] : ev.applications;
      return app?.candidates?.full_name?.toLowerCase().includes(q) || 
             app?.jobs?.title?.toLowerCase().includes(q);
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
            Değerlendirmeler & Scorecard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Adayların CV tarama ve mülakat sonuçlarının birleştirildiği nihai performans karneleri.
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

      {/* Grid */}
      {evals.length === 0 ? (
        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-12 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-indigo-400 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Henüz değerlendirme yok</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Adaylar testleri veya mülakatları tamamladığında nihai değerlendirme karneleri (Scorecard) burada görünecektir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evals.map((ev) => {
            const app = Array.isArray(ev.applications) ? ev.applications[0] : ev.applications;
            const candidate = app?.candidates;
            const job = app?.jobs;
            
            return (
              <div key={ev.id} className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 shadow-xl hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
                {ev.is_shortlisted && (
                  <div className="absolute top-0 right-0 p-3">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-md" />
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    {candidate?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{candidate?.full_name || 'İsimsiz Aday'}</h3>
                    <p className="text-xs text-slate-400">{job?.title || 'Bilinmeyen Pozisyon'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Final Score */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-indigo-400" /> Nihai Skor
                      </span>
                      <span className="text-white font-bold">{ev.final_score || 0}/100</span>
                    </div>
                    <div className="h-2 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${ev.final_score || 0}%` }} />
                    </div>
                  </div>

                  {/* CV Score */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> CV Eşleşmesi
                      </span>
                      <span className="text-white font-bold">{ev.cv_score || 0}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${ev.cv_score || 0}%` }} />
                    </div>
                  </div>

                  {/* Interview Score */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5" /> Mülakat Başarısı
                      </span>
                      <span className="text-white font-bold">{ev.interview_score || 0}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ev.interview_score || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
