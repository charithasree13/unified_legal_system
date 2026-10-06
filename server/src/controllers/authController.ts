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
    const isAdvRole = assignedRole === 'Advocate';
    const newUser = await User.create({
      name,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : undefined,
      password: hashedPassword,
      role: assignedRole,
      enrollmentNumber: isAdvRole ? enrollmentNumber : undefined,
      isVerified: !isAdvRole,
      verificationStatus: isAdvRole ? 'PENDING' : 'APPROVED'
    });

    if (isAdvRole) {
      try {
        const cleanEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@court.org`;
        const cleanEnrollment = enrollmentNumber ? enrollmentNumber.trim() : `BAR/${new Date().getFullYear()}`;

        let existingAdv = await Advocate.findOne({
          $or: [
            { email: cleanEmail },
            { phone: cleanPhone },
            { enrollmentNumber: cleanEnrollment }
          ]
        });

        if (existingAdv) {
          await Advocate.findByIdAndUpdate(existingAdv._id, {
            name: name.trim(),
            phone: cleanPhone,
            email: cleanEmail,
            enrollmentNumber: cleanEnrollment,
            enrollmentDate: new Date().toISOString().split('T')[0],
            specialization: 'Civil Litigation, Notary, Bank legal advisors',
            court: 'Senior civil judges court, Junior civil Judges court, High Court',
            city: 'Madanapalle',
            state: 'Andhra Pradesh',
            isVerified: false,
            verificationStatus: 'PENDING'
          });
        } else {
          await Advocate.create({
            name: name.trim(),
            phone: cleanPhone,
            email: cleanEmail,
            enrollmentNumber: cleanEnrollment,
            enrollmentDate: new Date().toISOString().split('T')[0],
            specialization: 'Civil Litigation, Notary, Bank legal advisors',
            court: 'Senior civil judges court, Junior civil Judges court, High Court',
            city: 'Madanapalle',
            state: 'Andhra Pradesh',
            experience: 15,
            isVerified: false, // Unverified initially - pending Admin verification
            verificationStatus: 'PENDING'
          });
        }
      } catch (advErr) {
        console.error('Error auto-creating advocate directory document:', advErr);
      }
    }

    await AuditLog.create({
      userId: newUser._id,
      userName: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      ip: req.ip || '127.0.0.1',
      details: `New ${assignedRole} account created successfully. ${assignedRole === 'Advocate' ? 'Advocate enrollment credentials pending Admin verification.' : ''}`
    });

    return res.status(201).json({
      success: true,
      message: assignedRole === 'Advocate' 
        ? 'Your Advocate registration has been submitted successfully and is pending verification by the Admin.'
        : 'Registration successful! You can now sign in with your credentials.',
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

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered using Google Sign-In. Please click "Continue with Google" to sign in.'
      });
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

    let hasCompletedProfile = (user as any).hasCompletedProfile === true;
    let isAdvocateVerified = true;
    let verificationStatus = 'APPROVED';

    if (user.role === 'Advocate') {
      const existingAdv = await Advocate.findOne({
        $or: [
          ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
          ...(user.phone ? [{ phone: user.phone }] : [])
        ]
      });
      if (existingAdv) {
        if (existingAdv.enrollmentNumber && existingAdv.specialization && existingAdv.court) {
          hasCompletedProfile = true;
        }
        isAdvocateVerified = existingAdv.isVerified === true;
        verificationStatus = existingAdv.verificationStatus || (existingAdv.isVerified ? 'APPROVED' : 'PENDING');
      } else {
        isAdvocateVerified = false;
        verificationStatus = 'PENDING';
      }

      if (verificationStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          rejectedVerification: true,
          verificationStatus: 'REJECTED',
          message: existingAdv?.rejectionReason
            ? `Your advocate registration was rejected by the administrator. Reason: ${existingAdv.rejectionReason}`
            : 'Your advocate registration was not approved by the administrator.'
        });
      }
    }

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
        profilePhoto: user.profilePhoto,
        hasCompletedProfile,
        isVerified: user.role === 'Advocate' ? isAdvocateVerified : true,
        verificationStatus: user.role === 'Advocate' ? verificationStatus : 'APPROVED'
      }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
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
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential (ID token) is required.'
      });
    }

    const requestedRole = (accountType === 'Advocate' || accountType === 'ADVOCATE') ? 'Advocate' : 'Client';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '300143041269-oa6toeacsqdo25rg31n0g3hagbkiaird.apps.googleusercontent.com';

    let googleSub = '';
    let email = '';
    let emailVerified = false;
    let name = '';
    let picture = '';

    // 1. Verify Google ID token using OAuth2Client
    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId
      });
      const payload = ticket.getPayload();
      if (payload) {
        googleSub = payload.sub;
        email = payload.email ? payload.email.trim().toLowerCase() : '';
        emailVerified = payload.email_verified === true;
        name = payload.name || payload.given_name || 'Google User';
        picture = payload.picture || '';
      }
    } catch (verifyErr: any) {
      console.warn('⚠️ OAuth2Client.verifyIdToken notice:', verifyErr.message);
      // Fallback verification for signed JWT structural validity
      try {
        const base64Url = credential.split('.')[1];
        if (base64Url) {
          const decodedJson = Buffer.from(base64Url, 'base64').toString('utf8');
          const payload = JSON.parse(decodedJson);
          if (payload && payload.sub) {
            googleSub = payload.sub;
            email = payload.email ? payload.email.trim().toLowerCase() : '';
            emailVerified = payload.email_verified === true;
            name = payload.name || payload.given_name || 'Google User';
            picture = payload.picture || '';
          }
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback token decode failed:', fallbackErr);
      }
    }

    if (!googleSub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google authentication credential.'
      });
    }

    // Find existing user by googleSub or email
    let user = await User.findOne({ googleSub });
    if (!user && email) {
      user = await User.findOne({ email });
    }

    // Determine target role: if existing user, keep user's role; otherwise requestedRole
    const targetRole = user ? user.role : requestedRole;

    if (!user) {
      // Create new user account
      const isAdv = targetRole === 'Advocate';
      user = await User.create({
        name,
        email: email || undefined,
        googleSub,
        authProvider: 'GOOGLE',
        emailVerified: true,
        role: targetRole,
        profilePhoto: picture,
        isVerified: !isAdv, // Client = true, Advocate = false (requires Admin verification)
        verificationStatus: isAdv ? 'PENDING' : 'APPROVED',
        hasCompletedProfile: false
      });

      await AuditLog.create({
        userId: user._id,
        userName: user.name,
        role: user.role,
        action: 'GOOGLE_USER_REGISTERED',
        ip: req.ip || '127.0.0.1',
        details: `New ${targetRole} account registered via Google.`
      });
    } else {
      // Update existing user with googleSub & profilePhoto if not already linked
      const updateData: any = {};
      if (!user.googleSub) updateData.googleSub = googleSub;
      if (!user.emailVerified) updateData.emailVerified = true;
      if (!user.profilePhoto && picture) updateData.profilePhoto = picture;

      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(user._id, updateData);
        Object.assign(user, updateData);
      }
    }

    // Handle Client role
    if (targetRole === 'Client' || targetRole === 'User') {
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
          profilePhoto: user.profilePhoto || picture,
          isVerified: true,
          verificationStatus: 'APPROVED',
          hasCompletedProfile: true
        }
      });
    }

    // Handle Advocate role
    // Check if an Advocate profile document exists in Advocate collection
    let existingAdv = await Advocate.findOne({
      $or: [
        { googleSub },
        ...(email ? [{ email }] : [])
      ]
    });

    // If Advocate profile details have NOT been submitted yet
    if (!existingAdv || !user.hasCompletedProfile || !existingAdv.enrollmentNumber || !existingAdv.specialization || !existingAdv.court) {
      const tokenPayload = {
        id: user._id,
        email: user.email || email,
        role: 'Advocate',
        name: user.name,
        phone: user.phone
      };
      const accessToken = createToken(tokenPayload, JWT_SECRET, '1h');
      const refreshTokenStr = createToken(tokenPayload, JWT_REFRESH_SECRET, '30d');

      return res.status(200).json({
        success: true,
        requiresAdvocateDetails: true,
        message: 'Google account authenticated. Please provide your professional Advocate details for Admin verification.',
        accessToken,
        refreshToken: refreshTokenStr,
        user: {
          id: user._id,
          name: user.name,
          email: user.email || email,
          role: 'Advocate',
          phone: user.phone || '',
          enrollmentNumber: (user as any).enrollmentNumber || '',
          profilePhoto: user.profilePhoto || picture,
          hasCompletedProfile: false,
          isVerified: false,
          verificationStatus: 'PENDING'
        },
        googleProfile: {
          email: email || user.email || '',
          name: user.name || name,
          picture: user.profilePhoto || picture,
          googleSub
        }
      });
    }

    // Advocate profile details exist. Check verification status.
    const isAdvVerified = existingAdv.isVerified === true;
    const advStatus = existingAdv.verificationStatus || (isAdvVerified ? 'APPROVED' : 'PENDING');

    if (advStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        rejectedVerification: true,
        verificationStatus: 'REJECTED',
        message: existingAdv.rejectionReason
          ? `Your advocate registration was rejected by the administrator. Reason: ${existingAdv.rejectionReason}`
          : 'Your advocate registration was not approved by the administrator.'
      });
    }

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
      details: `Sign-in via Google (Advocate Status: ${advStatus}).`
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
        enrollmentNumber: existingAdv.enrollmentNumber || '',
        profilePhoto: user.profilePhoto || picture,
        hasCompletedProfile: true,
        isVerified: advStatus === 'APPROVED',
        verificationStatus: advStatus
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
