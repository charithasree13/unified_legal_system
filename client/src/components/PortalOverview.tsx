import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Scale, Calculator, Gavel, BookOpen, MessageSquare, 
  FileText, User, Settings, ShieldCheck, Landmark, CloudUpload, 
  Activity, ArrowRight, Sparkles, Shield, Compass, Quote
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface FieldCard {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon: React.ElementType;
  path: string;
  isAdminInternal?: boolean;
  targetId?: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  gradientBorder: string;
}

export const PortalOverview: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'Client';

  const handleCardClick = (card: FieldCard) => {
    if (card.isAdminInternal && card.targetId) {
      const el = document.getElementById(card.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate(card.path);
      }
    } else {
      navigate(card.path);
    }
  };

  // Define role-specific cards
  const getCardsForRole = (): FieldCard[] => {
    if (role === 'Admin') {
      return [
        {
          id: 'admin-verify',
          title: 'Advocate Verification Center',
          description: 'Review pending Bar Council enrollment applications, verify advocate credentials and approve directory listings.',
          tag: 'Verification',
          icon: ShieldCheck,
          path: '/dashboard',
          isAdminInternal: true,
          targetId: 'admin-section-verifications',
          badgeBg: 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/30',
          badgeText: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          gradientBorder: 'hover:border-emerald-500/50'
        },
        {
          id: 'admin-fee-rules',
          title: 'Court Fee Rule Engine',
          description: 'Manage state-wise court fee acts, configure ad-valorem percentages, fixed fees, and statutory relief mappings.',
          tag: 'Fee Rules Engine',
          icon: Landmark,
          path: '/dashboard',
          isAdminInternal: true,
          targetId: 'admin-section-fee-rules',
          badgeBg: 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30',
          badgeText: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          gradientBorder: 'hover:border-amber-500/50'
        },
        {
          id: 'admin-docs',
          title: 'Judgements & Acts Indexing',
          description: 'Upload, organize, tag, and publish Supreme Court / High Court judgements and central & state Bare Acts.',
          tag: 'Repository Admin',
          icon: CloudUpload,
          path: '/dashboard',
          isAdminInternal: true,
          targetId: 'admin-section-doc-management',
          badgeBg: 'bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/30',
          badgeText: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          gradientBorder: 'hover:border-blue-500/50'
        },
        {
          id: 'admin-audit',
          title: 'Platform Audit Logs',
          description: 'Monitor real-time system activities, user authentication, data modifications, and security events.',
          tag: 'Security & Audit',
          icon: Activity,
          path: '/dashboard',
          isAdminInternal: true,
          targetId: 'admin-section-audit-logs',
          badgeBg: 'bg-purple-500/10 dark:bg-purple-400/10 border-purple-500/30',
          badgeText: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
          iconColor: 'text-purple-600 dark:text-purple-400',
          gradientBorder: 'hover:border-purple-500/50'
        },
        {
          id: 'directory',
          title: 'Advocate Directory',
          description: 'Access the complete advocate directory database, manage verified badges and practitioner profiles.',
          tag: 'Directory Hub',
          icon: Users,
          path: '/directory',
          badgeBg: 'bg-sky-500/10 dark:bg-sky-400/10 border-sky-500/30',
          badgeText: 'text-sky-600 dark:text-sky-400',
          iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
          iconColor: 'text-sky-600 dark:text-sky-400',
          gradientBorder: 'hover:border-sky-500/50'
        },
        {
          id: 'judgements',
          title: 'Judgements & Bare Acts Repository',
          description: 'Browse, search, and audit all indexed landmark judgements, case laws, central & state acts.',
          tag: 'Legal Library',
          icon: Gavel,
          path: '/judgements',
          badgeBg: 'bg-indigo-500/10 dark:bg-indigo-400/10 border-indigo-500/30',
          badgeText: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          gradientBorder: 'hover:border-indigo-500/50'
        },
        {
          id: 'projects',
          title: 'Case Projects Management',
          description: 'Overview of platform-wide litigation projects, active client-advocate mappings, and task progress.',
          tag: 'System Cases',
          icon: Scale,
          path: '/projects',
          badgeBg: 'bg-teal-500/10 dark:bg-teal-400/10 border-teal-500/30',
          badgeText: 'text-teal-600 dark:text-teal-400',
          iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
          iconColor: 'text-teal-600 dark:text-teal-400',
          gradientBorder: 'hover:border-teal-500/50'
        },
        {
          id: 'calculators',
          title: 'Calculators Engine',
          description: 'Audit and test state court fee calculators, ad-valorem suit formulas, and land conversion utilities.',
          tag: 'Utility Engine',
          icon: Calculator,
          path: '/calculators',
          badgeBg: 'bg-cyan-500/10 dark:bg-cyan-400/10 border-cyan-500/30',
          badgeText: 'text-cyan-600 dark:text-cyan-400',
          iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
          iconColor: 'text-cyan-600 dark:text-cyan-400',
          gradientBorder: 'hover:border-cyan-500/50'
        },
        {
          id: 'chat',
          title: 'Secure Chat Hub',
          description: 'Inspect active messaging channels, system communications, and user support conversations.',
          tag: 'Communications',
          icon: MessageSquare,
          path: '/chat',
          badgeBg: 'bg-rose-500/10 dark:bg-rose-400/10 border-rose-500/30',
          badgeText: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          gradientBorder: 'hover:border-rose-500/50'
        }
      ];
    }

    if (role === 'Advocate') {
      return [
        {
          id: 'projects',
          title: 'Case Projects & Tracking',
          description: 'Manage active cases, client assignments, hearing calendars, task milestones, and litigation notes.',
          tag: 'Active Practice',
          icon: Scale,
          path: '/projects',
          badgeBg: 'bg-indigo-500/10 dark:bg-indigo-400/10 border-indigo-500/30',
          badgeText: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          gradientBorder: 'hover:border-indigo-500/50'
        },
        {
          id: 'directory',
          title: 'Advocate Directory & Peer Network',
          description: 'Network with legal peers, view public practitioner profiles, and manage your directory listing.',
          tag: 'Public Directory',
          icon: Users,
          path: '/directory',
          badgeBg: 'bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/30',
          badgeText: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          gradientBorder: 'hover:border-blue-500/50'
        },
        {
          id: 'judgements',
          title: 'Judgements Repository',
          description: 'Search Supreme Court & High Court landmark judgements, precedent rulings, and case transcripts.',
          tag: 'Case Law Research',
          icon: Gavel,
          path: '/judgements',
          badgeBg: 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30',
          badgeText: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          gradientBorder: 'hover:border-amber-500/50'
        },
        {
          id: 'laws',
          title: 'Laws & Bare Acts',
          description: 'Access comprehensive central & state Bare Acts, statutory sections, amendments, and legal rules.',
          tag: 'Statutory Library',
          icon: BookOpen,
          path: '/laws',
          badgeBg: 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/30',
          badgeText: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          gradientBorder: 'hover:border-emerald-500/50'
        },
        {
          id: 'section-mapping',
          title: 'Legal Section Mapping',
          description: 'Interactive mapping of legal sections, IPC / Bharatiya Nyaya Sanhita (BNS) cross-references, and procedural codes.',
          tag: 'Legal Intelligence',
          icon: Compass,
          path: '/section-mapping',
          badgeBg: 'bg-purple-500/10 dark:bg-purple-400/10 border-purple-500/30',
          badgeText: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
          iconColor: 'text-purple-600 dark:text-purple-400',
          gradientBorder: 'hover:border-purple-500/50'
        },
        {
          id: 'calculators',
          title: 'Court Fee & Land Calculators',
          description: 'Compute state court fees, ad-valorem suit values, probate fees, stamp duty, and land area conversions.',
          tag: 'Valuation Tools',
          icon: Calculator,
          path: '/calculators',
          badgeBg: 'bg-teal-500/10 dark:bg-teal-400/10 border-teal-500/30',
          badgeText: 'text-teal-600 dark:text-teal-400',
          iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
          iconColor: 'text-teal-600 dark:text-teal-400',
          gradientBorder: 'hover:border-teal-500/50'
        },
        {
          id: 'chat',
          title: 'Client Secure Chat',
          description: 'Communicate with clients in real-time with document sharing, case status updates, and encrypted logs.',
          tag: 'Client Messenger',
          icon: MessageSquare,
          path: '/chat',
          badgeBg: 'bg-sky-500/10 dark:bg-sky-400/10 border-sky-500/30',
          badgeText: 'text-sky-600 dark:text-sky-400',
          iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
          iconColor: 'text-sky-600 dark:text-sky-400',
          gradientBorder: 'hover:border-sky-500/50'
        },
        {
          id: 'collaboration',
          title: 'Doc Collaboration Workspace',
          description: 'Collaborative legal drafting, contract review, versioning, annotation, and shared document workspaces.',
          tag: 'Legal Drafting',
          icon: FileText,
          path: '/collaboration',
          badgeBg: 'bg-rose-500/10 dark:bg-rose-400/10 border-rose-500/30',
          badgeText: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          gradientBorder: 'hover:border-rose-500/50'
        },
        {
          id: 'profile',
          title: 'Advocate Profile & Credentials',
          description: 'Manage your Bar Council enrollment number, practice areas, court practice locations, and bio.',
          tag: 'Professional Profile',
          icon: User,
          path: '/profile',
          badgeBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-400/10 border-fuchsia-500/30',
          badgeText: 'text-fuchsia-600 dark:text-fuchsia-400',
          iconBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20',
          iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
          gradientBorder: 'hover:border-fuchsia-500/50'
        }
      ];
    }

    // Default for Client or User role
    return [
      {
        id: 'directory',
        title: 'Advocate Directory',
        description: 'Search & connect with verified legal advocates across specializations, cities, High Courts, and District Courts.',
        tag: 'Find Legal Experts',
        icon: Users,
        path: '/directory',
        badgeBg: 'bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/30',
        badgeText: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        gradientBorder: 'hover:border-blue-500/50'
      },
      {
        id: 'projects',
        title: 'Case Projects & File Tracking',
        description: 'Track your active court cases, next hearing dates, lawyer notes, case progress, and task updates.',
        tag: 'My Litigation Files',
        icon: Scale,
        path: '/projects',
        badgeBg: 'bg-indigo-500/10 dark:bg-indigo-400/10 border-indigo-500/30',
        badgeText: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        gradientBorder: 'hover:border-indigo-500/50'
      },
      {
        id: 'calculators',
        title: 'Court Fee & Land Calculators',
        description: 'Calculate state court fees, stamp duty, ad-valorem suit valuation, and land measurement conversions.',
        tag: 'Legal Calculators',
        icon: Calculator,
        path: '/calculators',
        badgeBg: 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/30',
        badgeText: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        gradientBorder: 'hover:border-emerald-500/50'
      },
      {
        id: 'chat',
        title: 'Secure Advocate Chat',
        description: 'Direct real-time encrypted messaging with your assigned advocates and legal consultants.',
        tag: 'Encrypted Chat',
        icon: MessageSquare,
        path: '/chat',
        badgeBg: 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30',
        badgeText: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        gradientBorder: 'hover:border-amber-500/50'
      },
      {
        id: 'collaboration',
        title: 'Doc Collaboration Workspace',
        description: 'Review, annotate, and manage shared legal drafts, contracts, affidavits, and case petitions.',
        tag: 'Shared Drafts',
        icon: FileText,
        path: '/collaboration',
        badgeBg: 'bg-rose-500/10 dark:bg-rose-400/10 border-rose-500/30',
        badgeText: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        gradientBorder: 'hover:border-rose-500/50'
      },
      {
        id: 'profile',
        title: 'My Profile & Account',
        description: 'View and update your personal details, contact info, phone number, and account credentials.',
        tag: 'Personal Profile',
        icon: User,
        path: '/profile',
        badgeBg: 'bg-cyan-500/10 dark:bg-cyan-400/10 border-cyan-500/30',
        badgeText: 'text-cyan-600 dark:text-cyan-400',
        iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        gradientBorder: 'hover:border-cyan-500/50'
      },
      {
        id: 'settings',
        title: 'Platform Settings',
        description: 'Configure account security, toggle dark/light theme options, and notification preferences.',
        tag: 'Settings & Security',
        icon: Settings,
        path: '/settings',
        badgeBg: 'bg-slate-500/10 dark:bg-slate-400/10 border-slate-500/30',
        badgeText: 'text-slate-600 dark:text-slate-400',
        iconBg: 'bg-slate-500/10 dark:bg-slate-500/20',
        iconColor: 'text-slate-600 dark:text-slate-400',
        gradientBorder: 'hover:border-slate-500/50'
      }
    ];
  };

  const cards = getCardsForRole();

  return (
    <div className="space-y-6">
      
      {/* Compact Luxury Legal-Tech Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#091122] via-[#0C182F] to-[#070E1C] text-white py-8 sm:py-10 md:py-12 px-4 sm:px-8 shadow-2xl border border-white/[0.08] animate-slide-up">
        
        {/* Fine Architectural & Legal Line Background Overlay (Barely Visible, Ultra-Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#archGrid)" />
            <circle cx="50%" cy="50%" r="350" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50%" cy="50%" r="220" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Faint Ambient Soft Depth Gradients */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-slate-800/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 w-full mx-auto flex flex-col items-center text-center space-y-5">
          
          {/* Top Branding Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] backdrop-blur-md shadow-sm">
            <Sparkles size={13} className="text-sky-400 opacity-90" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-300">
              UNIFIED LEGAL SYSTEM PLATFORM
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold px-2 py-0.5 rounded-full uppercase ml-1">
              {role} PORTAL
            </span>
          </div>

          {/* Compact Premium Quotation Panel */}
          <div className="relative w-[90%] sm:w-[92%] md:w-[76%] max-w-[1050px] mx-auto py-7 px-6 sm:py-8 sm:px-10 md:py-9 md:px-12 rounded-2xl bg-[#0E1A30]/50 border border-white/[0.09] backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center transition-all duration-300">
            
            {/* Delicate Watermark Quotation Marks in Corners */}
            <span className="absolute top-3 left-5 text-3xl sm:text-4xl font-serif text-sky-200/10 select-none pointer-events-none font-bold leading-none">
              “
            </span>
            <span className="absolute bottom-3 right-5 text-3xl sm:text-4xl font-serif text-sky-200/10 select-none pointer-events-none font-bold leading-none">
              ”
            </span>

            {/* Quotation Main Focal Text */}
            <blockquote className="relative z-10 font-['Playfair_Display',serif] italic text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] text-slate-100 font-normal leading-[1.38] sm:leading-[1.42] text-center tracking-wide px-2 sm:px-4">
              “All of us do not have equal talent....
              <br className="hidden sm:inline" />
              {' '}But, all of us have an <span className="text-[#38bdf8] font-medium not-italic border-b border-[#38bdf8]/40 pb-0.5">equal opportunity</span>
              <br className="hidden sm:inline" />
              {' '}to develop our talent”
            </blockquote>

            {/* Understated Minimal Accent Line */}
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mt-5 opacity-60" />
          </div>

        </div>
      </div>

      {/* Portal Fields Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Compass size={20} className="text-primary dark:text-sky-400" />
            Portal Fields & Available Services
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any card below to immediately navigate to the corresponding portal section. Tailored for <strong className="text-primary dark:text-sky-400">{role}</strong> users.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
          {cards.length} Active Modules
        </div>
      </div>

      {/* Role-Based Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden ${card.gradientBorder}`}
            >
              {/* Card Top Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                    <CardIcon size={22} className="stroke-[2.2]" />
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeBg} ${card.badgeText} uppercase tracking-wider`}>
                    {card.tag}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400 transition-colors font-sans flex items-center justify-between">
                  <span>{card.title}</span>
                </h3>

                {/* Card Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Card Footer Redirection Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-primary dark:text-sky-400 group-hover:underline">
                <span>Access Module</span>
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-sky-400 dark:group-hover:text-slate-950 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default PortalOverview;
