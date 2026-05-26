'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteAssignment, setAssignments, setSearchQuery, setFilterBy, updateAssignment } from '@/redux/slices/assignmentSlice';
import { setProgress } from '@/redux/slices/socketSlice';
import { useSocket } from '@/app/providers';
import { fetchAssignments, deleteAssignmentById, normalizeAssignment } from '@/lib/api';
import Header from '@/components/header';
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Filter,
} from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: assignments, searchQuery, filterBy } = useAppSelector((state) => state.assignment);
  const socketProgress = useAppSelector((state) => state.socket.progress);
  const socket = useSocket();

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const list = await fetchAssignments();
        if (!cancelled) dispatch(setAssignments(list));
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load assignments. Is the backend running?'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    const generating = assignments.filter(item => item.status === 'generating');
    generating.forEach((assignment) => {
      socket.emit('join-assignment', String(assignment._id));
    });

    socket.on('generation-started', () => { dispatch(setProgress(15)); });
    socket.on('generation-progress', (data: { progress: number }) => { dispatch(setProgress(data.progress)); });
    socket.on('generation-completed', (data: { assignment: Record<string, unknown> }) => {
      dispatch(setProgress(100));
      dispatch(updateAssignment(normalizeAssignment(data.assignment)));
    });
    socket.on('generation-failed', (data: { error: string, assignmentId: string }) => {
      dispatch(setProgress(100));
      const target = assignments.find(a => a._id === data.assignmentId);
      if (target) dispatch(updateAssignment({ ...target, status: 'failed' }));
    });

    return () => {
      socket.off('generation-started');
      socket.off('generation-progress');
      socket.off('generation-completed');
      socket.off('generation-failed');
    };
  }, [socket, assignments, dispatch]);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAssignmentById(id);
      dispatch(deleteAssignment(id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete assignment.');
    }
    setActiveDropdownId(null);
  };

  // Close dropdown on outside click (optimized for both desktop & mobile touch events)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.dropdown-container')) {
        return;
      }
      setActiveDropdownId(null);
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col select-none">
      {/* ── Desktop-only top header bar ── */}
      <div className="hidden md:block">
        <Header breadcrumb="Assignment" />
      </div>

      {/* ── Page Content ── */}
      <div className="flex-1 flex flex-col md:my-4">

        {/* ── Mobile: Back row + Page title ── */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] tracking-tight pr-9">
            Assignments
          </h1>
        </div>

        {/* ── Desktop: Page title block ── */}
        <div className="hidden md:flex items-center gap-3 mb-5 px-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-tight">Assignments</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Manage and create assignments for your classes.</p>
          </div>
        </div>

        {/* ── Filter + Search row ── */}
        <div className="flex items-center gap-3 px-4 md:px-0 mb-4">
          {/* Filter */}
          <div className="relative flex items-center shrink-0">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select
              value={filterBy}
              onChange={(e) => dispatch(setFilterBy(e.target.value))}
              className="pl-8 pr-3 py-3 w-[110px] md:w-[140px] rounded-full bg-white border border-gray-200 text-slate-600 text-sm font-medium cursor-pointer focus:outline-none appearance-none transition-all shadow-sm"
            >
              <option value="All">Filter</option>
              <option value="Completed">Completed</option>
              <option value="Generating">Generating</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Name"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:border-gray-300 transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 px-4 md:px-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600">Loading assignments…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h2 className="text-lg font-black text-slate-800">Could not load assignments</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-md">{loadError}</p>
              <p className="text-gray-400 text-xs mt-2">Start the backend with MongoDB and Redis, then refresh.</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-8 md:py-16 text-center select-none animate-fade-up">
              {/* Illustration matching Figma */}
              <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px] mb-4">
                <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Gray circle bg */}
                  <circle cx="120" cy="120" r="90" fill="#E5E7EB" fillOpacity="0.6" />
                  {/* Squiggle upper left */}
                  <path d="M68 85C65 72 78 52 90 62C100 70 75 92 60 90" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  {/* Blue sparkle star lower left */}
                  <path d="M82 154 Q87 154 87 149 Q87 154 92 154 Q87 154 87 159 Q87 154 82 154Z" fill="#3B82F6"/>
                  {/* Right blue dot */}
                  <circle cx="178" cy="124" r="5.5" fill="#2563EB"/>
                  {/* Document white card */}
                  <rect x="88" y="58" width="74" height="96" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                  {/* Dark top bar on doc */}
                  <rect x="100" y="74" width="28" height="6" rx="3" fill="#1E293B"/>
                  {/* Gray lines */}
                  <rect x="100" y="89" width="50" height="3.5" rx="1.5" fill="#D1D5DB"/>
                  <rect x="100" y="99" width="50" height="3.5" rx="1.5" fill="#D1D5DB"/>
                  <rect x="100" y="109" width="50" height="3.5" rx="1.5" fill="#D1D5DB"/>
                  <rect x="100" y="119" width="34" height="3.5" rx="1.5" fill="#D1D5DB"/>
                  {/* Small floating card top right */}
                  <rect x="152" y="62" width="36" height="22" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                  <rect x="158" y="69" width="14" height="3" rx="1.5" fill="#D1D5DB"/>
                  <rect x="158" y="75" width="22" height="2.5" rx="1" fill="#E5E7EB"/>
                  {/* Magnifying glass handle */}
                  <line x1="148" y1="148" x2="178" y2="178" stroke="#D1D5DB" strokeWidth="12" strokeLinecap="round"/>
                  <line x1="148" y1="148" x2="178" y2="178" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round"/>
                  {/* Magnifying glass ring — light purple/gray */}
                  <circle cx="128" cy="128" r="28" fill="#F3F4F6" stroke="#C4B5FD" strokeWidth="8"/>
                  {/* Red X */}
                  <line x1="118" y1="118" x2="138" y2="138" stroke="#EF4444" strokeWidth="5.5" strokeLinecap="round"/>
                  <line x1="138" y1="118" x2="118" y2="138" stroke="#EF4444" strokeWidth="5.5" strokeLinecap="round"/>
                </svg>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight">No assignments yet</h2>
              <p className="text-gray-500 text-sm max-w-[340px] mt-2 px-4 leading-relaxed">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <button
                onClick={() => router.push('/assignments/create')}
                className="mt-6 px-6 py-3.5 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold flex items-center gap-2 shadow-lg active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          ) : (
            /* ── Cards Grid ── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 pb-28 md:pb-8">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  onClick={() => handleView(assignment._id)}
                  className="bg-white border border-gray-200 rounded-[20px] p-5 cursor-pointer relative group flex flex-col justify-between min-h-[120px] active:scale-[0.99] transition-all duration-150 shadow-sm hover:shadow-md select-none overflow-visible"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-snug flex-1">
                      {assignment.title}
                    </h3>

                    <div className="relative shrink-0 dropdown-container" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleDropdown(assignment._id, e)}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdownId === assignment._id && (
                        <div className="absolute right-0 mt-1 w-[168px] bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-50 animate-slide-in-top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(assignment._id);
                            }}
                            className="w-full px-4 py-2.5 text-slate-700 text-sm font-medium flex items-center gap-2.5 hover:bg-gray-50 cursor-pointer text-left"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>View</span>
                          </button>
                          <hr className="border-gray-100 my-1" />
                          <button
                            onClick={(e) => handleDelete(assignment._id, e)}
                            className="w-full px-4 py-2.5 text-red-600 text-sm font-medium flex items-center gap-2.5 hover:bg-red-50 cursor-pointer text-left"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold mt-4 border-t border-gray-100 pt-3 gap-2">
                    {assignment.status === 'generating' ? (
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center justify-between text-[11px] text-orange-600 font-extrabold">
                          <span className="flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Generating Questions...</span>
                          </span>
                          <span>{socketProgress > 0 ? `${socketProgress}%` : 'Starting...'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full"
                            style={{ width: `${socketProgress > 0 ? socketProgress : 15}%` }}
                          />
                        </div>
                      </div>
                    ) : assignment.status === 'failed' ? (
                      <div className="flex items-center gap-1.5 text-red-600 font-extrabold text-[11px]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Generation Failed. Try deleting and re-creating.</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[#1A1A1A]">
                          <span className="font-normal text-gray-500">Assigned on : </span>
                          {assignment.assignedOn}
                        </span>
                        {assignment.dueDate && (
                          <span className="text-[#1A1A1A]">
                            <span className="font-normal text-gray-500">Due : </span>
                            {assignment.dueDate}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating + FAB (mobile) ── */}
      <button
        onClick={() => router.push('/assignments/create')}
        className="md:hidden fixed bottom-24 right-5 w-12 h-12 rounded-full bg-white text-orange-500 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center justify-center border border-gray-100 active:scale-95 transition-all z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* ── Desktop bottom center CTA ── */}
      {filteredAssignments.length > 0 && (
        <div className="hidden md:flex justify-center pb-6">
          <button
            onClick={() => router.push('/assignments/create')}
            className="px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold flex items-center gap-2 shadow-xl hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Create Assignment</span>
          </button>
        </div>
      )}
    </div>
  );
}
