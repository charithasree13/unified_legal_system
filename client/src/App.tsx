import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { Directory } from './pages/Directory';
import { Calculators } from './pages/Calculators';
import { Documents } from './pages/Documents';
import { Chat } from './pages/Chat';
import { Collaboration } from './pages/Collaboration';
import { Projects } from './pages/Projects';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LegalSectionMapping } from './pages/LegalSectionMapping';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route Switcher based on Role (Admin vs User Dashboard)
const DashboardSwitcher: React.FC = () => {
  const { user } = useAuthStore();
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
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Core Layout Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default entry */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardSwitcher />} />
          <Route path="directory" element={<Directory />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="judgements" element={<Documents />} />
          <Route path="laws" element={<Documents />} />
          <Route path="chat" element={<Chat />} />
          <Route path="collaboration" element={<Collaboration />} />
          <Route path="projects" element={<Projects />} />
          <Route path="section-mapping" element={<LegalSectionMapping />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
