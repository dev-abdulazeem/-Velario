import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from './emailController.js';

// ─── Rate Limiting Store (in-memory) ─────────────────────────────
// In production, use Redis instead

const verificationAttempts = new Map(); // email -> { count, resetAt }

const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const checkVerificationRateLimit = (email) => {
  const now = Date.now();
  const record = verificationAttempts.get(email);

  if (!record) {
    verificationAttempts.set(email, { count: 1, resetAt: now + VERIFICATION_COOLDOWN_MS });
    return { allowed: true };
  }

  if (now > record.resetAt) {
    // Cooldown expired, reset counter
    verificationAttempts.set(email, { count: 1, resetAt: now + VERIFICATION_COOLDOWN_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_VERIFICATION_ATTEMPTS) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      message: `Too many attempts. Please wait ${Math.ceil(waitSeconds / 60)} minutes before requesting another verification email.`,
    };
  }

  record.count++;
  return { allowed: true };
};

// ─── AUTH CONTROLLERS ─────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id, is_verified FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];

      // If not verified, allow re-registration with rate limit
      if (!existing.is_verified) {
        const rateLimit = checkVerificationRateLimit(normalizedEmail);

        if (!rateLimit.allowed) {
          return res.status(429).json({ message: rateLimit.message });
        }

        // Generate new token and resend
        const newToken = uuidv4();
        await pool.query(
          'UPDATE users SET verification_token = $1 WHERE id = $2',
          [newToken, existing.id]
        );

        await sendVerificationEmail(normalizedEmail, fullName, newToken);

        return res.status(200).json({
          message: 'Verification email resent. Please check your inbox.',
          user: {
            id: existing.id,
            email: normalizedEmail,
            isVerified: false,
          },
        });
      }

      return res.status(409).json({ message: 'Email already registered and verified. Please log in.' });
    }

    // Rate limit for new registrations too
    const rateLimit = checkVerificationRateLimit(normalizedEmail);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: rateLimit.message });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = uuidv4();

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, is_verified',
      [normalizedEmail, passwordHash, fullName, 'customer', verificationToken, false]
    );

    const user = result.rows[0];

    // Send verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, fullName, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails, but warn user
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const result = await pool.query(
      'SELECT id, email, full_name, is_verified FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1',
      [user.id]
    );

    // Clear rate limit on successful verification
    verificationAttempts.delete(user.email);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error verifying email' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit check
    const rateLimit = checkVerificationRateLimit(normalizedEmail);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: rateLimit.message });
    }

    const result = await pool.query(
      'SELECT id, full_name, is_verified, verification_token FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified. Please log in.' });
    }

    // Generate new token if none exists
    const newToken = user.verification_token || uuidv4();
    
    if (!user.verification_token) {
      await pool.query(
        'UPDATE users SET verification_token = $1 WHERE id = $2',
        [newToken, user.id]
      );
    }

    await sendVerificationEmail(normalizedEmail, user.full_name, newToken);

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_verified FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // ─── ENFORCE EMAIL VERIFICATION ─────────────────────────────
    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query(
      'SELECT id, full_name FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const user = result.rows[0];
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    await sendPasswordResetEmail(normalizedEmail, user.full_name, resetToken);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, result.rows[0].id]
    );

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.full_name,
        role: req.user.role,
        isVerified: req.user.is_verified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};