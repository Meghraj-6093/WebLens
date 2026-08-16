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
  Activity,
  AlertCircle
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
      {/* Background glow effects */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-8">
        {/* Capability Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified Website Diagnostics • Lighthouse • SEO • A11y • Security</span>
        </div>

        {/* Heading */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Know exactly what’s wrong with your website.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Scan any public URL for performance, SEO, accessibility, security headers, and mobile readiness in one clear, actionable developer report.
          </p>
        </div>

        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleScanSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-blue-500 shadow-2xl shadow-blue-950/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 px-3 flex-1">
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
              className="shrink-0 text-sm font-semibold sm:px-6"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Website
            </Button>
          </form>

          {/* Quick example clicks */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span>Try an example:</span>
            {sampleDomains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setUrl(d)}
                className="font-mono text-slate-400 hover:text-blue-400 hover:underline transition-colors"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Capability Strip */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {[
            { label: 'Performance', icon: <Zap className="w-4 h-4 text-amber-400" /> },
            { label: 'SEO Audit', icon: <Globe className="w-4 h-4 text-blue-400" /> },
            { label: 'Accessibility', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
            { label: 'Security Headers', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
            { label: 'Mobile Readiness', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
            { label: 'Best Practices', icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" /> },
          ].map((c, i) => (
            <div
              key={i}
              className="card-glow rounded-xl p-3 border border-slate-800/80 flex items-center justify-center gap-2 text-xs font-medium text-slate-300"
            >
              {c.icon}
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        {/* How It Works 3-Step */}
        <div className="pt-16 max-w-4xl mx-auto text-left">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-blue-400 mb-8">
            How WebLens Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Enter Your URL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide any public website URL. Our system validates the target and isolates the connection with strict SSRF defenses.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Multithreaded Scan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Playwright and audit engines inspect Core Web Vitals, WCAG a11y rules, SSL/TLS certificates, and response headers.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Fix What Matters</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive prioritized, step-by-step code fixes and technical explanations instead of confusing raw metric dumps.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Report Preview Callout */}
        <div className="pt-10 max-w-2xl mx-auto">
          <div className="card-glow rounded-2xl p-6 border border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Instant Preview</div>
              <h4 className="text-base font-bold text-white mt-0.5">Want to explore without scanning?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Open a pre-generated sample report to see the full dashboard and waterfall charts.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/demo')}
              className="shrink-0"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Explore Sample Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
