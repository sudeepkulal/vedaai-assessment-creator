import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  questionText: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  correctAnswer: string;
  rubric?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  assignedOn: string;
  dueDate: string;
  schoolName: string;
  schoolCity: string;
  questions: Question[];
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

const mockAssignments: Assignment[] = [
  {
    _id: '1',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: [
      {
        questionText: 'What is the SI unit of electric current?',
        type: 'multiple-choice',
        options: ['Ampere', 'Volt', 'Ohm', 'Watt'],
        correctAnswer: 'Ampere',
        rubric: 'Full marks if correct option selected.'
      }
    ]
  },
  {
    _id: '2',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: []
  },
  {
    _id: '3',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: []
  },
  {
    _id: '4',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: []
  },
  {
    _id: '5',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: []
  },
  {
    _id: '6',
    title: 'Quiz on Electricity',
    status: 'completed',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    schoolName: 'Delhi Public School',
    schoolCity: 'Bokaro Steel City',
    questions: []
  }
];

const initialState: AssignmentState = {
  items: mockAssignments,
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
      const index = state.items.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
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
