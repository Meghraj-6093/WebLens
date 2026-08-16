import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HardDrive,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { GooeyNav, GooeyNavItem } from '../ui/GooeyNav.js';
import { WebLensLogo } from '../brand/WebLensLogo.js';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: GooeyNavItem[] = useMemo(
    () => [
      { label: 'Scanner', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Competitors', href: '/competitors' },
      { label: 'Agency', href: '/agency' },
      { label: 'API', href: '/developers' },
      { label: 'Profile', href: '/profile' },
    ],
    []
  );

  const activeIndex = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/dashboard')) return 1;
    if (path.startsWith('/monitoring')) return 2;
    if (path.startsWith('/competitor')) return 3;
    if (path.startsWith('/agency')) return 4;
    if (path.startsWith('/developer') || path.startsWith('/api')) return 5;
    if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/project')) return 6;
    return 0;
  }, [location.pathname]);

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
            <Link to="/" className="flex items-center focus:outline-none" aria-label="WebLens Home">
              <WebLensLogo size="md" />
            </Link>

            {/* Desktop Navigation Links with React Bits GooeyNav */}
            <div className="hidden lg:flex items-center">
              <GooeyNav
                items={navLinks}
                activeIndex={activeIndex}
                onNavigate={(item) => navigate(item.href)}
                particleCount={12}
                particleDistances={[65, 10]}
                particleR={75}
                animationTime={500}
                timeVariance={150}
                colors={[1, 1, 1, 2, 2, 3, 1]}
              />
            </div>
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
            {navLinks.map((link, idx) => {
              const isActive = activeIndex === idx;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-[#F3F0E8] text-[#080A0E] font-bold shadow-md shadow-[#FF6B35]/15'
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

export default Header;
