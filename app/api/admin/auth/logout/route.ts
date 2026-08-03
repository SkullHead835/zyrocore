import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('adminToken')?.value

  if (adminToken) {
    await sql`DELETE FROM sessions WHERE id = ${adminToken}`
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('adminToken', '', { expires: new Date(0), path: '/' })
  return response
}
