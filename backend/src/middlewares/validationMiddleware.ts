import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from '../utils/responseHandler';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? (error as any).path : undefined,
      message: error.msg,
    }));

    ResponseHandler.error(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
    return;
  }

  next();
};
