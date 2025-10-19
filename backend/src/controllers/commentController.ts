import { Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types';
import { NotFoundError, AuthorizationError } from '../utils/errorTypes';
import { emailService } from '../services/emailService';
import { socketService } from '../services/socketService';

export class CommentController {
  static async createComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check if task exists
      const task = await Task.findOne({ _id: req.params.id, is_deleted: false })
        .populate(['created_by', 'assigned_to']);
      if (!task) {
        throw new NotFoundError('Task');
      }

      const comment = await Comment.create({
        task_id: req.params.id,
        user_id: req.user!.userId,
        content: req.body.content,
      });

      const populated = await comment.populate('user_id', 'name email');
      const commenter = populated.user_id as any;

      // Send email notifications
      const recipients = new Set<string>();

      // Notify task creator if they're not the commenter
      const creator = task.created_by as any;
      if (creator._id.toString() !== req.user!.userId) {
        recipients.add(creator.email);
        await emailService.sendCommentNotificationEmail(
          creator.email,
          creator.name,
          task.title,
          (task._id as any).toString(),
          commenter.name,
          req.body.content
        );
      }

      // Notify assigned user if they're not the commenter and not the creator
      if (task.assigned_to) {
        const assignedUser = task.assigned_to as any;
        if (
          assignedUser._id.toString() !== req.user!.userId &&
          !recipients.has(assignedUser.email)
        ) {
          await emailService.sendCommentNotificationEmail(
            assignedUser.email,
            assignedUser.name,
            task.title,
            (task._id as any).toString(),
            commenter.name,
            req.body.content
          );
        }
      }

      // Emit socket event to task room
      socketService.emitToTask(req.params.id, 'comment:added', populated);

      ResponseHandler.created(res, populated, 'Comment added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getComments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        Comment.find({ task_id: req.params.id })
          .populate('user_id', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Comment.countDocuments({ task_id: req.params.id }),
      ]);

      ResponseHandler.paginated(res, comments, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  static async updateComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        throw new NotFoundError('Comment');
      }

      // Check authorization
      if (comment.user_id.toString() !== req.user!.userId) {
        throw new AuthorizationError('You can only update your own comments');
      }

      comment.content = req.body.content;
      await comment.save();
      await comment.populate('user_id', 'name email');

      ResponseHandler.success(res, comment, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        throw new NotFoundError('Comment');
      }

      // Check authorization
      if (comment.user_id.toString() !== req.user!.userId) {
        throw new AuthorizationError('You can only delete your own comments');
      }

      const taskId = comment.task_id.toString();

      await comment.deleteOne();

      // Emit socket event to task room
      socketService.emitToTask(taskId, 'comment:deleted', { commentId: req.params.id });

      ResponseHandler.success(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
