import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { redirect } from 'next/navigation';
import ApplicationsTable from '@/components/dashboard/ApplicationsTable';
import { Users, ShieldCheck } from 'lucide-react';

export default async function ApplicationsPage() {
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login?redirect_to=%2Fdashboard%2Fapplications');
  }

  const { activeOrg } = authData;
  const supabase = await createClient();

  // Fetch applications with candidate details, job title, and latest AI analysis
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(full_name, email, phone),
      job:jobs(title),
      analysis:cv_analyses(*)
    `)
    .eq('org_id', activeOrg.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gelen Başvurular
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              {applications?.length || 0} Başvuru
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {activeOrg.name} organizasyonuna ulaşan adayların özgeçmişleri, başvuru kaynakları ve KVKK rıza kayıtları.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>KVKK & Private Storage İzolasyonlu</span>
        </div>
      </div>

      <ApplicationsTable
        initialApplications={applications || []}
        activeOrgId={activeOrg.id}
      />
    </div>
  );
}
