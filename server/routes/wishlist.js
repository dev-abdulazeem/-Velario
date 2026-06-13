import express from 'express'
import { authenticate } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = express.Router()

// GET /api/wishlist — Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, w.created_at as added_at
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/wishlist — Add to wishlist
router.post('/', authenticate, async (req, res) => {
  const { productId } = req.body
  try {
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, productId]
    )
    res.json({ message: 'Added to wishlist' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/wishlist/:productId — Remove from wishlist
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    )
    res.json({ message: 'Removed from wishlist' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/wishlist/check/:productId — Check if product is wishlisted
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    )
    res.json({ isWishlisted: result.rows.length > 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router