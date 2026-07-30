import React from 'react';
import { BarChart3, Sparkles, PieChart, TrendingUp, Clock } from 'lucide-react';

export default function ReportsPlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-12">
      <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg glow-primary">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>V3 Yapım Aşamasında</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gelişmiş İK Raporları & Analitikler
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            İşe alım süreçlerinizin hızını, aday kalitesini ve AI destekli filtreleme başarı oranlarını detaylı metrikler ve grafiklerle inceleyebileceğiniz raporlama sayfası çok yakında.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left border-t border-white/10 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1"><PieChart className="w-3 h-3" /> Huniler</h4>
            <p className="text-[11px] text-slate-400">Başvurudan mülakata ve işe alıma kadar olan tüm huni (funnel) verilerini görün.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trendler</h4>
            <p className="text-[11px] text-slate-400">Hangi haftalarda hangi pozisyonlara daha nitelikli başvurular geldiğini takip edin.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Zaman Metrikleri</h4>
            <p className="text-[11px] text-slate-400">İlan açılışından ilk mülakata ve işe alıma kadar geçen ortalama süre (Time-to-Fill).</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Raporlama verileri, ilanlar üzerinden adaylar değerlendirildikçe aktif hale gelecektir.</span>
        </div>
      </div>
    </div>
  );
}
