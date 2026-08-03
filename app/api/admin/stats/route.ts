import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const [totalRevenue] = await sql`SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'`
    const [totalOrders] = await sql`SELECT COUNT(*) as count FROM orders`
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`
    const [totalProducts] = await sql`SELECT COUNT(*) as count FROM products`
    const [lowStock] = await sql`SELECT COUNT(*) as count FROM products WHERE stock < 10`

    const recentOrders = await sql`
      SELECT o.id, o.status, o.total, o.created_at, u.name as user_name
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `

    const ordersByStatus = await sql`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `

    return NextResponse.json({
      stats: {
        revenue: parseFloat(totalRevenue.revenue),
        orders: parseInt(totalOrders.count),
        users: parseInt(totalUsers.count),
        products: parseInt(totalProducts.count),
        lowStock: parseInt(lowStock.count),
      },
      recentOrders,
      ordersByStatus,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
