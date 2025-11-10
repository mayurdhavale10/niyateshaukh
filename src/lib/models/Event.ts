import mongoose, { Schema, Model } from 'mongoose';
import { Event } from '@/types/event';

const VenueSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
});

const SponsorSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  website: { type: String },
});

const CapacitySchema = new Schema({
  audience: { type: Number, required: true, default: 0 },
  performers: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

const RegisteredSchema = new Schema({
  audience: { type: Number, required: true, default: 0 },
  performers: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

const EventSchema = new Schema<Event>(
  {
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, required: true },
    venue: { type: VenueSchema, required: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    capacity: { type: CapacitySchema, required: true },
    registered: { type: RegisteredSchema, required: true, default: { audience: 0, performers: 0, total: 0 } },
    sponsors: [SponsorSchema],
    status: { 
      type: String, 
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    isActive: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for finding active event quickly
EventSchema.index({ isActive: 1 });

const EventModel: Model<Event> = mongoose.models.Event || mongoose.model<Event>('Event', EventSchema);

export default EventModel;