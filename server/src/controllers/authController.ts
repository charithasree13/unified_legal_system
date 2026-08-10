import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User, Advocate, AuditLog, RefreshToken } from '../models/Schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretlegalrefreshjwttokenkey67890!';

const createToken = (payload: any, secret: any, expires: any) => {
  return jwt.sign(payload, secret, { expiresIn: expires });
};

// ------------------------------------------------------------------
// 1. REGISTER USER / ADVOCATE WITH PASSWORD
// ------------------------------------------------------------------
export const register = async (req: Request, res: Response) => {
  const { name, phone, email, password, confirmPassword, role, enrollmentNumber } = req.body;

  try {
    if (role === 'Admin' || role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Legal Administrator accounts cannot be self-registered. Please contact system management.'
      });
    }

    const assignedRole = role === 'Advocate' ? 'Advocate' : 'Client';

    // Basic input validations
    if (assignedRole === 'Advocate') {
      if (!name || !phone || !email || !password || !confirmPassword || !enrollmentNumber) {
        return res.status(400).json({ success: false, message: 'All advocate fields including Bar Council Enrollment Number are required.' });
      }
    } else {
      if (!name || !phone || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Name, phone number, and passwords are required.' });
      }
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' });
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    // Check duplicate account
    const existingUser = await User.findOne({
      $or: [{ phone: cleanPhone }, ...(email ? [{ email: email.trim().toLowerCase() }] : [])]
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this phone number or email already exists.' });
    }

    // Hash password and save verified account
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : undefined,
      password: hashedPassword,
      role: assignedRole,
      enrollmentNumber: assignedRole === 'Advocate' ? enrollmentNumber : undefined,
      isVerified: true
    });

    await AuditLog.create({
      userId: newUser._id,
      userName: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      ip: req.ip || '127.0.0.1',
      details: `New ${assignedRole} account created successfully.`
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now sign in with your credentials.',
      userId: newUser._id,
      email: newUser.email,
      phone: newUser.phone
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// ------------------------------------------------------------------
// 2. LOGIN WITH EMAIL / PHONE + PASSWORD
// ------------------------------------------------------------------
export const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Phone number and password are required.' });
    }

    const cleanInput = email.trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    const user = await User.findOne({
      $or: [
        { email: cleanInput.toLowerCase() },
        { phone: cleanInput },
        ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits.slice(-10) }] : [])
      ]
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const tokenPayload = { id: user._id, email: user.email, role: user.role, name: user.name, phone: user.phone };
    const accessToken = createToken(tokenPayload, JWT_SECRET, rememberMe ? '30d' : '1h');
    const refreshTokenStr = createToken(tokenPayload, JWT_REFRESH_SECRET, '30d');

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      ip: req.ip || '127.0.0.1',
      details: `Successful sign-in via password. RememberMe: ${rememberMe ? 'Yes' : 'No'}`
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        enrollmentNumber: (user as any).enrollmentNumber,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

