import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, addNotification } = useAuthStore();

  const handleTimeoutChange = () => {
    addNotification('Settings Updated', 'Session timeout properties updated.', 'success');
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-slide-up">
      <div className="h-24 bg-primary flex items-center justify-between px-6 text-white">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <SettingsIcon size={16} /> Console Settings & Security
        </h3>
        <span className="text-[10px] bg-secondary/25 text-[#1e293b] dark:text-sky-400 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Configuration
        </span>
      </div>

      <div className="p-6 space-y-6 text-xs">
        
        {/* Visual appearance */}
        <div className="space-y-4">
          <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
            Appearance
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-slate-850 dark:text-slate-150">Dark Mode Interface</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Toggle interface stylesheet theme between light and dark.</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                darkMode ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Inactivity parameters */}
        <div className="space-y-4">
          <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
            Security Control
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-slate-850 dark:text-slate-150">Inactivity Timeout Session</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Define maximum idle session thresholds before auto-logout.</p>
            </div>
            <select
              onChange={handleTimeoutChange}
              defaultValue="15"
              className="border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
