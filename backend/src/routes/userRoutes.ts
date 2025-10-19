import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (for task assignment)
 * @access  Private
 */
router.get('/', authMiddleware, UserController.getUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, UserController.getProfile);

export default router;
