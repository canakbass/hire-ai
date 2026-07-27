'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  PhoneCall, 
  Award, 
  Settings, 
  LogOut, 
  Building2
} from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import type { Database } from '@/lib/types/database.types';

type OrgRow = Database['public']['Tables']['orgs']['Row'];
type RoleEnum = Database['public']['Enums']['app_role'];

interface SidebarProps {
  user: any;
  profile: any;
  activeOrg: OrgRow;
  userRole: RoleEnum | null;
  allOrgs: (OrgRow & { role: RoleEnum })[];
}

export default function DashboardSidebar({
  user,
  profile,
  activeOrg,
  userRole,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Genel Bakış',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Pozisyon İlanları',
      href: '/dashboard/jobs',
      icon: Briefcase,
      badge: null,
    },
    {
      label: 'Gelen Başvurular',
      href: '/dashboard/applications',
      icon: Users,
      badge: 'Yeni',
    },
    {
      label: 'AI Sesli Mülakatlar',
      href: '/dashboard/interviews',
      icon: PhoneCall,
      badge: 'Otonom',
    },
    {
      label: 'Kısa Listeler (Final)',
      href: '/dashboard/shortlists',
      icon: Award,
      badge: null,
    },
    {
      label: 'Çalışma Alanı & Ekip',
      href: '/dashboard/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const roleColors: Record<RoleEnum, string> = {
    owner: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    recruiter: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0c0f17]/80 backdrop-blur-xl flex flex-col shrink-0">
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg glow-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            HireAI
          </span>
        </Link>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
          PRO
        </span>
      </div>

      <div className="p-4 border-b border-white/[0.06]">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {activeOrg.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                /{activeOrg.slug}
              </p>
            </div>
          </div>
          {userRole && (
            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${roleColors[userRole] || roleColors.viewer}`}>
              {userRole}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          İşe Alım Süreçleri
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-transparent border-l-2 border-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Oturumu Kapat"
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
