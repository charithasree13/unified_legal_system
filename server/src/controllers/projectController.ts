import { Response } from 'express';
import { Project, User, Advocate, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';
import { dispatchCaseFilingNoticeEmail } from '../services/caseEmailService';

/**
 * Helper: Normalize date string into YYYY-MM-DD format
 */
function normalizeDateStr(dateStr: any): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('-');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Resolve team members (comma-separated or array) to registered Advocates in MongoDB
 */
async function resolveAdvocates(teamInput: any, creatorUser: any): Promise<{ advocateIds: string[]; teamMembers: string[]; error?: string }> {
  let rawList: string[] = [];
  if (typeof teamInput === 'string') {
    rawList = teamInput.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(teamInput)) {
    rawList = teamInput.map(s => String(s).trim()).filter(Boolean);
  }

  const advocateIds: string[] = [];
  const teamMembers: string[] = [];
  const idSet = new Set<string>();

  // Include creator if creator is Advocate or Admin
  if (creatorUser && (creatorUser.role === 'Advocate' || creatorUser.role === 'Admin')) {
    if (creatorUser.id) {
      idSet.add(String(creatorUser.id));
      advocateIds.push(String(creatorUser.id));
    }
    if (creatorUser.name && !teamMembers.includes(creatorUser.name)) {
      teamMembers.push(creatorUser.name);
    }
  }

  for (const term of rawList) {
    if (!term) continue;
    const cleanedTerm = term.replace(/^(adv\.|advocate|counselor)\s+/i, '').trim();

    // Query User collection (role Advocate or Admin) and Advocate collection
    const userMatch = await User.findOne({
      $or: [
        { email: term.toLowerCase() },
        { enrollmentNumber: term },
        { name: new RegExp(`^${cleanedTerm}$`, 'i') },
        { name: new RegExp(cleanedTerm, 'i') }
      ]
    });

    let advMatch = userMatch;
    if (!advMatch) {
      advMatch = await Advocate.findOne({
        $or: [
          { email: term.toLowerCase() },
          { enrollmentNumber: term },
          { name: new RegExp(`^${cleanedTerm}$`, 'i') },
          { name: new RegExp(cleanedTerm, 'i') }
        ]
      });
    }

    if (!advMatch) {
      return {
        advocateIds: [],
        teamMembers: [],
        error: `Case creation failed: Advocate '${term}' is not a registered advocate in Elite Legal Desk.`
      };
    }

    const matchedId = String(advMatch._id || advMatch.id);
    if (!idSet.has(matchedId)) {
      idSet.add(matchedId);
      advocateIds.push(matchedId);
    }
    const matchedName = advMatch.name || term;
    if (!teamMembers.includes(matchedName)) {
      teamMembers.push(matchedName);
    }
  }

  return { advocateIds, teamMembers };
}

/**
 * Helper: Resolve client account from database
 */
async function resolveClient(clientPhone?: string, plaintiffEmail?: string, plaintiffName?: string, clientId?: string): Promise<{ clientId?: string; clientName?: string; clientEmail?: string; clientPhone?: string; error?: string }> {
  const queryOr: any[] = [];
  if (clientId) queryOr.push({ _id: clientId });
  if (plaintiffEmail && plaintiffEmail.trim()) queryOr.push({ email: plaintiffEmail.trim().toLowerCase() });
  if (clientPhone && clientPhone.trim()) {
    const digits = clientPhone.replace(/\D/g, '');
    queryOr.push({ phone: clientPhone.trim() });
    if (digits) queryOr.push({ phone: digits });
  }
  if (plaintiffName && plaintiffName.trim()) {
    queryOr.push({ name: new RegExp(plaintiffName.trim(), 'i') });
  }

  if (queryOr.length === 0) {
    return {};
  }

  const clientUser = await User.findOne({ $or: queryOr });
  if (!clientUser && (plaintiffEmail || clientPhone)) {
    return {
      error: `Case creation failed: Client '${plaintiffEmail || clientPhone}' is not a registered user account in Elite Legal Desk.`
    };
  }

  if (clientUser) {
    return {
      clientId: String(clientUser._id),
      clientName: clientUser.name || plaintiffName,
      clientEmail: clientUser.email || plaintiffEmail,
      clientPhone: clientUser.phone || clientPhone
    };
  }

  return {};
}

// Get Projects
export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Project.find();
    
    // Filter cases for Client role based on matching clientId, phone number, or email
    if (req.user?.role === 'Client') {
      const userIdStr = req.user.id ? String(req.user.id) : '';
      const userPhoneDigits = (req.user.phone || '').replace(/\D/g, '');
      const userEmailLower = (req.user.email || '').trim().toLowerCase();

      const filtered = list.filter((p: any) => {
        const isClientMatch = p.clientId && String(p.clientId) === userIdStr;
        const projectPhoneDigits = (p.clientPhone || '').replace(/\D/g, '');
        const isPhoneMatch = projectPhoneDigits && userPhoneDigits && projectPhoneDigits === userPhoneDigits;
        const isEmailMatch = userEmailLower && (
          (p.plaintiffEmail && p.plaintiffEmail.trim().toLowerCase() === userEmailLower) ||
          (p.defendantEmail && p.defendantEmail.trim().toLowerCase() === userEmailLower)
        );
        return isClientMatch || isPhoneMatch || isEmailMatch;
      });
      return res.status(200).json({ success: true, projects: filtered });
    }

    // Filter cases for Advocate role: cases created by advocate OR assigned in advocateIds/teamMembers
    if (req.user?.role === 'Advocate') {
      const userIdStr = req.user.id ? String(req.user.id) : '';
      const userNameLower = (req.user.name || '').trim().toLowerCase();
      const userEmailLower = (req.user.email || '').trim().toLowerCase();

      const filtered = list.filter((p: any) => {
        const isCreator = p.createdBy && String(p.createdBy) === userIdStr;
        const isAssignedId = Array.isArray(p.advocateIds) && p.advocateIds.map(String).includes(userIdStr);
        const isTeamMember = Array.isArray(p.teamMembers) && p.teamMembers.some((m: string) => {
          const mLower = m.trim().toLowerCase();
          return (userNameLower && mLower.includes(userNameLower)) || (userEmailLower && mLower === userEmailLower);
        });
        return isCreator || isAssignedId || isTeamMember;
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
      const userIdStr = req.user.id ? String(req.user.id) : '';
      const userPhoneDigits = (req.user.phone || '').replace(/\D/g, '');
      const userEmailLower = (req.user.email || '').trim().toLowerCase();
      const userPltDefName = (req.user.name || '').trim().toLowerCase();

      const isClientMatch = project.clientId && String(project.clientId) === userIdStr;
      const projectPhoneDigits = (project.clientPhone || '').replace(/\D/g, '');
      const isPhoneMatch = projectPhoneDigits && userPhoneDigits && projectPhoneDigits === userPhoneDigits;
      const isEmailMatch = userEmailLower && (
        (project.plaintiffEmail && project.plaintiffEmail.trim().toLowerCase() === userEmailLower) ||
        (project.defendantEmail && project.defendantEmail.trim().toLowerCase() === userEmailLower)
      );
      const plt = (project.plaintiffName || '').trim().toLowerCase();
      const def = (project.defendantName || '').trim().toLowerCase();
      const isNameMatch = userPltDefName && (plt.includes(userPltDefName) || userPltDefName.includes(plt) || def.includes(userPltDefName) || userPltDefName.includes(def));

      if (!isClientMatch && !isPhoneMatch && !isEmailMatch && !isNameMatch) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view case details applicable to you.' });
      }
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch case details.' });
  }
};

// Create Project (Admin & Advocate ONLY)
export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Role Authorization Check
    if (req.user?.role === 'Client') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Clients cannot initialize or create case files.'
      });
    }

    const {
      name, description, priority, deadline, finalDeadline, teamMembers,
      caseNo, referenceNumber, nextHearingDate, hearingDate,
      plaintiffName, defendantName, plaintiffEmail, defendantEmail,
      clientPhone, courtType, courtCity, caseType, clientId
    } = req.body;

    // 2. Date Validation
    const rawHearing = nextHearingDate || hearingDate;
    if (!rawHearing) {
      return res.status(400).json({
        success: false,
        message: 'Case creation failed: Hearing date is required.'
      });
    }

    const normalizedHearing = normalizeDateStr(rawHearing);
    if (!normalizedHearing) {
      return res.status(400).json({
        success: false,
        message: 'Case creation failed: Please select a valid hearing date.'
      });
    }

    const rawDeadline = finalDeadline || deadline;
    let normalizedDeadline = '';
    if (rawDeadline) {
      const parsedDeadline = normalizeDateStr(rawDeadline);
      if (!parsedDeadline) {
        return res.status(400).json({
          success: false,
          message: 'Case creation failed: Final deadline must be a valid date.'
        });
      }
      normalizedDeadline = parsedDeadline;
    }

    // 3. Duplicate Reference / Case Number Check
    const refNum = (caseNo || referenceNumber || '').trim();
    if (refNum) {
      const existing = await Project.findOne({
        $or: [
          { caseNo: refNum },
          { referenceNumber: refNum },
          { uniqueCaseId: refNum }
        ]
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Case creation failed: Case reference number '${refNum}' already exists.`
        });
      }
    }

    // 4. Advocate Resolution
    const advRes = await resolveAdvocates(teamMembers, req.user);
    if (advRes.error) {
      return res.status(400).json({ success: false, message: advRes.error });
    }

    // 5. Client Resolution
    const clientRes = await resolveClient(clientPhone, plaintiffEmail, plaintiffName, clientId);
    if (clientRes.error) {
      return res.status(400).json({ success: false, message: clientRes.error });
    }

    // Auto-generate unique case ID if refNum is missing
    const generatedCaseId = refNum || `ELD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const effectivePlaintiffName = clientRes.clientName || plaintiffName || '';
    const effectivePlaintiffEmail = clientRes.clientEmail || plaintiffEmail || '';
    const effectiveClientPhone = clientRes.clientPhone || clientPhone || '';

    // Auto-derive case title if name not explicitly provided
    let caseTitle = (name || '').trim();
    if (!caseTitle) {
      if (effectivePlaintiffName && defendantName) {
        caseTitle = `${effectivePlaintiffName} v. ${defendantName}`;
      } else if (generatedCaseId) {
        caseTitle = `Case ${generatedCaseId}`;
      } else if (description) {
        caseTitle = description.length > 35 ? description.substring(0, 32) + '...' : description;
      } else {
        caseTitle = `Litigation File (${normalizedHearing})`;
      }
    }

    // 6. Save Case File to MongoDB
    const newProject = await Project.create({
      name: caseTitle,
      uniqueCaseId: generatedCaseId,
      referenceNumber: generatedCaseId,
      caseNo: generatedCaseId,
      clientId: clientRes.clientId || '',
      advocateIds: advRes.advocateIds,
      createdBy: req.user?.id || 'system',
      createdByName: req.user?.name || 'System User',
      createdByRole: req.user?.role || 'Advocate',
      clientName: effectivePlaintiffName,
      plaintiffName: effectivePlaintiffName,
      defendantName: defendantName || '',
      plaintiffEmail: effectivePlaintiffEmail,
      defendantEmail: defendantEmail || '',
      clientPhone: effectiveClientPhone,
      courtType: courtType || 'District Court',
      courtCity: courtCity || '',
      caseType: caseType || 'Civil',
      description: description || '',
      priority: priority || 'Medium',
      status: 'Active',
      nextHearingDate: normalizedHearing,
      hearingDate: normalizedHearing,
      deadline: normalizedDeadline,
      finalDeadline: normalizedDeadline,
      progress: 0,
      teamMembers: advRes.teamMembers,
      reminder3DaySent: false,
      tasks: [],
      comments: [],
      versions: [],
      currentDocContent: '',
      activityTimeline: [{
        userName: req.user?.name || 'System',
        action: `Created litigation case file '${caseTitle}' (ID: ${generatedCaseId}).`,
        timestamp: new Date()
      }]
    });

    // 7. Dispatch Immediate Email Notice
    let emailWarning = '';
    try {
      await dispatchCaseFilingNoticeEmail(newProject, req.user?.name || 'Advocate');
    } catch (emailErr: any) {
      console.error('Error dispatching case filing notice:', emailErr);
      emailWarning = 'Case created successfully, but notification email could not be sent.';
    }

    // Audit Log
    try {
      await AuditLog.create({
        userId: req.user?.id || 'system',
        userName: req.user?.name || 'System User',
        role: req.user?.role || 'User',
        action: 'PROJECT_CREATED',
        ip: req.ip || '127.0.0.1',
        details: `Created Case: ${caseTitle} (Case ID: ${generatedCaseId})`
      });
    } catch (auditErr) {
      console.error('AuditLog creation non-fatal error:', auditErr);
    }

    return res.status(201).json({
      success: true,
      project: newProject,
      emailWarning: emailWarning || undefined,
      message: emailWarning || 'Case file created successfully.'
    });

  } catch (error: any) {
    console.error('Error creating case project:', error);
    return res.status(500).json({
      success: false,
      message: 'Case creation failed: Database operation failed. ' + (error.message || '')
    });
  }
};

// Update Project Properties (Admin & Advocate ONLY)
export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'Client') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Clients cannot edit case details.' });
    }
    const { 
      status, priority, progress, deadline, finalDeadline,
      nextHearingDate, hearingDate, caseNo, name, plaintiffName, defendantName, 
      plaintiffEmail, defendantEmail, clientPhone, courtType, courtCity, caseType, teamMembers 
    } = req.body;

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

    const rawDeadline = finalDeadline || deadline;
    if (rawDeadline !== undefined) {
      const normalizedDeadline = normalizeDateStr(rawDeadline) || '';
      updates.deadline = normalizedDeadline;
      updates.finalDeadline = normalizedDeadline;
      if (normalizedDeadline !== project.deadline) {
        actions.push(`adjusted deadline to ${normalizedDeadline}`);
      }
    }

    const rawHearing = nextHearingDate || hearingDate;
    if (rawHearing !== undefined) {
      const normalizedHearing = normalizeDateStr(rawHearing);
      if (normalizedHearing && normalizedHearing !== project.nextHearingDate) {
        updates.nextHearingDate = normalizedHearing;
        updates.hearingDate = normalizedHearing;
        // Reschedule 3-day reminder for the updated hearing date
        updates.reminder3DaySent = false;
        updates.reminder3DaySentAt = null;
        actions.push(`updated hearing date to '${normalizedHearing}' (reminder rescheduled)`);
      }
    }

    if (caseNo !== undefined) {
      updates.caseNo = caseNo;
      updates.referenceNumber = caseNo;
    }
    if (name !== undefined) updates.name = name;
    if (plaintiffName !== undefined) updates.plaintiffName = plaintiffName;
    if (defendantName !== undefined) updates.defendantName = defendantName;
    if (plaintiffEmail !== undefined) updates.plaintiffEmail = plaintiffEmail;
    if (defendantEmail !== undefined) updates.defendantEmail = defendantEmail;
    if (clientPhone !== undefined) updates.clientPhone = clientPhone;
    if (courtType !== undefined) updates.courtType = courtType;
    if (courtCity !== undefined) updates.courtCity = courtCity;
    if (caseType !== undefined) updates.caseType = caseType;

    if (teamMembers !== undefined) {
      const advRes = await resolveAdvocates(teamMembers, req.user);
      if (advRes.error) {
        return res.status(400).json({ success: false, message: advRes.error });
      }
      updates.advocateIds = advRes.advocateIds;
      updates.teamMembers = advRes.teamMembers;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ success: true, project });
    }

    const timelineUpdates = actions.map(action => ({
      userName: req.user?.name || 'User',
      action,
      timestamp: new Date()
    }));

    const updatePayload: any = { ...updates };
    if (timelineUpdates.length > 0) {
      updatePayload.$push = { activityTimeline: { $each: timelineUpdates } };
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updatePayload, { new: true });

    return res.status(200).json({ success: true, project: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update case: ' + error.message });
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
      deadline: normalizeDateStr(deadline) || deadline || ''
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

// Add Comment
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

// Save draft document
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
