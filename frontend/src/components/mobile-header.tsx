'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import { Menu, Bell, X, LayoutGrid, Users, BookOpen, Sparkles, Library, Settings } from 'lucide-react';

export default function MobileHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);
  const assignmentsCount = useAppSelector((state) => state.assignment.items.length);
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, badge: assignmentsCount > 0 ? assignmentsCount : undefined },
    { id: 'toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    setIsOpen(false);
    router.push('/assignments');
  };

  return (
    <div className="md:hidden flex flex-col w-full shrink-0 select-none z-50 no-print">
      {/* Mobile Top Bar */}
      <div className="w-full px-4 pt-3 pb-2">
        <header className="w-full bg-white h-[60px] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-4">
          {/* Brand Logo */}
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 cursor-pointer"
          >
            {/* Figma: dark square with rounded corners + V letter */}
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-white font-extrabold text-base leading-none">V</span>
            </div>
            <span className="text-[17px] font-extrabold text-[#1A1A1A] tracking-tight">VedaAI</span>
          </button>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-gray-50 transition cursor-pointer">
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {/* Orange dot indicator */}
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>

            {/* User Profile Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer">
              <span className="text-sm leading-none select-none">🧑‍🏫</span>
            </div>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-gray-50 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
            </button>
          </div>
        </header>
      </div>

      {/* Slide-down Navigation Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="absolute top-[76px] left-4 right-4 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-slide-in-top">
            <nav className="flex flex-col p-3 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full h-11 flex items-center justify-between px-3 rounded-xl transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#F5F5F5] text-[#1A1A1A] font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A1A1A]' : 'text-gray-400'}`} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
