import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import sql from '@/lib/db'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.rating DESC
      LIMIT 8
    `
    return rows as unknown as Product[]
  } catch {
    return []
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Featured Styles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Hand-picked looks from ASP Fashions</p>
        </div>
        <Link href="/products?featured=true" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
