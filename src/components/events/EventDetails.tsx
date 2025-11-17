'use client';

import React, { useState } from 'react';
import { Lora } from 'next/font/google';
import TicketUI from './ticketui';

const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'] });

type Props = {
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
};

type SuccessReg = {
  _id: string;
  userId: string;
  qrCode: string;
  name: string;
  registrationType: 'audience' | 'performer';
};

export default function EventDetails({ 
  eventId, 
  eventName,
  eventDate = "18 November 2025",
  eventTime = "6-9pm",
  venue = "KALYAN, KALYAN"
}: Props) {
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

  async function handleEmailTicket() {
    if (!success || !email) return;
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
  }

  return (
    <section className={`mt-12 w-full relative ${lora.className}`}>
      <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
        ENTER YOUR DETAILS FOR TICKETS
      </h3>

      {!success ? (
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Register as */}
          <div>
            <label className="block text-sm mb-2 opacity-90 font-medium text-white">Register as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('audience')}
                className={`py-3 rounded-2xl border transition-all duration-300 ${
                  mode === 'audience'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400/50 shadow-lg shadow-purple-500/30 text-white'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white'
                }`}
              >
                Audience
              </button>
              <button
                type="button"
                onClick={() => setMode('performer')}
                className={`py-3 rounded-2xl border transition-all duration-300 ${
                  mode === 'performer'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400/50 shadow-lg shadow-purple-500/30 text-white'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white'
                }`}
              >
                Performer
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm mb-2 opacity-90 font-medium text-white">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/20 px-4 py-3 outline-none text-white placeholder-gray-400 focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner"
              placeholder="Your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-2 opacity-90 font-medium text-white">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/20 px-4 py-3 outline-none text-white placeholder-gray-400 focus:bg-white/[0.12] focus:border-purple-400/50 transition-all duration-300 shadow-inner"
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm mb-2 opacity-90 font-medium text-white">Email (optional)</label>
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
              <label className="block text-sm mb-2 opacity-90 font-medium text-white">
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
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center opacity-70 text-white">
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] text-white"
            >
              {loading ? 'Generating Ticket…' : 'Generate Ticket'}
            </button>
          </div>
        </form>
      ) : (
        <TicketUI
          userId={success.userId}
          name={success.name}
          registrationType={success.registrationType}
          qrCode={success.qrCode}
          eventName={eventName}
          email={email}
          onDownload={downloadTicket}
          onEmailTicket={email ? handleEmailTicket : undefined}
          onRegisterAnother={resetForm}
          alreadyRegistered={alreadyRegistered}
          eventDate={eventDate}
          eventTime={eventTime}
          venue={venue}
        />
      )}
    </section>
  );
}