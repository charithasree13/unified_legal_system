import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PublicDashboard } from './PublicDashboard';
import { AuthModal } from '../components/AuthModal';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(true);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="relative min-h-screen">
      <PublicDashboard />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        actionPrompt="Sign in to access your Elite Legal Desk dashboard, case files, and legal tools."
      />
    </div>
  );
};
