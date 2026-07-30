'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getCvSignedUrl } from '@/lib/actions/applications';

interface CVDownloadButtonProps {
  storagePath: string;
  applicationId: string;
}

export default function CVDownloadButton({ storagePath, applicationId }: CVDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCv = async () => {
    setDownloading(true);
    try {
      const res = await getCvSignedUrl(storagePath);
      if (res?.error || !res?.signedUrl) {
        alert(res?.error || 'CV indirme bağlantısı alınamadı.');
      } else {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      alert(err?.message || 'CV indirme hatası.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadCv}
      disabled={downloading}
      className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
    >
      {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Orijinal CV'yi İndir
    </button>
  );
}
