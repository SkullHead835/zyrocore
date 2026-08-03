import bcrypt from 'bcrypt'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const email = process.env.ADMIN_EMAIL || 'bpadmin@zyrocore.in'
const password = process.env.ADMIN_PASSWORD || 'Globe@200'
const name = process.env.ADMIN_NAME || 'Bharathapriyan'

const hash = await bcrypt.hash(password, 10)

await sql`
  INSERT INTO users (name, email, password_hash, role)
  VALUES (${name}, ${email}, ${hash}, 'admin')
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role = 'admin',
        name = EXCLUDED.name
`

console.log('[v0] Admin user created/updated:', email)
