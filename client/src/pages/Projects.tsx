import React, { useState, useEffect } from 'react';
import { 
  Scale, Plus, PlusCircle, CheckSquare, Calendar, KanbanSquare, 
  Clock, AlertTriangle, Play, CheckCircle2, UserPlus, FileText, ArrowRight,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Projects: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProj, setActiveProj] = useState<any | null>(null);
  
  // View mode: 'kanban' | 'timeline' | 'checklist'
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'checklist'>('kanban');

  // Form states
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [caseNo, setCaseNo] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [plaintiffName, setPlaintiffName] = useState('');
  const [defendantName, setDefendantName] = useState('');
  const [plaintiffEmail, setPlaintiffEmail] = useState('');
  const [defendantEmail, setDefendantEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [courtType, setCourtType] = useState('District Court');
  const [courtCity, setCourtCity] = useState('');
  const [caseType, setCaseType] = useState('Civil');
  const [projDesc, setProjDesc] = useState('');
  const [projPriority, setProjPriority] = useState('Medium');
  const [projDeadline, setProjDeadline] = useState('');
  const [projTeam, setProjTeam] = useState('');

  // Task form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssigned, setTaskAssigned] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');

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
          setActiveProj(data.projects[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    const teamArray = projTeam ? projTeam.split(',').map(m => m.trim()) : [];

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: projectName,
          caseNo,
          nextHearingDate,
          plaintiffName,
          defendantName,
          plaintiffEmail,
          defendantEmail,
          clientPhone,
          courtType,
          courtCity,
          caseType,
          description: projDesc,
          priority: projPriority,
          deadline: projDeadline,
          teamMembers: teamArray
        })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Project Created', `Case "${projectName}" initialized. Registered parties will be notified via email.`, 'success');
        setShowAddProject(false);
        setProjectName('');
        setCaseNo('');
        setNextHearingDate('');
        setPlaintiffName('');
        setDefendantName('');
        setPlaintiffEmail('');
        setDefendantEmail('');
        setClientPhone('');
        setCourtType('District Court');
        setCourtCity('');
        setCaseType('Civil');
        setProjDesc('');
        setProjDeadline('');
        setProjTeam('');
        
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !activeProj) return;

    try {
      const res = await fetch(`/api/projects/${activeProj._id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskTitle,
          assignedTo: taskAssigned,
          priority: taskPriority,
          deadline: taskDeadline
        })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Task Added', `Task "${taskTitle}" assigned.`, 'success');
        setShowAddTask(false);
        setTaskTitle('');
        setTaskAssigned('');
        setTaskDeadline('');
        
        // Refresh project stats
        const updatedProj = data.project;
        setActiveProj(updatedProj);
        setProjects(projects.map(p => p._id === updatedProj._id ? updatedProj : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!activeProj) return;
    
    // Cycle: Todo -> In Progress -> Done -> Todo
    let nextStatus = 'Todo';
    if (currentStatus === 'Todo') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Done';

    try {
      const res = await fetch(`/api/projects/${activeProj._id}/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId, status: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedProj = data.project;
        setActiveProj(updatedProj);
        setProjects(projects.map(p => p._id === updatedProj._id ? updatedProj : p));
        addNotification('Task Updated', `Task status modified to ${nextStatus}.`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this case file? All tasks, documents, and comments will be permanently lost.')) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        addNotification('Case Deleted', 'Litigation case file deleted successfully.', 'success');
        
        // Remove from list
        const updatedList = projects.filter(p => p._id !== projectId);
        setProjects(updatedList);
        
        // Set new active project
        if (updatedList.length > 0) {
          setActiveProj(updatedList[0]);
        } else {
          setActiveProj(null);
        }
      } else {
        const data = await res.json();
        addNotification('Error Deleting Case', data.message || 'Failed to delete case.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error Deleting Case', 'An unexpected error occurred.', 'error');
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Top selection pane */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Project Selector tabs */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2">Case Selector:</span>
          {projects.map((p) => (
            <button
              key={p._id}
              onClick={() => setActiveProj(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeProj?._id === p._id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850'
              }`}
            >
              {p.name}
            </button>
          ))}
          
          {user?.role !== 'Client' && (
            <button
              onClick={() => setShowAddProject(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Create New Case Project"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* View Mode controls */}
        {activeProj && (
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
            {[
              { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
              { id: 'timeline', label: 'Gantt Timeline', icon: Clock },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                  viewMode === v.id 
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-sky-400 shadow-sm' 
                    : 'text-slate-500'
                }`}
              >
                <v.icon size={13} />
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {activeProj ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
          
          {/* Main Visual Board View */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 min-h-[500px] flex flex-col justify-between">
            
            {/* View Headers */}
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase">
                      {activeProj.priority} Priority
                    </span>
                    <span className="text-[9px] bg-primary/10 text-primary dark:bg-sky-400/20 dark:text-sky-400 px-2 py-0.5 rounded font-bold uppercase">
                      {activeProj.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{activeProj.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Case No: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeProj.caseNo || 'N/A'}</span> | 
                    Type: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeProj.caseType || 'N/A'}</span> | 
                    Hearing: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeProj.nextHearingDate || 'Flexible'}</span> | 
                    Court: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeProj.courtType || 'N/A'} ({activeProj.courtCity || 'N/A'})</span>
                  </p>
                </div>
                
                {user?.role !== 'Client' && (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} /> Add Task
                  </button>
                )}
              </div>

              {/* View Render switch */}
              {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Todo', 'In Progress', 'Done'].map((col) => {
                    const colTasks = activeProj.tasks?.filter((t: any) => t.status === col) || [];
                    return (
                      <div key={col} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 min-h-[350px]">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">{col}</h4>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold">
                            {colTasks.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {colTasks.map((task: any) => (
                            <div 
                              key={task._id} 
                              onClick={() => user?.role !== 'Client' && toggleTaskStatus(task._id, task.status)}
                              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm relative overflow-hidden group ${
                                user?.role !== 'Client' ? 'hover:border-slate-350 cursor-pointer transition-all hover:translate-y-[-2px]' : ''
                              }`}
                            >
                              <span className={`absolute top-0 left-0 w-1.5 h-full ${
                                task.priority === 'High' ? 'bg-red-500' : 'bg-primary dark:bg-sky-400'
                              }`} />
                              <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-2 pl-1.5 pr-4">{task.title}</h5>
                              
                              <div className="flex justify-between items-center mt-3 pl-1.5 text-[9px] text-slate-400">
                                <span>Assigned: {task.assignedTo || 'Unassigned'}</span>
                                {task.deadline && <span className="font-semibold">{task.deadline}</span>}
                              </div>
                              
                              {/* Hover click prompt */}
                              {user?.role !== 'Client' && (
                                <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] uppercase tracking-wider text-primary dark:text-sky-400 font-bold">
                                  Update
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'timeline' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Clock size={14} /> Gantt Task Schedules
                  </h4>
                  
                  {(!activeProj.tasks || activeProj.tasks.length === 0) ? (
                    <div className="text-center py-10 text-xs text-slate-400">No tasks defined for this case timeline.</div>
                  ) : (
                    <div className="space-y-3">
                      {activeProj.tasks.map((task: any, idx: number) => (
                        <div key={task._id} className="grid grid-cols-4 items-center gap-4 text-xs">
                          <span className="font-semibold truncate text-slate-900 dark:text-white col-span-1">{task.title}</span>
                          
                          {/* Simulated progress track bar based on task deadline date */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500 animate-pulse-slow' : 'bg-primary'
                                }`} 
                                style={{ width: task.status === 'Done' ? '100%' : task.status === 'In Progress' ? '50%' : '15%', marginLeft: `${idx * 10}%` }} 
                              />
                            </div>
                            <span className="font-mono text-[9px] w-20 text-right">{task.deadline || 'Flexible'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'checklist' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Task Audits</h4>
                  {(!activeProj.tasks || activeProj.tasks.length === 0) ? (
                    <div className="text-center py-8 text-xs text-slate-400">Task Checklist empty.</div>
                  ) : (
                    activeProj.tasks.map((task: any) => (
                      <div 
                        key={task._id} 
                        onClick={() => user?.role !== 'Client' && toggleTaskStatus(task._id, task.status)}
                        className={`p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between ${
                          user?.role !== 'Client' ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.status === 'Done' ? (
                            <CheckCircle2 className="text-emerald-500" size={18} />
                          ) : task.status === 'In Progress' ? (
                            <Play className="text-amber-500 fill-amber-500" size={16} />
                          ) : (
                            <Clock className="text-slate-400" size={16} />
                          )}
                          <span className={`text-xs ${task.status === 'Done' ? 'line-through text-slate-400' : 'font-semibold text-slate-800 dark:text-slate-250'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold">
                          {task.assignedTo || 'Self'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

            {/* Case Progress summary details */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Overall Progress:</span>
                <span className="font-bold text-primary dark:text-sky-400">{activeProj.progress}% Completed</span>
              </div>
              <div className="h-2 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary dark:bg-sky-400 rounded-full" style={{ width: `${activeProj.progress}%` }} />
              </div>
            </div>

          </div>

          {/* Right Case Side Card: Case briefs and Team Members */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 h-fit shadow-sm">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Case Brief</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                {activeProj.description || 'Provide a brief summary under edit details to document this litigation case folder.'}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Litigation Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Case No:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.caseNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Case Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.caseType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plaintiff:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.plaintiffName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Defendant:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.defendantName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.clientPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Court Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.courtType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Court City:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProj.courtCity || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Hearing:</span>
                  <span className="font-semibold text-blue-500 font-bold">{activeProj.nextHearingDate || 'Flexible'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Team & Advocates</h4>
              <div className="space-y-2">
                {activeProj.teamMembers?.map((m: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
                    <div className="h-7 w-7 rounded-full bg-secondary text-primary font-bold text-xs flex items-center justify-center">
                      {m.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold truncate text-slate-850 dark:text-slate-200">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Dates</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Created:</span>
                  <span>{new Date(activeProj.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Deadline:</span>
                  <span className="text-red-500 font-bold">{activeProj.deadline || 'Flexible'}</span>
                </div>
              </div>
            </div>

            {user?.role !== 'Client' && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => handleDeleteProject(activeProj._id)}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete Case File
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-lg mx-auto">
          <Scale size={48} className="mx-auto text-slate-350 mb-3" />
          <h4 className="font-bold text-sm">No Active Litigation Projects</h4>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'Client' 
              ? `No active legal cases are linked to your phone number (${user?.phone || 'N/A'}). When your advocate adds a case associated with your phone number, it will automatically appear here.`
              : 'Click the "+" icon above to initialize a case file, assign advocates, and setup checklists.'
            }
          </p>
        </div>
      )}

      {/* CREATE NEW CASE PROJECT MODAL */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="h-14 bg-primary flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-sm">Initialize Litigation File</h3>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Case Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. Civil Dispute / Bengaluru Site"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Case No.</label>
                  <input
                    type="text"
                    value={caseNo}
                    onChange={(e) => setCaseNo(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. OS 123/2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Type of Case</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Plaintiff Name</label>
                  <input
                    type="text"
                    value={plaintiffName}
                    onChange={(e) => setPlaintiffName(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. Suresh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Defendant Name</label>
                  <input
                    type="text"
                    value={defendantName}
                    onChange={(e) => setDefendantName(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Plaintiff Email (Optional)</label>
                  <input
                    type="email"
                    value={plaintiffEmail}
                    onChange={(e) => setPlaintiffEmail(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="suresh@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Defendant Email (Optional)</label>
                  <input
                    type="email"
                    value={defendantEmail}
                    onChange={(e) => setDefendantEmail(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="ramesh@example.com"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 rounded-lg text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
                <Clock size={14} className="flex-shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                <span>
                  <strong>Registered User Email Alerts:</strong> Registered Plaintiff or Defendant users will automatically receive an immediate email notice of this case, plus an automated <strong>3-day pre-hearing reminder email</strong>.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Phone Number of Client</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Next Hearing Date</label>
                  <input
                    type="date"
                    value={nextHearingDate}
                    onChange={(e) => setNextHearingDate(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Court Type</label>
                  <select
                    value={courtType}
                    onChange={(e) => setCourtType(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option>District Court</option>
                    <option>High Court</option>
                    <option>Supreme Court</option>
                    <option>Senior civil judges court</option>
                    <option>Junior civil Judges court</option>
                    <option>Judicial magistrate of 1st class</option>
                    <option>Consumers forum</option>
                    <option>DRT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">City of the Court</label>
                  <input
                    type="text"
                    value={courtCity}
                    onChange={(e) => setCourtCity(e.target.value)}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. Bengaluru"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Priority</label>
                  <select
                    value={projPriority}
                    onChange={(e) => setProjPriority(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Final Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Advocates Team (comma sep)</label>
                <input
                  type="text"
                  value={projTeam}
                  onChange={(e) => setProjTeam(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. Adv. Anita Roy, Counselor Verma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Brief Case description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none h-16"
                  placeholder="Summary of property dispute and suit claim..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CHECKLIST TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
            <div className="h-12 bg-primary flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-xs">Create Case Task Card</h3>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. Verify Survey Certificate"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Assign Advocate</label>
                  <input
                    type="text"
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. Adv. Anita"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Task Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
