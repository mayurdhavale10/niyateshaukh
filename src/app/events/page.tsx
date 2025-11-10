'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import EventHero from '@/components/events/EventHero';
import ThreeJsBackground from '@/components/threejsbackground';
import EventDetails from '@/components/events/EventDetails';

type EventDoc = {
  _id: string;
  eventName: string;
  photos?: string[];
  mehfilNumber?: number | string;
  eventDate?: string | Date;
  eventTime?: string;
  venue?: { name?: string; address?: string; city?: string; pincode?: string };
  contactEmail?: string;
};

const DEFAULT_EVENT_HERO = '/event/eventniyat.webp';

export default function EventsPage() {
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active event (if any)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' });
        const data = await res.json();
        
        // DEBUG: Log what we're getting from API
        console.log('📡 API Response:', data);
        console.log('🎭 Mehfil Number:', data?.event?.mehfilNumber, 'Type:', typeof data?.event?.mehfilNumber);
        
        setEvent(data?.event ?? null);
      } catch (err) {
        console.error('❌ Failed to fetch event:', err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const heroSrc = event?.photos?.[0] || DEFAULT_EVENT_HERO;

  const formattedDate = useMemo(() => {
    if (!event?.eventDate) return undefined;
    const d = new Date(event.eventDate);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [event?.eventDate]);

  const venueName = useMemo(() => {
    const parts = [event?.venue?.name, event?.venue?.city].filter(Boolean);
    return parts.join(', ') || undefined;
  }, [event?.venue?.name, event?.venue?.city]);

  // DEBUG: Log props being passed to EventHero
  useEffect(() => {
    if (event) {
      console.log('🎯 Props being passed to EventHero:', {
        eventName: event?.eventName,
        mehfilNumber: event?.mehfilNumber,
        eventDate: formattedDate,
        eventTime: event?.eventTime,
        venueName: venueName,
      });
    }
  }, [event, formattedDate, venueName]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ThreeJsBackground />
      </div>

      {/* Foreground */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-24 pb-12">
          <EventHero
            src={heroSrc}
            eventName={event?.eventName}
            mehfilNumber={event?.mehfilNumber}
            eventDate={formattedDate}
            eventTime={event?.eventTime}
            venueName={venueName}
            contactEmail={event?.contactEmail}
            scrollTargetId="registration-section"
          />
        </div>

        {/* Registration Form (Always Visible) */}
        <div id="registration-section" className="container mx-auto px-4 pb-24">
          {loading ? (
            <div className="text-center text-white">
              Loading event details...
            </div>
          ) : (
            <EventDetails eventId={event?._id} />
          )}
        </div>
      </div>
    </div>
  );
}