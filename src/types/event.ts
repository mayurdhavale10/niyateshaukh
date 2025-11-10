export interface Venue {
  name: string;
  address: string;
  city: string;
  pincode: string;
}

export interface Sponsor {
  _id?: string;
  name: string;
  logo: string;
  website?: string;
}

export interface Capacity {
  audience: number;
  performers: number;
  total: number;
}

export interface Registered {
  audience: number;
  performers: number;
  total: number;
}

export interface Event {
  _id?: string;
  eventName: string;
  eventDate: Date;
  eventTime: string;
  venue: Venue;
  description: string;
  photos: string[];
  capacity: Capacity;
  registered: Registered;
  sponsors: Sponsor[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  registrationOpen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export interface EventFormData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venuePincode: string;
  description: string;
  audienceCapacity: number;
  performersCapacity: number;
}