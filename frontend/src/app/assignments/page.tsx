'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteAssignment, setSearchQuery, setFilterBy, updateAssignment } from '@/redux/slices/assignmentSlice';
import { setProgress } from '@/redux/slices/socketSlice';
import { useSocket } from '@/app/providers';
import Header from '@/components/header';
import { 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  Plus, 
  Calendar, 
  Trash2, 
  Eye, 
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: assignments, searchQuery, filterBy } = useAppSelector((state) => state.assignment);
  const socketProgress = useAppSelector((state) => state.socket.progress);
  const socket = useSocket();
  
  // Track open state of dropdown action menus for each card ID
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Dynamic Socket.io room joins & progress listeners
  useEffect(() => {
    if (!socket) return;

    const generating = assignments.filter(item => item.status === 'generating');
    generating.forEach((assignment) => {
      socket.emit('join-assignment', assignment._id);
      console.log(`[Socket] Joined assignment room: ${assignment._id}`);
    });

    socket.on('generation-started', (data: { assignmentId: string }) => {
      console.log(`[Socket] Generation started: ${data.assignmentId}`);
      dispatch(setProgress(15));
    });

    socket.on('generation-progress', (data: { progress: number, assignmentId: string }) => {
      console.log(`[Socket] Generation progress: ${data.progress}% for ${data.assignmentId}`);
      dispatch(setProgress(data.progress));
    });

    socket.on('generation-completed', (data: { assignment: any, assignmentId: string }) => {
      console.log(`[Socket] Generation completed successfully: ${data.assignmentId}`);
      dispatch(setProgress(100));
      dispatch(updateAssignment(data.assignment));
    });

    socket.on('generation-failed', (data: { error: string, assignmentId: string }) => {
      console.error(`[Socket] Generation failed: ${data.assignmentId} error: ${data.error}`);
      dispatch(setProgress(100));
      const target = assignments.find(a => a._id === data.assignmentId);
      if (target) {
        dispatch(updateAssignment({ ...target, status: 'failed' }));
      }
    });

    return () => {
      socket.off('generation-started');
      socket.off('generation-progress');
      socket.off('generation-completed');
      socket.off('generation-failed');
    };
  }, [socket, assignments, dispatch]);

  // Filter & Search Logic
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterBy === 'All') return matchesSearch;
    if (filterBy === 'Draft') return matchesSearch && item.status === 'draft';
    if (filterBy === 'Completed') return matchesSearch && item.status === 'completed';
    if (filterBy === 'Generating') return matchesSearch && item.status === 'generating';
    return matchesSearch;
  });

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const handleView = (id: string) => {
    setActiveDropdownId(null);
    router.push(`/assignments/${id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteAssignment(id));
    setActiveDropdownId(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 md:my-4 select-none">
      {/* Desktop Navigation Top bar */}
      <Header breadcrumb="Assignments" />

      {/* Main Container Card */}
      <div className="flex-1 bg-white md:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 md:p-8 flex flex-col justify-start relative overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-130px)]">
        
        {/* View Details Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 animate-pulse"></span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight select-none">Assignments</h1>
              <p className="text-[12px] md:text-sm text-gray-500 font-medium select-none mt-0.5">Manage and create assignments for your classes.</p>
            </div>
          </div>
        </div>

        {/* Search and Filters panel */}
        <div className="flex flex-col sm:flex-row gap-3 py-5 shrink-0 select-none">
          {/* Filter dropdown */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={filterBy}
              onChange={(e) => dispatch(setFilterBy(e.target.value))}
              className="pl-11 pr-8 py-3.5 w-full sm:w-[160px] rounded-full border border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 text-slate-600 text-sm font-semibold select-none cursor-pointer focus:outline-none appearance-none transition-all"
            >
              <option value="All">Filter By</option>
              <option value="Completed">Completed</option>
              <option value="Generating">Generating</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Search assignment bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-12 pr-6 py-3.5 rounded-full border border-gray-100 focus:border-gray-200 text-sm font-medium focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative pb-10">
          {filteredAssignments.length === 0 ? (
            /* Empty State matching Image 2 & 5 */
            <div className="flex flex-col items-center justify-center py-6 md:py-12 text-center select-none animate-in fade-in duration-300">
              {/* High-Fidelity Custom Figma SVG Illustration */}
              <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 drop-shadow-md">
                {/* Background Shadow Circle */}
                <circle cx="120" cy="120" r="86" fill="#E5E7EB" fillOpacity="0.5"/>
                
                {/* Squiggle Curl (Upper Left) */}
                <path d="M 68 85 C 65 72, 78 52, 90 62 C 100 70, 75 92, 60 90" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                
                {/* 4-Point Sparkle Star (Lower Left) */}
                <path d="M 82 154 Q 87 154 87 149 Q 87 154 92 154 Q 87 154 87 159 Q 87 154 82 154 Z" fill="#0EA5E9"/>
                
                {/* Right side accent blue dot */}
                <circle cx="178" cy="124" r="5.5" fill="#2563EB"/>
                
                {/* Document Card Sheet */}
                <rect x="94" y="66" width="68" height="88" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                {/* Document lines */}
                <rect x="106" y="80" width="22" height="5" rx="2" fill="#1E293B"/>
                <rect x="106" y="93" width="44" height="3" rx="1.5" fill="#9CA3AF" fillOpacity="0.5"/>
                <rect x="106" y="101" width="44" height="3" rx="1.5" fill="#9CA3AF" fillOpacity="0.5"/>
                <rect x="106" y="109" width="44" height="3" rx="1.5" fill="#9CA3AF" fillOpacity="0.5"/>
                <rect x="106" y="117" width="28" height="3" rx="1.5" fill="#9CA3AF" fillOpacity="0.5"/>
                
                {/* Magnifying Glass with red X */}
                {/* Handle */}
                <line x1="146" y1="146" x2="178" y2="178" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round"/>
                <line x1="146" y1="146" x2="178" y2="178" stroke="#9CA3AF" strokeWidth="5.5" strokeLinecap="round"/>
                {/* Ring frame */}
                <circle cx="128" cy="128" r="26" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="7"/>
                {/* Red cross marks */}
                <line x1="119" y1="119" x2="137" y2="137" stroke="#EF4444" strokeWidth="5" strokeLinecap="round"/>
                <line x1="137" y1="119" x2="119" y2="137" stroke="#EF4444" strokeWidth="5" strokeLinecap="round"/>
              </svg>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight select-none">No assignments yet</h2>
              <p className="text-gray-500 font-medium text-xs md:text-sm max-w-[420px] select-none mt-2 px-4 leading-relaxed">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <button 
                onClick={() => router.push('/assignments/create')}
                className="mt-6 px-6 py-3 rounded-full bg-[#1E1E1E] text-white hover:bg-neutral-800 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          ) : (
            /* Cards Grid matching Image 1 & 3 */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-12 select-none">
              {filteredAssignments.map((assignment) => (
                <div 
                  key={assignment._id}
                  onClick={() => handleView(assignment._id)}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-[24px] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-200 cursor-pointer relative group flex flex-col justify-between h-[154px] select-none shadow-[0_4px_20px_rgb(0,0,0,0.005)]"
                >
                  {/* Card Header & 3-dot toggle */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-orange-600 transition-colors select-none">
                      {assignment.title}
                    </h3>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleDropdown(assignment._id, e)}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Absolute popup action menu */}
                      {activeDropdownId === assignment._id && (
                        <div className="absolute right-0 mt-1 w-[160px] bg-white border border-gray-100/80 rounded-[18px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] py-1.5 z-20 animate-slide-in-top">
                          <button
                            onClick={() => handleView(assignment._id)}
                            className="w-full px-4 py-2.5 text-slate-700 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 cursor-pointer text-left"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>View Assignment</span>
                          </button>
                          <hr className="border-gray-50" />
                          <button
                            onClick={(e) => handleDelete(assignment._id, e)}
                            className="w-full px-4 py-2.5 text-red-600 text-xs font-semibold flex items-center gap-2 hover:bg-red-50/50 cursor-pointer text-left"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Details bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold tracking-wide mt-4 border-t border-gray-50/70 pt-4 gap-2 select-none min-h-[40px]">
                    {assignment.status === 'generating' ? (
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center justify-between text-[11px] text-orange-600 font-extrabold">
                          <span className="flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 fill-orange-500/10 text-orange-500" />
                            <span>AI Generating Questions...</span>
                          </span>
                          <span>{socketProgress > 0 ? `${socketProgress}%` : 'Starting...'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 transition-all duration-300 rounded-full"
                            style={{ width: `${socketProgress > 0 ? socketProgress : 15}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : assignment.status === 'failed' ? (
                      <div className="flex items-center gap-1.5 text-red-600 font-extrabold text-[11px]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Generation Failed. Try deleting and re-creating.</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-[#1E1E1E]">
                          <span className="font-normal text-gray-500">Assigned on :</span>
                          <span>{assignment.assignedOn}</span>
                        </div>

                        {assignment.dueDate && (
                          <div className="flex items-center gap-1 text-[#1E1E1E]">
                            <span className="font-normal text-gray-500">Due :</span>
                            <span>{assignment.dueDate}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fading grid bottom mask */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>

        {/* Floating Add Button for Mobile Quick FAB matching Image 2/3 */}
        <button 
          onClick={() => router.push('/assignments/create')}
          className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full bg-white text-[#FF4F18] shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center border border-orange-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-30 font-bold"
        >
          <span className="text-2xl font-semibold leading-none">+</span>
        </button>

        {/* Desktop Absolute bottom center "+ Create Assignment" pill button */}
        {filteredAssignments.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:block">
            <button 
              onClick={() => router.push('/assignments/create')}
              className="px-6 py-3 rounded-full bg-[#1E1E1E] text-white hover:bg-neutral-800 text-sm font-semibold tracking-wide shadow-xl flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Create Assignment</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
