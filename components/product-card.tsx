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
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-foreground text-background text-xs px-1.5 py-0.5 rounded">
                -{discount}%
              </Badge>
            )}
            {product.is_best_seller && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 rounded">
                Best Seller
              </Badge>
            )}
          </div>
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={togglingWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2 right-2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
            />
          </button>
          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-medium text-foreground bg-background/90 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-1 truncate">{product.category_name}</p>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-foreground text-foreground' : 'text-border'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating_count.toLocaleString()})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-foreground">{formatPrice(effectivePrice)}</span>
            {product.discount_price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full h-8 text-xs"
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
          >
            <ShoppingCart className="w-3 h-3 mr-1.5" />
            {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  )
}
