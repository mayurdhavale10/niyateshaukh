// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EventModel from '@/lib/models/Event';
import RegistrationModel from '@/lib/models/Registration';
import ScanEntryModel from '@/lib/models/ScanEntry';

type RouteContext = { params: Promise<{ id: string }> };

type Venue = {
  name?: string;
  address?: string;
  city?: string;
  pincode?: string;
};

function isoOrUndefined(input?: string | Date | null) {
  if (!input) return undefined;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

// remove keys with undefined (shallow)
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k in obj) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out as Partial<T>;
}

// Safely get a plain object from a Mongoose doc or return the input if it's already plain/null
function toPlain<T>(val: T): T {
  const anyVal = val as any;
  if (anyVal && typeof anyVal.toObject === 'function') {
    return anyVal.toObject();
  }
  return val;
}

/**
 * GET /api/events/[id] – get one event by id
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    const event = await EventModel.findById(id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (e) {
    console.error('[api/events/[id]] GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/events/[id] – update fields of an event
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const current = await EventModel.findById(id);
    if (!current) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventName: string | undefined = body?.eventName?.trim?.();
    const eventDateISO = isoOrUndefined(body?.eventDate);
    const eventTime: string | undefined = body?.eventTime?.trim?.();
    const description: string | undefined = body?.description?.trim?.();
    const contactEmail: string | undefined = body?.contactEmail?.trim?.();
    const mehfilNumber: string | number | undefined = body?.mehfilNumber;

    const photos: string[] | undefined = Array.isArray(body?.photos)
      ? body.photos
      : undefined;

    const sponsors: any[] | undefined = Array.isArray(body?.sponsors)
      ? body.sponsors
      : undefined;

    let venue: Venue | undefined;
    if (body?.venue && typeof body.venue === 'object') {
      const incoming: Venue = {
        name: body.venue.name?.trim?.(),
        address: body.venue.address?.trim?.(),
        city: body.venue.city?.trim?.(),
        pincode: body.venue.pincode?.trim?.(),
      };

      const existingVenue: Venue = toPlain(current.venue ?? {});
      venue = {
        ...existingVenue,
        ...compact(incoming),
      };
    }

    const capacity =
      body?.capacity && typeof body.capacity === 'object'
        ? body.capacity
        : undefined;

    const registered =
      body?.registered && typeof body.registered === 'object'
        ? body.registered
        : undefined;

    const status: 'upcoming' | 'ongoing' | 'completed' | undefined =
      body?.status;

    const isActive: boolean | undefined =
      typeof body?.isActive === 'boolean' ? body.isActive : undefined;

    const registrationOpen: boolean | undefined =
      typeof body?.registrationOpen === 'boolean' ? body.registrationOpen : undefined;

    const update = compact({
      eventName,
      eventDate: eventDateISO,
      eventTime,
      description,
      contactEmail,
      mehfilNumber,
      photos,
      sponsors,
      venue,
      capacity,
      registered,
      status,
      isActive,
      registrationOpen,
    });

    if (update.isActive === true) {
      await EventModel.updateMany(
        { _id: { $ne: current._id }, isActive: true },
        { $set: { isActive: false } }
      );
    }

    const updated = await EventModel.findByIdAndUpdate(current._id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ event: updated }, { status: 200 });
  } catch (e: any) {
    const msg =
      e?.errors
        ? `Validation failed: ${Object.keys(e.errors).join(', ')}`
        : e?.message || 'Failed to update event';

    console.error('[api/events/[id]] PATCH error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id] – delete an event, all its registrations, and all scan entries
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    
    console.log('[DELETE] Attempting to delete event with ID:', id);
    
    if (!id || id.length !== 24) {
      console.log('[DELETE] Invalid ID format');
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }
    
    const deleted = await EventModel.findByIdAndDelete(id);
    
    if (!deleted) {
      console.log('[DELETE] Event not found with ID:', id);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete all registrations for this event
    const deletedRegs = await RegistrationModel.deleteMany({ eventId: id });
    console.log(`[DELETE] Deleted ${deletedRegs.deletedCount} registrations for event:`, id);

    // ✅ DELETE ALL SCAN ENTRIES FOR THIS EVENT
    const deletedScans = await ScanEntryModel.deleteMany({ eventId: id });
    console.log(`[DELETE] Deleted ${deletedScans.deletedCount} scan entries for event:`, id);

    console.log('[DELETE] Successfully deleted event:', deleted._id);
    return NextResponse.json({ 
      success: true, 
      message: 'Event, registrations, and scan entries deleted successfully',
      deletedRegistrations: deletedRegs.deletedCount,
      deletedScanEntries: deletedScans.deletedCount
    }, { status: 200 });
  } catch (e: any) {
    console.error('[api/events/[id]] DELETE error:', e);
    return NextResponse.json({ error: `Failed to delete event: ${e?.message}` }, { status: 500 });
  }
}