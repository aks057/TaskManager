import { Response, NextFunction } from 'express';
import { FileService } from '../services/fileService';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types';
import { ValidationError } from '../utils/errorTypes';
import { socketService } from '../services/socketService';

export class FileController {
  static async uploadFiles(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        throw new ValidationError('No files uploaded');
      }

      const files = req.files as Express.Multer.File[];
      const taskId = req.params.id;

      const uploadedFiles = await FileService.uploadFiles(
        taskId,
        files,
        req.user!.userId
      );

      // Emit socket event to task room for each uploaded file
      uploadedFiles.forEach((file) => {
        socketService.emitToTask(taskId, 'file:uploaded', file);
      });

      ResponseHandler.created(res, uploadedFiles, 'Files uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { file, stream } = await FileService.getFile(req.params.id);

      // Set response headers
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.original_name}"`
      );
      res.setHeader('Content-Length', file.size);

      // Pipe the stream to response
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = await FileService.deleteFile(req.params.id, req.user!.userId);

      // Emit socket event to task room
      if (file && file.task_id) {
        socketService.emitToTask(file.task_id.toString(), 'file:deleted', { fileId: req.params.id });
      }

      ResponseHandler.success(res, null, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFilesByTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = await FileService.getFilesByTaskId(req.params.id);

      ResponseHandler.success(res, files);
    } catch (error) {
      next(error);
    }
  }
}
