import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Scale, FileText, Bookmark, Calendar, ArrowRight, MessageSquare, Star, 
  Landmark, BookOpen, Calculator, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { PortalOverview } from '../components/PortalOverview';

export const UserDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const isNormalUser = user?.role !== 'Admin' && user?.role !== 'Advocate';
  
  const [favoriteAdvocates, setFavoriteAdvocates] = useState<any[]>([]);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  
  // Stats summary for the user
  const [stats, setStats] = useState({
    activeCases: 0,
    savedDocuments: 0,
    chatRooms: 0
  });

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    try {
      // 1. Fetch cases
      const caseRes = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseData = await caseRes.json();
      if (caseRes.ok && Array.isArray(caseData.projects)) {
        setRecentCases(caseData.projects.slice(0, 3));
        setStats(prev => ({ ...prev, activeCases: caseData.projects.length }));
      }

      // 2. Fetch bookmarks/judgements
      const docsRes = await fetch('/api/documents/judgements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docsData = await docsRes.json();
      if (docsRes.ok && Array.isArray(docsData.judgements)) {
        setSavedDocs(docsData.judgements.slice(0, 3));
        setStats(prev => ({ ...prev, savedDocuments: docsData.judgements.length }));
      }

      // 3. Fetch favorite advocates (simulation from local storage)
      const favsStr = localStorage.getItem('legal_favorites');
      if (favsStr) {
        setFavoriteAdvocates(JSON.parse(favsStr).slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Main Project Overview Banner & Interactive Fields Cards Grid */}
      <PortalOverview />
      
      {/* Welcome Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Vibrant Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-primary to-[#1E40AF] rounded-2xl shadow-md p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl" />
          
          <div className="z-10">
            <span className="bg-secondary/20 border border-secondary/30 px-3 py-1 rounded-full text-xs font-semibold text-secondary tracking-wide uppercase">
              {user?.role === 'Client' ? 'Client Portal Active' : 'Advocate Portal Active'}
            </span>
            <h1 className="text-3xl font-bold font-sans mt-4">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-white/80 text-xs mt-2 max-w-md leading-relaxed">
              {user?.role === 'Client' 
                ? 'Track your ongoing litigation cases, search verified advocates in the directory, and calculate state court fees and land conversions.'
                : 'Unified Legal System gives you secure end-to-end client communications, case management, land converters, and task calendars.'
              }
            </p>
          </div>

          <div className="mt-8 flex gap-4 z-10 flex-wrap">
            <Link 
              to="/directory"
              className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-primary font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              Search Advocates <ArrowRight size={14} />
            </Link>
            <Link 
              to="/calculators"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all border border-white/10"
            >
              Fee & Land Calculators
            </Link>
          </div>
        </div>

        {/* Stats Column */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
          {[
            { label: isNormalUser ? 'My Case Files' : 'Assigned Cases', count: stats.activeCases, icon: Scale, color: 'text-primary dark:text-sky-400', bg: 'bg-primary/5 dark:bg-sky-400/5' },
            { label: isNormalUser ? 'Saved Advocates' : 'Saved Documents', count: isNormalUser ? favoriteAdvocates.length : stats.savedDocuments, icon: isNormalUser ? Users : FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
            { label: 'Active Tasks', count: recentCases.reduce((acc, c) => acc + (c.tasks?.filter((t: any) => t.status !== 'Done').length || 0), 0), icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/5' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {item.label}
                </span>
                <h3 className="text-xl font-bold font-sans mt-1">
                  {item.count}
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon size={20} className={item.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Collaboration Projects */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Scale size={18} className="text-primary dark:text-sky-400" />
              {user?.role === 'Client' ? 'My Related Cases' : 'Active Cases & Collaborations'}
            </h3>
            <Link to="/projects" className="text-xs text-primary dark:text-sky-400 font-semibold hover:underline flex items-center gap-0.5">
              All Cases <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCases.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                {user?.role === 'Client' ? (
                  <span>No active legal cases are linked to your phone number ({user?.phone || 'N/A'}). When your advocate adds a case associated with your phone number, it will automatically appear here.</span>
                ) : (
                  <>
                    You are not currently assigned to any collaboration case. 
                    <Link to="/projects" className="text-primary dark:text-sky-400 font-semibold hover:underline block mt-1.5">
                      + Create New Project
                    </Link>
                  </>
                )}
              </div>
            ) : (
              recentCases.map((proj: any) => {
                const todoTasks = proj.tasks?.filter((t: any) => t.status !== 'Done') || [];
                return (
                  <div key={proj._id} className="p-4 border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/30 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        proj.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary dark:text-sky-400'
                      }`}>
                        {proj.priority} Priority
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1.5">{proj.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Case No: {proj.caseNo || 'N/A'} | Next Hearing: {proj.nextHearingDate || 'Flexible'}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-semibold">{proj.progress}% Done</p>
                        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-primary dark:bg-sky-400 rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                      
                      <Link 
                        to={`/projects?id=${proj._id}`}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Favorite Advocates Directory Shortlist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              Favorite Advocates
            </h3>

            <div className="space-y-3.5">
              {favoriteAdvocates.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Shortlist professional contacts to display here.
                  <Link to="/directory" className="text-primary dark:text-sky-400 font-semibold hover:underline block mt-1.5">
                    Browse Directory
                  </Link>
                </div>
              ) : (
                favoriteAdvocates.map((fav: any) => (
                  <div key={fav._id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {fav.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{fav.name}</h4>
                        <p className="text-[10px] text-slate-400">{fav.specialization} | {fav.city}</p>
                      </div>
                    </div>
                    <Link
                      to={`/chat?user=${fav._id}`}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 rounded text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all"
                    >
                      <MessageSquare size={14} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legal Resources Quick Panel */}
          {!isNormalUser && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <h4 className="font-semibold text-xs text-slate-400 mb-2.5 uppercase tracking-wider">Quick Legal Resources</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link to="/judgements" className="p-2 border border-slate-150 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-950 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors">
                  <Scale size={14} /> Judgements
                </Link>
                <Link to="/laws" className="p-2 border border-slate-150 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-950 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors">
                  <BookOpen size={14} /> Bare Acts
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
