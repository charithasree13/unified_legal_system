import React from 'react';

interface ModuleVisualProps {
  id: string;
  className?: string;
}

export const ModuleCardVisual: React.FC<ModuleVisualProps> = ({ id, className = "w-10 h-10 sm:w-11 sm:h-11" }) => {
  // 1. ADVOCATE VERIFICATION EMBLEM (Matches Image 1 reference concept)
  if (id.includes('verify')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F4EEE0] dark:from-[#1E2420] dark:to-[#171916] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Outer Seal Circle */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#183C32" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#A67C3B" strokeWidth="1.5" strokeDasharray="3 1.5" />
          
          {/* Advocate Coat / Collar Bands Silhouette */}
          <path d="M 22 70 Q 50 90 78 70 L 70 42 Q 50 50 30 42 Z" fill="#183C32" stroke="#A67C3B" strokeWidth="1" />
          {/* White Shirt Collar */}
          <polygon points="40,42 50,60 60,42 50,47" fill="#FFFDF8" />
          {/* Advocate Bands */}
          <polygon points="46,47 42,76 48,76 48,47" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="0.75" />
          <polygon points="52,47 52,76 58,76 54,47" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="0.75" />
          
          {/* Scales on Left & Right */}
          <path d="M 28 55 L 38 55 M 33 55 L 33 63 M 28 63 L 38 63" stroke="#A67C3B" strokeWidth="1.2" fill="none" />
          <path d="M 62 55 L 72 55 M 67 55 L 67 63 M 62 63 L 72 63" stroke="#A67C3B" strokeWidth="1.2" fill="none" />
          
          {/* Stars */}
          <polygon points="20,50 22,54 26,54 23,57 24,61 20,58 16,61 17,57 14,54 18,54" fill="#A67C3B" />
          <polygon points="80,50 82,54 86,54 83,57 84,61 80,58 76,61 77,57 74,54 78,54" fill="#A67C3B" />
        </svg>
      </div>
    );
  }

  // 2. COURT FEE CALCULATOR (Matches Image 2 reference - Scales + Percentage %)
  if (id.includes('court') || id.includes('fee')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#E3ECE7] dark:from-[#1B2921] dark:to-[#121A15] border border-[#183C32]/35 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Beam & Pillar */}
          <rect x="47" y="12" width="6" height="52" fill="#183C32" rx="1.5" />
          <path d="M 22 22 L 78 22 M 50 12 L 50 22" stroke="#A67C3B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="12" r="4" fill="#A67C3B" />
          
          {/* Left Pan */}
          <line x1="22" y1="22" x2="14" y2="44" stroke="#183C32" strokeWidth="1.2" />
          <line x1="22" y1="22" x2="30" y2="44" stroke="#183C32" strokeWidth="1.2" />
          <path d="M 10 44 Q 22 54 34 44 Z" fill="#A67C3B" stroke="#183C32" strokeWidth="1" />
          
          {/* Right Pan */}
          <line x1="78" y1="22" x2="70" y2="44" stroke="#183C32" strokeWidth="1.2" />
          <line x1="78" y1="22" x2="86" y2="44" stroke="#183C32" strokeWidth="1.2" />
          <path d="M 66 44 Q 78 54 90 44 Z" fill="#A67C3B" stroke="#183C32" strokeWidth="1" />

          {/* Percentage % Coin Emblem Base (Direct Reference match) */}
          <circle cx="50" cy="74" r="18" fill="#183C32" stroke="#A67C3B" strokeWidth="2" />
          <text x="50" y="80" textAnchor="middle" className="text-[17px] font-extrabold fill-[#FFFDF8] font-sans">
            %
          </text>
        </svg>
      </div>
    );
  }

  // 3. HINDU SUCCESSION CALCULATOR (Matches Image 4 concept - Class 1 & 2 Heirs Tree)
  if (id.includes('hindu')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F5EEE0] dark:from-[#241E17] dark:to-[#1A1510] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Parchment Background Emblem */}
          <rect x="8" y="8" width="84" height="84" rx="8" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="1.5" />
          
          {/* Title Header Banner */}
          <rect x="14" y="14" width="72" height="15" rx="3" fill="#183C32" />
          <text x="50" y="25" textAnchor="middle" className="text-[6.5px] font-extrabold fill-[#F7F3EA] font-serif uppercase tracking-widest">
            CLASS 1 & 2 HEIRS
          </text>

          {/* Golden Tree Branches */}
          <path d="M 50 29 L 50 42 M 50 42 L 28 42 L 28 50 M 50 42 L 72 42 L 72 50" stroke="#A67C3B" strokeWidth="1.5" fill="none" />
          
          {/* Class 1 Branch Node */}
          <rect x="12" y="50" width="32" height="15" rx="3" fill="#A67C3B" stroke="#183C32" strokeWidth="0.75" />
          <text x="28" y="60" textAnchor="middle" className="text-[6px] font-bold fill-[#FFFDF8] font-sans">
            CLASS 1
          </text>

          {/* Class 2 Branch Node */}
          <rect x="56" y="50" width="32" height="15" rx="3" fill="#53634A" stroke="#183C32" strokeWidth="0.75" />
          <text x="72" y="60" textAnchor="middle" className="text-[6px] font-bold fill-[#FFFDF8] font-sans">
            CLASS 2
          </text>

          {/* Sub-branches */}
          <path d="M 28 65 L 28 72 M 18 72 L 38 72" stroke="#A67C3B" strokeWidth="1" fill="none" />
          <circle cx="18" cy="80" r="5.5" fill="#183C32" />
          <text x="18" y="82.5" textAnchor="middle" className="text-[5.5px] font-bold fill-[#F7F3EA]">Son</text>
          <circle cx="38" cy="80" r="5.5" fill="#183C32" />
          <text x="38" y="82.5" textAnchor="middle" className="text-[5.5px] font-bold fill-[#F7F3EA]">Dtr</text>

          <path d="M 72 65 L 72 72 M 62 72 L 82 72" stroke="#53634A" strokeWidth="1" fill="none" />
          <circle cx="62" cy="80" r="5.5" fill="#46382C" />
          <text x="62" y="82.5" textAnchor="middle" className="text-[5.5px] font-bold fill-[#F7F3EA]">Fthr</text>
          <circle cx="82" cy="80" r="5.5" fill="#46382C" />
          <text x="82" y="82.5" textAnchor="middle" className="text-[5.5px] font-bold fill-[#F7F3EA]">Bro</text>
        </svg>
      </div>
    );
  }

  // 4. ISLAMIC INHERITANCE CALCULATOR (Fara'id Shares)
  if (id.includes('islamic')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F2F7F4] to-[#E2ECE6] dark:from-[#16261E] dark:to-[#101D17] border border-[#71877B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Octagram Star / Islamic Pattern */}
          <g transform="translate(50, 50)">
            <rect x="-26" y="-26" width="52" height="52" fill="none" stroke="#71877B" strokeWidth="1.5" transform="rotate(0)" />
            <rect x="-26" y="-26" width="52" height="52" fill="none" stroke="#A67C3B" strokeWidth="1.5" transform="rotate(45)" />
            <circle cx="0" cy="0" r="30" fill="#183C32" stroke="#A67C3B" strokeWidth="1.5" />
            
            {/* Scales & Fractional Shares */}
            <text x="0" y="-5" textAnchor="middle" className="text-[8px] font-bold fill-[#F7F3EA] font-serif">
              FARA'ID
            </text>
            <text x="0" y="9" textAnchor="middle" className="text-[9.5px] font-extrabold fill-[#D8C49A] font-mono">
              1/2 • 1/4
            </text>
            <text x="0" y="19" textAnchor="middle" className="text-[6.5px] font-semibold fill-[#FFFDF8] font-sans">
              1/8 Share
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 5. DAILY LEGAL TIPS (Matches Image 5 concept - Wooden Gavel Block & Tip Card)
  if (id.includes('tip') || id.includes('daily')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F4EEE4] dark:from-[#282119] dark:to-[#1D1711] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Gavel Wooden Block Base */}
          <ellipse cx="50" cy="80" rx="38" ry="10" fill="#46382C" stroke="#A67C3B" strokeWidth="1.5" />
          <ellipse cx="50" cy="77" rx="34" ry="8" fill="#183C32" />
          
          {/* Legal Tip Card */}
          <rect x="14" y="12" width="72" height="54" rx="5" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="1.5" />
          <rect x="18" y="17" width="64" height="15" rx="3" fill="#A67C3B" />
          <text x="50" y="27.5" textAnchor="middle" className="text-[6px] font-extrabold fill-[#FFFDF8] font-serif uppercase tracking-wider">
            LEGAL TIP OF DAY
          </text>
          
          <text x="50" y="44" textAnchor="middle" className="text-[7.5px] font-bold fill-[#183C32] font-sans">
            Read Before Sign!
          </text>
          <text x="50" y="56" textAnchor="middle" className="text-[6px] fill-[#625F58] font-sans">
            Statutory Advice
          </text>
        </svg>
      </div>
    );
  }

  // 6. ADVOCATE DETAILS / DIRECTORY (Telephone + Open Law Book Concept)
  if (id.includes('directory')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#E1EBE5] dark:from-[#162B23] dark:to-[#0E1E18] border border-[#183C32]/35 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Open Directory Book */}
          <path d="M 12 75 Q 50 85 50 25 Q 50 85 88 75 L 85 22 Q 50 32 50 20 Q 50 32 15 22 Z" fill="#FFFDF8" stroke="#183C32" strokeWidth="1.5" />
          
          {/* Directory Book Lines */}
          <line x1="22" y1="36" x2="42" y2="40" stroke="#71877B" strokeWidth="1" strokeDasharray="2 1" />
          <line x1="22" y1="48" x2="42" y2="52" stroke="#71877B" strokeWidth="1" strokeDasharray="2 1" />
          <line x1="22" y1="60" x2="42" y2="64" stroke="#71877B" strokeWidth="1" strokeDasharray="2 1" />

          {/* Practitioner Profile Shield & Phone handset icon */}
          <circle cx="68" cy="48" r="14" fill="#183C32" stroke="#A67C3B" strokeWidth="1.5" />
          {/* Phone Handset */}
          <path d="M 63 43 C 63 40 67 40 68 43 L 69 46 C 70 47 69 48 67 49 C 70 52 72 54 75 56 C 76 54 77 53 79 54 L 81 55 C 84 56 84 60 81 60 C 72 60 63 51 63 43 Z" fill="#FFFDF8" />
        </svg>
      </div>
    );
  }

  // 7. JUDGEMENTS & BARE ACTS (Supreme Court / High Court Law Repository)
  if (id.includes('judgements') || id.includes('laws')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F2EAD8] dark:from-[#241E19] dark:to-[#15100B] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Supreme Court Pillars background */}
          <rect x="15" y="22" width="70" height="7" fill="#A67C3B" rx="1" />
          <polygon points="50,8 10,22 90,22" fill="#183C32" stroke="#A67C3B" strokeWidth="1" />
          
          <rect x="20" y="29" width="7" height="36" fill="#183C32" />
          <rect x="38" y="29" width="7" height="36" fill="#183C32" />
          <rect x="55" y="29" width="7" height="36" fill="#183C32" />
          <rect x="73" y="29" width="7" height="36" fill="#183C32" />

          {/* Bound Bare Act Volume */}
          <rect x="22" y="52" width="56" height="38" rx="3" fill="#46382C" stroke="#A67C3B" strokeWidth="1.5" />
          <rect x="28" y="58" width="44" height="24" rx="1.5" fill="#183C32" />
          <text x="50" y="73" textAnchor="middle" className="text-[6px] font-extrabold fill-[#FFFDF8] font-serif uppercase tracking-widest">
            BARE ACTS
          </text>
        </svg>
      </div>
    );
  }

  // 8. CASE DETAILS / PROJECTS (Litigation Briefcase & Active Case File)
  if (id.includes('projects') || id.includes('case')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F7F5] to-[#E3EBE6] dark:from-[#1C241E] dark:to-[#101712] border border-[#71877B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Leather Briefcase */}
          <rect x="18" y="32" width="64" height="48" rx="5" fill="#46382C" stroke="#A67C3B" strokeWidth="1.75" />
          {/* Handle */}
          <path d="M 40 32 L 40 22 Q 40 15 50 15 Q 60 15 60 22 L 60 32" fill="none" stroke="#A67C3B" strokeWidth="2" />
          
          {/* Case Folder sticking out */}
          <rect x="26" y="24" width="48" height="26" rx="3" fill="#FFFDF8" stroke="#183C32" strokeWidth="1" />
          <path d="M 26 32 L 74 32" stroke="#183C32" strokeWidth="0.75" />
          <text x="50" y="42" textAnchor="middle" className="text-[5.5px] font-extrabold fill-[#183C32] font-serif uppercase">
            CASE FILE #2026
          </text>

          {/* Gold Clasp Locks */}
          <rect x="30" y="52" width="7" height="10" rx="1.5" fill="#A67C3B" />
          <rect x="63" y="52" width="7" height="10" rx="1.5" fill="#A67C3B" />
        </svg>
      </div>
    );
  }

  // 9. CALCULATORS (Professional Valuation Console)
  if (id.includes('calculators')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F5EEE2] dark:from-[#25201A] dark:to-[#15120E] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Calculator Body */}
          <rect x="22" y="10" width="56" height="80" rx="7" fill="#183C32" stroke="#A67C3B" strokeWidth="1.75" />
          {/* Screen Display */}
          <rect x="28" y="18" width="44" height="18" rx="2.5" fill="#FFFDF8" stroke="#71877B" strokeWidth="1" />
          <text x="68" y="31" textAnchor="end" className="text-[9.5px] font-extrabold fill-[#183C32] font-mono">
            ₹ 45.8K
          </text>

          {/* Keypad Grid */}
          <g fill="#A67C3B" rx="1.5">
            <rect x="28" y="42" width="11" height="9" rx="1.5" />
            <rect x="44" y="42" width="11" height="9" rx="1.5" />
            <rect x="60" y="42" width="11" height="9" rx="1.5" fill="#D8C49A" />

            <rect x="28" y="54" width="11" height="9" rx="1.5" />
            <rect x="44" y="54" width="11" height="9" rx="1.5" />
            <rect x="60" y="54" width="11" height="9" rx="1.5" fill="#D8C49A" />

            <rect x="28" y="66" width="11" height="9" rx="1.5" />
            <rect x="44" y="66" width="11" height="9" rx="1.5" fill="#FFFDF8" />
            <rect x="60" y="66" width="11" height="9" rx="1.5" fill="#FFFDF8" />
          </g>
        </svg>
      </div>
    );
  }

  // 10. LAND AREA CONVERTER
  if (id.includes('land')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FDF8F6] to-[#F6E6DF] dark:from-[#2A1813] dark:to-[#150B08] border border-[#B85232]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Measured Land Plot Grid */}
          <polygon points="15,75 35,25 85,32 75,80" fill="#B85232" fillOpacity="0.15" stroke="#B85232" strokeWidth="1.75" strokeDasharray="3 1.5" />
          <line x1="15" y1="75" x2="85" y2="32" stroke="#B85232" strokeWidth="1" />
          
          {/* Compass Rose */}
          <circle cx="75" cy="25" r="11" fill="#FFFDF8" stroke="#B85232" strokeWidth="1.25" />
          <polygon points="75,16 77.5,25 75,23.5 72.5,25" fill="#B85232" />
          <text x="75" y="14" textAnchor="middle" className="text-[6px] font-bold fill-[#B85232]">N</text>

          <text x="48" y="58" textAnchor="middle" className="text-[8px] font-extrabold fill-[#B85232] font-mono">
            43,560 SQ FT
          </text>
          <text x="48" y="68" textAnchor="middle" className="text-[6px] font-bold fill-[#46382C] font-sans">
            (1 ACRE)
          </text>
        </svg>
      </div>
    );
  }

  // 11. INTEREST CALCULATOR
  if (id.includes('interest')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F6F8F4] to-[#E5EBE0] dark:from-[#1C2615] dark:to-[#0E150A] border border-[#52633C]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Interest Growth Arc Chart */}
          <path d="M 15 75 Q 45 68 85 20" fill="none" stroke="#52633C" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="85,20 76,23 81,30" fill="#52633C" />
          
          {/* Percentage & Award Decree */}
          <rect x="22" y="32" width="48" height="34" rx="4" fill="#183C32" stroke="#52633C" strokeWidth="1.5" />
          <text x="46" y="48" textAnchor="middle" className="text-[9.5px] font-extrabold fill-[#FFFDF8] font-mono">
            6% p.a.
          </text>
          <text x="46" y="60" textAnchor="middle" className="text-[6px] font-bold fill-[#D8C49A] uppercase">
            Decree Award
          </text>
        </svg>
      </div>
    );
  }

  // 12. DATE DIFFERENCE CALCULATOR
  if (id.includes('date')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#EFEBE4] dark:from-[#231E1A] dark:to-[#120F0D] border border-[#61564C]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Calendar Sheet */}
          <rect x="20" y="15" width="60" height="70" rx="5" fill="#FFFDF8" stroke="#61564C" strokeWidth="1.5" />
          <rect x="20" y="15" width="60" height="18" rx="4" fill="#46382C" />
          <text x="50" y="28" textAnchor="middle" className="text-[7.5px] font-bold fill-[#FFFDF8] font-sans uppercase tracking-wider">
            DAYS CALC
          </text>
          
          {/* Calendar Binder Rings */}
          <circle cx="32" cy="15" r="2.5" fill="#A67C3B" />
          <circle cx="68" cy="15" r="2.5" fill="#A67C3B" />

          <text x="50" y="55" textAnchor="middle" className="text-[12px] font-extrabold fill-[#183C32] font-mono">
            +180
          </text>
          <text x="50" y="68" textAnchor="middle" className="text-[6.5px] font-bold fill-[#625F58] font-sans">
            DAYS DIFF
          </text>
        </svg>
      </div>
    );
  }

  // 13. LIMITATION ACT CALCULATOR
  if (id.includes('limitation')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#E2EBE5] dark:from-[#1E2522] dark:to-[#101513] border border-[#71877B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Clock Dial & Statute Book */}
          <circle cx="50" cy="45" r="30" fill="#183C32" stroke="#A67C3B" strokeWidth="2" />
          <path d="M 50 45 L 50 26 M 50 45 L 64 45" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" />
          
          <rect x="18" y="68" width="64" height="16" rx="3" fill="#A67C3B" />
          <text x="50" y="79" textAnchor="middle" className="text-[6.5px] font-extrabold fill-[#FFFDF8] font-serif uppercase tracking-wider">
            LIMITATION ACT
          </text>
        </svg>
      </div>
    );
  }

  // 14. LEGAL DICTIONARY
  if (id.includes('dictionary')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#DEE8E2] dark:from-[#18261E] dark:to-[#0D1812] border border-[#183C32]/35 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Open Thick Dictionary Volume */}
          <path d="M 12 24 Q 50 32 50 16 Q 50 32 88 24 L 88 80 Q 50 88 50 78 Q 50 88 12 80 Z" fill="#FFFDF8" stroke="#183C32" strokeWidth="1.75" />
          <path d="M 50 16 L 50 78" stroke="#183C32" strokeWidth="1.5" />
          
          <text x="31" y="44" textAnchor="middle" className="text-[9px] font-serif font-extrabold fill-[#183C32]">
            A - Z
          </text>
          <text x="31" y="56" textAnchor="middle" className="text-[6px] font-sans fill-[#625F58]">
            Maxims
          </text>

          <text x="69" y="44" textAnchor="middle" className="text-[8px] font-serif font-bold fill-[#A67C3B]">
            LEXICON
          </text>
          <text x="69" y="56" textAnchor="middle" className="text-[6px] font-sans fill-[#625F58]">
            Glossary
          </text>
        </svg>
      </div>
    );
  }

  // 15. SECTION MAPPING (Old Acts -> New Acts Converter)
  if (id.includes('section') || id.includes('mapping')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#F3EBDA] dark:from-[#262017] dark:to-[#15110B] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Old Act Box */}
          <rect x="10" y="32" width="36" height="36" rx="4" fill="#46382C" stroke="#A67C3B" strokeWidth="1.25" />
          <text x="28" y="50" textAnchor="middle" className="text-[7.5px] font-bold fill-[#FFFDF8] font-sans">
            IPC
          </text>
          <text x="28" y="60" textAnchor="middle" className="text-[5.5px] fill-[#D8C49A]">
            Old Act
          </text>

          {/* Transfer Arrows */}
          <path d="M 48 50 L 52 50 M 50 46 L 54 50 L 50 54" stroke="#A67C3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* New Act Box */}
          <rect x="54" y="32" width="36" height="36" rx="4" fill="#183C32" stroke="#A67C3B" strokeWidth="1.25" />
          <text x="72" y="50" textAnchor="middle" className="text-[7.5px] font-bold fill-[#FFFDF8] font-sans">
            BNS
          </text>
          <text x="72" y="60" textAnchor="middle" className="text-[5.5px] fill-[#D8C49A]">
            New Act
          </text>
        </svg>
      </div>
    );
  }

  // 16. SECURE CHAT MESSENGER
  if (id.includes('chat')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#DFEBE5] dark:from-[#162720] dark:to-[#0C1713] border border-[#183C32]/35 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Encrypted Shield */}
          <path d="M 50 12 L 80 22 C 80 55 50 78 50 78 C 50 78 20 55 20 22 Z" fill="#183C32" stroke="#A67C3B" strokeWidth="1.75" />
          
          {/* Chat Bubbles */}
          <rect x="32" y="30" width="28" height="16" rx="4" fill="#FFFDF8" />
          <rect x="42" y="50" width="28" height="16" rx="4" fill="#A67C3B" />
        </svg>
      </div>
    );
  }

  // 17. MY NOTES
  if (id.includes('notes')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#F0EAE1] dark:from-[#26201A] dark:to-[#14100C] border border-[#A67C3B]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Leather Journal */}
          <rect x="25" y="15" width="50" height="70" rx="4" fill="#46382C" stroke="#A67C3B" strokeWidth="1.75" />
          <line x1="34" y1="15" x2="34" y2="85" stroke="#A67C3B" strokeWidth="1.25" strokeDasharray="2 2" />
          
          {/* Bookmark Ribbon */}
          <path d="M 58 15 L 58 50 L 63 45 L 68 50 L 68 15 Z" fill="#A67C3B" />
        </svg>
      </div>
    );
  }

  // 18. DEFAULT FALLBACK MODULE VISUAL
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F8F5] to-[#E2EBE5] dark:from-[#1E2420] dark:to-[#121614] border border-[#A67C3B]/35 flex items-center justify-center p-1 shadow-sm flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
        <circle cx="50" cy="50" r="30" fill="#183C32" stroke="#A67C3B" strokeWidth="1.75" />
        <path d="M 38 50 L 62 50 M 50 38 L 50 62" stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default ModuleCardVisual;
