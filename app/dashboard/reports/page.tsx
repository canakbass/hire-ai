import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import { BarChart3, Users, Briefcase, PhoneCall, Trophy, ArrowUpRight, ArrowDownRight, Clock, SlidersHorizontal } from 'lucide-react';

export default async function ReportsPage() {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const supabase = await createClient();
  
  // Fetch basic stats
  const [
    { count: jobsCount },
    { count: appsCount },
    { count: interviewsCount },
    { count: shortlistsCount }
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('org_id', authData.activeOrg.id),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('org_id', authData.activeOrg.id),
    supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('org_id', authData.activeOrg.id),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('org_id', authData.activeOrg.id).in('status', ['shortlisted', 'hired'])
  ]);

  const kpis = [
    { title: 'Aktif Pozisyonlar', value: jobsCount || 0, trend: '+12%', isUp: true, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Toplam Başvuru', value: appsCount || 0, trend: '+24%', isUp: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Otonom Mülakatlar', value: interviewsCount || 0, trend: '+5%', isUp: true, icon: PhoneCall, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Kısa Listeye Alınan', value: shortlistsCount || 0, trend: '-2%', isUp: false, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Raporlar & Analizler
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            İşe alım sürecinizin genel metriklerini ve yapay zeka mülakat başarı oranlarını inceleyin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#151c2f] border border-[#1e293b] rounded-xl flex items-center p-1">
            <button className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-md">Son 30 Gün</button>
            <button className="px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors">Bu Yıl</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#151c2f] border border-[#1e293b] p-5 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full blur-3xl opacity-20 ${kpi.bg.replace('/10', '')}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            
            <h3 className="text-slate-400 text-sm font-medium mb-1">{kpi.title}</h3>
            <p className="text-3xl font-extrabold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel & Conversion (Mock Charts Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-[#151c2f] border border-[#1e293b] p-6 rounded-2xl shadow-lg">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Başvuru Trendi
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[35, 45, 30, 60, 80, 50, 90, 75, 100, 85, 120, 95].map((val, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div className="w-full bg-[#1e293b] rounded-t-sm relative group-hover:bg-indigo-500/30 transition-colors" style={{ height: `${val}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${val * 0.6}%` }} />
                </div>
                <span className="text-[9px] text-slate-500 uppercase">{['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151c2f] border border-[#1e293b] p-6 rounded-2xl shadow-lg flex flex-col">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Mülakat Hunisi (Funnel)
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Gelen Başvurular</span>
                <span className="text-white font-bold">{appsCount}</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-500/20" />
                <div className="h-full bg-blue-500 w-full" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">CV Aşamasını Geçen</span>
                <span className="text-white font-bold">{Math.round(appsCount! * 0.4) || 0}</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden relative flex justify-center">
                <div className="h-full bg-indigo-500 w-3/4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Mülakatı Tamamlayan</span>
                <span className="text-white font-bold">{interviewsCount}</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden relative flex justify-center">
                <div className="h-full bg-purple-500 w-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Kısa Listeye Alınan</span>
                <span className="text-white font-bold">{shortlistsCount}</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden relative flex justify-center">
                <div className="h-full bg-amber-500 w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-8">
        <Clock className="w-4 h-4" />
        <p>V4 Canlı Raporlar Devrede. Gelişmiş veri ihracı yakında.</p>
      </div>
    </div>
  );
}
