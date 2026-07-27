'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Cpu, 
  Award 
} from 'lucide-react';

interface AnalysisData {
  id: string;
  application_id: string;
  match_score: number | null;
  extracted: any;
  strengths: any;
  gaps: any;
  verdict: string | null;
  model: string | null;
  created_at: string;
}

interface CVAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisData | null;
  candidateName: string;
  jobTitle: string;
}

export default function CVAnalysisDrawer({
  isOpen,
  onClose,
  analysis,
  candidateName,
  jobTitle,
}: CVAnalysisDrawerProps) {
  if (!isOpen) return null;

  const verdictConfig = {
    potential: {
      title: 'Potansiyel Aday (Mülakata Uygun)',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      badgeBg: 'bg-emerald-500 text-black',
    },
    review: {
      title: 'İnceleme Bekliyor (Ara Eşik)',
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      badgeBg: 'bg-amber-500 text-black',
    },
    irrelevant: {
      title: 'Alakasız / Kriter Altı',
      bg: 'bg-red-500/15 border-red-500/30 text-red-300',
      badgeBg: 'bg-red-500 text-white',
    },
  }[analysis?.verdict || 'review'] || {
    title: analysis?.verdict || 'İncelemede',
    bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    badgeBg: 'bg-purple-500 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center glow-primary shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{candidateName}</h3>
                <p className="text-xs text-slate-400 font-medium">{jobTitle} — AI Özgeçmiş Raporu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!analysis ? (
            <div className="p-12 text-center my-auto">
              <p className="text-slate-400 text-sm">Bu başvuru için henüz yapay zeka analizi tamamlanmamış.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6 flex-1">
              
              {/* Score & Verdict Banner */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${verdictConfig.bg}`}>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Yapay Zeka Kararı</span>
                  <h4 className="text-lg font-extrabold">{verdictConfig.title}</h4>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`px-4 py-1.5 rounded-xl font-black text-xl flex items-center gap-1.5 shadow-lg ${verdictConfig.badgeBg}`}>
                    <Award className="w-5 h-5" />
                    <span>%{analysis.match_score}</span>
                  </div>
                  <span className="text-[11px] font-mono mt-1 opacity-70">Uyum Skoru</span>
                </div>
              </div>

              {/* Blind Assessment Badge */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/90 leading-relaxed">
                  <strong className="text-indigo-300 block mb-0.5">Demografik Önyargı Koruması (Blind Assessment) Aktif</strong>
                  Bu aday değerlendirilirken ad, yaş, cinsiyet, fotoğraf veya uyruk gibi demografik faktörler AI tarafından tamamen göz ardı edilmiş; puanlama yalnızca teknik yetkinlikler ve pozisyon rubriğine göre yapılmıştır.
                </div>
              </div>

              {/* Extracted Data */}
              {analysis.extracted && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-slate-500" />
                    <span>CV&apos;den Ayrıştırılan Bilgiler</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Tecrübe</div>
                        <div className="text-xs font-bold text-white">{analysis.extracted.experience_years ?? 0} Yıl</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Eğitim</div>
                        <div className="text-xs font-bold text-white capitalize">{analysis.extracted.education_level || 'Belirtilmedi'}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Diller</div>
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">
                          {Array.isArray(analysis.extracted.languages) && analysis.extracted.languages.length > 0
                            ? analysis.extracted.languages.join(', ')
                            : 'Belirtilmedi'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  {Array.isArray(analysis.extracted.skills) && analysis.extracted.skills.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-2">Tespit Edilen Yetkinlikler:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.extracted.skills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths */}
              {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Güçlü Yönler (Kriter Eşleşmeleri)</span>
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((item, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps / Weaknesses */}
              {Array.isArray(analysis.gaps) && analysis.gaps.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Gelişim Alanları & Eksik Kriterler</span>
                  </h4>
                  <ul className="space-y-2">
                    {analysis.gaps.map((item, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Altyapı: <strong className="text-slate-300 font-mono">HireAI™ Otonom Puanlama Motoru</strong></span>
            <span>Analiz Tarihi: {analysis ? new Date(analysis.created_at).toLocaleString('tr-TR') : '-'}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
