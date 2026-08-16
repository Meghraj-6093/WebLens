import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getProjects, createProject, startScan } from '../lib/api.js';
import { ProjectSummary } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { 
  Layers, 
  Plus, 
  Globe, 
  Calendar, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Sparkles, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const ProjectsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
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
      const data = await getProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    setIsSubmitting(true);
    setModalError(null);
    try {
      await createProject({ name, domain, description });
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

  const handleRunProjectScan = async (projectDomain: string) => {
    try {
      const res = await startScan(projectDomain);
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      alert(err.message || 'Scan initiation failed.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Project Workspaces</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in or create an account to group target websites, track regression trends, and configure automatic audit schedules.
        </p>
        <div className="pt-2">
          <Button onClick={() => openAuthModal('register')} size="md" variant="primary">
            Create Free Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-blue-400" />
            <span>Project Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Group your client domains, personal portfolios, and web apps into separate audit workspaces.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="card-glow rounded-2xl p-6 border border-slate-800 space-y-4 relative group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{p.domain}</span>
                  </div>
                </div>

                {p.scoreChange !== null && (
                  <span className={cn(
                    'text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0',
                    p.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  )}>
                    {p.scoreChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {p.scoreChange > 0 ? `+${p.scoreChange}` : p.scoreChange}
                  </span>
                )}
              </div>

              {p.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              )}

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Latest Health Score</div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">
                    {p.latestScore !== null ? `${p.latestScore}/100` : '—'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Audits Run</div>
                  <div className="text-sm font-bold font-mono text-white">
                    {p.totalScans} scans
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunProjectScan(p.domain)}
                leftIcon={<RotateCw className="w-3.5 h-3.5 text-blue-400" />}
                className="w-full text-xs"
              >
                Scan Now
              </Button>
              {p.latestScan && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/report/${p.latestScan!.id}`)}
                  className="shrink-0 text-xs"
                >
                  Report →
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isLoading && (
        <div className="card-glow rounded-3xl p-12 border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Project Workspaces Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create your first workspace to keep historical score progression and delta insights for your website.
          </p>
          <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
            Create Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-glow rounded-3xl w-full max-w-md p-6 sm:p-8 border border-slate-800 relative bg-[#0B101E] shadow-2xl space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Create Project Workspace</h3>
              <p className="text-xs text-slate-400">Add a website domain to track its health over time.</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client Portfolio or Startup Landing"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Target Domain</label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E-commerce store or marketing website"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
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
