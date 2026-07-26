import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
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
connectDB();

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
app.post('/api/auth/register', authCtrl.register);
app.post('/api/auth/verify-otp', authCtrl.verifyOtp);
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

// COURT FEE CALCULATOR API
// CLF (Century Law Firm) Calculator aligned — verified anchor points:
// Delhi: Rs 100 → Rs 10 | Rs 3,00,000 → Rs 5,272 | Rs 5,00,000 → Rs 7,224
app.post('/api/calculators/court-fee', authenticateToken, (req, res) => {
  const { suitValue, courtType, state } = req.body;
  
  if (!suitValue || isNaN(Number(suitValue))) {
    return res.status(400).json({ success: false, message: 'Invalid Suit Value provided.' });
  }

  const value = Number(suitValue);
  let fee = 0;
  let warning: string | null = null;
  const breakdown: string[] = [];

  // Pecuniary Jurisdiction Warnings for Civil Subordinate Courts
  if (courtType === 'Junior civil Judges court' && value > 500000) {
    warning = 'Pecuniary jurisdiction may be exceeded for Junior Civil Judges Court (limit ₹5,00,000). Consider Senior Civil Court.';
  } else if (courtType === 'Senior civil judges court' && value > 2000000) {
    warning = 'Pecuniary jurisdiction may be exceeded for Senior Civil Judges Court (limit ₹20,00,000). Consider District Court / High Court.';
  }

  // --- COURT TYPE OVERRIDES (state-independent) ---

  // 1. DRT (Debt Recovery Tribunal)
  if (courtType === 'DRT') {
    if (value <= 1000000) {
      fee = 12000;
      breakdown.push('DRT: Flat fee of ₹12,000 for debt recovery suits up to ₹10 Lakhs.');
    } else {
      const extraLakhs = Math.ceil((value - 1000000) / 100000);
      fee = 12000 + extraLakhs * 1000;
      if (fee > 150000) {
        fee = 150000;
        breakdown.push('DRT fee: ₹12,000 base + ₹1,000 per additional Lakh, capped at ₹1,50,000.');
      } else {
        breakdown.push(`DRT fee: ₹12,000 base + ₹1,000 × ${extraLakhs} additional Lakhs.`);
      }
    }
  }
  // 2. Consumer Forum (Consumer Protection Act, 2019)
  else if (courtType === 'Consumers forum') {
    if (value <= 5000000) {
      fee = 0;
      breakdown.push('Consumer Forum (District): Free (₹0) for disputes up to ₹50 Lakhs.');
    } else if (value <= 20000000) {
      fee = 2000;
      breakdown.push('Consumer Forum (State): ₹2,000 for disputes ₹50 Lakhs to ₹2 Crore.');
    } else {
      fee = 5000;
      breakdown.push('Consumer Forum (National): ₹5,000 for disputes above ₹2 Crore.');
    }
  }
  // 3. Supreme Court
  else if (courtType === 'Supreme Court') {
    fee = 2000;
    breakdown.push('Supreme Court: Flat petition filing fee of ₹2,000.');
  }
  // 4. Criminal / Judicial Magistrate
  else if (courtType === 'Judicial magistrate of 1st class') {
    fee = 150;
    breakdown.push('Criminal Court: Nominal flat complaint fee of ₹150.');
  }
  // 5. Ad-Valorem Civil / High Court calculations by State
  else {
    const s = (state || '').trim();

    // Helper: Delhi/Central Act 1870 stepped table (CLF-verified)
    // Anchor: Rs 1,00,000 → Rs 3,320 | rate above 1L = Rs 976 per lakh
    // Verify: Rs 3,00,000 = 3,320 + 2×976 = 5,272 ✓  Rs 5,00,000 = 3,320 + 4×976 = 7,224 ✓
    const calcDelhi1870 = (v: number): number => {
      if (v <= 1000)   return Math.max(10, Math.round(v * 0.10));
      if (v <= 5000)   return Math.round(100  + (v - 1000)   * 0.05);
      if (v <= 10000)  return Math.round(300  + (v - 5000)   * 0.035);
      if (v <= 50000)  return Math.round(475  + (v - 10000)  * 0.020);
      if (v <= 100000) return Math.round(1275 + (v - 50000)  * 0.0409);
      return Math.round(3320 + ((v - 100000) / 100000) * 976);
    };

    // Helper: Maharashtra Bombay Court Fees Act 1959
    // Rs 200 per Rs 10,000 up to Rs 11L; Rs 1,200 per Rs 1L above; cap Rs 3L
    const calcMaharashtra = (v: number): number => {
      if (v <= 1000)    return 10;
      if (v <= 10000)   return Math.round(10   + (v - 1000)    * 0.02);
      if (v <= 1100000) return Math.round(190  + Math.ceil((v - 10000) / 10000) * 200);
      const base = 190 + Math.ceil((1100000 - 10000) / 10000) * 200;
      return Math.round(base + Math.ceil((v - 1100000) / 100000) * 1200);
    };

    // ---- STATE-WISE CALCULATIONS ----

    if (s === 'Maharashtra' || s === 'Goa') {
      // Maharashtra Court Fees Act, 1959 (Bombay Court Fees Act)
      fee = calcMaharashtra(value);
      if (fee > 300000) fee = 300000;
      breakdown.push('Maharashtra Court Fees Act, 1959: ₹200/₹10,000 (up to ₹11L); ₹1,200/₹1L above.');
      if (fee === 300000) breakdown.push('Maximum statutory cap of ₹3,00,000 applied.');
    }
    else if (s === 'Gujarat') {
      // Gujarat follows Bombay Court Fees Act structure with ₹3L cap
      fee = calcMaharashtra(value);
      if (fee > 300000) fee = 300000;
      breakdown.push('Gujarat Court Fees Act: ₹200/₹10,000 (up to ₹11L); ₹1,200/₹1L above; cap ₹3L.');
      if (fee === 300000) breakdown.push('Maximum statutory cap of ₹3,00,000 applied.');
    }
    else if (s === 'Karnataka') {
      // Karnataka Court-Fees and Suits Valuation Act, 1958
      if (value <= 1000)       { fee = 30;    breakdown.push('Karnataka: ₹30 minimum fee.'); }
      else if (value <= 10000) { fee = Math.round(30   + (value - 1000)   * 0.03); breakdown.push('Karnataka: ₹30 + 3% above ₹1,000.'); }
      else if (value <= 100000){ fee = Math.round(300  + (value - 10000)  * 0.025);breakdown.push('Karnataka: ₹300 + 2.5% above ₹10,000.'); }
      else if (value <= 200000){ fee = Math.round(2550 + (value - 100000) * 0.02); breakdown.push('Karnataka: ₹2,550 + 2% above ₹1,00,000.'); }
      else                     { fee = Math.round(4550 + (value - 200000) * 0.015);breakdown.push('Karnataka: ₹4,550 + 1.5% above ₹2,00,000.'); }
      if (fee > 1000000) { fee = 1000000; breakdown.push('Fee capped at Karnataka maximum of ₹10,00,000.'); }
    }
    else if (s === 'Andhra Pradesh' || s === 'Telangana') {
      // AP/TS Court Fees (amended)
      if (value <= 50000)      { fee = Math.round(value * 0.05);                   breakdown.push(`${s}: 5% up to ₹50,000.`); }
      else if (value <= 200000){ fee = Math.round(2500  + (value - 50000)   * 0.04);breakdown.push(`${s}: ₹2,500 + 4% above ₹50,000.`); }
      else if (value <= 500000){ fee = Math.round(8500  + (value - 200000)  * 0.03);breakdown.push(`${s}: ₹8,500 + 3% above ₹2,00,000.`); }
      else                     { fee = Math.round(17500 + (value - 500000)  * 0.02);breakdown.push(`${s}: ₹17,500 + 2% above ₹5,00,000.`); }
      if (fee > 3000000) { fee = 3000000; breakdown.push('Fee capped at ₹30,00,000.'); }
    }
    else if (s === 'Delhi' || s === 'Chandigarh' || s === 'Dadra and Nagar Haveli and Daman and Diu' || s === 'Lakshadweep') {
      // Court Fees Act 1870 (CLF-verified — 2012 Delhi amendment was held unconstitutional)
      fee = calcDelhi1870(value);
      breakdown.push('Court Fees Act 1870 (Delhi/UT): Stepped ad-valorem; ₹976/lakh above ₹1L (CLF-verified).');
    }
    else if (s === 'Tamil Nadu' || s === 'Puducherry') {
      // Tamil Nadu Court Fees and Suits Valuation Act, 1955
      if (value <= 5000) { fee = Math.round(value * 0.075); breakdown.push('Tamil Nadu: 7.5% on first ₹5,000.'); }
      else               { fee = Math.round(375 + (value - 5000) * 0.035); breakdown.push('Tamil Nadu: ₹375 + 3.5% above ₹5,000.'); }
      if (fee > 500000) { fee = 500000; breakdown.push('Fee capped at ₹5,00,000 (Tamil Nadu maximum).'); }
    }
    else if (s === 'Uttar Pradesh') {
      // UP Court Fees (amended)
      if (value <= 5000)       { fee = Math.round(value * 0.075);                    breakdown.push('UP: 7.5% up to ₹5,000.'); }
      else if (value <= 100000){ fee = Math.round(375  + (value - 5000)   * 0.05);   breakdown.push('UP: ₹375 + 5% above ₹5,000.'); }
      else                     { fee = Math.round(5125 + (value - 100000) * 0.04);   breakdown.push('UP: ₹5,125 + 4% above ₹1,00,000.'); }
      if (fee > 150000) { fee = 150000; breakdown.push('Fee capped at ₹1,50,000 (UP maximum).'); }
    }
    else if (s === 'Madhya Pradesh' || s === 'Chhattisgarh') {
      if (value <= 5000)       { fee = Math.round(value * 0.075);                    breakdown.push(`${s}: 7.5% up to ₹5,000.`); }
      else if (value <= 100000){ fee = Math.round(375  + (value - 5000)   * 0.05);   breakdown.push(`${s}: ₹375 + 5% above ₹5,000.`); }
      else                     { fee = Math.round(5125 + (value - 100000) * 0.0375); breakdown.push(`${s}: ₹5,125 + 3.75% above ₹1,00,000.`); }
      if (fee > 75000) { fee = 75000; breakdown.push(`Fee capped at ₹75,000 (${s} maximum).`); }
    }
    else if (s === 'Rajasthan') {
      if (value <= 5000)       { fee = Math.round(value * 0.07);                    breakdown.push('Rajasthan: 7% up to ₹5,000.'); }
      else if (value <= 100000){ fee = Math.round(350  + (value - 5000)   * 0.05);  breakdown.push('Rajasthan: ₹350 + 5% above ₹5,000.'); }
      else                     { fee = Math.round(5100 + (value - 100000) * 0.0375);breakdown.push('Rajasthan: ₹5,100 + 3.75% above ₹1,00,000.'); }
      if (fee > 200000) { fee = 200000; breakdown.push('Fee capped at ₹2,00,000 (Rajasthan maximum).'); }
    }
    else if (s === 'Kerala') {
      if (value <= 1000)       { fee = Math.round(value * 0.04);                    breakdown.push('Kerala: 4% up to ₹1,000.'); }
      else if (value <= 10000) { fee = Math.round(40   + (value - 1000)   * 0.03);  breakdown.push('Kerala: ₹40 + 3% above ₹1,000.'); }
      else if (value <= 100000){ fee = Math.round(310  + (value - 10000)  * 0.025); breakdown.push('Kerala: ₹310 + 2.5% above ₹10,000.'); }
      else                     { fee = Math.round(2560 + (value - 100000) * 0.02);  breakdown.push('Kerala: ₹2,560 + 2% above ₹1,00,000.'); }
      if (fee > 250000) { fee = 250000; breakdown.push('Fee capped at ₹2,50,000 (Kerala maximum).'); }
    }
    else if (['Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand'].includes(s)) {
      if (value <= 5000)       { fee = Math.round(value * 0.04);                    breakdown.push(`${s}: 4% up to ₹5,000.`); }
      else if (value <= 100000){ fee = Math.round(200  + (value - 5000)   * 0.03);  breakdown.push(`${s}: ₹200 + 3% above ₹5,000.`); }
      else                     { fee = Math.round(3050 + (value - 100000) * 0.02);  breakdown.push(`${s}: ₹3,050 + 2% above ₹1,00,000.`); }
      if (fee > 250000) { fee = 250000; breakdown.push(`Fee capped at ₹2,50,000 (${s} maximum).`); }
    }
    else if (s === 'Jammu and Kashmir' || s === 'Ladakh') {
      if (value <= 5000)       { fee = Math.round(value * 0.04); }
      else if (value <= 100000){ fee = Math.round(200  + (value - 5000)   * 0.03); }
      else                     { fee = Math.round(3050 + (value - 100000) * 0.02); }
      if (fee > 250000) fee = 250000;
      breakdown.push(`${s} Court Fees: Stepped ad-valorem (4%→3%→2%), capped at ₹2,50,000.`);
    }
    else if (s === 'West Bengal') {
      if (value <= 5000)       { fee = Math.round(value * 0.08);                    breakdown.push('West Bengal: 8% up to ₹5,000.'); }
      else if (value <= 50000) { fee = Math.round(400  + (value - 5000)   * 0.05);  breakdown.push('West Bengal: ₹400 + 5% above ₹5,000.'); }
      else                     { fee = Math.round(2650 + (value - 50000)  * 0.04);  breakdown.push('West Bengal: ₹2,650 + 4% above ₹50,000.'); }
      if (fee > 50000) { fee = 50000; breakdown.push('Fee capped at ₹50,000 (West Bengal maximum).'); }
    }
    else if (['Bihar', 'Jharkhand', 'Odisha'].includes(s)) {
      if (value <= 1000)       { fee = Math.round(value * 0.05); }
      else if (value <= 5000)  { fee = Math.round(50  + (value - 1000)  * 0.04); }
      else if (value <= 100000){ fee = Math.round(210 + (value - 5000)  * 0.03); }
      else                     { fee = Math.round(3060+ (value - 100000) * 0.02); }
      if (fee > 50000) fee = 50000;
      breakdown.push(`${s} Court Fees: Stepped ad-valorem, capped at ₹50,000.`);
    }
    else if (['Assam', 'Meghalaya', 'Tripura', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim', 'Andaman and Nicobar Islands'].includes(s)) {
      if (value <= 5000) { fee = Math.round(value * 0.03); }
      else               { fee = Math.round(150 + (value - 5000) * 0.02); }
      if (fee > 30000) fee = 30000;
      breakdown.push(`${s}: 3% up to ₹5,000; 2% above, capped at ₹30,000.`);
    }
    else {
      // Default: Court Fees Act 1870 central table
      fee = calcDelhi1870(value);
      breakdown.push(`${s || 'General'} Court Fees: Estimated using Court Fees Act 1870 stepped table.`);
    }

    // High Court minimum
    if (courtType === 'High Court') {
      if (fee < 1000) { fee = 1000; breakdown.push('High Court minimum filing fee of ₹1,000 applied.'); }
    } else {
      if (fee < 10) { fee = 10; breakdown.push('Minimum stamp fee of ₹10 applied.'); }
    }
  }

  return res.status(200).json({
    success: true,
    suitValue: value,
    courtType,
    state,
    calculatedFee: Math.round(fee),
    warning,
    breakdown
  });
});

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

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Secure Legal System API Server listening on port ${PORT}`);
});
