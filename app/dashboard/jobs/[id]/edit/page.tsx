import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import JobForm from '@/components/dashboard/JobForm';

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, job_settings(*)')
    .eq('id', id)
    .eq('org_id', authData.activeOrg.id)
    .single();

  if (error || !job) {
    notFound();
  }

  const settings = Array.isArray(job.job_settings) ? job.job_settings[0] : job.job_settings;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-white/10 pb-5">
        <Link
          href="/dashboard/jobs"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Pozisyonu Düzenle: {job.title}</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Pozisyon bilgilerini ve AI eleme / mülakat kriterlerini güncelleyin.
          </p>
        </div>
      </div>

      <JobForm initialData={{ ...job, job_settings: settings }} isEdit={true} />
    </div>
  );
}
