'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if logged-in user is admin
  const isAdmin = session?.user?.email === 'niyateshaukkalyan@gmail.com';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center group -ml-2 sm:-ml-12 md:-ml-24">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/landing/niyat_logo.webp"
                alt="Niyate Shaukh Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <NavButton href="/" label="Home" />
            <NavButton href="/events" label="Events" />
            <NavButton href="/contact" label="Contact" />
            
            {/* Auth Buttons */}
            {status === 'loading' ? (
              <div className="px-4 py-2 text-white text-sm">Loading...</div>
            ) : session ? (
              <>
                {/* Only show Admin button if user is admin */}
                {isAdmin && (
                  <NavButton href="/admin/dashboard" label="Admin" icon={<Shield size={16} />} />
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="relative group px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
                  style={{
                    fontFamily: "'Berkshire Swash', cursive",
                    letterSpacing: '0.02em',
                  }}
                >
                  <div
                    className="absolute inset-0 transition-all duration-300 rounded-lg"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                    }}
                  />
                  <LogOut size={16} className="relative z-10" />
                  <span className="relative z-10 group-hover:text-red-200 transition-colors duration-300">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="relative group px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
                style={{
                  fontFamily: "'Berkshire Swash', cursive",
                  letterSpacing: '0.02em',
                }}
              >
                <div
                  className="absolute inset-0 transition-all duration-300 rounded-lg"
                  style={{
                    background: 'rgba(186, 85, 211, 0.1)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                  style={{
                    background: 'rgba(186, 85, 211, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 0 20px rgba(186, 85, 211, 0.3)',
                  }}
                />
                <LogIn size={16} className="relative z-10" />
                <span className="relative z-10 group-hover:text-purple-200 transition-colors duration-300">
                  Login
                </span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-purple-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              <MobileNavButton 
                href="/" 
                label="Home" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <MobileNavButton 
                href="/events"
                label="Events"
                onClick={() => setMobileMenuOpen(false)} 
              />
              <MobileNavButton 
                href="/contact" 
                label="Contact" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              
              {/* Mobile Auth Buttons */}
              {status === 'loading' ? (
                <div className="px-4 py-3 text-white text-sm">Loading...</div>
              ) : session ? (
                <>
                  {/* Only show Admin button if user is admin */}
                  {isAdmin && (
                    <MobileNavButton 
                      href="/admin/dashboard" 
                      label="Admin Dashboard"
                      icon={<Shield size={18} />}
                      onClick={() => setMobileMenuOpen(false)} 
                    />
                  )}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setMobileMenuOpen(false);
                    }}
                    className="relative group px-4 py-3 text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
                    style={{
                      fontFamily: "'Berkshire Swash', cursive",
                      letterSpacing: '0.02em',
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-300 rounded-lg"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    />
                    <LogOut size={18} className="relative z-10" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signIn('google');
                    setMobileMenuOpen(false);
                  }}
                  className="relative group px-4 py-3 text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
                  style={{
                    fontFamily: "'Berkshire Swash', cursive",
                    letterSpacing: '0.02em',
                  }}
                >
                  <div
                    className="absolute inset-0 transition-all duration-300 rounded-lg"
                    style={{
                      background: 'rgba(186, 85, 211, 0.1)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  />
                  <LogIn size={18} className="relative z-10" />
                  <span className="relative z-10">Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap"
        rel="stylesheet"
      />
    </nav>
  );
}

function NavButton({ 
  href, 
  label, 
  icon 
}: { 
  href: string; 
  label: string; 
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative group px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
      style={{
        fontFamily: "'Berkshire Swash', cursive",
        letterSpacing: '0.02em',
      }}
    >
      <div
        className="absolute inset-0 transition-all duration-300 rounded-lg"
        style={{
          background: 'rgba(186, 85, 211, 0.08)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          background: 'rgba(186, 85, 211, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 20px rgba(186, 85, 211, 0.3)',
        }}
      />
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10 group-hover:text-purple-200 transition-colors duration-300">
        {label}
      </span>
    </Link>
  );
}

function MobileNavButton({ 
  href, 
  label, 
  onClick,
  icon
}: { 
  href: string; 
  label: string; 
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative group px-4 py-3 text-base text-white font-medium overflow-hidden rounded-lg transition-all duration-300 flex items-center gap-2"
      style={{
        fontFamily: "'Berkshire Swash', cursive",
        letterSpacing: '0.02em',
      }}
    >
      <div
        className="absolute inset-0 transition-all duration-300 rounded-lg"
        style={{
          background: 'rgba(186, 85, 211, 0.08)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          background: 'rgba(186, 85, 211, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 20px rgba(186, 85, 211, 0.3)',
        }}
      />
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10 group-active:text-purple-200 transition-colors duration-300">
        {label}
      </span>
    </Link>
  );
}