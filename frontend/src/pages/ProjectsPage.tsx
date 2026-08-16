import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalWorkspaceDB } from '../lib/db.js';
import { startScan } from '../lib/api.js';
import { ProjectSummary } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { 
  Layers, 
  Plus, 
  Globe, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils.js';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await LocalWorkspaceDB.getProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    setIsSubmitting(true);
    setModalError(null);
    try {
      await LocalWorkspaceDB.saveProject({ name, domain, description });
      setIsModalOpen(false);
      setName('');
      setDomain('');
      setDescription('');
      await loadProjects();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (window.confirm(`Delete workspace "${name}"?`)) {
      await LocalWorkspaceDB.deleteProject(id);
      await loadProjects();
    }
  };

  const handleRunProjectScan = async (projectDomain: string) => {
    try {
      const res = await startScan(projectDomain);
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      alert(err.message || 'Scan initiation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F0E8] tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#FF6B35]" />
            <span>Local Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8A82] mt-1">
            Organize target websites into local workspaces to monitor regressions and historical scores.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Workspace
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="card-glow rounded-2xl p-6 border border-[rgba(243,240,232,0.08)] bg-[#11151B] hover:border-[#FF6B35]/40 space-y-4 relative group flex flex-col justify-between transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#F3F0E8] tracking-tight truncate group-hover:text-[#FF6B35] transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8A82] font-mono mt-0.5">
                    <Globe className="w-3 h-3 text-[#6E6A63]" />
                    <span>{p.domain}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.scoreChange !== null && (
                    <span className={cn(
                      'text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0',
                      p.scoreChange >= 0 ? 'bg-emerald-500/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-400'
                    )}>
                      {p.scoreChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {p.scoreChange > 0 ? `+${p.scoreChange}` : p.scoreChange}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteProject(p.id, p.name)}
                    title="Delete workspace"
                    className="p-1 rounded text-[#8E8A82] hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {p.description && (
                <p className="text-xs text-[#8E8A82] line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              )}

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <div className="text-[10px] text-[#6E6A63] uppercase font-semibold">Latest Health Score</div>
                  <div className="text-2xl font-extrabold font-mono text-[#FF6B35]">
                    {p.latestScore !== null ? `${p.latestScore}/100` : '—'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#6E6A63] uppercase font-semibold">Audits Run</div>
                  <div className="text-sm font-bold font-mono text-[#F3F0E8]">
                    {p.totalScans} scans
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-4 border-t border-[rgba(243,240,232,0.08)] flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunProjectScan(p.domain)}
                leftIcon={<RotateCw className="w-3.5 h-3.5 text-[#FF6B35]" />}
                className="w-full text-xs"
              >
                Scan Now
              </Button>
              {p.latestScan && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/report/${p.latestScan!.id}`)}
                  className="shrink-0 text-xs text-[#FF6B35] hover:text-[#FF804F]"
                >
                  Report →
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isLoading && (
        <div className="card-glow rounded-3xl p-12 border border-[rgba(243,240,232,0.08)] bg-[#11151B] text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F3F0E8]">No Workspaces Yet</h3>
          <p className="text-xs text-[#8E8A82] leading-relaxed">
            Create your first workspace to group client domains, personal portfolios, and web apps.
          </p>
          <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
            Create Workspace
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="card-glow rounded-3xl w-full max-w-md p-6 sm:p-8 border border-[rgba(243,240,232,0.12)] relative bg-[#0C0F14] shadow-2xl space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#151A21] hover:bg-[#1A2028] text-[#8E8A82] hover:text-[#F3F0E8]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F3F0E8] tracking-tight">Create Local Workspace</h3>
              <p className="text-xs text-[#8E8A82]">Add a website domain to track its health over time.</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[#D8D4CA]">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client Portfolio or Marketing Site"
                  className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3 py-2 text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#D8D4CA]">Target Domain</label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3 py-2 text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none focus:border-[#FF6B35] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#D8D4CA]">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about this project"
                  className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3 py-2 text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none focus:border-[#FF6B35] resize-none"
                />
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Save Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
