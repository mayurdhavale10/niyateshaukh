'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThreeJSBackground from '@/components/threejsbackground';
import { BrowserMultiFormatReader } from '@zxing/browser';

type ScannedEntry = {
  userId: string;
  name: string;
  phone: string;
  registrationType: string;
  performanceType?: string;
  scannedAt: string;
  eventId: string;
};

export default function AdminScanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedEntries, setScannedEntries] = useState<ScannedEntry[]>([]);
  const [lastScan, setLastScan] = useState<ScannedEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ZXing & video refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningActiveRef = useRef(false);
  const lastDecodedRef = useRef<string>('');
  const lastDecodedAtRef = useRef<number>(0);

  useEffect(() => {
    loadScannedEntries();
  }, []);

  async function loadScannedEntries() {
    try {
      const res = await fetch('/api/scan-entries');
      if (res.ok) {
        const data = await res.json();
        setScannedEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  }

  // Start/stop the camera when scanning toggles
  useEffect(() => {
    if (!scanning) {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      scanningActiveRef.current = false;
      readerRef.current = null;
      return;
    }

    let isMounted = true;
    setCameraError(null);
    scanningActiveRef.current = true;

    const start = async () => {
      if (!videoRef.current) return;

      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        await reader.decodeFromVideoDevice(
          undefined, // auto-select device
          videoRef.current,
          res => {
            if (!isMounted || !scanningActiveRef.current || !res) return;

            const text = typeof res.getText === 'function' ? res.getText() : '';
            if (!text) return;

            const now = Date.now();
            if (text === lastDecodedRef.current && now - lastDecodedAtRef.current < 1250) return;
            lastDecodedRef.current = text;
            lastDecodedAtRef.current = now;

            handleQRData(text);
          }
        );
      } catch (e: any) {
        console.error(e);
        setCameraError(
          e?.message ||
            'Camera access failed. Ensure permission is granted and you are on HTTPS or localhost.'
        );
        setScanning(false);
      }
    };

    start();

    return () => {
      isMounted = false;
      scanningActiveRef.current = false;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      readerRef.current = null;
    };
  }, [scanning]);

  async function handleQRData(qrData: string) {
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Expecting JSON in the QR code
      let parsed: any;
      try {
        parsed = JSON.parse(qrData);
      } catch {
        throw new Error('Invalid QR code: not JSON');
      }

      const { userId, eventId, name, type, phone } = parsed || {};
      if (!userId || !eventId) throw new Error('Invalid QR code format');

      // already scanned?
      const alreadyScanned = scannedEntries.some(e => e.userId === userId);
      if (alreadyScanned) {
        setError(`Already scanned: ${name ?? 'User'} (${userId})`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // fetch registration details (eventId + userId)
      const res = await fetch(`/api/registrations?eventId=${eventId}&userId=${userId}`);
      let registrationData;
      if (res.ok) {
        const data = await res.json();
        registrationData = data.registration || {
          userId,
          name,
          registrationType: type,
          phone: phone || 'N/A',
        };
      } else {
        // fallback to QR payload (uses phone from QR if present)
        registrationData = {
          userId,
          name,
          registrationType: type,
          phone: phone || 'N/A',
        };
      }

      const scanEntry: ScannedEntry = {
        userId: registrationData.userId || userId,
        name: registrationData.name || name || 'Unknown',
        phone: registrationData.phone || phone || 'N/A',
        registrationType: registrationData.registrationType || type || 'attendee',
        performanceType: registrationData.performanceType,
        scannedAt: new Date().toISOString(),
        eventId,
      };

      // save the scan
      const saveRes = await fetch('/api/scan-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanEntry),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save scan');
      }

      // update UI
      setScannedEntries(prev => [scanEntry, ...prev]);
      setLastScan(scanEntry);
      setSuccess(`✓ Scanned: ${scanEntry.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to process QR code');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  function exportToExcel() {
    if (scannedEntries.length === 0) {
      alert('No entries to export');
      return;
    }

    const headers = ['User ID', 'Name', 'Phone', 'Type', 'Performance Type', 'Scanned At'];
    const rows = scannedEntries.map(e => [
      e.userId,
      e.name,
      e.phone,
      e.registrationType,
      e.performanceType || '-',
      new Date(e.scannedAt).toLocaleString('en-IN'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join(
      '\n'
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scanned_entries_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen relative">
      {/* Three.js Background */}
      <ThreeJSBackground />

      {/* Content Overlay */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Admin QR Scanner
              </h1>
              <p className="text-gray-300">Scan attendee tickets and export data</p>
            </div>

            <div className="w-[180px]"></div>
          </div>

          {/* Camera Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <div className="space-y-4">
              {/* Scanner Controls */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setScanning(s => !s);
                    setCameraError(null);
                  }}
                  className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    scanning
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600'
                  } text-white shadow-lg hover:scale-105 active:scale-95`}
                >
                  <Camera size={24} />
                  {scanning ? 'Stop Scanning' : 'Start Scanner'}
                </button>
              </div>

              {/* Video Preview */}
              {scanning && (
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 border-4 border-purple-500/50 rounded-2xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-2xl animate-pulse" />
                  </div>
                </div>
              )}

              {/* Camera Error */}
              {cameraError && (
                <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4 text-orange-200 text-sm">
                  <p className="font-semibold mb-2">Camera Access Issue</p>
                  <p>{cameraError}</p>
                  <p className="mt-2">On mobile: Settings → Site Settings → Camera → Allow</p>
                </div>
              )}

              {/* Status Messages */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 flex items-center gap-3 text-red-200">
                  <XCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 flex items-center gap-3 text-green-200 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </div>
              )}

              {/* Last Scanned Card */}
              {lastScan && (
                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={20} />
                    Last Scanned Entry
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-200">
                      <Hash size={16} />
                      <span className="opacity-70">ID:</span>
                      <span className="font-mono font-semibold">{lastScan.userId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <User size={16} />
                      <span className="opacity-70">Name:</span>
                      <span className="font-semibold">{lastScan.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Phone size={16} />
                      <span className="opacity-70">Phone:</span>
                      <span className="font-semibold">{lastScan.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Clock size={16} />
                      <span className="opacity-70">Time:</span>
                      <span className="font-semibold">
                        {new Date(lastScan.scannedAt).toLocaleTimeString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scanned Entries Table */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Scanned Entries
                <span className="text-sm font-normal bg-purple-600/30 px-3 py-1 rounded-full">
                  {scannedEntries.length} total
                </span>
              </h2>

              <button
                onClick={exportToExcel}
                disabled={scannedEntries.length === 0}
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Download size={20} />
                Export to Excel
              </button>
            </div>

            {scannedEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Camera size={48} className="mx-auto mb-4 opacity-30" />
                <p>No entries scanned yet. Start scanning to see entries here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-gray-300">
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Performance</th>
                      <th className="px-4 py-3">Scanned At</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-200">
                    {scannedEntries.map((entry, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-purple-300">
                          {entry.userId}
                        </td>
                        <td className="px-4 py-3 font-medium">{entry.name}</td>
                        <td className="px-4 py-3">{entry.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                              entry.registrationType === 'performer'
                                ? 'bg-purple-600/30 text-purple-200'
                                : 'bg-blue-600/30 text-blue-200'
                            }`}
                          >
                            {entry.registrationType}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {entry.performanceType || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(entry.scannedAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
