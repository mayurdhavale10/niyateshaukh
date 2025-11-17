'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { QrCode, Settings, Users } from 'lucide-react';
import ThreeJSBackground from '@/components/threejsbackground';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ThreeJSBackground />
        <div className="relative z-10">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Three.js Background */}
      <div className="fixed inset-0 z-0">
        <ThreeJSBackground />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 w-full px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Welcome Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Admin Dashboard
            </h1>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <img 
                src={session.user?.image || '/default-avatar.png'} 
                alt="Profile" 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 border-purple-400 shadow-lg"
              />
              <div className="text-left">
                <p className="text-white font-semibold text-base sm:text-lg">
                  {session.user?.name || 'Admin'}
                </p>
                <p className="text-purple-300 text-xs sm:text-sm">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Event Manager Card */}
            <a
              href="/admin/event-manager"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                  <Settings className="text-white" size={40} />
                </div>
                
                {/* Content */}
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-purple-200 transition-colors">
                  Event Manager
                </h3>
                <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                  Create and manage events, update details, and control registrations
                </p>
                
                {/* Arrow Indicator */}
                <div className="mt-4 sm:mt-6 flex items-center text-purple-300 group-hover:text-white transition-colors">
                  <span className="text-sm sm:text-base font-medium">Manage Events</span>
                  <svg 
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Registrations Card */}
            <a
              href="/admin/registrations"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                  <Users className="text-white" size={40} />
                </div>
                
                {/* Content */}
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-blue-200 transition-colors">
                  Registrations
                </h3>
                <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
                  View all registrations, track scanned tickets, and download reports
                </p>
                
                {/* Arrow Indicator */}
                <div className="mt-4 sm:mt-6 flex items-center text-blue-300 group-hover:text-white transition-colors">
                  <span className="text-sm sm:text-base font-medium">View Registrations</span>
                  <svg 
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* QR Scanner Card */}
            <a
              href="/admin/scanner"
              className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-4 sm:mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-xl">
                  <QrCode className="text-white" size={40} />
                </div>
                
                {/* Content */}
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-green-200 transition-colors">
                  QR Scanner
                </h3>
                <p className="text-green-200 text-sm sm:text-base leading-relaxed">
                  Scan tickets at the gate and verify attendee registrations instantly
                </p>
                
                {/* Arrow Indicator */}
                <div className="mt-4 sm:mt-6 flex items-center text-green-300 group-hover:text-white transition-colors">
                  <span className="text-sm sm:text-base font-medium">Scan Tickets</span>
                  <svg 
                    className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* Quick Info Section */}
          <div className="mt-8 sm:mt-12 bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">Quick Tips</h2>
            <div className="space-y-3 text-purple-200 text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">✨</span>
                <p>Use Event Manager to create new events and update existing ones</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">👥</span>
                <p>Registrations page shows all attendees and tracks who has entered the event</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">🎫</span>
                <p>QR Scanner allows you to verify tickets quickly at the venue entrance</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">📱</span>
                <p>All tools work seamlessly on mobile devices for on-the-go management</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}