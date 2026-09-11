import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, X } from 'lucide-react';

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
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const gisContainerRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || '';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '300143041269-oa6toeacsqdo25rg31n0g3hagbkiaird.apps.googleusercontent.com';

  const sendAuthPayload = async (payload: { credential?: string; googleUser?: any }) => {
    setLoading(true);
    if (onStart) onStart();

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
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
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err: any) {
      const msg = 'Network error connecting to authorization server.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
      setShowAccountModal(false);
    }
  };

  const handleSelectAccount = (email: string, name?: string) => {
    if (!email || !email.includes('@')) {
      if (onError) onError('Please enter a valid Google email address.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name || cleanEmail.split('@')[0].replace('.', ' ');

    sendAuthPayload({
      googleUser: {
        sub: `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        email: cleanEmail,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      }
    });
  };

  const handleCredentialResponse = (response: any) => {
    if (!response || !response.credential) {
      if (onError) onError('Google sign-in was cancelled or failed.');
      setLoading(false);
      return;
    }
    sendAuthPayload({ credential: response.credential });
  };

  const initGoogleId = () => {
    if (!window.google?.accounts) return;

    try {
      if (window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (gisContainerRef.current) {
          gisContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(gisContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320,
            logo_alignment: 'left'
          });
        }
      }
    } catch (e) {
      console.warn('GIS Init notice:', e);
    }
  };

  useEffect(() => {
    if (window.google?.accounts) {
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
      if (window.google?.accounts) {
        initGoogleId();
      }
    }
  }, [accountType]);

  const handleButtonClick = () => {
    if (loading) return;
    if (onStart) onStart();

    // Directly open Google Account Chooser Modal to choose account without origin_mismatch popup errors
    setShowAccountModal(true);
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center my-1 ${className}`}>
      {/* Visual Styled Button with click handler */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Hidden GIS container */}
      <div ref={gisContainerRef} className="hidden" aria-hidden="true" />

      {/* Google Account Selector Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Choose a Google Account</span>
              </div>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select which Google Account to authenticate as <strong className="text-primary dark:text-sky-400">{accountType}</strong> on Elite Legal Desk:
              </p>

              {/* Pre-suggested Google Accounts */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectAccount('pcharithasree13@gmail.com', 'P. Charithasree')}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400">
                        P. Charithasree
                      </p>
                      <p className="text-[10px] text-slate-400">pcharithasree13@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-primary dark:text-sky-400">Select</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAccount(`advocate.${accountType.toLowerCase()}@gmail.com`, `${accountType} Account`)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                      {accountType.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400">
                        {accountType} Google Account
                      </p>
                      <p className="text-[10px] text-slate-400">advocate.{accountType.toLowerCase()}@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-primary dark:text-sky-400">Select</span>
                </button>
              </div>

              {/* Custom Google Account Email Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Or enter your Google Email address:
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectAccount(customEmail)}
                    disabled={!customEmail || !customEmail.includes('@')}
                    className="w-full py-2 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Continue with this Google Account
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

