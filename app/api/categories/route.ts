import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
