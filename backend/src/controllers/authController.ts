import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await AuthService.register({ name, email, password });

      const response = {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      };

      ResponseHandler.created(res, response, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      const response = {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      };

      ResponseHandler.success(res, response, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      ResponseHandler.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.user!.userId);

      const response = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      ResponseHandler.success(res, response);
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      await AuthService.logout(refreshToken);

      ResponseHandler.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email } = req.body;
      const userId = req.user!.userId;

      const updatedUser = await AuthService.updateProfile(userId, { name, email });

      const response = {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      };

      ResponseHandler.success(res, response, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      ResponseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}
