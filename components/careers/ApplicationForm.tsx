'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Lock, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

interface ApplicationFormProps {
  orgSlug: string;
  jobId: string;
  jobTitle: string;
  orgName: string;
  supabaseUrl: string;
}

export default function ApplicationForm({
  orgSlug,
  jobId,
  jobTitle,
  orgName,
  supabaseUrl,
}: ApplicationFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Honeypot (bot tuzak alanı)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Dosya uzantısı ve boyut kontrolü (Client-side fail fast)
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        setError('Yalnızca PDF (.pdf) veya DOCX (.docx) formatında dosya yükleyebilirsiniz.');
        setFile(null);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu maksimum 5 MB olabilir.');
        setFile(null);
        return;
      }

      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('Lütfen KVKK açık rıza metnini onaylayın.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !file) {
      setError('Ad Soyad, E-posta ve CV dosyası zorunludur.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('org_slug', orgSlug);
      formData.append('job_id', jobId);
      formData.append('full_name', fullName);
      formData.append('email', email);
      if (phone.trim()) formData.append('phone', phone);
      formData.append('consent_given', 'true');
      formData.append('website', honeypot); // Honeypot
      formData.append('file', file);

      const endpoint = `${supabaseUrl}/functions/v1/submit-application`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Başvuru gönderilirken bir hata oluştu.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/30 text-center space-y-5 my-8 max-w-xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 glow-primary">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Başvurunuz Başarıyla Alındı!
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          <strong>{jobTitle}</strong> pozisyonu için <strong>{orgName}</strong> insan kaynakları ekibine başvurunuz iletilmiştir. CV&apos;niz ve bilgileriniz KVKK standartlarına uygun olarak güvenle işleme alınacaktır.
        </p>
        <div className="pt-4 border-t border-white/10 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Destekli Güvenli Başvuru Alındı</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot gizli alan */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ad Soyad *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Örn: Ayşe Yılmaz"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            E-posta Adresi *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Örn: ayse.yilmaz@example.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Telefon Numarası
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Örn: 0532 000 00 00"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* CV Yükleme Alanı */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Özgeçmiş (CV) Dosyası * <span className="text-[11px] font-normal text-slate-400">(Yalnızca PDF veya DOCX - Max 5MB)</span>
        </label>

        <div className="relative">
          <input
            type="file"
            required
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            file 
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-400'
          }`}>
            {file ? (
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-white truncate">{file.name}</p>
                  <p className="text-xs text-indigo-400">{(file.size / (1024 * 1024)).toFixed(2)} MB — Değiştirmek için tıklayın veya sürükleyin</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Dosyayı buraya sürükleyin veya bilgisayarınızdan seçin
                </p>
                <p className="text-xs text-slate-500">
                  Desteklenen formatlar: .PDF, .DOCX (maksimum 5 MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KVKK Açık Rıza Kutusu */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-indigo-500 rounded shrink-0 cursor-pointer"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            <strong>Açık Rıza Beyanı (KVKK Zorunlu):</strong> Özgeçmişimde (CV) ve başvuru formunda paylaşmış olduğum kişisel ve özel nitelikli verilerimin, <strong>{orgName}</strong> tarafından iş başvurusunun ve AI tabanlı aday uygunluk skorlamasının gerçekleştirilmesi amacıyla işlenmesine, gizli bulut altyapısında saklanmasına açık rıza veriyorum.
          </span>
        </label>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-8">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bu onay kutusu işaretlenmeden başvuru gönderimi engellenmiştir.</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !consentGiven || !file}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg glow-primary flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Başvurunuz Gönderiliyor & CV Yükleniyor...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Başvurumu Gönder</span>
          </>
        )}
      </button>
    </form>
  );
}
