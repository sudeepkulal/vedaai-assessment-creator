'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { addAssignment, updateAssignment } from '@/redux/slices/assignmentSlice';
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
  AlertCircle
} from 'lucide-react';

// Form validation Zod schema
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
  ).min(1, { message: 'At least one question type configuration is required' })
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
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
      configs: [
        { type: 'multiple-choice', count: 5, marks: 2 }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'configs',
  });

  // Handle optional file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: AssignmentFormValues) => {
    setIsGenerating(true);
    
    // 1. Create a "generating" status assignment
    const newId = Math.random().toString(36).substring(2, 9);
    const formattedAssignedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const formattedDueDate = new Date(data.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-');

    const tempAssignment = {
      _id: newId,
      title: data.title,
      topic: data.topic,
      gradeLevel: data.gradeLevel,
      difficulty: data.difficulty,
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

    // Redirect to assignments list immediately so user can see it generating
    router.push('/assignments');

    // 2. Simulate AI background generation task over Socket/Queue (2.5 seconds)
    setTimeout(() => {
      // Build mock questions dynamically based on field configurations
      const questionsList: any[] = [];
      data.configs.forEach((config) => {
        const sectionTitles = {
          'multiple-choice': 'Section A: Multiple Choice Questions',
          'short-answer': 'Section B: Short Answer Questions',
          'true-false': 'Section C: True or False Questions'
        };
        const sectionInstructions = {
          'multiple-choice': `Choose the correct option. Each question carries ${config.marks} marks.`,
          'short-answer': `Answer in detail. Each question carries ${config.marks} marks.`,
          'true-false': `Select True or False. Each question carries ${config.marks} marks.`
        };

        for (let i = 0; i < config.count; i++) {
          if (config.type === 'multiple-choice') {
            questionsList.push({
              questionText: `Which of the following describes the key principle of ${data.topic}? (Part ${i + 1})`,
              type: 'multiple-choice' as const,
              options: ['Option A (Correct answer representation)', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A (Correct answer representation)',
              rubric: `Assign full ${config.marks} marks if the correct option is selected.`,
              marks: config.marks,
              difficulty: data.difficulty,
              sectionTitle: sectionTitles['multiple-choice'],
              sectionInstructions: sectionInstructions['multiple-choice']
            });
          } else if (config.type === 'short-answer') {
            questionsList.push({
              questionText: `Explain the fundamental concept of ${data.topic} and discuss its practical applications. (Part ${i + 1})`,
              type: 'short-answer' as const,
              correctAnswer: 'The response should focus on main theoretical models and active implementation use-cases.',
              rubric: `Grading scales up to ${config.marks} marks based on the coverage of applications and principles.`,
              marks: config.marks,
              difficulty: data.difficulty,
              sectionTitle: sectionTitles['short-answer'],
              sectionInstructions: sectionInstructions['short-answer']
            });
          } else if (config.type === 'true-false') {
            questionsList.push({
              questionText: `Is the core theory of ${data.topic} applicable under standard normal conditions? (Part ${i + 1})`,
              type: 'true-false' as const,
              options: ['True', 'False'],
              correctAnswer: 'True',
              rubric: `Assign ${config.marks} marks if True is selected.`,
              marks: config.marks,
              difficulty: data.difficulty,
              sectionTitle: sectionTitles['true-false'],
              sectionInstructions: sectionInstructions['true-false']
            });
          }
        }
      });

      const completedAssignment = {
        ...tempAssignment,
        status: 'completed' as const,
        questions: questionsList,
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
            type="button"
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pt-6 pb-16 px-1 flex flex-col gap-6 max-w-3xl">
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
              <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title.message}</span>
              </span>
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
              <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.topic.message}</span>
              </span>
            )}
          </div>

          {/* Optional File Upload (Figma-Matched Element) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span>Reference Context File (Optional)</span>
            </label>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-[20px] p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden" 
              />
              <Upload className="w-8 h-8 text-slate-400 group-hover:scale-105 transition-transform" />
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
                  <span className="text-sm font-bold text-slate-700">Drag & drop context files here, or click to browse</span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5">Supports PDF, DOCX, TXT up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.dueDate.message}</span>
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Question Configurations (useFieldArray) */}
          <div className="flex flex-col gap-4 border-t border-gray-50 pt-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                <span>Question Configurations</span>
              </label>
              <button
                type="button"
                onClick={() => append({ type: 'multiple-choice', count: 5, marks: 2 })}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1.5 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-50/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question Type</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div 
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 border border-gray-100 p-4 rounded-[20px] items-center animate-in slide-in-from-top-2 duration-200"
                >
                  {/* Question Type */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Question Type</span>
                    <select
                      {...register(`configs.${index}.type` as const)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="short-answer">Short Answer</option>
                      <option value="true-false">True or False</option>
                    </select>
                  </div>

                  {/* Question Count */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Count</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      {...register(`configs.${index}.count` as const, { valueAsNumber: true })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                        errors.configs?.[index]?.count 
                          ? 'border-red-400 focus:border-red-400 bg-red-50/10' 
                          : 'border-gray-200 focus:border-gray-300'
                      }`}
                    />
                    {errors.configs?.[index]?.count && (
                      <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.configs[index]?.count?.message}</span>
                      </span>
                    )}
                  </div>

                  {/* Question Marks & Delete Button */}
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Marks per Question</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 2"
                        {...register(`configs.${index}.marks` as const, { valueAsNumber: true })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                          errors.configs?.[index]?.marks 
                            ? 'border-red-400 focus:border-red-400 bg-red-50/10' 
                            : 'border-gray-200 focus:border-gray-300'
                        }`}
                      />
                      {errors.configs?.[index]?.marks && (
                        <span className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.configs[index]?.marks?.message}</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-red-500 disabled:text-gray-200 rounded-xl hover:bg-red-50/30 transition cursor-pointer"
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
              placeholder="e.g. Focus on definitions and real-world examples. Add at least one diagram reference if applicable."
              {...register('instructions')}
              rows={4}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 focus:border-gray-200 text-sm font-medium focus:outline-none bg-gray-50/20 transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50 shrink-0">
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
