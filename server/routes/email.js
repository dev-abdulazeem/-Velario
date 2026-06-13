import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await pool.query('SELECT id FROM subscribers WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      await pool.query('UPDATE subscribers SET is_active = true WHERE email = $1', [email]);
      return res.json({ message: 'You are already subscribed. Welcome back!' });
    }

    await pool.query('INSERT INTO subscribers (email) VALUES ($1)', [email]);

    res.status(201).json({ message: 'Successfully subscribed to Velario updates!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await pool.query('UPDATE subscribers SET is_active = false WHERE email = $1', [email]);

    res.json({ message: 'You have been unsubscribed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;