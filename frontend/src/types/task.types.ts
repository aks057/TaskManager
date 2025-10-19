import { User } from './auth.types';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
  assigned_to?: User;
  created_by: User;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  created_by?: string;
  tags?: string;
  search?: string;
}

export interface TaskQueryParams extends TaskFilters {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
