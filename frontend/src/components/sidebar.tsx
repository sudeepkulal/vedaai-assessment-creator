'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveTab } from '@/redux/slices/assignmentSlice';
import { 
  Home, 
  Users, 
  BookOpen, 
  Sparkles, 
  Library, 
  Settings, 
  Plus
} from 'lucide-react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.assignment.activeTab);
  const router = useRouter();

  const assignmentsCount = useAppSelector((state) => state.assignment.items.length);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, badge: assignmentsCount > 0 ? assignmentsCount : undefined },
    { id: 'toolkit', label: 'AI Teacher\'s Toolkit', icon: Sparkles },
    { id: 'library', label: 'My Library', icon: Library },
  ];

  const handleNavClick = (id: string) => {
    dispatch(setActiveTab(id));
    if (id === 'assignments') {
      router.push('/assignments');
    } else {
      router.push('/assignments'); // Focus on assignments as per user instructions
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-white h-[calc(100vh-32px)] my-4 ml-4 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 justify-between shrink-0">
      {/* Upper Section */}
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="text-white font-extrabold text-2xl tracking-tighter">V</span>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">VedaAI</span>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => router.push('/assignments/create')}
          className="w-full h-12 rounded-[50px] bg-[#1E1E1E] text-white flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all duration-200 border-2 border-orange-500/25 hover:border-orange-500/40 text-sm font-semibold tracking-wide shadow-lg shadow-neutral-900/10 cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400/20 group-hover:scale-110 transition-transform" />
          <span>Create Assignment</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full h-12 flex items-center justify-between px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[#EBEBEB] text-[#1E1E1E] font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-800' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-bold text-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Block */}
      <div className="flex flex-col gap-4">
        {/* Settings button */}
        <button 
          onClick={() => handleNavClick('settings')}
          className={`w-full h-12 flex items-center gap-3 px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-[#EBEBEB] text-slate-800 font-semibold' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Settings</span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[20px] border border-gray-100/50">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-amber-200 to-orange-200 flex items-center justify-center border border-amber-300">
            {/* Styled cartoon character emoji similar to the Figma */}
            <span className="text-xl">🧑‍🏫</span>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[13px] font-bold text-slate-800 truncate leading-tight">Delhi Public School</span>
            <span className="text-[11px] text-gray-500 font-medium truncate mt-0.5">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
