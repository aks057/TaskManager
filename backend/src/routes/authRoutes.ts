import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { Validators } from '../utils/validators';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  Validators.register,
  validate,
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  Validators.login,
  validate,
  AuthController.login
);

router.post(
  '/refresh',
  Validators.refreshToken,
  validate,
  AuthController.refreshToken
);

// Protected routes
router.get('/me', authMiddleware, AuthController.getMe);

router.post('/logout', AuthController.logout);

router.put(
  '/profile',
  authMiddleware,
  Validators.updateProfile,
  validate,
  AuthController.updateProfile
);

router.put(
  '/password',
  authMiddleware,
  Validators.changePassword,
  validate,
  AuthController.changePassword
);

export default router;
