import { TaskStatus, TaskPriority } from '../types/task.types';

export const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.COMPLETED, label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: 'Low' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.CRITICAL, label: 'Critical' },
];

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '#6c757d',
  [TaskStatus.IN_PROGRESS]: '#0d6efd',
  [TaskStatus.COMPLETED]: '#198754',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '#6c757d',
  [TaskPriority.MEDIUM]: '#0dcaf0',
  [TaskPriority.HIGH]: '#fd7e14',
  [TaskPriority.CRITICAL]: '#dc3545',
};

export const ITEMS_PER_PAGE = 10;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DEBOUNCE_DELAY = 500; // milliseconds

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
