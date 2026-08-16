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
            'rounded-2xl sm:rounded-[20px] border transition-all duration-200 px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 shadow-xl',
            isScrolled
              ? 'border-slate-700/80 bg-[#0B101E]/95 backdrop-blur-2xl shadow-2xl shadow-black/60'
              : 'border-slate-800/90 bg-[#0B101E]/80 backdrop-blur-xl shadow-black/40'
          )}
        >
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
                WebLens
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden min-[400px]:inline-block">
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
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-950/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm group"
              title="Local browser workspace & storage settings"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0" />
              <span className="hidden sm:inline">Local Workspace</span>
              <span className="sm:hidden">Local</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" />
            </Link>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Floating Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl border border-slate-800/90 bg-[#0B101E]/95 p-3 space-y-1.5 backdrop-blur-2xl shadow-2xl shadow-black/70 animate-fade-in pointer-events-auto">
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
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
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
