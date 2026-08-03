import { neon } from '@neondatabase/serverless'

const dbUrl = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@localhost/placeholder'
const sql = neon(dbUrl)

export default sql
