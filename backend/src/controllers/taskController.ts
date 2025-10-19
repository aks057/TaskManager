import { Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest, TaskFilterQuery } from '../types';
import { emailService } from '../services/emailService';
import { socketService } from '../services/socketService';
import { cacheService, CacheKeys } from '../services/cacheService';
import { User } from '../models/User';

export class TaskController {
  static async createTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskData = {
        ...req.body,
        created_by: req.user!.userId,
      };

      const task = await TaskService.createTask(taskData);

      // Populate creator and assigned user for email
      const populatedTask = await task.populate(['created_by', 'assigned_to']);

      // Debug logging
      console.log('🔍 DEBUG: Task created');
      console.log('🔍 assigned_to:', populatedTask.assigned_to);
      console.log('🔍 assigned_to ID:', populatedTask.assigned_to?._id?.toString());
      console.log('🔍 current user:', req.user!.userId);
      console.log('🔍 Are they different?', populatedTask.assigned_to?._id?.toString() !== req.user!.userId);

      // Send email if task is assigned to someone
      if (populatedTask.assigned_to && populatedTask.assigned_to._id.toString() !== req.user!.userId) {
        const assignedUser = populatedTask.assigned_to as any;
        const creator = populatedTask.created_by as any;

        console.log('📧 SENDING EMAIL to:', assignedUser.email);

        await emailService.sendTaskAssignedEmail(
          assignedUser.email,
          assignedUser.name,
          populatedTask.title,
          (populatedTask._id as any).toString(),
          creator.name
        );

        console.log('✅ Email function called successfully');
      } else {
        console.log('⚠️  Email NOT sent. Reason: No assignee or same user');
      }

      // Emit socket event for real-time updates
      socketService.broadcast('task:created', populatedTask);

      // Invalidate cache
      await cacheService.delPattern('tasks:*');
      await cacheService.delPattern('analytics:*');

      ResponseHandler.created(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: TaskFilterQuery = req.query;
      const result = await TaskService.getTasks(query, req.user!.userId);

      ResponseHandler.paginated(
        res,
        result.tasks,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.params.id);

      ResponseHandler.success(res, task);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Get old task first to check for changes
      const oldTask = await TaskService.getTaskById(req.params.id);
      const oldAssignedTo = oldTask.assigned_to?._id?.toString();
      const oldStatus = oldTask.status;

      const task = await TaskService.updateTask(
        req.params.id,
        req.body,
        req.user!.userId
      );

      // Populate for email
      const populatedTask = await task.populate(['created_by', 'assigned_to']);
      const newAssignedTo = populatedTask.assigned_to?._id?.toString();
      const updater = await User.findById(req.user!.userId);

      // Send assignment email if assigned_to changed
      if (newAssignedTo && newAssignedTo !== oldAssignedTo && newAssignedTo !== req.user!.userId) {
        const assignedUser = populatedTask.assigned_to as any;

        await emailService.sendTaskAssignedEmail(
          assignedUser.email,
          assignedUser.name,
          populatedTask.title,
          (populatedTask._id as any).toString(),
          updater!.name
        );
      }

      // Send status change email
      if (populatedTask.status !== oldStatus) {
        // Notify creator if they're not the one updating
        const creator = populatedTask.created_by as any;
        if (creator._id.toString() !== req.user!.userId) {
          await emailService.sendTaskStatusChangedEmail(
            creator.email,
            creator.name,
            populatedTask.title,
            (populatedTask._id as any).toString(),
            populatedTask.status,
            updater!.name
          );
        }

        // Notify assigned user if they're not the one updating
        if (newAssignedTo && newAssignedTo !== req.user!.userId) {
          const assignedUser = populatedTask.assigned_to as any;
          await emailService.sendTaskStatusChangedEmail(
            assignedUser.email,
            assignedUser.name,
            populatedTask.title,
            (populatedTask._id as any).toString(),
            populatedTask.status,
            updater!.name
          );
        }
      }

      // Emit socket event
      socketService.emitToTask(req.params.id, 'task:updated', populatedTask);

      // Invalidate cache
      await cacheService.del(CacheKeys.task(req.params.id));
      await cacheService.delPattern('tasks:*');
      await cacheService.delPattern('analytics:*');

      ResponseHandler.success(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await TaskService.deleteTask(req.params.id, req.user!.userId);

      // Emit socket event
      socketService.broadcast('task:deleted', { taskId: req.params.id });

      // Invalidate cache
      await cacheService.del(CacheKeys.task(req.params.id));
      await cacheService.delPattern('tasks:*');
      await cacheService.delPattern('analytics:*');

      ResponseHandler.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async bulkCreateTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tasks = req.body.tasks.map((task: any) => ({
        ...task,
        created_by: req.user!.userId,
      }));

      const createdTasks = await TaskService.bulkCreateTasks(tasks);

      ResponseHandler.created(res, createdTasks, 'Tasks created successfully');
    } catch (error) {
      next(error);
    }
  }
}
