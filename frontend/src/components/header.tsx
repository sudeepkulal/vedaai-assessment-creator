'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  breadcrumb?: string;
  showBack?: boolean;
}

export default function Header({ breadcrumb = 'Assignment', showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="hidden md:flex items-center justify-between w-full bg-white h-[76px] px-6 rounded-[24px] border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.01)] select-none">
      {/* Left side Breadcrumbs */}
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => router.push('/assignments')}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 text-slate-700 transition cursor-pointer">
          <LayoutGrid className="w-4 h-4 text-slate-500" />
        </div>

        <span className="text-sm font-semibold text-slate-400 select-none tracking-wide ml-1">
          {breadcrumb}
        </span>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative w-11 h-11 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/30 hover:bg-gray-100 text-slate-600 transition cursor-pointer">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-3 right-3.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-100 group select-none">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-amber-300 to-indigo-300 flex items-center justify-center border border-white shadow-sm">
            <span className="text-base select-none">👨‍💻</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 tracking-tight leading-tight select-none">John Doe</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
