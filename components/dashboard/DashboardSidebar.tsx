'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Home, 
  Users, 
  UserSquare2, 
  Mic, 
  SlidersHorizontal,
  Star,
  BarChart3,
  Settings,
  Bot,
  Briefcase
} from 'lucide-react';
import { useState } from 'react';
import type { Database } from '@/lib/types/database.types';
import AIAssistantChat from './AIAssistantChat';

type OrgRow = Database['public']['Tables']['orgs']['Row'];
type RoleEnum = Database['public']['Enums']['app_role'];

interface SidebarProps {
  user: any;
  profile: any;
  activeOrg: OrgRow;
  userRole: RoleEnum | null;
  allOrgs: (OrgRow & { role: RoleEnum })[];
  jobs?: { id: string; title: string; status: string }[];
}

export default function DashboardSidebar({
  activeOrg,
  jobs = []
}: SidebarProps) {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems = [
    { label: 'Genel Bakış', href: '/dashboard', icon: Home, badge: null },
    { label: 'Başvurular', href: '/dashboard/applications', icon: Users, badge: null },
    { label: 'Aday Havuzu', href: '/dashboard/candidates', icon: UserSquare2, badge: null },
    { label: 'Pozisyonlar', href: '/dashboard/jobs', icon: Briefcase, badge: null },
    { label: 'AI Mülakatlar', href: '/dashboard/interviews', icon: Mic, badge: null },
    { label: 'Değerlendirmeler', href: '/dashboard/evaluations', icon: SlidersHorizontal, badge: null },
    { label: 'En İyi Adaylar', href: '/dashboard/shortlists', icon: Star, badge: null },
    { label: 'Raporlar', href: '/dashboard/reports', icon: BarChart3, badge: null },
    { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings, badge: null },
  ];

  const activeJobs = jobs.filter(j => j.status === 'published' || j.status === 'active' || j.status === 'draft');

  return (
    <aside className="w-64 border-r border-[#1e293b] bg-[#0b0f19] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
      {/* Logo Area */}
      <div className="h-16 px-6 flex items-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-6 h-6 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-white text-xl tracking-wide">
            HireAI
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 pt-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-indigo-700/50 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Positions Section */}
      <div className="px-3 mt-8">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
          <span>AKTİF POZİSYONLAR ({activeJobs.length})</span>
        </div>
        <div className="space-y-1">
          {activeJobs.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 italic">
              Henüz ilanınız bulunmuyor.
            </div>
          ) : (
            activeJobs.slice(0, 5).map((pos) => (
              <Link
                key={pos.id}
                href={`/dashboard/jobs/${pos.id}/edit`}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              >
                <span className="tracking-wide truncate pr-2">{pos.title}</span>
                {pos.status === 'draft' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Taslak</span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto p-4 shrink-0">
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-gradient-to-b from-[#151c2f] to-[#0f1423] border border-indigo-500/20 rounded-2xl p-4 flex flex-col items-center text-center shadow-xl relative overflow-hidden group transition-transform hover:scale-[1.02]"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">AI Asistan ile Sohbet</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Gemini destekli İK asistanınızla konuşmak için tıklayın.
          </p>
        </button>
      </div>

      <AIAssistantChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </aside>
  );
}
