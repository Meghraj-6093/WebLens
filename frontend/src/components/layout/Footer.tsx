import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Globe, Smartphone, Heart, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[rgba(243,240,232,0.08)] bg-[#05070A] mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF804F] to-[#D94F20] flex items-center justify-center shadow-sm">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-[#F3F0E8] font-mono">WebLens PRO</span>
            </div>
            <p className="text-xs text-[#8E8A82] leading-relaxed">
              Private, local-first website diagnostics. Measure performance, SEO, accessibility, and security with zero accounts or trackers.
            </p>
          </div>

          {/* Audit Engines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D8D4CA] mb-3">Diagnostic Engines</h4>
            <ul className="space-y-2 text-xs text-[#8E8A82]">
              <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#FF6B35]" /> Core Web Vitals & Perf</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-[#D8D4CA]" /> Technical SEO & Hierarchy</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-[#10B981]" /> Security & Header Audits</li>
              <li className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-[#D8D4CA]" /> Mobile & Responsive Ready</li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D8D4CA] mb-3">Local Workspace</h4>
            <ul className="space-y-2 text-xs text-[#8E8A82]">
              <li><Link to="/" className="hover:text-[#FF6B35] transition-colors">Instant URL Scanner</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#FF6B35] transition-colors">Local Dashboard</Link></li>
              <li><Link to="/monitoring" className="hover:text-[#FF6B35] transition-colors">Continuous Monitoring</Link></li>
              <li><Link to="/competitors" className="hover:text-[#FF6B35] transition-colors">Competitor Benchmark Matrix</Link></li>
              <li><Link to="/agency" className="hover:text-[#FF6B35] transition-colors">Agency Studio & Workspaces</Link></li>
              <li><Link to="/developers" className="hover:text-[#FF6B35] transition-colors">Developer REST API</Link></li>
              <li><Link to="/profile" className="hover:text-[#FF6B35] transition-colors">Storage & Data Backup</Link></li>
            </ul>
          </div>

          {/* Privacy & Storage */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D8D4CA] mb-3">Private & Local-First</h4>
            <p className="text-xs text-[#8E8A82] leading-relaxed">
              Your audit history, workspaces, and reports are persisted directly in this browser's IndexedDB. No login or cloud database required.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11151B] border border-[rgba(243,240,232,0.10)] text-[11px] font-mono text-[#D8D4CA]">
              <Lock className="w-3 h-3 text-[#10B981]" /> 100% Client-Side Privacy
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(243,240,232,0.08)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E6A63] gap-4">
          <div>
            &copy; {new Date().getFullYear()} WebLens. Built for developers, designers, and privacy-conscious web creators.
          </div>
          <div className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-[#FF6B35] inline fill-[#FF6B35]" /> for open web quality
          </div>
        </div>
      </div>
    </footer>
  );
};
