'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCvSignedUrl } from '@/lib/actions/applications';
import { forceAnalyzeCv } from '@/lib/actions/ai-analyze';
import CVAnalysisDrawer from '@/components/dashboard/CVAnalysisDrawer';
import { 
  Users, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';

interface AnalysisItem {
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

interface ApplicationItem {
  id: string;
  org_id: string;
  job_id: string;
  candidate_id: string;
  source: string;
  cv_storage_path: string | null;
  status: string;
  consent_given: boolean;
  created_at: string;
  candidate?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  job?: {
    title: string;
  } | null;
  analysis?: AnalysisItem[] | AnalysisItem | null;
}

interface ApplicationsTableProps {
  initialApplications: ApplicationItem[];
  activeOrgId: string;
}

export default function ApplicationsTable({
  initialApplications,
  activeOrgId,
}: ApplicationsTableProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'potential' | 'review' | 'irrelevant'>('all');
  
  // Drawer state
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Scoring state
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [scoringError, setScoringError] = useState<{ id: string, msg: string } | null>(null);

  const [isBulkScoring, setIsBulkScoring] = useState(false);

  const handleForceScore = async (applicationId: string) => {
    setScoringId(applicationId);
    setScoringError(null);
    try {
      const res = await forceAnalyzeCv(applicationId);
      if (!res.success) {
        setScoringError({ id: applicationId, msg: res.error || 'Bilinmeyen hata' });
        setScoringId(null);
      } else {
        router.refresh();
        setTimeout(() => setScoringId(null), 1500); // 1.5s bekle ki router.refresh veriyi çeksin
      }
    } catch (err: any) {
      setScoringError({ id: applicationId, msg: err.message || 'Beklenmeyen bir hata oluştu' });
      setScoringId(null);
    }
  };

  const handleBulkScore = async () => {
    const unscored = applications.filter(app => !getAnalysisObject(app));
    if (unscored.length === 0) return;
    
    setIsBulkScoring(true);
    for (const app of unscored) {
      setScoringId(app.id); // Her biri için sırayla yükleniyor animasyonu göster
      try {
        const res = await forceAnalyzeCv(app.id);
        if (!res.success) {
          setScoringError({ id: app.id, msg: res.error || 'Hata' });
        }
      } catch (err: any) {
        setScoringError({ id: app.id, msg: err.message });
      }
    }
    router.refresh();
    setTimeout(() => {
      setScoringId(null);
      setIsBulkScoring(false);
    }, 1500);
  };

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  // Supabase Realtime Subscription for live incoming applications and analyses
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:applications:${activeOrgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `org_id=eq.${activeOrgId}`,
        },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cv_analyses',
          filter: `org_id=eq.${activeOrgId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrgId, router]);

  const handleDownloadCv = async (applicationId: string, cvStoragePath: string | null) => {
    if (!cvStoragePath) {
      alert('Bu başvuruya ait CV dosyası bulunmuyor.');
      return;
    }

    setDownloadingId(applicationId);
    try {
      const res = await getCvSignedUrl(cvStoragePath);
      if (res?.error || !res?.signedUrl) {
        alert(res?.error || 'CV indirme bağlantısı alınamadı.');
      } else {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      alert(err?.message || 'CV indirme hatası.');
    } finally {
      setDownloadingId(null);
    }
  };

  const openAnalysisDrawer = (app: ApplicationItem) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  // Filter applications based on selected tab
  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'potential') return app.status === 'potential';
    if (activeTab === 'review') return app.status === 'review' || app.status === 'new';
    if (activeTab === 'irrelevant') return app.status === 'irrelevant' || app.status === 'rejected';
    return true;
  });

  const getAnalysisObject = (app: ApplicationItem): AnalysisItem | null => {
    if (!app.analysis) return null;
    return Array.isArray(app.analysis) ? (app.analysis[0] || null) : app.analysis;
  };

  const tabs = [
    { id: 'all', label: 'Tümü', count: applications.length },
    { id: 'potential', label: 'Potansiyel (Önerilen)', count: applications.filter(a => a.status === 'potential').length, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'review', label: 'İnceleme Bekleyen / Yeni', count: applications.filter(a => a.status === 'review' || a.status === 'new').length, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { id: 'irrelevant', label: 'Alakasız / Kriter Altı', count: applications.filter(a => a.status === 'irrelevant' || a.status === 'rejected').length, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  ];

  if (!applications || applications.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 flex flex-col items-center justify-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 glow-primary">
          <Users className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Henüz Başvuru Bulunmuyor</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Kariyer siteniz veya açtığınız pozisyonlar üzerinden başvuru yapıldığında, adaylar ve yapay zeka puanlamaları anlık olarak bu ekrana düşecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Realtime & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{t.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {applications.filter(app => !getAnalysisObject(app)).length > 0 && (
            <button
              onClick={handleBulkScore}
              disabled={isBulkScoring}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isBulkScoring ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Tümünü Puanlat ({applications.filter(app => !getAnalysisObject(app)).length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">Realtime Aktif</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Aday Bilgileri</th>
                <th className="py-4 px-5">Başvurduğu Pozisyon</th>
                <th className="py-4 px-5">Yapay Zeka Skoru</th>
                <th className="py-4 px-5">Karar / Durum</th>
                <th className="py-4 px-5">KVKK Rıza</th>
                <th className="py-4 px-5">Başvuru Tarihi</th>
                <th className="py-4 px-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {filteredApplications.map((app) => {
                const cand = app.candidate;
                const analysisObj = getAnalysisObject(app);

                const statusInfo = {
                  new: { label: 'Yeni Başvuru', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
                  review: { label: 'İncelemede', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  potential: { label: 'Potansiyel', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                  irrelevant: { label: 'Alakasız', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                  shortlisted: { label: 'Kısa Listede', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
                  hired: { label: 'İşe Alındı', color: 'bg-emerald-600/30 text-emerald-200 border-emerald-500' },
                  rejected: { label: 'Reddedildi', color: 'bg-slate-800 text-slate-400 border-slate-700' },
                }[app.status] || { label: app.status, color: 'bg-slate-800 text-slate-300 border-slate-700' };

                return (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Aday */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm">{cand?.full_name || 'İsimsiz Aday'}</p>
                        <div className="flex flex-col gap-0.5 text-slate-400 text-[11px] font-mono">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{cand?.email || '-'}</span>
                          </span>
                          {cand?.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{cand.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Pozisyon */}
                    <td className="py-4 px-5 font-semibold text-white">
                      {app.job?.title || 'Bilinmeyen Pozisyon'}
                    </td>

                    {/* AI Uyum Skoru */}
                    <td className="py-4 px-5">
                      {analysisObj ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 font-extrabold text-sm text-indigo-300">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>%{analysisObj.match_score}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Puanlanıyor...</span>
                        </span>
                      )}
                    </td>

                    {/* Durum */}
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* KVKK Rozeti */}
                    <td className="py-4 px-5">
                      {app.consent_given ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Onaylı</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Ret</span>
                        </span>
                      )}
                    </td>

                    {/* Tarih */}
                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(app.created_at).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* İşlemler (AI Raporu & CV İndir) */}
                    <td className="py-4 px-5 text-right space-x-2">
                      {!analysisObj ? (
                        <div className="inline-flex flex-col items-end gap-1 mr-2 align-middle">
                          <button
                            type="button"
                            disabled={scoringId === app.id}
                            onClick={() => handleForceScore(app.id)}
                            className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {scoringId === app.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>Yapay Zekaya Puanlat</span>
                          </button>
                          {scoringError?.id === app.id && (
                            <span className="text-[10px] text-red-400 font-medium max-w-[150px] leading-tight text-right mt-1">
                              {scoringError.msg}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAnalysisDrawer(app)}
                          className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs inline-flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Raporu</span>
                        </button>
                      )}

                      {app.cv_storage_path && (
                        <button
                          type="button"
                          disabled={downloadingId === app.id}
                          onClick={() => handleDownloadCv(app.id, app.cv_storage_path)}
                          className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 font-semibold text-xs inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                          title="Sunucuda 60 saniyelik kısa ömürlü Signed URL oluşturulup açılır"
                        >
                          {downloadingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>CV (60sn)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Slide-Over Drawer */}
      <CVAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        analysis={selectedApp ? getAnalysisObject(selectedApp) : null}
        candidateName={selectedApp?.candidate?.full_name || 'İsimsiz Aday'}
        jobTitle={selectedApp?.job?.title || 'Bilinmeyen Pozisyon'}
      />
    </div>
  );
}
