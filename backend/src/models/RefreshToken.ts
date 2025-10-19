import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  user_id: mongoose.Types.ObjectId;
  token: string;
  expires_at: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
refreshTokenSchema.index({ user_id: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);
