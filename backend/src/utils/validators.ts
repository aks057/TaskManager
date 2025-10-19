import { body, param, query, ValidationChain } from 'express-validator';
import mongoose from 'mongoose';
import { TaskStatus, TaskPriority } from '../types';

export class Validators {
  // Custom validator for MongoDB ObjectId
  static isValidObjectId(value: string): boolean {
    return mongoose.Types.ObjectId.isValid(value);
  }

  // Auth validators
  static register: ValidationChain[] = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ];

  static login: ValidationChain[] = [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  static refreshToken: ValidationChain[] = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ];

  static updateProfile: ValidationChain[] = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail({ gmail_remove_dots: false }),
  ];

  static changePassword: ValidationChain[] = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ];

  // Task validators
  static createTask: ValidationChain[] = [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('status')
      .optional()
      .isIn(Object.values(TaskStatus))
      .withMessage('Invalid status value'),
    body('priority')
      .optional()
      .isIn(Object.values(TaskPriority))
      .withMessage('Invalid priority value'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters'),
    body('assigned_to')
      .optional()
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid user ID'),
  ];

  static updateTask: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid task ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('status')
      .optional()
      .isIn(Object.values(TaskStatus))
      .withMessage('Invalid status value'),
    body('priority')
      .optional()
      .isIn(Object.values(TaskPriority))
      .withMessage('Invalid priority value'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('assigned_to')
      .optional()
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid user ID'),
  ];

  static taskId: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid task ID'),
  ];

  static bulkCreateTasks: ValidationChain[] = [
    body('tasks')
      .isArray({ min: 1 })
      .withMessage('Tasks must be a non-empty array'),
    body('tasks.*.title')
      .trim()
      .notEmpty()
      .withMessage('Title is required for all tasks')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
  ];

  // Comment validators
  static createComment: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid task ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters'),
  ];

  static updateComment: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid comment ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters'),
  ];

  static commentId: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid comment ID'),
  ];

  // File validators
  static fileId: ValidationChain[] = [
    param('id')
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid file ID'),
  ];

  // Query validators
  static taskQuery: ValidationChain[] = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(Object.values(TaskStatus))
      .withMessage('Invalid status value'),
    query('priority')
      .optional()
      .isIn(Object.values(TaskPriority))
      .withMessage('Invalid priority value'),
    query('assigned_to')
      .optional()
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid user ID'),
    query('created_by')
      .optional()
      .custom(Validators.isValidObjectId)
      .withMessage('Invalid user ID'),
  ];

  static analyticsQuery: ValidationChain[] = [
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    query('period')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('Period must be day, week, or month'),
  ];

  static exportQuery: ValidationChain[] = [
    query('format')
      .optional()
      .isIn(['csv', 'json'])
      .withMessage('Format must be csv or json'),
  ];
}
