'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import { Menu, Bell, X, Home, Users, BookOpen, Sparkles, Library, Settings } from 'lucide-react';

export default function MobileHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);
  const assignmentsCount = useAppSelector((state) => state.assignment.items.length);
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, badge: assignmentsCount > 0 ? assignmentsCount : undefined },
    { id: 'toolkit', label: 'AI Teacher\'s Toolkit', icon: Sparkles },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    setIsOpen(false);
    router.push('/assignments');
  };

  return (
    <div className="md:hidden flex flex-col w-full px-4 pt-4 shrink-0 select-none z-40">
      {/* Mobile Top Bar */}
      <header className="w-full bg-white h-[68px] rounded-[24px] shadow-[0_4px_25px_rgb(0,0,0,0.015)] border border-gray-100/70 flex items-center justify-between px-5">
        {/* Brand Logo */}
        <div className="flex items-center gap-2" onClick={() => router.push('/assignments')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/10">
            <span className="text-white font-extrabold text-lg tracking-tighter">V</span>
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">VedaAI</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-full border border-gray-100 bg-gray-50/50 flex items-center justify-center text-slate-600 transition cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-orange-500 rounded-full ring-1 ring-white"></span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-amber-300 to-indigo-300 flex items-center justify-center border border-gray-100">
            <span className="text-sm">👨‍💻</span>
          </div>

          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-full border border-gray-100 bg-gray-50/50 flex items-center justify-center text-slate-700 hover:bg-gray-100 transition cursor-pointer"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[88px] bg-black/20 backdrop-blur-sm z-30 transition-all duration-300 flex flex-col justify-start">
          <div className="w-full bg-white rounded-b-[28px] border-b border-gray-100 p-5 shadow-xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-[#EBEBEB] text-[#1E1E1E] font-semibold' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-800' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
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
        </div>
      )}
    </div>
  );
}
