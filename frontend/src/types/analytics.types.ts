export interface AnalyticsStats {
  total: number;
  completed: number;
  overdue: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface TaskTrend {
  date: string;
  created: number;
  completed: number;
}

export interface OverviewStats {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  completed: number;
  overdue: number;
}

export interface UserPerformance {
  tasksCreated: number;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface TrendData {
  date: string;
  created: number;
  completed: number;
}

export type TrendPeriod = 'day' | 'week' | 'month';

export type ExportFormat = 'csv' | 'json';
