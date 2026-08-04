'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart, ShoppingCart, Star, ChevronRight, Minus, Plus, Check,
  Share2, Copy, Send, MessageCircle, Facebook, Twitter, Mail, Info, ShieldCheck, RefreshCw, Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/product-card'
import { formatPrice, calculateDiscount } from '@/lib/utils-shop'
import { useAuth } from '@/components/auth-provider'
import { useCart } from '@/components/cart-provider'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  related: Product[]
}

export default function ProductDetailClient({ product, related }: Props) {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [adding, setAdding] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const effectivePrice = product.discount_price ?? product.price
  const discount = product.discount_price ? calculateDiscount(product.price, product.discount_price) : 0

  const productUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleAddToCart = async (redirect: boolean = false) => {
    if (!user) { router.push('/login'); return }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    if (redirect) setBuyingNow(true)
    else setAdding(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ product_id: product.id, quantity, size: selectedSize }),
      })
      const data = await res.json()
      if (res.ok) {
        refreshCart()
        if (redirect) {
          router.push('/checkout')
        } else {
          toast.success('Added to cart!')
        }
      } else {
        toast.error(data?.error || 'Failed to add to cart')
      }
    } finally {
      setAdding(false)
      setBuyingNow(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) { router.push('/login'); return }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
    })
    const data = await res.json()
    setWishlisted(data.action === 'added')
    toast.success(data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl)
    toast.success('Product link copied to clipboard!')
    setShareOpen(false)
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${product.name} on ZYRØCORE: ${productUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank')
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out ${product.name} on ZYRØCORE`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(productUrl)}`, '_blank')
  }

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent(`Check out ${product.name} on ZYRØCORE`)
    const body = encodeURIComponent(`I thought you might like this product: ${product.name}\n\n${productUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareInstagram = () => {
    navigator.clipboard.writeText(productUrl)
    toast.success('Link copied! Open Instagram to paste and share.')
    setShareOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.category_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category=${product.category_slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
            {product.images?.[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-foreground text-background">
                -{discount}% OFF
              </Badge>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-foreground' : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-1">
            <p className="text-sm text-muted-foreground">{product.category_name}</p>

            {/* Share Button & Popup Menu */}
            <div className="relative">
              <button
                onClick={() => setShareOpen(!shareOpen)}
                suppressHydrationWarning
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-foreground transition-colors bg-background text-foreground"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              {shareOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-xl z-50 p-2 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">Share Product</p>
                  <button onClick={shareWhatsApp} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                  </button>
                  <button onClick={shareInstagram} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 inline-block flex-shrink-0" /> Instagram
                  </button>
                  <button onClick={shareFacebook} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                  </button>
                  <button onClick={shareTwitter} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <Twitter className="w-4 h-4 text-sky-500" /> X (Twitter)
                  </button>
                  <button onClick={shareTelegram} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <Send className="w-4 h-4 text-sky-600" /> Telegram
                  </button>
                  <button onClick={shareEmail} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-neutral-500" /> Email
                  </button>
                  <div className="border-t border-border pt-1 mt-1">
                    <button onClick={copyLink} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted text-foreground font-semibold transition-colors">
                      <Copy className="w-4 h-4 text-foreground" /> Copy Product Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-pretty mb-3 leading-snug">
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-foreground text-foreground' : 'text-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.rating_count.toLocaleString()} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-foreground">{formatPrice(effectivePrice)}</span>
            {product.discount_price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
            {discount > 0 && (
              <span className="text-sm font-medium text-green-600">Save {discount}%</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Size {selectedSize && <span className="text-muted-foreground">— {selectedSize}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[2.5rem] h-9 px-3 text-sm rounded-lg border transition-all font-medium ${
                      selectedSize === size
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground ml-2">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Dual Actions: Buy Now & Add to Cart */}
          <div className="flex gap-3 mb-6">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-2 border-foreground hover:bg-foreground hover:text-background font-bold transition-all"
              onClick={() => handleAddToCart(false)}
              disabled={adding || buyingNow || product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
            </Button>

            <Button
              size="lg"
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all"
              onClick={() => handleAddToCart(true)}
              disabled={adding || buyingNow || product.stock === 0}
            >
              {buyingNow ? 'Redirecting...' : 'Buy Now'}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="w-12 flex-shrink-0"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-foreground text-foreground' : ''}`} />
            </Button>
          </div>

          {/* Features */}
          <div className="border-t border-border pt-5 space-y-2">
            {[
              { icon: Check, text: 'Free shipping on orders over ₹999' },
              { icon: Check, text: '15-day hassle-free returns' },
              { icon: Check, text: 'Instant UPI Payment verification' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-foreground flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Product Details Section immediately below product description */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" /> Product Details & Specifications
        </h2>

        <div className="grid md:grid-cols-3 gap-6 bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Highlights */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-foreground" /> Highlights & Construction
            </h3>
            <ul className="text-sm text-foreground space-y-1.5 list-disc list-inside">
              <li>Premium quality crafted for daily ambitious style</li>
              <li>Pre-shrunk fabric ensuring long-lasting fit durability</li>
              <li>Reinforced stitching across high-stress points</li>
              <li>Breathable, climate-adaptive weaving</li>
            </ul>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-foreground" /> Fabric & Care Instructions
            </h3>
            <div className="text-sm text-foreground space-y-1.5">
              <p><span className="font-semibold text-muted-foreground">Material:</span> 100% Premium Cotton / Blend</p>
              <p><span className="font-semibold text-muted-foreground">Wash Care:</span> Machine wash cold with like colors</p>
              <p><span className="font-semibold text-muted-foreground">Drying:</span> Tumble dry low or line dry in shade</p>
              <p><span className="font-semibold text-muted-foreground">Ironing:</span> Warm iron on reverse side</p>
            </div>
          </div>

          {/* Delivery & Warranty */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-foreground" /> Delivery & Origin Information
            </h3>
            <div className="text-sm text-foreground space-y-1.5">
              <p><span className="font-semibold text-muted-foreground">Country of Origin:</span> India</p>
              <p><span className="font-semibold text-muted-foreground">Dispatch:</span> Ships within 24-48 business hours</p>
              <p><span className="font-semibold text-muted-foreground">Returns:</span> 15-day return / exchange policy</p>
              <p><span className="font-semibold text-muted-foreground">Authenticity:</span> 100% Genuine ZYRØCORE Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
