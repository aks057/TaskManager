import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { Validators } from '../utils/validators';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Task routes
router.post(
  '/',
  Validators.createTask,
  validate,
  TaskController.createTask
);

router.get(
  '/',
  Validators.taskQuery,
  validate,
  TaskController.getTasks
);

router.get(
  '/:id',
  Validators.taskId,
  validate,
  TaskController.getTaskById
);

router.put(
  '/:id',
  Validators.updateTask,
  validate,
  TaskController.updateTask
);

router.delete(
  '/:id',
  Validators.taskId,
  validate,
  TaskController.deleteTask
);

router.post(
  '/bulk',
  Validators.bulkCreateTasks,
  validate,
  TaskController.bulkCreateTasks
);

export default router;
