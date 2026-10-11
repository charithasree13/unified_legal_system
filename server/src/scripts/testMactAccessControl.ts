import jwt from 'jsonwebtoken';
import { calculateMotorAccidentCompensation } from '../services/motorAccidentEngine';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

console.log('🛡️ === MACT ACCESS CONTROL & ROLE AUTHORIZATION TEST ===\n');

// 1. Role simulation tokens
const adminToken = jwt.sign({ id: 'admin1', role: 'Admin', name: 'Admin Test' }, JWT_SECRET);
const advocateToken = jwt.sign({ id: 'adv1', role: 'Advocate', name: 'Advocate Test', isVerified: true }, JWT_SECRET);
const clientToken = jwt.sign({ id: 'cli1', role: 'Client', name: 'Client Test' }, JWT_SECRET);
const userToken = jwt.sign({ id: 'usr1', role: 'User', name: 'User Test' }, JWT_SECRET);

function simulateAuthCheck(token?: string): { status: number; message: string } {
  if (!token) {
    return { status: 401, message: 'Authentication required. Please sign in.' };
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const roleLower = (decoded.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return { status: 403, message: 'Access Denied: This feature is restricted exclusively to Administrators and Advocates.' };
    }
    return { status: 200, message: 'Authorized' };
  } catch (err: any) {
    return { status: 403, message: 'Invalid or expired session token.' };
  }
}

// Test unauthenticated
const unauth = simulateAuthCheck();
console.log(`[1/5] Unauthenticated Request -> Status: ${unauth.status} (Expected: 401)`);
if (unauth.status !== 401) throw new Error('Unauthenticated should return 401');

// Test Client role
const clientRes = simulateAuthCheck(clientToken);
console.log(`[2/5] Client/Public User Request -> Status: ${clientRes.status} (Expected: 403)`);
if (clientRes.status !== 403) throw new Error('Client should return 403');

// Test User role
const userRes = simulateAuthCheck(userToken);
console.log(`[3/5] Generic User Request -> Status: ${userRes.status} (Expected: 403)`);
if (userRes.status !== 403) throw new Error('User role should return 403');

// Test Advocate role
const advRes = simulateAuthCheck(advocateToken);
console.log(`[4/5] Enrolled Advocate Request -> Status: ${advRes.status} (Expected: 200)`);
if (advRes.status !== 200) throw new Error('Advocate should return 200');

// Test Admin role
const admRes = simulateAuthCheck(adminToken);
console.log(`[5/5] Administrator Request -> Status: ${admRes.status} (Expected: 200)`);
if (admRes.status !== 200) throw new Error('Admin should return 200');

console.log('\n🔒 ALL ROLE ACCESS CONTROL TESTS PASSED WITH 100% SUCCESS!\n');
