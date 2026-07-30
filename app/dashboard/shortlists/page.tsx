import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { Star, Search, Filter, Briefcase, Mail, Phone, Calendar } from 'lucide-react';

export default async function ShortlistsPage({ searchParams }: { searchParams: { q?: string } }) {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: shortlistedApps, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidates (*),
      jobs!inner (title, status)
    `)
    .eq('org_id', authData.activeOrg.id)
    .in('status', ['shortlisted', 'hired'])
    .neq('jobs.status', 'closed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Shortlists fetch error:", error);
  }

  let list = shortlistedApps || [];
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    list = list.filter(app => 
      app.candidates?.full_name?.toLowerCase().includes(q) || 
      app.jobs?.title?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            En İyi Adaylar (Kısa Liste)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Yöneticiye önerilen, yüksek skorlu veya işe alım kararı verilen yıldızlı adaylarınız.
          </p>
        </div>
        <form className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              name="q"
              type="text" 
              defaultValue={searchParams.q || ''}
              placeholder="Kısa listede ara..." 
              className="bg-[#0b0f19] border border-[#1e293b] text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors w-64"
            />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-[#151c2f] border border-[#1e293b] hover:bg-[#1e293b] text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" /> Ara / Filtrele
          </button>
        </form>
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-12 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-amber-400 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Kısa Listeniz Boş</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Adayları değerlendirip "Yöneticiye Öner" (Shortlist) statüsüne taşıdığınızda bu ekranda toplanacaklardır.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.map((app) => {
            const candidate = app.candidates;
            const job = app.jobs;
            
            return (
              <div key={app.id} className="bg-[#151c2f] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition-all group hover:-translate-y-1">
                <div className="h-20 bg-gradient-to-r from-[#0b0f19] to-[#1e293b] relative">
                  <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-[#151c2f] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {candidate?.full_name?.charAt(0) || 'A'}
                  </div>
                  {app.status === 'hired' && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                      İşe Alındı
                    </span>
                  )}
                </div>
                
                <div className="p-6 pt-10">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {candidate?.full_name || 'İsimsiz Aday'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mb-4">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job?.title || 'Bilinmiyor'}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{candidate?.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{candidate?.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(app.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  
                  <Link href="/dashboard/applications" className="w-full py-2 bg-[#0b0f19] hover:bg-[#1e293b] border border-[#1e293b] rounded-xl text-xs font-semibold text-white transition-colors block text-center">
                    Profili İncele
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
