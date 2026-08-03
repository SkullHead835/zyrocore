import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcrypt'

const sql = neon(process.env.DATABASE_URL)

console.log('Creating database schema...')

// === SCHEMA ===
await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    sizes TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id, size)
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    shipping_name VARCHAR(255),
    shipping_phone VARCHAR(50),
    shipping_address TEXT,
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_zip VARCHAR(50),
    tracking_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    product_image TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  )
`
await sql`
  CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  )
`
// Indexes
await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)`
await sql`CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller)`
await sql`CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)`
await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`
await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`
await sql`CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id)`

console.log('[✓] Schema applied')

// === SEED CATEGORIES ===
await sql`
  INSERT INTO categories (name, slug, image_url) VALUES
    ('Formals', 'formals', '/categories/formals.jpg'),
    ('Casuals', 'casuals', '/categories/casuals.jpg'),
    ('Party Wear', 'party-wear', '/categories/party-wear.jpg'),
    ('Premium Collection', 'premium', '/categories/premium.jpg')
  ON CONFLICT (slug) DO NOTHING
`
console.log('[✓] Categories seeded')

// === CREATE ADMIN ===
const email = 'bpadmin@zyrocore.in'
const password = 'Globe@200'
const name = 'Bharathapriyan'
const hash = await bcrypt.hash(password, 10)

await sql`
  INSERT INTO users (name, email, password_hash, role)
  VALUES (${name}, ${email}, ${hash}, 'admin')
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role = 'admin',
        name = EXCLUDED.name
`

console.log('[✓] Admin user created:', email)
console.log('')
console.log('===================================')
console.log('  ZYROCORE Database Setup Complete!')
console.log('===================================')
console.log('  Admin Email:    bpadmin@zyrocore.in')
console.log('  Admin Password: Globe@200')
console.log('  Login at:       /secure-admin/login')
console.log('===================================')
