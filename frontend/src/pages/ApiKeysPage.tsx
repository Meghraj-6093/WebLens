import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Send, 
  Activity, 
  Server, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Key,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { testApiEndpoint } from '../lib/api.js';
import { cn } from '../lib/utils.js';

interface EndpointSpec {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  authRequired: boolean;
  defaultBody?: string;
  sampleResponse: string;
}

const AVAILABLE_ENDPOINTS: EndpointSpec[] = [
  {
    id: 'health',
    name: 'Cluster Health & Diagnostics',
    method: 'GET',
    path: '/api/health',
    description: 'Returns real-time cluster health, memory RSS telemetry, worker pool queue depths, and uptime.',
    authRequired: false,
    sampleResponse: JSON.stringify({
      status: 'healthy',
      version: '1.0.0',
      uptimeSeconds: 124,
      system: { nodeVersion: 'v24.19.0', memoryRssMb: 82.4, memoryHeapUsedMb: 41.2 },
      workers: { activeCount: 0, queuedCount: 0, maxConcurrent: 4 },
      database: { status: 'connected', engine: 'node:sqlite' }
    }, null, 2)
  },
  {
    id: 'start_scan',
    name: 'Initiate Website Audit',
    method: 'POST',
    path: '/api/scans',
    description: 'Enqueues a full 6-category technical audit against any public URL with SSRF protection.',
    authRequired: false,
    defaultBody: JSON.stringify({ url: 'https://example.com' }, null, 2),
    sampleResponse: JSON.stringify({
      scanId: 'scan_c6d59b20_18f2',
      status: 'queued',
      url: 'https://example.com/',
      domain: 'example.com',
      createdAt: '2026-08-16T13:45:00.000Z'
    }, null, 2)
  },
  {
    id: 'scan_status',
    name: 'Query Scan Progress',
    method: 'GET',
    path: '/api/scans/DEMO_SCAN_ID',
    description: 'Polls the live progress percentage and current analysis stage for a running scan.',
    authRequired: false,
    sampleResponse: JSON.stringify({
      id: 'scan_c6d59b20_18f2',
      status: 'running',
      stage: 'evaluating_accessibility',
      progress: 65,
      url: 'https://example.com/'
    }, null, 2)
  },
  {
    id: 'scan_results',
    name: 'Retrieve Complete Audit Report',
    method: 'GET',
    path: '/api/scans/DEMO_SCAN_ID/results',
    description: 'Fetches the comprehensive audit payload including category scores, Core Web Vitals, and prioritized issues.',
    authRequired: false,
    sampleResponse: JSON.stringify({
      scan: { id: 'scan_c6d59b20_18f2', domain: 'example.com', status: 'completed' },
      overall: { score: 83, rating: 'good' },
      categories: [
        { category: 'performance', score: 100, rating: 'excellent' },
        { category: 'seo', score: 69, rating: 'average' },
        { category: 'accessibility', score: 86, rating: 'good' }
      ]
    }, null, 2)
  },
  {
    id: 'competitor_benchmark',
    name: 'Multi-Domain Competitor Benchmark',
    method: 'POST',
    path: '/api/competitor/compare',
    description: 'Performs multi-site side-by-side comparative health benchmarking and generates AI competitive intelligence.',
    authRequired: false,
    defaultBody: JSON.stringify({
      urls: ['https://example.com', 'https://news.ycombinator.com']
    }, null, 2),
    sampleResponse: JSON.stringify({
      winnerDomain: 'example.com',
      sites: [
        { domain: 'example.com', overallScore: 83 },
        { domain: 'news.ycombinator.com', overallScore: 78 }
      ],
      insights: ['**example.com** outperforms competitors in server response time.']
    }, null, 2)
  },
  {
    id: 'ai_explain',
    name: 'AI Diagnostic Explainer',
    method: 'POST',
    path: '/api/ai/explain',
    description: 'Generates root-cause developer diagnostics and remediation code snippets for any audit issue.',
    authRequired: false,
    defaultBody: JSON.stringify({
      ruleId: 'missing-h1',
      category: 'seo',
      severity: 'high',
      title: 'Missing top-level <h1> heading',
      description: 'Page does not contain a primary <h1> element for document hierarchy.'
    }, null, 2),
    sampleResponse: JSON.stringify({
      explanation: 'Search crawlers use the <h1> tag as the primary thematic signal for page content.',
      impactAnalysis: 'Missing <h1> tags dilute topic relevance and hurt search index rankings.',
      suggestedFix: '<h1>Main Topic or Brand Headline</h1>'
    }, null, 2)
  }
];

