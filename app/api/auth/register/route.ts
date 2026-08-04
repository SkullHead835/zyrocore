import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import sql from '@/lib/db'
import { ensureDbSchema } from '@/lib/db-init'

export async function POST(req: NextRequest) {
  try {
    await ensureDbSchema()

    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Password strength requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' },
        { status: 400 }
      )
    }

    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email.trim()})`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, role, status, last_login_at, login_count)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${passwordHash}, 'user', 'active', NOW(), 1)
      RETURNING id, name, email, role
    `
    const user = newUsers[0]

    const sessionId = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt.toISOString()})
    `

    const response = NextResponse.json({ user, token: sessionId })

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
