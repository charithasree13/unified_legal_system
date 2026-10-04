import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

import { connectDB } from './config/db';
import { handleSockets } from './sockets/chat';
import { authenticateToken, optionalAuthToken, requireAdmin, requireAdminOrAdvocate, csrfProtection, AuthenticatedRequest } from './middleware/auth';
import * as authCtrl from './controllers/authController';
import * as advCtrl from './controllers/advocateController';
import * as docCtrl from './controllers/documentController';
import * as projCtrl from './controllers/projectController';
import * as courtFeeCtrl from './controllers/courtFeeController';
import * as mappingCtrl from './controllers/sectionMappingController';
import * as reminderCtrl from './controllers/reminderController';
import * as legalTipCtrl from './controllers/legalTipController';
import * as hinduSuccessionCtrl from './controllers/hinduSuccessionController';
import * as islamicInheritanceCtrl from './controllers/islamicInheritanceController';
import * as limitationCtrl from './controllers/limitationController';
import * as noteCtrl from './controllers/noteController';
import { seedCourtFeeDatabase } from './seed/courtFeeSeedData';
import { seedSectionMappingDatabase } from './seed/sectionMappingSeedData';
import { seedLawsDatabase } from './seed/lawsSeedData';
import { seedExpandedLegalLibrary } from './seed/expandedLegalLibrarySeed';
import { startHearingReminderScheduler } from './services/hearingReminderScheduler';
import { AuditLog, User, Advocate, Judgement, Law, Project } from './models/Schemas';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading static uploads
}));
app.use(cors());
app.use(express.json());

// Express Middleware: URL Path Normalization & Court Fee Auto-Dispatcher
app.use((req, res, next) => {
  // 1. Path normalization
  const url = req.headers['x-forwarded-uri'] || req.headers['x-original-uri'] || req.originalUrl || req.url;
  if (typeof url === 'string' && url.length > 0 && !url.startsWith('/api') && !req.path.startsWith('/api')) {
    req.url = '/api' + (url.startsWith('/') ? url : '/' + url);
  }

  // 2. Intercept only explicit Court Fee POST calculation requests, avoiding non-court-fee routes like Advocates or Auth
  const currentPath = req.path || req.url || '';
  const isExcludedPath = currentPath.includes('/advocates') || currentPath.includes('/auth') || currentPath.includes('/documents') || currentPath.includes('/projects') || currentPath.includes('/notes') || currentPath.includes('/legal-tips');
  
  if (!isExcludedPath && req.method === 'POST' && req.body) {
    const isCourtFeeRoute = currentPath.includes('court-fee');
    const hasCalculationPayload = (req.body.suitValue !== undefined || req.body.claimAmount !== undefined || req.body.suitValuation !== undefined || req.body.calculatedFee !== undefined);
    
    if (isCourtFeeRoute || hasCalculationPayload) {
      return courtFeeCtrl.calculateFee(req as any, res);
    }
  }

  next();
});

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect database
connectDB().then(() => {
  seedCourtFeeDatabase();
  seedSectionMappingDatabase();
  seedLawsDatabase();
  seedExpandedLegalLibrary();
  legalTipCtrl.seedInitialLegalTips();
});

// Setup WebSocket Sockets
handleSockets(io);

// -------------------------------------------------------------
// 4. ROUTE DEFINITIONS
// -------------------------------------------------------------

// Security CSRF token endpoint (Demo placeholder)
app.get('/api/csrf-token', (req, res) => {
  return res.status(200).json({ csrfToken: 'legal-platform-csrf-token-secret' });
});

// AUTHENTICATION
app.post('/api/auth/send-otp', authCtrl.sendOtp);
app.post('/api/auth/verify-otp', authCtrl.verifyOtp);
app.post('/api/auth/resend-otp', authCtrl.resendOtp);
app.post('/api/auth/logout', authCtrl.logout);
app.post('/api/auth/refresh-token', authCtrl.refreshToken);
app.post('/api/auth/register', authCtrl.register);
app.post('/api/auth/login', authCtrl.login);
app.post('/api/auth/google', authCtrl.googleAuth);
app.post('/api/auth/forgot-password', authCtrl.forgotPassword);
app.post('/api/auth/reset-password', authCtrl.resetPassword);

