import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calculator, FileText, Gavel, 
  MessageSquare, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight, Scale, X
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

  const isNormalUser = user?.role !== 'Admin' && user?.role !== 'Advocate';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Advocate Directory', path: '/directory', icon: Users },
    { name: 'Calculators', path: '/calculators', icon: Calculator },
    { name: 'Judgements', path: '/judgements', icon: Gavel, normalUserHide: true },
    { name: 'Laws & Acts', path: '/laws', icon: BookOpen, normalUserHide: true },
    { name: 'Secure Chat', path: '/chat', icon: MessageSquare },
    { name: 'Doc Collaboration', path: '/collaboration', icon: FileText },
    { name: 'Case Projects', path: '/projects', icon: Scale },
    { name: 'Legal Section Mapping', path: '/section-mapping', icon: BookOpen, normalUserHide: true },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ].filter(item => !(isNormalUser && item.normalUserHide));

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-primary dark:bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 shadow-2xl md:static md:z-20 h-screen top-0 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Brand Logo & Mobile Close */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-secondary p-2 rounded-lg text-primary flex-shrink-0">
                <Scale size={20} className="stroke-[2.5]" />
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="font-semibold text-lg tracking-wider font-sans whitespace-nowrap">
                  LEGAL SYSTEM
                </span>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors hidden md:block"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors md:hidden"
              title="Close Menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Card */}
          {(!collapsed || mobileOpen) && user && (
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3 animate-fade-in">
              <div className="h-10 w-10 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-sm truncate">{user.name}</h4>
                <span className="text-xs text-secondary tracking-wide uppercase font-semibold">
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
                    `flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-secondary text-primary font-semibold shadow-md translate-x-1' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {(!collapsed || mobileOpen) && <span className="whitespace-nowrap">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span className="whitespace-nowrap font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
