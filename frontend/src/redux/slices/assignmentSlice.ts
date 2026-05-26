import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  questionText: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  correctAnswer: string;
  rubric?: string;
  marks?: number;
  difficulty?: string;
  sectionTitle?: string;
  sectionInstructions?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
  description?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  assignedOn: string;
  dueDate: string;
  schoolName: string;
  schoolCity: string;
  questions: Question[];
  instructions?: string;
}

interface AssignmentForm {
  title: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
}

interface AssignmentState {
  items: Assignment[];
  formData: AssignmentForm;
  dueDate: string;
  questionTypes: string[];
  instructions: string;
  searchQuery: string;
  filterBy: string;
  activeTab: string;
}

const initialState: AssignmentState = {
  items: [],
  formData: {
    title: '',
    topic: '',
    gradeLevel: 'Grade 10',
    difficulty: 'Medium',
  },
  dueDate: '2025-06-21',
  questionTypes: ['multiple-choice', 'short-answer', 'true-false'],
  instructions: '',
  searchQuery: '',
  filterBy: 'All',
  activeTab: 'assignments',
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssignments(state, action: PayloadAction<Assignment[]>) {
      state.items = action.payload;
    },
    addAssignment(state, action: PayloadAction<Assignment>) {
      state.items.unshift(action.payload);
    },
    deleteAssignment(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    updateAssignment(state, action: PayloadAction<Assignment>) {
      const id = String(action.payload._id);
      const index = state.items.findIndex(item => String(item._id) === id);
      if (index !== -1) {
        state.items[index] = { ...action.payload, _id: id };
      } else {
        state.items.unshift({ ...action.payload, _id: id });
      }
    },
    setFormData(state, action: PayloadAction<Partial<AssignmentForm>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setDueDate(state, action: PayloadAction<string>) {
      state.dueDate = action.payload;
    },
    setQuestionTypes(state, action: PayloadAction<string[]>) {
      state.questionTypes = action.payload;
    },
    setInstructions(state, action: PayloadAction<string>) {
      state.instructions = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilterBy(state, action: PayloadAction<string>) {
      state.filterBy = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setAssignments,
  addAssignment,
  deleteAssignment,
  updateAssignment,
  setFormData,
  setDueDate,
  setQuestionTypes,
  setInstructions,
  setSearchQuery,
  setFilterBy,
  setActiveTab,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;
