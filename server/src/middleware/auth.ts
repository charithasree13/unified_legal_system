import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Advocate } from '../models/Schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: 'Admin' | 'Advocate' | 'Client' | 'User';
    name: string;
    phone?: string;
    googleSub?: string;
    isVerified?: boolean;
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

export const optionalAuthToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch (error: any) {
      // Ignored for optional auth
    }
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const roleLower = (req.user?.role || '').toLowerCase();
  if (!req.user || roleLower !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

export const requireAdminOrAdvocate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in to access this feature.' });
  }

  const roleLower = (req.user.role || '').toLowerCase();
  if (roleLower !== 'admin' && roleLower !== 'advocate') {
    return res.status(403).json({ success: false, message: 'Access Denied: This feature is restricted exclusively to Administrators and Advocates.' });
  }

  if (roleLower === 'advocate') {
    try {
      let isVerified = req.user.isVerified === true;
      
      if (!isVerified) {
        const dbUser = await User.findById(req.user.id);
        if (dbUser && (dbUser.isVerified === true || dbUser.verificationStatus === 'APPROVED')) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        const dbAdv = await Advocate.findOne({
          $or: [
            ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : []),
            ...(req.user.phone ? [{ phone: req.user.phone }] : [])
          ]
        });
        if (dbAdv && (dbAdv.isVerified === true || dbAdv.verificationStatus === 'APPROVED')) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Your Advocate account is pending Admin verification. Access to the Old Acts → New Acts Converter is restricted until your account is approved by an Admin.'
        });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Authorization verification failed.' });
    }
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
