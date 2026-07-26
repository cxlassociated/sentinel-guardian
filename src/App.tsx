import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import Archive from './pages/Archive';
import Reports from './pages/Reports';
import ConflictMonitoring from './pages/ConflictMonitoring';
import KnowledgeBase from './pages/KnowledgeBase';
import Workflows from './pages/Workflows';
import AIGovernance from './pages/AIGovernance';
import FeatureMatrix from './pages/FeatureMatrix';
import Settings from './pages/Settings';
import WarRoomDashboard from './pages/WarRoomDashboard';
import ComplianceCalendar from './pages/ComplianceCalendar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#265C7E] mb-3"></div>
        <p className="text-sm font-medium text-gray-600">Loading Sentinel Guardian SG3...</p>
      </div>
    );
  }
  
  if (!user && !profile) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="scan" element={<NewScan />} />
            <Route path="archive" element={<Archive />} />
            <Route path="reports" element={<Reports />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="conflicts" element={<ConflictMonitoring />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="governance" element={<AIGovernance />} />
            <Route path="roadmap" element={<FeatureMatrix />} />
            <Route path="settings" element={<Settings />} />
            <Route path="war-room" element={<WarRoomDashboard />} />
            <Route path="calendar" element={<ComplianceCalendar />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

