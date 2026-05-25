'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import Header from '@/components/header';
import { 
  ArrowLeft, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  GraduationCap 
} from 'lucide-react';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  
  const assignment = useAppSelector((state) => 
    state.assignments.items.find(item => item._id === assignmentId)
  );

  if (!assignment) {
    return (
      <div className="flex-1 flex flex-col gap-6 md:my-4 select-none animate-in fade-in duration-200">
        <Header breadcrumb="Assignments / Detail" showBack={true} />
        <div className="flex-1 bg-white md:rounded-[28px] border border-gray-100 p-8 flex flex-col items-center justify-center h-[calc(100vh-130px)]">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight select-none">Assignment Not Found</h2>
          <p className="text-gray-500 font-medium text-sm select-none mt-2 max-w-sm text-center">
            The assignment may have been deleted or the link is invalid.
          </p>
          <button 
            onClick={() => router.push('/assignments')}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#1E1E1E] text-white hover:bg-neutral-800 text-sm font-semibold tracking-wide cursor-pointer transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 md:my-4 select-none">
      {/* Desktop Header */}
      <Header breadcrumb={`Assignments / ${assignment.title}`} showBack={true} />

      {/* Main Container Card */}
      <div className="flex-1 bg-white md:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 md:p-8 flex flex-col justify-start relative overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-130px)]">
        
        {/* Detail header block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight select-none flex items-center gap-2">
                {assignment.title}
              </h1>
              <p className="text-[12px] md:text-sm text-gray-500 font-medium select-none mt-0.5 leading-relaxed truncate max-w-lg">
                {assignment.description || 'AI-generated assessment set.'}
              </p>
            </div>
          </div>

          {/* Dates and School badge */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800 tracking-wide select-none">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-normal text-gray-500">Assigned:</span>
              <span>{assignment.assignedOn}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50/40 border border-orange-100/50 text-orange-700 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-normal text-orange-600">Due:</span>
              <span>{assignment.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Questions list */}
        <div className="flex-1 overflow-y-auto pt-6 pb-16 px-1 flex flex-col gap-6">
          {assignment.status === 'generating' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-in fade-in duration-300">
              <div className="relative w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl animate-bounce">⚡</span>
                <span className="absolute inset-0 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"></span>
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight select-none">Creating Assessment Questions...</h2>
              <p className="text-gray-500 font-medium text-xs md:text-sm max-w-sm mt-2 leading-relaxed">
                VedaAI is building a structured JSON question sheet, configuring grading rubrics, and saving details. Almost ready.
              </p>
            </div>
          ) : assignment.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none">
              <span className="text-3xl mb-4">📝</span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight select-none">No Questions Generated</h2>
              <p className="text-gray-500 font-medium text-sm mt-2 max-w-sm">
                No questions exist inside this assignment. 
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {assignment.questions.map((question, qIdx) => (
                <div 
                  key={qIdx}
                  className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.003)] flex flex-col gap-4 select-none relative overflow-hidden"
                >
                  {/* Top Bar with Question type */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-[11px] font-bold text-indigo-700">{qIdx + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 tracking-tight uppercase">
                        {question.type.replace('-', ' ')} Question
                      </h4>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider select-none">
                      AI Generated
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-base font-bold text-slate-800 leading-snug tracking-tight">
                    {question.questionText}
                  </p>

                  {/* Options (Multiple choice & True/False) */}
                  {question.options && question.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {question.options.map((option, oIdx) => {
                        const isCorrect = option === question.correctAnswer;
                        return (
                          <div 
                            key={oIdx}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all select-none ${
                              isCorrect 
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold shadow-sm' 
                                : 'border-gray-100/80 bg-gray-50/20 text-slate-600'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] shrink-0 ${
                              isCorrect ? 'bg-emerald-500 border-emerald-600 text-white font-bold' : 'border-gray-300'
                            }`}>
                              {isCorrect ? '✓' : ''}
                            </span>
                            <span className="text-sm">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answers & Rubrics for Short Answer */}
                  {question.type === 'short-answer' && (
                    <div className="flex flex-col gap-3 pt-2">
                      {/* Suggested Answer */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Correct Answer</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{question.correctAnswer}</p>
                      </div>
                    </div>
                  )}

                  {/* Rubric display */}
                  {question.rubric && (
                    <div className="p-4 bg-amber-50/20 border border-amber-100/50 rounded-2xl flex flex-col gap-1.5 mt-1 select-none">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Grading Criteria (AI Rubric)</span>
                      </span>
                      <p className="text-xs font-medium text-amber-800 leading-relaxed select-none">{question.rubric}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fading overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
}
