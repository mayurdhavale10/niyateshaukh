'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, Download, Users, CheckCircle, XCircle, Filter } from 'lucide-react';
import ThreeJSBackground from '@/components/threejsbackground';
import Navbar from '@/components/Navbar';

type Registration = {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  registrationType: 'audience' | 'performer';
  performanceType?: string;
  qrCode: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  eventName: string;
  eventDate?: string;
  eventId: string;
};

export default function RegistrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegs, setFilteredRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audience' | 'performer'>('all');
  const [filterCheckedIn, setFilterCheckedIn] = useState<'all' | 'checked' | 'unchecked'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch registrations
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRegistrations();
    }
  }, [status]);

  // Apply filters
  useEffect(() => {
    let filtered = [...registrations];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.name.toLowerCase().includes(term) ||
          reg.userId.toLowerCase().includes(term) ||
          reg.phone.includes(term) ||
          reg.email?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((reg) => reg.registrationType === filterType);
    }

    // Check-in filter
    if (filterCheckedIn === 'checked') {
      filtered = filtered.filter((reg) => reg.checkedIn);
    } else if (filterCheckedIn === 'unchecked') {
      filtered = filtered.filter((reg) => !reg.checkedIn);
    }

    setFilteredRegs(filtered);
  }, [searchTerm, filterType, filterCheckedIn, registrations]);

  async function fetchRegistrations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/registrations');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch registrations');

      setRegistrations(data.registrations || []);
      setFilteredRegs(data.registrations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    const headers = [
      'User ID',
      'Name',
      'Phone',
      'Email',
      'Type',
      'Performance Type',
      'Checked In',
      'Registered At',
      'Event Name',
    ];

    const rows = filteredRegs.map((reg) => [
      reg.userId,
      reg.name,
      reg.phone,
      reg.email || '',
      reg.registrationType,
      reg.performanceType || '',
      reg.checkedIn ? 'Yes' : 'No',
      new Date(reg.registeredAt).toLocaleString(),
      reg.eventName,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Calculate stats
  const totalRegs = registrations.length;
  const audienceCount = registrations.filter((r) => r.registrationType === 'audience').length;
  const performerCount = registrations.filter((r) => r.registrationType === 'performer').length;
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ThreeJSBackground />
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-white mt-4 text-lg">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <ThreeJSBackground />
      </div>

      <Navbar />

      <main className="relative z-10 w-full px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Registrations
            </h1>
            <p className="text-purple-200 text-lg">
              Manage and view all event registrations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Total</p>
                  <p className="text-white text-3xl font-bold">{totalRegs}</p>
                </div>
                <Users className="text-purple-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Audience</p>
                  <p className="text-white text-3xl font-bold">{audienceCount}</p>
                </div>
                <Users className="text-blue-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-200 text-sm mb-1">Performers</p>
                  <p className="text-white text-3xl font-bold">{performerCount}</p>
                </div>
                <Users className="text-pink-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm mb-1">Checked In</p>
                  <p className="text-white text-3xl font-bold">{checkedInCount}</p>
                </div>
                <CheckCircle className="text-green-400" size={40} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-white text-sm mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, userId, phone, or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:bg-white/15 focus:border-purple-400/50"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-white text-sm mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:bg-white/15 focus:border-purple-400/50 cursor-pointer"
                >
                  <option value="all" className="text-black bg-white">All</option>
                  <option value="audience" className="text-black bg-white">Audience</option>
                  <option value="performer" className="text-black bg-white">Performer</option>
                </select>
              </div>

              {/* Check-in Filter */}
              <div>
                <label className="block text-white text-sm mb-2">Status</label>
                <select
                  value={filterCheckedIn}
                  onChange={(e) => setFilterCheckedIn(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:bg-white/15 focus:border-purple-400/50 cursor-pointer"
                >
                  <option value="all" className="text-black bg-white">All</option>
                  <option value="checked" className="text-black bg-white">Checked In</option>
                  <option value="unchecked" className="text-black bg-white">Not Checked In</option>
                </select>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/30"
              >
                <Download size={20} />
                Download CSV
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Results Count */}
          <div className="text-white mb-4">
            Showing <span className="font-bold text-purple-300">{filteredRegs.length}</span> of{' '}
            <span className="font-bold">{totalRegs}</span> registrations
          </div>

          {/* Registrations Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">User ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        No registrations found
                      </td>
                    </tr>
                  ) : (
                    filteredRegs.map((reg) => (
                      <tr
                        key={reg._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-mono text-sm">{reg.userId}</td>
                        <td className="px-6 py-4 text-white">{reg.name}</td>
                        <td className="px-6 py-4 text-white font-mono text-sm">{reg.phone}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              reg.registrationType === 'performer'
                                ? 'bg-pink-500/20 text-pink-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {reg.registrationType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white text-sm">
                          {reg.performanceType || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {reg.checkedIn ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle size={18} />
                              <span className="text-sm">Checked In</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <XCircle size={18} />
                              <span className="text-sm">Not Yet</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white text-sm">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}