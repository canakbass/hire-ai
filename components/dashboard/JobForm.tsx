'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Sliders, 
  PhoneCall, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Loader2, 
  Save, 
  Sparkles 
} from 'lucide-react';
import { createJob, updateJob, type JobFormData } from '@/lib/actions/jobs';
import { type Database } from '@/lib/types/database.types';

type JobStatus = Database['public']['Enums']['job_status'];

interface JobFormProps {
  initialData?: {
    id: string;
    title: string;
    department?: string | null;
    location?: string | null;
    employment_type?: string | null;
    seniority?: string | null;
    description?: string | null;
    status: JobStatus;
    job_settings?: any;
  };
  isEdit?: boolean;
}

export default function JobForm({ initialData, isEdit = false }: JobFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'criteria' | 'interview' | 'shortlist'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = initialData?.job_settings || {};
  const defaultScoring = settings.scoring_weights || { skills: 40, experience: 30, education: 15, other: 15 };
  const defaultRanking = settings.ranking_weights || { cv: 50, interview: 50 };

  const [formData, setFormData] = useState<JobFormData>({
    // Pozisyon Bilgileri
    title: initialData?.title || '',
    department: initialData?.department || 'Yazılım & Mühendislik',
    location: initialData?.location || 'İstanbul (Hibrit)',
    employment_type: initialData?.employment_type || 'full_time',
    seniority: initialData?.seniority || 'mid',
    description: initialData?.description || '',
    status: initialData?.status || 'draft',

    // Eleme Kriterleri
    required_skills: settings.required_skills || ['React', 'TypeScript', 'Next.js', 'PostgreSQL'],
    nice_to_have_skills: settings.nice_to_have_skills || ['Docker', 'Supabase', 'Tailwind CSS'],
    min_experience_years: settings.min_experience_years !== undefined ? settings.min_experience_years : 3,
    education_level: settings.education_level || 'lisans',
    languages: settings.languages || ['İngilizce (B2)'],
    scoring_weights: {
      skills: Number(defaultScoring.skills || 0),
      experience: Number(defaultScoring.experience || 0),
      education: Number(defaultScoring.education || 0),
      other: Number(defaultScoring.other || 0),
    },
    pass_threshold: settings.pass_threshold !== undefined ? settings.pass_threshold : 70,
    reject_threshold: settings.reject_threshold !== undefined ? settings.reject_threshold : 40,
    knockout_rules: settings.knockout_rules || ['Türkiye çalışma iznine sahip olmak', 'Askerlikle ilişiği bulunmamak veya tecilli'],

    // Otonom Mülakat
    interview_enabled: settings.interview_enabled !== undefined ? settings.interview_enabled : true,
    interview_questions: settings.interview_questions || [
      'Bize daha önce geliştirdiğin ölçeklenebilir bir web uygulamasından ve karşılaştığın zorluklardan bahseder misin?',
      'Modern state management ve Next.js App Router konusundaki yaklaşımın nedir?'
    ],
    interview_language: settings.interview_language || 'tr',
    interview_max_minutes: settings.interview_max_minutes !== undefined ? settings.interview_max_minutes : 6,
    interview_pass_threshold: settings.interview_pass_threshold !== undefined ? settings.interview_pass_threshold : 70,
    require_manual_call_approval: settings.require_manual_call_approval !== undefined ? settings.require_manual_call_approval : true,

    // Kısa Liste
    shortlist_size: settings.shortlist_size !== undefined ? settings.shortlist_size : 5,
    ranking_weights: {
      cv: Number(defaultRanking.cv || defaultRanking.cv_score || 50),
      interview: Number(defaultRanking.interview || defaultRanking.interview_score || 50),
    },
  });

  // Tag helper state
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newKnockout, setNewKnockout] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const addTag = (field: keyof JobFormData, value: string, setter: (s: string) => void) => {
    if (!value.trim()) return;
    const current = formData[field] as string[];
    if (!current.includes(value.trim())) {
      setFormData({ ...formData, [field]: [...current, value.trim()] });
    }
    setter('');
  };

  const removeTag = (field: keyof JobFormData, idx: number) => {
    const current = [...(formData[field] as string[])];
    current.splice(idx, 1);
    setFormData({ ...formData, [field]: current });
  };

  const scoringSum = 
    formData.scoring_weights.skills + 
    formData.scoring_weights.experience + 
    formData.scoring_weights.education + 
    formData.scoring_weights.other;

  const rankingSum = formData.ranking_weights.cv + formData.ranking_weights.interview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Pozisyon başlığı zorunludur.');
      setActiveTab('basic');
      return;
    }

    if (scoringSum !== 100) {
      setError(`Skorlama ağırlıkları toplamı tam 100 olmalıdır (Şu anki: ${scoringSum}).`);
      setActiveTab('criteria');
      return;
    }

    if (rankingSum !== 100) {
      setError(`Sıralama ağırlıkları toplamı tam 100 olmalıdır (Şu anki: ${rankingSum}).`);
      setActiveTab('shortlist');
      return;
    }

    if (formData.reject_threshold >= formData.pass_threshold) {
      setError('Red barajı, potansiyel barajından kesinlikle küçük olmalıdır.');
      setActiveTab('criteria');
      return;
    }

    setLoading(true);

    try {
      if (isEdit && initialData?.id) {
        const res = await updateJob(initialData.id, formData);
        if (res?.error) {
          setError(res.error);
        } else {
          router.push('/dashboard/jobs');
          router.refresh();
        }
      } else {
        const res = await createJob(formData);
        if (res?.error) {
          setError(res.error);
        } else {
          router.push('/dashboard/jobs');
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-panel p-1.5 rounded-2xl flex flex-wrap gap-1 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'basic'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Pozisyon Bilgileri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('criteria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'criteria'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Eleme Kriterleri</span>
          {scoringSum !== 100 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Ağırlık toplamı 100 olmalı" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'interview'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Otonom Mülakat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shortlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'shortlist'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kısa Liste & Sıralama</span>
          {rankingSum !== 100 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Ağırlık toplamı 100 olmalı" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Basic Info */}
      {activeTab === 'basic' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-white/10 pb-4">
            Pozisyon Temel Bilgileri
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pozisyon Başlığı *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Senior Full-Stack Mühendisi"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Departman
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Örn: Yazılım & Mühendislik"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Konum
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Örn: İstanbul (Hibrit) veya Uzaktan (Remote)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Çalışma Türü
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="full_time">Tam Zamanlı (Full Time)</option>
                <option value="part_time">Yarı Zamanlı (Part Time)</option>
                <option value="contract">Sözleşmeli / Proje Bazlı</option>
                <option value="intern">Stajyer (Intern)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kıdem Seviyesi (Seniority)
              </label>
              <select
                value={formData.seniority}
                onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Yayın Durumu
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              >
                <option value="draft">Taslak (Draft - Public Sayfada Gizli)</option>
                <option value="published">Yayında (Published - Public Sayfada Açık)</option>
                <option value="paused">Durduruldu (Paused)</option>
                <option value="closed">Kapandı (Closed)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                İş Tanımı (Job Description - JD)
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Pozisyon gereksinimlerini, rol sorumluluklarını ve sunduğunuz olanakları detaylandırın..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Criteria */}
      {activeTab === 'criteria' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">
              AI CV Skorlama ve Eleme Kriterleri (`job_settings`)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              HireAI™ Otonom Puanlama Motoru, buradaki ağırlık ve barajlara göre otomatik analiz yapar.
            </p>
          </div>

          {/* Scoring Weights */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Skorlama Rubriği Ağırlıkları (Toplam 100 Olmalı)
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${scoringSum === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                Toplam: %{scoringSum}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Yetenekler (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring_weights.skills}
                  onChange={(e) => setFormData({
                    ...formData,
                    scoring_weights: { ...formData.scoring_weights, skills: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Deneyim (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring_weights.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    scoring_weights: { ...formData.scoring_weights, experience: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Eğitim (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring_weights.education}
                  onChange={(e) => setFormData({
                    ...formData,
                    scoring_weights: { ...formData.scoring_weights, education: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Diğer/Ekstra (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring_weights.other}
                  onChange={(e) => setFormData({
                    ...formData,
                    scoring_weights: { ...formData.scoring_weights, other: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-purple-500/20">
              <label className="block text-xs font-bold text-purple-300 mb-1">
                Potansiyel Barajı (Pass Threshold - Varsayılan 70)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.pass_threshold}
                onChange={(e) => setFormData({ ...formData, pass_threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm font-mono mt-1"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Bu puan veya üzerini alan adaylar <span className="text-purple-400 font-semibold">Potansiyel</span> statüsüne alınır.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-red-500/20">
              <label className="block text-xs font-bold text-red-300 mb-1">
                Red Barajı (Reject Threshold - Varsayılan 40)
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={formData.reject_threshold}
                onChange={(e) => setFormData({ ...formData, reject_threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm font-mono mt-1"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Bu puanın altındaki adaylar <span className="text-red-400 font-semibold">Alakasız (Irrelevant)</span> statüsüne ayrılır. Aradakiler İnsan İncelemesinde (Review) kalır.
              </p>
            </div>
          </div>

          {/* Required & Nice to Have Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Zorunlu Yetenekler (Required Skills)</label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newReqSkill}
                  onChange={(e) => setNewReqSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('required_skills', newReqSkill, setNewReqSkill); } }}
                  placeholder="Yetenek ekle ve Enter'a bas..."
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag('required_skills', newReqSkill, setNewReqSkill)}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.required_skills.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1.5">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag('required_skills', i)} className="hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-2">Artı Puan Yetenekler (Nice to Have Skills)</label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newNiceSkill}
                  onChange={(e) => setNewNiceSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('nice_to_have_skills', newNiceSkill, setNewNiceSkill); } }}
                  placeholder="Ek yetenek ekle..."
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag('nice_to_have_skills', newNiceSkill, setNewNiceSkill)}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.nice_to_have_skills.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1.5">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag('nice_to_have_skills', i)} className="hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Min Exp, Edu Level, Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Deneyim (Yıl)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.min_experience_years}
                onChange={(e) => setFormData({ ...formData, min_experience_years: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Eğitim Seviyesi</label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
              >
                <option value="lise">Lise</option>
                <option value="onlisans">Ön Lisans</option>
                <option value="lisans">Lisans</option>
                <option value="yuksek">Yüksek Lisans / Doktora</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Diller</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('languages', newLang, setNewLang); } }}
                  placeholder="Dil ekle (Örn: Almanca C1)"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag('languages', newLang, setNewLang)}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.languages.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag('languages', i)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Knockout Rules */}
          <div>
            <label className="block text-xs font-semibold text-red-300 mb-1.5">Eleme (Knockout) Kuralları</label>
            <p className="text-[11px] text-slate-400 mb-2.5">Bu şartları sağlamayan adaylar puanı yüksek olsa bile doğrudan elenir.</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKnockout}
                onChange={(e) => setNewKnockout(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('knockout_rules', newKnockout, setNewKnockout); } }}
                placeholder="Örn: Seyahat engelinin bulunmaması veya B sınıfı ehliyet..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => addTag('knockout_rules', newKnockout, setNewKnockout)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Kural Ekle</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {formData.knockout_rules.map((rule, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
                  <span>• {rule}</span>
                  <button type="button" onClick={() => removeTag('knockout_rules', i)} className="hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interview */}
      {activeTab === 'interview' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">
              Otonom AI Sesli Mülakat Ayarları (`job_settings`)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Potansiyel adayların otonom veya İK onayıyla aranarak değerlendirileceği parametreler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Sesli Mülakat Aktif mi?</span>
                <span className="text-[11px] text-slate-400">Bu pozisyon için otonom AI sesli görüşmesi açılsın</span>
              </div>
              <input
                type="checkbox"
                checked={formData.interview_enabled}
                onChange={(e) => setFormData({ ...formData, interview_enabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Manuel İK Onayı Zorunlu (Güvenlik)</span>
                <span className="text-[11px] text-slate-400">Aday potansiyel seçilse dahi İK onayı olmadan aranmaz</span>
              </div>
              <input
                type="checkbox"
                checked={formData.require_manual_call_approval}
                onChange={(e) => setFormData({ ...formData, require_manual_call_approval: e.target.checked })}
                className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mülakat Dili</label>
              <select
                value={formData.interview_language}
                onChange={(e) => setFormData({ ...formData, interview_language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
              >
                <option value="tr">Türkçe (tr-TR)</option>
                <option value="en">İngilizce (en-US)</option>
                <option value="de">Almanca (de-DE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Maksimum Görüşme Süresi (Dakika)</label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.interview_max_minutes}
                onChange={(e) => setFormData({ ...formData, interview_max_minutes: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-2">Mülakat Soruları (`interview_questions`)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('interview_questions', newQuestion, setNewQuestion); } }}
                placeholder="Adaya yöneltilecek teknik veya yetkinlik sorusunu yazın..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => addTag('interview_questions', newQuestion, setNewQuestion)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Soru Ekle</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.interview_questions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 text-xs flex items-start justify-between gap-3">
                  <span className="leading-relaxed"><strong>{i + 1}.</strong> {q}</span>
                  <button type="button" onClick={() => removeTag('interview_questions', i)} className="text-slate-400 hover:text-white shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Shortlist */}
      {activeTab === 'shortlist' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">
              Kısa Liste (Shortlist) ve Sıralama Ağırlıkları (`job_settings`)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Yöneticinin karar masasına çıkarılacak aday sayısı (`shortlist_size`) ve birleşik skor hesaplama ağırlıkları.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Kısa Liste Boyutu (`shortlist_size`) *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.shortlist_size}
                onChange={(e) => setFormData({ ...formData, shortlist_size: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono font-bold text-indigo-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">En yüksek birleşik skora sahip ilk N aday listelenir.</p>
            </div>

            <div className="sm:col-span-2 p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Birleşik Sıralama Ağırlıkları (Toplam 100 Olmalı)
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${rankingSum === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  Toplam: %{rankingSum}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CV Skoru (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.ranking_weights.cv}
                    onChange={(e) => setFormData({
                      ...formData,
                      ranking_weights: { ...formData.ranking_weights, cv: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mülakat Skoru (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.ranking_weights.interview}
                    onChange={(e) => setFormData({
                      ...formData,
                      ranking_weights: { ...formData.ranking_weights, interview: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Footer */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/dashboard/jobs')}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
        >
          İptal
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg glow-primary flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Değişiklikleri Kaydet' : 'Pozisyonu ve Kriterleri Oluştur'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
