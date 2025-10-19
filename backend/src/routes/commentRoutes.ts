import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { Validators } from '../utils/validators';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create comment on a task
router.post(
  '/tasks/:id/comments',
  Validators.createComment,
  validate,
  CommentController.createComment
);

// Get all comments for a task
router.get(
  '/tasks/:id/comments',
  Validators.taskId,
  validate,
  CommentController.getComments
);

// Update a comment
router.put(
  '/comments/:id',
  Validators.updateComment,
  validate,
  CommentController.updateComment
);

// Delete a comment
router.delete(
  '/comments/:id',
  Validators.commentId,
  validate,
  CommentController.deleteComment
);

export default router;
