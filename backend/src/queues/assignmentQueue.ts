import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const ASSIGNMENT_QUEUE_NAME = 'assignment-generation';

export const assignmentQueue = new Queue(ASSIGNMENT_QUEUE_NAME, {
  connection: redisConnection,
});

export const addAssignmentJob = async (assignmentId: string, data: any) => {
  await assignmentQueue.add('generate', { assignmentId, ...data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
  console.log(`Job queued successfully for Assignment: ${assignmentId}`);
};
