import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, LogOut, Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { LegalTickerFooter } from './LegalTickerFooter';
import { AdvocateOnboardingModal } from './AdvocateOnboardingModal';
import { useAuthStore } from '../store/authStore';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  const { 
    user, 
    darkMode, 
    setDarkMode, 
    updateActivity 
  } = useAuthStore();
  
  const navigate = useNavigate();

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
      // Global search redirect with search query parameter
      navigate(`/directory?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shadow-sm transition-colors duration-200">
          
          {/* Left: Branding & Global Search */}
          <div className="flex items-center gap-4 flex-1">
            <div 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <img 
                src="/logo.jpg" 
                alt="Elite Legal Desk Logo" 
                className="h-10 w-10 object-contain rounded-full shadow-md border border-amber-500/40 bg-white group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-wider font-sans text-slate-900 dark:text-white uppercase leading-none group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">
                  ELITE LEGAL DESK
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  MADANAPALLE
                </span>
              </div>
            </div>

            {!isDashboard && (
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                title="Toggle Navigation Menu"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="max-w-md w-full relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Global Search (Advocates, Laws, Judgements...)"
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary dark:focus:bg-slate-950 transition-all placeholder:text-slate-400"
              />
            </form>
          </div>

          {/* Right: Actions (Theme & Profile) */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* Profile Avatar Quick View */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left group"
                  title="View Logged in Person Details"
                >
                  <div className="h-8 w-8 rounded-full bg-primary dark:bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold leading-none text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">{user.name}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
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
