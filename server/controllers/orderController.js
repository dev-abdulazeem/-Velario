import pool from '../config/database.js';
import { sendOrderConfirmation } from './emailController.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { items, shippingAddress, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Create order with payment fields
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_method, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, totalAmount, JSON.stringify(shippingAddress), 'pending', paymentMethod || 'paystack', 'pending']
    );

    const orderId = orderResult.rows[0].id;

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const itemSize = item.size || 'N/A';

      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, size, quantity, price_at_time) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [orderId, item.productId, itemSize, item.quantity, item.price]
      );
      orderItems.push(itemResult.rows[0]);

      // Update stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');

    // Send order confirmation email
    const userResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    const itemsWithNames = await Promise.all(
      items.map(async (item) => {
        const prod = await pool.query('SELECT name FROM products WHERE id = $1', [item.productId]);
        return { ...item, name: prod.rows[0]?.name || 'Product' };
      })
    );

    await sendOrderConfirmation(user.email, user.full_name, orderId, totalAmount, itemsWithNames);

    res.status(201).json({
      message: 'Order placed successfully',
      order: orderResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error placing order' });
  } finally {
    client.release();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'size', oi.size,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product', (SELECT json_build_object('name', p.name, 'images', p.images) FROM products p WHERE p.id = oi.product_id)
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT o.*,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'size', oi.size,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product', (SELECT json_build_object('name', p.name, 'images', p.images, 'price', p.price) FROM products p WHERE p.id = oi.product_id)
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching order' });
  }
};