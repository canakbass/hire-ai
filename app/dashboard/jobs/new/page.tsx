import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import JobForm from '@/components/dashboard/JobForm';

export default function NewJobPage() {
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
            <span>Yeni Pozisyon ve Kriter Rubriği Oluştur</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-slate-400 text-xs">
            Pozisyon oluşturulduğunda `job_settings` satırı varsayılan ve seçtiğiniz AI/Mülakat parametreleriyle otomatik eklenir.
          </p>
        </div>
      </div>

      <JobForm />
    </div>
  );
}
