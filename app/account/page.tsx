'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Package, Heart, ShoppingCart, User, LogOut } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils-shop'
import { useAuth } from '@/components/auth-provider'
import type { Order } from '@/lib/types'

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { data } = useSWR(user ? '/api/orders' : null, fetcher)
  const orders: Order[] = (data?.orders ?? []).slice(0, 3)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h1 className="text-xl font-semibold mb-2">Sign in to view your account</h1>
            <Button asChild className="mt-3"><Link href="/login">Sign In</Link></Button>
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                {user.role === 'admin' && (
                  <Badge variant="secondary" className="mt-1 text-xs">Admin</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" className="ml-auto" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Package, label: 'My Orders', href: '/orders', desc: 'Track your orders' },
              { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Saved products' },
              { icon: ShoppingCart, label: 'Cart', href: '/cart', desc: 'Items in cart' },
            ].map(({ icon: Icon, label, href, desc }) => (
              <Link key={href} href={href} className="group bg-card border border-border rounded-xl p-5 hover:border-foreground/30 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </Link>
            ))}
          </div>

          {/* Admin link */}
          {user.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 bg-foreground text-background rounded-xl p-4 mb-8 hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Admin Dashboard</p>
                <p className="text-sm text-background/70">Manage products, orders & users</p>
              </div>
            </Link>
          )}

          {/* Recent orders */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Recent Orders</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders">View All</Link>
              </Button>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No orders yet</div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map(order => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                      <Badge className={`text-xs capitalize ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
