import { Queue } from 'bullmq';

export const jobQueue = new Queue('jobQueue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});
