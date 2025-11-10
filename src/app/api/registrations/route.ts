import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationModel from '@/lib/models/Registration';
import EventModel from '@/lib/models/Event';

/**
 * GET /api/registrations - Retrieve existing ticket by phone/email
 */
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

/**
 * POST /api/registrations - Create new registration or return existing
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      eventId,
      name,
      phone,
      email,
      registrationType,
      performanceType,
    } = body;

    // Validation
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    if (!registrationType || !['audience', 'performer'].includes(registrationType)) {
      return NextResponse.json(
        { error: 'Invalid registration type' },
        { status: 400 }
      );
    }

    if (registrationType === 'performer' && !performanceType) {
      return NextResponse.json(
        { error: 'Performance type is required for performers' },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.registrationOpen) {
      return NextResponse.json(
        { error: 'Registration is currently closed for this event' },
        { status: 400 }
      );
    }

    // ⭐ CHECK IF PHONE NUMBER ALREADY REGISTERED FOR THIS EVENT
    const existingRegistration = await RegistrationModel.findOne({
      eventId,
      phone: phone.trim(),
    }).lean();

    if (existingRegistration) {
      console.log('📱 Phone already registered, returning existing ticket:', existingRegistration.userId);
      
      // Return the existing registration with a flag
      return NextResponse.json(
        {
          registration: {
            _id: existingRegistration._id.toString(),
            userId: existingRegistration.userId,
            name: existingRegistration.name,
            phone: existingRegistration.phone,
            email: existingRegistration.email,
            registrationType: existingRegistration.registrationType,
            performanceType: existingRegistration.performanceType,
            qrCode: existingRegistration.qrCode,
            registeredAt: existingRegistration.registeredAt,
          },
          alreadyRegistered: true,
          message: 'This phone number is already registered for this event',
        },
        { status: 200 }
      );
    }

    // Check capacity
    const capacityKey = registrationType === 'performer' ? 'performers' : 'audience';
    if (event.registered[capacityKey] >= event.capacity[capacityKey]) {
      return NextResponse.json(
        { error: `Sorry, ${registrationType} slots are full` },
        { status: 400 }
      );
    }

    // Generate unique user ID
    const count = await RegistrationModel.countDocuments({ eventId });
    const paddedCount = String(count + 1).padStart(4, '0');
    const prefix = registrationType === 'performer' ? 'P' : 'A';
    const userId = `${prefix}${paddedCount}`;

    // Create QR code data
    const qrData = JSON.stringify({
      userId,
      eventId,
      name: name.trim(),
      type: registrationType,
    });

    // Generate QR code (you'll need to implement this based on your QR library)
    // For now, using a placeholder - replace with actual QR generation
    const QRCode = require('qrcode');
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Create registration
    const registration = await RegistrationModel.create({
      eventId,
      userId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      registrationType,
      performanceType: registrationType === 'performer' ? performanceType : undefined,
      qrCode: qrCodeDataURL,
      registeredAt: new Date(),
    });

    // Update event registration counts
    await EventModel.findByIdAndUpdate(eventId, {
      $inc: {
        [`registered.${capacityKey}`]: 1,
        'registered.total': 1,
      },
    });

    console.log('✅ New registration created:', userId);

    return NextResponse.json(
      {
        registration: {
          _id: registration._id.toString(),
          userId: registration.userId,
          name: registration.name,
          phone: registration.phone,
          email: registration.email,
          registrationType: registration.registrationType,
          performanceType: registration.performanceType,
          qrCode: registration.qrCode,
          registeredAt: registration.registeredAt,
        },
        alreadyRegistered: false,
        message: 'Registration successful',
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' },
      { status: 500 }
    );
  }
}