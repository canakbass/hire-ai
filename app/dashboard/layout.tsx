import { redirect } from 'next/navigation';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUserAndOrg();

  if (!data || !data.user) {
    redirect('/login');
  }

  if (!data.activeOrg) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen bg-[#090b10] text-[#f3f4f6] overflow-hidden">
      <DashboardSidebar
        user={data.user}
        profile={data.profile}
        activeOrg={data.activeOrg}
        userRole={data.userRole}
        allOrgs={data.allOrgs}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardHeader
          user={data.user}
          profile={data.profile}
          activeOrg={data.activeOrg}
          userRole={data.userRole}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
