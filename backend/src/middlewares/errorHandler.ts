import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorTypes';
import { ResponseHandler } from '../utils/responseHandler';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle AppError instances
  if (err instanceof AppError) {
    ResponseHandler.error(
      res,
      err.message,
      err.statusCode,
      err.code
    );
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    ResponseHandler.error(
      res,
      'Validation error',
      400,
      'VALIDATION_ERROR',
      err.message
    );
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    ResponseHandler.error(
      res,
      'Invalid ID format',
      400,
      'INVALID_ID'
    );
    return;
  }

  // Handle MongoDB duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    ResponseHandler.error(
      res,
      `${field} already exists`,
      409,
      'DUPLICATE_KEY'
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    ResponseHandler.error(
      res,
      'Invalid token',
      401,
      'INVALID_TOKEN'
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ResponseHandler.error(
      res,
      'Token expired',
      401,
      'TOKEN_EXPIRED'
    );
    return;
  }

  // Default error
  const message = env.NODE_ENV === 'development'
    ? err.message
    : 'Something went wrong';

  ResponseHandler.error(
    res,
    message,
    500,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV === 'development' ? err.stack : undefined
  );
};
