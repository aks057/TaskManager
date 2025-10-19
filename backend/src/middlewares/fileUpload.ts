import multer from 'multer';
import path from 'path';
import { ValidationError } from '../utils/errorTypes';

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  cb(null, true);
};

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for MinIO upload
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per request
  },
});
