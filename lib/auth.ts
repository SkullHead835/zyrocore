import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import sql from './db'
import type { AuthUser } from './types'

// Reads session from either session_id cookie OR Authorization: Bearer header.
// The Bearer token path is needed in the v0 preview iframe where cookies are blocked.
export const getSession = cache(async (): Promise<AuthUser | null> => {
  // 1. Try Authorization header (customer userToken from localStorage)
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (bearerToken) {
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${bearerToken}
        AND s.expires_at > NOW()
    `
    if (rows.length > 0) return rows[0] as AuthUser
  }

  // 2. Fall back to session_id OR adminToken cookie
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value || cookieStore.get('adminToken')?.value
  if (!sessionId) return null

  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
  `
  if (rows.length === 0) return null
  return rows[0] as AuthUser
})

// Admin session: checks Authorization header first, then adminToken/session_id cookies.
export async function getAdminSession(): Promise<AuthUser | null> {
  return getSession()
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAdminSession()
  if (!user) throw new Error('UNAUTHORIZED')
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}
