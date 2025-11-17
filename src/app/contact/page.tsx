'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ThreeJsBackground from '@/components/threejsbackground';

// Contact Card Component
function ContactCard({ name, phone }: { name: string; phone: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white text-center">{name}</h3>
        <div className="space-y-3">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{phone}</span>
          </a>
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 border border-white/30 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy Number'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Contact Page
export default function ContactPage() {
  const contacts = [
    {
      name: 'Aditya Barve',
      phone: '+91 90825 42895'
    },
    {
      name: 'Sujeet',
      phone: '+91 90825 42895'
    },
    {
      name: 'Sumeet',
      phone: '+91 80973 95216'
    }
  ];

  const performanceTypes = [
    { title: 'Storytelling', desc: 'Share your captivating narratives and tales' },
    { title: 'Poetry', desc: 'Express yourself through verses and rhymes' },
    { title: 'Music', desc: 'Enchant audiences with melodies and songs' },
    { title: 'Shayari', desc: 'Touch hearts with Urdu poetry and couplets' }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ThreeJsBackground />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Header Section */}
        <div className="w-full px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-12">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-purple-300 max-w-3xl mx-auto leading-relaxed">
              Connect with us to participate in our events celebrating storytelling, poetry, music, and shayari. We welcome artists and performers to join our community.
            </p>
          </div>
        </div>

        {/* Performance Types Grid */}
        <div className="w-full px-4 sm:px-6 md:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Performance Opportunities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceTypes.map((type, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
                  <p className="text-sm text-purple-300 leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Cards - All 3 in one row on desktop */}
        <div className="w-full px-4 sm:px-6 md:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Reach Out Directly
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, index) => (
                <ContactCard key={index} {...contact} />
              ))}
            </div>
          </div>
        </div>

        {/* Email and Instagram Section */}
        <div className="w-full px-4 sm:px-6 md:px-8 py-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-white/20 shadow-xl text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Email Us</h3>
              <p className="text-sm sm:text-base text-purple-300 mb-6">
                For detailed inquiries
              </p>
              <a
                href="mailto:niyateshaukkalyan@gmail.com"
                className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50 break-all text-sm sm:text-base"
              >
                niyateshaukkalyan@gmail.com
              </a>
            </div>

            {/* Instagram Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-white/20 shadow-xl text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Follow Us</h3>
              <p className="text-sm sm:text-base text-purple-300 mb-6">
                Stay updated on Instagram
              </p>
              <a
                href="https://www.instagram.com/niyateshaukh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-pink-500/50 text-sm sm:text-base"
              >
                Visit Our Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}