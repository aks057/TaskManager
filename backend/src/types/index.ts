import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

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

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface TaskFilterQuery extends PaginationQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  created_by?: string;
  tags?: string;
  search?: string;
  sort?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
