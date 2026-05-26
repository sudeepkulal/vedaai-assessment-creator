'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import { LayoutGrid, BookOpen, Library, Sparkles } from 'lucide-react';

export default function BottomNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);

  const items = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'toolkit', label: 'AI Toolkit', icon: Sparkles },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    router.push('/assignments');
  };

  return (
    /* Fixed bottom nav — only visible on mobile */
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto select-none no-print">
      <nav className="w-full bg-[#1A1A1A] h-[64px] rounded-[22px] border border-neutral-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[68px] relative active:scale-95"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-500'
                }`}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span
                className={`text-[10px] font-semibold mt-1 tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-500'
                }`}
              >
                {item.label}
              </span>
              {/* Active indicator dot/pill under text */}
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
