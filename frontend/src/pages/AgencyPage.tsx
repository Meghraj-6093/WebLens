import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Palette, 
  Plus, 
  Trash2, 
  Check, 
  Globe, 
  Eye
} from 'lucide-react';
import { LocalWorkspaceDB } from '../lib/db.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';

interface ClientItem {
  id: string;
  clientName: string;
  domain: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
}

export const AgencyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'whitelabel'>('clients');

  // Clients states
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [clientDomain, setClientDomain] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [isAddingClient, setIsAddingClient] = useState<boolean>(false);

  // White-label states
  const [brandName, setBrandName] = useState<string>('My Agency Studio');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#FF6B35');
  const [accentColor, setAccentColor] = useState<string>('#10B981');
  const [footerText, setFooterText] = useState<string>('Prepared by My Agency Studio • Confidential Client Audit');
  const [brandSavedNotice, setBrandSavedNotice] = useState<boolean>(false);

  const loadAgencyData = async () => {
    try {
      const settings = await LocalWorkspaceDB.getAgencySettings();
      if (settings) {
        setBrandName(settings.brandName || 'My Agency Studio');
        setLogoUrl(settings.logoUrl || '');
        setPrimaryColor(settings.primaryColor || '#FF6B35');
        setAccentColor(settings.accentColor || '#10B981');
        setFooterText(settings.footerText || '');
        setClients(settings.clients || []);
      }
    } catch (err) {
      console.error('Failed to load agency data', err);
    }
  };

  useEffect(() => {
    loadAgencyData();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientDomain) return;

    const newClient: ClientItem = {
      id: `client_${Date.now()}`,
      clientName: clientName.trim(),
      domain: clientDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      contactEmail: clientEmail.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);

    await LocalWorkspaceDB.saveAgencySettings({
      brandName,
      logoUrl,
      primaryColor,
      accentColor,
      footerText,
      clients: updatedClients
    });

    setClientName('');
    setClientDomain('');
    setClientEmail('');
    setIsAddingClient(false);
  };

  const handleDeleteClient = async (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    await LocalWorkspaceDB.saveAgencySettings({
      brandName,
      logoUrl,
      primaryColor,
      accentColor,
      footerText,
      clients: updatedClients
    });
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await LocalWorkspaceDB.saveAgencySettings({
      brandName,
      logoUrl,
      primaryColor,
      accentColor,
      footerText,
      clients
    });

    setBrandSavedNotice(true);
    setTimeout(() => setBrandSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F3F0E8] tracking-tight">Agency & White-Label Studio</h1>
          </div>
          <p className="text-xs text-[#8E8A82] mt-1">
            Organize client rosters and customize white-label branding for exported reports.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#11151B] p-1 rounded-xl border border-[rgba(243,240,232,0.08)]">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'clients' ? 'bg-[#FF6B35] text-[#080A0E] font-bold shadow' : 'text-[#8E8A82] hover:text-[#F3F0E8]'}`}
          >
            Client Workspaces ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('whitelabel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'whitelabel' ? 'bg-[#FF6B35] text-[#080A0E] font-bold shadow' : 'text-[#8E8A82] hover:text-[#F3F0E8]'}`}
          >
            White-Label Studio
          </button>
        </div>
      </div>

      {/* Tab 1: Client Workspaces */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold text-[#8E8A82] uppercase tracking-wider">Client Accounts & Domains</h2>
              <p className="text-xs text-[#6E6A63]">Group website audits and deliver custom client reports.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsAddingClient(!isAddingClient)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Client
            </Button>
          </div>

          {isAddingClient && (
            <form onSubmit={handleAddClient} className="card-glow p-5 rounded-2xl border border-[#FF6B35]/30 bg-[#11151B] space-y-4">
              <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Add Client Record</h3>
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
              <div key={c.id} className="card-glow p-5 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] hover:border-[#FF6B35]/40 space-y-3 flex flex-col justify-between transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#F3F0E8] text-sm truncate">{c.clientName}</div>
                    <button
                      onClick={() => handleDeleteClient(c.id)}
                      className="p-1 text-[#8E8A82] hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#FF6B35] font-mono">
                    <Globe className="w-3.5 h-3.5 text-[#8E8A82]" />
                    <span>{c.domain}</span>
                  </div>
                  {c.contactEmail && (
                    <div className="text-[11px] text-[#8E8A82] font-mono">{c.contactEmail}</div>
                  )}
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <div className="col-span-3 card-glow p-12 text-center text-[#8E8A82] rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
                No clients added yet. Click "Add Client" above to create client workspaces.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: White-Label Studio */}
      {activeTab === 'whitelabel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customizer Form */}
          <form onSubmit={handleSaveBranding} className="card-glow p-6 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>Brand Identity & Theming</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#D8D4CA] mb-1 block">Brand / Agency Name</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Digital Agency"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D8D4CA] mb-1 block">Custom Logo URL</label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://acme.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#D8D4CA] mb-1 block">Primary Brand Color</label>
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
                  <label className="text-xs font-semibold text-[#D8D4CA] mb-1 block">Accent Color</label>
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
                <label className="text-xs font-semibold text-[#D8D4CA] mb-1 block">Custom Report Footer Text</label>
                <Input
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Prepared by Acme Digital Agency • Confidential Client Audit"
                />
              </div>
            </div>

            {brandSavedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-[#34D399] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>White-label branding saved to local workspace!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                size="md"
                variant="primary"
                type="submit"
              >
                Save White-Label Branding
              </Button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8E8A82] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Live Branded Report Header Preview</span>
            </div>

            <div className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.12)] bg-[#0C0F14] space-y-6">
              {/* Branded Header */}
              <div className="flex items-center justify-between border-b border-[rgba(243,240,232,0.08)] pb-4">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[#080A0E] shadow"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {brandName.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-[#F3F0E8]">{brandName || 'Your Agency Name'}</div>
                    <div className="text-[10px] text-[#6E6A63] font-mono">Verified Client Audit Report</div>
                  </div>
                </div>

                <div 
                  className="px-3 py-1 rounded-full text-[11px] font-bold text-[#080A0E]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Score: 94/100
                </div>
              </div>

              {/* Sample Body */}
              <div className="space-y-2">
                <div className="text-xs text-[#8E8A82]">Target Website: <span className="text-[#F3F0E8] font-mono">example.com</span></div>
                <div className="h-2 rounded-full bg-[#151A21] overflow-hidden">
                  <div className="h-full w-[94%]" style={{ backgroundColor: primaryColor }}></div>
                </div>
              </div>

              {/* Branded Footer */}
              <div className="border-t border-[rgba(243,240,232,0.08)] pt-3 text-center text-[10px] text-[#6E6A63] font-mono">
                {footerText || 'Prepared by Your Agency Name • Confidential'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
