import Link from 'next/link'
import ZyrocoreLogo from './zyrocore-logo'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="text-accent">
                <ZyrocoreLogo showTagline size="sm" />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for Ambitious. Premium clothing and accessories for those who refuse to follow trends.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xs mb-4 text-foreground uppercase tracking-widest">Shop</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/products?category=formals" className="hover:text-accent transition-colors">Formals</Link></li>
              <li><Link href="/products?category=casuals" className="hover:text-accent transition-colors">Casuals</Link></li>
              <li><Link href="/products?category=party-wear" className="hover:text-accent transition-colors">Party Wear</Link></li>
              <li><Link href="/products?category=premium-collection" className="hover:text-accent transition-colors">Premium</Link></li>
              <li><Link href="/products?category=new-arrivals" className="hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?best_seller=true" className="hover:text-accent transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs mb-4 text-foreground uppercase tracking-widest">Account</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/account" className="hover:text-accent transition-colors">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-accent transition-colors">My Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-accent transition-colors">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-accent transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs mb-4 text-foreground uppercase tracking-widest">Help</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><span className="cursor-default">FAQ</span></li>
              <li><span className="cursor-default">Shipping Info</span></li>
              <li><span className="cursor-default opacity-50">Returns</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZYRØCORE. Built for Ambitious.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
