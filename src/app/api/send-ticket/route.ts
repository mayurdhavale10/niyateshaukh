import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationModel from '@/lib/models/Registration';
import EventModel from '@/lib/models/Event';
import { sendTicketEmail } from '@/lib/utils/sendEmail';
import { format } from 'date-fns';

/**
 * POST /api/send-ticket - Send ticket via email
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, email } = body;
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }
    
    // Get registration
    const registration = await RegistrationModel.findOne({ userId });
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }
    
    // Get event details
    const event = await EventModel.findById(registration.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Send email
    const emailSent = await sendTicketEmail({
      to: email,
      name: registration.name,
      userId: registration.userId,
      qrCode: registration.qrCode,
      eventName: event.eventName,
      eventDate: format(new Date(event.eventDate), 'MMMM dd, yyyy'),
      eventTime: event.eventTime,
      venueName: event.venue.name,
      venueAddress: `${event.venue.address}, ${event.venue.city}`,
    });
    
    if (emailSent) {
      // Update registration
      await RegistrationModel.findByIdAndUpdate(registration._id, {
        email: email,
        emailSent: true,
        emailSentAt: new Date(),
      });
      
      return NextResponse.json(
        { success: true, message: 'Ticket sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending ticket:', error);
    return NextResponse.json(
      { error: 'Failed to send ticket' },
      { status: 500 }
    );
  }
}