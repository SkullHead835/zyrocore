'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import ZyrocoreLogo from './zyrocore-logo'
import { useAuth } from './auth-provider'
import { useCart } from './cart-provider'

const categories = [
  { label: 'Formals', slug: 'formals' },
  { label: 'Casuals', slug: 'casuals' },
  { label: 'Party Wear', slug: 'party-wear' },
  { label: 'Premium Collection', slug: 'premium-collection' },
  { label: 'New Arrivals', slug: 'new-arrivals' },
  { label: 'Sale', slug: 'sale' },
]

export default function Header() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar */}
      <div className="bg-accent text-accent-foreground py-2 text-center text-xs font-medium tracking-widest uppercase">
        Free shipping on orders over ₹999</div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <ZyrocoreLogo size="md" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clothing, accessories..."
              className="pl-9 h-10 bg-muted/50 border-border focus-visible:ring-1"
            />
          </div>
        </form>

        {/* Nav actions */}
        <nav className="flex items-center gap-1 ml-auto">
          {/* Wishlist */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href={user ? '/wishlist' : '/login'} aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-foreground text-background rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-1.5 h-9 px-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/secure-admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>
      </div>

      {/* Category nav */}
      <div className="hidden md:block border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-8 h-12 text-xs uppercase tracking-widest" aria-label="Categories">
            <Link href="/products" className="text-foreground hover:text-accent transition-colors font-semibold">
              Shop
            </Link>
            {categories.slice(0, 4).map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <Link href="/products?best_seller=true" className="text-muted-foreground hover:text-foreground transition-colors ml-auto">
              Best Sellers
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clothing..."
              className="flex-1"
            />
            <Button type="submit" size="sm">Search</Button>
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/products" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>All Products</Link>
            {categories.map(cat => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {cat.label}
              </Link>
            ))}
            <Link href="/cart" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
            <Link href="/wishlist" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>Wishlist</Link>
            {user ? (
              <>
                <Link href="/account" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>My Account</Link>
                <Link href="/orders" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>My Orders</Link>
                {user.role === 'admin' && (
                  <Link href="/secure-admin" className="py-2.5 min-h-[44px] flex items-center text-sm font-medium hover:text-foreground" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
                )}
                <button onClick={handleLogout} className="py-2 text-sm text-destructive text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className="py-2 text-sm hover:text-foreground" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
