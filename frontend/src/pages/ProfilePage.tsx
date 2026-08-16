import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getUserProfile, updateUserProfile, changeUserPassword, deleteUserAccount } from '../lib/api.js';
import { UserProfileData, PLANS_CONFIG } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Zap, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers,
  Activity,
  FolderPlus,
  Globe,
  Lock,
  Mail,
  AlertTriangle,
  CreditCard,
  Trash2,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Server
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

type ProfileTab = 'overview' | 'projects' | 'billing' | 'security';

export const ProfilePage: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile();
      setProfileData(data);
      if (data?.user) {
        setName(data.user.name);
        setEmail(data.user.email);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xl">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Account & Developer Profile</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Sign in or create an account to access your personal audit statistics, project workspaces, continuous monitors, and API keys.
        </p>
        <div className="pt-3 flex items-center justify-center gap-3">
          <Button onClick={() => openAuthModal('login')} size="md" variant="primary">
            Sign In to Profile
          </Button>
          <Button onClick={() => openAuthModal('register')} size="md" variant="outline">
            Create Free Account
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const stats = profileData?.stats || {
    totalScans: 0,
    completedScans: 0,
    failedScans: 0,
    scansToday: user.scansToday || 0,
    scansThisWeek: 0,
    scansThisMonth: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    uniqueDomains: 0,
    projectsCount: 0,
    monitorsCount: 0,
    apiKeysCount: 0,
    savedReportsCount: 0,
  };

  const usagePercent = user.maxScansPerDay > 0
    ? Math.round((user.scansToday / user.maxScansPerDay) * 100)
    : 0;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      await updateUserProfile({ name, email });
      setProfileMessage({ type: 'success', text: 'Profile information updated successfully.' });
      loadProfile();
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      await changeUserPassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 1. Account Header Banner */}
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user.tier} Plan
                </span>
                {user.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Admin Role
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">{user.email}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>Member since {formatDate(user.createdAt)}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('billing')}
              leftIcon={<CreditCard className="w-3.5 h-3.5 text-blue-400" />}
            >
              Manage Plan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Real User-Scoped KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Audits</div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalScans}</div>
          <div className="text-[10px] text-slate-500">{stats.uniqueDomains} unique domains</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Score</div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {stats.averageScore > 0 ? `${stats.averageScore}/100` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">Across your audits</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Score</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {stats.highestScore > 0 ? `${stats.highestScore}/100` : '—'}
          </div>
          <div className="text-[10px] text-slate-500">Highest recorded</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</div>
          <div className="text-2xl font-black text-purple-400 font-mono">{stats.projectsCount}</div>
          <div className="text-[10px] text-slate-500">Active workspaces</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitors</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.monitorsCount}</div>
          <div className="text-[10px] text-slate-500">Scheduled checks</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Quota</div>
          <div className="text-xl font-bold text-white font-mono">
            {user.scansToday} / {user.maxScansPerDay}
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, usagePercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all',
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Activity & Scans</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all',
            activeTab === 'projects'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          )}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Workspaces ({stats.projectsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all',
            activeTab === 'billing'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          )}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plan & Quota</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all',
            activeTab === 'security'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Settings & Security</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW & RECENT ACTIVITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Scans Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Your Recent Audits</span>
              </h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/history')}>
                All History →
              </Button>
            </div>

            <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Domain</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Delta</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {profileData?.recentScans && profileData.recentScans.length > 0 ? (
                      profileData.recentScans.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/40 transition">
                          <td className="px-4 py-3 font-bold text-white truncate max-w-[160px]">
                            {s.domain}
                          </td>
                          <td className="px-4 py-3">
                            {s.overallScore !== null ? (
                              <span className={cn(
                                'font-bold px-2 py-0.5 rounded text-[11px]',
                                s.overallScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                                s.overallScore >= 75 ? 'bg-blue-500/10 text-blue-400' :
                                s.overallScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                              )}>
                                {s.overallScore}/100
                              </span>
                            ) : (
                              <span className="text-slate-500">In Progress</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {s.scoreChange !== null && s.scoreChange !== undefined ? (
                              <span className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5',
                                s.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              )}>
                                {s.scoreChange >= 0 ? '+' : ''}{s.scoreChange}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {formatDate(s.completedAt || s.startedAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => navigate(`/report/${s.id}`)}
                              className="text-xs font-semibold text-blue-400 hover:underline"
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-sans">
                          No scans executed yet under this account.
                          <div className="mt-2">
                            <Button size="sm" variant="primary" onClick={() => navigate('/')}>
                              Run Your First Audit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Real Activity Stream */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real Chronological Activity</span>
            </h3>

            <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-4">
              {profileData?.recentActivity && profileData.recentActivity.length > 0 ? (
                <div className="space-y-3.5">
                  {profileData.recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {act.type === 'scan' && <Activity className="w-3.5 h-3.5 text-blue-400" />}
                        {act.type === 'project' && <Layers className="w-3.5 h-3.5 text-purple-400" />}
                        {act.type === 'monitor' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{act.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{act.detail}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{formatDate(act.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No activity events recorded yet. Start by scanning a domain!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & WORKSPACES */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Your Workspaces</h3>
              <p className="text-xs text-slate-400">Organized portfolios and domains tracked under your account.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => navigate('/projects')}>
              Manage Projects →
            </Button>
          </div>

          {profileData?.projects && profileData.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profileData.projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/projects')}
                  className="card-glow rounded-2xl p-5 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-blue-400 transition truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{p.domain}</span>
                  </div>

                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {p.latestScore !== null ? `${p.latestScore}/100` : 'Not Scanned'}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{p.totalScans} total audits</span>
                    <span className="text-blue-400">Open Workspace →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-glow rounded-2xl p-8 border border-slate-800 text-center space-y-3">
              <FolderPlus className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Project Workspaces Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create dedicated project workspaces to organize client reports and monitor historical regressions.
              </p>
              <Button size="sm" variant="primary" onClick={() => navigate('/projects')}>
                Create Workspace
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLAN, QUOTA & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="card-glow rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-blue-400">Current Subscription</span>
                <h3 className="text-xl font-extrabold text-white capitalize">{user.tier} Developer Tier</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authoritative quotas enforced server-side. Resets daily at midnight UTC.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-white">
                  {user.tier === 'agency' ? '$99' : user.tier === 'pro' ? '$29' : '$0'}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Daily Scan Quota Usage</span>
                <span className="font-mono text-slate-400">
                  <strong>{user.scansToday}</strong> used of <strong>{user.maxScansPerDay}</strong> scans allowed
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, usagePercent))}%` }}
                />
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">Available Subscription Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS_CONFIG.map((plan) => {
              const isCurrent = user.tier === plan.id;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'card-glow rounded-3xl p-6 border flex flex-col justify-between space-y-4 relative overflow-hidden',
                    plan.highlighted ? 'border-blue-500/50 bg-blue-950/20' : 'border-slate-800',
                    isCurrent && 'ring-2 ring-blue-500'
                  )}
                >
                  {isCurrent && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">
                      Current Plan
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="text-sm font-bold text-white">{plan.name}</div>
                    <div className="text-3xl font-black text-white font-mono">
                      ${plan.priceMonthly} <span className="text-xs text-slate-500 font-normal">/ mo</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                    <ul className="text-xs text-slate-300 space-y-2 pt-2">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    {isCurrent ? (
                      <Button variant="secondary" size="sm" className="w-full text-xs font-semibold" disabled>
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.highlighted ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full text-xs font-semibold"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS, SECURITY & DANGER ZONE */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          {/* Profile Details Form */}
          <div className="card-glow rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {profileMessage && (
                <div className={cn(
                  'p-3 rounded-xl text-xs flex items-center gap-2',
                  profileMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                )}>
                  {profileMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <Button type="submit" size="sm" variant="primary" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card-glow rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Update Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className={cn(
                  'p-3 rounded-xl text-xs flex items-center gap-2',
                  passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                )}>
                  {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <Button type="submit" size="sm" variant="secondary" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="p-6 sm:p-7 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold tracking-tight">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently delete your WebLens account along with all scan records, historical audit comparisons, projects, monitoring jobs, and API keys. This action cannot be undone.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="bg-slate-900 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
              <Button
                size="sm"
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={isDeletingAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
