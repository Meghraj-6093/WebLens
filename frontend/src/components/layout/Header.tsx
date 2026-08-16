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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--glass-x', `${x}%`);
    e.currentTarget.style.setProperty('--glass-y', `${y}%`);
  };

  const navLinks: GooeyNavItem[] = useMemo(
    () => [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Competitors', href: '/competitors' },
      { label: 'Agency', href: '/agency' },
      { label: 'API', href: '/developers' },
    ],
    []
  );

  const activeIndex = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 0;
    if (path.startsWith('/monitoring')) return 1;
    if (path.startsWith('/competitor')) return 2;
    if (path.startsWith('/agency')) return 3;
    if (path.startsWith('/developer') || path.startsWith('/api')) return 4;
    return -1; // When on '/' (home/scanner) or '/profile' (workspace), no secondary item is active
  }, [location.pathname]);

  return (
    <header className="sticky top-3.5 sm:top-4 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        {/* Floating Apple Liquid Glass Navbar Container */}
        <div
          onMouseMove={handleMouseMove}
          className={cn(
            'liquid-glass-navbar rounded-full px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between gap-3 sm:gap-4',
            isScrolled && 'scrolled'
          )}
        >
          {/* Region 1 (Left): Brand Logo & Wordmark */}
          <div className="flex items-center justify-start shrink-0 relative z-10">
            <Link
              to="/"
              className="flex items-center group transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] rounded-full"
              aria-label="WebLens Home"
            >
              <WebLensLogo size="md" />
            </Link>
          </div>

          {/* Region 2 (Center): Centered Secondary Navigation Controls with GooeyNav */}
          <div className="hidden lg:flex items-center justify-center justify-self-center relative z-10">
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

          {/* Region 3 (Right): Local Workspace (Profile / Settings Entry Point) & Mobile Menu Toggle */}
          <div className="flex items-center justify-end justify-self-end gap-2 sm:gap-3 shrink-0 relative z-10">
            <Link
              to="/profile"
              className={cn(
                'liquid-glass-capsule inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-display font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] group',
                location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings')
                  ? 'border-[#FF6B35]/50 bg-[#151A21]/90 text-[#F3F0E8] shadow-sm shadow-[#FF6B35]/20'
                  : 'text-[#D8D4CA] hover:text-[#F3F0E8]'
              )}
              title="Local browser workspace & audit storage"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#FF6B35] group-hover:text-[#FF804F] shrink-0" />
              <span className="hidden sm:inline">Local Workspace</span>
              <span className="sm:hidden">Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse ml-0.5 shrink-0" />
            </Link>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="liquid-glass-capsule lg:hidden p-1.5 sm:p-2 rounded-xl text-[#8E8A82] hover:text-[#F3F0E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Floating Liquid Glass Drawer */}
        {mobileMenuOpen && (
          <div className="liquid-glass-drawer lg:hidden mt-2.5 rounded-2xl p-3 space-y-1.5 animate-fade-in pointer-events-auto">
            {navLinks.map((link, idx) => {
              const isActive = activeIndex === idx;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3.5 py-2.5 rounded-xl text-xs font-display font-semibold transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-[#F3F0E8] to-[#D8D4CA] text-[#080A0E] font-bold shadow-md shadow-[#FF6B35]/20'
                      : 'text-[#D8D4CA] hover:text-[#F3F0E8] hover:bg-[#151A21]/60'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[rgba(243,240,232,0.08)]">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-display font-semibold text-[#D8D4CA] hover:text-[#F3F0E8] hover:bg-[#151A21]/60"
              >
                <span className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Local Workspace</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
