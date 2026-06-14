import express from 'express';
import multer from 'multer';
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

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
//  MULTER — MEMORY STORAGE (no disk files, Cloudinary upload)
// ═══════════════════════════════════════════════════════════════

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All routes require admin authentication
router.use(authenticate, authorizeAdmin);

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════

router.get('/dashboard', getDashboardStats);

// ═══════════════════════════════════════════════════════════════
//  PRODUCTS — using memoryStorage + Cloudinary
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
    const days = parseInt(req.query.days) || 30;
    
    // Check if items_count column exists, fallback to counting order_items
    let dailySalesQuery;
    try {
      // Try with items_count first
      dailySalesQuery = await pool.query(
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
    } catch (colError) {
      // Fallback: count items from order_items
      dailySalesQuery = await pool.query(
        `SELECT DATE(o.created_at) as date, 
          COUNT(DISTINCT o.id) as orders, 
          COALESCE(SUM(o.total_amount), 0) as revenue,
          COALESCE(SUM(oi.quantity), 0) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.created_at >= NOW() - INTERVAL '${days} days'
        AND o.status != 'cancelled'
        GROUP BY DATE(o.created_at)
        ORDER BY date ASC`
      );
    }

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
      ORDER BY DATE_TRUNC('month', created_at) ASC`
    );

    res.json({
      dailySales: dailySalesQuery.rows,
      categorySales: categorySales.rows,
      topProducts: topProducts.rows,
      monthlyStats: monthlyStats.rows,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
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