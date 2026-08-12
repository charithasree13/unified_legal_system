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
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '' : 'https://unified-legal-system.onrender.com');
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '300143041269-oa6toeacsqdo25rg31n0g3hagbkiaird.apps.googleusercontent.com';

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

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
          logo_alignment: 'left'
        });
      }
    } catch (e) {
      console.warn('Google Identity Services initialization notice:', e);
    }
  };

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
      const origOnload = script.onload;
      script.onload = (e) => {
        if (origOnload) (origOnload as any)(e);
        initGoogleId();
      };
      if (window.google?.accounts?.id) {
        initGoogleId();
      }
    }
  }, [accountType]);

  return (
    <div className={`w-full flex flex-col items-center justify-center my-1 ${className}`}>
      {loading && (
        <div className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5 text-slate-700 dark:text-slate-200">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-primary rounded-full animate-spin" />
          <span>Authenticating with Google...</span>
        </div>
      )}

      <div className={`w-full flex justify-center ${loading ? 'hidden' : ''}`}>
        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />
      </div>
    </div>
  );
};
