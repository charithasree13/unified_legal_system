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
  const { name, phone, email, password, confirmPassword, role, enrollmentYear } = req.body;

  try {
    // 1. Basic validation
    if (!name || !phone || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (role === 'Admin' || role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Legal Administrator accounts cannot be self-registered. Please contact system management.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Phone validation (simple 10-digit check)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Strong password check (min 8 chars, one uppercase, one number, one special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, containing uppercase, lowercase, numbers, and special symbols.'
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // 3. Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Simulated OTP
    
    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      enrollmentYear: role === 'Admin' ? enrollmentYear : undefined,
      isVerified: false,
      otp: mockOtp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
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
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. Please verify your OTP code first.',
        requiresVerification: true,
        email: user.email,
        otp: user.otp // Return the verification OTP so they can easily enter it
      });
    }

    // Generate tokens
    const tokenPayload = { id: user._id, email: user.email, role: user.role, name: user.name };
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
