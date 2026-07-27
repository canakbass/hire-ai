import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  PhoneCall, 
  Award, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronRight, 
  FolderPlus,
  Inbox
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';

export default async function DashboardOverviewPage() {
  const authData = await getCurrentUserAndOrg();

  if (!authData || !authData.user) {
    redirect('/login');
  }

  if (!authData.activeOrg) {
    redirect('/onboarding');
  }

  const { activeOrg } = authData;
  const supabase = await createClient();

  // Fetch real counts scoped strictly to activeOrg.id (RLS enforced + explicit filter)
  const [
    { count: jobsCount },
    { count: candidatesCount },
    { count: potentialCount },
    { count: shortlistCount },
    { data: recentApps }
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', activeOrg.id),
    supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', activeOrg.id),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', activeOrg.id)
      .in('status', ['potential', 'shortlisted', 'interview_pending', 'interviewed']),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', activeOrg.id)
      .eq('status', 'shortlisted'),
    supabase
      .from('applications')
      .select('id, status, created_at, job_id, jobs(title), candidates(full_name, email)')
      .eq('org_id', activeOrg.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const stats = [
    {
      title: 'Açık Pozisyon İlanları',
      value: jobsCount ?? 0,
      description: 'Aktif ve taslak ilanlar',
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-500',
      bgGlow: 'rgba(99, 102, 241, 0.15)',
    },
    {
      title: 'Havuzdaki Aday CV’leri',
      value: candidatesCount ?? 0,
      description: 'Tekil aday kayıtları',
      icon: Users,
      color: 'from-cyan-500 to-teal-500',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
    },
    {
      title: 'AI Potansiyel Aday',
      value: potentialCount ?? 0,
      description: 'HireAI analizi %70+ eşleşme',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
    },
    {
      title: 'Kısa Liste (Shortlist)',
      value: shortlistCount ?? 0,
      description: 'Yönetici onayına hazır',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  const statusBadges: Record<string, { label: string; color: string }> = {
    new: { label: 'Yeni Başvuru', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    analyzing: { label: 'AI Analiz Ediyor', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    analyzed: { label: 'Analiz Tamamlandı', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
    potential: { label: 'Potansiyel (Ön Elemeyi Geçti)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    irrelevant: { label: 'Eşleşme Yetersiz', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    review: { label: 'İnsan İncelemesinde', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    interview_pending: { label: 'AI Mülakatı Bekliyor', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    interviewed: { label: 'Mülakat Tamamlandı', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    shortlisted: { label: 'Kısa Listede (Final 5)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    rejected: { label: 'Reddedildi', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    hired: { label: 'İşe Alındı 🎉', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  };

  const isEmptyWorkspace = (jobsCount ?? 0) === 0 && (candidatesCount ?? 0) === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-purple-900/50 p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeOrg.name} Çalışma Alanı</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              İK Süreçleriniz ve AI Özetiniz
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Pozisyonlara gelen CV'ler HireAI™ Otonom Puanlama Motoru ile kriterlerinize göre analiz edilir, %70 üzerindeki potansiyel adaylar AI sesli mülakatına alınır.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/jobs/new"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Yeni Pozisyon Aç</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid - Real Data Only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden"
              style={{ boxShadow: `0 0 30px ${item.bgGlow}` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {item.value}
              </h3>
              <p className="text-xs font-medium text-white/90 mt-1">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty State Banner when no jobs / candidates exist */}
      {isEmptyWorkspace && (
        <div className="glass-panel rounded-2xl p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-transparent text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg glow-primary">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Çalışma Alanınız Henüz Boş
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Şu anda kayıtlı bir pozisyon ilanı veya aday başvurusu bulunmuyor. AI destekli işe alım otomasyonunu başlatmak için ilk pozisyonunuzu oluşturun.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard/jobs/new"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg glow-primary flex items-center gap-2 transition-all"
            >
              <span>+ İlk Pozisyon İlanını Oluştur</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* AI Pipeline Explanation Flow */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Otonom Eleme Akışı (Pipeline Kriterleri)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                1. Başvuru & KVKK
              </span>
              <p className="text-xs font-semibold text-white mt-2">Kariyer Sitenizden CV Yükleme</p>
              <p className="text-[11px] text-slate-400 mt-1">Aday KVKK açık rızası vererek başvurusunu iletir. CV private storage’a yüklenir.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-wider">
                2. AI CV Skorlama
              </span>
              <p className="text-xs font-semibold text-white mt-2">HireAI Kriter & Rubrik Analizi</p>
              <p className="text-[11px] text-slate-400 mt-1">Skor &gt;= 70 Potansiyel, &lt; 40 Alakasız, Arası İnsan İncelemesi (Review).</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
                3. Otonom AI Mülakat
              </span>
              <p className="text-xs font-semibold text-white mt-2">6 Dakikalık Sesli Değerlendirme</p>
              <p className="text-[11px] text-slate-400 mt-1">Potansiyel adaylar otomatik veya İK onayı ile aranıp JD kriterlerine göre teknik soru-cevap yapar.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                4. Kısa Liste (Shortlist)
              </span>
              <p className="text-xs font-semibold text-white mt-2">Yöneticinin Karar Masası</p>
              <p className="text-[11px] text-slate-400 mt-1">CV + Mülakat (%50/%50) birleşik skoruyla en iyi 5 aday yönetici onayına çıkar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table - Real Data */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Son Başvurular ve AI Kararları</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sistem tarafından işlenen son CV analizleri ve mülakat sonuçları</p>
          </div>
          <Link
            href="/dashboard/applications"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Tüm Adayları Gör</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {!recentApps || recentApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <Inbox className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-white">Henüz başvuru bulunmuyor</p>
            <p className="text-xs text-slate-500 mt-1">Pozisyon ilanınız yayınlandığında ve adaylar başvurduğunda burada görünecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-black/20">
                  <th className="py-3.5 px-6">Aday</th>
                  <th className="py-3.5 px-6">Başvurulan Pozisyon</th>
                  <th className="py-3.5 px-6">Durum</th>
                  <th className="py-3.5 px-6 text-right">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {recentApps.map((app) => {
                  const badge = statusBadges[app.status] || { label: app.status, color: 'bg-slate-500/10 text-slate-400' };
                  const candidateName = (app.candidates as any)?.full_name || (app.candidates as any)?.email || 'Bilinmeyen Aday';
                  const jobTitle = (app.jobs as any)?.title || 'Bilinmeyen Pozisyon';
                  return (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        {candidateName}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {jobTitle}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full font-medium border text-[11px] ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 font-mono">
                        {new Date(app.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
