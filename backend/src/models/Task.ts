import mongoose, { Document, Schema } from 'mongoose';
import { TaskStatus, TaskPriority } from '../types';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date;
  tags: string[];
  assigned_to?: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  is_deleted: boolean;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    due_date: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    assigned_to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
taskSchema.index({ assigned_to: 1 });
taskSchema.index({ created_by: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ due_date: 1 });
taskSchema.index({ is_deleted: 1 });
taskSchema.index({ created_by: 1, is_deleted: 1 });
taskSchema.index({ assigned_to: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);
