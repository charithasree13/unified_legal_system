import React from 'react';
import { Scale, Lightbulb, Gavel, BookOpen } from 'lucide-react';
import { LEGAL_PRINCIPLES } from '../utils/legalPrinciples';

export const LegalTickerFooter: React.FC = () => {
  // Triple the items to ensure seamless infinite looping on all screen resolutions
  const tickerItems = [...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES, ...LEGAL_PRINCIPLES];

  return (
    <footer className="h-10 w-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 flex items-center overflow-hidden z-20 select-none shadow-md relative flex-shrink-0 transition-colors duration-200">
      <style>{`
        @keyframes legalTickerScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.3333%, 0, 0); }
        }
        .legal-ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: legalTickerScroll 380s linear infinite;
          will-change: transform;
        }
        .legal-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Static Left Badge Header */}
      <div className="h-full px-3.5 bg-primary dark:bg-slate-800 text-white flex items-center gap-2 font-bold text-xs uppercase tracking-wider flex-shrink-0 z-30 shadow-md border-r border-blue-900 dark:border-slate-700">
        <Scale size={15} className="text-secondary animate-pulse" />
        <span className="hidden sm:inline">Legal Maxims & Principles</span>
        <span className="sm:hidden">Legal Principles</span>
      </div>

      {/* Marquee Ticker Track */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        {/* Subtle edge fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none" />

        <div className="legal-ticker-track flex items-center gap-8 py-1 px-4 cursor-pointer">
          {tickerItems.map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
            >
              <span className="text-amber-800 dark:text-amber-400 font-extrabold flex items-center gap-1 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20 text-[10px] uppercase flex-shrink-0">
                <Lightbulb size={11} className="text-amber-600 dark:text-amber-400" />
                {item.category}
              </span>

              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 flex-shrink-0">
                <Gavel size={12} className="text-sky-600 dark:text-sky-400" />
                {item.title}
              </span>

              {item.latinOrMaxim && (
                <span className="font-mono text-sky-800 dark:text-sky-300 text-[11px] bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-300 dark:border-sky-800/40 flex-shrink-0">
                  "{item.latinOrMaxim}"
                </span>
              )}

              <span className="text-slate-600 dark:text-slate-400 text-[11px] flex-shrink-0">
                {item.description}
              </span>

              <span className="text-slate-500 dark:text-slate-500 text-[10px] flex items-center gap-0.5 font-medium italic flex-shrink-0">
                <BookOpen size={10} className="text-slate-400 dark:text-slate-500" />
                ({item.source})
              </span>

              {/* Separator Bullet */}
              <span className="text-slate-400 dark:text-slate-600 font-bold ml-2 flex-shrink-0">•</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
