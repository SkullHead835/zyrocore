import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await sql`
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'price', oi.price,
            'quantity', oi.quantity,
            'size', oi.size
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { shipping, items } = await req.json()

    if (!shipping || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
    }

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity, 0)
    const shippingCost = subtotal >= 999 ? 0 : 99
    const total = subtotal + shippingCost

    const orders = await sql`
      INSERT INTO orders (
        user_id, status, subtotal, shipping_cost, total,
        payment_method, payment_status,
        shipping_name, shipping_phone,
        shipping_address, shipping_address2, shipping_landmark,
        shipping_city, shipping_district, shipping_state, shipping_pincode, shipping_zip, shipping_country
      ) VALUES (
        ${user.id}, 'pending', ${subtotal}, ${shippingCost}, ${total},
        'UPI', 'pending',
        ${shipping.name}, ${shipping.phone},
        ${shipping.address}, ${shipping.address2 || null}, ${shipping.landmark || null},
        ${shipping.city}, ${shipping.district || null}, ${shipping.state},
        ${shipping.pincode}, ${shipping.pincode}, ${shipping.country || 'India'}
      )
      RETURNING id
    `

    const orderId = orders[0].id

    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, size)
        VALUES (${orderId}, ${item.product_id}, ${item.product_name}, ${item.product_image},
          ${item.price}, ${item.quantity}, ${item.size || null})
      `
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${user.id}`

    return NextResponse.json({ orderId })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
