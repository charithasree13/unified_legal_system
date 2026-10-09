import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, LogOut, Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { LegalTickerFooter } from './LegalTickerFooter';
import { AdvocateOnboardingModal } from './AdvocateOnboardingModal';
import { PublicHeader } from './PublicHeader';
import { FooterSection } from './FooterSection';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../store/authStore';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMsg, setAuthPromptMsg] = useState('Please sign in or create an account to continue.');

  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  const {
    token,
    user,
    darkMode,
    setDarkMode,
    updateActivity
  } = useAuthStore();

  // Sync auth modal visibility and mode with URL routes (/login, /signup)
  useEffect(() => {
    if (!token) {
      if (location.pathname === '/login') {
        setAuthModalMode('login');
        setAuthModalOpen(true);
      } else if (location.pathname === '/signup') {
        setAuthModalMode('signup');
        setAuthModalOpen(true);
      } else {
        setAuthModalOpen(false);
      }
    } else {
      setAuthModalOpen(false);
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, token, navigate]);

  // Monitor user activity for session timeout
  useEffect(() => {
    const handleActivity = () => updateActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [updateActivity]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login', prompt?: string) => {
    setAuthModalMode(mode);
    if (prompt) setAuthPromptMsg(prompt);
    else setAuthPromptMsg('Please sign in or create an account to continue.');
    setAuthModalOpen(true);
    if (mode === 'login' && location.pathname !== '/login') {
      navigate('/login');
    } else if (mode === 'signup' && location.pathname !== '/signup') {
      navigate('/signup');
    }
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate('/dashboard');
    }
  };

  // If user is NOT logged in:
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F3EA] dark:bg-[#171916] text-[#242522] dark:text-[#F4F0E7] transition-colors font-sans">
        <PublicHeader onOpenAuthModal={handleOpenAuthModal} />

        <main className="flex-1 w-full">
          <Outlet />
        </main>

        <FooterSection />

        <AuthModal
          isOpen={authModalOpen}
          onClose={handleCloseAuthModal}
          initialMode={authModalMode}
          actionPrompt={authPromptMsg}
        />
      </div>
    );
  }

  // If user IS logged in (authenticated experience):
  return (
    <div className="flex h-screen bg-[#F7F3EA] dark:bg-[#171916] text-[#242522] dark:text-[#F4F0E7] transition-colors duration-200">
      {/* Sidebar - Visible on internal module pages, Hidden on Dashboard */}
      {!isDashboard && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}

      {/* Main Content Area - Full Width on Dashboard */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-[#FFFDF8] dark:bg-[#171916] border-b border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-between px-6 z-10 shadow-xs transition-colors duration-200">

          {/* Left: Branding & Global Search */}
          <div className="flex items-center gap-4 flex-1">
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="Elite Legal Desk Logo"
                className="h-10 w-10 object-contain rounded-full shadow-sm border border-[#A67C3B]/50 bg-[#FFFDF8] group-hover:scale-105 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-wider font-sans text-[#242522] dark:text-[#F4F0E7] uppercase leading-none group-hover:text-[#183C32] dark:group-hover:text-[#6F9A83] transition-colors whitespace-nowrap">
                  ELITE LEGAL DESK
                </span>
              </div>
            </div>

            {!isDashboard && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] text-[#625F58] dark:text-[#C5C0B6] cursor-pointer"
                title="Toggle Navigation Menu"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="max-w-md w-full relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#858078] dark:text-[#969188]">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Global Search (Advocates, Laws, Judgements...)"
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#EFEAE0] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:bg-[#FFFDF8] focus:border-[#183C32] dark:focus:bg-[#242822] dark:focus:border-[#6F9A83] transition-all text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078] dark:placeholder:text-[#969188]"
              />
            </form>
          </div>

          {/* Right: Actions (Theme & Profile) */}
          <div className="flex items-center gap-4">

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} className="text-[#C7A45A]" /> : <Moon size={20} />}
            </button>

            {/* Profile Avatar Quick View */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-[#D8D1C5] dark:border-[#3A4038]">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] transition-colors cursor-pointer text-left group"
                  title="View Profile Details"
                >
                  <div className="h-8 w-8 rounded-full bg-[#183C32] dark:bg-[#6F9A83] text-[#FFFFFF] dark:text-[#151815] flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold leading-none text-[#242522] dark:text-[#F4F0E7] group-hover:text-[#183C32] dark:group-hover:text-[#6F9A83] transition-colors">{user.name}</p>
                    <span className="text-[10px] text-[#A67C3B] dark:text-[#C7A45A] uppercase font-bold tracking-wider">{user.role}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet scrollable window */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Continuous Scrolling Legal Principles Footer */}
        <LegalTickerFooter />
      </div>

      {/* Advocate Onboarding Modal for mandatory directory indexing */}
      <AdvocateOnboardingModal />
    </div>
  );
};
