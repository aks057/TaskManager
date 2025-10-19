import Bull, { Queue, Job } from 'bull';
import { env } from '../config/env';

// Job data interfaces
export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export interface TaskReminderJobData {
  taskId: string;
  userId: string;
  taskTitle: string;
  dueDate: Date;
}

class QueueService {
  private emailQueue: Queue<EmailJobData> | null = null;
  private taskReminderQueue: Queue<TaskReminderJobData> | null = null;
  private isEnabled: boolean = false;

  public initialize(): void {
    try {
      // Only initialize if Redis URL is provided
      if (!env.REDIS_URL) {
        console.log('⚠️  Redis URL not provided, queue system disabled');
        return;
      }

      // Create email queue
      this.emailQueue = new Bull<EmailJobData>('email', env.REDIS_URL, {
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      // Create task reminder queue
      this.taskReminderQueue = new Bull<TaskReminderJobData>('task-reminders', env.REDIS_URL, {
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      // Setup event listeners
      this.setupEventListeners();

      this.isEnabled = true;
      console.log('✅ Queue system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize queue system:', error);
      this.isEnabled = false;
    }
  }

  private setupEventListeners(): void {
    if (this.emailQueue) {
      this.emailQueue.on('completed', (job: Job<EmailJobData>) => {
        console.log(`✅ Email job ${job.id} completed`);
      });

      this.emailQueue.on('failed', (job: Job<EmailJobData>, err: Error) => {
        console.error(`❌ Email job ${job.id} failed:`, err.message);
      });
    }

    if (this.taskReminderQueue) {
      this.taskReminderQueue.on('completed', (job: Job<TaskReminderJobData>) => {
        console.log(`✅ Task reminder job ${job.id} completed`);
      });

      this.taskReminderQueue.on('failed', (job: Job<TaskReminderJobData>, err: Error) => {
        console.error(`❌ Task reminder job ${job.id} failed:`, err.message);
      });
    }
  }

  // Add email job to queue
  public async addEmailJob(data: EmailJobData, delay?: number): Promise<boolean> {
    if (!this.isEnabled || !this.emailQueue) {
      console.warn('Queue system not enabled, skipping email job');
      return false;
    }

    try {
      await this.emailQueue.add(data, delay ? { delay } : undefined);
      return true;
    } catch (error) {
      console.error('Failed to add email job:', error);
      return false;
    }
  }

  // Add task reminder job
  public async addTaskReminderJob(data: TaskReminderJobData, runAt: Date): Promise<boolean> {
    if (!this.isEnabled || !this.taskReminderQueue) {
      console.warn('Queue system not enabled, skipping task reminder job');
      return false;
    }

    try {
      const delay = runAt.getTime() - Date.now();
      if (delay <= 0) {
        console.warn('Task reminder time has already passed, skipping');
        return false;
      }

      await this.taskReminderQueue.add(data, { delay });
      return true;
    } catch (error) {
      console.error('Failed to add task reminder job:', error);
      return false;
    }
  }

  // Get email queue
  public getEmailQueue(): Queue<EmailJobData> | null {
    return this.emailQueue;
  }

  // Get task reminder queue
  public getTaskReminderQueue(): Queue<TaskReminderJobData> | null {
    return this.taskReminderQueue;
  }

  // Check if queue system is enabled
  public isActive(): boolean {
    return this.isEnabled;
  }

  // Close all queues
  public async close(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.emailQueue) {
      promises.push(this.emailQueue.close());
    }

    if (this.taskReminderQueue) {
      promises.push(this.taskReminderQueue.close());
    }

    await Promise.all(promises);
    this.isEnabled = false;
    console.log('✅ Queue system closed');
  }
}

// Export singleton instance
export const queueService = new QueueService();
