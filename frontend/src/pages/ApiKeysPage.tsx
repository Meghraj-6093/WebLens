import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, Trash2, Code2, Terminal, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { ApiKeyRecord, CreateApiKeyResponse } from '@weblens/shared';

export const ApiKeysPage: React.FC = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [keyName, setKeyName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newKeyData, setNewKeyData] = useState<CreateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const token = localStorage.getItem('weblens_token');

  const fetchKeys = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/v1/keys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setKeys(await res.json());
      }
    } catch (err) {
      console.error('Failed to load API keys', err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName || !token) return;
    setIsCreating(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: keyName })
      });

      if (res.ok) {
        const data: CreateApiKeyResponse = await res.json();
        setNewKeyData(data);
        setKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create key', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:3001/api/v1/keys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Developer Public REST API (v1)</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Automate website audits in CI/CD pipelines, custom dashboards, or client platforms using your secret API keys.
        </p>
      </div>

      {/* Secret Key Modal Banner */}
      {newKeyData && (
        <div className="card-glow rounded-2xl p-6 border border-emerald-500/40 bg-emerald-500/5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>New Secret API Key Generated</span>
          </div>
          <p className="text-xs text-slate-300">
            Please copy this secret key now. <strong className="text-white">For your security, it will never be displayed again.</strong>
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={newKeyData.apiKey}
              className="flex-1 bg-slate-900 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => copyToClipboard(newKeyData.apiKey)}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy Key'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNewKeyData(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Create Key Card */}
      <form onSubmit={handleCreateKey} className="card-glow rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Create New API Key</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g. GitHub Actions CI/CD Pipeline"
            required
            className="flex-1"
          />
          <Button
            size="md"
            variant="primary"
            type="submit"
            isLoading={isCreating}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Generate Key
          </Button>
        </div>
      </form>

      {/* Keys Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Secret Keys</h2>
        <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Key Name</th>
                <th className="p-4">Key Prefix</th>
                <th className="p-4">Last Used</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-900/30 transition">
                  <td className="p-4 font-bold text-white">{k.name}</td>
                  <td className="p-4 font-mono text-emerald-400">{k.keyPrefix}</td>
                  <td className="p-4 text-slate-400 font-mono">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    No active API keys found. Generate a secret key above to start using the WebLens API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippets Documentation */}
      <div className="card-glow rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>API Quickstart Examples</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>cURL — Initiate Website Scan</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
{`curl -X POST https://api.weblens.dev/api/v1/scan \\
  -H "Authorization: Bearer weblens_sk_YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
            </pre>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>JavaScript Fetch — Retrieve Audit Report</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
{`const response = await fetch('https://api.weblens.dev/api/v1/scan/SCAN_ID', {
  headers: { 'Authorization': 'Bearer weblens_sk_YOUR_SECRET_KEY' }
});
const report = await response.json();
console.log('Overall Score:', report.overall.score);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
