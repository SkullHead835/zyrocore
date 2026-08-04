import { neon } from '@neondatabase/serverless'

let dbUrl = process.env.DATABASE_URL || ''

// Fallback to placeholder if unconfigured
if (!dbUrl || dbUrl.includes('placeholder')) {
  dbUrl = 'postgres://placeholder:placeholder@localhost/placeholder'
}

// Auto-append sslmode=require for Neon database connections if not already present
if (dbUrl.includes('neon.tech') && !dbUrl.includes('sslmode=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require'
}

const sql = neon(dbUrl)

export default sql
