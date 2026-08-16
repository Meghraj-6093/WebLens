import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header.js';
import { Footer } from './components/layout/Footer.js';
import { ErrorBoundary } from './components/ui/ErrorBoundary.js';
import { HomePage } from './pages/HomePage.js';
import { ScanProgressPage } from './pages/ScanProgressPage.js';
import { ReportPage } from './pages/ReportPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ComparePage } from './pages/ComparePage.js';
import { MonitoringPage } from './pages/MonitoringPage.js';
import { CompetitorPage } from './pages/CompetitorPage.js';
import { AgencyPage } from './pages/AgencyPage.js';
import { ApiKeysPage } from './pages/ApiKeysPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/competitors" element={<CompetitorPage />} />
            <Route path="/agency" element={<AgencyPage />} />
            <Route path="/developers" element={<ApiKeysPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/scan/:id" element={<ScanProgressPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
