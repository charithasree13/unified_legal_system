import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Scale, Mail, Lock, Phone, User, Landmark, ShieldAlert, CheckCircle2, KeyRound, Shield, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GoogleAuthButton } from './GoogleAuthButton';

const SPECIALIZATIONS = [
  'Civil Litigation',
  'Criminal Defense',
  'Corporate Law',
  'Taxation Law',
  'Intellectual Property',
  'Bank legal advisors',
  'Notary',
  'AGP',
  'APP'
];

const PRACTICING_COURTS = [
  'Supreme Court of India',
  'High Court',
  'Senior civil judges court',
  'Junior civil Judges court',
  'Judicial magistrate of 1st class',
  'Consumers forum',
  'DRT'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'advocate-details';
  initialRole?: 'Advocate' | 'Client' | 'Admin';
  actionPrompt?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  initialRole = 'Advocate',
  actionPrompt = 'Please sign in or create an account to continue.' 
}) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'advocate-details'>(initialMode);
  const [authRole, setAuthRole] = useState<'Advocate' | 'Client' | 'Admin'>(initialRole);
  const [signupRole, setSignupRole] = useState<'Advocate' | 'Client'>('Advocate');

  // Sync state when props change
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setAuthRole(initialRole);
  }, [initialRole]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');

  // Advocate details specific form fields
  const [enrollmentDate, setEnrollmentDate] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Civil Litigation']);
  const [selectedCourts, setSelectedCourts] = useState<string[]>(['High Court']);
  const [experience, setExperience] = useState<number>(1);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

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
    setEnrollmentDate('');
    setSelectedSpecs(['Civil Litigation']);
    setSelectedCourts(['High Court']);
    setExperience(1);
    setCity('');
    setState('');
    setAddress('');
    setBio('');
    setTempToken('');
    setGoogleProfile(null);
    setRegistrationSubmitted(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleRequiresAdvocateDetails = (data: any) => {
    setGoogleProfile(data.googleProfile || null);
    setTempToken(data.accessToken || '');
    if (data.googleProfile?.name) setName(data.googleProfile.name);
    if (data.googleProfile?.email) setEmail(data.googleProfile.email);
    setErrorMsg('');
    setSuccessMsg('');
    setRegistrationSubmitted(false);
    setMode('advocate-details');
  };

  const handleAuthSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 600);
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
        if (data.verificationStatus === 'PENDING' || data.pendingVerification) {
          setErrorMsg(data.message || 'Your advocate account is awaiting administrator verification.');
        } else if (data.verificationStatus === 'REJECTED' || data.rejectedVerification) {
          setErrorMsg(data.message || 'Your advocate registration was not approved by the administrator.');
        } else {
          setErrorMsg(data.message || 'Login failed.');
        }
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

  // Registration Handler (Password Registration)
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
        if (signupRole === 'Advocate') {
          setRegistrationSubmitted(true);
          setSuccessMsg(data.message || 'Your advocate registration has been submitted successfully and is pending verification by the administrator.');
        } else {
          setSuccessMsg(data.message || 'Registration successful! You can now log in.');
          setTimeout(() => {
            setMode('login');
            clearForm();
          }, 1200);
        }
      }
    } catch (err) {
      setErrorMsg('Network error during account registration.');
    } finally {
      setLoading(false);
    }
  };

  // Advocate Details Submission Handler (Google Auth Onboarding)
  const handleAdvocateDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !phone.trim() || !email.trim() || !enrollmentNumber.trim() || !enrollmentDate || !city.trim() || !state) {
      setErrorMsg('Please fill in all mandatory advocate profile details: Name, Phone, Email, Bar Enrollment Number, Enrollment Date, Specialization, Practicing Court, City, State.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile phone number.');
      return;
    }

    if (selectedSpecs.length === 0) {
      setErrorMsg('Please select at least one Specialization.');
      return;
    }

    if (selectedCourts.length === 0) {
      setErrorMsg('Please select at least one Practicing Court.');
      return;
    }

    setLoading(true);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (tempToken) {
        headers['Authorization'] = `Bearer ${tempToken}`;
      }

      const res = await fetch(`${API_BASE}/api/advocates/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          enrollmentNumber: enrollmentNumber.trim(),
          enrollmentDate,
          specialization: selectedSpecs,
          court: selectedCourts,
          experience: Number(experience || 1),
          city: city.trim(),
          state,
          address: address.trim(),
          bio: bio.trim(),
          googleSub: googleProfile?.googleSub
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to submit advocate registration details.');
      } else {
        setRegistrationSubmitted(true);
        const msg = data.message || 'Your Advocate account has been created successfully. Your profile is pending verification for inclusion in the Advocate Directory.';
        setSuccessMsg(msg);
        if (data.user) {
          login(data.user, data.accessToken || tempToken, data.refreshToken);
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg('Network error submitting advocate registration details. Please try again.');
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

  const handleSpecToggle = (spec: string) => {
    setSelectedSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleCourtToggle = (court: string) => {
    setSelectedCourts(prev =>
      prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/70 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full ${mode === 'advocate-details' ? 'max-w-2xl' : 'max-w-lg'} bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#858078] hover:text-[#242522] dark:hover:text-white rounded-lg hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] transition-colors"
          title="Close Authentication Dialog"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <img 
            src="/logo.jpg" 
            alt="Elite Legal Desk Logo" 
            className="h-10 w-10 object-contain rounded-full border border-[#A67C3B]/50 bg-[#FFFDF8]" 
          />
          <div>
            <h3 className="text-lg font-bold text-[#242522] dark:text-[#F4F0E7] leading-tight">
              {mode === 'advocate-details' ? 'Advocate Registration & Verification' : 'Elite Legal Desk Authentication'}
            </h3>
          </div>
        </div>

        {/* Action Prompt Banner */}
        {mode !== 'advocate-details' && (
          <div className="mb-5 p-3 rounded-xl bg-[#F1E9D8] dark:bg-[#332A19] border border-[#D8D1C5] dark:border-[#3A4038] text-[#80632E] dark:text-[#D8C49A] text-xs font-semibold flex items-center gap-2">
            <Scale size={16} className="text-[#A67C3B] dark:text-[#C7A45A] flex-shrink-0" />
            <span>{actionPrompt}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {mode !== 'advocate-details' && (
          <div className="grid grid-cols-2 gap-2 bg-[#EFEAE0] dark:bg-[#1E211D] p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); clearForm(); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-[#FFFDF8] dark:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] shadow-xs' 
                  : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522] dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); clearForm(); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-[#FFFDF8] dark:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] shadow-xs' 
                  : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522] dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-[#F1E2DF] dark:bg-[#38201D] border border-[#D8D1C5] dark:border-[#3A4038] text-[#7A423B] dark:text-[#E5A8A0] rounded-xl text-xs flex gap-2 items-start font-medium">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#E5EEE7] dark:bg-[#1F3327] border border-[#D8D1C5] dark:border-[#3A4038] text-[#315A43] dark:text-[#7CB895] rounded-xl text-xs flex gap-2 items-start font-medium">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-1 bg-[#EFEAE0] dark:bg-[#1E211D] p-1 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038]">
              <button
                type="button"
                onClick={() => setAuthRole('Advocate')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  authRole === 'Advocate'
                    ? 'bg-[#183C32] dark:bg-[#6F9A83] text-white dark:text-[#151815] font-bold shadow-xs'
                    : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522]'
                }`}
              >
                Advocate
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('Client')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  authRole === 'Client'
                    ? 'bg-[#183C32] dark:bg-[#6F9A83] text-white dark:text-[#151815] font-bold shadow-xs'
                    : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522]'
                }`}
              >
                User / Client
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('Admin')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  authRole === 'Admin'
                    ? 'bg-[#A67C3B] dark:bg-[#C7A45A] text-white dark:text-[#151815] font-bold shadow-xs'
                    : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522]'
                }`}
              >
                Admin
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                {authRole === 'Admin' ? 'Administrator Email Address' : 'Email Address or Phone Number'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    authRole === 'Advocate' 
                      ? 'advocate@example.com or phone' 
                      : authRole === 'Admin' 
                      ? 'admin@elitelegaldesk.com or email' 
                      : 'user@example.com or phone'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[#183C32] dark:text-[#6F9A83] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                authRole === 'Admin' ? 'bg-[#A67C3B] hover:bg-[#C19A59]' : 'bg-[#183C32] hover:bg-[#245445] dark:bg-[#6F9A83] dark:hover:bg-[#89AA98] dark:text-[#151815]'
              }`}
            >
              {loading ? 'Authenticating...' : authRole === 'Admin' ? 'Administrator Sign In' : 'Sign In'}
            </button>

            {/* Google OAuth Option - Exclude for Admin Sign In */}
            {authRole !== 'Admin' && (
              <div className="pt-2">
                <GoogleAuthButton 
                  accountType={authRole} 
                  text="Sign in with Google" 
                  onRequiresAdvocateDetails={handleRequiresAdvocateDetails}
                  onPendingVerification={(msg) => setErrorMsg(msg)}
                  onRejectedVerification={(msg) => setErrorMsg(msg)}
                  onError={(msg) => setErrorMsg(msg)}
                  onSuccess={handleAuthSuccess}
                />
              </div>
            )}

          </form>
        )}

        {/* 2. CREATE ACCOUNT FORM */}
        {mode === 'signup' && !registrationSubmitted && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            
            {/* Role Selection for Signup */}
            <div className="grid grid-cols-2 gap-2 bg-[#EFEAE0] dark:bg-[#1E211D] p-1 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038]">
              <button
                type="button"
                onClick={() => setSignupRole('Advocate')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  signupRole === 'Advocate' 
                    ? 'bg-[#A67C3B] text-white font-bold shadow-xs' 
                    : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522]'
                }`}
              >
                Register as Advocate
              </button>
              <button
                type="button"
                onClick={() => setSignupRole('Client')}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  signupRole === 'Client' 
                    ? 'bg-[#A67C3B] text-white font-bold shadow-xs' 
                    : 'text-[#625F58] dark:text-[#C5C0B6] hover:text-[#242522]'
                }`}
              >
                Register as User / Client
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                  Email Address {signupRole === 'Advocate' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                  />
                </div>
              </div>
            </div>

            {signupRole === 'Advocate' && (
              <div>
                <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                  Bar Council Enrollment Number *
                </label>
                <div className="relative">
                  <Landmark size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="e.g. AP/298/1998"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7] font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#A67C3B] hover:bg-[#C19A59] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

            {/* Google Signup Option */}
            <div className="pt-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#D8D1C5] dark:border-[#30352F]"></div>
                <span className="flex-shrink mx-2 text-[10px] text-[#858078] dark:text-[#969188] font-semibold uppercase">Or Continue With</span>
                <div className="flex-grow border-t border-[#D8D1C5] dark:border-[#30352F]"></div>
              </div>
              <GoogleAuthButton 
                accountType={signupRole} 
                text="Sign up with Google" 
                onRequiresAdvocateDetails={handleRequiresAdvocateDetails}
                onPendingVerification={(msg) => setErrorMsg(msg)}
                onRejectedVerification={(msg) => setErrorMsg(msg)}
                onError={(msg) => setErrorMsg(msg)}
                onSuccess={handleAuthSuccess}
              />
            </div>

          </form>
        )}

        {/* 3. PERSISTENT ADVOCATE DETAILS FORM (Google Auth Onboarding) */}
        {mode === 'advocate-details' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {!registrationSubmitted ? (
              <form onSubmit={handleAdvocateDetailsSubmit} className="space-y-4">
                <div className="p-3 bg-[#F1E9D8] dark:bg-[#332A19] border border-[#D8D1C5] dark:border-[#3A4038] rounded-xl text-xs text-[#80632E] dark:text-[#D8C49A]">
                  <p className="font-bold flex items-center gap-1.5 text-[#A67C3B] dark:text-[#C7A45A]">
                    ⚖️ Advocate Registration Details Required
                  </p>
                  <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6] mt-1 leading-relaxed">
                    Google identity verified ({googleProfile?.email || email}). Please provide your Bar Council enrollment & practice details below for administrator verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Advocate Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                      placeholder="Advocate Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                      placeholder="10 digit mobile number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                      placeholder="advocate@court.org"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Bar Enrollment Number *</label>
                    <input
                      type="text"
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7] font-mono"
                      placeholder="e.g. AP/298/1998"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Enrollment Date *</label>
                    <input
                      type="date"
                      value={enrollmentDate}
                      onChange={(e) => setEnrollmentDate(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Experience (Years) *</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Specialization(s) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide mb-1">
                      Specialization(s) * (Select Multiple)
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 p-3 bg-[#FFFDF8] dark:bg-[#1E211D] rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] max-h-36 overflow-y-auto">
                      {SPECIALIZATIONS.map((spec) => (
                        <label key={spec} className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer hover:text-[#183C32] dark:hover:text-[#6F9A83] transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedSpecs.includes(spec)}
                            onChange={() => handleSpecToggle(spec)}
                            className="rounded border-[#D8D1C5] text-[#183C32] focus:ring-[#183C32]"
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Practicing Court(s) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide mb-1">
                      Practicing Court(s) * (Select Multiple)
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 p-3 bg-[#FFFDF8] dark:bg-[#1E211D] rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] max-h-36 overflow-y-auto">
                      {PRACTICING_COURTS.map((court) => (
                        <label key={court} className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer hover:text-[#183C32] dark:hover:text-[#6F9A83] transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedCourts.includes(court)}
                            onChange={() => handleCourtToggle(court)}
                            className="rounded border-[#D8D1C5] text-[#183C32] focus:ring-[#183C32]"
                          />
                          <span>{court}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">City / Practice Location *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                      placeholder="e.g. Madanapalle"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">State / UT *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                    >
                      <option value="">Select State / UT</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Office Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                    placeholder="Chamber / Office address"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Professional Biography</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                    placeholder="Practices primarily in Civil litigation and Title verification..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); clearForm(); }}
                    className="px-4 py-2 border border-[#71877B] hover:bg-[#E7ECE5] dark:hover:bg-[#303930] text-[#183C32] dark:text-[#BFD4C7] rounded-xl text-xs font-semibold transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#183C32] hover:bg-[#245445] text-white dark:bg-[#6F9A83] dark:hover:bg-[#89AA98] dark:text-[#151815] rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Advocate Registration'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#F1E9D8] border border-[#D8D1C5] text-[#A67C3B] flex items-center justify-center mx-auto">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">Application Pending Verification</h4>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-2 leading-relaxed">
                    Your advocate registration has been submitted successfully and is pending verification by the administrator.
                  </p>
                </div>
                <div className="p-3 bg-[#EFEAE0] dark:bg-[#1E211D] rounded-xl border border-[#D8D1C5] dark:border-[#3A4038] text-[11px] text-[#858078]">
                  Status: <span className="font-bold text-[#A67C3B] dark:text-[#C7A45A]">PENDING ADMIN APPROVAL</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#183C32] text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-[#245445] transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                Account Email or Registered Phone
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#242522] dark:text-[#F4F0E7] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-2.5 text-[#858078] dark:text-[#969188]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#183C32] hover:bg-[#245445] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
