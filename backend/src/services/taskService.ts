import { Task, ITask } from '../models/Task';
import { User } from '../models/User';
import { TaskFilterQuery } from '../types';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '../utils/errorTypes';

interface CreateTaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: Date;
  tags?: string[];
  assigned_to?: string;
  created_by: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: Date;
  tags?: string[];
  assigned_to?: string;
}

export class TaskService {
  static async createTask(data: CreateTaskData): Promise<ITask> {
    // Validate assigned_to user if provided
    if (data.assigned_to) {
      const assignedUser = await User.findById(data.assigned_to);
      if (!assignedUser) {
        throw new ValidationError('Assigned user not found');
      }
    }

    const task = await Task.create(data);
    return await task.populate(['assigned_to', 'created_by']);
  }

  static async getTasks(
    query: TaskFilterQuery,
    _userId: string
  ): Promise<{ tasks: ITask[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assigned_to,
      created_by,
      tags,
      search,
      sort = '-createdAt',
    } = query;

    // Build filter
    const filter: any = { is_deleted: false };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assigned_to) filter.assigned_to = assigned_to;
    if (created_by) filter.created_by = created_by;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      // Use regex for partial/substring matching (case-insensitive)
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assigned_to', 'name email')
        .populate('created_by', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks: tasks as unknown as ITask[],
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async getTaskById(taskId: string): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, is_deleted: false })
      .populate('assigned_to', 'name email')
      .populate('created_by', 'name email');

    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  static async updateTask(
    taskId: string,
    data: UpdateTaskData,
    userId: string
  ): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, is_deleted: false });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // Check authorization (only creator or assigned user can update)
    const isCreator = task.created_by.toString() === userId;
    const isAssigned = task.assigned_to?.toString() === userId;

    if (!isCreator && !isAssigned) {
      throw new AuthorizationError('You are not authorized to update this task');
    }

    // Validate assigned_to user if provided
    if (data.assigned_to) {
      const assignedUser = await User.findById(data.assigned_to);
      if (!assignedUser) {
        throw new ValidationError('Assigned user not found');
      }
    }

    // Update task
    Object.assign(task, data);
    await task.save();

    return await task.populate(['assigned_to', 'created_by']);
  }

  static async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findOne({ _id: taskId, is_deleted: false });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // Check authorization (only creator can delete)
    if (task.created_by.toString() !== userId) {
      throw new AuthorizationError('You are not authorized to delete this task');
    }

    // Soft delete
    task.is_deleted = true;
    task.deleted_at = new Date();
    await task.save();
  }

  static async bulkCreateTasks(
    tasks: CreateTaskData[]
  ): Promise<ITask[]> {
    // Validate all assigned_to users
    const assignedUserIds = tasks
      .filter((t) => t.assigned_to)
      .map((t) => t.assigned_to);

    if (assignedUserIds.length > 0) {
      const users = await User.find({ _id: { $in: assignedUserIds } });
      if (users.length !== assignedUserIds.length) {
        throw new ValidationError('One or more assigned users not found');
      }
    }

    const createdTasks = await Task.insertMany(tasks);

    return await Task.find({ _id: { $in: createdTasks.map((t) => t._id) } })
      .populate('assigned_to', 'name email')
      .populate('created_by', 'name email');
  }
}
