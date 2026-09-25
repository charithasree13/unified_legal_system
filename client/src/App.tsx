import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { PublicDashboard } from './pages/PublicDashboard';
import { Directory } from './pages/Directory';
import { Calculators } from './pages/Calculators';
import { Documents } from './pages/Documents';
import { Chat } from './pages/Chat';
import { Collaboration } from './pages/Collaboration';
import { Projects } from './pages/Projects';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LegalSectionMapping } from './pages/LegalSectionMapping';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { AuthModal } from './components/AuthModal';

// Protected Feature Wrapper (Intercepts unauthenticated visitors attempting protected actions)
const ProtectedRoute: React.FC<{ children: React.ReactNode; featureName?: string }> = ({ 
  children, 
  featureName = 'this protected feature' 
}) => {
  const { token } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(true);

  if (!token) {
    return (
      <div className="relative min-h-screen">
        <PublicDashboard />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          initialMode="login"
          actionPrompt={`Please sign in or create an account to access ${featureName}.`}
        />
      </div>
    );
  }

  return <>{children}</>;
};

// Route Switcher based on Authentication & Role
const DashboardSwitcher: React.FC = () => {
  const { token, user } = useAuthStore();
  
  if (!token) {
    return <PublicDashboard />;
  }

  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
};

export const App: React.FC = () => {
  const { darkMode } = useAuthStore();

  // Apply dark mode on initial load
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Direct Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Public Legal Documentation Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

        {/* Core Layout Routes */}
        <Route path="/" element={<Layout />}>
          
          {/* Default entry point */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main Dashboard Route (Public before login, Role-based after login) */}
          <Route path="dashboard" element={<DashboardSwitcher />} />

          {/* Publicly Accessible Module: ONLY Court Fee Calculator */}
          <Route path="calculators" element={<Calculators />} />

          {/* Protected Modules (Require Sign In) */}
          <Route 
            path="directory" 
            element={
              <ProtectedRoute featureName="Advocate Directory">
                <Directory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="judgements" 
            element={
              <ProtectedRoute featureName="Judgments Repository">
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="laws" 
            element={
              <ProtectedRoute featureName="Bare Acts & Laws Repository">
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="section-mapping" 
            element={
              <ProtectedRoute featureName="Legal Section Mapping">
                <LegalSectionMapping />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="chat" 
            element={
              <ProtectedRoute featureName="Secure Chat Messenger">
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="collaboration" 
            element={
              <ProtectedRoute featureName="Doc Collaboration Workspace">
                <Collaboration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="projects" 
            element={
              <ProtectedRoute featureName="Case & Project Management">
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute featureName="User Profile & Account">
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute featureName="Platform Settings">
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
