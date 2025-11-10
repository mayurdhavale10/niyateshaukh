import mongoose, { Schema, Model } from 'mongoose';
import { Registration } from '@/types/registration';

const RegistrationSchema = new Schema<Registration>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    eventId: { 
      type: String, 
      required: true,
      index: true 
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    registrationType: { 
      type: String, 
      enum: ['audience', 'performer'],
      required: true,
      index: true
    },
    performanceType: { 
      type: String, 
      enum: ['story', 'poetry', 'shayari', 'music', 'singing'], // ✅ Updated types
      default: null
    },
    qrCode: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
    checkedIn: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// ✅ Compound indexes for performance
RegistrationSchema.index({ eventId: 1, checkedIn: 1 });
RegistrationSchema.index({ eventId: 1, registrationType: 1 });

// ✅ Optional unique constraint to prevent duplicate phone per event
// Uncomment if you want this rule:
// RegistrationSchema.index({ eventId: 1, phone: 1 }, { unique: true });

// ✅ Export model safely (no recompilation issues in dev)
const RegistrationModel: Model<Registration> =
  mongoose.models.Registration || mongoose.model<Registration>('Registration', RegistrationSchema);

export default RegistrationModel;
