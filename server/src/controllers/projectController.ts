import { Response } from 'express';
import { Project, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';
import { dispatchCaseFilingNoticeEmail } from '../services/caseEmailService';

// Get Projects
export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Project.find();
    
    // Filter cases for Client role based on matching client phone number
    if (req.user?.role === 'Client') {
      const userPhoneDigits = (req.user.phone || '').replace(/\D/g, '');
      const filtered = list.filter((p: any) => {
        const projectPhoneDigits = (p.clientPhone || '').replace(/\D/g, '');
        return projectPhoneDigits && userPhoneDigits && projectPhoneDigits === userPhoneDigits;
      });
      return res.status(200).json({ success: true, projects: filtered });
    }

    return res.status(200).json({ success: true, projects: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve cases.' });
  }
};

// Get Project Details
export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Case project not found.' });
    }

    if (req.user?.role === 'Client') {
      const userPhoneDigits = (req.user.phone || '').replace(/\D/g, '');
      const userPltDefName = (req.user.name || '').trim().toLowerCase();
      const projectPhoneDigits = (project.clientPhone || '').replace(/\D/g, '');
      const plt = (project.plaintiffName || '').trim().toLowerCase();
      const def = (project.defendantName || '').trim().toLowerCase();
      const isPhoneMatch = projectPhoneDigits && userPhoneDigits && projectPhoneDigits === userPhoneDigits;
      const isNameMatch = userPltDefName && (plt.includes(userPltDefName) || userPltDefName.includes(plt) || def.includes(userPltDefName) || userPltDefName.includes(def));
      if (!isPhoneMatch && !isNameMatch) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view case details applicable to you.' });
      }
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch case details.' });
  }
};

// Create Project
export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot create new case files.' });
    }
    const { name, description, priority, deadline, teamMembers, caseNo, nextHearingDate, plaintiffName, defendantName, plaintiffEmail, defendantEmail, clientPhone, courtType, courtCity, caseType } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Case Name is required.' });
    }

    const team = Array.isArray(teamMembers) ? teamMembers : [];
    if (req.user?.name && !team.includes(req.user.name)) {
      team.push(req.user.name);
    }

    const newProject = await Project.create({
      name,
      description: description || '',
      priority: priority || 'Medium',
      status: 'Planning',
      deadline: deadline || '',
      progress: 0,
      teamMembers: team,
      tasks: [],
      comments: [],
      versions: [],
      currentDocContent: '',
      caseNo: caseNo || '',
      nextHearingDate: nextHearingDate || '',
      plaintiffName: plaintiffName || '',
      defendantName: defendantName || '',
      plaintiffEmail: plaintiffEmail || '',
      defendantEmail: defendantEmail || '',
      clientPhone: clientPhone || '',
      courtType: courtType || '',
      courtCity: courtCity || '',
      caseType: caseType || 'Civil',
      activityTimeline: [{
        userName: req.user?.name || 'System',
        action: 'Created the case project.',
        timestamp: new Date()
      }]
    });

    // Dispatch case creation notice email to registered Plaintiff/Defendant users asynchronously
    dispatchCaseFilingNoticeEmail(newProject, req.user?.name || 'Advocate').catch((err) => {
      console.error('Error dispatching case filing notice:', err);
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'System User',
      role: req.user?.role || 'User',
      action: 'PROJECT_CREATED',
      ip: req.ip || '127.0.0.1',
      details: `Created Case: ${name} (Case No: ${caseNo || 'N/A'})`
    });

    return res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create case project.' });
  }
};

// Update Project Properties (Status, Priority, etc.)
export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot edit case details.' });
    }
    const { status, priority, progress, deadline } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Case not found.' });

    const updates: any = {};
    const actions: string[] = [];

    if (status && status !== project.status) {
      updates.status = status;
      actions.push(`changed status to '${status}'`);
    }
    if (priority && priority !== project.priority) {
      updates.priority = priority;
      actions.push(`changed priority to '${priority}'`);
    }
    if (progress !== undefined && progress !== project.progress) {
      updates.progress = Number(progress);
      actions.push(`updated progress to ${progress}%`);
    }
    if (deadline && deadline !== project.deadline) {
      updates.deadline = deadline;
      actions.push(`adjusted deadline to ${deadline}`);
    }

    if (actions.length === 0) {
      return res.status(200).json({ success: true, project });
    }

    // Append to activity timeline
    const timelineUpdates = actions.map(action => ({
      userName: req.user?.name || 'User',
      action,
      timestamp: new Date()
    }));

    const updated = await Project.findByIdAndUpdate(req.params.id, {
      ...updates,
      $push: { activityTimeline: { $each: timelineUpdates } }
    }, { new: true });

    return res.status(200).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update case.' });
  }
};

