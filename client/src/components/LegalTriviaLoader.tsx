import React, { useState, useEffect } from 'react';
import { Scale, Lightbulb, Sparkles, RefreshCw, BookOpen, Gavel } from 'lucide-react';
import { getRandomLegalPrinciple, type LegalPrinciple } from '../utils/legalPrinciples';

interface LegalTriviaLoaderProps {
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
  showTrivia?: boolean;
  className?: string;
}

export const LegalTriviaLoader: React.FC<LegalTriviaLoaderProps> = ({
  loadingText = 'Processing Legal Intelligence...',
  size = 'medium',
  showTrivia = true,
  className = ''
}) => {
  const [currentTrivia, setCurrentTrivia] = useState<LegalPrinciple>(getRandomLegalPrinciple());
  const [fade, setFade] = useState(true);

  // Automatically cycle to a new randomized legal principle every 7 seconds while buffering
  useEffect(() => {
    if (!showTrivia) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentTrivia(getRandomLegalPrinciple());
        setFade(true);
      }, 300);
    }, 7000);

    return () => clearInterval(interval);
  }, [showTrivia]);

  const handleNextFact = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentTrivia(getRandomLegalPrinciple());
      setFade(true);
    }, 200);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center animate-fade-in ${className}`}>
      
      {/* Loading Spinner Header */}
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-sky-400/20 border border-primary/20 dark:border-sky-400/30 flex items-center justify-center shadow-inner">
          <Scale size={24} className="text-primary dark:text-sky-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow border border-slate-200 dark:border-slate-800">
          <RefreshCw size={12} className="text-secondary animate-spin" />
        </div>
      </div>

      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide mb-5 flex items-center gap-2">
        <span>{loadingText}</span>
      </p>

      {/* DID YOU KNOW? RANDOMIZED LEGAL PRINCIPLE CARD */}
      {showTrivia && (
        <div className={`w-full max-w-md bg-gradient-to-br from-slate-50 to-amber-50/40 dark:from-slate-900 dark:to-slate-950/80 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-5 shadow-lg relative text-left transition-all duration-300 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* Card Top Label */}
          <div className="flex items-center justify-between mb-2.5 border-b border-amber-200/60 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Lightbulb size={15} className="text-amber-500 fill-amber-500/20 animate-bounce" />
              <span>Did You Know? Legal Principle</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-800/40">
              {currentTrivia.category}
            </span>
          </div>

          {/* Title & Maxim */}
          <div className="mb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Gavel size={14} className="text-primary dark:text-sky-400 flex-shrink-0" />
              <span>{currentTrivia.title}</span>
            </h4>
            {currentTrivia.latinOrMaxim && (
              <p className="text-xs font-mono font-semibold text-primary dark:text-sky-400 mt-0.5">
                "{currentTrivia.latinOrMaxim}"
              </p>
            )}
          </div>

          {/* Principle Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 font-sans">
            {currentTrivia.description}
          </p>

          {/* Citation Source & Next Fact Trigger */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium truncate max-w-[260px]">
              <BookOpen size={12} className="flex-shrink-0 text-slate-400" />
              <span className="truncate">{currentTrivia.source}</span>
            </div>
            <button
              type="button"
              onClick={handleNextFact}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="View another legal principle"
            >
              <span>Next Fact</span>
              <Sparkles size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
