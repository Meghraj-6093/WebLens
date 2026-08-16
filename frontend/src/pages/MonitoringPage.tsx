import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Bell, 
  Trash2, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  Webhook, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { MonitoredSite, ChangeAlert, WebhookDestination } from '@weblens/shared';

export const MonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sites' | 'alerts' | 'webhooks'>('sites');
  
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [alerts, setAlerts] = useState<ChangeAlert[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookDestination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states
  const [newUrl, setNewUrl] = useState<string>('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isAddingSite, setIsAddingSite] = useState<boolean>(false);

  const [webhookName, setWebhookName] = useState<string>('');
  const [webhookType, setWebhookType] = useState<'slack' | 'discord' | 'webhook'>('slack');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isAddingWebhook, setIsAddingWebhook] = useState<boolean>(false);

  const token = localStorage.getItem('weblens_token');

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [sitesRes, alertsRes, webhooksRes] = await Promise.all([
        fetch('http://localhost:3001/api/monitoring/sites', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/monitoring/alerts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/monitoring/webhooks', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (sitesRes.ok) setSites(await sitesRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (webhooksRes.ok) setWebhooks(await webhooksRes.json());
    } catch (err) {
      console.error('Failed to fetch monitoring data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !token) return;

    try {
      const res = await fetch('http://localhost:3001/api/monitoring/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: newUrl, frequency: newFrequency })
      });
      if (res.ok) {
        setNewUrl('');
        setIsAddingSite(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add site', err);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:3001/api/monitoring/sites/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName || !webhookUrl || !token) return;

    try {
      const res = await fetch('http://localhost:3001/api/monitoring/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: webhookName, type: webhookType, url: webhookUrl })
      });
      if (res.ok) {
        setWebhookName('');
        setWebhookUrl('');
        setIsAddingWebhook(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add webhook', err);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:3001/api/monitoring/webhooks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Continuous Monitoring</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated scheduled audits, regression alerts, and webhook notifications.
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
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'alerts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Regression Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'webhooks' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Webhooks & Slack ({webhooks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Monitored Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Monitor Schedules</h2>
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
                <Button size="sm" variant="primary" type="submit">Start Monitoring</Button>
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
              <tbody className="divide-y divide-slate-800/60">
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
                        <span className="text-slate-500 italic">Pending first run</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(s.nextScanAt).toLocaleDateString()} {new Date(s.nextScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteSite(s.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500">
                      No websites are currently scheduled for continuous monitoring. Add a website above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Regression Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Change & Regression Log</h2>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="card-glow p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${a.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{a.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{a.channel}</span>
                    </div>
                    <p className="text-xs text-slate-400">{a.message}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(a.sentAt).toLocaleString()}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="card-glow p-12 text-center text-slate-500 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
                No regression alerts recorded. All monitored websites are stable!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Alert Webhook Endpoints</h2>
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
          </div>
        </div>
      )}
    </div>
  );
};
