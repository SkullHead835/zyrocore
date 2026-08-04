import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ensureDbSchema } from '@/lib/db-init'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    await ensureDbSchema()

    const customers = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COALESCE(u.status, 'active') as status,
        COALESCE(u.login_count, 0) as login_count,
        u.last_login_at,
        u.created_at,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `

    return NextResponse.json({
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        status: c.status,
        login_count: parseInt(c.login_count),
        last_login_at: c.last_login_at,
        created_at: c.created_at,
        total_orders: parseInt(c.total_orders),
        total_spent: parseFloat(c.total_spent),
      }))
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('[customers GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let admin
  try {
    admin = await requireAdmin()
    await ensureDbSchema()

    const { userId, status } = await req.json()

    if (!userId || !['active', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await sql`
      UPDATE users
      SET status = ${status}
      WHERE id = ${userId} AND role = 'user'
    `

    await logAdminAction(admin.id, 'update_customer_status', `Updated customer #${userId} status to ${status}`)

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('[customers PATCH] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
