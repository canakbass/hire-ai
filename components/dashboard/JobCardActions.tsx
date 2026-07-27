'use client';

import React, { useState, useTransition } from 'react';
import { toggleJobStatus, deleteJob } from '@/lib/actions/jobs';
import { type Database } from '@/lib/types/database.types';
import { Loader2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

type JobStatus = Database['public']['Enums']['job_status'];

interface JobCardActionsProps {
  jobId: string;
  currentStatus: JobStatus;
}

export default function JobCardActions({ jobId, currentStatus }: JobCardActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await toggleJobStatus(jobId, currentStatus);
      if (res?.error) {
        setError(res.error);
        alert(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Bu pozisyonu ve bağlı tüm başvuru ile ayarları silmek istediğinize emin misiniz?')) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteJob(jobId);
      if (res?.error) {
        setError(res.error);
        alert(res.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 border ${
          currentStatus === 'published'
            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
        }`}
        title={currentStatus === 'published' ? 'Taslağa Çevir' : 'Yayınla (Published Yap)'}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : currentStatus === 'published' ? (
          <>
            <Clock className="w-3.5 h-3.5" />
            <span>Taslağa Çevir</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Yayınla</span>
          </>
        )}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
        title="Pozisyonu Sil"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
