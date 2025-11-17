'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
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

        {/* Event Header - Shows event name and key details */}
        <div className="w-full px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
          <div className="w-full text-center space-y-3 sm:space-y-4">
            {/* Event Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-2">
              {event?.eventName || 'Niyat e Shaukh'}
            </h1>
            
            {/* Mehfil Number */}
            {event?.mehfilNumber && (
              <p className="text-lg sm:text-xl md:text-2xl text-purple-300 font-medium">
                Mehfil {event.mehfilNumber}
              </p>
            )}

            {/* Event Details Grid */}
            <div className="max-w-3xl mx-auto mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Date */}
              {formattedDate && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">📅</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Date</p>
                      <p className="font-semibold text-white text-sm sm:text-base">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time */}
              {event?.eventTime && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">🕐</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Time</p>
                      <p className="font-semibold text-white text-sm sm:text-base">{event.eventTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {venueName && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-center sm:flex-col gap-2 sm:gap-1">
                    <span className="text-3xl sm:text-4xl">📍</span>
                    <div className="text-left sm:text-center flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm text-purple-300 font-medium mb-0.5 sm:mb-1">Location</p>
                      <p className="font-semibold text-white text-sm sm:text-base break-words">{venueName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Form - Appears right after header */}
        <div id="registration-section" className="w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="w-full">
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-white mt-4 text-sm sm:text-base">Loading event details...</p>
              </div>
            ) : (
              <EventDetails eventId={event?._id} />
            )}
          </div>
        </div>

        {/* Hero Image - Appears last */}
        <div className="w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={heroSrc}
                alt={event?.eventName || 'Event'}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        {event?.contactEmail && (
          <div className="w-full px-3 sm:px-4 md:px-6 py-8 sm:py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Contact Us
                </h2>
                <p className="text-sm sm:text-base text-purple-300">
                  Have questions? We're here to help!
                </p>
              </div>
              <a
                href={`mailto:${event.contactEmail}`}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">✉️</span>
                <span className="break-all">{event.contactEmail}</span>
              </a>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8 sm:h-12"></div>
      </div>
    </div>
  );
}