'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import {
  LayoutGrid,
  Users,
  BookOpen,
  Sparkles,
  Library,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);
  const router = useRouter();
  const assignmentsCount = useAppSelector((state) => state.assignment.items.length);

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, badge: assignmentsCount > 0 ? assignmentsCount : undefined },
    { id: 'toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
    { id: 'library', label: 'My Library', icon: Library },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    router.push('/assignments');
  };

  return (
    <aside className="hidden md:flex flex-col w-[256px] bg-white h-[calc(100vh-32px)] my-4 ml-4 rounded-[28px] border border-gray-200 shadow-sm p-5 justify-between shrink-0 no-print">
      {/* Upper Section */}
      <div className="flex flex-col gap-6">
        {/* Logo — Figma: orange rounded square + VedaAI text */}
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
            {/* White V with a checkmark-like shape */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 5.5L11 17L18 5.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[22px] font-black text-[#1A1A1A] tracking-tight">VedaAI</span>
        </div>

        {/* Create Assignment CTA — Figma: dark button with orange border */}
        <button
          onClick={() => router.push('/assignments/create')}
          className="w-full h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all duration-200 border-2 border-orange-500/40 hover:border-orange-500/60 text-sm font-semibold shadow-lg shadow-neutral-900/10 cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400/20 group-hover:scale-110 transition-transform" />
          <span>Create Assignment</span>
        </button>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full h-11 flex items-center justify-between px-3 rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F0F0F0] text-[#1A1A1A] font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] ${isActive ? 'text-[#1A1A1A]' : 'text-gray-400'}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[11px] leading-tight">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col gap-3">
        {/* Settings */}
        <button
          id="sidebar-nav-settings"
          onClick={() => handleNavClick('settings')}
          className={`w-full h-11 flex items-center gap-3 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#F0F0F0] text-slate-800 font-semibold'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.8} />
          <span className="text-sm">Settings</span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-xl leading-none">🧑‍🏫</span>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[13px] font-bold text-[#1A1A1A] truncate leading-tight">Delhi Public School</span>
            <span className="text-[11px] text-gray-500 font-medium truncate mt-0.5">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
