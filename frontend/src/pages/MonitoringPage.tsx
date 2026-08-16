import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldAlert, 
  Webhook, 
  Clock, 
  CheckCircle2, 
  RotateCw,
  Info,
  Lock
} from 'lucide-react';
import { LocalWorkspaceDB } from '../lib/db.js';
import { startScan } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { MonitoredSite } from '@weblens/shared';
import { formatDate } from '../lib/utils.js';

export const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sites' | 'webhooks'>('sites');
  
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scanningId, setScanningId] = useState<string | null>(null);

  // Form states
  const [newUrl, setNewUrl] = useState<string>('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isAddingSite, setIsAddingSite] = useState<boolean>(false);

  const [webhookName, setWebhookName] = useState<string>('');
  const [webhookType, setWebhookType] = useState<'slack' | 'discord' | 'webhook'>('slack');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isAddingWebhook, setIsAddingWebhook] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const monitorList = await LocalWorkspaceDB.getMonitors();
      setSites(monitorList);
    } catch (err) {
      console.error('Failed to load local monitors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      await LocalWorkspaceDB.saveMonitor({ url: newUrl, frequency: newFrequency });
      setNewUrl('');
      setIsAddingSite(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add monitor', err);
    }
  };

  const handleDeleteSite = async (id: string, domain: string) => {
    if (window.confirm(`Remove continuous monitoring for ${domain}?`)) {
      await LocalWorkspaceDB.deleteMonitor(id);
      await loadData();
    }
  };

  const handleTriggerScan = async (domain: string, id: string) => {
    setScanningId(id);
    try {
      const res = await startScan(domain);
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan.');
      setScanningId(null);
    }
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName || !webhookUrl) return;

    const newHook = {
      id: `wh_${Date.now()}`,
      name: webhookName,
      type: webhookType,
      url: webhookUrl,
      createdAt: new Date().toISOString()
    };

    const updated = [...webhooks, newHook];
    setWebhooks(updated);
    setWebhookName('');
    setWebhookUrl('');
    setIsAddingWebhook(false);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Continuous Monitoring</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated scheduled audits, regression tracking, and local change detection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'sites' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Monitored Sites ({sites.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'webhooks' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Alert Webhooks ({webhooks.length})
          </button>
        </div>
      </div>

      {/* Local-First Architecture Information Alert */}
      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Browser-Assisted Monitoring:</strong> Monitor schedules are saved directly to this workstation. When WebLens is open, audits automatically run according to your configured frequency, keeping all historical regression data strictly private in your browser.
        </div>
      </div>

      {/* Tab 1: Monitored Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Monitoring Schedules</h2>
            <Button size="sm" variant="primary" onClick={() => setIsAddingSite(!isAddingSite)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Website
            </Button>
          </div>

          {/* Add Site Form */}
          {isAddingSite && (
            <form onSubmit={handleAddSite} className="card-glow p-5 rounded-2xl border border-blue-500/30 space-y-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Configure New Monitored Website</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <select
                    value={newFrequency}
                    onChange={(e: any) => setNewFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="daily">Daily Audit</option>
                    <option value="weekly">Weekly Audit</option>
                    <option value="monthly">Monthly Audit</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingSite(false)}>Cancel</Button>
                <Button size="sm" variant="primary" type="submit">Save Monitor</Button>
              </div>
            </form>
          )}

          {/* Sites Table */}
          <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4">Target Domain</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Latest Score</th>
                  <th className="p-4">Next Scheduled Scan</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sites.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {s.domain}
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{s.url}</div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] border border-blue-500/20">
                        {s.frequency}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.lastScore !== null && s.lastScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono text-sm">{s.lastScore}/100</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Pending audit</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(s.nextScanAt).toLocaleDateString()} {new Date(s.nextScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 text-right font-sans space-x-1.5">
                      <button
                        onClick={() => handleTriggerScan(s.domain, s.id)}
                        disabled={scanningId === s.id}
                        title="Run audit now"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                      >
                        {scanningId === s.id ? 'Scanning...' : 'Scan Now'}
                      </button>
                      <button
                        onClick={() => handleDeleteSite(s.id, s.domain)}
                        title="Delete monitor"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 font-sans">
                      No websites are currently scheduled for continuous monitoring. Add a website above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alert Webhook Endpoints</h2>
            <Button size="sm" variant="primary" onClick={() => setIsAddingWebhook(!isAddingWebhook)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Webhook
            </Button>
          </div>

          {isAddingWebhook && (
            <form onSubmit={handleAddWebhook} className="card-glow p-5 rounded-2xl border border-blue-500/30 space-y-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Add Alert Destination</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="e.g. Engineering Slack"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <select
                    value={webhookType}
                    onChange={(e: any) => setWebhookType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="slack">Slack Incoming Webhook</option>
                    <option value="discord">Discord Channel Webhook</option>
                    <option value="webhook">Custom HTTPS Webhook</option>
                  </select>
                </div>
                <div>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingWebhook(false)}>Cancel</Button>
                <Button size="sm" variant="primary" type="submit">Save Destination</Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webhooks.map((w) => (
              <div key={w.id} className="card-glow p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">{w.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{w.url}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWebhook(w.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {webhooks.length === 0 && (
              <div className="col-span-2 card-glow p-8 text-center text-slate-500 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
                No custom webhooks configured. Configure Slack or Discord webhooks above for real-time alerts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
