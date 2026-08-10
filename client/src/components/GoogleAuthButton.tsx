import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface GoogleAuthButtonProps {
  accountType: 'Client' | 'Advocate';
  onStart?: () => void;
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
  text?: string;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  accountType,
  onStart,
  onError,
  onSuccess,
  text = 'Continue with Google',
  className = ''
}) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '' : 'https://unified-legal-system.onrender.com');
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1048382910482-demoappclientid.apps.googleusercontent.com';

  // Load Google Identity Services SDK dynamically if not loaded
  useEffect(() => {
    if (window.google?.accounts?.id) {
      initGoogleId();
      return;
    }

    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleId();
      document.body.appendChild(script);
    } else {
      script.onload = () => initGoogleId();
    }
  }, [accountType]);

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      const err = 'Google sign-in was cancelled or failed to retrieve credential.';
      if (onError) onError(err);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (onStart) onStart();

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          accountType
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || 'Google authentication failed on server.';
        if (onError) onError(msg);
      } else {
        const successMsg = `Successfully authenticated as ${accountType}. Redirecting...`;
        if (onSuccess) onSuccess(successMsg);
        login(data.user, data.accessToken, data.refreshToken);
        setTimeout(() => navigate('/dashboard'), 600);
      }
    } catch (err: any) {
      const msg = 'Network error connecting to authorization server.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const initGoogleId = () => {
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      if (hiddenBtnRef.current) {
        hiddenBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320
        });
      }
    } catch (e) {
      console.warn('Google Identity Services initialization notice:', e);
    }
  };

  const handleClick = () => {
    if (loading) return;
    if (onStart) onStart();

    if (window.google?.accounts?.id) {
      initGoogleId();
      // Trigger hidden GIS button iframe click or prompt
      const iframeBtn = hiddenBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
      if (iframeBtn) {
        iframeBtn.click();
      } else {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (hiddenBtnRef.current) {
              const el = hiddenBtnRef.current.querySelector('iframe');
              if (el) el.click();
            }
          }
        });
      }
    } else {
      if (onError) onError('Google Sign-In library is loading. Please try again in a moment.');
    }
  };

  return (
    <div className="w-full relative">
      {/* Hidden container where official GIS button renders for native popup triggering */}
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      {/* Styled visible button conforming to project aesthetics */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-slate-400 border-t-primary rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loading ? 'Authenticating with Google...' : `${text} as ${accountType === 'Advocate' ? 'Advocate' : 'User'}`}</span>
      </button>
    </div>
  );
};
