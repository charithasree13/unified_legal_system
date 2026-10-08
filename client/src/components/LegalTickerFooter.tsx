import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Lightbulb, Gavel, BookOpen, Shield, FileText } from 'lucide-react';
import { LEGAL_PRINCIPLES } from '../utils/legalPrinciples';

export const LegalTickerFooter: React.FC = () => {
  // Triple the items to ensure seamless infinite looping on all screen resolutions
  const tickerItems = [...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES];

  return (
    <footer className="h-10 w-full bg-[#171916] text-[#F4F0E7] border-t border-[#A67C3B]/40 flex items-center justify-between overflow-hidden z-20 select-none shadow-md relative flex-shrink-0 transition-colors duration-200">
      <style>{`
        @keyframes legalTickerScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.3333%, 0, 0); }
        }
        .legal-ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: legalTickerScroll 800s linear infinite;
          will-change: transform;
        }
        .legal-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Static Left Badge Header */}
      <div className="h-full px-3.5 bg-[#183C32] text-[#D8C49A] flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider flex-shrink-0 z-30 shadow-md border-r border-[#A67C3B]/40">
        <Scale size={15} className="text-[#C7A45A] animate-pulse" />
        <span className="hidden sm:inline">Legal Principles</span>
      </div>

      {/* Marquee Ticker Track */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full bg-[#171916]">
        {/* Edge fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#171916] via-[#171916]/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#171916] via-[#171916]/90 to-transparent z-10 pointer-events-none" />

        <div className="legal-ticker-track flex items-center gap-7 py-1 px-4 cursor-pointer">
          {tickerItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-xs transition-colors flex-shrink-0"
            >
              {/* Category Pill */}
              <span className="text-[#D8C49A] font-extrabold flex items-center gap-1 bg-[#332A19] px-2 py-0.5 rounded-full border border-[#A67C3B]/40 text-[10px] uppercase tracking-wider flex-shrink-0 shadow-xs">
                <Lightbulb size={11} className="text-[#C7A45A]" />
                {item.category}
              </span>

              {/* Title */}
              <span className="font-bold text-[#F4F0E7] flex items-center gap-1 flex-shrink-0">
                <Gavel size={12} className="text-[#6F9A83]" />
                {item.title}
              </span>

              {/* Latin Maxim */}
              {item.latinOrMaxim && (
                <span className="font-mono text-[#D8C49A] text-[11px] bg-[#2B3029] px-2 py-0.5 rounded-md border border-[#A67C3B]/30 flex-shrink-0 shadow-inner font-medium">
                  "{item.latinOrMaxim}"
                </span>
              )}

              {/* Description */}
              <span className="text-[#C5C0B6] text-[11px] font-normal flex-shrink-0">
                {item.description}
              </span>

              {/* Source Reference */}
              <span className="text-[#C7A45A] text-[10px] flex items-center gap-1 font-medium italic flex-shrink-0 bg-[#242822] px-1.5 py-0.5 rounded border border-[#3A4038]">
                <BookOpen size={10} className="text-[#C7A45A]" />
                ({item.source})
              </span>

              {/* Separator Bullet */}
              <span className="text-[#A67C3B] font-bold ml-2 flex-shrink-0">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Static Right Footer Links */}
      <div className="h-full px-3.5 bg-[#171916] border-l border-[#A67C3B]/40 flex items-center gap-3 text-[11px] font-semibold text-[#C5C0B6] flex-shrink-0 z-30 shadow-md">
        <Link 
          to="/privacy-policy" 
          className="hover:text-[#C7A45A] transition-colors flex items-center gap-1"
          title="Privacy Policy"
        >
          <Shield size={12} className="text-[#6F9A83]" />
          <span className="hidden md:inline">Privacy Policy</span>
          <span className="md:hidden">Privacy</span>
        </Link>
        <span className="text-[#858078] font-bold">•</span>
        <Link 
          to="/terms" 
          className="hover:text-[#C7A45A] transition-colors flex items-center gap-1"
          title="Terms & Conditions"
        >
          <FileText size={12} className="text-[#C7A45A]" />
          <span className="hidden md:inline">Terms & Conditions</span>
          <span className="md:hidden">Terms</span>
        </Link>
      </div>
    </footer>
  );
};
