'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { addAssignment } from '@/redux/slices/assignmentSlice';
import { createAssignment } from '@/lib/api';
import Header from '@/components/header';
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Sliders,
  HelpCircle,
  Calendar,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const assignmentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters long' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level' }),
  difficulty: z.string().min(1, { message: 'Please select a difficulty level' }),
  dueDate: z.string()
    .min(1, { message: 'Please select a due date' })
    .refine((val) => {
      const selected = new Date(val).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return selected >= today;
    }, { message: 'Due date cannot be in the past' }),
  instructions: z.string().optional(),
  configs: z.array(
    z.object({
      type: z.enum(['multiple-choice', 'short-answer', 'true-false']),
      count: z.number({ message: 'Must be a number' })
        .min(1, { message: 'Minimum 1 question required' })
        .max(20, { message: 'Maximum 20 questions' }),
      marks: z.number({ message: 'Must be a number' })
        .min(1, { message: 'Marks must be positive' }),
    })
  ).min(1, { message: 'At least one question type configuration is required' }),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      topic: '',
      gradeLevel: 'Grade 10',
      difficulty: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      instructions: '',
      configs: [{ type: 'multiple-choice', count: 5, marks: 2 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'configs' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setUploadedFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setUploadedFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    setIsGenerating(true);
    setSubmitError(null);
    try {
      const created = await createAssignment({
        title: data.title,
        topic: data.topic,
        gradeLevel: data.gradeLevel,
        difficulty: data.difficulty,
        dueDate: data.dueDate,
        configs: data.configs,
        instructions: data.instructions,
      });
      dispatch(addAssignment(created));
      router.push('/assignments');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create assignment. Is the backend running?'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col select-none">
      {/* ── Desktop-only top header bar ── */}
      <div className="hidden md:block">
        <Header breadcrumb="Assignment" showBack={true} />
      </div>

      {/* ── Page Content ── */}
      <div className="flex-1 flex flex-col md:my-4">

        {/* ── Mobile: Back row + Page title ── */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] tracking-tight pr-9">
            Create Assignment
          </h1>
        </div>

        {/* ── Desktop: Page title block ── */}
        <div className="hidden md:flex items-center gap-4 mb-5 px-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-gray-50 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight leading-tight flex items-center gap-2">
              Create Assignment
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Let AI custom craft professional student assessments in seconds.</p>
          </div>
        </div>

        {/* ── Form Card (white on gray) ── */}
        <div className="mx-4 md:mx-0 bg-white rounded-[20px] md:rounded-[28px] border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 md:p-8 flex flex-col gap-6 max-w-3xl">

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
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.title ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                } text-sm font-medium focus:outline-none bg-[#FAFAFA] transition-all placeholder:text-gray-400`}
              />
              {/* Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {['Electricity Quiz', 'Biology Homework', 'Math Final', 'World War II Test'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('title', t, { shouldValidate: true })}
                    className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-full transition cursor-pointer border border-transparent hover:border-orange-100"
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.title && (
                <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.title.message}</span>
                </span>
              )}
            </div>

            {/* AI Focus Topic */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>AI Focus Topic</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ohm's Law and Resistivity relations"
                {...register('topic')}
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.topic ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                } text-sm font-medium focus:outline-none bg-[#FAFAFA] transition-all placeholder:text-gray-400`}
              />
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {["Ohm's Law & Resistance", 'Cell Division & Mitosis', 'Quadratic Equations', 'French Revolution'].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setValue('topic', topic, { shouldValidate: true })}
                    className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-full transition cursor-pointer border border-transparent hover:border-orange-100"
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {errors.topic && (
                <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.topic.message}</span>
                </span>
              )}
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-gray-400" />
                <span>Reference Context File (Optional)</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-[18px] p-5 text-center cursor-pointer hover:bg-gray-50 transition-all flex flex-col items-center gap-2 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-slate-400 group-hover:scale-105 transition-transform" />
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-slate-800">{uploadedFile.name}</span>
                    <span className="text-xs text-slate-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="text-xs font-bold text-red-500 hover:underline mt-1 cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-slate-600">Drag & drop files here, or click to browse</span>
                    <span className="text-xs text-slate-400">Supports PDF, DOCX, TXT up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Grade Level */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gray-400" />
                  <span>Grade Level</span>
                </label>
                <select
                  {...register('gradeLevel')}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-300 transition cursor-pointer appearance-none"
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
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] text-sm font-semibold text-slate-700 focus:outline-none focus:border-gray-300 transition cursor-pointer appearance-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
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
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.dueDate ? 'border-red-400' : 'border-gray-200 focus:border-gray-300'
                  } text-sm font-semibold text-slate-700 focus:outline-none bg-[#FAFAFA] transition-all`}
                />
                {errors.dueDate && (
                  <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.dueDate.message}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Question Configurations */}
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>Question Configurations</span>
                </label>
                <button
                  type="button"
                  onClick={() => append({ type: 'multiple-choice', count: 5, marks: 2 })}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Type</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAFAFA] border border-gray-200 p-4 rounded-[18px] items-start"
                  >
                    {/* Question Type */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Question Type</span>
                      <select
                        {...register(`configs.${index}.type` as const)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="true-false">True or False</option>
                      </select>
                    </div>

                    {/* Count */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Count</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 5"
                        {...register(`configs.${index}.count` as const, { valueAsNumber: true })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                          errors.configs?.[index]?.count
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-gray-200 bg-white focus:border-gray-300'
                        }`}
                      />
                      {errors.configs?.[index]?.count && (
                        <span className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.configs[index]?.count?.message}
                        </span>
                      )}
                    </div>

                    {/* Marks + Delete */}
                    <div className="flex items-end gap-2">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Marks</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 2"
                          {...register(`configs.${index}.marks` as const, { valueAsNumber: true })}
                          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                            errors.configs?.[index]?.marks
                              ? 'border-red-400 bg-red-50/20'
                              : 'border-gray-200 bg-white focus:border-gray-300'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl hover:bg-red-50 transition cursor-pointer mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                <span>Additional Instructions (Optional)</span>
              </label>
              <textarea
                placeholder="e.g. Focus on definitions and real-world examples..."
                {...register('instructions')}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-300 text-sm font-medium focus:outline-none bg-[#FAFAFA] transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 sm:flex-none px-7 py-3 rounded-full bg-[#1A1A1A] text-white hover:bg-neutral-800 disabled:bg-neutral-400 text-sm font-semibold transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Generate AI Assessment</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Bottom spacer for mobile */}
        <div className="h-28 md:h-8" />
      </div>
    </div>
  );
}