// ------------------------------------------------------------------
// 3. FORGOT / RESET PASSWORD HANDLER
// ------------------------------------------------------------------
export const forgotPassword = async (req: Request, res: Response) => {
  const { identifier, email, phone, newPassword, confirmPassword } = req.body;
  try {
    const cleanInput = (identifier || email || phone || '').trim().toLowerCase();
    if (!cleanInput) {
      return res.status(400).json({ success: false, message: 'Please provide your registered Email Address or Phone Number.' });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanDigits = cleanInput.replace(/\D/g, '');
    const user = await User.findOne({
      $or: [
        { email: cleanInput },
        { phone: cleanInput },
        ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits.slice(-10) }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this Email or Phone number.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'PASSWORD_RESET',
      ip: req.ip || '127.0.0.1',
      details: 'Password updated successfully.'
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

export const resetPassword = forgotPassword;

// Dummy placeholders for backward compatibility
export const sendOtp = register;
export const verifyOtp = login;
export const resendOtp = register;

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: tokenStr } = req.body;
  if (!tokenStr) {
    return res.status(400).json({ success: false, message: 'Refresh token required.' });
  }

  try {
    const savedToken = await RefreshToken.findOne({ token: tokenStr, revoked: false });
    if (!savedToken) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked or invalid.' });
    }

    const decoded: any = jwt.verify(tokenStr, JWT_REFRESH_SECRET);
    const tokenPayload = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name, phone: decoded.phone };
    
    const newAccessToken = createToken(tokenPayload, JWT_SECRET, '1h');
    const newRefreshToken = createToken(tokenPayload, JWT_REFRESH_SECRET, '30d');

    await RefreshToken.findByIdAndUpdate(savedToken._id, { revoked: true });
    await RefreshToken.create({
      userId: decoded.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token session.' });
  }
};

// ------------------------------------------------------------------
// 4. GOOGLE AUTHENTICATION (ID TOKEN VERIFICATION)
// ------------------------------------------------------------------
export const googleAuth = async (req: Request, res: Response) => {
  const { credential, accountType } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google authentication credential is required.' });
    }

    const normalizedRole = (accountType === 'Advocate' || accountType === 'ADVOCATE') ? 'Advocate' : 'Client';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

    let googleSub = '';
    let email = '';
    let emailVerified = false;
    let name = '';
    let picture = '';

    if (googleClientId && !googleClientId.includes('your_google_client_id_here')) {
      try {
        const client = new OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId
        });
        const payload = ticket.getPayload();
        if (!payload) {
          return res.status(401).json({ success: false, message: 'Invalid Google authentication token payload.' });
        }

        googleSub = payload.sub;
        email = payload.email ? payload.email.trim().toLowerCase() : '';
        emailVerified = payload.email_verified === true;
        name = payload.name || payload.given_name || 'Google User';
        picture = payload.picture || '';
      } catch (tokenErr: any) {
        console.error('🛡️ Google Token Verification Failure:', tokenErr.message);
        return res.status(401).json({ success: false, message: 'Invalid or unverified Google authentication credential.' });
      }
    } else {
      // Dev/Testing fallback verification when GOOGLE_CLIENT_ID is a placeholder
      try {
        const base64Url = credential.split('.')[1];
        if (!base64Url) {
          return res.status(401).json({ success: false, message: 'Invalid Google token structure.' });
        }
        const decodedJson = Buffer.from(base64Url, 'base64').toString('utf8');
        const payload = JSON.parse(decodedJson);
        if (!payload || !payload.sub) {
          return res.status(401).json({ success: false, message: 'Invalid Google token payload structure.' });
        }
        googleSub = payload.sub;
        email = payload.email ? payload.email.trim().toLowerCase() : '';
        emailVerified = payload.email_verified === true;
        name = payload.name || payload.given_name || 'Google User';
        picture = payload.picture || '';
      } catch (err: any) {
        return res.status(401).json({ success: false, message: 'Invalid or malformed Google token credential.' });
      }
    }

    if (!googleSub) {
      return res.status(401).json({ success: false, message: 'Could not extract valid Google account identifier.' });
    }

    // CASE A: Existing Google account by googleSub
    let user = await User.findOne({ googleSub });

    if (user) {
      // Account type validation check
      if (user.role !== normalizedRole) {
        return res.status(400).json({
          success: false,
          message: `This Google account is registered as a ${user.role}. Please log in using the ${user.role} sign in option.`
        });
      }

      // Update safe profile image if available
      if (!user.profilePhoto && picture) {
        await User.findByIdAndUpdate(user._id, { profilePhoto: picture });
        user.profilePhoto = picture;
      }
    } else {
      // CASE B: Email conflict check (existing email/password account)
      if (email) {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please sign in with your email and password.'
          });
        }
      }

      // CASE C: Completely new account creation
      const isAdvocate = normalizedRole === 'Advocate';
      user = await User.create({
        name,
        email: email || undefined,
        googleSub,
        authProvider: 'GOOGLE',
        emailVerified,
        role: normalizedRole,
        profilePhoto: picture,
        isVerified: !isAdvocate // User is auto-verified, Advocate requires admin approval
      });

      if (isAdvocate) {
        const existingAdv = await Advocate.findOne({ email });
        if (!existingAdv) {
          await Advocate.create({
            name,
            email: email || `${googleSub}@google.user`,
            googleSub,
            authProvider: 'GOOGLE',
            emailVerified,
            photo: picture,
            isVerified: false,
            availability: 'Available'
          });
        }
      }

      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        role: user.role,
        action: 'GOOGLE_USER_REGISTERED',
        ip: req.ip || '127.0.0.1',
        details: `New ${normalizedRole} account registered via Continue with Google.`
      });
    }

    // Generate JWT Tokens using existing application secrets & payload structure
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    };
    const accessToken = createToken(tokenPayload, JWT_SECRET, '1h');
    const refreshTokenStr = createToken(tokenPayload, JWT_REFRESH_SECRET, '30d');

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenStr,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'GOOGLE_USER_LOGIN',
      ip: req.ip || '127.0.0.1',
      details: `Successful sign-in via Continue with Google (${normalizedRole}).`
    });

    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        enrollmentNumber: (user as any).enrollmentNumber || '',
        profilePhoto: user.profilePhoto || picture
      }
    });
  } catch (error: any) {
    console.error('❌ Google Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Google authentication server error.'
    });
  }
};
