import express from 'express';
import pool from '../config/database.js';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { 
  getAllOrders, 
  updateOrderStatus, 
  getDashboardStats 
} from '../controllers/adminController.js';
import { getEmailLogs } from '../controllers/emailController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, authorizeAdmin);

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════

router.get('/dashboard', getDashboardStats);

// ═══════════════════════════════════════════════════════════════
//  PRODUCTS — using productController (has toJsonParam fix)
// ═══════════════════════════════════════════════════════════════

router.post('/products', upload.array('images', 5), createProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

// ═══════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// ═══════════════════════════════════════════════════════════════
//  CUSTOMERS
// ═══════════════════════════════════════════════════════════════

router.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.created_at, u.role,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
      WHERE u.role = $1
      GROUP BY u.id
      ORDER BY u.created_at DESC`,
      ['customer']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════════════════

router.get('/analytics', async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const dailySales = await pool.query(
      `SELECT DATE(created_at) as date, 
        COUNT(*) as orders, 
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(items_count), 0) as items
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    const categorySales = await pool.query(
      `SELECT p.category, 
        COUNT(oi.id) as items_sold, 
        COALESCE(SUM(oi.price_at_time * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      AND o.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY p.category
      ORDER BY revenue DESC`
    );

    const topProducts = await pool.query(
      `SELECT p.id, p.name, p.category, p.images, 
        COUNT(oi.id) as times_sold, 
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.price_at_time * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      AND o.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY p.id, p.name, p.category, p.images
      ORDER BY total_quantity DESC
      LIMIT 10`
    );

    const monthlyStats = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status != 'cancelled'
      AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC`
    );

    res.json({
      dailySales: dailySales.rows,
      categorySales: categorySales.rows,
      topProducts: topProducts.rows,
      monthlyStats: monthlyStats.rows,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════

router.get('/settings', async (req, res) => {
  try {
    const products = await pool.query('SELECT COUNT(*) FROM products');
    const orders = await pool.query('SELECT COUNT(*) FROM orders WHERE status != $1', ['cancelled']);
    const revenue = await pool.query('SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != $1', ['cancelled']);
    
    res.json({
      storeName: 'Velario',
      currency: 'NGN',
      taxRate: 8,
      shippingFreeThreshold: 100,
      totalProducts: parseInt(products.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].coalesce),
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  EMAIL LOGS
// ═══════════════════════════════════════════════════════════════

router.get('/email-logs', getEmailLogs);

export default router;