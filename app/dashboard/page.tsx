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
    { count: interviewedCount },
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
      .select('*', { count: 'exact', head: true })
      .eq('org_id', activeOrg.id)
      .in('status', ['interviewed', 'interview_pending']),
    supabase
      .from('applications')
      .select('id, status, created_at, job_id, jobs(title), candidates(full_name, email, phone), cv_analyses(match_score, verdict, extracted)')
      .eq('org_id', activeOrg.id)
      .order('created_at', { ascending: false })
      .limit(50)
  ]);

  return (
    <div className="space-y-8 pb-12">

      <V2DashboardClient 
        stats={{
          totalApps: candidatesCount ?? 0,
          aiAnalyzed: (candidatesCount ?? 0) - ((candidatesCount ?? 0) > 0 ? 1 : 0),
          potential: potentialCount ?? 0,
          recommended: shortlistCount ?? 0,
          interviewed: interviewedCount ?? 0
        }}
        recentApps={recentApps || []}
      />
    </div>
  );
}
