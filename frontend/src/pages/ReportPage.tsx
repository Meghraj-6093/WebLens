import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FullScanReport, AuditCategory, AuditResult } from '@weblens/shared';
import { getScanReport, getDemoReport } from '../lib/api.js';
import { OverallScoreCard } from '../components/report/OverallScoreCard.js';
import { CategoryScoreCards } from '../components/report/CategoryScoreCards.js';
import { IssueFilter, SeverityFilterType } from '../components/report/IssueFilter.js';
import { IssueCard } from '../components/report/IssueCard.js';
import { CoreWebVitalsGrid } from '../components/report/CoreWebVitalsGrid.js';
import { ResourceTable } from '../components/report/ResourceTable.js';
import { WaterfallView } from '../components/report/WaterfallView.js';
import { ScreenshotPreview } from '../components/report/ScreenshotPreview.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Button } from '../components/ui/Button.js';
import { 
  Layers, 
  ListOrdered, 
  Zap, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  RotateCw,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils.js';

export type ReportTab = 'overview' | 'issues' | 'performance' | 'seo' | 'accessibility' | 'security' | 'mobile' | 'best_practices' | 'resources';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isDemoMode = location.pathname === '/demo';

  const [report, setReport] = useState<FullScanReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const data = await getDemoReport();
        setReport(data);
      } else if (id) {
        const data = await getScanReport(id);
        setReport(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load audit results.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id, isDemoMode]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Unable to Display Report</h2>
        <p className="text-sm text-slate-400">{error || 'Report not found or has expired.'}</p>
        <Button onClick={() => navigate('/')} variant="primary" size="sm">
          Run a New Scan
        </Button>
      </div>
    );
  }

  // Aggregate all issues from categories
  const allIssues: AuditResult[] = [
    ...(report.categories.performance?.issues || []),
    ...(report.categories.seo?.issues || []),
    ...(report.categories.accessibility?.issues || []),
    ...(report.categories.security?.issues || []),
    ...(report.categories.mobile?.issues || []),
    ...(report.categories.best_practices?.issues || []),
  ];

  // Filter issues based on tab/category, severity, and search
  const filteredIssues = allIssues.filter((issue) => {
    // Category check
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
      return false;
    }
    if (activeTab !== 'overview' && activeTab !== 'issues' && activeTab !== 'resources') {
      if (issue.category !== activeTab) return false;
    }

    // Severity check
    if (severityFilter !== 'all') {
      if (severityFilter === 'passed' && !issue.passed) return false;
      if (severityFilter !== 'passed' && (issue.passed || issue.severity !== severityFilter)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchRec = issue.recommendation.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRec) return false;
    }

    return true;
  });

  const issueCounts = {
    all: allIssues.length,
    critical: allIssues.filter(i => !i.passed && i.severity === 'critical').length,
    high: allIssues.filter(i => !i.passed && i.severity === 'high').length,
    medium: allIssues.filter(i => !i.passed && i.severity === 'medium').length,
    low: allIssues.filter(i => !i.passed && i.severity === 'low').length,
    passed: allIssues.filter(i => i.passed).length,
  };

  const navTabs: Array<{ id: ReportTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'issues', label: 'All Findings', icon: <ListOrdered className="w-3.5 h-3.5" /> },
    { id: 'performance', label: 'Performance', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'seo', label: 'SEO', icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'best_practices', label: 'Best Practices', icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'resources', label: 'Resources & Waterfall', icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong>Interactive Demo Report:</strong> Live preview of a complete WebLens health audit on <code>demo.weblens.app</code>.</span>
          </span>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold underline hover:text-white shrink-0"
          >
            Audit Your Own URL →
          </button>
        </div>
      )}

      {/* 1. Overall Score Banner */}
      <OverallScoreCard report={report} onRescan={() => navigate('/')} />

      {/* 2. Category Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Category Breakdown
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-blue-400 hover:underline font-mono"
            >
              Show all categories
            </button>
          )}
        </div>
        <CategoryScoreCards
          report={report}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat !== 'all') {
              setActiveTab(cat);
            } else {
              setActiveTab('overview');
            }
          }}
        />
      </div>

      {/* 3. Tab Navigation Bar */}
      <div className="border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-px">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'overview' && tab.id !== 'issues' && tab.id !== 'resources') {
                  setSelectedCategory(tab.id as AuditCategory);
                } else {
                  setSelectedCategory('all');
                }
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-150',
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Core Web Vitals Grid */}
          {report.categories.performance?.metrics?.length > 0 && (
            <CoreWebVitalsGrid metrics={report.categories.performance.metrics} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Prioritized Action Items</span>
                </h3>
                <div className="space-y-3">
                  {allIssues
                    .filter(i => !i.passed && (i.severity === 'critical' || i.severity === 'high'))
                    .slice(0, 6)
                    .map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} />
                    ))}
                  {allIssues.filter(i => !i.passed && (i.severity === 'critical' || i.severity === 'high')).length === 0 && (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Zero critical or high severity defects detected! Your site is performing well.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waterfall Preview */}
              {report.resources.length > 0 && (
                <WaterfallView resources={report.resources} />
              )}
            </div>

            <div className="space-y-6">
              {/* Screenshot Preview with Desktop & Mobile Viewports */}
              <ScreenshotPreview
                screenshotUrl={report.screenshotUrl}
                mobileScreenshotUrl={report.mobileScreenshotUrl}
                domain={report.scan.domain}
              />
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-8">
          <CoreWebVitalsGrid metrics={report.categories.performance?.metrics || []} />

          {/* Filter Bar */}
          <IssueFilter
            selectedSeverity={severityFilter}
            onSelectSeverity={setSeverityFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={issueCounts}
          />

          <div className="space-y-3">
            {filteredIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>

          <WaterfallView resources={report.resources} />
        </div>
      )}

      {/* Resources & Waterfall Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <WaterfallView resources={report.resources} />
          <ResourceTable resources={report.resources} breakdown={report.resourceBreakdown} />
        </div>
      )}

      {/* Other Category Tabs (SEO, Accessibility, Security, Mobile, Best Practices, All Findings) */}
      {activeTab !== 'overview' && activeTab !== 'performance' && activeTab !== 'resources' && (
        <div className="space-y-6">
          {/* Category Metrics Banner if specific category tab */}
          {activeTab !== 'issues' && report.categories[activeTab as AuditCategory]?.metrics?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {report.categories[activeTab as AuditCategory].metrics.map((m) => (
                <div key={m.id} className="card-glow rounded-xl p-3.5 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium truncate">{m.name}</div>
                  <div className={cn(
                    'text-lg font-bold font-mono',
                    m.status === 'good' ? 'text-emerald-400' : m.status === 'needs_improvement' ? 'text-amber-400' : 'text-rose-400'
                  )}>
                    {m.value}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">{m.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filter Bar */}
          <IssueFilter
            selectedSeverity={severityFilter}
            onSelectSeverity={setSeverityFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={issueCounts}
          />

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
            {filteredIssues.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 card-glow rounded-2xl border border-slate-800">
                No issues match your current filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
