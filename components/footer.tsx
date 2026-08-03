import Link from 'next/link'
import ZyrocoreLogo from './zyrocore-logo'

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <div className="bg-background text-foreground p-2 rounded-xl">
                <ZyrocoreLogo showTagline size="sm" />
              </div>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed mt-2">
              Build for Ambitious. Your destination for premium apparel and accessories.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-background/80 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link href="/products" className="hover:text-background transition-colors">All Products</Link></li>
              <li><Link href="/products?category=formals" className="hover:text-background transition-colors">Formals</Link></li>
              <li><Link href="/products?category=casuals" className="hover:text-background transition-colors">Casuals</Link></li>
              <li><Link href="/products?category=party-wear" className="hover:text-background transition-colors">Party Wear</Link></li>
              <li><Link href="/products?category=premium-collection" className="hover:text-background transition-colors">Premium Collection</Link></li>
              <li><Link href="/products?category=new-arrivals" className="hover:text-background transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?best_seller=true" className="hover:text-background transition-colors">Best Sellers</Link></li>
              <li><Link href="/products?category=sale" className="hover:text-background transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-background/80 uppercase tracking-wider">Account</h3>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link href="/account" className="hover:text-background transition-colors">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-background transition-colors">My Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-background transition-colors">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-background transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-background/80 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2 text-sm text-background/60">
              <li><span className="cursor-default">FAQ</span></li>
              <li><span className="cursor-default">Shipping Info</span></li>
              <li><span className="cursor-default">Returns</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-background/40">
          <p>&copy; {new Date().getFullYear()} ZYRØCORE. Build for Ambitious. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
