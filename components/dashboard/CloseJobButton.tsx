'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';

export default function CloseJobButton({ jobId, currentStatus }: { jobId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (currentStatus === 'closed') {
    return (
      <button disabled className="flex items-center gap-2 bg-red-900/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium opacity-70">
        <XCircle className="w-4 h-4" /> Arayış Sonlandırıldı
      </button>
    );
  }

  const handleClose = async () => {
    if (!confirm('Bu pozisyon için arayışı sonlandırmak istediğinize emin misiniz?')) return;
    
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId);
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      alert('Hata: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClose}
      disabled={isLoading}
      className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
      Arayışı Sonlandır
    </button>
  );
}
