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

  const isApprovedAdvocate = user?.role === 'Advocate' && (user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED');
  const canAccessConverter = user?.role === 'Admin' || isApprovedAdvocate;
  const isAdvocateOrAdmin = user?.role === 'Admin' || user?.role === 'Advocate';

  const navLinks = [
    { label: 'Home', path: '/dashboard' },
    ...(isAdvocateOrAdmin ? [{ label: 'Legal Dictionary', path: '/legal-dictionary' }] : []),
    { label: 'Advocates', path: '/directory' },
    { label: 'Calculators', path: '/calculators' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF8]/95 dark:bg-[#171916]/95 backdrop-blur-md border-b border-[#D8D1C5] dark:border-[#30352F] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-shrink-0" onClick={() => navigate('/dashboard')}>
          <img
            src="/logo.jpg"
            alt="Elite Legal Desk Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full border border-[#A67C3B]/50 bg-[#FFFDF8] shadow-xs flex-shrink-0"
          />
          <span className="font-extrabold text-sm sm:text-base tracking-wider font-sans text-[#242522] dark:text-[#F4F0E7] uppercase leading-none whitespace-nowrap">
            ELITE LEGAL DESK
          </span>
        </div>

        {/* Global Search input for Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex max-w-[200px] lg:max-w-xs w-full relative flex-shrink">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search advocates, laws..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EFEAE0] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg focus:outline-none focus:border-[#183C32] dark:focus:border-[#6F9A83] text-[#242522] dark:text-[#F4F0E7] placeholder:text-[#858078] dark:placeholder:text-[#969188] transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#858078] dark:text-[#969188] pointer-events-none" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            if (link.path.startsWith('#')) {
              return (
                <a
                  key={link.label}
                  href={link.path}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] hover:text-[#183C32] dark:hover:text-[#F4F0E7] rounded-md transition-colors"
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.path}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] hover:text-[#183C32] dark:hover:text-[#F4F0E7] rounded-md transition-colors"
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
            className="p-2 text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] rounded-lg transition-colors cursor-pointer"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun size={18} className="text-[#C7A45A]" /> : <Moon size={18} />}
          </button>

          {/* Auth Action Buttons */}
          {!token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignIn}
                className="px-3 py-1.5 text-xs font-bold text-[#183C32] dark:text-[#BFD4C7] bg-transparent border border-[#71877B] dark:border-[#6F9A83] hover:bg-[#E7ECE5] dark:hover:bg-[#303930] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button
                onClick={handleSignUp}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#A67C3B] hover:bg-[#C19A59] rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-[#EFEAE0] dark:bg-[#1E211D] py-1 px-2.5 rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] text-xs font-medium">
                <div className="h-6 w-6 rounded-full bg-[#183C32] dark:bg-[#6F9A83] text-white dark:text-[#151815] flex items-center justify-center font-bold text-[10px]">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-[#242522] dark:text-[#F4F0E7] font-semibold">{user?.name}</span>
                <span className="text-[10px] bg-[#E5EEE7] dark:bg-[#1F3327] text-[#315A43] dark:text-[#7CB895] px-1.5 py-0.5 rounded font-bold uppercase">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/dashboard"
                className="px-2.5 py-1.5 bg-[#183C32] dark:bg-[#6F9A83] text-white dark:text-[#151815] hover:bg-[#245445] dark:hover:bg-[#89AA98] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                title="Go to Dashboard"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">My Dashboard</span>
              </Link>

              <button
                onClick={() => logout()}
                className="p-2 text-[#914F45] dark:text-[#E5A8A0] hover:bg-[#F1E2DF]/50 dark:hover:bg-[#38201D]/50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF8] dark:bg-[#171916] border-b border-[#D8D1C5] dark:border-[#30352F] px-4 pt-2 pb-4 space-y-2 animate-fade-in">

          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search advocates, laws..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#EFEAE0] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg text-[#242522] dark:text-[#F4F0E7]"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#858078] dark:text-[#969188]" />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-[#242522] dark:text-[#F4F0E7] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] rounded-lg"
            >
              {link.label}
            </Link>
          ))}

          {!token && (
            <div className="pt-2 border-t border-[#D8D1C5] dark:border-[#30352F] grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); handleSignIn(); }}
                className="py-2 text-center text-xs font-bold border border-[#71877B] text-[#183C32] dark:text-[#BFD4C7] rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleSignUp(); }}
                className="py-2 text-center text-xs font-bold bg-[#A67C3B] hover:bg-[#C19A59] text-white rounded-lg"
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
