import React from 'react';

interface ModuleVisualProps {
  id: string;
  className?: string;
}

export const ModuleCardVisual: React.FC<ModuleVisualProps> = ({ id, className = "h-28 w-full" }) => {
  // 1. ADVOCATE VERIFICATION EMBLEM (Matches Image 1 reference)
  if (id.includes('verify')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E2420] via-[#171916] to-[#252C27] border border-[#A67C3B]/30 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#A67C3B_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
        <svg viewBox="0 0 200 200" className="h-full max-h-24 w-auto drop-shadow-md">
          {/* Outer Seal Circle */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="#D8C49A" strokeWidth="4" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="#A67C3B" strokeWidth="2" strokeDasharray="4 2" />
          
          {/* Advocate Coat / Collar Bands Silhouette */}
          <path d="M 45 140 Q 100 180 155 140 L 140 85 Q 100 100 60 85 Z" fill="#151815" stroke="#A67C3B" strokeWidth="2" />
          {/* White Shirt Collar */}
          <polygon points="80,85 100,120 120,85 100,95" fill="#F7F3EA" />
          {/* Advocate Bands */}
          <polygon points="92,95 85,150 97,150 96,95" fill="#FFFDF8" stroke="#D8C49A" strokeWidth="1" />
          <polygon points="104,95 103,150 115,150 108,95" fill="#FFFDF8" stroke="#D8C49A" strokeWidth="1" />
          
          {/* Scales on Left & Right */}
          <path d="M 55 110 L 75 110 M 65 110 L 65 125 M 55 125 L 75 125" stroke="#C7A45A" strokeWidth="2" fill="none" />
          <path d="M 125 110 L 145 110 M 135 110 L 135 125 M 125 125 L 145 125" stroke="#C7A45A" strokeWidth="2" fill="none" />
          
          {/* Stars */}
          <polygon points="40,100 43,107 50,107 45,112 47,119 40,114 33,119 35,112 30,107 37,107" fill="#C7A45A" />
          <polygon points="160,100 163,107 170,107 165,112 167,119 160,114 153,119 155,112 150,107 157,107" fill="#C7A45A" />

          {/* Text Arc */}
          <path id="textArcTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
          <text className="text-[14px] font-bold fill-[#F7F3EA] tracking-widest font-sans uppercase">
            <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
              ADVOCATE VERIFICATION
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  // 2. COURT FEE CALCULATOR (Matches Image 2 reference - Scales + Percentage %)
  if (id.includes('court') || id.includes('fee')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B2921] to-[#121A15] border border-[#A67C3B]/30 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 160" className="h-full max-h-24 w-auto drop-shadow-md">
          {/* Beam & Pillar */}
          <rect x="96" y="20" width="8" height="85" fill="#A67C3B" rx="2" />
          <path d="M 50 35 L 150 35 M 100 20 L 100 35" stroke="#D8C49A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="20" r="6" fill="#C7A45A" />
          
          {/* Left Pan */}
          <line x1="50" y1="35" x2="35" y2="70" stroke="#D8C49A" strokeWidth="2" />
          <line x1="50" y1="35" x2="65" y2="70" stroke="#D8C49A" strokeWidth="2" />
          <path d="M 30 70 Q 50 85 70 70 Z" fill="#C7A45A" stroke="#F7F3EA" strokeWidth="1.5" />
          
          {/* Right Pan */}
          <line x1="150" y1="35" x2="135" y2="70" stroke="#D8C49A" strokeWidth="2" />
          <line x1="150" y1="35" x2="165" y2="70" stroke="#D8C49A" strokeWidth="2" />
          <path d="M 130 70 Q 150 85 170 70 Z" fill="#C7A45A" stroke="#F7F3EA" strokeWidth="1.5" />

          {/* Percentage % Coin Emblem Base (Direct Reference match) */}
          <circle cx="100" cy="120" r="28" fill="#183C32" stroke="#C7A45A" strokeWidth="3" />
          <text x="100" y="128" textAnchor="middle" className="text-[26px] font-extrabold fill-[#F7F3EA] font-sans">
            %
          </text>
        </svg>
      </div>
    );
  }

  // 3. HINDU SUCCESSION CALCULATOR (Matches Image 4 concept - Class 1 & 2 Heirs Tree)
  if (id.includes('hindu')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#241E17] via-[#1A1510] to-[#2E241B] border border-[#A67C3B]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 240 150" className="h-full max-h-24 w-auto">
          {/* Parchment Background Card */}
          <rect x="10" y="10" width="220" height="130" rx="8" fill="#FAF6EE" stroke="#A67C3B" strokeWidth="2" />
          
          {/* Title Header Banner */}
          <rect x="30" y="18" width="180" height="22" rx="4" fill="#183C32" />
          <text x="120" y="33" textAnchor="middle" className="text-[10px] font-bold fill-[#F7F3EA] font-serif uppercase tracking-wider">
            CLASS 1 & CLASS 2 HEIRS
          </text>

          {/* Golden Tree Branches */}
          <path d="M 120 40 L 120 60 M 120 60 L 65 60 L 65 75 M 120 60 L 175 60 L 175 75" stroke="#A67C3B" strokeWidth="2.5" fill="none" />
          
          {/* Class 1 Branch Node */}
          <rect x="25" y="75" width="80" height="24" rx="4" fill="#A67C3B" stroke="#183C32" strokeWidth="1" />
          <text x="65" y="90" textAnchor="middle" className="text-[9px] font-bold fill-[#FFFDF8] font-sans">
            CLASS 1 HEIRS
          </text>

          {/* Class 2 Branch Node */}
          <rect x="135" y="75" width="80" height="24" rx="4" fill="#53634A" stroke="#183C32" strokeWidth="1" />
          <text x="175" y="90" textAnchor="middle" className="text-[9px] font-bold fill-[#FFFDF8] font-sans">
            CLASS 2 HEIRS
          </text>

          {/* Sub-branches */}
          <path d="M 65 99 L 65 110 M 35 110 L 95 110" stroke="#A67C3B" strokeWidth="1.5" fill="none" />
          <circle cx="35" cy="120" r="7" fill="#183C32" />
          <text x="35" y="123" textAnchor="middle" className="text-[8px] font-bold fill-[#F7F3EA]">Son</text>
          <circle cx="95" cy="120" r="7" fill="#183C32" />
          <text x="95" y="123" textAnchor="middle" className="text-[8px] font-bold fill-[#F7F3EA]">Dtr</text>

          <path d="M 175 99 L 175 110 M 145 110 L 205 110" stroke="#53634A" strokeWidth="1.5" fill="none" />
          <circle cx="145" cy="120" r="7" fill="#46382C" />
          <text x="145" y="123" textAnchor="middle" className="text-[8px] font-bold fill-[#F7F3EA]">Fthr</text>
          <circle cx="205" cy="120" r="7" fill="#46382C" />
          <text x="205" y="123" textAnchor="middle" className="text-[8px] font-bold fill-[#F7F3EA]">Bro</text>
        </svg>
      </div>
    );
  }

  // 4. ISLAMIC INHERITANCE CALCULATOR (Fara'id Shares)
  if (id.includes('islamic')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#16261E] via-[#101D17] to-[#1D3328] border border-[#71877B]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Octagram Star / Islamic Pattern */}
          <g transform="translate(100, 75)">
            <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#D8C49A" strokeWidth="2" transform="rotate(0)" />
            <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#A67C3B" strokeWidth="2" transform="rotate(45)" />
            <circle cx="0" cy="0" r="42" fill="#183C32" stroke="#C7A45A" strokeWidth="2" />
            
            {/* Scales & Fractional Shares */}
            <text x="0" y="-8" textAnchor="middle" className="text-[11px] font-bold fill-[#F7F3EA] font-serif">
              FARA'ID
            </text>
            <text x="0" y="12" textAnchor="middle" className="text-[13px] font-extrabold fill-[#C7A45A] font-mono">
              1/2 • 1/4 • 1/8
            </text>
            <text x="0" y="26" textAnchor="middle" className="text-[9px] font-semibold fill-[#D8C49A] font-sans">
              Legal Share Engine
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 5. DAILY LEGAL TIPS (Matches Image 5 concept - Wooden Gavel Block & Tip Card)
  if (id.includes('tip') || id.includes('daily')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#282119] via-[#1D1711] to-[#362A1F] border border-[#A67C3B]/35 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 220 150" className="h-full max-h-24 w-auto">
          {/* Gavel Wooden Block Base */}
          <ellipse cx="110" cy="118" rx="80" ry="18" fill="#46382C" stroke="#A67C3B" strokeWidth="2" />
          <ellipse cx="110" cy="114" rx="72" ry="14" fill="#2E231B" />
          
          {/* Legal Tip Card */}
          <rect x="35" y="15" width="150" height="82" rx="8" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="2" />
          <rect x="45" y="25" width="130" height="20" rx="4" fill="#A67C3B" />
          <text x="110" y="39" textAnchor="middle" className="text-[10px] font-bold fill-[#FFFDF8] font-serif uppercase tracking-wider">
            LEGAL TIP OF THE DAY
          </text>
          
          <text x="110" y="62" textAnchor="middle" className="text-[10px] font-semibold fill-[#242522] font-sans">
            Read Before You Sign!
          </text>
          <text x="110" y="78" textAnchor="middle" className="text-[8.5px] fill-[#625F58] font-sans">
            Always verify statutory clauses & dates.
          </text>
        </svg>
      </div>
    );
  }

  // 6. ADVOCATE DETAILS / DIRECTORY (Telephone + Open Law Book Concept)
  if (id.includes('directory')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#162B23] to-[#0E1E18] border border-[#183C32]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Open Directory Book */}
          <path d="M 20 110 Q 100 125 100 40 Q 100 125 180 110 L 175 35 Q 100 50 100 30 Q 100 50 25 35 Z" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="2" />
          
          {/* Directory Book Lines */}
          <line x1="35" y1="55" x2="85" y2="60" stroke="#71877B" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="35" y1="70" x2="85" y2="75" stroke="#71877B" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="35" y1="85" x2="85" y2="90" stroke="#71877B" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Practitioner Profile Shield & Phone handset icon */}
          <circle cx="140" cy="70" r="22" fill="#183C32" stroke="#C7A45A" strokeWidth="2" />
          {/* Phone Handset */}
          <path d="M 132 62 C 132 58 138 58 140 62 L 142 66 C 143 68 141 70 139 71 C 143 76 146 78 151 81 C 152 79 154 77 156 78 L 160 80 C 164 82 164 88 160 88 C 146 88 132 74 132 62 Z" fill="#F7F3EA" />
        </svg>
      </div>
    );
  }

  // 7. JUDGEMENTS & BARE ACTS (Supreme Court / High Court Law Repository)
  if (id.includes('judgements') || id.includes('laws')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#241E19] to-[#15100B] border border-[#A67C3B]/35 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Supreme Court Pillars Pillars background */}
          <rect x="30" y="30" width="140" height="12" fill="#A67C3B" rx="2" />
          <polygon points="100,10 20,30 180,30" fill="#183C32" stroke="#C7A45A" strokeWidth="1.5" />
          
          <rect x="40" y="42" width="12" height="60" fill="#D8C49A" />
          <rect x="75" y="42" width="12" height="60" fill="#D8C49A" />
          <rect x="110" y="42" width="12" height="60" fill="#D8C49A" />
          <rect x="145" y="42" width="12" height="60" fill="#D8C49A" />

          {/* Bound Bare Act Volume */}
          <rect x="50" y="80" width="100" height="55" rx="4" fill="#46382C" stroke="#C7A45A" strokeWidth="2" />
          <rect x="60" y="90" width="80" height="35" rx="2" fill="#183C32" />
          <text x="100" y="112" textAnchor="middle" className="text-[10px] font-bold fill-[#F7F3EA] font-serif uppercase tracking-wider">
            BARE ACTS & JUDGMENTS
          </text>
        </svg>
      </div>
    );
  }

  // 8. CASE DETAILS / PROJECTS (Litigation Briefcase & Active Case File)
  if (id.includes('projects') || id.includes('case')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1C241E] to-[#101712] border border-[#71877B]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Leather Briefcase */}
          <rect x="40" y="45" width="120" height="80" rx="8" fill="#46382C" stroke="#A67C3B" strokeWidth="2.5" />
          {/* Handle */}
          <path d="M 80 45 L 80 30 Q 80 20 100 20 Q 120 20 120 30 L 120 45" fill="none" stroke="#A67C3B" strokeWidth="3" />
          
          {/* Case Folder sticking out */}
          <rect x="55" y="35" width="90" height="40" rx="4" fill="#FFFDF8" stroke="#183C32" strokeWidth="1.5" />
          <path d="M 55 45 L 145 45" stroke="#183C32" strokeWidth="1" />
          <text x="100" y="60" textAnchor="middle" className="text-[9px] font-bold fill-[#183C32] font-serif uppercase">
            CASE FILE NO. #2026
          </text>

          {/* Gold Clasp Locks */}
          <rect x="65" y="75" width="12" height="16" rx="2" fill="#C7A45A" />
          <rect x="123" y="75" width="12" height="16" rx="2" fill="#C7A45A" />
        </svg>
      </div>
    );
  }

  // 9. CALCULATORS (Professional Valuation Console)
  if (id.includes('calculators')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#25201A] to-[#15120E] border border-[#A67C3B]/30 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Calculator Body */}
          <rect x="55" y="20" width="90" height="115" rx="10" fill="#242522" stroke="#A67C3B" strokeWidth="2.5" />
          {/* Screen Display */}
          <rect x="67" y="32" width="66" height="26" rx="4" fill="#183C32" stroke="#71877B" strokeWidth="1.5" />
          <text x="126" y="50" textAnchor="end" className="text-[14px] font-extrabold fill-[#F7F3EA] font-mono">
            ₹ 45,800
          </text>

          {/* Keypad Grid */}
          <g fill="#A67C3B" rx="3">
            <rect x="67" y="66" width="18" height="14" rx="3" />
            <rect x="91" y="66" width="18" height="14" rx="3" />
            <rect x="115" y="66" width="18" height="14" rx="3" fill="#C7A45A" />

            <rect x="67" y="84" width="18" height="14" rx="3" />
            <rect x="91" y="84" width="18" height="14" rx="3" />
            <rect x="115" y="84" width="18" height="14" rx="3" fill="#C7A45A" />

            <rect x="67" y="102" width="18" height="14" rx="3" />
            <rect x="91" y="102" width="18" height="14" rx="3" fill="#183C32" />
            <rect x="115" y="102" width="18" height="14" rx="3" fill="#183C32" />
          </g>
        </svg>
      </div>
    );
  }

  // 10. LAND AREA CONVERTER
  if (id.includes('land')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2A1813] to-[#150B08] border border-[#B85232]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Measured Land Plot Grid */}
          <polygon points="30,110 70,40 170,50 150,120" fill="#B85232" fillOpacity="0.2" stroke="#B85232" strokeWidth="2.5" strokeDasharray="4 2" />
          <line x1="30" y1="110" x2="170" y2="50" stroke="#E8C8BC" strokeWidth="1.5" />
          
          {/* Compass Rose */}
          <circle cx="150" cy="40" r="18" fill="#150B08" stroke="#B85232" strokeWidth="2" />
          <polygon points="150,26 154,40 150,38 146,40" fill="#E88C74" />
          <text x="150" y="23" textAnchor="middle" className="text-[9px] font-bold fill-[#E88C74]">N</text>

          <text x="100" y="90" textAnchor="middle" className="text-[12px] font-extrabold fill-[#FFFDF8] font-mono">
            43,560 SQ. FT
          </text>
          <text x="100" y="104" textAnchor="middle" className="text-[9px] font-bold fill-[#E8C8BC] font-sans">
            (1.00 ACRE)
          </text>
        </svg>
      </div>
    );
  }

  // 11. INTEREST CALCULATOR
  if (id.includes('interest')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1C2615] to-[#0E150A] border border-[#52633C]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Interest Growth Arc Chart */}
          <path d="M 30 110 Q 90 100 170 30" fill="none" stroke="#A3BA88" strokeWidth="4" strokeLinecap="round" />
          <polygon points="170,30 155,35 165,45" fill="#A3BA88" />
          
          {/* Percentage & Award Decree */}
          <rect x="45" y="45" width="80" height="50" rx="6" fill="#151815" stroke="#52633C" strokeWidth="2" />
          <text x="85" y="68" textAnchor="middle" className="text-[13px] font-extrabold fill-[#F7F3EA] font-mono">
            6% p.a.
          </text>
          <text x="85" y="84" textAnchor="middle" className="text-[8.5px] font-bold fill-[#A3BA88] uppercase">
            Decree Award
          </text>
        </svg>
      </div>
    );
  }

  // 12. DATE DIFFERENCE CALCULATOR
  if (id.includes('date')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#231E1A] to-[#120F0D] border border-[#61564C]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Calendar Sheet */}
          <rect x="45" y="25" width="110" height="100" rx="8" fill="#FFFDF8" stroke="#61564C" strokeWidth="2" />
          <rect x="45" y="25" width="110" height="26" rx="6" fill="#46382C" />
          <text x="100" y="43" textAnchor="middle" className="text-[11px] font-bold fill-[#FFFDF8] font-sans uppercase tracking-wider">
            DAYS CALCULATOR
          </text>
          
          {/* Calendar Binder Rings */}
          <circle cx="65" cy="25" r="4" fill="#D8C49A" />
          <circle cx="135" cy="25" r="4" fill="#D8C49A" />

          <text x="100" y="78" textAnchor="middle" className="text-[20px] font-extrabold fill-[#183C32] font-mono">
            +180 DAYS
          </text>
          <text x="100" y="96" textAnchor="middle" className="text-[9px] font-semibold fill-[#625F58] font-sans">
            Exact Date Difference
          </text>
        </svg>
      </div>
    );
  }

  // 13. LIMITATION ACT CALCULATOR
  if (id.includes('limitation')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E2522] to-[#101513] border border-[#71877B]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Clock Dial & Statute Book */}
          <circle cx="100" cy="70" r="44" fill="#183C32" stroke="#C7A45A" strokeWidth="3" />
          <path d="M 100 70 L 100 42 M 100 70 L 120 70" stroke="#F7F3EA" strokeWidth="3" strokeLinecap="round" />
          
          <rect x="55" y="102" width="90" height="22" rx="4" fill="#A67C3B" />
          <text x="100" y="117" textAnchor="middle" className="text-[9.5px] font-bold fill-[#FFFDF8] font-serif uppercase tracking-wider">
            LIMITATION ACT 1963
          </text>
        </svg>
      </div>
    );
  }

  // 14. LEGAL DICTIONARY
  if (id.includes('dictionary')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#18261E] to-[#0D1812] border border-[#183C32]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Open Thick Dictionary Volume */}
          <path d="M 25 35 Q 100 45 100 25 Q 100 45 175 35 L 175 115 Q 100 125 100 110 Q 100 125 25 115 Z" fill="#FFFDF8" stroke="#A67C3B" strokeWidth="2.5" />
          <path d="M 100 25 L 100 110" stroke="#A67C3B" strokeWidth="2" />
          
          <text x="62" y="60" textAnchor="middle" className="text-[12px] font-serif font-extrabold fill-[#183C32]">
            A - Z
          </text>
          <text x="62" y="75" textAnchor="middle" className="text-[8.5px] font-sans fill-[#625F58]">
            Latin Maxims
          </text>

          <text x="138" y="60" textAnchor="middle" className="text-[11px] font-serif font-bold fill-[#A67C3B]">
            LEXICON
          </text>
          <text x="138" y="75" textAnchor="middle" className="text-[8.5px] font-sans fill-[#625F58]">
            Statutory Glossary
          </text>
        </svg>
      </div>
    );
  }

  // 15. SECTION MAPPING (Old Acts -> New Acts Converter)
  if (id.includes('section') || id.includes('mapping')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#262017] to-[#15110B] border border-[#A67C3B]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 220 150" className="h-full max-h-24 w-auto">
          {/* Old Act Box */}
          <rect x="20" y="45" width="70" height="55" rx="6" fill="#46382C" stroke="#A67C3B" strokeWidth="2" />
          <text x="55" y="70" textAnchor="middle" className="text-[11px] font-bold fill-[#FFFDF8] font-sans">
            IPC / CrPC
          </text>
          <text x="55" y="85" textAnchor="middle" className="text-[8.5px] fill-[#D8C49A]">
            Old Acts
          </text>

          {/* Transfer Arrows */}
          <path d="M 98 72 L 122 72 M 116 66 L 124 72 L 116 78" stroke="#C7A45A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* New Act Box */}
          <rect x="130" y="45" width="70" height="55" rx="6" fill="#183C32" stroke="#C7A45A" strokeWidth="2" />
          <text x="165" y="70" textAnchor="middle" className="text-[11px] font-bold fill-[#FFFDF8] font-sans">
            BNS / BNSS
          </text>
          <text x="165" y="85" textAnchor="middle" className="text-[8.5px] fill-[#8FAF9C]">
            New Sanhita
          </text>
        </svg>
      </div>
    );
  }

  // 16. SECURE CHAT MESSENGER
  if (id.includes('chat')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#162720] to-[#0C1713] border border-[#183C32]/40 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Encrypted Shield */}
          <path d="M 100 20 L 145 35 C 145 80 100 115 100 115 C 100 115 55 80 55 35 Z" fill="#183C32" stroke="#C7A45A" strokeWidth="2.5" />
          
          {/* Chat Bubbles */}
          <rect x="70" y="45" width="45" height="24" rx="6" fill="#FFFDF8" />
          <rect x="85" y="75" width="45" height="24" rx="6" fill="#C7A45A" />
        </svg>
      </div>
    );
  }

  // 17. MY NOTES
  if (id.includes('notes')) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#26201A] to-[#14100C] border border-[#A67C3B]/35 flex items-center justify-center p-3 shadow-inner ${className}`}>
        <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
          {/* Leather Journal */}
          <rect x="55" y="25" width="90" height="105" rx="6" fill="#46382C" stroke="#A67C3B" strokeWidth="2.5" />
          <line x1="70" y1="25" x2="70" y2="130" stroke="#A67C3B" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Bookmark Ribbon */}
          <path d="M 115 25 L 115 75 L 123 68 L 131 75 L 131 25 Z" fill="#C7A45A" />
        </svg>
      </div>
    );
  }

  // 18. DEFAULT FALLBACK MODULE VISUAL
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E2420] to-[#121614] border border-[#A67C3B]/25 flex items-center justify-center p-3 shadow-inner ${className}`}>
      <svg viewBox="0 0 200 150" className="h-full max-h-24 w-auto">
        <circle cx="100" cy="75" r="45" fill="#183C32" stroke="#C7A45A" strokeWidth="2.5" />
        <path d="M 80 75 L 120 75 M 100 55 L 100 95" stroke="#F7F3EA" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default ModuleCardVisual;