// ADVOCATE DIRECTORY
app.post('/api/advocates/profile', authenticateToken, advCtrl.selfOnboardAdvocateProfile);
app.post('/advocates/profile', authenticateToken, advCtrl.selfOnboardAdvocateProfile);
app.post('/api/advocates', authenticateToken, requireAdmin, advCtrl.addAdvocate);
app.get('/api/advocates/pending', authenticateToken, requireAdmin, advCtrl.getPendingAdvocates);
app.get('/advocates/pending', authenticateToken, requireAdmin, advCtrl.getPendingAdvocates);
app.get('/api/advocates', advCtrl.getAdvocates);
app.get('/api/advocates/:id', advCtrl.getAdvocateById);
app.put('/api/advocates/:id', authenticateToken, advCtrl.updateAdvocate);
app.delete('/api/advocates/:id', authenticateToken, requireAdmin, advCtrl.deleteAdvocate);
app.put('/api/advocates/:id/verify', authenticateToken, requireAdmin, advCtrl.verifyAdvocate);

// DOCUMENTS / REPOSITORY (JUDGMENTS & BARE ACTS LEGAL LIBRARY)
app.get('/api/documents/health', authenticateToken, requireAdminOrAdvocate, docCtrl.getLegalLibraryHealth);
app.get('/api/legal/health', authenticateToken, requireAdminOrAdvocate, docCtrl.getLegalLibraryHealth);
app.post('/api/documents/ingest', authenticateToken, requireAdmin, docCtrl.triggerLegalLibraryImport);
app.post('/api/legal/ingest', authenticateToken, requireAdmin, docCtrl.triggerLegalLibraryImport);

app.post('/api/documents/judgements', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadJudgement);
app.get('/api/documents/judgements', authenticateToken, requireAdminOrAdvocate, docCtrl.getJudgements);
app.get('/api/documents/judgements/:id', authenticateToken, requireAdminOrAdvocate, docCtrl.getJudgementById);
app.delete('/api/documents/judgements/:id', authenticateToken, requireAdmin, docCtrl.deleteJudgement);
app.put('/api/documents/judgements/:id', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.updateJudgement);

// Alias routes for /api/legal/judgments
app.get('/api/legal/judgments', authenticateToken, requireAdminOrAdvocate, docCtrl.getJudgements);
app.get('/api/legal/judgments/:id', authenticateToken, requireAdminOrAdvocate, docCtrl.getJudgementById);
app.post('/api/legal/judgments', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadJudgement);
app.delete('/api/legal/judgments/:id', authenticateToken, requireAdmin, docCtrl.deleteJudgement);
app.put('/api/legal/judgments/:id', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.updateJudgement);

app.post('/api/documents/laws', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadLaw);
app.get('/api/documents/laws', authenticateToken, requireAdminOrAdvocate, docCtrl.getLaws);
app.get('/api/documents/laws/:id', authenticateToken, requireAdminOrAdvocate, docCtrl.getLawById);
app.put('/api/documents/laws/:id', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.updateLaw);
app.delete('/api/documents/laws/:id', authenticateToken, requireAdmin, docCtrl.deleteLaw);

// Alias routes for /api/legal/bare-acts
app.get('/api/legal/bare-acts', authenticateToken, requireAdminOrAdvocate, docCtrl.getLaws);
app.get('/api/legal/bare-acts/:id', authenticateToken, requireAdminOrAdvocate, docCtrl.getLawById);
app.post('/api/legal/bare-acts', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadLaw);
app.put('/api/legal/bare-acts/:id', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.updateLaw);
app.delete('/api/legal/bare-acts/:id', authenticateToken, requireAdmin, docCtrl.deleteLaw);

