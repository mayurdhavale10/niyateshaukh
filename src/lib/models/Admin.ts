import mongoose, { Schema, Model } from 'mongoose';

export interface Admin {
  _id?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'scanner';
  createdAt?: Date;
  lastLogin?: Date;
}

const AdminSchema = new Schema<Admin>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['super_admin', 'scanner'],
      default: 'super_admin'
    },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

const AdminModel: Model<Admin> = 
  mongoose.models.Admin || mongoose.model<Admin>('Admin', AdminSchema);

export default AdminModel;