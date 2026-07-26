import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  FileText, History, MessageSquare, Plus, Save, Clock, 
  Users, ChevronRight, Activity, Send, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Collaboration: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProj, setSelectedProj] = useState<any | null>(null);

  // Collab Editing State
  const [docContent, setDocContent] = useState('');
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'synced'>('saved');
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  // Revisions & Sidepanels
  const [activePane, setActivePane] = useState<'versions' | 'comments' | 'timeline'>('versions');
  const [commentText, setCommentText] = useState('');
  const [newVersionTitle, setNewVersionTitle] = useState('');

  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProj(data.projects[0]);
          setDocContent(data.projects[0].currentDocContent || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Socket Connection for Collaboration
  useEffect(() => {
    if (!selectedProj || !user) return;

    const socket = io(window.location.origin);
    socketRef.current = socket;

    // Join room for doc editing
    socket.emit('doc_join', selectedProj._id);

    socket.on('doc_update', (data: { content: string; userName: string }) => {
      setDocContent(data.content);
      setActiveEditor(data.userName);
      setSyncStatus('synced');

      // Clear editor indicator after delay
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setActiveEditor(null);
      }, 2000);
    });

    return () => {
      socketRef.current?.emit('doc_leave', selectedProj._id);
      socket.disconnect();
    };
  }, [selectedProj, user]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDocContent(val);
    setSyncStatus('saving');

    // Emit change via socket
    if (selectedProj && user) {
      socketRef.current?.emit('doc_edit', {
        projectId: selectedProj._id,
        content: val,
        userName: user.name
      });
    }

    // Auto-save debounce simulation
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${selectedProj._id}/draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: val })
        });
        if (res.ok) {
          setSyncStatus('saved');
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim() || !selectedProj) return;

    try {
      const res = await fetch(`/api/projects/${selectedProj._id}/version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newVersionTitle, content: docContent })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedProj(data.project);
        setNewVersionTitle('');
        addNotification('Version Saved', 'Formal draft version successfully saved.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProj) return;

    try {
      const res = await fetch(`/api/projects/${selectedProj._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedProj(data.project);
        setCommentText('');
        addNotification('Comment Added', 'New collaborative comment posted.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const restoreVersionContent = (verContent: string, verTitle: string) => {
    setDocContent(verContent);
    addNotification('Version Restored', `Restored text to: ${verTitle}`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Case Project selector banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-primary dark:text-sky-400" />
            Collaborative Document Drafts
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real-time sync and version revision history</p>
        </div>

        <select
          value={selectedProj?._id || ''}
          onChange={(e) => {
            const found = projects.find((p) => p._id === e.target.value);
            if (found) {
              setSelectedProj(found);
              setDocContent(found.currentDocContent || '');
            }
          }}
          className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-slate-700 dark:text-slate-200 font-semibold"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProj ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Editing Block */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between h-[600px]">
            
            {/* Editor Top Info Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-slate-750 dark:text-slate-100">{selectedProj.name}</span>
                <span>•</span>
                {activeEditor && (
                  <span className="text-primary dark:text-sky-400 font-semibold flex items-center gap-1.5 italic animate-pulse">
                    <Users size={14} /> {activeEditor} is editing...
                  </span>
                )}
              </div>

              {/* Saved Status Indicator */}
              <div className="flex items-center gap-1 text-slate-400">
                {syncStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <CheckCircle size={14} /> Saved locally
                  </span>
                )}
                {syncStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <RefreshCw size={14} className="animate-spin" /> Saving draft...
                  </span>
                )}
                {syncStatus === 'synced' && (
                  <span className="flex items-center gap-1 text-sky-500 font-semibold animate-pulse">
                    <RefreshCw size={14} className="animate-spin" /> Syncing edits...
                  </span>
                )}
              </div>
            </div>

            {/* Document Draft Input Canvas */}
            <div className="flex-1 p-6 bg-slate-100/50 dark:bg-slate-950/20">
              <textarea
                value={docContent}
                onChange={user?.role !== 'Client' ? handleTextChange : undefined}
                readOnly={user?.role === 'Client'}
                placeholder={user?.role === 'Client' 
                  ? "View-only document draft mode. Case document updates are managed by your advocate." 
                  : "Start drafting your collaborative petition, contract, or suit outline here. All text changes will instantly sync in real-time..."
                }
                className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner p-6 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary font-mono text-slate-800 dark:text-slate-250 placeholder:text-slate-350"
              />
            </div>

            {/* Save Version Snapshot Form */}
            {user?.role !== 'Client' && (
              <form onSubmit={handleSaveVersion} className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Version Snapshot:</span>
                <input
                  type="text"
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  required
                  placeholder="e.g. Draft v1.0 - Client Approved"
                  className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow cursor-pointer"
                >
                  <Save size={14} /> Snapshot
                </button>
              </form>
            )}
          </div>

          {/* Right Side Panel tabs: Versions, Comments, Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col justify-between">
            
            {/* Tabs Selector */}
            <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-1">
              {[
                { id: 'versions', label: 'Revisions', icon: History },
                { id: 'comments', label: 'Discussion', icon: MessageSquare },
                { id: 'timeline', label: 'Timeline', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePane(tab.id as any)}
                  className={`py-2 text-[10px] font-semibold rounded-md flex flex-col items-center gap-1 transition-all ${
                    activePane === tab.id 
                      ? 'bg-white dark:bg-slate-900 text-primary dark:text-sky-400 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab view components */}
            <div className="flex-1 p-4 overflow-y-auto">
              
              {activePane === 'versions' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Version Snapshots</h4>
                  {(!selectedProj.versions || selectedProj.versions.length === 0) ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No versions captured. Save a version snapshot using the editor bottom panel.
                    </div>
                  ) : (
                    selectedProj.versions.map((ver: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all"
                      >
                        <div>
                          <h5 className="font-semibold text-xs text-slate-900 dark:text-white">v{ver.version}: {ver.title}</h5>
                          <span className="text-[10px] text-slate-400 block mt-0.5">By {ver.updatedBy} | {new Date(ver.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => restoreVersionContent(ver.content, ver.title)}
                          className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-primary hover:text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Restore
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activePane === 'comments' && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                    <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Comments Feed</h4>
                    {(!selectedProj.comments || selectedProj.comments.length === 0) ? (
                      <div className="text-center py-12 text-xs text-slate-400">No comments posted yet.</div>
                    ) : (
                      selectedProj.comments.map((c: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase mb-1">
                            <span>{c.userName}</span>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-normal">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      placeholder="Comment text..."
                      className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-primary text-white rounded-lg cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {activePane === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Case Operations Timeline</h4>
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4">
                    {(!selectedProj.activityTimeline || selectedProj.activityTimeline.length === 0) ? (
                      <div className="text-center py-12 text-xs text-slate-400">No activity logged.</div>
                    ) : (
                      selectedProj.activityTimeline.map((item: any, idx: number) => (
                        <div key={idx} className="relative text-xs">
                          {/* Dot marker */}
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900" />
                          <span className="block text-[9px] text-slate-400 font-bold">{new Date(item.timestamp).toLocaleString()}</span>
                          <p className="mt-0.5">
                            <span className="font-semibold text-slate-900 dark:text-white mr-1">{item.userName}</span>
                            {item.action}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No case project select folders available. Add a case project under dashboard or project page.
        </div>
      )}

    </div>
  );
};
