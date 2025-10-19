import api from './api';
import {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  CommentsResponse,
} from '../types/comment.types';

export const commentService = {
  async createComment(taskId: string, data: CreateCommentData): Promise<Comment> {
    const response = await api.post<{ data: Comment }>(`/tasks/${taskId}/comments`, data);
    return response.data.data;
  },

  async getCommentsByTaskId(taskId: string): Promise<Comment[]> {
    const response = await api.get<{ data: Comment[] }>(`/tasks/${taskId}/comments`);
    return response.data.data;
  },

  async getComments(taskId: string, page: number = 1, limit: number = 10): Promise<CommentsResponse> {
    const response = await api.get<{ data: Comment[]; pagination: any }>(
      `/tasks/${taskId}/comments`,
      { params: { page, limit } }
    );
    return {
      comments: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async updateComment(id: string, data: UpdateCommentData): Promise<Comment> {
    const response = await api.put<{ data: Comment }>(`/comments/${id}`, data);
    return response.data.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};
