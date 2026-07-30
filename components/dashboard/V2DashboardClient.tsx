'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BrainCircuit, 
  UserCheck, 
  Star, 
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldAlert,
  CalendarDays,
  Search,
  Mic,
  Phone,
  Loader2
} from 'lucide-react';

interface V2DashboardClientProps {
  stats: {
    totalApps: number;
    aiAnalyzed: number;
    potential: number;
    recommended: number;
    interviewed: number;
  };
  recentApps: any[];
}

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/types/database.types';
import { startVoiceInterview } from '@/lib/actions/vapi_actions';

type AppStatus = Database['public']['Enums']['app_status'];

export default function V2DashboardClient({ stats, recentApps }: V2DashboardClientProps) {
  const [selectedCandidate, setSelectedCandidate] = useState(recentApps[0] || null);
  const [activeTab, setActiveTab] = useState('AI Analiz');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (status: AppStatus) => {
    if (!selectedCandidate) return;
    setIsUpdating(true);
    const supabase = createClient();
    await supabase.from('applications').update({ status }).eq('id', selectedCandidate.id);
    setSelectedCandidate({ ...selectedCandidate, status });
    setIsUpdating(false);
    router.refresh();
  };

  const handleStartCall = async () => {
    if (!selectedCandidate) return;
    setIsCalling(true);
    const result = await startVoiceInterview(selectedCandidate.id);
    setIsCalling(false);
    
    if (result.error) {
      alert(result.error);
    } else {
      alert('Arama başarıyla başlatıldı! Aday şu an aranıyor.');
      setSelectedCandidate({ ...selectedCandidate, status: 'interview_pending' });
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Hoş geldiniz, İK Ekibi 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Yapay zeka destekli işe alım asistanınız</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <span>+ Yeni Pozisyon</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-slate-400 font-medium">Toplam Başvuru</p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.totalApps}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Sistemdeki toplam aday</p>
          </div>
        </div>

        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-slate-400 font-medium">AI Analizi Tamamlanan</p>
            <div className="relative">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset={stats.totalApps > 0 ? 100 - ((stats.aiAnalyzed / stats.totalApps) * 100) : 100} className="text-indigo-500" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                {stats.totalApps > 0 ? Math.round((stats.aiAnalyzed / stats.totalApps) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.aiAnalyzed}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Özgeçmiş işlendi</p>
          </div>
        </div>

        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-slate-400 font-medium">Potansiyel Adaylar</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.potential}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Gereksinimleri karşılıyor</p>
          </div>
        </div>

        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-slate-400 font-medium">Yöneticiye Önerilen</p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.recommended}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Kısa listeye alındı</p>
          </div>
        </div>
      </div>

      {/* AI Pipeline Flow */}
      <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">AI İşe Alım Süreci</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-2">
          
          <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Başvuru Havuzu</p>
              <p className="text-[10px] text-slate-400">{stats.totalApps}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Analiz</p>
              <p className="text-[10px] text-slate-400">{stats.aiAnalyzed}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Potansiyel Adaylar</p>
              <p className="text-[10px] text-slate-400">{stats.potential}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Mic className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Voice Mülakat</p>
              <p className="text-[10px] text-slate-400">{stats.interviewed}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Yöneticiye Önerilen</p>
              <p className="text-[10px] text-slate-400">{stats.recommended}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Split View: Left (Table) & Right (Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Applications Table */}
        <div className="lg:col-span-2 bg-[#151c2f] border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-[#1e293b]">
            <h3 className="text-sm font-bold text-white mb-4">Son Başvurular</h3>
            <div className="flex gap-4 border-b border-[#1e293b]">
              {['Tümü', 'Analiz Edilen', 'Potansiyel', 'Mülakat', 'Önerilen'].map((t, i) => (
                <button 
                  key={t}
                  className={`pb-2 text-xs font-medium transition-colors border-b-2 ${i === 0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                >
                  {t} <span className="ml-1 text-[10px] bg-white/5 px-1.5 rounded">{i===0 ? stats.totalApps : i===1 ? stats.aiAnalyzed : i===2 ? stats.potential : i===3 ? stats.interviewed : stats.recommended}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-[#0b0f19]/50 text-[10px] uppercase text-slate-500 font-semibold sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3">Aday</th>
                  <th className="px-4 py-3">Pozisyon</th>
                  <th className="px-4 py-3">AI Uygunluk Skoru</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-xs">
                {recentApps.map((app) => {
                  const candidateName = app.candidates?.full_name || app.candidates?.email || 'Bilinmeyen Aday';
                  const jobTitle = app.jobs?.title || 'Pozisyon';
                  const isSelected = selectedCandidate?.id === app.id;
                  
                  let score = 0;
                  let color = "bg-slate-500";
                  let statusText = "";
                  let statusBg = "";
                  let statusTextCol = "";

                  const dbScore = app.cv_analyses?.[0]?.match_score;
                  if (dbScore !== undefined && dbScore !== null) {
                    score = dbScore;
                  } else {
                    score = 0;
                  }

                  if (app.status === 'shortlisted' || app.status === 'potential') {
                    color = "bg-emerald-500";
                    statusText = "Potansiyel";
                    statusBg = "bg-emerald-500/10 border-emerald-500/20";
                    statusTextCol = "text-emerald-400";
                  } else if (app.status === 'interviewed' || app.status === 'interview_pending') {
                    color = "bg-indigo-500";
                    statusText = "Mülakat Tamamlandı";
                    statusBg = "bg-indigo-500/10 border-indigo-500/20";
                    statusTextCol = "text-indigo-400";
                  } else if (app.status === 'analyzed') {
                    color = "bg-blue-500";
                    statusText = "Analiz Edildi";
                    statusBg = "bg-blue-500/10 border-blue-500/20";
                    statusTextCol = "text-blue-400";
                  } else if (app.status === 'irrelevant' || app.status === 'rejected') {
                    color = "bg-red-500";
                    statusText = "Alakasız";
                    statusBg = "bg-red-500/10 border-red-500/20";
                    statusTextCol = "text-red-400";
                  } else {
                    color = "bg-slate-500";
                    statusText = "Yeni";
                    statusBg = "bg-slate-500/10 border-slate-500/20";
                    statusTextCol = "text-slate-400";
                  }

                  return (
                    <tr 
                      key={app.id} 
                      onClick={() => setSelectedCandidate(app)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {candidateName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate">{candidateName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{app.candidates?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{jobTitle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300 w-6">%{score}</span>
                          <div className="w-16 h-1.5 bg-[#0b0f19] rounded-full overflow-hidden">
                            <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${statusBg} ${statusTextCol}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 text-[10px]">
                        {new Date(app.created_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-[#1e293b] text-center">
            <button className="text-xs text-indigo-400 font-medium hover:text-indigo-300">
              ⊕ Tüm Başvuruları Görüntüle
            </button>
          </div>
        </div>

        {/* Right: Candidate Detail */}
        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl flex flex-col h-[500px] overflow-hidden">
          {selectedCandidate ? (
            <>
              <div className="p-5 border-b border-[#1e293b] bg-gradient-to-b from-[#1a233a] to-[#151c2f]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {((selectedCandidate.candidates?.full_name || selectedCandidate.candidates?.email || 'A').substring(0,2)).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {selectedCandidate.candidates?.full_name || 'Bilinmeyen Aday'}
                        {selectedCandidate.cv_analyses?.[0]?.match_score ? (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            selectedCandidate.cv_analyses[0].match_score >= 80 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                              : selectedCandidate.cv_analyses[0].match_score >= 50
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                              : 'bg-red-500/20 text-red-400 border-red-500/20'
                          }`}>
                            AI Skoru: {selectedCandidate.cv_analyses[0].match_score}
                          </span>
                        ) : null}
                      </h4>
                      <p className="text-[11px] text-slate-400">{selectedCandidate.jobs?.title}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/applications/${selectedCandidate.id}`)}
                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Search className="w-3 h-3" /> Profili Görüntüle
                  </button>
                </div>
                
                <div className="flex gap-4">
                  {['AI Analiz', 'Mülakat Özeti', 'Değerlendirme', 'Notlar'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`pb-2 text-[11px] font-semibold transition-colors border-b-2 ${activeTab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
                  <>
                    {/* CV Analiz Sonucu */}
                    {activeTab === 'AI Analiz' && (
                      <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-[11px] font-bold text-white">HireAI CV Analizi</h5>
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Analiz Edildi
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h6 className="text-[10px] text-slate-500 font-semibold mb-1">Değerlendirme (Özet)</h6>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {selectedCandidate.cv_analyses?.[0]?.verdict || 'Bu aday için detaylı analiz sonucu bulunmuyor. AI analizinin tetiklenmesi veya tamamlanması bekleniyor.'}
                            </p>
                          </div>

                          {selectedCandidate.cv_analyses?.[0]?.extracted?.skills && (
                            <div>
                              <h6 className="text-[10px] text-slate-500 font-semibold mb-1.5">Tespit Edilen Yetenekler</h6>
                              <div className="flex flex-wrap gap-1">
                                {(selectedCandidate.cv_analyses[0].extracted.skills as string[]).map((s: string, idx: number) => (
                                  <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-[#151c2f] border border-[#1e293b] text-slate-400 rounded">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#1e293b]">
                          <span className="text-[10px] text-slate-500">CV Uygunluk Skoru</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-400">%{selectedCandidate.cv_analyses?.[0]?.match_score || 0}</span>
                            <div className="w-16 h-1.5 bg-[#151c2f] rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{width: `${selectedCandidate.cv_analyses?.[0]?.match_score || 0}%`}} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Mülakat Sonucu */}
                    {activeTab === 'Mülakat Özeti' && (
                      selectedCandidate.status === 'interviewed' || selectedCandidate.status === 'shortlisted' ? (
                        <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-[11px] font-bold text-white">AI Voice Mülakat Sonucu</h5>
                            <span className="text-[9px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <button className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                              <Play className="w-3 h-3 ml-0.5" />
                            </button>
                            <div className="flex-1 flex gap-0.5 items-end h-6">
                              {Array.from({length: 40}).map((_, i) => (
                                <div key={i} className="flex-1 bg-indigo-500/50 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">24:36</span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic">
                            "Gerçek mülakat analiz verileri (Vapi üzerinden) çok yakında buraya entegre edilecek."
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#0b0f19] border border-[#1e293b] border-dashed rounded-xl p-6 text-center flex flex-col items-center">
                          <Mic className="w-6 h-6 text-slate-600 mb-2" />
                          <p className="text-xs font-semibold text-slate-400 mb-1">AI Mülakatı Bekleniyor</p>
                          <p className="text-[10px] text-slate-500 mb-4">Aday henüz otonom sesli mülakata girmedi veya mülakat aşamasına geçemedi.</p>
                          <button 
                            onClick={handleStartCall}
                            disabled={isCalling || selectedCandidate.status === 'interview_pending'}
                            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                          >
                            {isCalling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                            {isCalling ? 'Aranıyor...' : (selectedCandidate.status === 'interview_pending' ? 'Arama Bekleniyor' : 'Adayı Telefonla Ara (AI)')}
                          </button>
                        </div>
                      )
                    )}
                    
                    {activeTab === 'Değerlendirme' && (
                      <div className="bg-[#0b0f19] border border-[#1e293b] border-dashed rounded-xl p-6 text-center">
                        <p className="text-xs font-semibold text-slate-400 mb-1">Henüz Değerlendirilmedi</p>
                        <p className="text-[10px] text-slate-500">Detaylı mülakat değerlendirme kartı (Scorecard) mülakat sonrası oluşturulacaktır.</p>
                      </div>
                    )}
                    
                    {activeTab === 'Notlar' && (
                      <div className="bg-[#0b0f19] border border-[#1e293b] border-dashed rounded-xl p-6 text-center">
                        <p className="text-xs font-semibold text-slate-400 mb-1">Aday Notu Bulunmuyor</p>
                        <p className="text-[10px] text-slate-500">Bu aday için henüz bir not eklenmedi.</p>
                      </div>
                    )}
                  </>
              </div>

              <div className="p-4 border-t border-[#1e293b] flex gap-3">
                <button 
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('shortlisted')}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Star className="w-4 h-4" /> Yöneticiye Öner
                </button>
                <button 
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('rejected')}
                  className="flex-1 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reddet
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <UserCheck className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Detayları görmek için bir aday seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Suggestions */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">AI Asistan Önerileri</h3>
        <div className="bg-[#151c2f] border border-[#1e293b] rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <BrainCircuit className="w-8 h-8 text-indigo-500/50 mb-3" />
          <p className="text-xs text-slate-300 font-medium mb-1">Yeterli Veri Bekleniyor</p>
          <p className="text-[10px] text-slate-500 max-w-md">
            Sistem, ilanlarınıza gelen başvuruları ve AI mülakat sonuçlarını analiz ettikçe size burada otonom stratejik işe alım önerileri sunacaktır. (Örn: Hangi pozisyon için kriterlerin esnetilmesi gerektiği veya hangi mülakat sorularının adayları daha iyi elediği gibi).
          </p>
        </div>
      </div>
    </div>
  );
}
