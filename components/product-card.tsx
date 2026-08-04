'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, calculateDiscount } from '@/lib/utils-shop'
import type { Product } from '@/lib/types'
import { useAuth } from './auth-provider'
import { useCart } from './cart-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  wishlistIds?: Set<number>
  onWishlistToggle?: (productId: number) => void
}

export default function ProductCard({ product, wishlistIds, onWishlistToggle }: ProductCardProps) {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  const isWishlisted = wishlistIds?.has(product.id) ?? false
  const effectivePrice = product.discount_price ?? product.price
  const discount = product.discount_price
    ? calculateDiscount(product.price, product.discount_price)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }
    if (product.sizes && product.sizes.length > 0) {
      router.push(`/products/${product.id}`)
      return
    }
    setAddingToCart(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      })
      if (res.ok) {
        refreshCart()
        toast.success('Added to cart')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }
    setTogglingWishlist(true)
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      })
      onWishlistToggle?.(product.id)
    } finally {
      setTogglingWishlist(false)
    }
  }

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-muted/30 overflow-hidden flex-shrink-0">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                {discount}% Off
              </Badge>
            )}
            {product.is_best_seller && (
              <Badge variant="secondary" className="text-xs px-2 py-1 rounded bg-foreground/10 text-foreground">
                Best Seller
              </Badge>
            )}
          </div>
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={togglingWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-4 right-4 w-9 h-9 bg-background/95 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
            />
          </button>
          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground bg-background/95 px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs uppercase tracking-widest text-accent mb-2 font-semibold">{product.category_name || 'Collection'}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-3">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <span className="text-lg font-bold text-foreground">{formatPrice(effectivePrice)}</span>
            {product.discount_price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  )
}
