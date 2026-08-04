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
    
    // Low stock threshold: stock <= 10 items
    const [lowStock] = await sql`SELECT COUNT(*) as count FROM products WHERE stock <= 10`

    // Products Sold (total quantity of items in valid orders)
    const [productsSold] = await sql`
      SELECT COALESCE(SUM(quantity), 0) as count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
    `

    // New Customers registered this month
    const [newCustomers] = await sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'user' AND created_at >= DATE_TRUNC('month', NOW())
    `

    // Returning Customers (users with more than 1 completed order)
    const [returningCustomers] = await sql`
      SELECT COUNT(*) as count FROM (
        SELECT user_id FROM orders WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(id) > 1
      ) sub
    `

    // Active Users (logged in within past 30 days)
    const [activeUsers] = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND last_login_at >= NOW() - INTERVAL '30 days'
    `

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
        productsSold: parseInt(productsSold.count),
        newCustomers: parseInt(newCustomers.count),
        returningCustomers: parseInt(returningCustomers.count),
        activeUsers: parseInt(activeUsers.count),
      },
      recentOrders,
      ordersByStatus,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('[stats] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
