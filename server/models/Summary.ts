import mongoose, { Document, Schema } from 'mongoose';

export interface ISummary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  videoDuration?: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const summarySchema = new Schema<ISummary>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  videoDuration: {
    type: String,
    default: 'Unknown'
  },
  summary: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
summarySchema.index({ userId: 1, createdAt: -1 });
summarySchema.index({ title: 'text', summary: 'text' });

export default mongoose.model<ISummary>('Summary', summarySchema);