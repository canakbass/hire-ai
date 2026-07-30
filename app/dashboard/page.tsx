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
import V2DashboardClient from '@/components/dashboard/V2DashboardClient';

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
      href: '/dashboard/jobs',
    },
    {
      title: 'Havuzdaki Aday CV’leri',
      value: candidatesCount ?? 0,
      description: 'Tekil aday kayıtları',
      icon: Users,
      color: 'from-cyan-500 to-teal-500',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      href: '/dashboard/applications',
    },
    {
      title: 'AI Potansiyel Aday',
      value: potentialCount ?? 0,
      description: 'HireAI analizi %70+ eşleşme',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
      href: '/dashboard/applications',
    },
    {
      title: 'Kısa Liste (Shortlist)',
      value: shortlistCount ?? 0,
      description: 'Yönetici onayına hazır',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      href: '/dashboard/applications',
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

      <V2DashboardClient 
        stats={{
          totalApps: candidatesCount ?? 0,
          aiAnalyzed: (candidatesCount ?? 0) - ((candidatesCount ?? 0) > 0 ? 1 : 0),
          potential: potentialCount ?? 0,
          recommended: shortlistCount ?? 0
        }}
        recentApps={recentApps || []}
      />
    </div>
  );
}
