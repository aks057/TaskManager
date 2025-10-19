import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post<{ data: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async updateProfile(data: { name: string; email: string }): Promise<User> {
    const response = await api.put<{ data: User }>('/auth/profile', data);
    return response.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put('/auth/password', data);
  },
};
