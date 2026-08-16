import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Sparkles, Activity, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                WebLens
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-1 hidden sm:block">Website Health Scanner</span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-400" />
            Audit
          </Link>
          <Link to="/demo" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sample Report
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/demo')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Live Demo
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            New Scan
          </Link>
        </div>
      </div>
    </header>
  );
};
