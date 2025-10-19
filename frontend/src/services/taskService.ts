import api from './api';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskQueryParams,
  TasksResponse,
} from '../types/task.types';

export const taskService = {
  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post<{ data: Task }>('/tasks', data);
    return response.data.data;
  },

  async getTasks(params?: TaskQueryParams): Promise<TasksResponse> {
    const response = await api.get<{ data: Task[]; pagination: { page: number; limit: number; total: number } }>('/tasks', { params });
    return {
      tasks: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      pagination: response.data.pagination,
    };
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<{ data: Task }>(`/tasks/${id}`);
    return response.data.data;
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put<{ data: Task }>(`/tasks/${id}`, data);
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async bulkCreateTasks(tasks: CreateTaskData[]): Promise<Task[]> {
    const response = await api.post<{ data: Task[] }>('/tasks/bulk', { tasks });
    return response.data.data;
  },
};
