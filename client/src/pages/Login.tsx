import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PublicDashboard } from './PublicDashboard';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  return <PublicDashboard />;
};
