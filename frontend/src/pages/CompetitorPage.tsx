import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Sparkles, Zap, Search, Eye, ShieldCheck, Smartphone, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { LocalWorkspaceDB } from '../lib/db.js';
import { compareCompetitorDomains } from '../lib/api.js';
import { CompetitorComparisonResult, AuditCategory } from '@weblens/shared';

export const CompetitorPage: React.FC = () => {
  const [url1, setUrl1] = useState<string>('');
  const [url2, setUrl2] = useState<string>('');
  const [url3, setUrl3] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompetitorComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedBenchmarks, setSavedBenchmarks] = useState<any[]>([]);

  const loadSaved = async () => {
    try {
      const list = await LocalWorkspaceDB.getCompetitors();
      setSavedBenchmarks(list);
    } catch {
      setSavedBenchmarks([]);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url1.trim() || !url2.trim()) return;

    setIsLoading(true);
    setError(null);

    const urls = [url1.trim(), url2.trim()];
    if (url3.trim()) urls.push(url3.trim());

    try {
      const data = await compareCompetitorDomains(urls);
      setResult(data);
      // Auto-save benchmark to local IndexedDB
      await LocalWorkspaceDB.saveCompetitor(data);
      await loadSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to benchmark competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    await LocalWorkspaceDB.deleteCompetitor(id);
    await loadSaved();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center">
            <Swords className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-black text-[#F3F0E8] tracking-tight">Competitor Benchmark Matrix</h1>
        </div>
        <p className="text-xs text-[#8E8A82] mt-1">
          Side-by-side comparative analysis of your website against direct competitors across Core Web Vitals, SEO, and Security.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCompare} className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
        <h2 className="text-xs font-bold text-[#D8D4CA] uppercase tracking-wider">Enter Websites to Benchmark</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-[#FF6B35] mb-1 block">Your Website</label>
            <Input
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              placeholder="Enter your website URL..."
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#FF804F] mb-1 block">Competitor A</label>
            <Input
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              placeholder="Enter competitor URL..."
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#8E8A82] mb-1 block">Competitor B (Optional)</label>
            <Input
              value={url3}
              onChange={(e) => setUrl3(e.target.value)}
              placeholder="Enter second competitor URL (optional)..."
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
          <div className="card-glow rounded-2xl p-6 border border-[#FF6B35]/40 bg-[#11151B] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center border border-[#FF6B35]/40">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Benchmark Winner</div>
                <div className="text-xl font-black text-[#F3F0E8]">{result.winnerDomain}</div>
                <div className="text-xs text-[#8E8A82] mt-0.5">Ranked highest in overall technical health and user experience metrics.</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {result.sites.map((site) => (
                <div key={site.domain} className="text-center bg-[#080A0E] px-4 py-2 rounded-xl border border-[rgba(243,240,232,0.08)]">
                  <div className="text-[11px] text-[#8E8A82] font-mono truncate max-w-[100px]">{site.domain}</div>
                  <div className={`text-lg font-black font-mono ${site.domain === result.winnerDomain ? 'text-[#FF6B35]' : 'text-[#F3F0E8]'}`}>
                    {site.overallScore}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparative Category Score Table */}
          <div className="card-glow rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-4">Audit Category</th>
                  {result.sites.map((s) => (
                    <th key={s.domain} className="p-4 text-center">
                      <div className="font-bold text-[#F3F0E8] text-sm">{s.domain}</div>
                      <div className="text-[10px] text-[#6E6A63] font-mono lowercase">{s.url}</div>
                    </th>
                  ))}
                  <th className="p-4 text-right">Category Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const leader = (result.categoryLeaders as any)?.[cat.id];
                  return (
                    <tr key={cat.id} className="hover:bg-[#151A21]/50 transition">
                      <td className="p-4 font-bold text-[#F3F0E8] flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#FF6B35]" />
                        {cat.label}
                      </td>
                      {result.sites.map((s) => {
                        const score = (s.categoryScores as any)?.[cat.id] ?? 0;
                        const isLeader = leader?.domain === s.domain;
                        return (
                          <td key={s.domain} className="p-4 text-center">
                            <span className={`inline-block font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${isLeader ? 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 font-black' : 'bg-[#151A21] text-[#D8D4CA]'}`}>
                              {score}/100
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-4 text-right font-bold text-[#FF6B35] font-mono">
                        {leader?.domain} ({leader?.score})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Competitive AI Insights */}
          <div className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Competitive Intelligence Insights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.insights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#080A0E] border border-[rgba(243,240,232,0.08)] text-xs text-[#D8D4CA] leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F3F0E8]">$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Benchmarks History */}
      {savedBenchmarks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[rgba(243,240,232,0.08)]">
          <h3 className="text-sm font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span>Saved Local Benchmarks ({savedBenchmarks.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedBenchmarks.map((bench) => (
              <div key={bench.id} className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F3F0E8] text-xs">Winner: {bench.winnerDomain}</span>
                  <button
                    onClick={() => handleDeleteSaved(bench.id)}
                    className="p-1 text-[#8E8A82] hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {bench.sites?.map((s: any) => (
                    <span key={s.domain} className="px-2 py-1 bg-[#151A21] border border-[rgba(243,240,232,0.08)] rounded-lg text-[11px] font-mono text-[#D8D4CA]">
                      {s.domain}: <strong className="text-[#FF6B35]">{s.overallScore}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
