import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ScanProgressPage } from './pages/ScanProgressPage.js';
import { ReportPage } from './pages/ReportPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan/:id" element={<ScanProgressPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/demo" element={<ReportPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
