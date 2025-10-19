import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from '../utils/errorTypes';
import { AuthenticatedRequest } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
};
