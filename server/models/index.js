import pool from '../config/database.js';

export const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users Table (added is_verified, verification_token, reset_token)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Email Logs Table (track all sent emails)
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        sizes JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        size VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10,2) NOT NULL
      )
    `);

    // Subscribers Table (for newsletter)
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;