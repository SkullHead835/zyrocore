import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ensureDbSchema } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureDbSchema()
    const { searchParams } = new URL(req.url)
    const productIdStr = searchParams.get('product_id')

    if (!productIdStr) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const productId = parseInt(productIdStr)

    const user = await getSession()

    // Fetch reviews with user details
    const reviews = await sql`
      SELECT 
        r.id, r.user_id, r.product_id, r.rating, r.title, r.comment, r.images, r.is_verified, r.created_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `

    // Calculate rating breakdown distribution (5★ to 1★)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let sumRating = 0

    reviews.forEach(r => {
      const star = r.rating as 1 | 2 | 3 | 4 | 5
      if (breakdown[star] !== undefined) breakdown[star] += 1
      sumRating += r.rating
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0

    const userReview = user ? reviews.find(r => r.user_id === user.id) || null : null

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        user_id: r.user_id,
        user_name: r.user_name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images || [],
        is_verified: r.is_verified,
        created_at: r.created_at,
      })),
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      breakdown,
      userReview,
    })
  } catch (error) {
    console.error('[reviews GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSchema()
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Please log in to submit a review.' }, { status: 401 })
    }

    const { product_id, rating, title, comment, images } = await req.json()

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid product ID and star rating (1-5) are required.' }, { status: 400 })
    }

    // Check if user has purchased & received this product for verified purchase badge
    const deliveredOrders = await sql`
      SELECT o.id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${user.id}
        AND oi.product_id = ${product_id}
        AND o.status IN ('delivered', 'confirmed', 'shipped')
      LIMIT 1
    `
    const isVerified = deliveredOrders.length > 0

    // Upsert review record
    await sql`
      INSERT INTO reviews (user_id, product_id, rating, title, comment, images, is_verified, updated_at)
      VALUES (${user.id}, ${product_id}, ${rating}, ${title || null}, ${comment || null}, ${images || []}, ${isVerified}, NOW())
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        comment = EXCLUDED.comment,
        images = EXCLUDED.images,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW()
    `

    // Update product rating and rating_count metrics
    const stats = await sql`
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE product_id = ${product_id}
    `
    const count = parseInt(stats[0].count)
    const avg = parseFloat(parseFloat(stats[0].avg_rating).toFixed(2))

    await sql`
      UPDATE products
      SET rating = ${avg}, rating_count = ${count}
      WHERE id = ${product_id}
    `

    return NextResponse.json({ success: true, rating: avg, rating_count: count })
  } catch (error) {
    console.error('[reviews POST] error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDbSchema()
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const productIdStr = searchParams.get('product_id')
    if (!productIdStr) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const productId = parseInt(productIdStr)

    await sql`
      DELETE FROM reviews
      WHERE user_id = ${user.id} AND product_id = ${productId}
    `

    // Recalculate product rating metrics
    const stats = await sql`
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE product_id = ${productId}
    `
    const count = parseInt(stats[0].count)
    const avg = parseFloat(parseFloat(stats[0].avg_rating).toFixed(2))

    await sql`
      UPDATE products
      SET rating = ${avg}, rating_count = ${count}
      WHERE id = ${productId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reviews DELETE] error:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
