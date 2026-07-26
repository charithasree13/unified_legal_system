import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuditLog } from '../models/Schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretlegalrefreshjwttokenkey67890!';

const createToken = (payload: any, secret: any, expires: any) => {
  return jwt.sign(payload, secret, { expiresIn: expires });
};

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

    // 1. Basic validation based on role
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

    // Phone validation (simple 10-digit check)
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    // Email validation if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    // Strong password check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, containing uppercase, lowercase, numbers, and special symbols.'
      });
    }

    // 2. Check if user already exists by phone or email
    const queryConditions: any[] = [{ phone: cleanPhone }];
    if (email && email.trim() !== '') {
      queryConditions.push({ email: email.trim().toLowerCase() });
    }
    const existingUser = await User.findOne({ $or: queryConditions });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this phone number or email already exists.' });
    }

    // 3. Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Simulated OTP
    
    const newUser = await User.create({
      name,
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : undefined,
      password: hashedPassword,
      role: assignedRole,
      enrollmentNumber: assignedRole === 'Advocate' ? enrollmentNumber : undefined,
      isVerified: true, // Auto-verify for seamless onboarding
      otp: mockOtp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Write audit log
    await AuditLog.create({
      userId: newUser._id,
      userName: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      ip: req.ip || '127.0.0.1',
      details: `New ${role} registration pending email OTP verification.`
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent.',
      userId: newUser._id,
      email: newUser.email,
      otp: mockOtp // Exposed in response for developer demonstration
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification OTP code.' });
    }

    // Mark user as verified
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      otp: null,
      otpExpires: null
    });

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'EMAIL_VERIFIED',
      ip: req.ip || '127.0.0.1',
      details: 'Account successfully verified via OTP.'
    });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now log in.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};

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
        ...(cleanDigits.length === 10 ? [{ phone: cleanDigits }] : [])
      ]
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate tokens
    const tokenPayload = { id: user._id, email: user.email, role: user.role, name: user.name, phone: user.phone };
    const accessToken = createToken(tokenPayload, JWT_SECRET, rememberMe ? '30d' : '1h');
    const refreshToken = createToken(tokenPayload, JWT_REFRESH_SECRET, '30d');

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      ip: req.ip || '127.0.0.1',
      details: `Successful sign-in. RememberMe: ${rememberMe ? 'Yes' : 'No'}`
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        enrollmentNumber: (user as any).enrollmentNumber,
        profilePhoto: user.profilePhoto,
        enrollmentYear: user.enrollmentYear
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address.' });
    }

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.findByIdAndUpdate(user._id, {
      otp: mockOtp,
      otpExpires: new Date(Date.now() + 15 * 60 * 1000)
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP code sent to your email.',
      otp: mockOtp // Exposed in API response for demo
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to request password reset.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password, confirmPassword } = req.body;
  try {
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset OTP code.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      otp: null,
      otpExpires: null
    });

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action: 'PASSWORD_RESET',
      ip: req.ip || '127.0.0.1',
      details: 'Password was successfully reset using OTP verification.'
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};
