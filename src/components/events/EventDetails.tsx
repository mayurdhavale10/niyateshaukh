'use client';

import React, { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'] });

type Props = {
  eventId?: string;
  eventName?: string;
};

type SuccessReg = {
  _id: string;
  userId: string;
  qrCode: string;
  name: string;
  registrationType: 'audience' | 'performer';
};

export default function EventDetails({ eventId, eventName }: Props) {
  const [mode, setMode] = useState<'audience' | 'performer'>('audience');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [perfType, setPerfType] = useState<'story' | 'poetry' | 'shayari' | 'music' | 'singing' | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessReg | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAlreadyRegistered(false);

    if (!eventId) {
      setError('Event unavailable right now.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    if (mode === 'performer' && !perfType) {
      setError('Please choose your performance type.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          registrationType: mode,
          performanceType: mode === 'performer' ? perfType : undefined,
        }),
      });
      const data = await res.json();
      
      // Check if this is an existing registration
      if (data.alreadyRegistered) {
        const r = data.registration;
        setSuccess({
          _id: r._id,
          userId: r.userId,
          qrCode: r.qrCode,
          name: r.name,
          registrationType: r.registrationType,
        });
        setAlreadyRegistered(true);
        return;
      }
      
      if (!res.ok) throw new Error(data?.error || 'Failed to register');

      const r = data.registration;
      setSuccess({
        _id: r._id,
        userId: r.userId,
        qrCode: r.qrCode,
        name: r.name,
        registrationType: r.registrationType,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function downloadTicket() {
    if (!success?.qrCode) return;
    const link = document.createElement('a');
    link.href = success.qrCode;
    link.download = `${success.userId}.png`;
    link.click();
  }

  function resetForm() {
    setSuccess(null);
    setAlreadyRegistered(false);
    setName('');
    setPhone('');
    setEmail('');
    setPerfType('');
    setError(null);
  }

  return (
    <section
      className={`mt-12 max-w-3xl mx-auto relative ${lora.className}`}
    >
      {/* Glassmorphic container with enhanced effects */}
      <div className="relative rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/20 p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        {/* Animated gradient orbs for depth */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            ENTER YOUR DETAILS FOR TICKETS
          </h3>

          {!success ? (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Register as */}
              <div>
                <label className="block text-sm mb-2 opacity-90 font-medium">Register as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('audience')}
                    className={`py-3 rounded-2xl border transition-all duration-300 ${
                      mode === 'audience'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400/50 shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    Audience
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('performer')}
                    className={`py-3 rounded-2xl border transition-all duration-300 ${
                      mode === 'performer'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400/50 shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    Performer
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm mb-2 opacity-90 font-medium">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/20 px-4 py-3 outline-none text-white placeholder-gray-400 focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner"
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm mb-2 opacity-90 font-medium">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/20 px-4 py-3 outline-none text-white placeholder-gray-400 focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-sm mb-2 opacity-90 font-medium">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/20 px-4 py-3 outline-none text-white placeholder-gray-400 focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner"
                  placeholder="you@example.com"
                />
              </div>

              {/* Performance type (only if performer) */}
              {mode === 'performer' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm mb-2 opacity-90 font-medium">
                    Performance Type
                  </label>
                  <div className="relative">
                    <select
                      value={perfType}
                      onChange={(e) => setPerfType(e.target.value as any)}
                      className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm text-white border border-white/20 px-4 py-3 outline-none appearance-none focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner cursor-pointer"
                    >
                      <option value="" className="text-black bg-white">
                        Select
                      </option>
                      <option value="story" className="text-black bg-white">
                        STORY
                      </option>
                      <option value="poetry" className="text-black bg-white">
                        POETRY
                      </option>
                      <option value="shayari" className="text-black bg-white">
                        SHAYARI
                      </option>
                      <option value="music" className="text-black bg-white">
                        MUSIC
                      </option>
                      <option value="singing" className="text-black bg-white">
                        SINGING
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center opacity-70">
                      ▾
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-400/30 backdrop-blur-sm px-4 py-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? 'Generating Ticket…' : 'Generate Ticket'}
                </button>
              </div>
            </form>
          ) : (
            // Ticket Preview with enhanced glass effect
            <div className="space-y-4">
              {/* Already registered banner */}
              {alreadyRegistered && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 backdrop-blur-sm px-4 py-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-blue-300 text-sm text-center font-medium">
                    ✓ This number is already registered. Here's your ticket!
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/30 bg-white/[0.05] backdrop-blur-xl p-5 md:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/landing/niyat_logo.webp"
                      alt="Niyat e Shaukh"
                      className="h-8 w-auto"
                    />
                    <div className="text-lg font-semibold">
                      {eventName || 'Niyat-e-Shaukh'}
                    </div>
                  </div>
                  <div className="text-xs opacity-70 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <span className="font-mono">{success.userId}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={success.qrCode}
                      alt="QR"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                      <span className="opacity-70">Name: </span>
                      <span className="font-medium">{success.name}</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                      <span className="opacity-70">Type: </span>
                      <span className="font-medium capitalize">{success.registrationType}</span>
                    </div>
                    <div className="text-xs opacity-70 bg-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-400/20">
                      Show this QR at entry. Screenshots accepted.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadTicket}
                    className="px-6 py-3 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Download QR
                  </button>
                  {email && (
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/send-ticket', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: success.userId,
                              email,
                            }),
                          });
                          alert('Ticket emailed!');
                        } catch {
                          alert('Email failed');
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Email Ticket
                    </button>
                  )}
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 rounded-2xl border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Register Another Number
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}