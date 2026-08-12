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
  showTrivia = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-fade-in ${className}`}>
      {/* Clean Loading Spinner Header */}
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-sky-400/20 border border-primary/20 dark:border-sky-400/30 flex items-center justify-center shadow-inner">
          <Scale size={24} className="text-primary dark:text-sky-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow border border-slate-200 dark:border-slate-800">
          <RefreshCw size={12} className="text-secondary animate-spin" />
        </div>
      </div>

      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide flex items-center gap-2">
        <span>{loadingText}</span>
      </p>
    </div>
  );
};
