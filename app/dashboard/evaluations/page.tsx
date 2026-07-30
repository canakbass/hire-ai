import React from 'react';
import { SlidersHorizontal, Sparkles, Star, LayoutGrid, Clock } from 'lucide-react';

export default function EvaluationsPlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-12">
      <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg glow-primary">
          <SlidersHorizontal className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>V3 Yapım Aşamasında</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Aday Değerlendirmeleri & Scorecard
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            AI mülakatları ve analizleri tamamlanan adayların detaylı performans karneleri (Scorecard) bu ekranda toplanacak ve birbirleriyle kıyaslanabilecektir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left border-t border-white/10 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400">Yetenek Kıyaslaması</h4>
            <p className="text-[11px] text-slate-400">Adayları teknik ve yumuşak yetenek skorlarına göre yan yana karşılaştırın.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400">Rubrik Uyumluluğu</h4>
            <p className="text-[11px] text-slate-400">İlan oluştururken girdiğiniz spesifik kriterlerin başarı oranını görün.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-indigo-400">Kültürel Uyum</h4>
            <p className="text-[11px] text-slate-400">Mülakat sonuçlarından çıkarılan takım çalışması ve uyum analizleri.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Şu anda aday havuzundaki aday detaylarından temel metrikleri inceleyebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}
