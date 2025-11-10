// src/components/AdminScanner.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanEntry {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  registrationType: 'performer' | 'audience';
  scannedAt: string;
}

interface NotAttendedUser {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  registrationType: 'performer' | 'audience';
  performanceType?: string;
  registeredAt: string;
}

export default function AdminScanner() {
  const [eventId, setEventId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanEntries, setScanEntries] = useState<ScanEntry[]>([]);
  const [notAttended, setNotAttended] = useState<NotAttendedUser[]>([]);
  const [showNotAttended, setShowNotAttended] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [stats, setStats] = useState({ total: 0, attended: 0, notAttended: 0 });
  const [eventName, setEventName] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerInitialized = useRef(false);

  // Fetch scan entries
  const fetchScanEntries = async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`/api/scan-entries?eventId=${eventId}`);
      const data = await res.json();

      if (data.success) {
        setScanEntries(data.entries);
        if (data.event) {
          setEventName(data.event.eventName);
          setStats({
            total: data.event.registered || 0,
            attended: data.entries.length,
            notAttended: (data.event.registered || 0) - data.entries.length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch scan entries:', error);
    }
  };

  // Fetch not attended list
  const fetchNotAttended = async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`/api/scan-entries/not-attended?eventId=${eventId}`);
      const data = await res.json();

      if (data.success) {
        setNotAttended(data.notAttended);
      }
    } catch (error) {
      console.error('Failed to fetch not attended list:', error);
    }
  };

  // Auto-refresh entries every 5 seconds
  useEffect(() => {
    if (eventId && isScanning) {
      fetchScanEntries();
      const interval = setInterval(fetchScanEntries, 5000);
      return () => clearInterval(interval);
    }
  }, [eventId, isScanning]);

  // Start scanner
  const startScanner = async () => {
    if (!eventId) {
      showMessage('Please enter Event ID first', 'error');
      return;
    }

    try {
      // Fetch initial data
      await fetchScanEntries();

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      scannerInitialized.current = true;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
      showMessage('Scanner started successfully', 'success');
    } catch (err: any) {
      console.error('Scanner start error:', err);
      showMessage('Failed to start scanner: ' + err.message, 'error');
      scannerInitialized.current = false;
    }
  };

  // Stop scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerInitialized.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        scannerInitialized.current = false;
        setIsScanning(false);
        showMessage('Scanner stopped', 'success');
      } catch (err: any) {
        console.error('Scanner stop error:', err);
      }
    }
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText: string) => {
    try {
      // Stop scanner temporarily to prevent multiple scans
      if (scannerRef.current) {
        await scannerRef.current.pause(true);
      }

      // Parse QR code data (expected format: eventId|userId)
      const [scannedEventId, userId] = decodedText.split('|');

      if (scannedEventId !== eventId) {
        showMessage('Invalid QR code - Wrong event', 'error');
        setTimeout(() => {
          if (scannerRef.current) scannerRef.current.resume();
        }, 2000);
        return;
      }

      // Record scan entry
      const res = await fetch('/api/scan-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId }),
      });

      const data = await res.json();

      if (data.success) {
        showMessage(`✅ Entry recorded: ${data.entry.name}`, 'success');
        fetchScanEntries();
      } else if (data.alreadyScanned) {
        showMessage(`⚠️ Already scanned at ${new Date(data.scannedAt).toLocaleTimeString()}`, 'error');
      } else {
        showMessage(data.error || 'Scan failed', 'error');
      }

      // Resume scanner after 2 seconds
      setTimeout(() => {
        if (scannerRef.current) scannerRef.current.resume();
      }, 2000);

    } catch (error: any) {
      console.error('Scan processing error:', error);
      showMessage('Failed to process scan', 'error');
      setTimeout(() => {
        if (scannerRef.current) scannerRef.current.resume();
      }, 2000);
    }
  };

  const onScanFailure = (error: any) => {
    // Silent - scanning is continuous
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Download report
  const downloadReport = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report - ${eventName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .stats { margin: 20px 0; }
          .stats div { margin: 10px 0; font-size: 18px; }
        </style>
      </head>
      <body>
        <h1>Attendance Report: ${eventName}</h1>
        <div class="stats">
          <div><strong>Total Registered:</strong> ${stats.total}</div>
          <div><strong>Attended:</strong> ${stats.attended}</div>
          <div><strong>Not Attended:</strong> ${stats.notAttended}</div>
        </div>
        <h2>Attended List</h2>
        <table>
          <tr>
            <th>S.No</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Entry Time</th>
          </tr>
          ${scanEntries.map((entry, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${entry.userId}</td>
              <td>${entry.name}</td>
              <td>${entry.phone}</td>
              <td>${entry.registrationType}</td>
              <td>${new Date(entry.scannedAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${eventId}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerInitialized.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin QR Scanner</h1>

        {/* Event ID Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event ID
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter Event ID"
              disabled={isScanning}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Start Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Stop Scanner
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Scanner */}
        {isScanning && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
            <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
          </div>
        )}

        {/* Statistics */}
        {eventName && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600 mt-2">Total Registered</div>
            </div>
            <div className="bg-green-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.attended}</div>
              <div className="text-gray-600 mt-2">Attended</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.notAttended}</div>
              <div className="text-gray-600 mt-2">Not Attended</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {scanEntries.length > 0 && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={downloadReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Download Report (HTML)
            </button>
            <button
              onClick={() => {
                setShowNotAttended(!showNotAttended);
                if (!showNotAttended) fetchNotAttended();
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              {showNotAttended ? 'Hide' : 'Show'} Not Attended List
            </button>
          </div>
        )}

        {/* Not Attended List */}
        {showNotAttended && notAttended.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Not Attended ({notAttended.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notAttended.map((user, idx) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.registrationType === 'performer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.registrationType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scan Entries Table */}
        {scanEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Scan Entries ({scanEntries.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scanEntries.map((entry, idx) => (
                    <tr key={entry._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.registrationType === 'performer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.registrationType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.scannedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}