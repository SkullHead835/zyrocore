import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const data = await req.json()

    await sql`
      UPDATE products SET
        name = ${data.name},
        description = ${data.description || null},
        price = ${data.price},
        discount_price = ${data.discount_price || null},
        category_id = ${data.category_id || null},
        images = ${data.images || []},
        stock = ${data.stock || 0},
        sizes = ${data.sizes || []},
        is_featured = ${data.is_featured || false},
        is_best_seller = ${data.is_best_seller || false},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await sql`DELETE FROM products WHERE id = ${parseInt(id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'error'
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