// Add Task inside Project
export const addTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot add case tasks.' });
    }
    const { title, assignedTo, priority, deadline } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Task Title is required.' });

    const newTask = {
      _id: Math.random().toString(36).substring(2, 9),
      title,
      assignedTo: assignedTo || '',
      priority: priority || 'Medium',
      status: 'Todo',
      deadline: deadline || ''
    };

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Case not found.' });

    const updated = await Project.findByIdAndUpdate(req.params.id, {
      $push: {
        tasks: newTask,
        activityTimeline: {
          userName: req.user?.name || 'User',
          action: `added task: "${title}"`,
          timestamp: new Date()
        }
      }
    }, { new: true });

    return res.status(201).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add task.' });
  }
};

// Toggle Task Status (Todo -> In Progress -> Done)
export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot modify task status.' });
    }
    const { taskId, status } = req.body;
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Case project not found.' });

    const tasks = project.tasks.map((t: any) => {
      if (t._id === taskId) {
        return { ...t, status };
      }
      return t;
    });

    // Auto-calculate overall progress based on completed tasks
    const total = tasks.length;
    const done = tasks.filter((t: any) => t.status === 'Done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : project.progress;

    const taskTitle = project.tasks.find((t: any) => t._id === taskId)?.title || 'Task';

    const updated = await Project.findByIdAndUpdate(id, {
      tasks,
      progress,
      $push: {
        activityTimeline: {
          userName: req.user?.name || 'User',
          action: `updated task "${taskTitle}" status to ${status}`,
          timestamp: new Date()
        }
      }
    }, { new: true });

    return res.status(200).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
};

// Add Comment (with simulated user mention notifications)
export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });

    const newComment = {
      userId: req.user?.id || 'unknown',
      userName: req.user?.name || 'User',
      content,
      createdAt: new Date()
    };

    const updated = await Project.findByIdAndUpdate(req.params.id, {
      $push: {
        comments: newComment,
        activityTimeline: {
          userName: req.user?.name || 'User',
          action: `commented: "${content.substring(0, 30)}..."`,
          timestamp: new Date()
        }
      }
    }, { new: true });

    return res.status(201).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

// Save document changes & Create Snapshot version
export const saveDraft = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot edit case document drafts.' });
    }
    const { content } = req.body;
    const updated = await Project.findByIdAndUpdate(req.params.id, {
      currentDocContent: content || ''
    }, { new: true });
    return res.status(200).json({ success: true, currentDocContent: updated.currentDocContent });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to auto-save draft.' });
  }
};

export const createVersion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients cannot save version snapshots.' });
    }
    const { title, content } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Case not found.' });

    const newVerNumber = (project.versions?.length || 0) + 1;
    const newVersion = {
      version: newVerNumber,
      title: title || `Version ${newVerNumber}`,
      content: content || project.currentDocContent || '',
      updatedBy: req.user?.name || 'User',
      updatedAt: new Date()
    };

    const updated = await Project.findByIdAndUpdate(req.params.id, {
      $push: {
        versions: newVersion,
        activityTimeline: {
          userName: req.user?.name || 'User',
          action: `created document snapshot version v${newVerNumber}`,
          timestamp: new Date()
        }
      }
    }, { new: true });

    return res.status(201).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save version.' });
  }
};

// Delete Project
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Access denied. Clients do not have permission to delete case files.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Case project not found.' });
    }

    await Project.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'System User',
      role: req.user?.role || 'User',
      action: 'PROJECT_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted Case: ${project.name} (Case No: ${project.caseNo || 'N/A'})`
    });

    return res.status(200).json({ success: true, message: 'Case project deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete case project.' });
  }
};

