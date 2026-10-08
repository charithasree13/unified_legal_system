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
  loadingText = 'Processing Legal System Query...',
  size = 'medium',
  showTrivia = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-fade-in ${className}`}>
      {/* Clean Loading Spinner Header */}
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E5EEE7] dark:bg-[#1F3327] border border-[#D8D1C5] dark:border-[#3A4038] flex items-center justify-center shadow-inner">
          <Scale size={24} className="text-[#183C32] dark:text-[#6F9A83] animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#FFFDF8] dark:bg-[#171916] rounded-full p-1 shadow border border-[#D8D1C5] dark:border-[#30352F]">
          <RefreshCw size={12} className="text-[#A67C3B] dark:text-[#C7A45A] animate-spin" />
        </div>
      </div>

      <p className="text-sm font-bold text-[#242522] dark:text-[#F4F0E7] tracking-wide flex items-center gap-2">
        <span>{loadingText}</span>
      </p>
    </div>
  );
};
