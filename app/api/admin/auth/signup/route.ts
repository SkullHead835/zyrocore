import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, secretCode } = await req.json()

    if (!name || !email || !password || !secretCode) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate admin secret code
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Invalid secret code' }, { status: 403 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${password_hash}, 'admin')
      RETURNING id, name, email, role
    `

    // Create session immediately
    const sessionId = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt.toISOString()})
    `

    const response = NextResponse.json({ user, token: sessionId })

    response.cookies.set('adminToken', sessionId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[admin-signup] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
