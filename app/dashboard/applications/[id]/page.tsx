import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ApplicationRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: initialApp } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('id', id)
    .single();

  if (initialApp?.candidate_id) {
    redirect(`/dashboard/candidates/${initialApp.candidate_id}`);
  }

  return (
    <div className="p-12 text-center text-slate-400">
      Başvuru veya aday bulunamadı.
    </div>
  );
}
