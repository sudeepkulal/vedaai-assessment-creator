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
    /* Desktop-only top navigation bar — matches Figma header */
    <header className="hidden md:flex items-center justify-between w-full bg-white h-[68px] px-5 rounded-2xl border border-gray-200 shadow-sm select-none mb-4">
      {/* Left: Back arrow + grid icon + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Back / Home arrow */}
        <button
          onClick={showBack ? () => router.back() : () => router.push('/assignments')}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-slate-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Grid / module icon */}
        <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-slate-500">
          <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
        </div>

        {/* Breadcrumb label */}
        <span className="text-sm font-semibold text-gray-400 tracking-wide">
          {breadcrumb}
        </span>
      </div>

      {/* Right: Bell + profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-slate-600 transition cursor-pointer">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
          {/* Orange dot */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-full hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-200 group select-none">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-sm leading-none select-none">👨‍💻</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#1A1A1A] tracking-tight">John Doe</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-slate-600 transition-colors" strokeWidth={2} />
          </div>
        </div>
      </div>
    </header>
  );
}
