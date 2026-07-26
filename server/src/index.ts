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
import { authenticateToken, requireAdmin, csrfProtection, AuthenticatedRequest } from './middleware/auth';
import * as authCtrl from './controllers/authController';
import * as advCtrl from './controllers/advocateController';
import * as docCtrl from './controllers/documentController';
import * as projCtrl from './controllers/projectController';
import * as courtFeeCtrl from './controllers/courtFeeController';
import { seedCourtFeeDatabase } from './seed/courtFeeSeedData';
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

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect database
connectDB().then(() => {
  seedCourtFeeDatabase();
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
app.post('/api/auth/forgot-password', authCtrl.forgotPassword);
app.post('/api/auth/reset-password', authCtrl.resetPassword);

// ADVOCATE DIRECTORY
app.post('/api/advocates', authenticateToken, requireAdmin, advCtrl.addAdvocate);
app.get('/api/advocates', authenticateToken, advCtrl.getAdvocates);
app.get('/api/advocates/:id', authenticateToken, advCtrl.getAdvocateById);
app.put('/api/advocates/:id/verify', authenticateToken, requireAdmin, advCtrl.verifyAdvocate);

// DOCUMENTS / REPOSITORY
app.post('/api/documents/judgements', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadJudgement);
app.get('/api/documents/judgements', authenticateToken, docCtrl.getJudgements);
app.delete('/api/documents/judgements/:id', authenticateToken, requireAdmin, docCtrl.deleteJudgement);
app.post('/api/documents/laws', authenticateToken, requireAdmin, docCtrl.upload.single('file'), docCtrl.uploadLaw);
app.get('/api/documents/laws', authenticateToken, docCtrl.getLaws);
app.delete('/api/documents/laws/:id', authenticateToken, requireAdmin, docCtrl.deleteLaw);

// CASE PROJECTS & COLLABORATION
app.get('/api/projects', authenticateToken, projCtrl.getProjects);
app.get('/api/projects/:id', authenticateToken, projCtrl.getProjectById);
app.post('/api/projects', authenticateToken, projCtrl.createProject);
app.put('/api/projects/:id', authenticateToken, projCtrl.updateProject);
app.delete('/api/projects/:id', authenticateToken, projCtrl.deleteProject);
app.post('/api/projects/:id/tasks', authenticateToken, projCtrl.addTask);
app.put('/api/projects/:id/tasks', authenticateToken, projCtrl.updateTaskStatus);
app.post('/api/projects/:id/comments', authenticateToken, projCtrl.addComment);
app.post('/api/projects/:id/draft', authenticateToken, projCtrl.saveDraft);
app.post('/api/projects/:id/version', authenticateToken, projCtrl.createVersion);

// COURT FEE CALCULATOR MODULE API
app.get('/api/calculators/court-fee/metadata', courtFeeCtrl.getMetadata);
app.get('/api/calculators/court-fee/districts', courtFeeCtrl.getDistricts);
app.post('/api/calculators/court-fee/calculate', courtFeeCtrl.calculateFee);
app.get('/api/calculators/court-fee/history', authenticateToken, courtFeeCtrl.getHistory);
app.get('/api/calculators/court-fee/history/:id/pdf', authenticateToken, courtFeeCtrl.getCalculationPdf);
app.get('/api/calculators/court-fee/history/:id/csv', authenticateToken, courtFeeCtrl.getCalculationCsv);

// COURT FEE ADMIN MANAGEMENT API
app.get('/api/admin/court-fee/rules', authenticateToken, requireAdmin, courtFeeCtrl.getAdminRules);
app.post('/api/admin/court-fee/rules', authenticateToken, requireAdmin, courtFeeCtrl.createAdminRule);
app.put('/api/admin/court-fee/rules/:id/toggle', authenticateToken, requireAdmin, courtFeeCtrl.toggleAdminRule);

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

// AUDIT LOGS (Admin Only)
app.get('/api/system/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find();
    // Sort recently created logs first
    logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json({ success: true, logs: logs.slice(0, 50) }); // Limit to 50 logs
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve system audit logs.' });
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
server.listen(PORT, () => {
  console.log(`🚀 Secure Legal System API Server listening on port ${PORT}`);
});
