import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calculator, FileText, Gavel, 
  MessageSquare, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight, Scale, X, StickyNote, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isApprovedAdvocate = user?.role === 'Advocate' && (user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED');
  const isAdvocateOrAdmin = user?.role === 'Admin' || user?.role === 'Advocate';
  const isAuthorized = user?.role === 'Admin' || isApprovedAdvocate;
  const isNormalUser = !isAuthorized;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Legal Dictionary', path: '/legal-dictionary', icon: BookOpen, advocateOrAdminOnly: true },
    { name: 'Advocate Directory', path: '/directory', icon: Users },
    { name: isAdvocateOrAdmin ? 'Land Measurement Calculator' : 'Legal Calculators', path: '/calculators', icon: Calculator },
    { name: 'Interest Calculator', path: '/interest-calculator', icon: Calculator },
    { name: 'Date Calculator', path: '/date-difference-calculator', icon: Calendar },
    { name: 'Court Fee Calculator', path: '/court-fee-calculator', icon: Scale, advocateOrAdminOnly: true },
    { name: 'Hindu Succession Calculator', path: '/hindu-succession-calculator', icon: Scale, normalUserHide: true },
    { name: 'Islamic Inheritance Calculator', path: '/islamic-inheritance-calculator', icon: Scale, normalUserHide: true },
    { name: 'Limitation Act Calculator', path: '/limitation-calculator', icon: Scale, normalUserHide: true },
    { name: 'Judgements', path: '/judgements', icon: Gavel, normalUserHide: true },
    { name: 'Laws & Acts', path: '/laws', icon: BookOpen, normalUserHide: true },
    { name: 'Secure Chat', path: '/chat', icon: MessageSquare },
    { name: 'Doc Collaboration', path: '/collaboration', icon: FileText },
    { name: 'Case Projects', path: '/projects', icon: Scale },
    { name: 'Old Acts → New Acts Converter', path: '/section-mapping', icon: BookOpen, normalUserHide: true },
    { name: 'Daily Legal Tips', path: '/daily-legal-tips', icon: BookOpen, normalUserHide: true },
    { name: 'My Notes', path: '/my-notes', icon: StickyNote, normalUserHide: true },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ].filter(item => {
    if (isNormalUser && item.normalUserHide) return false;
    if (!isAdvocateOrAdmin && item.advocateOrAdminOnly) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#171916]/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#FFFDF8] dark:bg-[#171916] text-[#625F58] dark:text-[#C5C0B6] border-r border-[#D8D1C5] dark:border-[#30352F] flex flex-col justify-between transition-all duration-300 shadow-lg md:static md:z-20 h-screen top-0 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Brand Logo & Mobile Close */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-[#D8D1C5] dark:border-[#30352F]">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img 
                src="/logo.jpg" 
                alt="Elite Legal Desk Logo" 
                className="h-9 w-9 object-contain rounded-full shadow-xs border border-[#A67C3B]/50 bg-[#FFFDF8] flex-shrink-0" 
              />
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-extrabold text-sm tracking-wider font-sans whitespace-nowrap text-[#242522] dark:text-[#F4F0E7] leading-none">
                    ELITE LEGAL DESK
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#D8D1C5] dark:hover:bg-[#2B3029] text-[#242522] dark:text-[#F4F0E7] transition-colors hidden md:block cursor-pointer"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#D8D1C5] dark:hover:bg-[#2B3029] text-[#242522] dark:text-[#F4F0E7] transition-colors md:hidden cursor-pointer"
              title="Close Menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Card */}
          {(!collapsed || mobileOpen) && user && (
            <div className="p-4 bg-[#EFEAE0]/60 dark:bg-[#1E211D] border-b border-[#D8D1C5] dark:border-[#30352F] flex items-center gap-3 animate-fade-in">
              <div className="h-10 w-10 rounded-full bg-[#183C32] dark:bg-[#6F9A83] text-[#FFFFFF] dark:text-[#151815] flex items-center justify-center font-bold text-lg flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-[#242522] dark:text-[#F4F0E7] truncate">{user.name}</h4>
                <span className="text-xs text-[#A67C3B] dark:text-[#C7A45A] tracking-wide uppercase font-bold">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#EFEAE0] dark:bg-[#242822] text-[#183C32] dark:text-[#F4F0E7] border-l-4 border-[#A67C3B] dark:border-[#C7A45A] shadow-xs translate-x-1' 
                        : 'text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#F1F4EE] dark:hover:bg-[#2B3029] hover:text-[#183C32] dark:hover:text-[#F4F0E7]'
                    }`
                  }
                >
                  <Icon size={18} className="flex-shrink-0 text-[#183C32] dark:text-[#D4DED7]" />
                  {(!collapsed || mobileOpen) && <span className="whitespace-nowrap">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-[#D8D1C5] dark:border-[#30352F]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#914F45] dark:text-[#E5A8A0] hover:bg-[#F1E2DF] dark:hover:bg-[#38201D] transition-colors cursor-pointer"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span className="whitespace-nowrap font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
