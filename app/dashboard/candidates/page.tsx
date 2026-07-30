import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Users, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CandidatesPage() {
  const supabase = await createClient();
  
  // Sadece yetkili org'un adaylarını alıyoruz.
  // Şu an demo olduğu için tüm candidate'leri unique olarak çekelim.
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidates:', error);
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Aday Havuzu
          </h1>
          <p className="text-sm text-slate-400 mt-1">Sisteme kayıtlı tüm tekil adayların listesi</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Aday ara..." className="bg-[#151c2f] border border-[#1e293b] text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 w-64" />
           </div>
           <button className="bg-[#151c2f] border border-[#1e293b] text-slate-300 p-2 rounded-xl hover:text-white transition-colors">
             <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-[#0b0f19]/50 text-[10px] uppercase text-slate-500 font-semibold border-b border-[#1e293b]">
              <tr>
                <th className="px-6 py-4">Aday Profili</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Özgeçmiş URL</th>
                <th className="px-6 py-4 text-right">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-sm">
              {candidates && candidates.length > 0 ? candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                        {((cand.full_name || cand.email || 'A').substring(0, 2)).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{cand.full_name || 'Bilinmeyen Aday'}</p>
                        <p className="text-[11px] text-slate-500">ID: {cand.id.substring(0,8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {cand.email}
                    {cand.phone && <p className="text-xs text-slate-500 mt-1">{cand.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {cand.resume_url ? (
                      <a href={cand.resume_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 underline">Görüntüle</a>
                    ) : (
                      <span className="text-xs text-slate-500">Yok</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-xs">
                    {new Date(cand.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>Sistemde henüz kayıtlı aday bulunmuyor.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
