// src/app/api/scan-entries/not-attended/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScanEntryModel from '@/lib/models/ScanEntry';
import RegistrationModel from '@/lib/models/Registration';

/**
 * GET /api/scan-entries/not-attended?eventId=xxx
 * Get list of registered users who did not attend
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

    // Get all registrations for this event
    const allRegistrations = await RegistrationModel.find({ eventId })
      .select('userId name phone email registrationType performanceType registeredAt')
      .lean();

    // Get all scanned entries for this event
    const scannedEntries = await ScanEntryModel.find({ eventId })
      .select('userId')
      .lean();

    // Create a set of scanned userIds for quick lookup
    const scannedUserIds = new Set(scannedEntries.map(entry => entry.userId));

    // Filter registrations to find those who didn't attend
    const notAttended = allRegistrations.filter(
      reg => !scannedUserIds.has(reg.userId)
    );

    return NextResponse.json({
      success: true,
      notAttended: notAttended.map(reg => ({
        _id: reg._id.toString(),
        userId: reg.userId,
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        registrationType: reg.registrationType,
        performanceType: reg.performanceType,
        registeredAt: reg.registeredAt,
      })),
      total: notAttended.length,
    });

  } catch (error) {
    console.error('❌ Get not attended error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch not attended list' },
      { status: 500 }
    );
  }
}