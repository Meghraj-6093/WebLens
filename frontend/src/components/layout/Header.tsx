import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  HardDrive,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Scanner' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/monitoring', label: 'Monitoring' },
    { to: '/competitors', label: 'Competitors' },
    { to: '/agency', label: 'Agency' },
    { to: '/developers', label: 'API' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        {/* Floating Navbar Pill Container */}
        <div
          className={cn(
            'rounded-2xl sm:rounded-[20px] border transition-all duration-200 px-3.5 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 shadow-xl',
            isScrolled
              ? 'border-[rgba(243,240,232,0.18)] bg-[#0C0F14]/95 backdrop-blur-2xl shadow-2xl shadow-black/80'
              : 'border-[rgba(243,240,232,0.10)] bg-[#0C0F14]/85 backdrop-blur-xl shadow-black/50'
          )}
        >
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF804F] via-[#FF6B35] to-[#D94F20] flex items-center justify-center shadow-md shadow-[#FF6B35]/25 group-hover:scale-105 transition-transform shrink-0">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#F3F0E8] font-mono flex items-center gap-1.5">
                WebLens
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 hidden min-[400px]:inline-block">
                  PRO
                </span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 shadow-sm shadow-[#FF6B35]/10 font-bold'
                        : 'text-[#8E8A82] hover:text-[#F3F0E8] hover:bg-[#151A21]'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Workspace Status Pill & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#11151B] border border-[rgba(243,240,232,0.10)] hover:border-[#FF6B35]/40 text-[11px] sm:text-xs font-medium text-[#D8D4CA] hover:text-[#F3F0E8] transition-all shadow-sm group"
              title="Local browser workspace & storage settings"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#FF6B35] group-hover:text-[#FF804F] shrink-0" />
              <span className="hidden sm:inline">Local Workspace</span>
              <span className="sm:hidden">Local</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse ml-0.5 shrink-0" />
            </Link>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-[#11151B] border border-[rgba(243,240,232,0.10)] text-[#8E8A82] hover:text-[#F3F0E8] focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Floating Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-[rgba(243,240,232,0.14)] bg-[#0C0F14]/95 p-3 space-y-1.5 backdrop-blur-2xl shadow-2xl shadow-black/80 animate-fade-in pointer-events-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 font-bold'
                      : 'text-[#D8D4CA] hover:text-[#F3F0E8] hover:bg-[#151A21]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
