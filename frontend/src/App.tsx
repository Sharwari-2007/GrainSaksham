import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthView } from './views/AuthView';
import { GrainScannerView } from './views/GrainScannerView';
import { QualityPassportView } from './views/QualityPassportView';
import { PublicVerificationView } from './views/PublicVerificationView';
import { MandiComparisonView } from './views/MandiComparisonView';
import { FarmerBuyerComparisonView } from './views/FarmerBuyerComparisonView';
import { AICoachView } from './views/AICoachView';
import { BuyerMarketplaceView } from './views/BuyerMarketplaceView';
import { HistoryAnalyticsView } from './views/HistoryAnalyticsView';
import { FarmerDashboard } from './views/FarmerDashboard';
import { AdminDashboardView } from './views/AdminDashboardView';

import { InspectionRecord } from './types';
import { api } from './api';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Default to 'auth' first (Signup/Login interface for Farmer, Buyer, Admin) unless navigated
  const [activeView, setActiveView] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#verify/')) {
      return 'verify';
    }
    const hasEnteredHome = sessionStorage.getItem('grainsaksham_session_entered') === 'true';
    if (!hasEnteredHome) {
      return 'auth';
    }
    return 'home';
  });

  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);
  const [publicVerifyId, setPublicVerifyId] = useState<string>('GS-WHT-2026-8942');
  const [offlineDraftsCount] = useState<number>(() => api.getOfflineDrafts().length);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Online/Offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check hash for public QR verification routing, e.g. #verify/GS-WHT-2026-8942
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const id = hash.replace('#verify/', '');
        setPublicVerifyId(id);
        setActiveView('verify');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleInspectionComplete = (record: InspectionRecord) => {
    setSelectedInspection(record);
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated full-screen Auth & Role Selection Experience
  if (activeView === 'auth') {
    return (
      <AuthView
        onSuccess={() => {
          sessionStorage.setItem('grainsaksham_session_entered', 'true');
          handleNavigate('home');
        }}
        onExploreGuest={() => {
          sessionStorage.setItem('grainsaksham_session_entered', 'true');
          handleNavigate('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
      
      {/* Hackathon Demo Notice Strip */}
      <div className="bg-agri-950 text-white text-[11px] py-1.5 px-4 text-center flex items-center justify-center gap-2 sm:gap-4 border-b border-agri-900/60 font-medium">
        <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
          AI Hackathon 2026
        </span>
        <span className="hidden sm:inline">GrainSaksham AI — AI-Powered Grain Quality Inspection & Fair-Price Assistance Platform</span>
        <span className="text-stone-400">|</span>
        <span className="text-amber-300">
          Role: <strong className="text-white capitalize">{currentUser.role}</strong> ({currentUser.displayName.split(' ')[0]})
        </span>
        {!isOnline && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded font-bold">
            Offline Mode
          </span>
        )}
      </div>

      {/* Main Sticky Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={handleNavigate}
        offlineDraftsCount={offlineDraftsCount}
      />

      {/* View Content Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {activeView === 'scanner' && (
          <GrainScannerView
            onInspectionComplete={handleInspectionComplete}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'passport' && (
          <QualityPassportView
            inspection={selectedInspection}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'verify' && (
          <PublicVerificationView
            reportId={publicVerifyId}
            onBack={() => handleNavigate('home')}
          />
        )}

        {activeView === 'mandi' && (
          <MandiComparisonView />
        )}

        {activeView === 'disputes' && (
          <FarmerBuyerComparisonView />
        )}

        {activeView === 'coach' && (
          <AICoachView onNavigate={handleNavigate} />
        )}

        {activeView === 'marketplace' && (
          <BuyerMarketplaceView onNavigate={handleNavigate} />
        )}

        {activeView === 'history' && (
          <HistoryAnalyticsView
            onSelectInspection={(record) => {
              setSelectedInspection(record);
              handleNavigate('passport');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'dashboard' && (
          <FarmerDashboard
            onNavigate={handleNavigate}
            onSelectInspection={(record) => {
              setSelectedInspection(record);
              handleNavigate('passport');
            }}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
