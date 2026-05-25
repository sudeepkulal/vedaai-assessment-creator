import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import Assignment from '../models/Assignment';
import { getSocketIO } from '../sockets/socketHandler';
import { AIService } from '../services/aiService';

export const initAssignmentWorker = () => {
  const worker = new Worker(
    'assignment-generation',
    async (job: Job) => {
      const { assignmentId, title, topic, gradeLevel, difficulty, configs, instructions } = job.data;
      console.log(`Processing assignment generation job: ${job.id} for assignment: ${assignmentId}`);

      const io = getSocketIO();

      try {
        // Step 1: Trigger started event
        io.to(assignmentId).emit('generation-started', { assignmentId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 2: Ingestion & Reference check progress
        io.to(assignmentId).emit('generation-progress', { progress: 40, assignmentId });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 3: Prompt crafting progress
        io.to(assignmentId).emit('generation-progress', { progress: 70, assignmentId });
        
        const paper = await AIService.generateQuestions(
          title,
          topic,
          gradeLevel,
          difficulty,
          configs,
          instructions
        );

        // Step 4: Flatten section questions list
        const questionsList: any[] = [];
        paper.sections.forEach((section) => {
          section.questions.forEach((q) => {
            questionsList.push({
              questionText: q.questionText,
              type: q.type,
              options: q.options,
              correctAnswer: q.correctAnswer,
              rubric: q.rubric || `Evaluate answers based on section instructions: ${section.instructions}`,
            });
          });
        });

        // Step 5: Save in MongoDB
        const updatedAssignment = await Assignment.findByIdAndUpdate(
          assignmentId,
          {
            status: 'completed',
            questions: questionsList,
          },
          { new: true }
        );

        if (!updatedAssignment) {
          throw new Error(`Assignment not found: ${assignmentId}`);
        }

        // Step 6: Trigger completed event
        io.to(assignmentId).emit('generation-completed', { 
          assignment: updatedAssignment,
          assignmentId
        });

        console.log(`Assignment job successfully completed: ${assignmentId}`);
      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);
        
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        
        // Trigger failed event
        io.to(assignmentId).emit('generation-failed', { 
          error: error.message,
          assignmentId
        });

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Allow 2 concurrent jobs
    }
  );

  worker.on('completed', (job) => {
    console.log(`Worker job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Worker job failed: ${job?.id} error:`, err);
  });

  console.log('Assignment BullMQ Worker initialized');
  return worker;
};
