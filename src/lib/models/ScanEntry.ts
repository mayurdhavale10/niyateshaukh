// src/lib/models/ScanEntry.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IScanEntry extends Document {
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  registrationType: 'performer' | 'audience';
  scannedAt: Date;
}

const ScanEntrySchema = new Schema<IScanEntry>({
  eventId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  registrationType: {
    type: String,
    enum: ['performer', 'audience'],
    required: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate scans
ScanEntrySchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Index for faster queries
ScanEntrySchema.index({ scannedAt: -1 });

const ScanEntryModel = mongoose.models.ScanEntry || mongoose.model<IScanEntry>('ScanEntry', ScanEntrySchema);

export default ScanEntryModel;