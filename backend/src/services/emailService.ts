import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { queueService, EmailJobData } from './queueService';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isEnabled: boolean = false;

  public initialize(): void {
    try {
      // Only initialize if SMTP credentials are provided
      if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
        console.log('⚠️  SMTP credentials not provided, email system disabled');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          console.error('❌ SMTP connection failed:', error.message);
          this.isEnabled = false;
        } else {
          console.log('✅ Email service initialized');
          this.isEnabled = true;
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isEnabled = false;
    }
  }

  // Send email directly (use for urgent emails)
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      console.warn('Email service not enabled, skipping email');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"${env.APP_NAME || 'Task Manager'}" <${env.SMTP_FROM || env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`✅ Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Queue email for background processing
  public async queueEmail(options: EmailOptions, delay?: number): Promise<boolean> {
    console.log('📮 Queueing email to:', options.to);

    const jobData: EmailJobData = {
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const result = await queueService.addEmailJob(jobData, delay);
    console.log('📮 Queue result:', result);
    return result;
  }

  // Email templates
  public async sendTaskAssignedEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    taskId: string,
    assignedBy: string
  ): Promise<boolean> {
    console.log('📨 sendTaskAssignedEmail called with:', { toEmail, toName, taskTitle });
    console.log('📨 Email service active:', this.isActive());

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Task Assigned</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${toName}</strong>,</p>
            <p>You have been assigned a new task by <strong>${assignedBy}</strong>:</p>
            <h2 style="color: #667eea;">${taskTitle}</h2>
            <p>Please review the task details and take necessary action.</p>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${taskId}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${env.APP_NAME || 'Task Manager'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.queueEmail({
      to: toEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html,
      text: `Hi ${toName}, You have been assigned a new task: ${taskTitle}. View it at ${env.FRONTEND_URL}/tasks/${taskId}`,
    });
  }

  public async sendCommentNotificationEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    taskId: string,
    commenterName: string,
    commentContent: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .comment-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Comment on Task</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${toName}</strong>,</p>
            <p><strong>${commenterName}</strong> commented on task: <strong>${taskTitle}</strong></p>
            <div class="comment-box">
              <p>${commentContent}</p>
            </div>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${taskId}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${env.APP_NAME || 'Task Manager'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.queueEmail({
      to: toEmail,
      subject: `New comment on: ${taskTitle}`,
      html,
      text: `Hi ${toName}, ${commenterName} commented on task "${taskTitle}": ${commentContent}`,
    });
  }

  public async sendTaskDeadlineReminderEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    taskId: string,
    dueDate: Date
  ): Promise<boolean> {
    const formattedDate = dueDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .deadline-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Task Deadline Reminder</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${toName}</strong>,</p>
            <p>This is a reminder that the following task is due soon:</p>
            <h2 style="color: #667eea;">${taskTitle}</h2>
            <div class="deadline-box">
              <strong>Due Date:</strong> ${formattedDate}
            </div>
            <p>Please ensure the task is completed on time.</p>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${taskId}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${env.APP_NAME || 'Task Manager'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.queueEmail({
      to: toEmail,
      subject: `⏰ Reminder: ${taskTitle} is due soon`,
      html,
      text: `Hi ${toName}, This is a reminder that task "${taskTitle}" is due on ${formattedDate}. View it at ${env.FRONTEND_URL}/tasks/${taskId}`,
    });
  }

  public async sendTaskStatusChangedEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    taskId: string,
    newStatus: string,
    changedBy: string
  ): Promise<boolean> {
    const statusEmoji = {
      todo: '📝',
      in_progress: '🔄',
      completed: '✅',
    }[newStatus] || '📋';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmoji} Task Status Updated</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${toName}</strong>,</p>
            <p><strong>${changedBy}</strong> updated the status of:</p>
            <h2 style="color: #667eea;">${taskTitle}</h2>
            <div class="status-box">
              <strong>New Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}
            </div>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${taskId}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated message from ${env.APP_NAME || 'Task Manager'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.queueEmail({
      to: toEmail,
      subject: `Task Status Updated: ${taskTitle}`,
      html,
      text: `Hi ${toName}, ${changedBy} updated the status of task "${taskTitle}" to ${newStatus}. View it at ${env.FRONTEND_URL}/tasks/${taskId}`,
    });
  }

  // Check if email service is enabled
  public isActive(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const emailService = new EmailService();
