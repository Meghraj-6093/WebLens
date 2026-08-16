import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { 
  Search, 
  Sparkles, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  HardDrive
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await startScan(url.trim());
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start audit.');
      setIsLoading(false);
    }
  };

  const sampleDomains = [
    'stripe.com',
    'github.com',
    'vercel.com',
    'linear.app',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Background Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[480px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center space-y-10">
        {/* Capability Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-semibold shadow-sm max-w-full text-center">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate sm:whitespace-normal">Local-First Diagnostics • Lighthouse • SEO • Security</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            See what’s wrong with your website.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enter any URL for a comprehensive technical health audit. Results and history are saved directly to your browser with zero accounts or trackers.
          </p>
        </div>

        {/* URL Scanner Input */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleScanSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-2xl shadow-blue-950/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all duration-200"
          >
            <div className="flex items-center gap-3 px-3 flex-1">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g., yourwebsite.com)"
                disabled={isLoading}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono selection:bg-blue-600"
              />
            </div>
            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              className="shrink-0 text-sm font-semibold sm:px-6 py-3"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Website
            </Button>
          </form>

          {/* Quick example click chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-slate-500">
            <span>Try an example:</span>
            {sampleDomains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setUrl(d)}
                className="font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Capability Badges Strip */}
        <div className="pt-4 grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
          {[
            { label: 'Performance', score: '25%', icon: <Zap className="w-4 h-4 text-amber-400" /> },
            { label: 'SEO Audit', score: '20%', icon: <Globe className="w-4 h-4 text-blue-400" /> },
            { label: 'Accessibility', score: '20%', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
            { label: 'Security Headers', score: '15%', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
            { label: 'Mobile Readiness', score: '10%', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
            { label: 'Best Practices', score: '10%', icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" /> },
          ].map((c, i) => (
            <div
              key={i}
              className="card-glow rounded-xl p-3 border border-slate-800/80 flex items-center justify-between gap-2 text-xs font-medium text-slate-300"
            >
              <div className="flex items-center gap-2 min-w-0">
                {c.icon}
                <span className="truncate">{c.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">{c.score}</span>
            </div>
          ))}
        </div>

        {/* Local-First Architecture Feature Card */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#080D18] shadow-2xl relative overflow-hidden text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Private, Client-Side Workspace</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Zero Sign-In. Stored in Your Browser.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  WebLens gives you the depth of enterprise observability tooling without sending your history to third-party databases. Scans, workspaces, and benchmarks persist locally in your browser's IndexedDB.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Offline Report Viewing
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    JSON Data Export & Import
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    SSRF Safe
                  </span>
                </div>
              </div>

              <div className="shrink-0 p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">Browser Persistence</div>
                <div className="text-xs text-slate-500 max-w-[140px]">IndexedDB Local Workspace</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works 3-Step Section */}
        <div className="pt-16 max-w-4xl mx-auto text-left space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Audit Workflow
            </h2>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Three steps to complete website clarity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-white">1. Enter URL</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide any public website address. WebLens normalizes the protocol and secures the connection against SSRF vulnerabilities.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-white">2. WebLens Scans</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Headless Playwright instances measure Core Web Vitals, evaluate WCAG axe-core compliance, and test security response headers in real time.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-white">3. Fix What’s Wrong</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive prioritized, step-by-step code snippets, impact analyses, and actionable fixes you can copy and implement immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="pt-12 max-w-3xl mx-auto">
          <div className="card-glow rounded-3xl p-8 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              See what your website is really like under the hood.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Run a comprehensive technical audit in seconds. No account or configuration required.
            </p>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Analyze Website Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
