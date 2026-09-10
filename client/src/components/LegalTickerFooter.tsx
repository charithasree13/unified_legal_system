import React from 'react';
import { Scale, Lightbulb, Gavel, BookOpen } from 'lucide-react';
import { LEGAL_PRINCIPLES } from '../utils/legalPrinciples';

export const LegalTickerFooter: React.FC = () => {
  // Triple the items to ensure seamless infinite looping on all screen resolutions
  const tickerItems = [...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES];

  return (
    <footer className="h-10 w-full bg-slate-900 text-slate-100 border-t border-amber-500/30 flex items-center overflow-hidden z-20 select-none shadow-xl relative flex-shrink-0 transition-colors duration-200">
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
      <div className="h-full px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-amber-300 flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider flex-shrink-0 z-30 shadow-lg border-r border-amber-500/30">
        <Scale size={15} className="text-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Legal Maxims & Principles</span>
        <span className="sm:hidden">Legal Principles</span>
      </div>

      {/* Marquee Ticker Track */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full bg-slate-900/95">
        {/* Edge fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-900 via-slate-900/90 to-transparent z-10 pointer-events-none" />

        <div className="legal-ticker-track flex items-center gap-7 py-1 px-4 cursor-pointer">
          {tickerItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-xs transition-colors flex-shrink-0"
            >
              {/* Category Pill */}
              <span className="text-amber-300 font-extrabold flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 text-[10px] uppercase tracking-wider flex-shrink-0 shadow-sm">
                <Lightbulb size={11} className="text-amber-400" />
                {item.category}
              </span>

              {/* Title */}
              <span className="font-bold text-white flex items-center gap-1 flex-shrink-0">
                <Gavel size={12} className="text-sky-400" />
                {item.title}
              </span>

              {/* Latin Maxim */}
              {item.latinOrMaxim && (
                <span className="font-mono text-cyan-300 text-[11px] bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40 flex-shrink-0 shadow-inner font-medium">
                  "{item.latinOrMaxim}"
                </span>
              )}

              {/* Description */}
              <span className="text-slate-200 text-[11px] font-normal flex-shrink-0">
                {item.description}
              </span>

              {/* Source Reference */}
              <span className="text-amber-300/90 text-[10px] flex items-center gap-1 font-medium italic flex-shrink-0 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700">
                <BookOpen size={10} className="text-amber-400/80" />
                ({item.source})
              </span>

              {/* Separator Bullet */}
              <span className="text-amber-400 font-bold ml-2 flex-shrink-0">•</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
