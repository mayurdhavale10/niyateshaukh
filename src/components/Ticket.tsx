'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';

export default function TicketComponent() {
  const router = useRouter();

  const handleGetTickets = () => {
    router.push('/events');
  };

  return (
    <>
      {/* Fixed Bottom Ticket Bar - Full Width like Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={handleGetTickets}
          className="group relative w-full flex items-center justify-center gap-3 px-6 py-5 text-white font-semibold transition-all duration-300 hover:py-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #6a3a8a 0%, #ba55d3 100%)',
            boxShadow: '0 -4px 20px rgba(186, 85, 211, 0.5)',
            fontFamily: "'Lora', serif",
            fontWeight: 700,
          }}
        >
          <Ticket size={28} className="animate-pulse" />
          <span className="text-xl">Get Tickets for Free</span>
          
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at center, rgba(186, 85, 211, 0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </button>
      </div>

      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&display=swap" 
        rel="stylesheet" 
      />
    </>
  );
}