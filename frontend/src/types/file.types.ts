import { User } from './auth.types';

export interface FileMetadata {
  _id: string;
  task_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  minio_path: string;
  uploaded_by: User;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
  error?: string;
}
