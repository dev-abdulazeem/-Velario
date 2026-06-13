import express from 'express'
import { authenticate } from '../middleware/auth.js'
import pool from '../config/database.js'
import { sendPaymentConfirmation } from '../controllers/emailController.js'

const router = express.Router()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = 'https://api.paystack.co'

// Debug: Check if key exists
console.log('🔑 Paystack Secret Key exists:', !!PAYSTACK_SECRET)

// GET /api/payments/initialize — Initialize Paystack transaction
router.post('/initialize', authenticate, async (req, res) => {
  const { email, amount, orderId } = req.body

  if (!PAYSTACK_SECRET) {
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    const payload = {
      email,
      amount: Math.round(amount * 100),
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      metadata: {
        order_id: orderId,
        user_id: req.user.id,
      },
    }

    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Payment initialization failed' })
    }

    await pool.query(
      'UPDATE orders SET payment_ref = $1, payment_status = $2 WHERE id = $3',
      [data.data.reference, 'pending', orderId]
    )

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (err) {
    console.error('Payment init error:', err)
    res.status(500).json({ error: 'Payment initialization failed' })
  }
})

// GET /api/payments/verify/:reference — Verify Paystack transaction
router.get('/verify/:reference', authenticate, async (req, res) => {
  const { reference } = req.params

  if (!PAYSTACK_SECRET) {
    return res.status(500).json({ error: 'Payment service not configured' })
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    })

    const data = await response.json()

    if (!data.status) {
      return res.status(400).json({ status: 'failed', message: data.message })
    }

    if (data.data.status !== 'success') {
      return res.json({ 
        status: 'failed', 
        message: data.data.gateway_response || 'Payment was not successful' 
      })
    }

    // Update order
    await pool.query(
      'UPDATE orders SET payment_status = $1, paid_at = $2, status = $3 WHERE payment_ref = $4',
      ['paid', new Date(), 'processing', reference]
    )

    // Get order details for email
    const orderResult = await pool.query(
      `SELECT o.*, u.email, u.full_name,
        (SELECT json_agg(json_build_object(
          'product_id', oi.product_id,
          'size', oi.size,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product_name', p.name
        )) FROM order_items oi 
        JOIN products p ON p.id = oi.product_id 
        WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.payment_ref = $1`,
      [reference]
    )

    const order = orderResult.rows[0]
    
    // Send payment confirmation email
    if (order) {
      try {
        await sendPaymentConfirmation(
          order.email,
          order.full_name,
          order.id,
          order.total_amount,
          order.items,
          reference
        )
        console.log('✅ Payment confirmation email sent to:', order.email)
      } catch (emailErr) {
        console.error('❌ Failed to send payment email:', emailErr)
        // Don't fail the request if email fails
      }
    }

    res.json({
      status: 'success',
      amount: data.data.amount / 100,
      reference: data.data.reference,
    })
  } catch (err) {
    console.error('Payment verify error:', err)
    res.status(500).json({ error: 'Payment verification failed' })
  }
})

// POST /api/payments/webhook — Paystack webhook for async notifications
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const crypto = await import('crypto')
  
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(req.body)
    .digest('hex')

  if (hash !== req.headers['x-paystack-signature']) {
    return res.sendStatus(400)
  }

  const event = JSON.parse(req.body)

  if (event.event === 'charge.success') {
    const reference = event.data.reference
    
    // Update order if not already updated
    await pool.query(
      `UPDATE orders 
       SET payment_status = 'paid', paid_at = COALESCE(paid_at, NOW()), status = 'processing'
       WHERE payment_ref = $1 AND payment_status != 'paid'`,
      [reference]
    )

    // Get order details and send email (if not already sent)
    const orderResult = await pool.query(
      `SELECT o.*, u.email, u.full_name,
        (SELECT json_agg(json_build_object(
          'product_id', oi.product_id,
          'size', oi.size,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product_name', p.name
        )) FROM order_items oi 
        JOIN products p ON p.id = oi.product_id 
        WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.payment_ref = $1`,
      [reference]
    )

    const order = orderResult.rows[0]
    if (order && !order.paid_at) {
      try {
        await sendPaymentConfirmation(
          order.email,
          order.full_name,
          order.id,
          order.total_amount,
          order.items,
          reference
        )
      } catch (emailErr) {
        console.error('Webhook email error:', emailErr)
      }
    }
  }

  res.sendStatus(200)
})

export default router