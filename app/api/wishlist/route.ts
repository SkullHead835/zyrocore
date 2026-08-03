import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ items: [] })

    const items = await sql`
      SELECT w.*, p.id as product_id, p.name, p.price, p.discount_price, p.images, p.stock, p.rating, p.rating_count
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${user.id}
      ORDER BY w.created_at DESC
    `
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_id } = await req.json()

    const existing = await sql`
      SELECT id FROM wishlists WHERE user_id = ${user.id} AND product_id = ${product_id}
    `
    if (existing.length > 0) {
      await sql`DELETE FROM wishlists WHERE user_id = ${user.id} AND product_id = ${product_id}`
      return NextResponse.json({ action: 'removed' })
    }

    await sql`INSERT INTO wishlists (user_id, product_id) VALUES (${user.id}, ${product_id})`
    return NextResponse.json({ action: 'added' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
