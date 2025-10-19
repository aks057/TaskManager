import { Job } from 'bull';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { queueService, EmailJobData } from '../services/queueService';

// Initialize email worker
export const initializeEmailWorker = (): void => {
  const emailQueue = queueService.getEmailQueue();

  if (!emailQueue) {
    console.log('⚠️  Email queue not available, worker not started');
    return;
  }

  // Check if SMTP is configured
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log('⚠️  SMTP not configured, email worker not started');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  // Process email jobs
  emailQueue.process(async (job: Job<EmailJobData>) => {
    const { to, subject, html, attachments } = job.data;

    try {
      await transporter.sendMail({
        from: `"${env.APP_NAME || 'Task Manager'}" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      });

      console.log(`✅ Email sent to ${to} (Job ${job.id})`);
      return { success: true, to };
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to} (Job ${job.id}):`, error.message);
      throw error; // This will trigger retry
    }
  });

  console.log('✅ Email worker started');
};
