import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  questionText: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  correctAnswer: string;
  rubric?: string;
}

export interface IAssignment extends Document {
  title: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
  dueDate: string;
  assignedOn: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  schoolName: string;
  schoolCity: string;
  questions: IQuestion[];
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'short-answer', 'true-false'], required: true },
  options: { type: [String], default: undefined },
  correctAnswer: { type: String, required: true },
  rubric: { type: String }
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    difficulty: { type: String, required: true },
    dueDate: { type: String, required: true },
    assignedOn: { type: String, required: true },
    status: { type: String, enum: ['draft', 'generating', 'completed', 'failed'], default: 'generating' },
    schoolName: { type: String, default: 'Delhi Public School' },
    schoolCity: { type: String, default: 'Bokaro Steel City' },
    questions: { type: [QuestionSchema], default: [] },
    instructions: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
