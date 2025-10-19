import { minioClient } from '../config/minio';
import { env } from '../config/env';
import { File, IFile } from '../models/File';
import { Task } from '../models/Task';
import {
  NotFoundError,
  AuthorizationError,
} from '../utils/errorTypes';
import { Sanitizer } from '../utils/sanitizer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface UploadedFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export class FileService {
  static async uploadFiles(
    taskId: string,
    files: UploadedFileData[],
    userId: string
  ): Promise<IFile[]> {
    // Check if task exists
    const task = await Task.findOne({ _id: taskId, is_deleted: false });
    if (!task) {
      throw new NotFoundError('Task');
    }

    const uploadedFiles: IFile[] = [];

    for (const file of files) {
      // Generate unique filename
      const ext = path.extname(file.originalname);
      const sanitizedName = Sanitizer.sanitizeFilename(
        path.basename(file.originalname, ext)
      );
      const filename = `${uuidv4()}-${sanitizedName}${ext}`;
      const minioPath = `tasks/${taskId}/${filename}`;

      try {
        // Upload to MinIO
        await minioClient.putObject(
          env.MINIO_BUCKET,
          minioPath,
          file.buffer,
          file.size,
          {
            'Content-Type': file.mimetype,
            'Content-Disposition': `attachment; filename="${file.originalname}"`,
          }
        );

        // Save metadata to database
        const fileDoc = await File.create({
          task_id: taskId,
          filename,
          original_name: file.originalname,
          mime_type: file.mimetype,
          size: file.size,
          minio_path: minioPath,
          uploaded_by: userId,
        });

        uploadedFiles.push(fileDoc);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw new Error(`Failed to upload file ${file.originalname}`);
      }
    }

    return uploadedFiles;
  }

  static async getFile(fileId: string): Promise<{ file: IFile; stream: any }> {
    const file = await File.findById(fileId);

    if (!file) {
      throw new NotFoundError('File');
    }

    try {
      const stream = await minioClient.getObject(
        env.MINIO_BUCKET,
        file.minio_path
      );

      return { file, stream };
    } catch (error) {
      console.error('Error retrieving file from MinIO:', error);
      throw new Error('Failed to retrieve file');
    }
  }

  static async deleteFile(fileId: string, userId: string): Promise<IFile> {
    const file = await File.findById(fileId);

    if (!file) {
      throw new NotFoundError('File');
    }

    // Check authorization (only uploader or task creator can delete)
    const task = await Task.findById(file.task_id);
    if (!task) {
      throw new NotFoundError('Task');
    }

    const isUploader = file.uploaded_by.toString() === userId;
    const isTaskCreator = task.created_by.toString() === userId;

    if (!isUploader && !isTaskCreator) {
      throw new AuthorizationError(
        'You are not authorized to delete this file'
      );
    }

    try {
      // Store file info before deletion
      const fileInfo = file.toObject();

      // Delete from MinIO
      await minioClient.removeObject(env.MINIO_BUCKET, file.minio_path);

      // Delete from database
      await file.deleteOne();

      return fileInfo as IFile;
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      throw new Error('Failed to delete file');
    }
  }

  static async getFilesByTaskId(taskId: string): Promise<IFile[]> {
    const files = await File.find({ task_id: taskId })
      .populate('uploaded_by', 'name email')
      .sort({ createdAt: -1 });

    return files;
  }
}
