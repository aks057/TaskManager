import api, { handleApiError } from './api';
import { UserListItem, User } from '../types/user.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class UserService {
  /**
   * Get all users (for task assignment dropdown)
   */
  async getAllUsers(): Promise<UserListItem[]> {
    try {
      const response = await api.get<ApiResponse<UserListItem[]>>('/users');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/users/profile');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const userService = new UserService();
