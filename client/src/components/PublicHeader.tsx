import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogIn, UserPlus, LogOut, User, LayoutDashboard, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface PublicHeaderProps {
  onOpenAuthModal?: (mode: 'login' | 'signup', prompt?: string) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();
  const { user, token, darkMode, setDarkMode, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignIn = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal('login', 'Please sign in with your credentials to access protected features.');
    } else {
      navigate('/login');
    }
  };

  const handleSignUp = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal('signup', 'Create a free Elite Legal Desk account to start using legal tools and case features.');
    } else {
      navigate('/login');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Advocates', path: '/directory' },
    { label: 'Calculators', path: '/calculators' },
    { label: 'Judgments', path: '/judgements' },
    { label: 'Bare Acts & Laws', path: '/laws' },
    { label: 'Legal Sections', path: '/section-mapping' },
    { label: 'About Founder', path: '#founder' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/dashboard')}>
          <img 
            src="/logo.jpg" 
            alt="Elite Legal Desk Logo" 
            className="h-10 w-10 object-contain rounded-full border border-amber-400 bg-white shadow-sm" 
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-wider font-sans text-slate-900 dark:text-white uppercase leading-none">
              ELITE LEGAL DESK
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest mt-0.5">
              MADANAPALLE
            </span>
          </div>
        </div>

        {/* Global Search input for Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex max-w-xs w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search advocates, laws, judgments..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            if (link.path.startsWith('#')) {
              return (
                <a
                  key={link.label}
                  href={link.path}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.path}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Auth Action Buttons */}
          {!token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignIn}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button
                onClick={handleSignUp}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-slate-800 dark:text-white font-semibold">{user?.name}</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/dashboard"
                className="px-2.5 py-1.5 bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                title="Go to Dashboard"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">My Dashboard</span>
              </Link>

              <button
                onClick={() => logout()}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search advocates, laws..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {link.label}
            </Link>
          ))}

          {!token && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); handleSignIn(); }}
                className="py-2 text-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleSignUp(); }}
                className="py-2 text-center text-xs font-bold bg-amber-600 text-white rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
