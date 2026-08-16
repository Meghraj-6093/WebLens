import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, Smartphone, Heart, Lock, ArrowUpRight } from 'lucide-react';
import { DepthText } from '../ui/DepthText.js';
import { WebLensLogo } from '../brand/WebLensLogo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-3 sm:px-6 lg:px-8 pt-8 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto rounded-3xl border border-[rgba(243,240,232,0.08)] bg-[#0C0F14] relative overflow-hidden shadow-2xl">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-[#FF6B35]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Foreground Content */}
        <div className="px-6 sm:px-10 lg:px-12 pt-10 sm:pt-12 pb-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
            {/* Brand Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="inline-block focus:outline-none" aria-label="WebLens Home">
                <WebLensLogo size="lg" />
              </Link>
              <p className="text-xs text-[#8E8A82] leading-relaxed max-w-sm">
                Precision website diagnostics & technical health auditing. Real-time Core Web Vitals, SEO hierarchy, WCAG accessibility, and security telemetry — persisted privately in your browser.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#11151B] border border-[rgba(243,240,232,0.10)] text-[11px] font-mono text-[#D8D4CA]">
                <Lock className="w-3 h-3 text-[#10B981]" />
                <span>100% Client-Side Privacy</span>
              </div>
            </div>

            {/* Product Column (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F0E8] font-mono">
                Product Suite
              </h4>
              <ul className="space-y-2 text-xs text-[#8E8A82]">
                <li>
                  <Link to="/" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Instant URL Scanner</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Local Dashboard</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/monitoring" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Continuous Monitoring</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/competitors" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Competitor Benchmark Matrix</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Workspace Column (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F0E8] font-mono">
                Workspace & Developer
              </h4>
              <ul className="space-y-2 text-xs text-[#8E8A82]">
                <li>
                  <Link to="/projects" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Project Workspaces</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Audit History & Diffs</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/agency" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Agency & White-Label Studio</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/developers" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Developer REST API</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 group">
                    <span>Storage Telemetry & Backup</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6B35]" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Diagnostic Engines (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F0E8] font-mono">
                Diagnostic Audits
              </h4>
              <ul className="space-y-2 text-xs text-[#8E8A82]">
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#FF6B35] shrink-0" />
                  <span>Core Web Vitals</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#D8D4CA] shrink-0" />
                  <span>Technical SEO</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#10B981] shrink-0" />
                  <span>Security Headers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-[#FF804F] shrink-0" />
                  <span>Mobile Readiness</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(243,240,232,0.08)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8A82] gap-4">
            <div>
              &copy; {new Date().getFullYear()} WebLens. Built for developers, designers, and privacy-conscious web creators.
            </div>
            <div className="flex items-center gap-1 text-[#D8D4CA]">
              Engineered with <Heart className="w-3 h-3 text-[#FF6B35] inline fill-[#FF6B35]" /> for open web quality
            </div>
          </div>
        </div>

        {/* Signature Giant 3D DepthText Wordmark Layer */}
        <div className="relative w-full flex justify-center items-end pt-4 pb-0 overflow-hidden pointer-events-none select-none z-0">
          <DepthText
            text="WEBLENS"
            layers={32}
            depth={2.2}
            faceColor="#F3F0E8"
            depthColor="#FF6B35"
            tilt={5}
            pointerTracking
            smoothing={0.12}
            perspective={1100}
            autoOrbit
            orbitSpeed={0.18}
            fontSize="clamp(4.5rem, 17vw, 14rem)"
            fontWeight={900}
            shadow
            className="tracking-tight"
          />
        </div>
      </div>
    </footer>
  );
};
