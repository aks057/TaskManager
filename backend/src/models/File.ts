import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  task_id: mongoose.Types.ObjectId;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  minio_path: string;
  uploaded_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    task_id: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    minio_path: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fileSchema.index({ task_id: 1 });
fileSchema.index({ uploaded_by: 1 });

export const File = mongoose.model<IFile>('File', fileSchema);
