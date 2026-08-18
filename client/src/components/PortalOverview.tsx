import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Scale, Calculator, Gavel, BookOpen, MessageSquare, 
  FileText, User, Settings, ShieldCheck, Landmark, CloudUpload, 
  Activity, ArrowRight, Sparkles, Shield, Compass
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
      
      {/* Main Theme Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-primary to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        
        {/* Abstract Glow Effect Backgrounds */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 backdrop-blur-md">
            <Sparkles size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Unified Legal System Platform
            </span>
            <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-0.5 rounded-full uppercase ml-1">
              {role} Portal
            </span>
          </div>

          {/* Main Theme Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight leading-tight text-white">
            Empowering Justice through Seamless Digital Legal Integration
          </h1>

          {/* Project Theme Description */}
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-3xl font-light">
            Welcome to the <strong className="text-secondary font-semibold">Unified Legal System</strong> — a comprehensive digital legal platform uniting <span className="underline decoration-secondary/50 underline-offset-4">Clients</span>, <span className="underline decoration-secondary/50 underline-offset-4">Advocates</span>, and <span className="underline decoration-secondary/50 underline-offset-4">Judicial Administrators</span>. Explore verified practitioner directories, manage active court cases, research landmark judgements & Bare Acts, calculate state court fees, and collaborate on legal documents securely in one place.
          </p>

          {/* Key Feature Badges */}
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-white/90">
            <span className="px-2.5 py-1 bg-white/10 rounded-md border border-white/10 flex items-center gap-1.5">
              <Shield size={12} className="text-secondary" /> End-to-End Encryption
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md border border-white/10 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-secondary" /> Verified Advocates
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md border border-white/10 flex items-center gap-1.5">
              <Landmark size={12} className="text-secondary" /> State Court Fee Engines
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md border border-white/10 flex items-center gap-1.5">
              <Gavel size={12} className="text-secondary" /> Judgements & Bare Acts
            </span>
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
