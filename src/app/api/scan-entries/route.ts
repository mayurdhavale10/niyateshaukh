// src/app/api/scan-entries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScanEntryModel from '@/lib/models/ScanEntry';
import RegistrationModel from '@/lib/models/Registration';
import EventModel from '@/lib/models/Event';

// TypeScript interfaces for type safety
interface IScanEntry {
  _id?: any;
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  registrationType: string;
  scannedAt: Date;
  __v?: number;
}

interface IRegistration {
  _id?: any;
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  registrationType: string;
  __v?: number;
}

interface IEvent {
  _id?: any;
  eventName: string;
  registered: number;
  __v?: number;
}

/**
 * GET /api/scan-entries?eventId=xxx
 * Get all scanned entries for an event
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get all scanned entries for this event, sorted by scan time (most recent first)
    const entries = await ScanEntryModel.find({ eventId })
      .sort({ scannedAt: -1 })
      .lean() as IScanEntry[];

    // Get event details
    const event = await EventModel.findById(eventId).lean() as IEvent | null;

    return NextResponse.json({
      success: true,
      entries: entries.map((entry) => ({
        _id: entry._id?.toString() || '',
        userId: entry.userId,
        name: entry.name,
        phone: entry.phone,
        registrationType: entry.registrationType,
        scannedAt: entry.scannedAt,
      })),
      event: event ? {
        _id: event._id?.toString() || '',
        eventName: event.eventName,
        registered: event.registered,
      } : null,
    });

  } catch (error) {
    console.error('❌ Get scan entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scan entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scan-entries
 * Record a new scan entry
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { eventId, userId } = body;

    // Validation
    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields (eventId, userId)' },
        { status: 400 }
      );
    }

    // Check if this userId exists in registrations
    const registration = await RegistrationModel.findOne({
      eventId,
      userId,
    }).lean() as IRegistration | null;

    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid ticket - Registration not found' },
        { status: 404 }
      );
    }

    // Check if already scanned
    const existingScan = await ScanEntryModel.findOne({
      eventId,
      userId,
    }).lean() as IScanEntry | null;

    if (existingScan) {
      return NextResponse.json(
        { 
          error: 'This ticket has already been scanned',
          alreadyScanned: true,
          scannedAt: existingScan.scannedAt,
        },
        { status: 400 }
      );
    }

    // Create scan entry
    const scanEntry = await ScanEntryModel.create({
      eventId,
      userId: registration.userId,
      name: registration.name,
      phone: registration.phone,
      registrationType: registration.registrationType,
      scannedAt: new Date(),
    });

    console.log('✅ Scan entry created:', scanEntry.userId);

    return NextResponse.json({
      success: true,
      entry: {
        _id: scanEntry._id?.toString() || '',
        userId: scanEntry.userId,
        name: scanEntry.name,
        phone: scanEntry.phone,
        registrationType: scanEntry.registrationType,
        scannedAt: scanEntry.scannedAt,
      },
    });

  } catch (error: any) {
    console.error('❌ Create scan entry error:', error);
    
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          error: 'This ticket has already been scanned',
          alreadyScanned: true,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record scan entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scan-entries?eventId=xxx
 * Delete all scan entries for an event (called when event is deleted)
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Delete all scan entries for this event
    const result = await ScanEntryModel.deleteMany({ eventId });

    console.log(`✅ Deleted ${result.deletedCount} scan entries for event ${eventId}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error('❌ Delete scan entries error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scan entries' },
      { status: 500 }
    );
  }
}