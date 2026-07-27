import React from 'react';
import { Award, Sparkles, Users, CheckCircle2, Clock } from 'lucide-react';

export default function ShortlistsPlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-12">
      <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-cyan-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg glow-primary">
          <Award className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faz 4 Yol Haritası Geliştirmesi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kısa Listeler & Karşılaştırma Karar Modülü
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Hem CV analizi hem de AI sesli mülakattan geçen finalist adayların puanlarının ağırlıklandırılarak karşılaştırıldığı final paneli, projenizin <strong>Faz 4</strong> aşamasında devreye alınacaktır.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left border-t border-white/10 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-cyan-400">Çoklu Aday Karşılaştırma</h4>
            <p className="text-[11px] text-slate-400">En iyi 5 adayın yetkinlik haritaları ve güçlü/zayıf yön tablosu yan yana kıyaslanır.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-cyan-400">Yöneticiden İşe Alım Kararı</h4>
            <p className="text-[11px] text-slate-400">Tek tıkla adaya teklif mektubu veya red bildirimi gönderilmesi sağlanır.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Adaylarınızı şu an 'Gelen Başvurular' sekmesinde AI Uyum Skoru ile filtreleyebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}
