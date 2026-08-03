import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)
const rows = await sql`SELECT name, email, role FROM users`
console.log('Users in DB:')
rows.forEach(r => console.log(' -', r.name, '|', r.email, '|', r.role))
