import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('session_id', '', { expires: new Date(0), path: '/' })
  return response
}