// CASE PROJECTS & COLLABORATION
app.get('/api/projects', authenticateToken, projCtrl.getProjects);
app.get('/api/projects/:id', authenticateToken, projCtrl.getProjectById);
app.post('/api/projects', authenticateToken, requireAdminOrAdvocate, projCtrl.createProject);
app.put('/api/projects/:id', authenticateToken, requireAdminOrAdvocate, projCtrl.updateProject);
app.delete('/api/projects/:id', authenticateToken, requireAdminOrAdvocate, projCtrl.deleteProject);
app.post('/api/projects/:id/tasks', authenticateToken, requireAdminOrAdvocate, projCtrl.addTask);
app.put('/api/projects/:id/tasks', authenticateToken, requireAdminOrAdvocate, projCtrl.updateTaskStatus);
app.post('/api/projects/:id/comments', authenticateToken, projCtrl.addComment);
app.post('/api/projects/:id/draft', authenticateToken, requireAdminOrAdvocate, projCtrl.saveDraft);
app.post('/api/projects/:id/version', authenticateToken, requireAdminOrAdvocate, projCtrl.createVersion);

// HEARING REMINDERS & SMTP TESTING API
app.post('/api/reminders/trigger', authenticateToken, requireAdminOrAdvocate, reminderCtrl.triggerReminders);
app.post('/api/reminders/test', authenticateToken, requireAdminOrAdvocate, reminderCtrl.sendTestReminder);
app.get('/api/reminders/health', authenticateToken, reminderCtrl.checkSmtpHealth);
app.get('/api/reminders/logs', authenticateToken, requireAdmin, reminderCtrl.getReminderLogs);

// DAILY LEGAL TIPS / UPDATES API (Enrolled Advocates & Admins)
app.get('/api/legal-tips', authenticateToken, requireAdminOrAdvocate, legalTipCtrl.getLegalTips);
app.get('/api/daily-legal-tips', authenticateToken, requireAdminOrAdvocate, legalTipCtrl.getLegalTips);
app.get('/legal-tips', authenticateToken, requireAdminOrAdvocate, legalTipCtrl.getLegalTips);
app.get('/daily-legal-tips', authenticateToken, requireAdminOrAdvocate, legalTipCtrl.getLegalTips);

app.post('/api/legal-tips', authenticateToken, requireAdmin, legalTipCtrl.createLegalTip);
app.post('/api/daily-legal-tips', authenticateToken, requireAdmin, legalTipCtrl.createLegalTip);
app.post('/legal-tips', authenticateToken, requireAdmin, legalTipCtrl.createLegalTip);
app.post('/daily-legal-tips', authenticateToken, requireAdmin, legalTipCtrl.createLegalTip);

