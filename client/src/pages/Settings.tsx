import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, addNotification } = useAuthStore();

  const handleTimeoutChange = () => {
    addNotification('Settings Updated', 'Session timeout properties updated.', 'success');
  };

  return (
    <div className="max-w-xl mx-auto legal-card overflow-hidden animate-slide-up">
      <div className="h-20 bg-[#183C32] dark:bg-[#151815] border-b border-[#A67C3B]/30 flex items-center justify-between px-6 text-[#F7F3EA]">
        <h3 className="font-bold text-sm font-serif flex items-center gap-2">
          <SettingsIcon size={16} className="text-[#A67C3B]" /> Platform Settings & Security
        </h3>
        <span className="text-[10px] bg-[#A67C3B]/20 text-[#D8C49A] border border-[#A67C3B]/30 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Configuration
        </span>
      </div>

      <div className="p-6 space-y-6 text-xs">
        
        {/* Visual appearance */}
        <div className="space-y-4">
          <h4 className="font-bold text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider border-b border-border dark:border-dark-border pb-2 font-sans">
            Appearance & Theme
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-text-primary dark:text-dark-text-primary font-serif">Dark Mode Interface</h5>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary mt-0.5">Toggle interface theme between Warm Ivory (Light) and Charcoal/Forest (Dark).</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                darkMode ? 'bg-[#6F9A83]' : 'bg-[#D8D1C5]'
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
          <h4 className="font-bold text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider border-b border-border dark:border-dark-border pb-2 font-sans">
            Security Control
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-text-primary dark:text-dark-text-primary font-serif">Inactivity Timeout Session</h5>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary mt-0.5">Define maximum idle session thresholds before auto-logout.</p>
            </div>
            <select
              onChange={handleTimeoutChange}
              className="legal-input w-auto text-xs py-1"
            >
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>Never</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
