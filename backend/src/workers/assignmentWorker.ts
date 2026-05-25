import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import Assignment from '../models/Assignment';
import { getSocketIO } from '../sockets/socketHandler';

export const initAssignmentWorker = () => {
  const worker = new Worker(
    'assignment-generation',
    async (job: Job) => {
      const { assignmentId, title, topic, gradeLevel, difficulty, configs } = job.data;
      console.log(`Processing assignment generation job: ${job.id} for assignment: ${assignmentId}`);

      const io = getSocketIO();

      try {
        // Step 1: Initialize status
        io.to(assignmentId).emit('generation-progress', { progress: 10, status: 'generating' });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 2: Ingestion
        io.to(assignmentId).emit('generation-progress', { progress: 40, status: 'generating' });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 3: Core AI prompt crafting
        io.to(assignmentId).emit('generation-progress', { progress: 70, status: 'generating' });
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 4: Build dynamic questions lists (mock Gemini JSON parser)
        const mockQuestions: any[] = [];
        configs.forEach((config: any) => {
          for (let i = 0; i < config.count; i++) {
            if (config.type === 'multiple-choice') {
              mockQuestions.push({
                questionText: `Multiple Choice Question #${i + 1} on ${topic} (${config.marks} Marks)`,
                type: 'multiple-choice',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A',
                rubric: `Assign full ${config.marks} marks if Option A is selected.`,
              });
            } else if (config.type === 'short-answer') {
              mockQuestions.push({
                questionText: `Short Answer Question #${i + 1} on ${topic} (${config.marks} Marks)`,
                type: 'short-answer',
                correctAnswer: 'The core formula and applications should be explained in detail.',
                rubric: `Assign up to ${config.marks} marks depending on coverage of physical mechanisms.`,
              });
            } else if (config.type === 'true-false') {
              mockQuestions.push({
                questionText: `True or False Question #${i + 1} on ${topic} (${config.marks} Marks)`,
                type: 'true-false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                rubric: `Assign full ${config.marks} marks if True is selected.`,
              });
            }
          }
        });

        // Step 5: Save in MongoDB
        const updatedAssignment = await Assignment.findByIdAndUpdate(
          assignmentId,
          {
            status: 'completed',
            questions: mockQuestions,
          },
          { new: true }
        );

        if (!updatedAssignment) {
          throw new Error(`Assignment not found: ${assignmentId}`);
        }

        io.to(assignmentId).emit('generation-progress', { 
          progress: 100, 
          status: 'completed',
          assignment: updatedAssignment
        });

        console.log(`Assignment job successfully completed: ${assignmentId}`);
      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);
        
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        
        io.to(assignmentId).emit('generation-progress', { 
          progress: 100, 
          status: 'failed', 
          error: error.message 
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
