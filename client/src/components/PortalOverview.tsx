import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Scale, Calculator, Gavel, BookOpen, MessageSquare, 
  FileText, User, Settings, ShieldCheck, Landmark, CloudUpload, 
  Activity, ArrowRight, Sparkles, Shield, Compass, Quote, StickyNote,
  CheckCircle, Clock, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ModuleCardVisual } from './ModuleCardVisuals';

export interface PortalOverviewStats {
  totalAdvocates?: number;
  activeUsers?: number;
  pendingVerification?: number;
  uploadedJudgements?: number;
  uploadedLaws?: number;
  collaborationActivities?: number;
}

interface PortalOverviewProps {
  stats?: PortalOverviewStats;
  loadingStats?: boolean;
}

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
}

export const PortalOverview: React.FC<PortalOverviewProps> = ({ stats, loadingStats }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'Client';

  const displayStats = {
    totalAdvocates: stats?.totalAdvocates ?? 3,
    activeUsers: stats?.activeUsers ?? 6,
    pendingVerification: stats?.pendingVerification ?? 1,
    uploadedJudgements: stats?.uploadedJudgements ?? 0,
    uploadedLaws: stats?.uploadedLaws ?? 30,
    collaborationActivities: stats?.collaborationActivities ?? 0,
  };

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

  // Define role-specific cards with mature non-AI styling
  const forestBadge = {
    badgeBg: 'bg-[#183C32]/10 dark:bg-[#6F9A83]/15 border-[#183C32]/20 dark:border-[#6F9A83]/30',
    badgeText: 'text-[#183C32] dark:text-[#8FAF9C]',
    iconBg: 'bg-[#183C32]/10 dark:bg-[#6F9A83]/20',
    iconColor: 'text-[#183C32] dark:text-[#8FAF9C]'
  };

  const bronzeBadge = {
    badgeBg: 'bg-[#A67C3B]/10 dark:bg-[#C7A45A]/15 border-[#A67C3B]/20 dark:border-[#C7A45A]/30',
    badgeText: 'text-[#A67C3B] dark:text-[#D8C49A]',
    iconBg: 'bg-[#A67C3B]/10 dark:bg-[#C7A45A]/20',
    iconColor: 'text-[#A67C3B] dark:text-[#D8C49A]'
  };

  const sageBadge = {
    badgeBg: 'bg-[#71877B]/10 dark:bg-[#71877B]/20 border-[#71877B]/20 dark:border-[#71877B]/30',
    badgeText: 'text-[#5E7468] dark:text-[#AFC9B7]',
    iconBg: 'bg-[#71877B]/10 dark:bg-[#71877B]/20',
    iconColor: 'text-[#183C32] dark:text-[#AFC9B7]'
  };

  const brownBadge = {
    badgeBg: 'bg-[#6A5948]/10 dark:bg-[#6A5948]/20 border-[#6A5948]/20 dark:border-[#6A5948]/30',
    badgeText: 'text-[#6A5948] dark:text-[#D8C49A]',
    iconBg: 'bg-[#6A5948]/10 dark:bg-[#6A5948]/20',
    iconColor: 'text-[#6A5948] dark:text-[#D8C49A]'
  };

  const oliveBadge = {
    badgeBg: 'bg-[#53634A]/10 dark:bg-[#53634A]/20 border-[#53634A]/20 dark:border-[#53634A]/30',
    badgeText: 'text-[#53634A] dark:text-[#8FAF9C]',
    iconBg: 'bg-[#53634A]/10 dark:bg-[#53634A]/20',
    iconColor: 'text-[#53634A] dark:text-[#8FAF9C]'
  };

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
          ...bronzeBadge
        },
        {
          id: 'directory',
          title: 'Advocate Details',
          description: 'Access the complete advocate directory database, manage verified badges and practitioner profiles.',
          tag: 'Directory Hub',
          icon: Users,
          path: '/directory',
          ...forestBadge
        },
        {
          id: 'judgements',
          title: 'Judgements & Bare Acts',
          description: 'Browse, search, and audit all indexed landmark judgements, case laws, central & state acts.',
          tag: 'Legal Library',
          icon: Gavel,
          path: '/judgements',
          ...brownBadge
        },
        {
          id: 'projects',
          title: 'Case Details',
          description: 'Overview of platform-wide litigation projects, active client-advocate mappings, and task progress.',
          tag: 'System Cases',
          icon: Scale,
          path: '/projects',
          ...sageBadge
        },
        {
          id: 'calculators',
          title: 'Calculators',
          description: 'Audit and test state court fee calculators, ad-valorem suit formulas, and land conversion utilities.',
          tag: 'Utility Engine',
          icon: Calculator,
          path: '/calculators',
          ...bronzeBadge
        },
        {
          id: 'interest-calculator',
          title: 'Interest Calculator',
          description: 'Computes simple and compound interest calculations on litigation awards and financial claims.',
          tag: 'LEGAL UTILITY',
          icon: Calculator,
          path: '/interest-calculator',
          ...oliveBadge
        },
        {
          id: 'date-difference-calculator',
          title: 'Date Difference Calculator',
          description: 'Calculate the exact number of days between two dates quickly and accurately.',
          tag: 'DATE UTILITY',
          icon: Calendar,
          path: '/date-difference-calculator',
          ...brownBadge
        },
        {
          id: 'hindu-succession',
          title: 'Hindu Succession Calculator',
          description: 'Determine statutory legal shares, coparcenary notional partitions, Class I/II intestate shares, and Section 15 female succession.',
          tag: 'Personal Law Engine',
          icon: Scale,
          path: '/hindu-succession-calculator',
          ...bronzeBadge
        },
        {
          id: 'islamic-inheritance',
          title: 'Islamic Inheritance Calculator',
          description: 'Calculate indicative Islamic inheritance shares based on the selected succession framework and surviving heirs.',
          tag: 'Fara\'id Personal Law',
          icon: Scale,
          path: '/islamic-inheritance-calculator',
          ...forestBadge
        },
        {
          id: 'limitation-calculator',
          title: 'Limitation Act Calculator',
          description: 'Calculate indicative limitation periods, statutory filing deadlines, and excludable time under the Limitation Act, 1963.',
          tag: 'Statutory Limitation',
          icon: Scale,
          path: '/limitation-calculator',
          ...sageBadge
        },
        {
          id: 'section-mapping',
          title: 'Old Acts → New Acts Converter',
          description: 'Convert and cross-reference provisions from the Indian Penal Code, Code of Criminal Procedure and Indian Evidence Act with the corresponding provisions under BNS, BNSS and BSA.',
          tag: 'LEGAL CONVERSION',
          icon: Compass,
          path: '/section-mapping',
          ...bronzeBadge
        },
        {
          id: 'chat',
          title: 'Secure Chat Hub',
          description: 'Inspect active messaging channels, system communications, and user support conversations.',
          tag: 'Communications',
          icon: MessageSquare,
          path: '/chat',
          ...forestBadge
        },
        {
          id: 'my-notes',
          title: 'My Notes',
          description: 'Access your private legal notes, work-related reminders, and confidential case summaries.',
          tag: 'Private Workspace',
          icon: StickyNote,
          path: '/my-notes',
          ...brownBadge
        },
        {
          id: 'legal-dictionary',
          title: 'Legal Dictionary',
          description: 'Browse legal terms, definitions by category, and manage legal dictionary entries.',
          tag: 'Legal Reference',
          icon: BookOpen,
          path: '/legal-dictionary',
          ...forestBadge
        }
      ];
    }

    if (role === 'Advocate') {
      return [
        {
          id: 'legal-dictionary',
          title: 'Legal Dictionary',
          description: 'Browse comprehensive legal terms, Latin maxims, Islamic terms, and statutory glossaries.',
          tag: 'Legal Reference',
          icon: BookOpen,
          path: '/legal-dictionary',
          ...forestBadge
        },
        {
          id: 'projects',
          title: 'Case Details',
          description: 'Manage active cases, client assignments, hearing calendars, task milestones, and litigation notes.',
          tag: 'Active Practice',
          icon: Scale,
          path: '/projects',
          ...bronzeBadge
        },
        {
          id: 'directory',
          title: 'Advocate Details',
          description: 'Network with legal peers, view public practitioner profiles, and manage your directory listing.',
          tag: 'Public Directory',
          icon: Users,
          path: '/directory',
          ...forestBadge
        },
        {
          id: 'judgements',
          title: 'Judgements & Bare Acts',
          description: 'Search Supreme Court & High Court landmark judgements, precedent rulings, and case transcripts.',
          tag: 'Case Law Research',
          icon: Gavel,
          path: '/judgements',
          ...brownBadge
        },
        {
          id: 'laws',
          title: 'Laws & Bare Acts',
          description: 'Access comprehensive central & state Bare Acts, statutory sections, amendments, and legal rules.',
          tag: 'Statutory Library',
          icon: BookOpen,
          path: '/laws',
          ...forestBadge
        },
        ...((user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED') ? [{
          id: 'section-mapping',
          title: 'Old Acts → New Acts Converter',
          description: 'Convert and cross-reference provisions from the Indian Penal Code, Code of Criminal Procedure and Indian Evidence Act with the corresponding provisions under BNS, BNSS and BSA.',
          tag: 'LEGAL CONVERSION',
          icon: Compass,
          path: '/section-mapping',
          ...bronzeBadge
        }] : []),
        {
          id: 'calculators',
          title: 'Calculators',
          description: 'Compute state court fees, ad-valorem suit values, probate fees, stamp duty, and land area conversions.',
          tag: 'Valuation Tools',
          icon: Calculator,
          path: '/calculators',
          ...bronzeBadge
        },
        {
          id: 'interest-calculator',
          title: 'Interest Calculator',
          description: 'Computes simple and compound interest calculations on litigation awards and financial claims.',
          tag: 'LEGAL UTILITY',
          icon: Calculator,
          path: '/interest-calculator',
          ...oliveBadge
        },
        {
          id: 'date-difference-calculator',
          title: 'Date Difference Calculator',
          description: 'Calculate the exact number of days between two dates quickly and accurately.',
          tag: 'DATE UTILITY',
          icon: Calendar,
          path: '/date-difference-calculator',
          ...brownBadge
        },
        {
          id: 'hindu-succession',
          title: 'Hindu Succession Calculator',
          description: 'Determine statutory legal shares, coparcenary notional partitions, Class I/II intestate shares, and Section 15 female succession.',
          tag: 'Personal Law Engine',
          icon: Scale,
          path: '/hindu-succession-calculator',
          ...bronzeBadge
        },
        {
          id: 'islamic-inheritance',
          title: 'Islamic Inheritance Calculator',
          description: 'Calculate indicative Islamic inheritance shares based on the selected succession framework and surviving heirs.',
          tag: 'Fara\'id Personal Law',
          icon: Scale,
          path: '/islamic-inheritance-calculator',
          ...forestBadge
        },
        {
          id: 'limitation-calculator',
          title: 'Limitation Act Calculator',
          description: 'Calculate indicative limitation periods, statutory filing deadlines, and excludable time under the Limitation Act, 1963.',
          tag: 'Statutory Limitation',
          icon: Scale,
          path: '/limitation-calculator',
          ...sageBadge
        },
        {
          id: 'chat',
          title: 'Client Secure Chat',
          description: 'Communicate with clients in real-time with document sharing, case status updates, and encrypted logs.',
          tag: 'Client Messenger',
          icon: MessageSquare,
          path: '/chat',
          ...forestBadge
        },
        {
          id: 'collaboration',
          title: 'Doc Collaboration Workspace',
          description: 'Collaborative legal drafting, contract review, versioning, annotation, and shared document workspaces.',
          tag: 'Legal Drafting',
          icon: FileText,
          path: '/collaboration',
          ...brownBadge
        },
        {
          id: 'profile',
          title: 'Advocate Profile & Credentials',
          description: 'Manage your Bar Council enrollment number, practice areas, court practice locations, and bio.',
          tag: 'Professional Profile',
          icon: User,
          path: '/profile',
          ...sageBadge
        },
        {
          id: 'my-notes',
          title: 'My Notes',
          description: 'Access your private legal notes, client meeting summaries, hearing points, and confidential work notes.',
          tag: 'Private Workspace',
          icon: StickyNote,
          path: '/my-notes',
          ...brownBadge
        }
      ];
    }

    // Default for Client or User role
    return [
      {
        id: 'directory',
        title: 'Advocate Details',
        description: 'Search & connect with verified legal advocates across specializations, cities, High Courts, and District Courts.',
        tag: 'Find Legal Experts',
        icon: Users,
        path: '/directory',
        ...forestBadge
      },
      {
        id: 'projects',
        title: 'Case Details',
        description: 'Track your active court cases, next hearing dates, lawyer notes, case progress, and task updates.',
        tag: 'My Litigation Files',
        icon: Scale,
        path: '/projects',
        ...bronzeBadge
      },
      {
        id: 'calculators',
        title: 'Calculators',
        description: 'Calculate state court fees, stamp duty, ad-valorem suit valuation, and land measurement conversions.',
        tag: 'Legal Calculators',
        icon: Calculator,
        path: '/calculators',
        ...bronzeBadge
      },
      {
        id: 'interest-calculator',
        title: 'Interest Calculator',
        description: 'Computes simple and compound interest calculations on litigation awards and financial claims.',
        tag: 'LEGAL UTILITY',
        icon: Calculator,
        path: '/interest-calculator',
        ...oliveBadge
      },
      {
        id: 'date-difference-calculator',
        title: 'Date Difference Calculator',
        description: 'Calculate the exact number of days between two dates quickly and accurately.',
        tag: 'DATE UTILITY',
        icon: Calendar,
        path: '/date-difference-calculator',
        ...brownBadge
      },
      {
        id: 'chat',
        title: 'Secure Advocate Chat',
        description: 'Direct real-time encrypted messaging with your assigned advocates and legal consultants.',
        tag: 'Encrypted Chat',
        icon: MessageSquare,
        path: '/chat',
        ...forestBadge
      },
      {
        id: 'collaboration',
        title: 'Doc Collaboration Workspace',
        description: 'Review, annotate, and manage shared legal drafts, contracts, affidavits, and case petitions.',
        tag: 'Shared Drafts',
        icon: FileText,
        path: '/collaboration',
        ...brownBadge
      },
      {
        id: 'profile',
        title: 'My Profile & Account',
        description: 'View and update your personal details, contact info, phone number, and account credentials.',
        tag: 'Personal Profile',
        icon: User,
        path: '/profile',
        ...sageBadge
      },
      {
        id: 'settings',
        title: 'Platform Settings',
        description: 'Configure account security, toggle dark/light theme options, and notification preferences.',
        tag: 'Settings & Security',
        icon: Settings,
        path: '/settings',
        ...brownBadge
      }
    ];
  };

  const cards = getCardsForRole();

  return (
    <div className="space-y-6">
      
      {/* Ultra-Compact Premium Legal-Tech Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1E2420] dark:bg-[#151815] text-[#F7F3EA] py-6 px-4 sm:px-8 shadow-md border border-[#A67C3B]/25">
        
        {/* Subtle watermark / pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#archGrid)" />
          </svg>
        </div>

        <div className="relative z-10 w-full mx-auto flex flex-col items-center text-center space-y-4">
          
          {/* Official Logo & Portal Title Badge — Primary Branding Focus */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 bg-[#171916]/70 py-4 px-6 sm:px-8 rounded-2xl border border-[#A67C3B]/35 backdrop-blur-md shadow-lg w-full max-w-[850px]">
            <div className="relative flex-shrink-0">
              <img 
                src="/logo.jpg" 
                alt="Elite Legal Desk Logo" 
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-full border-2 border-[#A67C3B] shadow-xl bg-[#FFFDF8]" 
              />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-serif text-[#F7F3EA] tracking-wide leading-tight">
                ELITE LEGAL DESK
              </h1>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A67C3B]/20 text-[#D8C49A] border border-[#A67C3B]/35 shadow-xs">
                  <Sparkles size={12} className="text-[#C7A45A]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {role} PORTAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Quotation Panel — Reduced Prominence */}
          <div className="relative w-full max-w-[850px] mx-auto py-2.5 px-4 sm:py-3 sm:px-6 rounded-xl bg-[#171916]/50 border border-[#A67C3B]/15 backdrop-blur-sm shadow-xs flex flex-col items-center justify-center">
            
            {/* Subtle Watermark Quotes */}
            <span className="absolute top-1 left-3 text-lg font-serif text-[#D8C49A]/15 select-none pointer-events-none font-bold leading-none">
              “
            </span>
            <span className="absolute bottom-1 right-3 text-lg font-serif text-[#D8C49A]/15 select-none pointer-events-none font-bold leading-none">
              ”
            </span>

            {/* Quotation Text */}
            <blockquote className="relative z-10 font-serif italic text-sm sm:text-base md:text-lg text-[#F7F3EA]/90 font-normal leading-snug text-center tracking-wide px-2">
              “All of us do not have equal talent.... But, all of us have an <span className="text-[#C7A45A] font-medium not-italic border-b border-[#C7A45A]/40 pb-0.5">equal opportunity</span> to develop our talent”
              <span className="font-sans not-italic text-xs sm:text-sm text-[#D8C49A]/90 font-medium ml-2 inline-block">
                ... Dr. A. P. J. Abdul Kalam
              </span>
            </blockquote>
          </div>

        </div>
      </div>

      {/* KPI Stats Cards - Positioned BEFORE Modules (Admin Only) */}
      {role === 'Admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'ADVOCATES', val: displayStats.totalAdvocates, icon: Users, color: 'text-[#183C32] dark:text-[#8FAF9C]' },
            { label: 'ACTIVE USERS', val: displayStats.activeUsers, icon: CheckCircle, color: 'text-[#3F6B50] dark:text-[#6F9A83]' },
            { label: 'PENDING VERIFY', val: displayStats.pendingVerification, icon: Clock, color: 'text-[#A67C3B] dark:text-[#C7A45A]' },
            { label: 'JUDGEMENTS', val: displayStats.uploadedJudgements, icon: FileText, color: 'text-[#6A5948] dark:text-[#D8C49A]' },
            { label: 'ACTS/LAWS', val: displayStats.uploadedLaws, icon: BookOpen, color: 'text-[#183C32] dark:text-[#6F9A83]' }
          ].map((c, i) => (
            <div key={i} className="legal-card p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-dark-text-muted font-sans">
                  {c.label}
                </span>
                <c.icon size={18} className={c.color} />
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#242522] dark:text-[#F4F0E7] mt-1">
                {loadingStats ? '...' : (c.val ?? 0)}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Portal Fields Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-b border-border dark:border-dark-border pb-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-2 font-serif">
            <Compass size={20} className="text-[#183C32] dark:text-[#6F9A83]" />
            Portal Fields & Available Services
          </h2>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
            Select any card below to immediately navigate to the corresponding portal section. Tailored for <strong className="text-[#183C32] dark:text-[#C7A45A]">{role}</strong> users.
          </p>
        </div>

        <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted bg-surface-secondary dark:bg-dark-surface-secondary px-3 py-1 rounded-full border border-border dark:border-dark-border self-start sm:self-auto">
          {cards.length} Active Modules
        </div>
      </div>

      {/* Role-Based Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const CardIcon = card.icon;
          const cardClass = card.id.includes('land') ? 'card-land' :
            card.id.includes('interest') ? 'card-interest' :
            card.id.includes('date') ? 'card-date' :
            card.id.includes('directory') ? 'card-directory' :
            card.id.includes('services') ? 'card-services' :
            (card.id.includes('laws') || card.id.includes('judgements') || card.id.includes('section')) ? 'card-laws' :
            (card.id.includes('fee') || card.id.includes('calculator') || card.id.includes('hindu') || card.id.includes('islamic') || card.id.includes('limitation')) ? 'card-court-fee' :
            card.id.includes('dictionary') ? 'card-dictionary' :
            (card.id.includes('projects') || card.id.includes('case') || card.id.includes('verify')) ? 'card-case' :
            'card-documents';

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`${cardClass} p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden group`}
            >
              {/* Card Top Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-105`}>
                    <CardIcon size={20} className="stroke-[2]" />
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeBg} ${card.badgeText} uppercase tracking-wider`}>
                    {card.tag}
                  </span>
                </div>

                {/* Module Visual Header Artwork (Matches User Reference Images) */}
                <div className="mb-3.5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <ModuleCardVisual id={card.id} className="h-28 w-full" />
                </div>

                {/* Card Title */}
                <h3 className="font-bold text-base text-text-primary dark:text-dark-text-primary group-hover:text-[#183C32] dark:group-hover:text-[#C7A45A] transition-colors font-serif flex items-center justify-between">
                  <span>{card.title}</span>
                </h3>

                {/* Card Description */}
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Card Footer Redirection Action */}
              <div className="mt-5 pt-3 border-t border-border/60 dark:border-dark-border/60 flex items-center justify-between text-xs font-semibold text-[#183C32] dark:text-[#6F9A83] group-hover:text-[#A67C3B] dark:group-hover:text-[#C7A45A]">
                <span>Access Module</span>
                <div className="h-7 w-7 rounded-full bg-surface-secondary dark:bg-dark-surface-secondary group-hover:bg-[#183C32] group-hover:text-white dark:group-hover:bg-[#C7A45A] dark:group-hover:text-[#171916] flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
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
