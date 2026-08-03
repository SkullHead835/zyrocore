import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const products = await sql`
      SELECT p.*, c.name as category_name FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `
    return NextResponse.json({ products })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const data = await req.json()

    const products = await sql`
      INSERT INTO products (name, description, price, discount_price, category_id, images, stock, sizes, is_featured, is_best_seller)
      VALUES (${data.name}, ${data.description || null}, ${data.price}, ${data.discount_price || null},
        ${data.category_id || null}, ${data.images || []}, ${data.stock || 0},
        ${data.sizes || []}, ${data.is_featured || false}, ${data.is_best_seller || false})
      RETURNING *
    `
    return NextResponse.json({ product: products[0] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
