'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Sparkles, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils-shop'
import type { Product } from '@/lib/types'

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list: Product[] = data?.products || []
        // Sort by newest created date or id descending
        const newest = [...list].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        setProducts(newest.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 border-t border-border">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent mb-3">
            <Sparkles className="w-4 h-4" /> New Arrivals
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Latest Drops
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Discover our newest collections. Built for ambitious.
          </p>
        </div>

        <Link
          href="/products?sort=newest"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:opacity-80 transition-opacity group"
        >
          Explore All New Arrivals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of New Arrivals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => {
          const effectivePrice = product.discount_price ?? product.price

          return (
            <div
              key={product.id}
              className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Container with Smooth Hover Zoom */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}

                {/* Badge */}
                <Badge className="absolute top-3 left-3 bg-foreground text-background font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 shadow">
                  NEW DROP
                </Badge>

                {/* Hover Quick Overlay Button */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-background text-foreground hover:bg-foreground hover:text-background font-bold shadow-lg transition-all"
                  >
                    <Link href={`/products/${product.id}`} className="flex items-center justify-center gap-1.5">
                      <Eye className="w-4 h-4" /> View Product
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {product.category_name || 'New Collection'}
                  </p>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-muted-foreground transition-colors">
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                    <span className="text-xs font-bold text-foreground">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-base font-extrabold text-foreground">{formatPrice(effectivePrice)}</span>
                    {product.discount_price && (
                      <span className="text-xs text-muted-foreground line-through ml-1.5">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>

                {/* Direct Action Button */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 font-bold text-xs border-foreground/30 hover:border-foreground transition-all"
                >
                  <Link href={`/products/${product.id}`}>
                    View Product
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
