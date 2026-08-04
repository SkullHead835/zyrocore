import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import sql from '@/lib/db'
import { ensureDbSchema } from '@/lib/db-init'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAdminAction } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    await ensureDbSchema()

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Rate limiting check: 5 login attempts per minute per IP + email
    const rateKey = `login:${ip}:${email.toLowerCase().trim()}`
    const rate = checkRateLimit(rateKey, 5, 60000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 1 minute before trying again.' },
        { status: 429 }
      )
    }

    const users = await sql`
      SELECT id, name, email, password_hash, role, status FROM users WHERE LOWER(email) = LOWER(${email.trim()})
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users[0]

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Account has been suspended. Please contact support.' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update login count and last login timestamp
    await sql`
      UPDATE users
      SET last_login_at = NOW(),
          login_count = COALESCE(login_count, 0) + 1
      WHERE id = ${user.id}
    `

    if (user.role === 'admin') {
      await logAdminAction(user.id, 'admin_login', 'Admin logged into system', ip)
    }

    const sessionId = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt.toISOString()})
    `

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: sessionId,
    })

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[login] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
