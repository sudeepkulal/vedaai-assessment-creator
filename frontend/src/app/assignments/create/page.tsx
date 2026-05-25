'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { addAssignment, updateAssignment } from '@/store/slices/assignmentsSlice';
import Header from '@/components/header';
import { 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  Sliders, 
  HelpCircle, 
  Calendar 
} from 'lucide-react';

const assignmentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters long' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level' }),
  difficulty: z.string().min(1, { message: 'Please select a difficulty level' }),
  questionCount: z.number().min(3, { message: 'Minimum 3 questions required' }).max(20, { message: 'Maximum 20 questions' }),
  dueDate: z.string().min(1, { message: 'Please select a due date' }),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      topic: '',
      gradeLevel: 'Grade 10',
      difficulty: 'Medium',
      questionCount: 5,
      dueDate: '2025-06-21',
    },
  });

  const onSubmit = (data: AssignmentFormValues) => {
    setIsGenerating(true);
    
    // 1. Create a "generating" status assignment
    const newId = Math.random().toString(36).substring(2, 9);
    
    const formattedAssignedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const formattedDueDate = new Date(data.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-');

    const tempAssignment = {
      _id: newId,
      title: data.title,
      description: `Generated AI assignment on ${data.topic}. Grade: ${data.gradeLevel}, Difficulty: ${data.difficulty}.`,
      status: 'generating' as const,
      assignedOn: formattedAssignedOn,
      dueDate: formattedDueDate,
      schoolName: 'Delhi Public School',
      schoolCity: 'Bokaro Steel City',
      questions: [],
    };

    // Dispatch to Redux list
    dispatch(addAssignment(tempAssignment));

    // Redirect to home/assignments immediately so user can see it generating
    router.push('/assignments');

    // 2. Simulate AI background generation task over Socket/Queue (2.5 seconds)
    setTimeout(() => {
      // Mock generated questions from Gemini
      const mockQuestions = [
        {
          questionText: `What is the primary formula related to ${data.topic}?`,
          type: 'multiple-choice' as const,
          options: ['V = I * R', 'P = V * I', 'F = m * a', 'E = m * c²'],
          correctAnswer: 'V = I * R',
          rubric: 'Assign 1 mark if selected correctly.',
        },
        {
          questionText: `Explain the fundamental concept of ${data.topic} and list its real-world applications.`,
          type: 'short-answer' as const,
          correctAnswer: 'Answers should cover basic physical laws and active application scenarios.',
          rubric: 'Assign up to 3 marks based on depth of coverage.',
        },
        {
          questionText: `Is the net force proportional to acceleration?`,
          type: 'true-false' as const,
          options: ['True', 'False'],
          correctAnswer: 'True',
          rubric: 'Assign 1 mark if true selected.',
        }
      ];

      const completedAssignment = {
        ...tempAssignment,
        status: 'completed' as const,
        questions: mockQuestions,
      };

      // Dispatch update to Redux store
      dispatch(updateAssignment(completedAssignment));
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 md:my-4 select-none">
      {/* Desktop Header */}
      <Header breadcrumb="Assignments / New" showBack={true} />

      {/* Main Container Card */}
      <div className="flex-1 bg-white md:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 md:p-8 flex flex-col justify-start relative overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-130px)]">
        
        {/* Navigation & Title header */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-50 shrink-0">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight select-none flex items-center gap-2">
              Create Assignment
            </h1>
            <p className="text-[12px] md:text-sm text-gray-500 font-medium select-none mt-0.5">Let AI custom craft professional student assessments in seconds.</p>
          </div>
        </div>

        {/* Scrollable Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pt-6 pb-16 px-1 flex flex-col gap-6 max-w-2xl">
          {/* Assignment Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span>Assignment Title</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity - Part A"
              {...register('title')}
              className={`w-full px-5 py-3.5 rounded-2xl border ${
                errors.title ? 'border-red-400 focus:border-red-400' : 'border-gray-100 focus:border-gray-200'
              } text-sm font-medium focus:outline-none bg-gray-50/20 transition-all placeholder:text-gray-400`}
            />
            {errors.title && (
              <span className="text-red-500 text-xs font-semibold pl-1">{errors.title.message}</span>
            )}
          </div>

          {/* AI Focus Topic */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-orange-400/10" />
              <span>AI Focus Topic</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ohm's Law and Resistivity relations"
              {...register('topic')}
              className={`w-full px-5 py-3.5 rounded-2xl border ${
                errors.topic ? 'border-red-400 focus:border-red-400' : 'border-gray-100 focus:border-gray-200'
              } text-sm font-medium focus:outline-none bg-gray-50/20 transition-all placeholder:text-gray-400`}
            />
            {errors.topic && (
              <span className="text-red-500 text-xs font-semibold pl-1">{errors.topic.message}</span>
            )}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grade Level */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-gray-400" />
                <span>Grade Level</span>
              </label>
              <select
                {...register('gradeLevel')}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-200 transition cursor-pointer appearance-none"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-gray-400" />
                <span>Difficulty</span>
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-200 transition cursor-pointer appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Question Count & Due Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                <span>Number of Questions</span>
              </label>
              <input
                type="number"
                min="3"
                max="20"
                {...register('questionCount', { valueAsNumber: true })}
                className={`w-full px-5 py-3.5 rounded-2xl border ${
                  errors.questionCount ? 'border-red-400 focus:border-red-400' : 'border-gray-100 focus:border-gray-200'
                } text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-200 transition-all`}
              />
              {errors.questionCount && (
                <span className="text-red-500 text-xs font-semibold pl-1">{errors.questionCount.message}</span>
              )}
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className={`w-full px-5 py-3.5 rounded-2xl border ${
                  errors.dueDate ? 'border-red-400 focus:border-red-400' : 'border-gray-100 focus:border-gray-200'
                } text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-200 transition-all`}
              />
              {errors.dueDate && (
                <span className="text-red-500 text-xs font-semibold pl-1">{errors.dueDate.message}</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-full border border-gray-100 hover:bg-gray-50 text-slate-700 text-sm font-semibold tracking-wide transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-2 md:flex-initial px-8 py-3.5 rounded-full bg-[#1E1E1E] text-white hover:bg-neutral-800 disabled:bg-neutral-400 text-sm font-semibold tracking-wide transition shadow-lg shadow-neutral-900/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400/20" />
              <span>Generate AI Assessment</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
