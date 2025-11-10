// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EventModel from '@/lib/models/Event';

type Venue = {
  name?: string;
  address?: string;
  city?: string;
  pincode?: string;
};

function isoDateOrUndefined(input?: string) {
  if (!input) return undefined;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * GET /api/events
 * - Return the single active event, or (fallback) the latest upcoming event
 */
export async function GET() {
  try {
    await connectDB();

    // Try active first
    let event = await EventModel.findOne({ isActive: true }).lean();

    // Fallback: latest upcoming by eventDate desc
    if (!event) {
      event = await EventModel.findOne({ status: 'upcoming' })
        .sort({ eventDate: -1 })
        .lean();
    }

    // Convert _id to string for consistent handling
    if (event && event._id) {
      event._id = event._id.toString();
    }

    console.log('[GET /api/events] Returning event:', event?._id, event?.eventName);
    return NextResponse.json({ event: event ?? null }, { status: 200 });
  } catch (e) {
    console.error('[api/events] GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/events
 * - Create a new event
 * - If isActive=true, deactivates all others
 * - registrationOpen should come from client
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Basic validation
    const eventName: string | undefined = body?.eventName?.trim();
    const eventDateISO = isoDateOrUndefined(body?.eventDate);
    const eventTime: string | undefined = body?.eventTime?.trim();
    const description: string | undefined = body?.description?.trim();

    const venue: Venue = {
      name: body?.venue?.name?.trim(),
      address: body?.venue?.address?.trim(),
      city: body?.venue?.city?.trim(),
      pincode: body?.venue?.pincode?.trim(),
    };

    if (!eventName) {
      return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
    }
    if (!eventDateISO) {
      return NextResponse.json({ error: 'Valid eventDate is required' }, { status: 400 });
    }
    if (!eventTime) {
      return NextResponse.json({ error: 'eventTime is required' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }
    if (!venue?.pincode) {
      return NextResponse.json({ error: 'venue.pincode is required' }, { status: 400 });
    }

    const isActive: boolean = !!body?.isActive;
    const registrationOpen: boolean =
      typeof body?.registrationOpen === 'boolean'
        ? body.registrationOpen
        : isActive;

    // If this event is to be active, deactivate others first
    if (isActive) {
      await EventModel.updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const payload = {
      eventName,
      eventDate: eventDateISO,
      eventTime,
      contactEmail: body?.contactEmail?.trim() || undefined,
      description,
      venue,
      photos: Array.isArray(body?.photos) ? body.photos : [],
      sponsors: Array.isArray(body?.sponsors) ? body.sponsors : [],
      capacity: body?.capacity ?? { audience: 300, performers: 20, total: 320 },
      registered: body?.registered ?? { audience: 0, performers: 0, total: 0 },
      status: body?.status ?? 'upcoming',
      isActive,
      registrationOpen,
    };

    const created = await EventModel.create(payload);
    
    // Convert to plain object with string _id
    const createdEvent = created.toObject();
    createdEvent._id = createdEvent._id.toString();
    
    console.log('[POST /api/events] Created event:', createdEvent._id, createdEvent.eventName);
    return NextResponse.json({ event: createdEvent }, { status: 201 });
  } catch (e: any) {
    const msg =
      e?.errors
        ? `Validation failed: ${Object.keys(e.errors).join(', ')}`
        : e?.message || 'Failed to create event';

    console.error('[api/events] POST error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}