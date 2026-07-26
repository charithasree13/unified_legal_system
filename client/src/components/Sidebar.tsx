import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calculator, FileText, Gavel, 
  MessageSquare, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight, Scale
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Advocate Directory', path: '/directory', icon: Users },
    { name: 'Calculators', path: '/calculators', icon: Calculator },
    { name: 'Judgements', path: '/judgements', icon: Gavel },
    { name: 'Laws & Acts', path: '/laws', icon: BookOpen },
    { name: 'Secure Chat', path: '/chat', icon: MessageSquare },
    { name: 'Doc Collaboration', path: '/collaboration', icon: FileText },
    { name: 'Case Projects', path: '/projects', icon: Scale },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div 
      className={`h-screen sticky top-0 bg-primary dark:bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 shadow-xl z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-secondary p-2 rounded-lg text-primary">
              <Scale size={20} className="stroke-[2.5]" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg tracking-wider font-sans whitespace-nowrap">
                LEGAL SYSTEM
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Card */}
        {!collapsed && user && (
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3 animate-fade-in">
            <div className="h-10 w-10 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-lg">
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
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-secondary text-primary font-semibold shadow-md translate-x-1' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
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
          <LogOut size={18} />
          {!collapsed && <span className="whitespace-nowrap font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};
