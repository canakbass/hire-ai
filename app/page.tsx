import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, PhoneCall, Award, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#090b10] text-white">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between relative z-10 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg glow-primary">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            HireAI
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 ml-1">
            v1.0 MVP
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            Oturum Aç
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-md glow-primary flex items-center gap-1.5 transition-all"
          >
            <span>Ücretsiz Deneyin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-16 pb-24 flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-indigo-400 text-xs font-semibold mb-6 shadow-xl">
          <Zap className="w-3.5 h-3.5" />
          <span>Multi-Tenant SaaS • HireAI™ Otonom İşe Alım & Değerlendirme Altyapısı</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent leading-[1.15]">
          Adayları AI ile Ön Eleyin, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            Sesli Mülakatla En İyi 5'i Seçin
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
          Gelen binlerce CV'yi pozisyon kriterlerine göre saniyeler içinde skorlayın. %70 üzeri eşleşen adayları otonom AI sesli mülakatından geçirin ve yöneticinize hazır bir kısa liste sunun.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl glow-primary flex items-center gap-2 transition-all"
          >
            <span>Çalışma Alanı Oluştur (Başla)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl glass-panel glass-panel-hover text-slate-200 font-semibold text-sm transition-all border border-white/10"
          >
            Canlı Dashboard Önizle
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/[0.08] relative">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">HireAI™ ile Yapılandırılmış CV Analizi</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Pozisyon rubriğine (yetenek, deneyim, eğitim, zorunlu kurallar) göre 0-100 arası net skor, güçlü yanlar ve eksikler anında çıkarılır.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/[0.08] relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 shadow-lg">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Otonom AI Sesli Mülakat Asistanı</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Potansiyel adaylar otomatik veya İK onayı ile aranıp pozisyona özel teknik sorular yöneltilir. Konuşma dökümü ve skor panele aktarılır.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/[0.08] relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Kısa Liste ve İnsan Merkezli Son Karar</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              CV (%50) + Mülakat (%50) birleşik skoruyla pozisyon başına en iyi 5 aday sıralanır. Son karar her zaman yöneticidedir.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 HireAI. Tüm hakları saklıdır. KVKK & GDPR tam uyumlu yeni nesil İK altyapısı.</p>
      </footer>
    </div>
  );
}
