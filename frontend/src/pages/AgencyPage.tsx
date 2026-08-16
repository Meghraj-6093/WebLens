import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Palette, 
  Briefcase, 
  Plus, 
  Trash2, 
  Check, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Team, TeamMember, AgencySettings, ClientRecord } from '@weblens/shared';

export const AgencyPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'team' | 'clients' | 'whitelabel'>('team');

  // Team states
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState<boolean>(false);

  // Clients states
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [clientDomain, setClientDomain] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [isAddingClient, setIsAddingClient] = useState<boolean>(false);

  // White-label states
  const [brandName, setBrandName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');
  const [accentColor, setAccentColor] = useState<string>('#10B981');
  const [footerText, setFooterText] = useState<string>('');
  const [isSavingBranding, setIsSavingBranding] = useState<boolean>(false);
  const [brandSavedNotice, setBrandSavedNotice] = useState<boolean>(false);

  const token = localStorage.getItem('weblens_token');

  const fetchData = async () => {
    if (!token) return;
    try {
      const [teamRes, clientsRes, wlRes] = await Promise.all([
        fetch('http://localhost:3001/api/teams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/teams/clients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/white-label', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeam(data.team);
        setMembers(data.members || []);
      }
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (wlRes.ok) {
        const wl = await wlRes.json();
        setBrandName(wl.brandName || '');
        setLogoUrl(wl.logoUrl || '');
        setPrimaryColor(wl.primaryColor || '#3B82F6');
        setAccentColor(wl.accentColor || '#10B981');
        setFooterText(wl.footerText || '');
      }
    } catch (err) {
      console.error('Failed to load agency data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !team || !token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/teams/${team.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        setInviteEmail('');
        setIsInviting(false);
        fetchData();
      }
    } catch (err) {
      console.error('Invite failed', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team || !token) return;
    await fetch(`http://localhost:3001/api/teams/${team.id}/members/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientDomain || !token) return;

    try {
      const res = await fetch('http://localhost:3001/api/teams/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientName, domain: clientDomain, contactEmail: clientEmail })
      });
      if (res.ok) {
        setClientName('');
        setClientDomain('');
        setClientEmail('');
        setIsAddingClient(false);
        fetchData();
      }
    } catch (err) {
      console.error('Client add failed', err);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingBranding(true);

    try {
      const res = await fetch('http://localhost:3001/api/white-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brandName, logoUrl, primaryColor, accentColor, footerText })
      });
      if (res.ok) {
        setBrandSavedNotice(true);
        setTimeout(() => setBrandSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error('Save branding failed', err);
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Agency & Enterprise Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage team access, client rosters, and customize white-label report branding.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('whitelabel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'whitelabel' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            White-Label Studio
          </button>
        </div>
      </div>

      {/* Tab 1: Team Members */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">{team?.name || 'Agency Workspace'}</h2>
              <p className="text-xs text-slate-500">Collaborate with colleagues and client managers.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsInviting(!isInviting)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Invite Member
            </Button>
          </div>

          {isInviting && (
            <form onSubmit={handleInviteMember} className="card-glow p-5 rounded-2xl border border-indigo-500/30 space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Invite Team Member</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="colleague@agency.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <select
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Admin (Full Access)</option>
                    <option value="member">Member (Can Audit & View)</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsInviting(false)}>Cancel</Button>
                <Button size="sm" variant="primary" type="submit">Send Invite</Button>
              </div>
            </form>
          )}

          <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{m.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`capitalize px-2 py-0.5 rounded font-mono text-[11px] border ${m.role === 'owner' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : m.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Client Roster */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Accounts</h2>
              <p className="text-xs text-slate-500">Organize audits and websites by agency client.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsAddingClient(!isAddingClient)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Client
            </Button>
          </div>

          {isAddingClient && (
            <form onSubmit={handleAddClient} className="card-glow p-5 rounded-2xl border border-indigo-500/30 space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Add Client Record</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="acme.com"
                    value={clientDomain}
                    onChange={(e) => setClientDomain(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="client@acme.com (Optional)"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingClient(false)}>Cancel</Button>
                <Button size="sm" variant="primary" type="submit">Save Client</Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div key={c.id} className="card-glow p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{c.clientName}</div>
                  <span className="text-[11px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {c.domain}
                  </span>
                </div>
                {c.contactEmail && (
                  <div className="text-xs text-slate-400 font-mono">{c.contactEmail}</div>
                )}
              </div>
            ))}
            {clients.length === 0 && (
              <div className="col-span-3 card-glow p-12 text-center text-slate-500 rounded-2xl border border-slate-800">
                No clients added yet. Click "Add Client" above to create client workspaces.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: White-Label Studio */}
      {activeTab === 'whitelabel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customizer Form */}
          <form onSubmit={handleSaveBranding} className="card-glow p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>Brand Identity & Theming</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Brand / Agency Name</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Digital Agency"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Custom Logo URL</label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://acme.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Custom Report Footer Text</label>
                <Input
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Prepared by Acme Digital Agency • Confidential Client Audit"
                />
              </div>
            </div>

            {brandSavedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>White-label branding saved successfully!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                size="md"
                variant="primary"
                type="submit"
                isLoading={isSavingBranding}
              >
                Save White-Label Branding
              </Button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Live Branded Report Header Preview</span>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-slate-700 bg-slate-950 space-y-6">
              {/* Branded Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {brandName.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">{brandName || 'Your Agency Name'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Verified Client Audit Report</div>
                  </div>
                </div>

                <div 
                  className="px-3 py-1 rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Score: 94/100
                </div>
              </div>

              {/* Sample Body */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Target Website: <span className="text-white font-mono">example.com</span></div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-[94%]" style={{ backgroundColor: primaryColor }}></div>
                </div>
              </div>

              {/* Branded Footer */}
              <div className="border-t border-slate-800 pt-3 text-center text-[10px] text-slate-500 font-mono">
                {footerText || 'Prepared by Your Agency Name • Confidential'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
