'use client';

import { useState } from 'react';
import { Menu, Search, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
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
  user,
  profile,
  userRole,
}: HeaderProps) {
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    owner: 'Kurucu',
    admin: 'Yönetici',
    recruiter: 'İK Uzmanı',
    viewer: 'Gözlemci'
  };

  const displayRole = userRole ? roleLabels[userRole] : 'Kullanıcı';
  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const initials = fullName.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0b0f19] px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left side */}
      <div className="flex items-center">
        <button 
          onClick={() => {
            const aside = document.querySelector('aside');
            if (aside) aside.classList.toggle('hidden');
          }}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Aday, pozisyon ara..." 
            className="block w-64 pl-10 pr-12 py-1.5 text-xs bg-[#151c2f] border border-[#1e293b] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-[10px] text-slate-500 bg-[#1e293b] px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-slate-400 hover:text-white transition-colors p-1"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border border-[#0b0f19]"></span>
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#151c2f] border border-[#1e293b] rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#1e293b] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Bildirimler</h3>
                <span className="text-[10px] text-indigo-400 font-medium cursor-pointer hover:text-indigo-300">Tümünü okundu işaretle</span>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {/* Dummy Notification Item */}
                <div className="px-4 py-3 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-200"><span className="font-semibold text-white">Sisteme hoş geldiniz!</span> HireAI ile işe alım süreçlerinizi otonomlaştırın.</p>
                    <p className="text-[10px] text-slate-500 mt-1">Az önce</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-[#1e293b] text-center">
                <Link href="#" className="text-xs text-slate-400 hover:text-white transition-colors">Tüm bildirimleri gör</Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#1e293b]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200">{fullName}</p>
            <p className="text-[10px] text-slate-400">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
