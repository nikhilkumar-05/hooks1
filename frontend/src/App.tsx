import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { NetworkPage } from './pages/NetworkPage';
import { ClubsPage } from './pages/ClubsPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Loading LPU Hooks...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, render authentication page
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-16 md:pb-8 flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/saved" element={<HomePage initialFilter="saved" />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation matching reference layout */}
      <MobileBottomNav />
    </div>
  );
};

