'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { SlidersHorizontal, Search } from 'lucide-react'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProductsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const featured = searchParams.get('featured') || ''
  const bestSeller = searchParams.get('best_seller') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const [localSearch, setLocalSearch] = useState(search)

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (featured) params.set('featured', featured)
    if (bestSeller) params.set('best_seller', bestSeller)
    params.set('page', String(page))
    params.set('limit', '12')
    return `/api/products?${params.toString()}`
  }, [category, search, sort, featured, bestSeller, page])

  const { data, isLoading } = useSWR(buildUrl(), fetcher)

  const products: Product[] = data?.products ?? []
  const totalPages = data?.totalPages ?? 1

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', localSearch.trim())
  }

  const getTitle = () => {
    if (search) return `Search: "${search}"`
    if (bestSeller === 'true') return 'Best Sellers'
    if (featured === 'true') return 'Featured Products'
    if (category) return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ')
    return 'All Products'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">{getTitle()}</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-0.5">{data.total} products found</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-1.5">
            <Input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search..."
              className="w-44 h-9 text-sm"
            />
            <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <Select value={sort} onValueChange={v => updateParam('sort', v)}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { label: 'All', slug: '' },
          { label: 'Formals', slug: 'formals' },
          { label: 'Casuals', slug: 'casuals' },
          { label: 'Party Wear', slug: 'party-wear' },
          { label: 'Premium Collection', slug: 'premium-collection' },
          { label: 'New Arrivals', slug: 'new-arrivals' },
          { label: 'Sale', slug: 'sale' },
        ].map(cat => (
          <button
            key={cat.slug}
            onClick={() => updateParam('category', cat.slug)}
            suppressHydrationWarning
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              category === cat.slug
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button className="mt-4" onClick={() => router.push('/products')}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam('page', String(page + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
