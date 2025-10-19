import { Task } from '../models/Task';
import { TaskStatus, TaskPriority } from '../types';
import mongoose from 'mongoose';

interface OverviewStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  completed: number;
  overdue: number;
}

interface UserPerformance {
  tasksCreated: number;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: Record<string, number>;
}

interface TrendData {
  date: string;
  created: number;
  completed: number;
}

export class AnalyticsService {
  static async getOverview(userId: string): Promise<OverviewStats> {
    const now = new Date();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all non-deleted tasks for the user
    const [
      totalTasks,
      byStatus,
      byPriority,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      // Total tasks
      Task.countDocuments({
        $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
        is_deleted: false,
      }),

      // Tasks by status
      Task.aggregate([
        {
          $match: {
            $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Tasks by priority
      Task.aggregate([
        {
          $match: {
            $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),

      // Completed tasks
      Task.countDocuments({
        $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
        is_deleted: false,
        status: TaskStatus.COMPLETED,
      }),

      // Overdue tasks
      Task.countDocuments({
        $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
        is_deleted: false,
        status: { $ne: TaskStatus.COMPLETED },
        due_date: { $lt: now },
      }),
    ]);

    // Format status counts
    const statusCounts: Record<string, number> = {};
    Object.values(TaskStatus).forEach((status) => {
      statusCounts[status] = 0;
    });
    byStatus.forEach((item: any) => {
      statusCounts[item._id] = item.count;
    });

    // Format priority counts
    const priorityCounts: Record<string, number> = {};
    Object.values(TaskPriority).forEach((priority) => {
      priorityCounts[priority] = 0;
    });
    byPriority.forEach((item: any) => {
      priorityCounts[item._id] = item.count;
    });

    return {
      total: totalTasks,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      completed: completedTasks,
      overdue: overdueTasks,
    };
  }

  static async getUserPerformance(userId: string): Promise<UserPerformance> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [tasksCreated, tasksAssigned, completedTasks, tasksByPriority] =
      await Promise.all([
        // Tasks created
        Task.countDocuments({
          created_by: userObjectId,
          is_deleted: false,
        }),

        // Tasks assigned
        Task.countDocuments({
          assigned_to: userObjectId,
          is_deleted: false,
        }),

        // Completed tasks
        Task.find({
          $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
          is_deleted: false,
          status: TaskStatus.COMPLETED,
        }).select('createdAt updatedAt'),

        // Tasks by priority
        Task.aggregate([
          {
            $match: {
              $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
              is_deleted: false,
            },
          },
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    // Calculate completion rate
    const totalTasks = await Task.countDocuments({
      $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
      is_deleted: false,
    });

    const completionRate =
      totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Calculate average completion time (in days)
    let averageCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const completionTime =
          task.updatedAt.getTime() - task.createdAt.getTime();
        return sum + completionTime;
      }, 0);
      averageCompletionTime =
        totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Format priority counts
    const priorityCounts: Record<string, number> = {};
    Object.values(TaskPriority).forEach((priority) => {
      priorityCounts[priority] = 0;
    });
    tasksByPriority.forEach((item: any) => {
      priorityCounts[item._id] = item.count;
    });

    return {
      tasksCreated,
      tasksAssigned,
      tasksCompleted: completedTasks.length,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      tasksByPriority: priorityCounts,
    };
  }

  static async getTaskTrends(
    userId: string,
    period: 'day' | 'week' | 'month' = 'week',
    startDate?: Date,
    endDate?: Date
  ): Promise<TrendData[]> {
    const now = new Date();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days ago
    let end = endDate || now;

    // Determine grouping format based on period
    let dateFormat: any;
    switch (period) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = {
          $dateToString: { format: '%Y-W%V', date: '$createdAt' },
        };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
    }

    const [createdTrends, completedTrends] = await Promise.all([
      // Tasks created trends
      Task.aggregate([
        {
          $match: {
            created_by: userObjectId,
            is_deleted: false,
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: dateFormat,
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Tasks completed trends
      Task.aggregate([
        {
          $match: {
            $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
            is_deleted: false,
            status: TaskStatus.COMPLETED,
            updatedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Combine and format trends
    const trendsMap = new Map<string, TrendData>();

    createdTrends.forEach((item: any) => {
      trendsMap.set(item._id, {
        date: item._id,
        created: item.count,
        completed: 0,
      });
    });

    completedTrends.forEach((item: any) => {
      if (trendsMap.has(item._id)) {
        trendsMap.get(item._id)!.completed = item.count;
      } else {
        trendsMap.set(item._id, {
          date: item._id,
          created: 0,
          completed: item.count,
        });
      }
    });

    return Array.from(trendsMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  static async exportTasks(
    userId: string,
    format: 'csv' | 'json',
    filters?: any
  ): Promise<any> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const query: any = {
      $or: [{ created_by: userObjectId }, { assigned_to: userObjectId }],
      is_deleted: false,
    };

    // Apply filters
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.start_date || filters?.end_date) {
      query.createdAt = {};
      if (filters.start_date) query.createdAt.$gte = new Date(filters.start_date);
      if (filters.end_date) query.createdAt.$lte = new Date(filters.end_date);
    }

    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email')
      .populate('created_by', 'name email')
      .lean();

    if (format === 'json') {
      return tasks;
    }

    // Convert to CSV
    if (tasks.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'Title',
      'Description',
      'Status',
      'Priority',
      'Due Date',
      'Tags',
      'Assigned To',
      'Created By',
      'Created At',
    ];

    const rows = tasks.map((task: any) => [
      task.title,
      task.description || '',
      task.status,
      task.priority,
      task.due_date ? new Date(task.due_date).toISOString() : '',
      task.tags.join('; '),
      task.assigned_to ? task.assigned_to.email : '',
      task.created_by ? task.created_by.email : '',
      new Date(task.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csvContent;
  }
}
