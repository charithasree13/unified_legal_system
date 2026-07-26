import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Search, Sun, Moon, LogOut, Menu, Scale, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    user, 
    darkMode, 
    setDarkMode, 
    notifications, 
    markNotificationsAsRead, 
    updateActivity 
  } = useAuthStore();
  
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Click outside notification panel listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shadow-sm transition-colors duration-200">
          
          {/* Left: Collapsible Toggle Menu & Global Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>

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

          {/* Right: Actions (Theme, Notification, Profile) */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* Notifications panel trigger */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  if (!showNotif) markNotificationsAsRead();
                }}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-30 animate-slide-up">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <span className="text-xs bg-primary/10 text-primary dark:bg-sky-400/20 dark:text-sky-400 px-2.5 py-0.5 rounded-full font-medium">
                      {notifications.length} Total
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No notifications to display.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <div className="flex gap-2.5">
                            {notif.type === 'success' ? (
                              <span className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            ) : notif.type === 'warning' ? (
                              <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            ) : (
                              <span className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <div>
                              <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100">{notif.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Quick View */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="h-8 w-8 rounded-full bg-primary dark:bg-slate-700 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold leading-none">{user.name}</p>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet scrollable window */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
