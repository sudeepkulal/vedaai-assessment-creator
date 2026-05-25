'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import { Home, BookOpen, Library, Sparkles } from 'lucide-react';

export default function BottomNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'toolkit', label: 'AI Toolkit', icon: Sparkles },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    router.push('/assignments');
  };

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 max-w-lg mx-auto select-none">
      <nav className="w-full bg-[#1E1E1E]/95 backdrop-blur-md h-[68px] rounded-[24px] border border-neutral-800 shadow-[0_12px_30px_rgba(0,0,0,0.3)] flex items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[70px] relative"
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-white scale-110' : 'text-neutral-400 hover:text-neutral-200'
                }`} 
              />
              <span 
                className={`text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </span>
              {/* Active bar/indicator below */}
              {isActive && (
                <span className="absolute bottom-0 w-5 h-1 bg-white rounded-t-full"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
