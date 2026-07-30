import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, Briefcase, Calendar, MapPin } from 'lucide-react';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // İlan bilgilerini getir
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, orgs(name)')
    .eq('id', params.id)
    .single();

  if (error || !job) {
    redirect('/dashboard/jobs');
  }

  // Bu ilana ait başvuruları getir
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidates (*)
    `)
    .eq('job_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-[#151c2f] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {job.title}
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${job.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
              {job.status === 'published' ? 'Aktif İlan' : 'Pasif İlan'}
            </span>
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.department || 'Genel'}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || 'Uzaktan'}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
        <div className="ml-auto">
          <Link
            href={`/dashboard/jobs/${job.id}/edit`}
            className="flex items-center gap-2 bg-[#151c2f] border border-[#1e293b] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" /> Düzenle
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">İlan Açıklaması</h3>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: job.description || 'Açıklama bulunmuyor.' }} />
          </div>
          
          <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Adaylar ({applications?.length || 0})
              </h3>
              <Link href="/dashboard/applications" className="text-xs text-indigo-400 hover:text-indigo-300">
                Tüm Başvurularda Gör
              </Link>
            </div>
            
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-[#0b0f19] border border-[#1e293b] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {((app.candidates?.full_name || app.candidates?.email || 'A').substring(0,2)).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{app.candidates?.full_name || 'Bilinmeyen Aday'}</p>
                        <p className="text-[10px] text-slate-400">{app.candidates?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                         Durum: {app.status || 'Yeni'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Henüz bu ilana başvuru yapılmamış.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Değerlendirme Kriterleri</h3>
            {job.requirements ? (
              <div className="prose prose-invert prose-sm text-slate-300" dangerouslySetInnerHTML={{ __html: job.requirements }} />
            ) : (
              <p className="text-xs text-slate-500">Spesifik bir kriter girilmemiş.</p>
            )}
          </div>
          
          <div className="bg-gradient-to-b from-indigo-600/20 to-transparent border border-indigo-500/30 rounded-2xl p-6 text-center">
             <h3 className="text-sm font-bold text-white mb-2">AI Otonom Arama</h3>
             <p className="text-[11px] text-slate-300 mb-4">Bu ilan için Vapi destekli AI Mülakat motorunu başlatabilirsiniz.</p>
             <button disabled className="w-full py-2 bg-indigo-600/50 text-white rounded-lg text-xs font-medium cursor-not-allowed opacity-50 flex items-center justify-center gap-2">
               Yakında Aktif
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
