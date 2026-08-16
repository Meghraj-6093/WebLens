import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Zap, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { formatDate } from '../lib/utils.js';

export const ProfilePage: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in or create an account to manage your profile, API keys, and subscription plan.
        </p>
        <div className="pt-2">
          <Button onClick={() => openAuthModal('register')} size="md" variant="primary">
            Sign In / Register
          </Button>
        </div>
      </div>
    );
  }

  const usagePercent = Math.round((user.scansToday / user.maxScansPerDay) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserIcon className="w-7 h-7 text-blue-400" />
            <span>Account & Quota Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your developer tier, usage quota, and security settings.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={logout} className="text-rose-400 hover:text-rose-300">
          Sign Out
        </Button>
      </div>

      {/* User Info Card */}
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-blue-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <div className="text-xs text-slate-400 font-mono">{user.email}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Member since {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {user.tier} Tier Plan
          </span>
        </div>

        {/* Daily Scan Quota Bar */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Scan Quota</span>
            </span>
            <span className="font-mono text-slate-400">
              <strong>{user.scansToday}</strong> of <strong>{user.maxScansPerDay}</strong> scans used today
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, usagePercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Developer API Key */}
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">CI/CD & API Access</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Trigger automated audits in GitHub Actions, GitLab CI, or terminal scripts using your personal API key.
        </p>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 flex items-center justify-between">
          <span>wbl_live_{user.id.substring(0, 16)}••••••••</span>
          <button
            onClick={() => alert('API Key copied to clipboard!')}
            className="text-xs text-slate-400 hover:text-white font-semibold"
          >
            Copy Key
          </button>
        </div>
      </div>

      {/* Plans & Upgrades */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Available Subscription Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="text-sm font-bold text-white">Free Developer</div>
            <div className="text-2xl font-extrabold text-white">$0 <span className="text-xs text-slate-500 font-normal">/ mo</span></div>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 10 scans / day</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Full 6 Audit Categories</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Diagnostic Assistant</li>
            </ul>
          </div>

          <div className="card-glow rounded-2xl p-5 border border-blue-500/40 bg-blue-950/20 space-y-3 relative overflow-hidden">
            <div className="text-xs font-mono font-bold uppercase text-blue-400">Popular</div>
            <div className="text-sm font-bold text-white">Pro Engineer</div>
            <div className="text-2xl font-extrabold text-white">$29 <span className="text-xs text-slate-500 font-normal">/ mo</span></div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 50 scans / day</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Project Workspaces</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PDF Client Export</li>
            </ul>
          </div>

          <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="text-sm font-bold text-white">Agency Suite</div>
            <div className="text-2xl font-extrabold text-white">$99 <span className="text-xs text-slate-500 font-normal">/ mo</span></div>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 500 scans / day</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> White-label PDF Reports</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated IP Proxies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
