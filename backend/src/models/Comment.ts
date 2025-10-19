import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  task_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    task_id: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment must be at least 1 character'],
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ task_id: 1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ task_id: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
