import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Scale, Mail, Lock, Phone, User, Landmark, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GoogleAuthButton } from './GoogleAuthButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  actionPrompt?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  actionPrompt = 'Please sign in or create an account to continue.' 
}) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [authRole, setAuthRole] = useState<'Advocate' | 'Client'>('Advocate');
  const [signupRole, setSignupRole] = useState<'Advocate' | 'Client'>('Advocate');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const clearForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEnrollmentNumber('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both Email/Phone and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Login failed.');
      } else {
        setSuccessMsg('Login successful! Welcome back.');
        login(data.user, data.accessToken, data.refreshToken);
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMsg('Unable to connect to authorization server.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupRole === 'Advocate') {
      if (!name || !phone || !email || !password || !confirmPassword || !enrollmentNumber) {
        setErrorMsg('Please fill in all required advocate fields.');
        return;
      }
    } else {
      if (!name || !phone || !password || !confirmPassword) {
        setErrorMsg('Please fill in all required fields (Name, Phone, Password).');
        return;
      }
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          confirmPassword,
          enrollmentNumber: signupRole === 'Advocate' ? enrollmentNumber : undefined,
          role: signupRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Registration failed.');
      } else {
        setSuccessMsg(data.message || 'Registration successful! You can now log in.');
        setTimeout(() => {
          setMode('login');
          clearForm();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Network error during account registration.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          email,
          newPassword: password,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Password reset failed.');
      } else {
        setSuccessMsg(data.message || 'Password updated successfully! You can now log in.');
        setTimeout(() => {
          setMode('login');
          clearForm();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Network error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close Authentication Dialog"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <img 
            src="/logo.jpg" 
            alt="Elite Legal Desk Logo" 
            className="h-10 w-10 object-contain rounded-full border border-amber-400 bg-white" 
          />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Elite Legal Desk Authentication
            </h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
              Madanapalle Legal Portal
            </span>
          </div>
        </div>

        {/* Action Prompt Banner */}
        <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Scale size={16} className="text-amber-500 flex-shrink-0" />
          <span>{actionPrompt}</span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); clearForm(); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' 
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); clearForm(); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup' 
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex gap-2 items-start font-medium">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex gap-2 items-start font-medium">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAuthRole('Advocate')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  authRole === 'Advocate' 
                    ? 'bg-primary text-white font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Advocate Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('Client')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  authRole === 'Client' 
                    ? 'bg-primary text-white font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                User / Client Sign In
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authRole === 'Advocate' ? 'advocate@example.com or phone' : 'user@example.com or phone'}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-primary dark:text-sky-400 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* Google OAuth Option */}
            <div className="pt-2">
              <GoogleAuthButton accountType={authRole} text="Sign in with Google" />
            </div>

          </form>
        )}

        {/* 2. CREATE ACCOUNT FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            
            {/* Role Selection for Signup */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSignupRole('Advocate')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  signupRole === 'Advocate' 
                    ? 'bg-amber-600 text-white font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Register as Advocate
              </button>
              <button
                type="button"
                onClick={() => setSignupRole('Client')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  signupRole === 'Client' 
                    ? 'bg-amber-600 text-white font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Register as User / Client
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adv. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address {signupRole === 'Advocate' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {signupRole === 'Advocate' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bar Council Enrollment Number *
                </label>
                <div className="relative">
                  <Landmark size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="e.g. AP/298/1998"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Email or Registered Phone
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
