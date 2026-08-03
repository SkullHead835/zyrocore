import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const password = '123456789'
const hash = await bcrypt.hash(password, 10)

console.log('[v0] Generated hash:', hash)

await sql`
  UPDATE users
  SET password_hash = ${hash}, role = 'admin'
  WHERE email = ${process.env.ADMIN_EMAIL || 'admin@zyrocore.com'}
`

console.log('[v0] Admin user updated successfully')
