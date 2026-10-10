import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Scale, Calculator, Gavel, BookOpen, MessageSquare,
  FileText, ShieldCheck, Landmark, Compass, Calendar, Search,
  ArrowRight, ShieldAlert, CheckCircle2, Lock, Sparkles, Building2, PhoneCall
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { FounderSection } from '../components/FounderSection';
import { AuthModal } from '../components/AuthModal';

export const PublicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<'Advocate' | 'Client' | 'Admin'>('Advocate');
  const [authActionPrompt, setAuthActionPrompt] = useState('Please sign in or create an account to continue.');

  const openAuthModal = (mode: 'login' | 'signup', role: 'Advocate' | 'Client' | 'Admin' = 'Advocate', prompt?: string) => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    if (prompt) setAuthActionPrompt(prompt);
    setAuthModalOpen(true);
  };

  const handleProtectedAction = (path: string, isProtected: boolean) => {
    if (token) {
      navigate(path);
    } else if (isProtected) {
      openAuthModal('login', 'Client', 'Please sign in to access this feature.');
    } else {
      navigate(path);
    }
  };

  // Quick Land calculator preview state
  const [landValue, setLandValue] = useState<string>('1');
  const [landUnitFrom, setLandUnitFrom] = useState<string>('Acres');
  const [landConvertedSqFt, setLandConvertedSqFt] = useState<string>('43,560');

  // Quick Date Calculator state preview on public dashboard
  const todayStr = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

  const [startDateStr, setStartDateStr] = useState(oneMonthAgoStr);
  const [endDateStr, setEndDateStr] = useState(todayStr);
  const [dateDiffResult, setDateDiffResult] = useState<number>(30);

  // Quick Date calculation handler
  const handleDateCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateStr || !endDateStr) return;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDateDiffResult(diffDays);
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

  // Comprehensive Module Catalog with refined legal accents & module-specific card themes
  const modulesList = [
    {
      id: 'land-calc',
      title: 'Land Area Converter',
      category: 'Public Access',
      isProtected: false,
      icon: Landmark,
      description: 'Convert regional land measurements: Square Feet, Acres, Guntas, Ankanams, Cents, Hectares, and Bighas.',
      actionText: 'Open Land Converter',
      path: '/calculators',
      iconBg: 'bg-[#B85232]/15 text-[#B85232] dark:text-[#E88C74] border-[#B85232]/30',
      cardClass: 'card-land'
    },
    {
      id: 'interest-calc',
      title: 'Interest Calculator',
      category: 'Public Access',
      isProtected: false,
      icon: Calculator,
      description: 'Compute simple and compound interest on litigation awards, court decrees, and commercial claims.',
      actionText: 'Open Interest Calculator',
      path: '/interest-calculator',
      iconBg: 'bg-[#52633C]/15 text-[#52633C] dark:text-[#A3BA88] border-[#52633C]/30',
      cardClass: 'card-interest'
    },
    {
      id: 'date-calc',
      title: 'Date Calculator',
      category: 'Public Access',
      isProtected: false,
      icon: Calendar,
      description: 'Calculate calendar days between two dates with leap year breakdown and inclusive count support.',
      actionText: 'Open Date Calculator',
      path: '/date-difference-calculator',
      iconBg: 'bg-[#61564C]/15 text-[#61564C] dark:text-[#C4B9AF] border-[#61564C]/30',
      cardClass: 'card-date'
    },
    {
      id: 'directory',
      title: 'Advocate Details',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Users,
      description: 'Search & connect with verified advocates across Madanapalle, Andhra Pradesh, High Courts, and District Courts.',
      actionText: 'Search Advocates',
      path: '/directory',
      iconBg: 'bg-[#39665B]/15 text-[#39665B] dark:text-[#81B8AB] border-[#39665B]/30',
      cardClass: 'card-directory'
    },
    {
      id: 'services',
      title: 'Legal Services & Notary',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Building2,
      description: 'Civil litigation support, land title verification, notary statutory attestations, bank legal panel advisory.',
      actionText: 'Explore Legal Services',
      path: '/directory',
      iconBg: 'bg-[#8C6927]/15 text-[#8C6927] dark:text-[#E3C27D] border-[#8C6927]/30',
      cardClass: 'card-services'
    },
    {
      id: 'laws',
      title: 'Bare Acts & Laws',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: BookOpen,
      description: 'Access comprehensive Central & State Bare Acts, statutory sections, legislative amendments, and legal rules.',
      actionText: 'Browse Bare Acts',
      path: '/laws',
      iconBg: 'bg-[#704262]/15 text-[#704262] dark:text-[#C99BBF] border-[#704262]/30',
      cardClass: 'card-laws'
    },
    {
      id: 'judgements',
      title: 'Judgements & Bare Acts',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Gavel,
      description: 'Browse Supreme Court of India and High Court landmark judgements, precedent rulings, and case law transcripts.',
      actionText: 'Search Judgments',
      path: '/judgements',
      iconBg: 'bg-[#704262]/15 text-[#704262] dark:text-[#C99BBF] border-[#704262]/30',
      cardClass: 'card-laws'
    },
    {
      id: 'section-mapping',
      title: 'Old Act to New Act Converter (IPC -> BNS, CrPC -> BNSS, Evidence Act to BSA)',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Compass,
      description: 'Interactive mapping between traditional criminal codes (IPC, CrPC, Evidence Act) and new Bharatiya Nyaya Sanhita (BNS, BNSS, BSA).',
      actionText: 'View Section Map',
      path: '/section-mapping',
      iconBg: 'bg-[#704262]/15 text-[#704262] dark:text-[#C99BBF] border-[#704262]/30',
      cardClass: 'card-laws'
    },
    {
      id: 'projects',
      title: 'Case Tracking',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Scale,
      description: 'Litigation file management, client case assignments, next hearing dates, task progress, and lawyer notes.',
      actionText: 'Manage Cases',
      path: '/projects',
      iconBg: 'bg-[#945133]/15 text-[#945133] dark:text-[#E09A7E] border-[#945133]/30',
      cardClass: 'card-case'
    },
    {
      id: 'collaboration',
      title: 'Doc Collaboration & Drafting',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: FileText,
      description: 'Collaborative legal notice drafting, contract review, versioning, annotation, and shared document vaults.',
      actionText: 'Draft Docs',
      path: '/collaboration',
      iconBg: 'bg-[#6A4E70]/15 text-[#6A4E70] dark:text-[#BFA5C4] border-[#6A4E70]/30',
      cardClass: 'card-documents'
    },
    {
      id: 'chat',
      title: 'Secure Client-Advocate Chat',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: MessageSquare,
      description: 'Direct real-time encrypted communication between clients and assigned legal advocates with document sharing.',
      actionText: 'Start Chat',
      path: '/chat',
      iconBg: 'bg-[#39665B]/15 text-[#39665B] dark:text-[#81B8AB] border-[#39665B]/30',
      cardClass: 'card-directory'
    },
    {
      id: 'notifications',
      title: 'Hearing Alerts & Reminders',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: Calendar,
      description: 'Automated hearing date notifications, task deadline reminders, and court schedule updates for active matters.',
      actionText: 'View Reminders',
      path: '/projects',
      iconBg: 'bg-[#945133]/15 text-[#945133] dark:text-[#E09A7E] border-[#945133]/30',
      cardClass: 'card-case'
    },
    {
      id: 'verification',
      title: 'Advocate Credential Verification',
      category: 'Protected (Sign In)',
      isProtected: true,
      icon: ShieldCheck,
      description: 'Platform verification system for Bar Council enrollment numbers, advocate credentials, and administrator approvals.',
      actionText: 'Admin Console',
      path: '/dashboard',
      iconBg: 'bg-[#39665B]/15 text-[#39665B] dark:text-[#81B8AB] border-[#39665B]/30',
      cardClass: 'card-directory'
    }
  ];

  return (
    <div className="w-full font-sans bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary">
      {/* Main Content Body */}
      <main className="w-full">

        {/* HERO SECTION */}
        <section className="relative bg-[#EFEAE0] dark:bg-[#151815] text-[#242522] dark:text-[#F4F0E7] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D8D1C5] dark:border-[#3A4038] overflow-hidden transition-colors">

          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="heroPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#heroPattern)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">

            {/* Prominent Logo & Suite Badge */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group">
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-[#FFFDF8] border-2 border-[#A67C3B] p-1 shadow-md overflow-hidden flex items-center justify-center">
                  <img
                    src="/logo.jpg"
                    alt="Elite Legal Desk Logo"
                    className="h-full w-full object-contain rounded-full"
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-[#A67C3B]/10 dark:bg-[#C7A45A]/15 border border-[#A67C3B]/30 px-4 py-1.5 rounded-full text-xs font-semibold text-[#183C32] dark:text-[#D8C49A]">
                <Scale size={14} className="text-[#A67C3B] dark:text-[#C7A45A]" />
                <span>Digital Legal Technology & Case Collaboration Suite</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-[#242522] dark:text-[#F4F0E7] max-w-4xl mx-auto leading-tight">
                Elite Legal Desk
              </h1>
            </div>

            <p className="text-[#625F58] dark:text-[#C5C0B6] text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
              A professional digital platform connecting legal services, verified advocates, legal documents, statutory bare acts, legal calculators, and litigation tools in one integrated portal.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-medium pt-2">
              <span className="flex items-center gap-1.5 bg-[#FFFDF8] dark:bg-[#242822] px-3 py-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] text-[#183C32] dark:text-[#8FAF9C] shadow-xs">
                <Calculator size={14} className="text-[#183C32] dark:text-[#8FAF9C]" /> Land & Legal Calculators
              </span>
              <span className="flex items-center gap-1.5 bg-[#FFFDF8] dark:bg-[#242822] px-3 py-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] text-[#242522] dark:text-[#F4F0E7] shadow-xs">
                <ShieldCheck size={14} className="text-[#A67C3B] dark:text-[#C7A45A]" /> Verified Advocate Directory
              </span>
              <span className="flex items-center gap-1.5 bg-[#FFFDF8] dark:bg-[#242822] px-3 py-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] text-[#242522] dark:text-[#F4F0E7] shadow-xs">
                <BookOpen size={14} className="text-[#6A5948] dark:text-[#D8C49A]" /> Bare Acts & Judgments Library
              </span>
              <span className="flex items-center gap-1.5 bg-[#FFFDF8] dark:bg-[#242822] px-3 py-1.5 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] text-[#242522] dark:text-[#F4F0E7] shadow-xs">
                <Scale size={14} className="text-[#71877B] dark:text-[#AFC9B7]" /> Case & Litigation Tracking
              </span>
            </div>

            {/* Clean Hero Call to Action Buttons */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              <a
                href="#modules"
                className="btn-primary flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <BookOpen size={16} />
                <span>Explore Legal Services</span>
              </a>

              <button
                onClick={() => handleProtectedAction('/directory', true)}
                className="btn-premium flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <Users size={16} />
                <span>Find an Advocate</span>
              </button>

              <Link
                to="/calculators"
                className="btn-secondary flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <Calculator size={16} />
                <span>Calculators</span>
              </Link>

              {!token && (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="btn-secondary flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                  >
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn-primary flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                  >
                    <span>Create Account</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </section>

        {/* MODULE OVERVIEW SECTION */}
        <section id="modules" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">

          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183C32]/10 dark:bg-[#6F9A83]/15 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 text-xs font-bold uppercase tracking-wider">
              <span>Platform Modules & Access Policy</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#242522] dark:text-[#F4F0E7] font-serif tracking-tight">
              Everything You Need for Your Legal Journey
            </h2>
            <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm leading-relaxed font-normal">
              Land Measurement, Interest, and Date Difference calculators are accessible to all users. Professional litigation tools require sign in/sign up.
            </p>
          </div>

          {/* Grid of All Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulesList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`${item.cardClass} p-6 flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${item.iconBg}`}>
                        <Icon size={22} />
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.isProtected
                        ? 'bg-[#A67C3B]/10 text-[#A67C3B] dark:text-[#D8C49A] border-[#A67C3B]/20'
                        : 'bg-[#183C32]/10 text-[#183C32] dark:text-[#8FAF9C] border-[#183C32]/20'
                        }`}>
                        {item.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7] group-hover:text-[#183C32] dark:group-hover:text-[#C7A45A] transition-colors font-serif">
                        {item.title}
                      </h3>
                      <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs mt-1.5 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>

                  </div>

                  <div className="pt-5 mt-4 border-t border-[#D8D1C5]/60 dark:border-[#3A4038]/60">
                    <button
                      onClick={() => {
                        if (item.isProtected) {
                          handleProtectedAction(item.path, item.isProtected);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${item.isProtected
                        ? 'btn-secondary'
                        : 'btn-primary'
                        }`}
                    >
                      {item.isProtected && <Lock size={14} className="text-[#A67C3B]" />}
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
        <section className="bg-[#EFEAE0] dark:bg-[#1E211D] border-t border-b border-[#D8D1C5] dark:border-[#3A4038] py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">

            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183C32]/10 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 text-xs font-bold uppercase tracking-wider">
                <Calculator size={14} />
                <span>Publicly Accessible Legal Utilities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242522] dark:text-[#F4F0E7] font-serif">
                Land Measurement & Legal Utility Calculators
              </h2>
              <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm">
                Land measurement converters, interest rate calculators, and date difference calculators are available to all users.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* 1. Date Difference Calculator */}
              <div className="card-date p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#DBD5CD]/60 dark:border-[#47423D]/60 pb-3">
                  <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7] font-serif flex items-center gap-2">
                    <Calendar size={18} className="text-[#61564C] dark:text-[#C4B9AF]" />
                    Date Difference Calculator (Public)
                  </h3>
                  <span className="badge-verified">
                    Public Access
                  </span>
                </div>

                <form onSubmit={handleDateCalcSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        className="legal-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDateStr}
                        onChange={(e) => setEndDateStr(e.target.value)}
                        className="legal-input"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#EFEAE0] dark:bg-[#1E211D] p-3 rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
                    <span className="text-xs text-[#625F58] dark:text-[#C5C0B6]">Calculated Difference:</span>
                    <span className="text-base font-extrabold text-[#61564C] dark:text-[#C4B9AF] font-mono">
                      {dateDiffResult} Days
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="btn-primary flex-1 text-xs"
                    >
                      Calculate Days
                    </button>
                    <Link
                      to="/date-difference-calculator"
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      Full Calculator <ArrowRight size={12} />
                    </Link>
                  </div>
                </form>
              </div>

              {/* 2. Land Area Converter */}
              <div className="card-land p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8C8BC]/60 dark:border-[#522E23]/60 pb-3">
                  <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7] font-serif flex items-center gap-2">
                    <Landmark size={18} className="text-[#B85232] dark:text-[#E88C74]" />
                    Regional Land Area Converter (Public)
                  </h3>
                  <span className="badge-verified">
                    Public Access
                  </span>
                </div>

                <form onSubmit={handleLandCalcSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                        Land Area Quantity
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={landValue}
                        onChange={(e) => setLandValue(e.target.value)}
                        className="legal-input font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                        Select Input Unit
                      </label>
                      <select
                        value={landUnitFrom}
                        onChange={(e) => setLandUnitFrom(e.target.value)}
                        className="legal-input"
                      >
                        <option value="Acres">Acres</option>
                        <option value="Guntas">Guntas (Guntha)</option>
                        <option value="Ankanams">Ankanams</option>
                        <option value="Cents">Cents</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#EFEAE0] dark:bg-[#1E211D] p-3 rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
                    <span className="text-xs text-[#625F58] dark:text-[#C5C0B6]">Converted Area (Sq. Ft):</span>
                    <span className="text-base font-extrabold text-[#A67C3B] dark:text-[#C7A45A] font-mono">
                      {landConvertedSqFt} Sq. Ft
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="btn-premium flex-1 text-xs"
                    >
                      Convert Measurement
                    </button>
                    <Link
                      to="/calculators"
                      className="btn-secondary text-xs flex items-center gap-1"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183C32]/10 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 text-xs font-bold uppercase tracking-wider">
              <span>Role-Based Functionality</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242522] dark:text-[#F4F0E7] font-serif">
              Sign in to access specialized tools and insights customized for your specific role
            </h2>
            <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm">
              Elite Legal Desk maintains strict security boundaries and role authorization to protect private litigation data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="legal-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#183C32]/10 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#242522] dark:text-[#F4F0E7] font-serif">
                  Clients & Litigants
                </h3>
                <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] leading-relaxed">
                  Litigants can search verified advocates in the directory, track ongoing case progress, calculate court fees, and communicate securely with their legal counsel after signing in.
                </p>
                <ul className="text-xs text-[#625F58] dark:text-[#C5C0B6] space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• View personal case status</li>
                  <li className="flex items-center gap-1.5">• Encrypted advocate messenger</li>
                  <li className="flex items-center gap-1.5">• Court fee & land calculators</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Client', 'Sign in as a Client to view your case files.')}
                className="btn-secondary w-full text-xs"
              >
                Client Portal Sign In
              </button>
            </div>

            <div className="legal-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#A67C3B]/10 text-[#A67C3B] dark:text-[#C7A45A] border border-[#A67C3B]/20 flex items-center justify-center font-bold">
                  <Scale size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#242522] dark:text-[#F4F0E7] font-serif">
                  Legal Advocates & Notaries
                </h3>
                <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] leading-relaxed">
                  Advocates can manage active cases, track hearing dates, draft collaborative legal notices, communicate with clients, and list their Bar credentials in the directory after signing in.
                </p>
                <ul className="text-xs text-[#625F58] dark:text-[#C5C0B6] space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• Case tracking & hearing calendar</li>
                  <li className="flex items-center gap-1.5">• Document drafting & collaboration</li>
                  <li className="flex items-center gap-1.5">• Bar Council directory profile</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Advocate', 'Sign in as an Advocate to access practice management.')}
                className="btn-premium w-full text-xs"
              >
                Advocate Portal Sign In
              </button>
            </div>

            <div className="legal-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#6A5948]/10 text-[#6A5948] dark:text-[#D8C49A] border border-[#6A5948]/20 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#242522] dark:text-[#F4F0E7] font-serif">
                  Legal Administrators
                </h3>
                <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] leading-relaxed">
                  Administrators manage platform verification, review Bar Council enrollment credentials, maintain state court fee rule engines, and upload landmark laws & judgements.
                </p>
                <ul className="text-xs text-[#625F58] dark:text-[#C5C0B6] space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">• Advocate verification approvals</li>
                  <li className="flex items-center gap-1.5">• Court fee rule engine admin</li>
                  <li className="flex items-center gap-1.5">• Bare Acts & document indexing</li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('login', 'Admin', 'Administrator sign in required to access management controls.')}
                className="btn-primary w-full text-xs"
              >
                Administrator Sign In
              </button>
            </div>

          </div>

        </section>

        {/* FOUNDER DETAILS SECTION */}
        <FounderSection />

      </main>

      {/* AUTHENTICATION PROMPT MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        actionPrompt={authActionPrompt}
      />

    </div>
  );
};
