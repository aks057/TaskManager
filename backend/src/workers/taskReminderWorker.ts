import { Job } from 'bull';
import { queueService, TaskReminderJobData } from '../services/queueService';
import { emailService } from '../services/emailService';
import { Task } from '../models/Task';
import { User } from '../models/User';

// Initialize task reminder worker
export const initializeTaskReminderWorker = (): void => {
  const taskReminderQueue = queueService.getTaskReminderQueue();

  if (!taskReminderQueue) {
    console.log('⚠️  Task reminder queue not available, worker not started');
    return;
  }

  // Process task reminder jobs
  taskReminderQueue.process(async (job: Job<TaskReminderJobData>) => {
    const { taskId, userId, taskTitle, dueDate } = job.data;

    try {
      // Verify task still exists and is not completed
      const task = await Task.findById(taskId);
      if (!task || task.status === 'completed') {
        console.log(`⚠️  Task ${taskId} not found or already completed, skipping reminder`);
        return { success: false, reason: 'Task not found or completed' };
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        console.log(`⚠️  User ${userId} not found, skipping reminder`);
        return { success: false, reason: 'User not found' };
      }

      // Send reminder email
      const sent = await emailService.sendTaskDeadlineReminderEmail(
        user.email,
        user.name,
        taskTitle,
        taskId,
        new Date(dueDate)
      );

      if (sent) {
        console.log(`✅ Task reminder sent to ${user.email} for task ${taskId} (Job ${job.id})`);
        return { success: true, userId, taskId };
      } else {
        console.log(`⚠️  Failed to send reminder email for task ${taskId}`);
        return { success: false, reason: 'Failed to send email' };
      }
    } catch (error: any) {
      console.error(`❌ Failed to process task reminder (Job ${job.id}):`, error.message);
      throw error; // This will trigger retry
    }
  });

  console.log('✅ Task reminder worker started');
};
