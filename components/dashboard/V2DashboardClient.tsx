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
  Mic
} from 'lucide-react';

interface V2DashboardClientProps {
  stats: {
    totalApps: number;
    aiAnalyzed: number;
    potential: number;
    recommended: number;
  };
  recentApps: any[];
}

export default function V2DashboardClient({ stats, recentApps }: V2DashboardClientProps) {
  const [selectedCandidate, setSelectedCandidate] = useState(recentApps[0] || null);

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
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> %12 bu hafta
            </p>
          </div>
        </div>

        <div className="bg-[#151c2f] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-slate-400 font-medium">AI Analizi Tamamlanan</p>
            <div className="relative">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset="8" className="text-indigo-500" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">%92</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.aiAnalyzed}</h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> %18 bu hafta
            </p>
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
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> %15 bu hafta
            </p>
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
            <p className="text-[10px] text-slate-500 mt-1">Bu hafta</p>
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
              <p className="text-[10px] text-slate-400">45</p>
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
                  {t} <span className="ml-1 text-[10px] bg-white/5 px-1.5 rounded">{i===0 ? stats.totalApps : i===1 ? stats.aiAnalyzed : i===2 ? stats.potential : i===3 ? 45 : stats.recommended}</span>
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

                  if (app.status === 'shortlisted' || app.status === 'potential') {
                    score = 88;
                    color = "bg-emerald-500";
                    statusText = "Potansiyel";
                    statusBg = "bg-emerald-500/10 border-emerald-500/20";
                    statusTextCol = "text-emerald-400";
                  } else if (app.status === 'interviewed' || app.status === 'interview_pending') {
                    score = 92;
                    color = "bg-indigo-500";
                    statusText = "Mülakat Tamamlandı";
                    statusBg = "bg-indigo-500/10 border-indigo-500/20";
                    statusTextCol = "text-indigo-400";
                  } else if (app.status === 'analyzed') {
                    score = 71;
                    color = "bg-blue-500";
                    statusText = "Analiz Edildi";
                    statusBg = "bg-blue-500/10 border-blue-500/20";
                    statusTextCol = "text-blue-400";
                  } else if (app.status === 'irrelevant' || app.status === 'rejected') {
                    score = 45;
                    color = "bg-red-500";
                    statusText = "Alakasız";
                    statusBg = "bg-red-500/10 border-red-500/20";
                    statusTextCol = "text-red-400";
                  } else {
                    score = 0;
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
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">AI Önerisi: Yüksek</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">{selectedCandidate.jobs?.title}</p>
                    </div>
                  </div>
                  <button className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-300 flex items-center gap-1 transition-colors">
                    <Search className="w-3 h-3" /> Profili Görüntüle
                  </button>
                </div>
                
                <div className="flex gap-4">
                  {['AI Analiz', 'Mülakat Özeti', 'Değerlendirme', 'Notlar'].map((t, i) => (
                    <button 
                      key={t}
                      className={`pb-2 text-[11px] font-semibold transition-colors border-b-2 ${i === 1 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
                <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[11px] font-bold text-white">AI Voice Mülakat</h5>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-[11px] font-bold text-white mb-2">Mülakat Özeti</h5>
                    <ul className="space-y-1.5 text-[10px] text-slate-400">
                      <li className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Teknik sorulara güçlü yanıtlar verdi.</li>
                      <li className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Problem çözme yaklaşımı etkileyici.</li>
                      <li className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Takım çalışmasına yatkın olduğunu gösterdi.</li>
                      <li className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Kendini geliştirmeye açık ve motive.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-white mb-2">Mülakat Skorları</h5>
                    <div className="space-y-2">
                      {[
                        { label: 'İletişim Becerisi', val: 90 },
                        { label: 'Teknik Bilgi', val: 85 },
                        { label: 'Problem Çözme', val: 88 },
                        { label: 'Motivasyon', val: 80 },
                        { label: 'Kültürel Uyum', val: 75 }
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between text-[9px]">
                          <span className="text-slate-400 w-20 truncate">{s.label}</span>
                          <div className="flex-1 mx-2 h-1 bg-[#0b0f19] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{width: `${s.val}%`}} />
                          </div>
                          <span className="font-mono text-slate-300">%{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1e293b] px-4 py-2 rounded-xl">
                    <div>
                      <p className="text-[10px] text-slate-400">Genel Skor</p>
                      <p className="text-xs font-bold text-emerald-400">Yüksek Uygunluk</p>
                    </div>
                    <div className="relative">
                      <svg className="w-8 h-8 transform -rotate-90">
                        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-800" />
                        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray="88" strokeDashoffset="11" className="text-emerald-500" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">%87</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-[#1e293b] flex gap-3">
                <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5">
                  <Star className="w-4 h-4" /> Yöneticiye Öner
                </button>
                <button className="flex-1 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#151c2f] border border-[#1e293b] rounded-xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Yazılım Geliştirici pozisyonu için <span className="font-bold text-white">3 yeni potansiyel aday</span> var.
              </p>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">Adayları Görüntüle →</span>
            </div>
          </div>

          <div className="bg-[#151c2f] border border-[#1e293b] rounded-xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                AI mülakat sorularını pozisyona göre optimize et.
              </p>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">Soruları Düzenle →</span>
            </div>
          </div>

          <div className="bg-[#151c2f] border border-[#1e293b] rounded-xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Bu hafta <span className="font-bold text-white">12 mülakat</span> tamamlandı.
              </p>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">Raporu Görüntüle →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