app.put('/api/legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.updateLegalTip);
app.put('/api/daily-legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.updateLegalTip);
app.put('/legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.updateLegalTip);
app.put('/daily-legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.updateLegalTip);

app.delete('/api/legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.deleteLegalTip);
app.delete('/api/daily-legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.deleteLegalTip);
app.delete('/legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.deleteLegalTip);
app.delete('/daily-legal-tips/:id', authenticateToken, requireAdmin, legalTipCtrl.deleteLegalTip);

// MY PRIVATE NOTES API (Admin & Authorized Advocates ONLY)
app.get('/api/notes', authenticateToken, requireAdminOrAdvocate, noteCtrl.getNotes);
app.get('/notes', authenticateToken, requireAdminOrAdvocate, noteCtrl.getNotes);

app.post('/api/notes', authenticateToken, requireAdminOrAdvocate, noteCtrl.createNote);
app.post('/notes', authenticateToken, requireAdminOrAdvocate, noteCtrl.createNote);

app.get('/api/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.getNoteById);
app.get('/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.getNoteById);

app.put('/api/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.updateNote);
app.put('/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.updateNote);

app.delete('/api/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.deleteNote);
app.delete('/notes/:id', authenticateToken, requireAdminOrAdvocate, noteCtrl.deleteNote);



// COURT FEE CALCULATOR MODULE API & AUTO-DISPATCHER
app.get('/api/court-fee/districts', courtFeeCtrl.getDistricts);
app.get('/court-fee/districts', courtFeeCtrl.getDistricts);
app.get('/api/court-fee/metadata', courtFeeCtrl.getMetadata);
app.get('/court-fee/metadata', courtFeeCtrl.getMetadata);

app.get('/api/calculators/court-fee/metadata', courtFeeCtrl.getMetadata);
app.get('/calculators/court-fee/metadata', courtFeeCtrl.getMetadata);
app.get('/api/calculators/court-fee/districts', courtFeeCtrl.getDistricts);
app.get('/calculators/court-fee/districts', courtFeeCtrl.getDistricts);

app.get('/api/calculators/court-fee/history', authenticateToken, courtFeeCtrl.getHistory);
app.get('/calculators/court-fee/history', authenticateToken, courtFeeCtrl.getHistory);
app.get('/api/calculators/court-fee/history/:id/pdf', authenticateToken, courtFeeCtrl.getCalculationPdf);
app.get('/api/calculators/court-fee/history/:id/csv', authenticateToken, courtFeeCtrl.getCalculationCsv);

app.all('/api/court-fee/calculate', optionalAuthToken, courtFeeCtrl.calculateFee);
app.all('/court-fee/calculate', optionalAuthToken, courtFeeCtrl.calculateFee);
app.all('/api/calculators/court-fee/calculate', optionalAuthToken, courtFeeCtrl.calculateFee);
app.all('/calculators/court-fee/calculate', optionalAuthToken, courtFeeCtrl.calculateFee);

// HINDU SUCCESSION CALCULATOR API (Protected: Enrolled Advocates & Admins only)
app.post('/api/calculators/hindu-succession/calculate', authenticateToken, requireAdminOrAdvocate, hinduSuccessionCtrl.calculateSuccession);
app.post('/calculators/hindu-succession/calculate', authenticateToken, requireAdminOrAdvocate, hinduSuccessionCtrl.calculateSuccession);
app.post('/api/hindu-succession/calculate', authenticateToken, requireAdminOrAdvocate, hinduSuccessionCtrl.calculateSuccession);
app.post('/hindu-succession/calculate', authenticateToken, requireAdminOrAdvocate, hinduSuccessionCtrl.calculateSuccession);

// ISLAMIC INHERITANCE CALCULATOR API (Protected: Enrolled Advocates & Admins only)
app.post('/api/calculators/islamic-inheritance/calculate', authenticateToken, requireAdminOrAdvocate, islamicInheritanceCtrl.calculateInheritance);
app.post('/calculators/islamic-inheritance/calculate', authenticateToken, requireAdminOrAdvocate, islamicInheritanceCtrl.calculateInheritance);
app.post('/api/islamic-inheritance/calculate', authenticateToken, requireAdminOrAdvocate, islamicInheritanceCtrl.calculateInheritance);
app.post('/islamic-inheritance/calculate', authenticateToken, requireAdminOrAdvocate, islamicInheritanceCtrl.calculateInheritance);

// LIMITATION ACT CALCULATOR API (Protected: Enrolled Advocates & Admins only)
app.get('/api/calculators/limitation/articles', authenticateToken, requireAdminOrAdvocate, limitationCtrl.getArticles);
app.get('/calculators/limitation/articles', authenticateToken, requireAdminOrAdvocate, limitationCtrl.getArticles);
app.get('/api/calculators/limitation/articles/:id', authenticateToken, requireAdminOrAdvocate, limitationCtrl.getArticleById);
app.get('/calculators/limitation/articles/:id', authenticateToken, requireAdminOrAdvocate, limitationCtrl.getArticleById);
app.post('/api/calculators/limitation/calculate', authenticateToken, requireAdminOrAdvocate, limitationCtrl.calculate);
app.post('/calculators/limitation/calculate', authenticateToken, requireAdminOrAdvocate, limitationCtrl.calculate);
app.get('/api/calculators/limitation/validate-dataset', authenticateToken, requireAdminOrAdvocate, limitationCtrl.validateDataset);
app.post('/api/calculators/limitation/validate-dataset', authenticateToken, requireAdminOrAdvocate, limitationCtrl.validateDataset);

// Auto-dispatch POST /api requests carrying court fee parameters (Vercel rewrite fallback guard)
app.post('/api', optionalAuthToken, (req, res, next) => {
  if (req.body && (req.body.suitValue !== undefined || req.body.claimAmount !== undefined || req.body.suitValuation !== undefined)) {
    return courtFeeCtrl.calculateFee(req as any, res);
  }
  next();
});
app.post('/', optionalAuthToken, (req, res, next) => {
  if (req.body && (req.body.suitValue !== undefined || req.body.claimAmount !== undefined || req.body.suitValuation !== undefined)) {
    return courtFeeCtrl.calculateFee(req as any, res);
  }
  next();
});


// COURT FEE ADMIN MANAGEMENT API
app.get('/api/admin/court-fee/rules', authenticateToken, requireAdmin, courtFeeCtrl.getAdminRules);
app.post('/api/admin/court-fee/rules', authenticateToken, requireAdmin, courtFeeCtrl.createAdminRule);
app.put('/api/admin/court-fee/rules/:id/toggle', authenticateToken, requireAdmin, courtFeeCtrl.toggleAdminRule);

// LEGAL SECTION MAPPING API & ALIASES (Strict Access: Admin + Approved Advocate ONLY)
app.get('/api/section-mappings/health/report', authenticateToken, requireAdmin, mappingCtrl.getMappingHealthReport);
app.get('/api/section-mappings', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappings);
app.get('/api/section-mappings/:id', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappingById);
app.post('/api/section-mappings', authenticateToken, requireAdmin, mappingCtrl.createSectionMapping);
app.put('/api/section-mappings/:id', authenticateToken, requireAdmin, mappingCtrl.updateSectionMapping);
app.delete('/api/section-mappings/:id', authenticateToken, requireAdmin, mappingCtrl.deleteSectionMapping);

// Additional Protected Alias Routes
app.get('/api/legal/act-mappings', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappings);
app.get('/api/legal/act-mappings/search', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappings);
app.get('/api/legal/act-mappings/old-to-new', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappings);
app.get('/api/legal/act-mappings/new-to-old', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappings);
app.get('/api/legal/act-mappings/:id', authenticateToken, requireAdminOrAdvocate, mappingCtrl.getSectionMappingById);

// SYSTEM STATISTICS (Admin Only)
app.get('/api/system/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const advocates = await Advocate.find();
    const users = await User.find();
    const judgements = await Judgement.find();
    const laws = await Law.find();
    const projects = await Project.find();

    const pendingVerification = advocates.filter((a: any) => !a.isVerified).length;
    const activeUsers = users.length; // Active count simulator

    // Calculate collaboration activity statistics
    let totalCollaborations = 0;
    projects.forEach((p: any) => {
      totalCollaborations += (p.activityTimeline?.length || 0);
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalAdvocates: advocates.length,
        activeUsers,
        pendingVerification,
        uploadedJudgements: judgements.length,
        uploadedLaws: laws.length,
        collaborationActivities: totalCollaborations
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
});

// BACKUP DATABASE (Admin Only)
app.post('/api/system/backup', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await User.find();
    const advocates = await Advocate.find();
    const judgements = await Judgement.find();
    const laws = await Law.find();

    const backupPayload = {
      timestamp: new Date().toISOString(),
      data: { users, advocates, judgements, laws }
    };

    // Audit log backup trigger
    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: 'DATABASE_BACKUP',
      ip: req.ip || '127.0.0.1',
      details: 'Full system database manual backup executed.'
    });

    return res.status(200).json({
      success: true,
      message: 'System database backup generated successfully.',
      backupPayload
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Backup generation failed.' });
  }
});

// SERVE PRODUCTION CLIENT STATIC ASSETS (If client/dist exists)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Start Server
if (!process.env.VERCEL) {
  server.listen(PORT, async () => {
    console.log(`🚀 Secure Legal System API Server listening on port ${PORT}`);
    startHearingReminderScheduler();
    try {
      await seedExpandedLegalLibrary();
      await seedSectionMappingDatabase();
    } catch (err) {
      console.error('Legal library seed startup error:', err);
    }
  });
}

export default app;
