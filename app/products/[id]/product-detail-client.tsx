'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart, ShoppingCart, Star, ChevronRight, Minus, Plus, Check,
  Share2, Copy, Send, MessageCircle, Facebook, Twitter, Mail, Info, ShieldCheck, RefreshCw, Truck,
  MessageSquare, ThumbsUp, Shield, Upload, Trash2, Edit3, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/product-card'
import { formatPrice, calculateDiscount } from '@/lib/utils-shop'
import { useAuth } from '@/components/auth-provider'
import { useCart } from '@/components/cart-provider'
import { compressImageFile } from '@/lib/image-compress'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  related: Product[]
}

interface Review {
  id: number
  user_id: number
  user_name: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
  is_verified: boolean
  created_at: string
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

  // Review states
  const [reviewsData, setReviewsData] = useState<{
    reviews: Review[]
    totalReviews: number
    averageRating: number
    breakdown: Record<number, number>
    userReview: Review | null
  }>({
    reviews: [],
    totalReviews: product.rating_count || 0,
    averageRating: product.rating || 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    userReview: null,
  })
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Write/Edit review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [uploadingReviewImg, setUploadingReviewImg] = useState(false)

  const effectivePrice = product.discount_price ?? product.price
  const discount = product.discount_price ? calculateDiscount(product.price, product.discount_price) : 0

  const productUrl = typeof window !== 'undefined' ? window.location.href : ''

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${product.id}`)
      if (res.ok) {
        const data = await res.json()
        setReviewsData(data)
        if (data.userReview) {
          setReviewRating(data.userReview.rating)
          setReviewTitle(data.userReview.title || '')
          setReviewComment(data.userReview.comment || '')
          setReviewImages(data.userReview.images || [])
        }
      }
    } catch {
      // quiet catch
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [product.id])

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

  // Review image upload handler with client-side compression
  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    setUploadingReviewImg(true)

    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken') || ''
    const uploaded: string[] = []

    for (const rawFile of files) {
      try {
        const compressed = await compressImageFile(rawFile, 1600, 0.85)
        const fd = new FormData()
        fd.append('file', compressed)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        })
        if (res.ok) {
          const json = await res.json()
          uploaded.push(json.url)
        }
      } catch {
        toast.error(`Failed to upload ${rawFile.name}`)
      }
    }

    setReviewImages(prev => [...prev, ...uploaded].slice(0, 3))
    setUploadingReviewImg(false)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    setSubmittingReview(true)

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken') || ''
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          images: reviewImages,
        }),
      })

      if (res.ok) {
        toast.success(reviewsData.userReview ? 'Review updated!' : 'Thank you! Your review has been submitted.')
        loadReviews()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken') || ''
      const res = await fetch(`/api/reviews?product_id=${product.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        toast.success('Review deleted')
        setReviewRating(5)
        setReviewTitle('')
        setReviewComment('')
        setReviewImages([])
        loadReviews()
      }
    } catch {
      toast.error('Failed to delete review')
    }
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

          {/* Rating Summary Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(reviewsData.averageRating) ? 'fill-foreground text-foreground' : 'text-border'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold">{reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : 'New'}</span>
            <span className="text-sm text-muted-foreground">({reviewsData.totalReviews} customer rating{reviewsData.totalReviews === 1 ? '' : 's'})</span>
          </div>

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

      {/* Product Details Section */}
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

      {/* Customer Ratings & Reviews Section */}
      <section className="mt-16 border-t border-border pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Customer Reviews & Ratings</h2>
            <p className="text-sm text-muted-foreground mt-1">Real feedback from verified ZYRØCORE customers</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Overall Rating Score Card */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-5xl font-black text-foreground mb-2">
              {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : '0.0'}
            </p>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(reviewsData.averageRating) ? 'fill-foreground text-foreground' : 'text-border'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Based on {reviewsData.totalReviews} review{reviewsData.totalReviews === 1 ? '' : 's'}</p>
          </div>

          {/* Rating Distribution Breakdown Bars */}
          <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviewsData.breakdown[star] || 0
              const percentage = reviewsData.totalReviews > 0 ? Math.round((count / reviewsData.totalReviews) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-foreground flex items-center gap-0.5">{star} <Star className="w-3 h-3 fill-foreground inline" /></span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground transition-all duration-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-12 text-right text-muted-foreground font-mono">{count} ({percentage}%)</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit or Edit Review Form */}
        <div className="bg-card border border-border rounded-xl p-6 mb-10 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {reviewsData.userReview ? 'Edit Your Review' : 'Write a Customer Review'}
          </h3>

          {!user ? (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">Please sign in to share your experience with this product.</p>
              <Button asChild size="sm"><Link href="/login">Sign In to Review</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Select Your Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 cursor-pointer ${
                          star <= reviewRating ? 'fill-foreground text-foreground' : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-3">{reviewRating} out of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Review Headline</label>
                <input
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent fit & premium material quality!"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Review Details</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share details about the fabric, sizing, comfort, and performance..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </div>

              {/* Review Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Attach Review Photos (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold px-3 py-2 rounded-lg border border-border transition-colors">
                    <Camera className="w-4 h-4" />
                    {uploadingReviewImg ? 'Uploading...' : 'Add Photos'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleReviewImageUpload}
                      disabled={uploadingReviewImg || reviewImages.length >= 3}
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">{reviewImages.length}/3 photos attached</span>
                </div>

                {reviewImages.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {reviewImages.map((imgUrl, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border group">
                        <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submittingReview} size="sm">
                  {submittingReview ? 'Submitting...' : reviewsData.userReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {reviewsData.userReview && (
                  <Button type="button" variant="outline" size="sm" onClick={handleDeleteReview} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete Review
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Customer Reviews List */}
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading customer reviews...</div>
          ) : reviewsData.reviews.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-semibold text-foreground">No customer reviews yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first customer to leave a review for this product!</p>
            </div>
          ) : (
            reviewsData.reviews.map(rev => (
              <div key={rev.id} className="bg-card border border-border rounded-xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground text-background font-bold text-xs flex items-center justify-center">
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        {rev.user_name}
                        {rev.is_verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-semibold">
                            <ShieldCheck className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(rev.created_at))}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-foreground text-foreground' : 'text-border'}`}
                    />
                  ))}
                </div>

                {rev.title && <h4 className="font-semibold text-sm text-foreground">{rev.title}</h4>}
                {rev.comment && <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>}

                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img src={img} alt="Customer attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
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
