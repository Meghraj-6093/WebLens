import React, { useState } from 'react';
import { Swords, Trophy, Sparkles, ExternalLink, ArrowRight, ShieldCheck, Zap, Search, Eye, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { CompetitorComparisonResult, AuditCategory } from '@weblens/shared';

export const CompetitorPage: React.FC = () => {
  const [url1, setUrl1] = useState<string>('https://example.com');
  const [url2, setUrl2] = useState<string>('https://news.ycombinator.com');
  const [url3, setUrl3] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompetitorComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url1 || !url2) return;

    setIsLoading(true);
    setError(null);

    const urls = [url1, url2];
    if (url3.trim()) urls.push(url3.trim());

    try {
      const res = await fetch('http://localhost:3001/api/competitor/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Comparison failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to benchmark competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const categories: Array<{ id: AuditCategory; label: string; icon: any }> = [
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'best_practices', label: 'Best Practices', icon: CheckCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Swords className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Competitor Benchmark Matrix</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Side-by-side comparative analysis of your website against direct competitors across Core Web Vitals, SEO, and Security.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCompare} className="card-glow rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enter Websites to Benchmark</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-blue-400 mb-1 block">Your Website</label>
            <Input
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              placeholder="https://yourwebsite.com"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-amber-400 mb-1 block">Competitor A</label>
            <Input
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              placeholder="https://competitor-a.com"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-purple-400 mb-1 block">Competitor B (Optional)</label>
            <Input
              value={url3}
              onChange={(e) => setUrl3(e.target.value)}
              placeholder="https://competitor-b.com"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            size="md"
            variant="primary"
            type="submit"
            isLoading={isLoading}
            leftIcon={<Swords className="w-4 h-4" />}
          >
            {isLoading ? 'Benchmarking Sites...' : 'Run Competitor Benchmark'}
          </Button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-fade-in">
          {/* Winner Banner */}
          <div className="card-glow rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Benchmark Winner</div>
                <div className="text-xl font-black text-white">{result.winnerDomain}</div>
                <div className="text-xs text-slate-400 mt-0.5">Ranked highest in overall technical health and user experience metrics.</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {result.sites.map((site) => (
                <div key={site.domain} className="text-center bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono truncate max-w-[100px]">{site.domain}</div>
                  <div className={`text-lg font-black font-mono ${site.domain === result.winnerDomain ? 'text-amber-400' : 'text-white'}`}>
                    {site.overallScore}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparative Category Score Table */}
          <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-4">Audit Category</th>
                  {result.sites.map((s) => (
                    <th key={s.domain} className="p-4 text-center">
                      <div className="font-bold text-white text-sm">{s.domain}</div>
                      <div className="text-[10px] text-slate-500 font-mono lowercase">{s.url}</div>
                    </th>
                  ))}
                  <th className="p-4 text-right">Category Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const leader = (result.categoryLeaders as any)?.[cat.id];
                  return (
                    <tr key={cat.id} className="hover:bg-slate-900/30 transition">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-400" />
                        {cat.label}
                      </td>
                      {result.sites.map((s) => {
                        const score = (s.categoryScores as any)?.[cat.id] ?? 0;
                        const isLeader = leader?.domain === s.domain;
                        return (
                          <td key={s.domain} className="p-4 text-center">
                            <span className={`inline-block font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${isLeader ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-slate-800 text-slate-300'}`}>
                              {score}/100
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-4 text-right font-bold text-emerald-400 font-mono">
                        {leader?.domain} ({leader?.score})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Competitive AI Insights */}
          <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Competitive Intelligence Insights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.insights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
