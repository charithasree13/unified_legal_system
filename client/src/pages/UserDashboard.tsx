import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Scale, FileText, Bookmark, Calendar, ArrowRight, MessageSquare, Star, 
  Landmark, BookOpen, Calculator, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApiUrl } from '../config/api';
import { PortalOverview } from '../components/PortalOverview';
import { FounderSection } from '../components/FounderSection';
import { FooterSection } from '../components/FooterSection';
import { DailyLegalTipsSection } from '../components/DailyLegalTipsSection';

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
      const caseRes = await fetch(getApiUrl('/api/projects'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const caseData = await caseRes.json();
      if (caseRes.ok && Array.isArray(caseData.projects)) {
        setRecentCases(caseData.projects.slice(0, 3));
        setStats(prev => ({ ...prev, activeCases: caseData.projects.length }));
      }

      // 2. Fetch bookmarks/judgements
      const docsRes = await fetch(getApiUrl('/api/documents/judgements'), {
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

      {/* Pending Advocate Verification Notice */}
      {user?.role === 'Advocate' && user?.isVerified === false && (
        <div className="bg-[#A67C3B]/10 border border-[#A67C3B]/30 rounded-xl p-4 flex items-center gap-3 text-[#A67C3B] dark:text-[#D8C49A] text-xs font-semibold animate-slide-up">
          <ShieldAlert size={20} className="flex-shrink-0 text-[#A67C3B]" />
          <div>
            <p className="font-bold text-sm font-serif">Bar Council Enrollment Verification Pending</p>
            <p className="text-[11px] font-normal text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
              Your Advocate enrollment credentials have been submitted and are undergoing review by the Legal Administrator. Full verified status and directory badges will be activated upon Admin approval.
            </p>
          </div>
        </div>
      )}
      
      {/* Welcome Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Vibrant Card - Luxury Deep Forest / Charcoal */}
        <div className="lg:col-span-2 bg-[#1E2420] dark:bg-[#171916] border border-[#A67C3B]/30 rounded-2xl shadow-md p-6 text-[#F7F3EA] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#A67C3B]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="z-10">
            <span className="bg-[#A67C3B]/20 border border-[#A67C3B]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#D8C49A] tracking-wide uppercase">
              {user?.role === 'Client' ? 'Client Portal Active' : 'Advocate Portal Active'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mt-4 text-[#F7F3EA]">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-[#D8D1C5] text-xs mt-2 max-w-md leading-relaxed font-normal">
              {user?.role === 'Client' 
                ? 'Track your ongoing litigation cases, search verified advocates in the directory, and calculate land measurements, interest rates, and date differences.'
                : 'Elite Legal Desk gives you secure end-to-end client communications, case management, land converters, and task calendars.'
              }
            </p>
          </div>

          <div className="mt-8 flex gap-3 z-10 flex-wrap">
            <Link 
              to="/directory"
              className="btn-premium flex items-center gap-1.5 text-xs"
            >
              Search Advocates <ArrowRight size={14} />
            </Link>
            <Link 
              to="/calculators"
              className="btn-secondary text-[#F7F3EA] border-[#D8D1C5]/30 hover:bg-white/10 text-xs"
            >
              Calculators
            </Link>
          </div>
        </div>

        {/* Stats Column */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
          {[
            { label: isNormalUser ? 'My Case Files' : 'Assigned Cases', count: stats.activeCases, icon: Scale, color: 'text-[#183C32] dark:text-[#6F9A83]', bg: 'bg-[#183C32]/10 dark:bg-[#6F9A83]/15' },
            { label: isNormalUser ? 'Saved Advocates' : 'Saved Documents', count: isNormalUser ? favoriteAdvocates.length : stats.savedDocuments, icon: isNormalUser ? Users : FileText, color: 'text-[#3F6B50] dark:text-[#8FAF9C]', bg: 'bg-[#3F6B50]/10 dark:bg-[#8FAF9C]/15' },
            { label: 'Active Tasks', count: recentCases.reduce((acc, c) => acc + (c.tasks?.filter((t: any) => t.status !== 'Done').length || 0), 0), icon: Calendar, color: 'text-[#A67C3B] dark:text-[#C7A45A]', bg: 'bg-[#A67C3B]/10 dark:bg-[#C7A45A]/15' }
          ].map((item, idx) => (
            <div key={idx} className="legal-card p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#858078] dark:text-[#969188] tracking-wider">
                  {item.label}
                </span>
                <h3 className="text-xl font-bold font-serif text-[#242522] dark:text-[#F4F0E7] mt-1">
                  {item.count}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${item.bg}`}>
                <item.icon size={20} className={item.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Collaboration Projects */}
        <div className="lg:col-span-2 card-case p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7] font-serif flex items-center gap-2">
              <Scale size={18} className="text-[#945133] dark:text-[#E09A7E]" />
              {user?.role === 'Client' ? 'My Related Cases' : 'Active Cases & Collaborations'}
            </h3>
            <Link to="/projects" className="text-xs text-[#945133] dark:text-[#E09A7E] font-semibold hover:underline flex items-center gap-0.5">
              All Cases <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCases.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#D8D1C5] dark:border-[#3A4038] rounded-xl text-xs text-[#858078] dark:text-[#969188]">
                {user?.role === 'Client' ? (
                  <span>No active legal cases are linked to your phone number ({user?.phone || 'N/A'}). When your advocate adds a case associated with your phone number, it will automatically appear here.</span>
                ) : (
                  <>
                    You are not currently assigned to any collaboration case. 
                    <Link to="/projects" className="text-[#183C32] dark:text-[#C7A45A] font-semibold hover:underline block mt-1.5">
                      + Create New Project
                    </Link>
                  </>
                )}
              </div>
            ) : (
              recentCases.map((proj: any) => {
                const todoTasks = proj.tasks?.filter((t: any) => t.status !== 'Done') || [];
                return (
                  <div key={proj._id} className="p-4 border border-[#D8D1C5]/70 dark:border-[#3A4038]/70 bg-[#EFEAE0]/50 dark:bg-[#1E211D]/50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        proj.priority === 'High' ? 'bg-[#914F45]/10 text-[#914F45]' : 'bg-[#183C32]/10 text-[#183C32] dark:text-[#8FAF9C]'
                      }`}>
                        {proj.priority} Priority
                      </span>
                      <h4 className="font-semibold text-sm text-[#242522] dark:text-[#F4F0E7] font-serif mt-1.5">{proj.name}</h4>
                      <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6] mt-0.5">Case No: {proj.caseNo || 'N/A'} | Next Hearing: {proj.nextHearingDate || 'Flexible'}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#242522] dark:text-[#F4F0E7]">{proj.progress}% Done</p>
                        <div className="h-1.5 w-24 bg-[#D8D1C5] dark:bg-[#3A4038] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-[#183C32] dark:bg-[#6F9A83] rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                      
                      <Link 
                        to={`/projects?id=${proj._id}`}
                        className="p-2 hover:bg-[#EFEAE0] dark:hover:bg-[#1E211D] rounded-lg text-[#625F58] dark:text-[#C5C0B6] transition-colors"
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
        <div className="card-directory p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7] font-serif mb-4 flex items-center gap-2">
              <Star size={18} className="text-[#39665B] dark:text-[#81B8AB] fill-current" />
              Favorite Advocates
            </h3>

            <div className="space-y-3.5">
              {favoriteAdvocates.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#858078] dark:text-[#969188]">
                  Shortlist professional contacts to display here.
                  <Link to="/directory" className="text-[#183C32] dark:text-[#C7A45A] font-semibold hover:underline block mt-1.5">
                    Browse Directory
                  </Link>
                </div>
              ) : (
                favoriteAdvocates.map((fav: any) => (
                  <div key={fav._id} className="flex items-center justify-between p-2 bg-[#EFEAE0]/60 dark:bg-[#1E211D]/60 rounded-lg border border-[#D8D1C5]/60 dark:border-[#3A4038]/60">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#183C32] text-white flex items-center justify-center font-bold text-xs">
                        {fav.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-[#242522] dark:text-[#F4F0E7] font-serif">{fav.name}</h4>
                        <p className="text-[10px] text-[#625F58] dark:text-[#C5C0B6]">{fav.specialization} | {fav.city}</p>
                      </div>
                    </div>
                    <Link
                      to={`/chat?user=${fav._id}`}
                      className="p-1.5 hover:bg-[#FFFDF8] dark:hover:bg-[#242822] border border-transparent hover:border-[#D8D1C5] dark:hover:border-[#3A4038] rounded text-[#625F58] dark:text-[#C5C0B6] transition-all"
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
            <div className="pt-4 border-t border-[#D8D1C5]/60 dark:border-[#3A4038]/60 mt-4">
              <h4 className="font-semibold text-xs text-[#858078] dark:text-[#969188] mb-2.5 uppercase tracking-wider">Quick Legal Resources</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link to="/judgements" className="p-2 border border-[#D8D1C5] dark:border-[#3A4038] rounded hover:bg-[#EFEAE0] dark:hover:bg-[#1E211D] font-semibold text-[#242522] dark:text-[#F4F0E7] flex items-center gap-1.5 transition-colors">
                  <Scale size={14} /> Judgements
                </Link>
                <Link to="/laws" className="p-2 border border-[#D8D1C5] dark:border-[#3A4038] rounded hover:bg-[#EFEAE0] dark:hover:bg-[#1E211D] font-semibold text-[#242522] dark:text-[#F4F0E7] flex items-center gap-1.5 transition-colors">
                  <BookOpen size={14} /> Bare Acts
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Daily Legal Tips / Updates (Advocates Only) */}
      {user?.role === 'Advocate' && <DailyLegalTipsSection />}

      {/* Founder Details & Footer Section (Displayed both before and after login) */}
      <FounderSection />
      <FooterSection />

    </div>
  );
};
