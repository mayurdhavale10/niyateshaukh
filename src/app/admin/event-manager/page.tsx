'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'] });

type Venue = { name?: string; address?: string; city?: string; pincode?: string };
type EventDoc = {
  _id: string;
  eventName: string;
  eventDate?: string | Date;
  eventTime?: string;
  venue?: Venue;
  description?: string;
  photos?: string[];
  capacity?: { audience: number; performers: number; total: number };
  registered?: { audience: number; performers: number; total: number };
  sponsors?: { name: string; logo: string; website?: string }[];
  status?: 'upcoming' | 'ongoing' | 'completed';
  isActive: boolean;
  registrationOpen: boolean;
  contactEmail?: string;
};

type CreateForm = {
  eventName: string;
  eventDate: string;
  eventTime: string;
  contactEmail: string;
  description: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  pincode: string;
  heroPhotoUrl: string;
  isActive: boolean;
};

const initialCreate: CreateForm = {
  eventName: '',
  eventDate: '',
  eventTime: '',
  contactEmail: '',
  description: '',
  venueName: '',
  venueAddress: '',
  venueCity: '',
  pincode: '',
  heroPhotoUrl: '',
  isActive: false,
};

export default function EventManagerPage() {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [createForm, setCreateForm] = useState<CreateForm>(initialCreate);

  const [activeEvent, setActiveEvent] = useState<EventDoc | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const [savingActive, setSavingActive] = useState(false);
  const [deletingActive, setDeletingActive] = useState(false);

  async function loadActive() {
    setLoadingActive(true);
    setMessage('');
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      const data = await res.json();
      console.log('Loaded active event:', data?.event);
      console.log('Event ID type:', typeof data?.event?._id);
      console.log('Event ID value:', data?.event?._id);
      setActiveEvent(data?.event ?? null);
    } catch {
      setMessage('Failed to load active event.');
    } finally {
      setLoadingActive(false);
    }
  }

  useEffect(() => {
    loadActive();
  }, []);

  const formattedActiveDate = useMemo(() => {
    if (!activeEvent?.eventDate) return '';
    const d = new Date(activeEvent.eventDate);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [activeEvent?.eventDate]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage('');

    try {
      const payload = {
        eventName: createForm.eventName.trim(),
        eventDate: createForm.eventDate ? new Date(createForm.eventDate).toISOString() : undefined,
        eventTime: createForm.eventTime.trim(),
        contactEmail: createForm.contactEmail.trim() || undefined,
        description: createForm.description.trim(),
        venue: {
          name: createForm.venueName.trim() || undefined,
          address: createForm.venueAddress.trim() || undefined,
          city: createForm.venueCity.trim() || undefined,
          pincode: createForm.pincode.trim(),
        } as Venue,
        photos: createForm.heroPhotoUrl ? [createForm.heroPhotoUrl.trim()] : [],
        status: 'upcoming' as const,
        isActive: createForm.isActive,
        registrationOpen: createForm.isActive,
        capacity: { audience: 300, performers: 20, total: 320 },
        registered: { audience: 0, performers: 0, total: 0 },
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data?.error || 'Failed to create event'}`);
      } else {
        setMessage('✅ Event created successfully.');
        setCreateForm(initialCreate);
        await loadActive();
      }
    } catch {
      setMessage('❌ Failed to create event.');
    } finally {
      setCreating(false);
    }
  }

  async function patchActive(update: Partial<EventDoc>) {
    if (!activeEvent?._id) return;
    setSavingActive(true);
    setMessage('');
    try {
      const res = await fetch(`/api/events/${activeEvent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data?.error || 'Failed to update event'}`);
      } else {
        setActiveEvent(data.event);
        setMessage('✅ Saved.');
      }
    } catch {
      setMessage('❌ Failed to update event.');
    } finally {
      setSavingActive(false);
    }
  }

  async function deleteActive() {
    if (!activeEvent?._id) {
      console.error('No active event ID found');
      return;
    }
    
    console.log('Active event object:', activeEvent);
    console.log('Trying to delete event with ID:', activeEvent._id);
    console.log('ID type:', typeof activeEvent._id);
    
    if (!confirm('Are you sure you want to delete the active event? This cannot be undone.')) return;
    
    setDeletingActive(true);
    setMessage('');
    
    try {
      const url = `/api/events/${activeEvent._id}`;
      console.log('DELETE URL:', url);
      
      const res = await fetch(url, { 
        method: 'DELETE',
        cache: 'no-store'
      });
      
      console.log('DELETE Response status:', res.status);
      
      const data = await res.json();
      console.log('DELETE Response data:', data);
      
      if (!res.ok) {
        setMessage(`❌ ${data?.error || 'Failed to delete event'}`);
      } else {
        setMessage('✅ Event deleted successfully.');
        setActiveEvent(null);
        // Force a fresh reload
        setTimeout(() => {
          loadActive();
        }, 500);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('❌ Failed to delete event.');
    } finally {
      setDeletingActive(false);
    }
  }

  return (
    <main className={`min-h-screen bg-gray-950 text-white pb-20 ${lora.className}`}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h1 className="text-3xl md:text-4xl font-semibold">Event Manager</h1>
        <p className="opacity-70 mt-2">Create, update, activate/deactivate events.</p>

        {message && (
          <div className="mt-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
            {message}
          </div>
        )}

        <section className="mt-8 grid md:grid-cols-2 gap-6">
          {/* CREATE NEW */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                placeholder="Event Name (e.g., Niyat-e-Shaukh)"
                value={createForm.eventName}
                onChange={(e) => setCreateForm({ ...createForm, eventName: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  value={createForm.eventDate}
                  onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                  required
                />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Event Time (e.g. 6:30 PM – 10:00 PM)"
                  value={createForm.eventTime}
                  onChange={(e) => setCreateForm({ ...createForm, eventTime: e.target.value })}
                  required
                />
              </div>

              <input
                type="email"
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                placeholder="Contact Email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
              />

              <textarea
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none min-h-[90px]"
                placeholder="Event Description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                required
              />

              <input
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                placeholder="Hero Photo URL (optional)"
                value={createForm.heroPhotoUrl}
                onChange={(e) => setCreateForm({ ...createForm, heroPhotoUrl: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Venue Name"
                  value={createForm.venueName}
                  onChange={(e) => setCreateForm({ ...createForm, venueName: e.target.value })}
                />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="City"
                  value={createForm.venueCity}
                  onChange={(e) => setCreateForm({ ...createForm, venueCity: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Address"
                  value={createForm.venueAddress}
                  onChange={(e) => setCreateForm({ ...createForm, venueAddress: e.target.value })}
                />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Pincode"
                  value={createForm.pincode}
                  onChange={(e) => setCreateForm({ ...createForm, pincode: e.target.value })}
                  required
                  pattern="\d{6}"
                  title="Enter a 6-digit pincode"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  />
                  Make Active & Open Registration
                </label>
              </div>

              <button
                disabled={creating}
                className="mt-2 w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
              >
                {creating ? 'Creating…' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* ACTIVE EVENT PANEL */}
          <div key={activeEvent?._id || 'no-active'} className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <h2 className="text-xl font-semibold mb-4">Active Event</h2>

            {loadingActive ? (
              <p className="opacity-70">Loading…</p>
            ) : !activeEvent ? (
              <p className="opacity-70">No active event right now.</p>
            ) : (
              <div className="space-y-3">
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Event Name (e.g., Niyat-e-Shaukh)"
                  value={activeEvent?.eventName ?? ''}
                  onChange={(e) => setActiveEvent(ev => ev ? { ...ev, eventName: e.target.value } : ev)}
                  onBlur={(e) => activeEvent?._id && patchActive({ eventName: e.target.value || undefined })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    value={
                      activeEvent?.eventDate
                        ? new Date(activeEvent.eventDate).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={(e) =>
                      setActiveEvent(ev =>
                        ev
                          ? {
                              ...ev,
                              eventDate: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : undefined,
                            }
                          : ev
                      )
                    }
                    onBlur={(e) => {
                      if (!activeEvent?._id) return;
                      const v = e.target.value;
                      patchActive({ eventDate: v ? new Date(v).toISOString() : undefined });
                    }}
                  />
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    placeholder="Event Time"
                    value={activeEvent?.eventTime ?? ''}
                    onChange={(e) => setActiveEvent(ev => ev ? { ...ev, eventTime: e.target.value } : ev)}
                    onBlur={(e) => activeEvent?._id && patchActive({ eventTime: e.target.value || undefined })}
                  />
                </div>

                <input
                  type="email"
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Contact Email"
                  value={activeEvent?.contactEmail ?? ''}
                  onChange={(e) =>
                    setActiveEvent(ev => ev ? { ...ev, contactEmail: e.target.value } : ev)
                  }
                  onBlur={(e) => activeEvent?._id && patchActive({ contactEmail: e.target.value || undefined })}
                />

                <textarea
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none min-h-[90px]"
                  placeholder="Event Description"
                  value={activeEvent?.description ?? ''}
                  onChange={(e) => setActiveEvent(ev => ev ? { ...ev, description: e.target.value } : ev)}
                  onBlur={(e) => activeEvent?._id && patchActive({ description: e.target.value || undefined })}
                />

                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                  placeholder="Hero Photo URL"
                  value={activeEvent?.photos?.[0] ?? ''}
                  onChange={(e) =>
                    setActiveEvent(ev =>
                      ev ? { ...ev, photos: e.target.value ? [e.target.value] : [] } : ev
                    )
                  }
                  onBlur={(e) => activeEvent?._id && patchActive({ photos: e.target.value ? [e.target.value] : [] })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    placeholder="Venue Name"
                    value={activeEvent?.venue?.name ?? ''}
                    onChange={(e) =>
                      setActiveEvent(ev =>
                        ev ? { ...ev, venue: { ...(ev.venue ?? {}), name: e.target.value || undefined } } : ev
                      )
                    }
                    onBlur={(e) => activeEvent?._id && patchActive({ venue: { ...(activeEvent.venue ?? {}), name: e.target.value || undefined } })}
                  />
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    placeholder="City"
                    value={activeEvent?.venue?.city ?? ''}
                    onChange={(e) =>
                      setActiveEvent(ev =>
                        ev ? { ...ev, venue: { ...(ev.venue ?? {}), city: e.target.value || undefined } } : ev
                      )
                    }
                    onBlur={(e) => activeEvent?._id && patchActive({ venue: { ...(activeEvent.venue ?? {}), city: e.target.value || undefined } })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    placeholder="Address"
                    value={activeEvent?.venue?.address ?? ''}
                    onChange={(e) =>
                      setActiveEvent(ev =>
                        ev ? { ...ev, venue: { ...(ev.venue ?? {}), address: e.target.value || undefined } } : ev
                      )
                    }
                    onBlur={(e) => activeEvent?._id && patchActive({ venue: { ...(activeEvent.venue ?? {}), address: e.target.value || undefined } })}
                  />
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none"
                    placeholder="Pincode"
                    value={activeEvent?.venue?.pincode ?? ''}
                    onChange={(e) =>
                      setActiveEvent(ev =>
                        ev ? { ...ev, venue: { ...(ev.venue ?? {}), pincode: e.target.value || undefined } } : ev
                      )
                    }
                    onBlur={(e) => activeEvent?._id && patchActive({ venue: { ...(activeEvent.venue ?? {}), pincode: e.target.value || undefined } })}
                  />
                </div>

                {/* Single toggle for both isActive and registrationOpen */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!activeEvent?.isActive}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setActiveEvent(ev => ev ? { ...ev, isActive: checked, registrationOpen: checked } : ev);
                        activeEvent?._id && patchActive({ isActive: checked, registrationOpen: checked });
                      }}
                    />
                    Active & Registration Open
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    disabled={savingActive}
                    onClick={() => loadActive()}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition"
                  >
                    Refresh
                  </button>
                  <button
                    disabled={deletingActive}
                    onClick={deleteActive}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                  >
                    Delete Event
                  </button>
                </div>

                <p className="text-sm opacity-70">
                  Only one event can be active at a time. Activating this event will deactivate others.
                </p>

                <div className="text-sm opacity-80">
                  <div>
                    When: {formattedActiveDate || '—'}
                    {activeEvent.eventTime ? ` • ${activeEvent.eventTime}` : ''}
                  </div>
                  <div>
                    Where:{' '}
                    {[activeEvent.venue?.name, activeEvent.venue?.city].filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}