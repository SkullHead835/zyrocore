'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'
import { useEffect, useState } from 'react'
import sql from '@/lib/db'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const rows = await sql`
          SELECT p.*, c.name as category_name, c.slug as category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_featured = true
          ORDER BY p.rating DESC
          LIMIT 8
        `
        setProducts(rows as unknown as Product[])
      } catch {
        setProducts([])
      }
    }
    fetchFeatured()
  }, [])

  if (products.length === 0) return null

  return (
    <section className={`max-w-7xl mx-auto px-4 py-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`flex items-center justify-between mb-8 transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Featured Styles</h2>
          <p className="text-sm text-muted-foreground mt-2">Hand-picked looks from ZYRØCORE</p>
        </div>
        <Link href="/products?featured=true" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product, idx) => (
          <div 
            key={product.id}
            className={`transform transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${150 + idx * 80}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
