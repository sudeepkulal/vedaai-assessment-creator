'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateAssignment } from '@/redux/slices/assignmentSlice';
import { fetchAssignmentById } from '@/lib/api';
import Header from '@/components/header';
import { 
  ArrowLeft, 
  Printer, 
  Eye, 
  GraduationCap, 
  FileText
} from 'lucide-react';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const assignmentId = params.id as string;
  
  const assignment = useAppSelector((state) => 
    state.assignment.items.find(item => String(item._id) === assignmentId)
  );

  const [isFetching, setIsFetching] = useState(!assignment);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    if (assignment) {
      setIsFetching(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsFetching(true);
      setFetchFailed(false);
      try {
        const data = await fetchAssignmentById(assignmentId);
        if (!cancelled) {
          dispatch(updateAssignment(data));
        }
      } catch {
        if (!cancelled) {
          setFetchFailed(true);
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, assignment, dispatch]);

  // Toggle state: 'teacher' (reveals answers and rubrics) vs 'student' (hides keys for student/print view)
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col select-none">
        <div className="hidden md:block"><Header breadcrumb="Assignments / Detail" showBack={true} /></div>
        <div className="md:hidden flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] tracking-tight pr-9">Assignment</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading assignment…</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex-1 flex flex-col select-none">
        <div className="hidden md:block"><Header breadcrumb="Assignments / Detail" showBack={true} /></div>
        <div className="md:hidden flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] tracking-tight pr-9">Assignment</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Assignment Not Found</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">
            {fetchFailed ? 'Could not load this assignment from the server.' : 'The assignment may have been deleted or the link is invalid.'}
          </p>
          <button
            onClick={() => router.push('/assignments')}
            className="mt-6 px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold cursor-pointer transition active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Group questions by section Title dynamically
  const sectionsMap: { 
    [key: string]: { 
      title: string; 
      instructions: string; 
      questions: typeof assignment.questions 
    } 
  } = {};

  assignment.questions.forEach((q) => {
    const title = q.sectionTitle || (
      q.type === 'multiple-choice' ? 'Section A: Multiple Choice Questions' :
      q.type === 'short-answer' ? 'Section B: Short Answer Questions' :
      'Section C: True or False Questions'
    );
    
    const instructions = q.sectionInstructions || (
      q.type === 'multiple-choice' ? 'Choose the correct option. Each question carries marks as indicated.' :
      q.type === 'short-answer' ? 'Answer the questions in detail. Each question carries marks as indicated.' :
      'State whether the statement is True or False.'
    );

    if (!sectionsMap[title]) {
      sectionsMap[title] = {
        title,
        instructions,
        questions: []
      };
    }
    sectionsMap[title].questions.push(q);
  });

  const sections = Object.values(sectionsMap);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      // Dynamic imports to prevent SSR compiler issues in Next.js
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const element = document.getElementById('exam-paper-sheet');
      if (!element) return;

      // Save original styles temporarily
      const originalBorderRadius = element.style.borderRadius;
      const originalShadow = element.style.boxShadow;
      const originalBorder = element.style.border;

      // Force standardized sharp borders for PDF canvas capture
      element.style.borderRadius = '0px';
      element.style.boxShadow = 'none';
      element.style.border = 'none';

      // Capture at double scale for crystal clear, high-resolution text
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Force standard hex/rgb color overrides on all Tailwind theme variables
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              --color-slate-50: #f8fafc !important;
              --color-slate-100: #f1f5f9 !important;
              --color-slate-200: #e2e8f0 !important;
              --color-slate-300: #cbd5e1 !important;
              --color-slate-400: #94a3b8 !important;
              --color-slate-500: #64748b !important;
              --color-slate-600: #475569 !important;
              --color-slate-700: #334155 !important;
              --color-slate-800: #1e293b !important;
              --color-slate-900: #0f172a !important;
              --color-gray-50: #f9fafb !important;
              --color-gray-100: #f3f4f6 !important;
              --color-gray-200: #e5e7eb !important;
              --color-gray-300: #d1d5db !important;
              --color-gray-400: #9ca3af !important;
              --color-emerald-50: #ecfdf5 !important;
              --color-emerald-100: #d1fae5 !important;
              --color-emerald-200: #a7f3d0 !important;
              --color-emerald-500: #10b981 !important;
              --color-emerald-600: #059669 !important;
              --color-emerald-700: #047857 !important;
              --color-emerald-900: #064e3b !important;
              --color-orange-50: #fff7ed !important;
              --color-orange-100: #ffedd5 !important;
              --color-orange-500: #f97316 !important;
              --color-orange-600: #ea580c !important;
              --color-orange-700: #c2410c !important;
              --color-red-50: #fef2f2 !important;
              --color-red-100: #fee2e2 !important;
              --color-red-700: #b91c1c !important;
              --color-amber-50: #fffbeb !important;
              --color-amber-100: #fef3c7 !important;
              --color-amber-500: #f59e0b !important;
              --color-amber-700: #b45309 !important;
              --color-amber-900: #78350f !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // 2. Traversal fallback to strip any hardcoded oklch/oklab/lab styles on elements
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el && el.style) {
              const computed = clonedDoc.defaultView?.getComputedStyle(el);
              if (computed) {
                const hasUnsupportedColor = (val: string | null | undefined) => {
                  if (!val) return false;
                  const v = val.toLowerCase();
                  return v.includes('oklch') || v.includes('oklab') || v.includes('lab') || v.includes('lch') || v.includes('color-mix') || v.includes('color(');
                };

                if (hasUnsupportedColor(computed.color)) {
                  el.style.color = '#1f2937';
                }
                if (hasUnsupportedColor(computed.backgroundColor)) {
                  el.style.backgroundColor = '#ffffff';
                }
                if (hasUnsupportedColor(computed.borderColor)) {
                  el.style.borderColor = '#e5e7eb';
                }
                if (hasUnsupportedColor(computed.borderTopColor)) {
                  el.style.borderTopColor = '#e5e7eb';
                }
                if (hasUnsupportedColor(computed.borderBottomColor)) {
                  el.style.borderBottomColor = '#e5e7eb';
                }
                if (hasUnsupportedColor(computed.borderLeftColor)) {
                  el.style.borderLeftColor = '#e5e7eb';
                }
                if (hasUnsupportedColor(computed.borderRightColor)) {
                  el.style.borderRightColor = '#e5e7eb';
                }
                if (hasUnsupportedColor(computed.boxShadow)) {
                  el.style.boxShadow = 'none';
                }
                if (hasUnsupportedColor(computed.backgroundImage)) {
                  el.style.backgroundImage = 'none';
                }
                if (hasUnsupportedColor(computed.stroke)) {
                  el.style.stroke = '#1f2937';
                }
                if (hasUnsupportedColor(computed.fill)) {
                  el.style.fill = 'currentColor';
                }
              }
            }
          }
        }
      });

      // Restore original container styles for browser display
      element.style.borderRadius = originalBorderRadius;
      element.style.boxShadow = originalShadow;
      element.style.border = originalBorder;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add Page 1
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Loop and split sections beautifully across new pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${assignment.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_assessment.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('[PDF Generation Error]: Failed to create document:', error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      {/* Custom Styles for Print Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm 20mm;
          }
          body, html {
            background-color: white !important;
            color: black !important;
            font-family: 'Inter', Georgia, serif !important;
            font-size: 12pt !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Reset parent layout containers to allow normal document page flow */
          body, html, main, .overflow-hidden, .overflow-y-auto, .h-screen, .h-full {
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-scroll-container {
            overflow: visible !important;
            height: auto !important;
            padding-bottom: 0 !important;
          }
          .print-paper-sheet {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-header-divider {
            border-bottom: 2px solid black !important;
          }
          /* Custom Alignment overrides for printing elements beautifully */
          #exam-paper-sheet .print-student-info {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            gap: 20px !important;
            width: 100% !important;
          }
          #exam-paper-sheet .print-student-info > div {
            display: flex !important;
            align-items: center !important;
            flex: 1 !important;
          }
          #exam-paper-sheet .print-question-header {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            width: 100% !important;
            gap: 15px !important;
          }
          #exam-paper-sheet .print-options-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
            width: 100% !important;
          }
        }

        /* Bypass html2canvas Tailwind v4 oklch/oklab parsing bugs by forcing standard hex/rgb values in computed styles */
        #exam-paper-sheet {
          background-color: #ffffff !important;
          color: #1e293b !important;
          border-color: #e5e7eb !important;
        }
        #exam-paper-sheet .text-slate-900 { color: #0f172a !important; }
        #exam-paper-sheet .text-slate-800 { color: #1e293b !important; }
        #exam-paper-sheet .text-slate-700 { color: #334155 !important; }
        #exam-paper-sheet .text-slate-600 { color: #475569 !important; }
        #exam-paper-sheet .text-slate-500 { color: #64748b !important; }
        #exam-paper-sheet .text-slate-400 { color: #94a3b8 !important; }
        #exam-paper-sheet .text-orange-600 { color: #ea580c !important; }
        #exam-paper-sheet .text-orange-700 { color: #c2410c !important; }
        #exam-paper-sheet .bg-slate-50 { background-color: #f8fafc !important; }
        #exam-paper-sheet .bg-\[\#F9FAFB\] { background-color: #f9fafb !important; }
        #exam-paper-sheet .bg-gray-50\/20 { background-color: rgba(249, 250, 251, 0.2) !important; }
        #exam-paper-sheet .bg-orange-50\/10 { background-color: rgba(255, 247, 237, 0.1) !important; }
        #exam-paper-sheet .bg-emerald-50 { background-color: #ecfdf5 !important; }
        #exam-paper-sheet .bg-emerald-50\/50 { background-color: rgba(236, 253, 245, 0.5) !important; }
        #exam-paper-sheet .bg-emerald-50\/20 { background-color: rgba(236, 253, 245, 0.2) !important; }
        #exam-paper-sheet .bg-emerald-500 { background-color: #10b981 !important; }
        #exam-paper-sheet .bg-orange-50 { background-color: #fff7ed !important; }
        #exam-paper-sheet .bg-red-50 { background-color: #fef2f2 !important; }
        #exam-paper-sheet .bg-amber-50\/20 { background-color: rgba(254, 243, 199, 0.2) !important; }
        #exam-paper-sheet .border-gray-100 { border-color: #f3f4f6 !important; }
        #exam-paper-sheet .border-gray-200\/80 { border-color: rgba(229, 231, 235, 0.8) !important; }
        #exam-paper-sheet .border-orange-500 { border-color: #f97316 !important; }
        #exam-paper-sheet .border-emerald-100 { border-color: #d1fae5 !important; }
        #exam-paper-sheet .border-emerald-200 { border-color: #a7f3d0 !important; }
        #exam-paper-sheet .border-emerald-600 { border-color: #059669 !important; }
        #exam-paper-sheet .border-emerald-100\/60 { border-color: rgba(209, 250, 229, 0.6) !important; }
        #exam-paper-sheet .border-orange-100 { border-color: #ffedd5 !important; }
        #exam-paper-sheet .border-red-100 { border-color: #fee2e2 !important; }
        #exam-paper-sheet .border-amber-100\/60 { border-color: rgba(253, 242, 203, 0.6) !important; }
        #exam-paper-sheet .border-gray-300 { border-color: #d1d5db !important; }
        #exam-paper-sheet .text-emerald-700 { color: #047857 !important; }
        #exam-paper-sheet .text-emerald-900 { color: #064e3b !important; }
        #exam-paper-sheet .text-orange-700 { color: #c2410c !important; }
        #exam-paper-sheet .text-red-700 { color: #b91c1c !important; }
        #exam-paper-sheet .text-amber-700 { color: #b45309 !important; }
        #exam-paper-sheet .text-amber-900 { color: #78350f !important; }
      `}} />

      {/* Desktop Header Navigation */}
      <div className="hidden md:block no-print">
        <Header breadcrumb={`Assignments / ${assignment.title}`} showBack={true} />
      </div>

      {/* Mobile: Back row + page title */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 no-print">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] tracking-tight pr-9 truncate">
          {assignment.title}
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:my-4 print-full-width">
        
        {/* Desktop: title block */}
        <div className="hidden md:flex items-center gap-4 mb-5 no-print">
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-tight">{assignment.title}</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Generated Assessment Sheet</p>
          </div>
        </div>

        {/* Action Row: Mode Toggles & Print */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6 px-4 md:px-0 no-print">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* View Mode Segmented Controls */}
            <div className="bg-gray-100/80 border border-gray-200/40 p-1 rounded-full flex items-center shadow-inner">
              <button
                onClick={() => setViewMode('teacher')}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'teacher' 
                    ? 'bg-[#1E1E1E] text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teacher Mode</span>
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'student' 
                    ? 'bg-[#1E1E1E] text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Student Mode</span>
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4.5 py-2.5 rounded-full bg-[#FF4F18] hover:bg-orange-600 disabled:bg-orange-400 text-white text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="px-4.5 py-2.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-slate-700 text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Paper</span>
            </button>
          </div>
        </div>

        {/* Exam paper / scrollable content */}
        <div className="flex-1 px-4 md:px-0 pb-28 md:pb-8 flex flex-col gap-6 print-scroll-container">
          
          {assignment.status === 'generating' ? (
            /* Loader State */
            <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-in fade-in duration-300">
              <div className="relative w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl animate-bounce">⚡</span>
                <span className="absolute inset-0 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"></span>
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Creating Assessment Questions...</h2>
              <p className="text-gray-500 font-medium text-xs md:text-sm max-w-sm mt-2 leading-relaxed">
                VedaAI is building a structured JSON question sheet, configuring grading rubrics, and saving details. Almost ready.
              </p>
            </div>
          ) : assignment.questions.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center select-none">
              <span className="text-3xl mb-4">📝</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">No Questions Generated</h2>
              <p className="text-gray-500 font-medium text-sm mt-2 max-w-sm">
                No questions exist inside this assignment. 
              </p>
            </div>
          ) : (
            /* Actual Printable Exam Page Paper */
            <div 
              id="exam-paper-sheet"
              className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-10 flex flex-col gap-8 max-w-4xl mx-auto w-full select-text print-paper-sheet"
            >
              {/* Official Academic Paper Header */}
              <div className="flex flex-col items-center text-center pb-6 border-b-2 border-slate-800/80 gap-3 select-none print-header-divider">
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">OFFICIAL EVALUATION SHEET</span>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight select-none">
                  {assignment.schoolName || 'DELHI PUBLIC SCHOOL'}
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest select-none">
                  {assignment.schoolCity || 'BOKARO STEEL CITY'} &nbsp;|&nbsp; SESSION 2026-27
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-slate-800 mt-2 select-none">
                  <span className="px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    GRADE: <span className="text-orange-600">{assignment.gradeLevel || 'Grade 10'}</span>
                  </span>
                  <span className="px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    TOPIC: <span className="text-orange-600 uppercase">{assignment.topic}</span>
                  </span>
                  <span className="px-3.5 py-1.5 bg-[#F9FAFB] rounded-full border border-slate-100">
                    DIFFICULTY: <span className="text-orange-600 uppercase">{assignment.difficulty || 'Medium'}</span>
                  </span>
                </div>
              </div>

              {/* Student Info Blank Input Box */}
              <div className="border border-dashed border-gray-200/80 rounded-2xl p-5 bg-gray-50/20 flex flex-col sm:flex-row gap-5 justify-between text-xs md:text-sm select-none print-page-break-avoid print-student-info">
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="font-extrabold text-slate-700 tracking-wide">Student Name:</span>
                  <div className="h-5 border-b-2 border-dashed border-gray-300 flex-1 min-w-[140px]"></div>
                </div>
                <div className="flex items-center gap-2.5 flex-1 sm:max-w-[200px]">
                  <span className="font-extrabold text-slate-700 tracking-wide">Roll Number:</span>
                  <div className="h-5 border-b-2 border-dashed border-gray-300 flex-1 min-w-[80px]"></div>
                </div>
                <div className="flex items-center gap-2.5 flex-1 sm:max-w-[160px]">
                  <span className="font-extrabold text-slate-700 tracking-wide">Section:</span>
                  <div className="h-5 border-b-2 border-dashed border-gray-300 flex-1 min-w-[60px]"></div>
                </div>
              </div>

              {/* Date & Sub-Meta details */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-gray-100 pb-4 select-none print-page-break-avoid">
                <span>Assigned: {assignment.assignedOn}</span>
                <span>Due Date: {assignment.dueDate}</span>
              </div>

              {/* Dynamic Assessment Sections */}
              <div className="flex flex-col gap-10">
                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-6">
                    
                    {/* Section Header Card */}
                    <div className="border-l-4 border-orange-500 pl-4 py-1.5 select-none bg-orange-50/10 pr-4 rounded-r-xl">
                      <h3 className="text-md md:text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {section.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed italic">
                        Instructions: {section.instructions}
                      </p>
                    </div>

                    {/* Section Questions Loop */}
                    <div className="flex flex-col gap-8">
                      {section.questions.map((question, qIdx) => {
                        const marks = question.marks || 2;
                        const difficulty = question.difficulty || assignment.difficulty || 'Medium';
                        
                        return (
                          <div 
                            key={qIdx} 
                            className="flex flex-col gap-3 relative pb-6 border-b border-gray-100 last:border-0 last:pb-0 print-page-break-avoid"
                          >
                            {/* Question Title Bar with badging */}
                            <div className="flex items-start justify-between gap-4 print-question-header">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-6.5 h-6.5 rounded-full bg-slate-900 border border-slate-950 text-[11px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm select-none">
                                  {qIdx + 1}
                                </div>
                                <p className="text-sm md:text-base font-bold text-slate-800 leading-snug tracking-tight">
                                  {question.questionText}
                                </p>
                              </div>

                              {/* Difficulty & Marks Row */}
                              <div className="flex items-center gap-1.5 shrink-0 select-none">
                                {/* Difficulty Badge */}
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${
                                  difficulty.toLowerCase() === 'easy'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : difficulty.toLowerCase() === 'hard'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                }`}>
                                  {difficulty}
                                </span>

                                {/* Marks indicator */}
                                <span className="text-xs font-extrabold text-slate-700 tracking-wider">
                                  [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
                                </span>
                              </div>
                            </div>

                            {/* Options Display (Multiple choice / True False) */}
                            {question.options && question.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9 pt-1 print-options-grid">
                                {question.options.map((option, oIdx) => {
                                  const isCorrect = option === question.correctAnswer;
                                  const optionLetter = String.fromCharCode(65 + oIdx); // A, B, C, D
                                  
                                  return (
                                    <div 
                                      key={oIdx}
                                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                        viewMode === 'teacher' && isCorrect 
                                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold shadow-sm' 
                                          : 'border-gray-100 bg-gray-50/20 text-slate-600'
                                      }`}
                                    >
                                      {/* Selection Indicator Circle */}
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold shrink-0 ${
                                        viewMode === 'teacher' && isCorrect 
                                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                                          : 'border-gray-300 bg-white text-slate-400 font-bold'
                                      }`}>
                                        {viewMode === 'teacher' && isCorrect ? '✓' : optionLetter}
                                      </div>
                                      <span className="text-xs md:text-sm font-medium">{option}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Blank line for writing answer in Student View (Short Answer only) */}
                            {viewMode === 'student' && question.type === 'short-answer' && (
                              <div className="pl-9 pt-2 flex flex-col gap-3.5 select-none w-full">
                                <div className="h-5 border-b border-dashed border-gray-200 w-full"></div>
                                <div className="h-5 border-b border-dashed border-gray-200 w-full"></div>
                                <div className="h-5 border-b border-dashed border-gray-200 w-full"></div>
                              </div>
                            )}

                            {/* Expandable/Revealed Grading Keys in Teacher Mode */}
                            {viewMode === 'teacher' && (
                              <div className="flex flex-col gap-2.5 pl-9 mt-2 select-text animate-in slide-in-from-top-1 duration-200">
                                
                                {/* Correct Answer */}
                                <div className="p-3.5 bg-emerald-50/20 border border-emerald-100/60 rounded-xl flex items-start gap-2.5">
                                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm">
                                    ✓
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Correct Key Answer</span>
                                    <p className="text-xs font-bold text-emerald-900 mt-1">{question.correctAnswer}</p>
                                  </div>
                                </div>

                                {/* Grading Rubrics */}
                                {question.rubric && (
                                  <div className="p-3.5 bg-amber-50/20 border border-amber-100/60 rounded-xl flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm">
                                      <GraduationCap className="w-3.5 h-3.5 text-white shrink-0" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">AI Suggested Grading Rubric</span>
                                      <p className="text-xs font-semibold text-amber-900 mt-1">{question.rubric}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Glassmorphic PDF Download Progress Loader */}
      {isDownloadingPDF && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center select-none animate-in scale-in duration-200">
            <div className="relative w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <span className="text-2xl animate-bounce">📄</span>
              <span className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></span>
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-2">Exporting PDF</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed px-2">
              VedaAI is rendering high-resolution exam sheets, structuring question pages, and formatting font layout. Almost ready.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
