import sql from './db'

let initialized = false

export async function ensureDbSchema() {
  if (initialized) return

  const dbUrl = process.env.DATABASE_URL || ''
  if (!dbUrl || dbUrl.includes('placeholder')) {
    return
  }

  try {
    // 1. Add missing columns to users table
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP DEFAULT NOW()`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`

    // 2. Create audit_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // 3. Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        images TEXT[] DEFAULT '{}',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `

    // 4. Create performance indexes for O(log N) query speeds
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id)`

    initialized = true
  } catch (err) {
    console.warn('[db-init] Schema initialization skipped or failed:', err)
  }
}
