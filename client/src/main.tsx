import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'

// Global Fetch Interceptor to automatically handle expired tokens
const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    if (
      url && 
      !url.includes('/api/auth/login') && 
      !url.includes('/api/auth/register') && 
      !url.includes('/api/auth/verify-otp') &&
      !url.includes('/api/auth/forgot-password') &&
      !url.includes('/api/auth/reset-password')
    ) {
      console.log('🛡️ Session expired or invalid token. Redirecting to login.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
