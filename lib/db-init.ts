import sql from './db'

let initialized = false

export async function ensureDbSchema() {
  if (initialized) return

  const dbUrl = process.env.DATABASE_URL || ''
  if (!dbUrl || dbUrl.includes('placeholder')) {
    // Unconfigured or placeholder database environment
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

    initialized = true
  } catch (err) {
    console.warn('[db-init] Schema initialization skipped or failed:', err)
  }
}
