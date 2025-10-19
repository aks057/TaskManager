import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { Validators } from '../utils/validators';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get task overview statistics
router.get('/overview', AnalyticsController.getOverview);

// Get user performance metrics
router.get('/user-performance', AnalyticsController.getUserPerformance);

// Get task trends over time
router.get(
  '/trends',
  Validators.analyticsQuery,
  validate,
  AnalyticsController.getTaskTrends
);

// Export tasks data
router.get(
  '/export',
  Validators.exportQuery,
  validate,
  AnalyticsController.exportTasks
);

export default router;
