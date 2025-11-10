'use client';

import React, { useEffect, useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'] });

type Props = {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  height?: string;
  eventName?: string;
  mehfilNumber?: number | string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  contactEmail?: string;
  scrollTargetId?: string;
};

export default function EventHero({
  src,
  alt = 'Event',
  fallbackSrc = '/event/eventniyat.webp',
  height = 'h-[50vh]',
  eventName,
  mehfilNumber,
  eventDate,
  eventTime,
  venueName,
  contactEmail = 'niyateshaukh@gmail.com',
  scrollTargetId = 'event-details',
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);

  // Only use fallback if prop is null/undefined/empty string
  const name = eventName && eventName.trim() ? eventName : 'Niyat-e-Shaukh';
  const mehfil = mehfilNumber && String(mehfilNumber).trim() ? String(mehfilNumber) : 'Coming Soon';
  const date = eventDate && eventDate.trim() ? eventDate : 'Coming Soon';
  const time = eventTime && eventTime.trim() ? eventTime : 'Coming Soon';
  const location = venueName && venueName.trim() ? venueName : 'Coming Soon';

  const handleScrollToForm = () => {
    const el = document.getElementById(scrollTargetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mt-24">
      {/* Event image with overlay button */}
      <div className={`relative w-full overflow-hidden rounded-3xl bg-black ${height}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-500 ease-out"
          onError={() => setImgSrc(fallbackSrc)}
        />

        {/* subtle gradient so button is legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/30 rounded-3xl" />

        {/* Register Now button overlay */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button
            onClick={handleScrollToForm}
            className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.03] ${lora.className}`}
            aria-label="Register Now"
          >
            Register Now
          </button>
        </div>
      </div>

      {/* Highlighted Info Section */}
      <div
        className={`mt-10 px-6 py-8 md:px-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl max-w-5xl mx-auto ${lora.className}`}
      >
        {/* Event Name Header */}
        <div className="text-center mb-6 pb-6 border-b border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-2">
            {name}
          </h2>
          {mehfil !== 'Coming Soon' && (
            <p className="text-lg md:text-xl text-purple-400 font-medium">
              Mehfil No. <span className="text-white font-semibold">{mehfil}</span>
            </p>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left mb-8">
          <div>
            <p className="text-sm text-purple-400 font-medium mb-1">Date</p>
            <p className="text-lg text-white font-semibold">{date}</p>
          </div>
          <div>
            <p className="text-sm text-purple-400 font-medium mb-1">Time</p>
            <p className="text-lg text-white font-semibold">{time}</p>
          </div>
          <div>
            <p className="text-sm text-purple-400 font-medium mb-1">Location</p>
            <p className="text-lg text-white font-semibold">{location}</p>
          </div>
        </div>

        {/* Contact Button */}
        <div className="flex justify-center">
          <a
            href={`mailto:${contactEmail}`}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold transition-all duration-300 hover:scale-[1.05]"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}