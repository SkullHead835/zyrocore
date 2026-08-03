import { type NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured')
    const bestSeller = searchParams.get('best_seller')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    let products
    let countResult

    if (search) {
      const searchTerm = '%' + search + '%'
      if (sort === 'price_asc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm} ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'price_desc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm} ORDER BY p.price DESC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'rating') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm} ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name ILIKE ${searchTerm} OR p.description ILIKE ${searchTerm} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      }
      countResult = await sql`
        SELECT COUNT(*) FROM products
        WHERE name ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
      `
    } else if (category) {
      if (sort === 'price_asc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE c.slug = ${category} ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'price_desc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE c.slug = ${category} ORDER BY p.price DESC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'rating') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE c.slug = ${category} ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE c.slug = ${category} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      }
      countResult = await sql`
        SELECT COUNT(*) FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE c.slug = ${category}
      `
    } else if (featured === 'true') {
      if (sort === 'price_asc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'price_desc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.price DESC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'rating') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      }
      countResult = await sql`SELECT COUNT(*) FROM products WHERE is_featured = true`
    } else if (bestSeller === 'true') {
      if (sort === 'price_asc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_best_seller = true ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'price_desc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_best_seller = true ORDER BY p.price DESC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'rating') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_best_seller = true ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_best_seller = true ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      }
      countResult = await sql`SELECT COUNT(*) FROM products WHERE is_best_seller = true`
    } else {
      if (sort === 'price_asc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.price ASC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'price_desc') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.price DESC LIMIT ${limit} OFFSET ${offset}`
      } else if (sort === 'rating') {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.rating DESC LIMIT ${limit} OFFSET ${offset}`
      } else {
        products = await sql`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      }
      countResult = await sql`SELECT COUNT(*) FROM products`
    }

    const total = parseInt(countResult[0].count)

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
