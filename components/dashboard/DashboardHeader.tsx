'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Database } from '@/lib/types/database.types';

type OrgRow = Database['public']['Tables']['orgs']['Row'];
type RoleEnum = Database['public']['Enums']['app_role'];

interface HeaderProps {
  user: any;
  profile: any;
  activeOrg: OrgRow;
  userRole: RoleEnum | null;
}

export default function DashboardHeader({
  activeOrg,
}: HeaderProps) {
  const pathname = usePathname();

  const titleMap: Record<string, string> = {
    '/dashboard': 'Genel Bakış & İK Özeti',
    '/dashboard/jobs': 'Pozisyon İlanları & Kriterler',
    '/dashboard/applications': 'Gelen Başvurular & Aday Havuzu',
    '/dashboard/candidates': 'Aday Havuzu & CV Skorları',
    '/dashboard/interviews': 'Otonom AI Sesli Mülakatlar',
    '/dashboard/shortlists': 'Yönetici Kısa Listeleri',
    '/dashboard/settings': 'Çalışma Alanı ve Ekip Ayarları',
  };

  const currentTitle = titleMap[pathname] || 'Çalışma Alanı';

  return (
    <header className="h-16 border-b border-white/10 bg-[#0c0f17]/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-white">
            {currentTitle}
          </h1>
          <p className="text-[11px] text-slate-400">
            {activeOrg.name} çalışma alanı • <span className="text-emerald-400 font-medium">Sistem Aktif</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">AI Engine:</span>
          <span className="text-indigo-400">HireAI™ Otonom Motor</span>
        </div>

        <Link
          href="/dashboard/jobs/new"
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md glow-primary flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Pozisyon Aç</span>
        </Link>
      </div>
    </header>
  );
}
