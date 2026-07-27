import React from 'react';
import { Settings, Sparkles, Building2, Users, Shield, Clock } from 'lucide-react';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';

export default async function SettingsPlaceholderPage() {
  const authData = await getCurrentUserAndOrg();
  const activeOrg = authData?.activeOrg;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto py-12">
      <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-purple-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg glow-primary">
          <Settings className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faz 5 Yol Haritası Geliştirmesi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Çalışma Alanı & Ekip Yönetimi
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Aktif çalışma alanınız <strong>{activeOrg?.name || 'Mevcut Organizasyon'}</strong> (/{activeOrg?.slug || 'slug'}) için çoklu ekip üyesi davet etme, yetkilendirme (Owner, Admin, Recruiter, Viewer) ve API ayarları <strong>Faz 5</strong> aşamasında devreye girecektir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left border-t border-white/10 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-purple-400">Ekip Üyesi Daveti</h4>
            <p className="text-[11px] text-slate-400">İK uzmanlarınızı e-posta ile davet edip farklı yetkiler atayabilirsiniz.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-purple-400">Kariyer Sayfası Teması</h4>
            <p className="text-[11px] text-slate-400">Public kariyer sayfanızın logo ve renk paletini özelleştirebilirsiniz.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-purple-400">API & Webhook Logları</h4>
            <p className="text-[11px] text-slate-400">n8n ve HireAI™ Otonom Motor entegrasyonlarının çalışma geçmişini inceleyebilirsiniz.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Şu anda aktif organizasyonunuz üzerinden tüm pozisyon ve başvuru işlemlerinizi yapabilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}
