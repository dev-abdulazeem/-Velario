import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from './emailController.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = uuidv4();

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, is_verified',
      [email, passwordHash, fullName, 'customer', verificationToken]
    );

    const user = result.rows[0];

    // Send verification email
    await sendVerificationEmail(email, fullName, verificationToken);

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

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error verifying email' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
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

    const result = await pool.query(
      'SELECT id, full_name FROM users WHERE email = $1',
      [email]
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

    await sendPasswordResetEmail(email, user.full_name, resetToken);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

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