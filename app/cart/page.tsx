'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils-shop'
import { useAuth } from '@/components/auth-provider'
import { useCart } from '@/components/cart-provider'
import { toast } from 'sonner'

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

interface CartItem {
  id: number
  product_id: number
  quantity: number
  size: string | null
  name: string
  price: number
  discount_price: number | null
  images: string[]
  stock: number
}

export default function CartPage() {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR('/api/cart', fetcher)
  const items: CartItem[] = data?.items ?? []

  const updateQty = async (id: number, quantity: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
    await fetch(`/api/cart/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ quantity }),
    })
    mutate()
    refreshCart()
  }

  const removeItem = async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
    await fetch(`/api/cart?id=${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    mutate()
    refreshCart()
    toast.success('Item removed')
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.discount_price ?? item.price
    return sum + price * item.quantity
  }, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shipping

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Sign in to view your cart</h1>
            <Button asChild className="mt-3">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some items to get started</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => {
                  const price = item.discount_price ?? item.price
                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {item.images?.[0] && (
                          <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product_id}`} className="font-medium text-foreground hover:underline text-sm line-clamp-2">
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                        )}
                        <p className="font-semibold mt-1">{formatPrice(price)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1.5 border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Increase"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">Add {formatPrice(50 - subtotal)} more for free shipping</p>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg mb-5">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={() => router.push('/checkout')}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
