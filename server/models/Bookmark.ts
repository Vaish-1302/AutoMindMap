import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  summaryId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summaryId: {
    type: Schema.Types.ObjectId,
    ref: 'Summary',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique bookmark per user per summary
bookmarkSchema.index({ userId: 1, summaryId: 1 }, { unique: true });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);