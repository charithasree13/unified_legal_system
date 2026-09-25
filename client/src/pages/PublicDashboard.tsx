import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Scale, Calculator, Gavel, BookOpen, MessageSquare, 
  FileText, ShieldCheck, Landmark, Compass, Calendar, Search, 
  ArrowRight, ShieldAlert, CheckCircle2, Lock, Sparkles, Building2, PhoneCall
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { PublicHeader } from '../components/PublicHeader';
import { FounderSection } from '../components/FounderSection';
import { FooterSection } from '../components/FooterSection';
import { AuthModal } from '../components/AuthModal';

export const PublicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authActionPrompt, setAuthActionPrompt] = useState('Please sign in or create an account to continue.');

  // Quick Calculator state preview on public dashboard
  const [courtFeeAmount, setCourtFeeAmount] = useState('100000');
  const [calcResult, setCalcResult] = useState<number | null>(7500);

  // Quick Land Conversion state preview on public dashboard
  const [landValue, setLandValue] = useState('1');
  const [landUnitFrom, setLandUnitFrom] = useState('Acres');
  const [landConvertedSqFt, setLandConvertedSqFt] = useState('43560');

  const openAuthModal = (mode: 'login' | 'signup' = 'login', prompt?: string) => {
    setAuthModalMode(mode);
    if (prompt) setAuthActionPrompt(prompt);
    else setAuthActionPrompt('Please sign in or create an account to continue.');
    setAuthModalOpen(true);
  };

  // Protected Action Interceptor
  const handleProtectedAction = (moduleName: string, path?: string) => {
    if (token) {
      if (path) navigate(path);
      else navigate('/dashboard');
    } else {
      openAuthModal('login', `Please sign in or create an account to access ${moduleName}.`);
    }
  };

  // Quick Court Fee calculation handler
  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(courtFeeAmount) || 0;
    if (val <= 10000) {
      setCalcResult(Math.round(val * 0.05));
    } else if (val <= 100000) {
      setCalcResult(Math.round(500 + (val - 10000) * 0.075));
    } else {
      setCalcResult(Math.round(7250 + (val - 100000) * 0.05));
    }
  };

  // Quick Land conversion handler
  const handleLandCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(landValue) || 0;
    if (landUnitFrom === 'Acres') setLandConvertedSqFt((val * 43560).toLocaleString());
    else if (landUnitFrom === 'Guntas') setLandConvertedSqFt((val * 1089).toLocaleString());
    else if (landUnitFrom === 'Ankanams') setLandConvertedSqFt((val * 72).toLocaleString());
    else if (landUnitFrom === 'Cents') setLandConvertedSqFt((val * 435.6).toLocaleString());
    else setLandConvertedSqFt((val * 43560).toLocaleString());
  };

  // Comprehensive Module Catalog (ONLY Court Fee Calculator & Land Converter are Public Access)
  const modulesList = [
    {
      id: 'court-fee-calc',
      title: 'Court Fee Calculator',
      category: 'Public Access Tool',
      isProtected: false,
      icon: Calculator,
      description: 'Compute state-specific court fees, ad-valorem suit valuation, probate fees, and statutory relief mapping.',
      actionText: 'Open Court Fee Tool',
      path: '/calculators',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'land-calc',
      title: 'Land Area Converter',
      category: 'Public Access Tool',
      isProtected: false,
      icon: Landmark,
      description: 'Convert regional land measurements: Square Feet, Acres, Guntas, Ankanams, Cents, Hectares, and Bighas.',
      actionText: 'Open Land Converter',
      path: '/calculators',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    },
    {
      id: 'directory',
      title: 'Advocate Directory',
      category: 'Sign In Required',
      isProtected: true,
      icon: Users,
      description: 'Search & connect with verified advocates across Madanapalle, Andhra Pradesh, High Courts, and District Courts.',
      actionText: 'Search Advocates (Sign In Required)',
      path: '/directory',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'services',
      title: 'Legal Services & Notary',
      category: 'Sign In Required',
      isProtected: true,
      icon: Building2,
      description: 'Civil litigation support, land title verification, notary statutory attestations, bank legal panel advisory.',
      actionText: 'Explore Legal Services (Sign In Required)',
      path: '/directory',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'laws',
      title: 'Bare Acts & Laws Repository',
      category: 'Sign In Required',
      isProtected: true,
      icon: BookOpen,
      description: 'Access comprehensive Central & State Bare Acts, statutory sections, legislative amendments, and legal rules.',
      actionText: 'Browse Bare Acts (Sign In Required)',
      path: '/laws',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'judgements',
      title: 'Judgments Repository',
      category: 'Sign In Required',
      isProtected: true,
      icon: Gavel,
      description: 'Browse Supreme Court of India and High Court landmark judgements, precedent rulings, and case law transcripts.',
      actionText: 'Search Judgments (Sign In Required)',
      path: '/judgements',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'section-mapping',
      title: 'Legal Section Mapping',
      category: 'Sign In Required',
      isProtected: true,
      icon: Compass,
      description: 'Interactive mapping between traditional criminal codes (IPC, CrPC, Evidence Act) and new Bharatiya Nyaya Sanhita (BNS, BNSS, BSA).',
      actionText: 'View Section Map (Sign In Required)',
      path: '/section-mapping',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'projects',
      title: 'Case & Project Tracking',
      category: 'Sign In Required',
      isProtected: true,
      icon: Scale,
      description: 'Litigation file management, client case assignments, next hearing dates, task progress, and lawyer notes.',
      actionText: 'Manage Cases (Sign In Required)',
      path: '/projects',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
    },
    {
      id: 'collaboration',
      title: 'Doc Collaboration & Drafting',
      category: 'Sign In Required',
      isProtected: true,
      icon: FileText,
      description: 'Collaborative legal notice drafting, contract review, versioning, annotation, and shared document vaults.',
      actionText: 'Draft Docs (Sign In Required)',
      path: '/collaboration',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    },
    {
      id: 'chat',
      title: 'Secure Client-Advocate Chat',
      category: 'Sign In Required',
      isProtected: true,
      icon: MessageSquare,
      description: 'Direct real-time encrypted communication between clients and assigned legal advocates with document sharing.',
      actionText: 'Start Chat (Sign In Required)',
      path: '/chat',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'notifications',
      title: 'Hearing Alerts & Reminders',
      category: 'Sign In Required',
      isProtected: true,
      icon: Calendar,
      description: 'Automated hearing date notifications, task deadline reminders, and court schedule updates for active matters.',
      actionText: 'View Reminders (Sign In Required)',
      path: '/projects',
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800'
    },
    {
      id: 'verification',
      title: 'Bar Credential Verification',
      category: 'Sign In Required',
      isProtected: true,
      icon: ShieldCheck,
      description: 'Platform verification system for Bar Council enrollment numbers, advocate credentials, and administrator approvals.',
      actionText: 'Admin Console (Sign In Required)',
      path: '/dashboard',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      
      {/* Top Professional Legal Header Navigation */}
      <PublicHeader onOpenAuthModal={openAuthModal} />

      {/* Main Content Body */}
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-slate-900 via-[#0B172E] to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="heroPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroPattern)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs">
              <Scale size={14} className="text-amber-400" />
              <span>Digital Legal Technology & Case Collaboration Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sans tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Elite Legal Desk
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              A professional digital platform connecting legal services, verified advocates, legal documents, statutory bare acts, court fee calculators, and litigation tools in one integrated portal.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-300 font-medium pt-2">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-emerald-400">
                <Calculator size={14} /> Public Court Fee Calculator
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-amber-300">
                <Lock size={14} /> Protected Advocate Directory (Sign In)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-amber-300">
                <Lock size={14} /> Protected Bare Acts & Judgments (Sign In)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-amber-300">
                <Lock size={14} /> Protected Case Tracking (Sign In)
              </span>
            </div>

            <div className="pt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              <Link
                to="/calculators"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Calculator size={16} />
                <span>Use Public Court Fee Calculator</span>
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={() => openAuthModal('login', 'Sign in or create an account to search the Advocate Directory.')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock size={16} className="text-amber-400" />
                <span>Find an Advocate (Sign In Required)</span>
              </button>

              {!token && (
                <>
                  <button
                    onClick={() => openAuthModal('login', 'Sign in to access protected case files, secure messaging, and client tools.')}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => openAuthModal('signup', 'Register as an Advocate or Client to unlock full legal features.')}
                    className="px-5 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>

          </div>
        </section>

        {/* MODULE OVERVIEW SECTION ("Everything You Need for Your Legal Journey") */}
        <section id="modules" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-sky-400 border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <span>Platform Modules & Access Policy</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything You Need for Your Legal Journey
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              Except the public Court Fee Calculator, all platform modules are protected. Please sign in or create an account to access directory listings, legal sections, laws, judgments, and case tools.
            </p>
          </div>

          {/* Grid of All Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulesList.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 group-hover:bg-primary transition-colors" />

                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${item.iconBg}`}>
                        <Icon size={22} />
                      </div>
                      
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        item.isProtected 
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.isProtected ? 'Protected (Sign In Required)' : 'Public Access'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        if (item.isProtected) {
                          handleProtectedAction(item.title, item.path);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        item.isProtected
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                          : 'bg-primary hover:bg-primary-hover text-white shadow-xs'
                      }`}
                    >
                      {item.isProtected && <Lock size={14} className="text-amber-500" />}
                      <span>{item.actionText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </section>

        {/* PUBLIC COURT FEE CALCULATOR SPOTLIGHT SECTION */}
        <section className="bg-slate-100 dark:bg-slate-900/60 border-t border-b border-slate-200 dark:border-slate-800 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Calculator size={14} />
                <span>Publicly Accessible Legal Utility</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Public Court Fee & Land Measurement Calculator
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                The Court Fee Calculator is publicly available to all visitors without requiring sign-in.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Court Fee Calculator */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale size={18} className="text-primary dark:text-sky-400" />
                    State Court Fee Valuation Tool (Public)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold uppercase">
                    Public Access
                  </span>
                </div>

                <form onSubmit={handleCalcSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Suit Claim Valuation (₹ Amount)
                    </label>
                    <input
                      type="number"
                      value={courtFeeAmount}
                      onChange={(e) => setCourtFeeAmount(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Estimated Court Fee:</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹ {calcResult !== null ? calcResult.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      Calculate Fee
                    </button>
                    <Link
                      to="/calculators"
                      className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                    >
                      Full Calculator <ArrowRight size={12} />
                    </Link>
                  </div>
                </form>
              </div>

              {/* 2. Land Area Converter */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Landmark size={18} className="text-amber-500" />
                    Regional Land Area Converter (Public)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold uppercase">
                    Public Access
                  </span>
                </div>

                <form onSubmit={handleLandCalcSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Land Area Quantity
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={landValue}
                        onChange={(e) => setLandValue(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select Input Unit
                      </label>
                      <select
                        value={landUnitFrom}
                        onChange={(e) => setLandUnitFrom(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Acres">Acres</option>
                        <option value="Guntas">Guntas (Guntha)</option>
                        <option value="Ankanams">Ankanams</option>
                        <option value="Cents">Cents</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Converted Area (Sq. Ft):</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                      {landConvertedSqFt} Sq. Ft
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      Convert Measurement
                    </button>
                    <Link
                      to="/calculators"
                      className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                    >
                      All Units <ArrowRight size={12} />
                    </Link>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </section>

        {/* USER / ADVOCATE / ADMIN ROLE EXPLANATION SECTION */}
        <section id="roles" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <span>Role-Based Functionality</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Tailored Solutions for Every Legal Role
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              Elite Legal Desk maintains strict security boundaries and role authorization to protect private litigation data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Clients & Litigants
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Litigants can search verified advocates in the directory, track ongoing case progress, calculate court fees, and communicate securely with their legal counsel after signing in.
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• View personal case status</li>
                  <li className="flex items-center gap-1.5">• Encrypted advocate messenger</li>
                  <li className="flex items-center gap-1.5">• Court fee & land calculators</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Sign in as a Client to view your case files.')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Client Portal Sign In
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold">
                  <Scale size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Legal Advocates & Notaries
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Advocates can manage active cases, track hearing dates, draft collaborative legal notices, communicate with clients, and list their Bar credentials in the directory after signing in.
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• Case tracking & hearing calendar</li>
                  <li className="flex items-center gap-1.5">• Document drafting & collaboration</li>
                  <li className="flex items-center gap-1.5">• Bar Council directory profile</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Sign in as an Advocate to access practice management.')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Advocate Portal Sign In
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Legal Administrators
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Administrators manage platform verification, review Bar Council enrollment credentials, maintain state court fee rule engines, upload laws/judgments, and audit security logs.
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• Advocate verification approvals</li>
                  <li className="flex items-center gap-1.5">• Court fee rule engine admin</li>
                  <li className="flex items-center gap-1.5">• Audit logs & document indexing</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Administrator sign in required to access management controls.')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Administrator Sign In
              </button>
            </div>

          </div>

        </section>

        {/* FOUNDER DETAILS SECTION */}
        <FounderSection />

      </main>

      {/* FOOTER SECTION */}
      <FooterSection />

      {/* AUTHENTICATION PROMPT MODAL */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        actionPrompt={authActionPrompt}
      />

    </div>
  );
};
