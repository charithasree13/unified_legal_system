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
import { DailyLegalTipsPage } from './pages/DailyLegalTipsPage';
import { MyNotesPage } from './pages/MyNotesPage';
import { HinduSuccessionCalculator } from './pages/HinduSuccessionCalculator';
import { IslamicInheritanceCalculator } from './pages/IslamicInheritanceCalculator';
import { LimitationCalculatorPage } from './pages/LimitationCalculatorPage';
import { InterestCalculatorPage } from './pages/InterestCalculatorPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { AuthModal } from './components/AuthModal';

// Protected Feature Wrapper (Intercepts unauthenticated visitors & checks role authorization)
const ProtectedRoute: React.FC<{ children: React.ReactNode; featureName?: string; allowedRoles?: string[] }> = ({ 
  children, 
  featureName = 'this protected feature',
  allowedRoles
}) => {
  const { token, user } = useAuthStore();
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

  // Role Access Control Enforcement & Advocate Verification Status Enforcement
  if (allowedRoles && allowedRoles.length > 0) {
    const roleLower = (user?.role || '').toLowerCase();
    const isAllowedRole = allowedRoles.some(r => r.toLowerCase() === roleLower);
    
    if (!isAllowedRole) {
      return <Navigate to="/dashboard" replace />;
    }

    if (roleLower === 'advocate') {
      const isApprovedAdvocate = user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED';
      if (!isApprovedAdvocate) {
        return <Navigate to="/dashboard" replace />;
      }
    }
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

          {/* Publicly Accessible Modules (No Login Required) */}
          <Route path="calculators" element={<Calculators />} />
          <Route path="interest-calculator" element={<InterestCalculatorPage />} />
          <Route path="calculators/interest" element={<InterestCalculatorPage />} />

          {/* Protected Hindu Succession Calculator Module (Admin & Advocate Only) */}
          <Route 
            path="hindu-succession-calculator" 
            element={
              <ProtectedRoute featureName="Hindu Succession Calculator" allowedRoles={['Admin', 'Advocate']}>
                <HinduSuccessionCalculator />
              </ProtectedRoute>
            } 
          />

          {/* Protected Islamic Inheritance Calculator Module (Admin & Advocate Only) */}
          <Route 
            path="islamic-inheritance-calculator" 
            element={
              <ProtectedRoute featureName="Islamic Inheritance Calculator" allowedRoles={['Admin', 'Advocate']}>
                <IslamicInheritanceCalculator />
              </ProtectedRoute>
            } 
          />

          {/* Protected Limitation Act Calculator Module (Admin & Advocate Only) */}
          <Route 
            path="limitation-calculator" 
            element={
              <ProtectedRoute featureName="Limitation Act Calculator" allowedRoles={['Admin', 'Advocate']}>
                <LimitationCalculatorPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Modules (Require Sign In) */}
          <Route 
            path="directory" 
            element={
              <ProtectedRoute featureName="Advocate Directory">
                <Directory />
              </ProtectedRoute>
            } 
          />
          {/* Protected Judgments & Bare Acts Legal Library Module (Admin & Approved Advocate Only) */}
          <Route 
            path="judgements" 
            element={
              <ProtectedRoute featureName="Judgments & Bare Acts Legal Library" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="judgements/:id" 
            element={
              <ProtectedRoute featureName="Judgment Details" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="judgments" 
            element={
              <ProtectedRoute featureName="Judgments & Bare Acts Legal Library" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="judgments/:id" 
            element={
              <ProtectedRoute featureName="Judgment Details" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="laws" 
            element={
              <ProtectedRoute featureName="Bare Acts & Statutory Library" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="laws/:id" 
            element={
              <ProtectedRoute featureName="Bare Act Details" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bare-acts" 
            element={
              <ProtectedRoute featureName="Bare Acts & Statutory Library" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bare-acts/:id" 
            element={
              <ProtectedRoute featureName="Bare Act Details" allowedRoles={['Admin', 'Advocate']}>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="section-mapping" 
            element={
              <ProtectedRoute featureName="Old Acts → New Acts Converter" allowedRoles={['Admin', 'Advocate']}>
                <LegalSectionMapping />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="old-acts-new-acts" 
            element={
              <ProtectedRoute featureName="Old Acts → New Acts Converter" allowedRoles={['Admin', 'Advocate']}>
                <LegalSectionMapping />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="legal-tools/old-acts-new-acts" 
            element={
              <ProtectedRoute featureName="Old Acts → New Acts Converter" allowedRoles={['Admin', 'Advocate']}>
                <LegalSectionMapping />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="daily-legal-tips" 
            element={
              <ProtectedRoute featureName="Daily Legal Tips / Updates">
                <DailyLegalTipsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="daily-tips" 
            element={<Navigate to="/daily-legal-tips" replace />} 
          />
          <Route 
            path="my-notes" 
            element={
              <ProtectedRoute featureName="My Notes" allowedRoles={['Admin', 'Advocate']}>
                <MyNotesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notes" 
            element={<Navigate to="/my-notes" replace />} 
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
