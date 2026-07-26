import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: 'Admin' | 'Advocate' | 'Client' | 'User';
    name: string;
    phone?: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('🛡️ JWT Verification Failure:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Enterprise CSRF validation simulator. 
  // Reads custom headers x-csrf-token and validates.
  const csrfToken = req.headers['x-csrf-token'];
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (!csrfToken || csrfToken !== 'legal-platform-csrf-token-secret') {
      return res.status(403).json({ success: false, message: 'CSRF token mismatch or missing.' });
    }
  }
  next();
};
