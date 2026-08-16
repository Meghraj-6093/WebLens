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
      {/* Background Energy Glow */}
      <div className="absolute top-36 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[360px] bg-gradient-to-b from-[#FF6B35]/6 via-[#FF6B35]/2 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 text-center space-y-10">
        {/* Capability Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/25 text-[#FF6B35] text-[11px] sm:text-xs font-display font-medium shadow-sm max-w-full text-center">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate sm:whitespace-normal">Precision Web Diagnostics • Lighthouse • SEO • A11y • Security</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-[4rem] font-bold text-[#F3F0E8] tracking-[-0.04em] leading-[1.02]">
            See what’s wrong with <br className="hidden sm:inline" />your website.
          </h1>
          <p className="font-sans font-normal text-base sm:text-lg text-[#D8D4CA] max-w-2xl mx-auto leading-relaxed">
            Enter any URL for a comprehensive technical health audit. Results and history are saved directly to your browser with zero accounts or trackers.
          </p>
        </div>

        {/* URL Scanner Input */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleScanSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#11151B] border border-[rgba(243,240,232,0.14)] focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 shadow-2xl shadow-black/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all duration-200"
          >
            <div className="flex items-center gap-3 px-3 flex-1">
              <Search className="w-5 h-5 text-[#8E8A82] shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g., yourwebsite.com)"
                disabled={isLoading}
                className="w-full bg-transparent text-sm sm:text-base text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none font-sans font-normal selection:bg-[#FF6B35] selection:text-[#080A0E]"
              />
            </div>
            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              className="shrink-0 text-sm font-display font-semibold sm:px-6 py-3"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Website
            </Button>
          </form>

          {/* Quick example click chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-[#8E8A82] font-sans">
            <span>Try an example:</span>
            {sampleDomains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setUrl(d)}
                className="font-sans text-xs px-2.5 py-0.5 rounded-md bg-[#151A21] border border-[rgba(243,240,232,0.10)] text-[#D8D4CA] hover:text-[#FF6B35] hover:border-[#FF6B35]/40 transition-colors"
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
            { label: 'Performance', score: '25%', icon: <Zap className="w-4 h-4 text-[#FF6B35]" /> },
            { label: 'SEO Audit', score: '20%', icon: <Globe className="w-4 h-4 text-[#D8D4CA]" /> },
            { label: 'Accessibility', score: '20%', icon: <Sparkles className="w-4 h-4 text-[#10B981]" /> },
            { label: 'Security Headers', score: '15%', icon: <ShieldCheck className="w-4 h-4 text-[#D8D4CA]" /> },
            { label: 'Mobile Readiness', score: '10%', icon: <Smartphone className="w-4 h-4 text-[#FF804F]" /> },
            { label: 'Best Practices', score: '10%', icon: <CheckCircle2 className="w-4 h-4 text-[#D8D4CA]" /> },
          ].map((c, i) => (
            <div
              key={i}
              className="card-glow rounded-xl p-3 border border-[rgba(243,240,232,0.08)] flex items-center justify-between gap-2 text-xs font-medium text-[#D8D4CA]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {c.icon}
                <span className="truncate">{c.label}</span>
              </div>
              <span className="text-[10px] font-mono text-[#8E8A82] shrink-0">{c.score}</span>
            </div>
          ))}
        </div>

        {/* Local-First Architecture Feature Card */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="card-glow rounded-3xl p-6 sm:p-8 border border-[rgba(243,240,232,0.12)] bg-[#11151B] shadow-2xl relative overflow-hidden text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Private, Client-Side Workspace</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] tracking-tight">
                  Zero Sign-In. Stored in Your Browser.
                </h3>
                <p className="text-xs sm:text-sm text-[#D8D4CA] leading-relaxed">
                  WebLens gives you the depth of enterprise observability tooling without sending your history to third-party databases. Scans, workspaces, and benchmarks persist locally in your browser's IndexedDB.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#151A21] text-[#D8D4CA] border border-[rgba(243,240,232,0.10)]">
                    Offline Report Viewing
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#151A21] text-[#D8D4CA] border border-[rgba(243,240,232,0.10)]">
                    JSON Data Export & Import
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#151A21] text-[#D8D4CA] border border-[rgba(243,240,232,0.10)]">
                    SSRF Safe
                  </span>
                </div>
              </div>

              <div className="shrink-0 p-6 bg-[#080A0E] rounded-2xl border border-[rgba(243,240,232,0.10)] flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#F3F0E8]">Browser Persistence</div>
                <div className="text-xs text-[#8E8A82] max-w-[140px]">IndexedDB Local Workspace</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works 3-Step Section */}
        <div className="pt-16 max-w-4xl mx-auto text-left space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
              Diagnostic Workflow
            </h2>
            <h3 className="text-2xl font-bold text-[#F3F0E8] tracking-tight">
              Three steps to complete website clarity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-[#F3F0E8]">1. Enter URL</h4>
              <p className="text-xs text-[#8E8A82] leading-relaxed">
                Provide any public website address. WebLens normalizes the protocol and secures the connection against SSRF vulnerabilities.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-[#F3F0E8]">2. WebLens Scans</h4>
              <p className="text-xs text-[#8E8A82] leading-relaxed">
                Headless Playwright instances measure Core Web Vitals, evaluate WCAG axe-core compliance, and test security response headers in real time.
              </p>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-[#F3F0E8]">3. Fix What’s Wrong</h4>
              <p className="text-xs text-[#8E8A82] leading-relaxed">
                Receive prioritized, step-by-step code snippets, impact analyses, and actionable fixes you can copy and implement immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="pt-12 max-w-3xl mx-auto">
          <div className="card-glow rounded-3xl p-8 border border-[#FF6B35]/30 bg-[#11151B] space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F3F0E8] tracking-tight">
              See what your website is really like under the hood.
            </h3>
            <p className="text-xs sm:text-sm text-[#D8D4CA] max-w-xl mx-auto">
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
