import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

const ADMIN_SECRET = 'ASPFASHIONS2025'

export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json()

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 })
    }

    const result = await sql`
      UPDATE users SET role = 'admin' WHERE email = ${email} RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
