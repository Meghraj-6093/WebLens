import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Globe, Smartphone, Heart, Sparkles, Server, Swords, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#070A12] mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white">WebLens PRO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant, comprehensive website health diagnostics. Discover performance, SEO, accessibility, and security issues with actionable developer fixes.
            </p>
          </div>

          {/* Audit Engines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Audit Engines</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Core Web Vitals & Perf</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-blue-400" /> Technical SEO & Indexing</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Security & SSL Headers</li>
              <li className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-purple-400" /> Mobile & Touch Targets</li>
            </ul>
          </div>

          {/* Platform Solutions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Platform Solutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Instant URL Scanner</Link></li>
              <li><Link to="/demo" className="hover:text-blue-400 transition-colors">Interactive Demo Report</Link></li>
              <li><Link to="/monitoring" className="hover:text-blue-400 transition-colors">Continuous Automated Monitoring</Link></li>
              <li><Link to="/competitors" className="hover:text-blue-400 transition-colors">3-Way Competitor Benchmark</Link></li>
              <li><Link to="/agency" className="hover:text-blue-400 transition-colors">Agency & White-Label Studio</Link></li>
              <li><Link to="/developers" className="hover:text-blue-400 transition-colors">Developer Public REST API</Link></li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Security & Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safe, non-destructive scans on publicly accessible headers and DOM structures. Fully protected with strict multi-layer SSRF filtering.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Production Hardened
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} WebLens. Built for developers, designers, and web creators.
          </div>
          <div className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for open web quality
          </div>
        </div>
      </div>
    </footer>
  );
};
