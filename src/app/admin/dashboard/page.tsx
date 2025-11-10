'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, Users, UserCheck, QrCode, Settings, BarChart3 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-purple-500 border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Berkshire Swash', cursive" }}
              >
                Admin Dashboard
              </h1>
              <p className="text-purple-200 mt-1">
                Welcome back, {session.user?.name || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src={session.user?.image || ''} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-purple-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users size={24} />}
            title="Total Registrations"
            value="0"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<UserCheck size={24} />}
            title="Checked In"
            value="0"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Users size={24} />}
            title="Performers"
            value="0"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<Calendar size={24} />}
            title="Days Left"
            value="TBA"
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              icon={<Settings size={32} />}
              title="Event Manager"
              description="Create and manage events"
              href="/admin/event-manager"
              color="bg-purple-600"
            />
            <ActionCard
              icon={<Users size={32} />}
              title="View Registrations"
              description="See all registered users"
              href="/admin/registrations"
              color="bg-blue-600"
            />
            <ActionCard
              icon={<QrCode size={32} />}
              title="QR Scanner"
              description="Scan tickets at gate"
              href="/admin/scanner"
              color="bg-green-600"
            />
            <ActionCard
              icon={<BarChart3 size={32} />}
              title="Analytics"
              description="View event statistics"
              href="/admin/analytics"
              color="bg-orange-600"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-purple-300 border-opacity-20">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-purple-200 text-center py-8">
            No recent activity. Create an event to get started!
          </div>
        </div>
      </main>

      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-300 border-opacity-20">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} mb-4`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-purple-200 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  );
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="group bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-300 border-opacity-20 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div className={`inline-flex p-3 rounded-lg ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-purple-200 text-sm">{description}</p>
    </a>
  );
}