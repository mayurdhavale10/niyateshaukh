import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationModel from '@/lib/models/Registration';
import EventModel from '@/lib/models/Event';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const eventId = searchParams.get('eventId');

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please provide phone number or email' },
        { status: 400 }
      );
    }

    let query: any = {};
    
    if (eventId) {
      query.eventId = eventId;
    }

    if (phone && email) {
      query.$or = [{ phone }, { email }];
    } else if (phone) {
      query.phone = phone;
    } else if (email) {
      query.email = email;
    }

    const registration = await RegistrationModel.findOne(query).lean();

    if (!registration) {
      return NextResponse.json(
        { error: 'No ticket found with the provided information' },
        { status: 404 }
      );
    }

    const event = await EventModel.findById(registration.eventId).lean();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found for this ticket' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration: {
        _id: registration._id.toString(),
        userId: registration.userId,
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        registrationType: registration.registrationType,
        performanceType: registration.performanceType,
        qrCode: registration.qrCode,
        eventName: event.eventName,
        eventDate: event.eventDate,
        registeredAt: registration.registeredAt,
      },
    });

  } catch (error) {
    console.error('❌ Retrieve ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ticket' },
      { status: 500 }
    );
  }
}