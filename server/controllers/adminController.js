import pool from '../config/database.js';
import { notifySubscribersNewProduct, sendOrderShipped, sendOrderDelivered } from './emailController.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, stockQuantity, isFeatured } = req.body;
    
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, sizes, images, stock_quantity, is_featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        description,
        price,
        category,
        typeof sizes === 'string' ? sizes : JSON.stringify(sizes || []),
        JSON.stringify(images),
        stockQuantity || 0,
        isFeatured === 'true' || isFeatured === true,
      ]
    );

    const product = result.rows[0];

    // Notify subscribers about new product
    await notifySubscribersNewProduct(product);

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, sizes, stockQuantity, isFeatured } = req.body;

    // Get existing product first
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const existingProduct = existing.rows[0];

    // Build update fields
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined && name !== '') {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (price !== undefined && price !== '') {
      updates.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }
    if (category !== undefined && category !== '') {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }
    if (sizes !== undefined && sizes !== '') {
      // Parse sizes from string if needed
      let parsedSizes;
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch {
        // If it's a comma-separated string like "40, 41, 42"
        parsedSizes = sizes.split(',').map(s => s.trim()).filter(s => s);
      }
      updates.push(`sizes = $${paramIndex}`);
      values.push(JSON.stringify(parsedSizes));
      paramIndex++;
    }
    if (stockQuantity !== undefined && stockQuantity !== '') {
      updates.push(`stock_quantity = $${paramIndex}`);
      values.push(parseInt(stockQuantity));
      paramIndex++;
    }
    if (isFeatured !== undefined) {
      updates.push(`is_featured = $${paramIndex}`);
      values.push(isFeatured === 'true' || isFeatured === true);
      paramIndex++;
    }

    // Handle new images - only update if new files uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      updates.push(`images = $${paramIndex}`);
      values.push(JSON.stringify(newImages));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        o.*, 
        u.email, 
        u.full_name,
        o.shipping_address->>'fullName' as ship_full_name,
        o.shipping_address->>'email' as ship_email,
        o.shipping_address->>'address' as ship_address,
        o.shipping_address->>'city' as ship_city,
        o.shipping_address->>'state' as ship_state,
        o.shipping_address->>'zipCode' as ship_zip,
        o.shipping_address->>'phone' as ship_phone,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'size', oi.size,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product', (SELECT json_build_object('name', p.name, 'images', p.images) FROM products p WHERE p.id = oi.product_id)
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];

    // Send email notifications based on status
    const userResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [order.user_id]
    );
    const user = userResult.rows[0];

    if (status === 'shipped') {
      await sendOrderShipped(user.email, user.full_name, id, trackingNumber);
    } else if (status === 'delivered') {
      await sendOrderDelivered(user.email, user.full_name, id);
    }

    res.json({
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
    const totalRevenue = await pool.query('SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != $1', ['cancelled']);
    const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['customer']);
    
    const recentOrders = await pool.query(
      `SELECT o.*, u.full_name, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC LIMIT 5`
    );

    const lowStock = await pool.query(
      'SELECT * FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC'
    );

    res.json({
      stats: {
        totalOrders: parseInt(totalOrders.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].coalesce),
        totalProducts: parseInt(totalProducts.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
      },
      recentOrders: recentOrders.rows,
      lowStock: lowStock.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};