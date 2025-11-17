'use client';

import React, { useRef } from 'react';
import * as htmlToImage from 'html-to-image';

type TicketProps = {
  userId: string;
  name: string;
  registrationType: 'audience' | 'performer';
  qrCode: string;
  eventName?: string;
  email?: string;
  onDownload: () => void;
  onEmailTicket?: () => void;
  onRegisterAnother: () => void;
  alreadyRegistered?: boolean;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
};

// TicketBackground Component
type TicketBackgroundProps = {
  children?: React.ReactNode;
  className?: string;
};

const TicketBackground: React.FC<TicketBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`
        relative overflow-hidden 
        bg-gradient-to-br from-black via-black to-[#120015]
        text-white
        rounded-2xl
        ${className}
      `}
    >
      {/* Glowing magenta / purple blobs */}
      <div className="pointer-events-none absolute -top-24 -left-10 h-64 w-64 rounded-full bg-fuchsia-600 opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-purple-600 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-pink-500 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-0 h-56 w-56 rounded-full bg-fuchsia-500 opacity-60 blur-3xl" />
      {/* Slight dark overlay so text stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      {/* Your ticket content goes here */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Main Ticket Component
export default function TicketUI({
  userId,
  name,
  registrationType,
  qrCode,
  eventName,
  email,
  onDownload,
  onEmailTicket,
  onRegisterAnother,
  alreadyRegistered,
  eventDate,
  eventTime,
  venue,
}: TicketProps) {
  // Performance categories
  const categories = ['STORY', 'POETRY', 'SHAYARI', 'MUSIC', 'SINGING'];
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Suppress CORS CSS errors during download
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Filter out CSS CORS errors from html-to-image
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('cssRules') || 
         args[0].includes('CSSStyleSheet') ||
         args[0].includes('SecurityError'))
      ) {
        return; // Silently ignore these specific errors
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError; // Restore on unmount
    };
  }, []);

  // Download entire ticket as image
  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;

    setIsDownloading(true);

    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clone the node to avoid CORS issues with external stylesheets
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#000000',
        skipFonts: false,
        cacheBust: true,
        includeQueryParams: false,
        filter: (node: HTMLElement) => {
          // Filter out problematic elements
          return !node?.classList?.contains('no-capture');
        },
        // This helps avoid CORS issues with stylesheets
        style: {
          transform: 'scale(1)',
        },
      });

      const link = document.createElement('a');
      link.download = `ticket-${userId}.png`;
      link.href = dataUrl;
      link.click();
      
      // Show success briefly
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Silently handle the CORS cssRules error, try fallback
      console.warn('Primary download method encountered an issue, trying fallback...');
      
      try {
        // Fallback: Use toBlob which is more forgiving
        const blob = await htmlToImage.toBlob(ticketRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#000000',
          cacheBust: false,
        });
        
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `ticket-${userId}.png`;
          link.href = url;
          link.click();
          
          // Clean up the object URL after download
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
          throw new Error('Failed to generate blob');
        }
      } catch (fallbackError) {
        console.error('Both download methods failed:', fallbackError);
        alert('Unable to download automatically. Please take a screenshot of your ticket (Press PrtScn or use your phone screenshot feature).');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Already registered banner */}
      {alreadyRegistered && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 backdrop-blur-sm px-4 py-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-blue-300 text-sm text-center font-medium">
            ✓ This number is already registered. Here's your ticket!
          </p>
        </div>
      )}

      {/* Ticket Design with Custom Background */}
      <div ref={ticketRef}>
        <TicketBackground className="border-2 border-purple-500/30 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
            {/* Left Side - Categories & Event Info */}
            <div className="border-b-2 md:border-b-0 md:border-r-2 border-dashed border-white/20 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-start">
              {/* Event Name/Logo & Categories - Side by side on mobile */}
              <div className="flex flex-col">
                {/* Event Name/Logo */}
                <div className="mb-4 md:mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/landing/niyat_logo.webp"
                    alt="Niyat e Shaukh"
                    className="h-8 md:h-12 w-auto filter brightness-0 invert mb-2 md:mb-4"
                  />
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                    {eventName || 'Niyat-e-Shaukh'}
                  </h3>
                </div>

                {/* Performance Categories */}
                <div className="hidden md:block space-y-3 mb-6">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="text-gray-300 text-sm font-medium uppercase tracking-wide"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-xs text-gray-400">
                {eventDate && (
                  <div>
                    <div className="text-purple-300 font-semibold mb-1">DATE</div>
                    <div className="text-white text-xs md:text-sm">{eventDate}</div>
                  </div>
                )}
                {eventTime && (
                  <div className="mt-2">
                    <div className="text-purple-300 font-semibold mb-1">TIME</div>
                    <div className="text-white text-xs md:text-sm">{eventTime}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Ticket Details */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Header with Venue and Ticket Number */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 pb-4 border-b border-white/20 gap-3">
                <div>
                  {venue && (
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white uppercase">
                      {venue}
                    </div>
                  )}
                </div>
                <div className="bg-white/90 px-3 md:px-4 py-2 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1 font-semibold">TICKET NO.</div>
                  <div className="font-mono font-bold text-black text-xs md:text-sm">{userId}</div>
                </div>
              </div>

              {/* ADMIT ONE Banner */}
              <div className="bg-white/90 px-4 md:px-6 py-1.5 md:py-2 rounded-lg mb-4 md:mb-6 inline-block">
                <div className="text-black font-bold text-base md:text-lg tracking-wider">
                  ADMIT ONE
                </div>
              </div>

              {/* Main Ticket Content */}
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 md:gap-6 items-start">
                {/* QR Code Section */}
                <div className="bg-white rounded-xl p-3 md:p-4 border-4 border-white/20 shadow-xl mx-auto sm:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="QR"
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                  />
                </div>

                {/* Ticket Details */}
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-white/20">
                    <div className="text-xs text-purple-200 mb-1">NAME</div>
                    <div className="font-semibold text-white text-base md:text-lg break-words">{name}</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-white/20">
                    <div className="text-xs text-purple-200 mb-1">TYPE</div>
                    <div className="font-semibold text-white text-base md:text-lg capitalize">{registrationType}</div>
                  </div>
                  <div className="bg-pink-600/20 backdrop-blur-sm rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-pink-400/30">
                    <div className="text-xs text-pink-200 font-medium">
                      ⓘ Show this QR at entry. Screenshots accepted.
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories on mobile - shown at bottom */}
              <div className="md:hidden mt-6 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="text-gray-300 text-xs font-medium uppercase tracking-wide bg-white/5 px-3 py-2 rounded-lg text-center"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Perforation Circles - hidden on mobile */}
          <div className="absolute left-[200px] top-1/4 w-4 h-4 bg-gray-900 rounded-full -ml-2 hidden md:block"></div>
          <div className="absolute left-[200px] top-3/4 w-4 h-4 bg-gray-900 rounded-full -ml-2 hidden md:block"></div>
        </TicketBackground>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handleDownloadTicket}
          disabled={isDownloading}
          className="px-6 py-3 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              📥 Download Ticket
            </>
          )}
        </button>
        {email && onEmailTicket && (
          <button
            onClick={onEmailTicket}
            disabled={isDownloading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📧 Email Ticket
          </button>
        )}
        <button
          onClick={onRegisterAnother}
          disabled={isDownloading}
          className="px-6 py-3 rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ Register Another Number
        </button>
      </div>
    </div>
  );
}