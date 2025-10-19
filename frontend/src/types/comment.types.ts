import { User } from './auth.types';

export interface Comment {
  _id: string;
  task_id: string;
  user_id: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  task_id: string;
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
