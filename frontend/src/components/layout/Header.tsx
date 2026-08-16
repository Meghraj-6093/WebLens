import React from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070B14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-mono flex items-center gap-1">
              WebLens
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm group"
            title="Local browser workspace & storage settings"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
            <span>Local Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#070B14]/95 px-4 py-4 space-y-2 backdrop-blur-xl animate-fade-in">
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
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
