import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import sql from '@/lib/db'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

async function getBestSellers(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_best_seller = true
      ORDER BY p.rating_count DESC
      LIMIT 8
    `
    return rows as unknown as Product[]
  } catch {
    return []
  }
}

export default async function BestSellers() {
  const products = await getBestSellers()

  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Best Sellers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Most loved by our customers</p>
        </div>
        <Link href="/products?best_seller=true" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
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