export const ApiKeysPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(AVAILABLE_ENDPOINTS[0]);
  const [requestPath, setRequestPath] = useState<string>(AVAILABLE_ENDPOINTS[0].path);
  const [requestBody, setRequestBody] = useState<string>(AVAILABLE_ENDPOINTS[0].defaultBody || '');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Response console state
  const [responseResult, setResponseResult] = useState<{
    status: number;
    durationMs: number;
    data: any;
    headers: Record<string, string>;
  } | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  const handleSelectEndpoint = (spec: EndpointSpec) => {
    setSelectedEndpoint(spec);
    setRequestPath(spec.path);
    setRequestBody(spec.defaultBody || '');
    setResponseResult(null);
    setResponseError(null);
  };

  const handleExecuteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    setResponseError(null);
    setResponseResult(null);

    try {
      let parsedBody: any = undefined;
      if (selectedEndpoint.method === 'POST' && requestBody.trim()) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch {
          throw new Error('Invalid JSON formatted request body.');
        }
      }

      const result = await testApiEndpoint(requestPath, selectedEndpoint.method, parsedBody);
      setResponseResult(result);
    } catch (err: any) {
      setResponseError(err.message || 'API request failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlSnippet = selectedEndpoint.method === 'POST'
    ? `curl -X POST https://api.weblens.app${requestPath} \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/\n/g, '')}'`
    : `curl -X GET https://api.weblens.app${requestPath} \\
  -H "Content-Type: application/json"`;

  const jsSnippet = selectedEndpoint.method === 'POST'
    ? `const response = await fetch('${requestPath}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${requestBody || '{}'})
});
const data = await response.json();
console.log(data);`
    : `const response = await fetch('${requestPath}');
const data = await response.json();
console.log(data);`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Developer REST API Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive test console, real-time HTTP client, and documentation for the WebLens REST API.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>API Server: Online (/api/health)</span>
        </div>
      </div>

      {/* Main Grid: Endpoints List + Interactive Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Endpoints Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Public Endpoints ({AVAILABLE_ENDPOINTS.length})
          </div>

          <div className="space-y-2">
            {AVAILABLE_ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 group',
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {ep.name}
                    </span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase',
                      ep.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    )}>
                      {ep.method}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">{ep.path}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Runner & Interactive Console */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="card-glow rounded-3xl p-6 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded font-mono text-xs font-bold uppercase',
                    selectedEndpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  )}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-bold text-white text-base font-mono">{requestPath}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.description}</p>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={handleExecuteRequest}
                isLoading={isExecuting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Live Request
              </Button>
            </div>

            {/* Request Editor Form */}
            <form onSubmit={handleExecuteRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Request URL Path</label>
                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {selectedEndpoint.method === 'POST' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">JSON Request Body</label>
                  <textarea
                    rows={4}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 resize-y"
                  />
                </div>
              )}
            </form>

            {/* Live Response Box */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real Server Response</span>
                </div>

                {responseResult && (
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className={cn(
                      'px-2 py-0.5 rounded font-bold',
                      responseResult.status >= 200 && responseResult.status < 300 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    )}>
                      Status: {responseResult.status}
                    </span>
                    <span className="text-slate-400">
                      Duration: <strong>{responseResult.durationMs}ms</strong>
                    </span>
                  </div>
                )}
              </div>

              {responseError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{responseError}</span>
                </div>
              )}

              <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto max-h-80 leading-relaxed selection:bg-emerald-600">
                {responseResult
                  ? JSON.stringify(responseResult.data, null, 2)
                  : selectedEndpoint.sampleResponse}
              </pre>
            </div>
          </div>

          {/* Quickstart Code Snippets */}
          <div className="card-glow rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>Quickstart Code Snippets</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* cURL Snippet */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>cURL Command</span>
                  </div>
                  <button
                    onClick={() => handleCopy(curlSnippet, 'curl')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedCode === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'curl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
                  {curlSnippet}
                </pre>
              </div>

              {/* JS Fetch Snippet */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>JavaScript (Fetch API)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(jsSnippet, 'js')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedCode === 'js' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'js' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
                  {jsSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
