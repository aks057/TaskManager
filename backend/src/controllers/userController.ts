import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types';

export class UserController {
  /**
   * Get all users (excluding passwords)
   * Used for task assignment dropdowns
   */
  static async getUsers(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await User.find()
        .select('_id name email')
        .sort({ name: 1 })
        .lean();

      ResponseHandler.success(res, users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await User.findById(req.user!.userId)
        .select('-password')
        .lean();

      if (!user) {
        return ResponseHandler.error(res, 'User not found', 404, 'USER_NOT_FOUND') as any;
      }

      ResponseHandler.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}
