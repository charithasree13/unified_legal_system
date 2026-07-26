import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Phone, User, Landmark, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, token } = useAuthStore();

  // Navigation redirect if already logged in
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  // Auth Modes: 'login' | 'signup' | 'forgot' | 'otp' | 'reset'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>('login');

  // State variables for form fields
  const [signupRole, setSignupRole] = useState<'Advocate' | 'Client'>('Advocate');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // OTP states
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState(''); // Exposed in UI for developer trial

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle OTP digit inputs
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otpCode];
    newOtp[index] = element.value;
    setOtpCode(newOtp);

    // Focus next input box
    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otpCode[index] === '' && e.currentTarget.previousSibling) {
      (e.currentTarget.previousSibling as HTMLInputElement).focus();
    }
  };

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

  // -------------------------------------------------------------
  // FORM SUBMISSION HANDLERS
  // -------------------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both Email/Phone and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          setSuccessMsg('Email OTP verification required.');
          setDemoOtp(data.otp || '');
          setMode('otp');
        } else {
          setErrorMsg(data.message || 'Login failed.');
        }
      } else {
        login(data.user, data.accessToken, data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the authorization server.');
    } finally {
      setLoading(false);
    }
  };

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, password, confirmPassword, enrollmentNumber: signupRole === 'Advocate' ? enrollmentNumber : undefined, role: signupRole
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
        }, 1500);
      }
    } catch (err) {
      setErrorMsg('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedOtp = otpCode.join('');
    if (joinedOtp.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: joinedOtp })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Verification failed.');
      } else {
        setSuccessMsg('Verification successful! You can now log in.');
        setTimeout(() => {
          setMode('login');
          clearForm();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg('Network connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to request reset.');
      } else {
        setSuccessMsg('OTP Code has been generated.');
        setDemoOtp(data.otp || '');
        setMode('reset');
      }
    } catch (err) {
      setErrorMsg('Network error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedOtp = otpCode.join('');
    if (!joinedOtp || !password || !confirmPassword) {
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: joinedOtp, password, confirmPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Password reset failed.');
      } else {
        setSuccessMsg('Password updated successfully. Redirecting...');
        setTimeout(() => {
          setMode('login');
          clearForm();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg('Network error during reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors">

      {/* LEFT CANVAS PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-slate-900 justify-center items-center p-12 relative overflow-hidden">
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,195,247,0.15),transparent_60%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative text-center max-w-lg z-10 animate-slide-up">
          <div className="bg-secondary/10 inline-flex p-4 rounded-3xl text-secondary mb-6 border border-secondary/20 shadow-lg">
            <Scale size={48} className="stroke-[1.5] animate-pulse-slow" />
          </div>
          <h1 className="text-4xl font-bold font-sans tracking-wide text-white mb-4">
            Unified Legal Professional System
          </h1>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            An enterprise workflow collaboration suite, built for practicing advocates, corporate counsels, and legal administrators. Secured by JWT encryption.
          </p>
          <div className="flex gap-4 justify-center text-xs text-secondary font-semibold uppercase tracking-wider">
            <span>Encrypted Chat</span>
            <span>•</span>
            <span>Task Management</span>
            <span>•</span>
            <span>Bare Acts & Laws</span>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH CARD PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/80 p-8 glass animate-slide-up">

          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password Request'}
                {mode === 'otp' && 'OTP Code Verification'}
                {mode === 'reset' && 'Create New Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login' && 'Access the secure legal environment'}
                {mode === 'signup' && 'Register as an Advocate or Client to start'}
                {mode === 'forgot' && 'Provide account email to fetch OTP code'}
                {mode === 'otp' && `Verification code sent to ${email}`}
                {mode === 'reset' && 'Provide secure keys and update credentials'}
              </p>
            </div>
            <Scale className="text-primary dark:text-sky-400" size={32} />
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex gap-2 items-start font-medium">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex gap-2 items-start font-medium animate-fade-in">
              <KeyRound size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <span>{successMsg}</span>
                {demoOtp && (
                  <div className="mt-1.5 font-bold bg-emerald-500/20 dark:bg-emerald-400/20 px-2.5 py-1 rounded inline-block text-emerald-700 dark:text-emerald-300">
                    DEMO OTP CODE: <span className="underline tracking-widest">{demoOtp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Forms switcher */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all placeholder:text-slate-400"
                    placeholder="email@court.org or 9876543210"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setMode('forgot'); }}
                    className="text-xs text-primary dark:text-sky-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all placeholder:text-slate-400"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 dark:text-slate-400 select-none">
                  Remember my session key on this browser
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating Security Session...' : 'Establish Secure Connection'}
              </button>

              <div className="mt-6 text-center text-xs text-slate-500">
                Don't have a secure login?{' '}
                <button
                  type="button"
                  onClick={() => { clearForm(); setMode('signup'); }}
                  className="text-primary dark:text-sky-400 font-semibold hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSignupRole('Advocate')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    signupRole === 'Advocate' 
                      ? 'bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Advocate
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('Client')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    signupRole === 'Client' 
                      ? 'bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Client / Citizen
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  {signupRole === 'Advocate' ? 'Full Professional Name' : 'Full Name'}
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                    placeholder={signupRole === 'Advocate' ? 'Advocate Name' : 'John Doe'}
                  />
                </div>
              </div>

              {signupRole === 'Advocate' && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Advocate Enrollment Number (Bar Council Reg.)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Landmark size={14} />
                    </span>
                    <input
                      type="text"
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                      placeholder="e.g. MAH/1234/2021"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Phone Number
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      maxLength={10}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Email Address {signupRole === 'Client' && '(Optional)'}
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={signupRole === 'Advocate'}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                      placeholder={signupRole === 'Advocate' ? 'advocate@court.org' : 'email@example.com (Optional)'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Confirm
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-all mt-2 cursor-pointer shadow"
              >
                {loading ? 'Creating Secure Account...' : 'Initiate Account Registration'}
              </button>

              <div className="mt-4 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { clearForm(); setMode('login'); }}
                  className="text-primary dark:text-sky-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Verify Registered Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                    placeholder="advocate@court.org"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-all mt-2 cursor-pointer shadow"
              >
                {loading ? 'Verifying email...' : 'Request Validation Key (OTP)'}
              </button>

              <button
                type="button"
                onClick={() => { clearForm(); setMode('login'); }}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs text-slate-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="h-10 w-10 text-center text-lg font-bold border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-sky-400 dark:focus:ring-sky-400 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow animate-pulse-slow"
              >
                {loading ? 'Validating OTP...' : 'Submit OTP Credentials'}
              </button>

              <div className="text-center text-xs">
                Need another code?{' '}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary dark:text-sky-400 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="button"
                onClick={() => { clearForm(); setMode('login'); }}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs text-slate-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Cancel Verification
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Enter 6-Digit OTP Key
                </label>
                <div className="flex justify-between gap-2 max-w-[280px] mx-auto mb-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="h-10 w-10 text-center text-lg font-bold border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-sky-400 dark:focus:ring-sky-400 transition-all"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  New Secure Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary dark:bg-sky-500 hover:bg-primary-hover dark:hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-all mt-2 cursor-pointer shadow"
              >
                {loading ? 'Updating Password...' : 'Save & Reset Secure Key'}
              </button>

              <button
                type="button"
                onClick={() => { clearForm(); setMode('login'); }}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs text-slate-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Cancel
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
