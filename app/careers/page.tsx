import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/service';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Briefcase,
  Globe
} from 'lucide-react';

export default async function CareersRootPage() {
  const supabase = createAdminClient();

  // Fetch public organizations with published jobs count
  const { data: orgs } = await supabase
    .from('orgs')
    .select('id, name, slug')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 py-16 px-4 sm:px-6 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold glow-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HireAI Public Kariyer Dizin Sistemi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Açık Pozisyonlar ve Kariyer Fırsatları
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            HireAI altyapısını kullanan şirketlerin resmi kariyer sayfalarına aşağıdan ulaşabilir, AI destekli önyargısız değerlendirme sürecimize başvurabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {orgs?.map((org) => (
            <Link
              key={org.id}
              href={`/careers/${org.slug}`}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all group space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg glow-primary font-black text-xl text-white">
                    {org.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {org.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>/{org.slug}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>Kariyer Sayfasını Aç</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}

          {(!orgs || orgs.length === 0) && (
            <div className="sm:col-span-2 glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-3">
              <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Sistemde Kayıtlı Şirket Bulunamadı</h3>
              <p className="text-slate-400 text-xs">
                Şu anda sistemde yayınlanmış herkese açık bir kariyer sayfası bulunmuyor.
              </p>
            </div>
          )}
        </div>

        <div className="text-center pt-8 text-xs text-slate-500">
          Powered by <strong className="text-slate-400">HireAI</strong> — AI Destekli İşe Alım Altyapısı
        </div>
      </div>
    </div>
  );
}
