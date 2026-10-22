import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sparkles, Scale, Shield } from 'lucide-react';
import { LAUNCH_MODE, isLaunchCompleted, markLaunchCompleted } from '../config/launchConfig';
import './GrandLaunchCurtain.css';

interface GrandLaunchCurtainProps {
  onLaunchComplete?: () => void;
}

export const GrandLaunchCurtain: React.FC<GrandLaunchCurtainProps> = ({ onLaunchComplete }) => {
  const location = useLocation();

  // Check if relaunch is requested via query string (e.g., ?relaunch=true or ?launch=preview)
  const isRelaunchRequested = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(location.search);
    return params.get('relaunch') === 'true' || 
           params.get('launch') === 'preview' || 
           params.get('preview_launch') === 'true';
  }, [location.search]);

  // Determine if curtain should be shown initially
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (!LAUNCH_MODE) return false;
    if (isRelaunchRequested()) return true;
    return !isLaunchCompleted();
  });

  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // React to URL changes (e.g. ?relaunch=true) or global trigger
  useEffect(() => {
    if (isRelaunchRequested()) {
      setIsFinished(false);
      setIsOpening(false);
      setIsLaunching(false);
      setIsVisible(true);
    }
  }, [location.search, isRelaunchRequested]);

  // Global window trigger for easy manual reactivation
  useEffect(() => {
    const handleGlobalTrigger = () => {
      setIsFinished(false);
      setIsOpening(false);
      setIsLaunching(false);
      setIsVisible(true);
    };
    window.addEventListener('eld-relaunch', handleGlobalTrigger);
    (window as any).showLaunchCurtain = handleGlobalTrigger;
    return () => {
      window.removeEventListener('eld-relaunch', handleGlobalTrigger);
      delete (window as any).showLaunchCurtain;
    };
  }, []);

  // Manage body scroll lock while the curtain is covering the stage
  useEffect(() => {
    if (isVisible && !isFinished) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible, isFinished]);

  // Handle Launch Action
  const handleLaunch = useCallback(() => {
    if (isLaunching || isOpening) return;

    setIsLaunching(true);
    setIsOpening(true);

    // Fire ceremonial gold, bronze & royal burgundy confetti burst
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#FFDF73', '#FFFFFF', '#A67C3B', '#8E1229', '#E8C15A'],
        ticks: 260,
        gravity: 0.75,
        scalar: 1.15,
      });

      // Secondary staggered burst for extra celebratory luster
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 120,
          origin: { y: 0.4 },
          colors: ['#D4AF37', '#FFF3B3', '#C5A059'],
          ticks: 220,
          gravity: 0.8,
        });
      }, 400);
    } catch (e) {
      // Graceful fallback if canvas-confetti encounters canvas issues
      console.warn('Ceremonial confetti trigger:', e);
    }

    // Coordinated timing matches the 2.4s CSS curtain transform
    const timer = setTimeout(() => {
      markLaunchCompleted();
      setIsFinished(true);
      setIsVisible(false);
      if (onLaunchComplete) {
        onLaunchComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLaunching, isOpening, onLaunchComplete]);

  // If launch mode is disabled or launch is finished, render nothing
  if (!isVisible || isFinished) {
    return null;
  }

  return (
    <aside 
      className={`grand-stage-container ${isOpening ? 'is-opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Elite Legal Desk Official Inauguration Stage"
    >
      {/* Overhead Theater Spotlight & Ambient Vignette */}
      <div className="grand-stage-spotlight" />

      {/* Top Valance / Pelmet (Theatrical Header Swag) */}
      <div className="grand-stage-valance" aria-hidden="true">
        <div className="grand-stage-valance-fringe" />
        
        {/* Symmetrical Hanging Gold Tassels */}
        <div className="grand-stage-valance-tassel" style={{ left: '15%' }} />
        <div className="grand-stage-valance-tassel" style={{ left: '35%' }} />
        <div className="grand-stage-valance-tassel" style={{ left: '50%', transform: 'translateX(-50%)' }} />
        <div className="grand-stage-valance-tassel" style={{ left: '65%' }} />
        <div className="grand-stage-valance-tassel" style={{ left: '85%' }} />
      </div>

      {/* Left Velvet Curtain Panel */}
      <div 
        className="grand-curtain-panel grand-curtain-left"
        aria-hidden="true"
      >
        <div className="grand-curtain-velvet" />
        <div className="grand-curtain-sheen" />
        <div className="grand-curtain-bottom-fringe" />
      </div>

      {/* Right Velvet Curtain Panel */}
      <div 
        className="grand-curtain-panel grand-curtain-right"
        aria-hidden="true"
      >
        <div className="grand-curtain-velvet" />
        <div className="grand-curtain-sheen" />
        <div className="grand-curtain-bottom-fringe" />
      </div>

      {/* Center Ceremonial Branding & Launch Action */}
      <div className="grand-center-branding">
        {/* Inauguration Plaque Detail */}
        <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#29030A]/85 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          <Scale size={14} className="text-[#FFDF73]" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F5E6BE]">
            Official Inauguration • Legal Portal
          </span>
          <Shield size={14} className="text-[#FFDF73]" />
        </div>

        {/* Official Logo Medallion with Warm Glowing Halo */}
        <div className="grand-emblem-halo mb-5 sm:mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-1.5 bg-gradient-to-b from-[#FFF5D0] via-[#D4AF37] to-[#7A5A1A] shadow-[0_10px_35px_rgba(0,0,0,0.95)] flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Elite Legal Desk Logo"
              className="w-full h-full object-contain rounded-full bg-[#FFFDF8] border border-[#AA8022]/60 shadow-inner"
            />
          </div>
        </div>

        {/* Website Name */}
        <h1 className="grand-gold-title text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.22em] text-center max-w-4xl px-2">
          ELITE LEGAL DESK
        </h1>

        {/* Website Subtitle */}
        <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#F3E5C8] tracking-wide text-center mt-3 sm:mt-4 max-w-xl px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          A Smarter Way to Access Legal Resources
        </p>

        {/* Refined Ceremonial Divider */}
        <div className="flex items-center justify-center gap-3 w-48 sm:w-64 my-6 sm:my-8 opacity-75" aria-hidden="true">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <div className="w-2 h-2 rotate-45 bg-[#FFDF73] shadow-[0_0_8px_#FFDF73]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Prominent Launch Button */}
        <button
          type="button"
          onClick={handleLaunch}
          disabled={isLaunching || isOpening}
          className="grand-launch-button group"
          aria-label="Launch Elite Legal Desk official website"
        >
          <div className="grand-button-shimmer" aria-hidden="true" />
          
          <Sparkles 
            size={18} 
            className={`text-[#2B1704] transition-transform duration-300 ${isLaunching ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} 
            aria-hidden="true"
          />

          <span>
            {isLaunching ? 'INAUGURATING...' : 'LAUNCH ELITE LEGAL DESK'}
          </span>

          <span 
            className="text-base font-black transition-transform duration-300 group-hover:translate-x-1" 
            aria-hidden="true"
          >
            →
          </span>
        </button>

        {/* Understated Sub-Caption */}
        <span className="text-[11px] sm:text-xs text-[#D8C49A]/80 tracking-wider mt-4 font-sans text-center">
          Tap above to unveil the new digital chambers and practice platform
        </span>
      </div>
    </aside>
  );
};
