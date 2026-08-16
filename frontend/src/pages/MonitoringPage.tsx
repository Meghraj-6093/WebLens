import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Webhook, 
  Clock, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { LocalWorkspaceDB } from '../lib/db.js';
import { startScan } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { MonitoredSite } from '@weblens/shared';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F3F0E8] tracking-tight">Continuous Monitoring</h1>
          </div>
          <p className="text-xs text-[#8E8A82] mt-1">
            Automated scheduled audits, regression tracking, and local change detection.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#11151B] p-1 rounded-xl border border-[rgba(243,240,232,0.08)]">
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'sites' ? 'bg-[#FF6B35] text-[#080A0E] font-bold shadow' : 'text-[#8E8A82] hover:text-[#F3F0E8]'}`}
          >
            Monitored Sites ({sites.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'webhooks' ? 'bg-[#FF6B35] text-[#080A0E] font-bold shadow' : 'text-[#8E8A82] hover:text-[#F3F0E8]'}`}
          >
            Alert Webhooks ({webhooks.length})
          </button>
        </div>
      </div>

      {/* Local-First Architecture Information Alert */}
      <div className="p-4 rounded-2xl bg-[#151A21] border border-[#FF6B35]/25 text-xs text-[#D8D4CA] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#F3F0E8]">Browser-Assisted Monitoring:</strong> Monitor schedules are saved directly to this workstation. When WebLens is open, audits automatically run according to your configured frequency, keeping all historical regression data strictly private in your browser.
        </div>
      </div>

      {/* Tab 1: Monitored Sites */}
      {activeTab === 'sites' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-[#8E8A82] uppercase tracking-wider">Active Monitoring Schedules</h2>
            <Button size="sm" variant="primary" onClick={() => setIsAddingSite(!isAddingSite)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Website
            </Button>
          </div>

          {/* Add Site Form */}
          {isAddingSite && (
            <form onSubmit={handleAddSite} className="card-glow p-5 rounded-2xl border border-[#FF6B35]/30 bg-[#11151B] space-y-4">
              <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Configure New Monitored Website</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Enter website URL (e.g. yourwebsite.com)..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <select
                    value={newFrequency}
                    onChange={(e: any) => setNewFrequency(e.target.value)}
                    className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3 py-2.5 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#FF6B35]"
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
          <div className="card-glow rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4">Target Domain</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Latest Score</th>
                  <th className="p-4">Next Scheduled Scan</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)] font-mono">
                {sites.map((s) => (
                  <tr key={s.id} className="hover:bg-[#151A21]/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-[#F3F0E8] flex items-center gap-2">
                        {s.domain}
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#8E8A82] hover:text-[#FF6B35]">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-[#6E6A63] font-mono truncate max-w-xs">{s.url}</div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-[#FF6B35]/15 text-[#FF6B35] font-mono text-[11px] border border-[#FF6B35]/30">
                        {s.frequency}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.lastScore !== null && s.lastScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FF6B35] font-mono text-sm">{s.lastScore}/100</span>
                        </div>
                      ) : (
                        <span className="text-[#6E6A63] italic">Pending audit</span>
                      )}
                    </td>
                    <td className="p-4 text-[#8E8A82] font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8E8A82]" />
                        {new Date(s.nextScanAt).toLocaleDateString()} {new Date(s.nextScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 text-right font-sans space-x-1.5">
                      <button
                        onClick={() => handleTriggerScan(s.domain, s.id)}
                        disabled={scanningId === s.id}
                        title="Run audit now"
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FF6B35]/15 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-[#080A0E] transition"
                      >
                        {scanningId === s.id ? 'Scanning...' : 'Scan Now'}
                      </button>
                      <button
                        onClick={() => handleDeleteSite(s.id, s.domain)}
                        title="Delete monitor"
                        className="p-1.5 rounded-lg text-[#8E8A82] hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sites.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-[#8E8A82] font-sans">
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
            <h2 className="text-xs font-bold text-[#8E8A82] uppercase tracking-wider">Alert Webhook Endpoints</h2>
            <Button size="sm" variant="primary" onClick={() => setIsAddingWebhook(!isAddingWebhook)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Webhook
            </Button>
          </div>

          {isAddingWebhook && (
            <form onSubmit={handleAddWebhook} className="card-glow p-5 rounded-2xl border border-[#FF6B35]/30 bg-[#11151B] space-y-4">
              <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Add Alert Destination</h3>
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
                    className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3 py-2.5 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#FF6B35]"
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
              <div key={w.id} className="card-glow p-4 rounded-xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-[#FF6B35]/15 text-[#FF6B35]">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#F3F0E8]">{w.name}</div>
                    <div className="text-[11px] text-[#8E8A82] font-mono truncate">{w.url}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWebhook(w.id)}
                  className="p-1.5 text-[#8E8A82] hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {webhooks.length === 0 && (
              <div className="col-span-2 card-glow p-8 text-center text-[#8E8A82] rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
                <CheckCircle2 className="w-8 h-8 mx-auto text-[#34D399] mb-2 opacity-80" />
                No custom webhooks configured. Configure Slack or Discord webhooks above for real-time alerts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
