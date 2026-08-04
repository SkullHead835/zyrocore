import sql from './db'

let initialized = false

export async function ensureDbSchema() {
  if (initialized) return
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

    initialized = true
  } catch (err) {
    console.error('[db-init] Schema initialization failed:', err)
  }
}
