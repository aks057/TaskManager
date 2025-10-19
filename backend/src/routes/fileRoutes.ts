import { Router } from 'express';
import { FileController } from '../controllers/fileController';
import { Validators } from '../utils/validators';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/fileUpload';
import { fileUploadLimiter } from '../middlewares/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Upload files to a task
router.post(
  '/tasks/:id/files',
  fileUploadLimiter,
  Validators.taskId,
  validate,
  upload.array('files', 10),
  FileController.uploadFiles
);

// Get all files for a task
router.get(
  '/tasks/:id/files',
  Validators.taskId,
  validate,
  FileController.getFilesByTask
);

// Get/download a file
router.get(
  '/files/:id',
  Validators.fileId,
  validate,
  FileController.getFile
);

// Delete a file
router.delete(
  '/files/:id',
  Validators.fileId,
  validate,
  FileController.deleteFile
);

export default router;
