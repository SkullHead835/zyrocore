'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, CreditCard, ChevronRight, LogOut } from 'lucide-react'
import ZyrocoreLogo from '@/components/zyrocore-logo'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/payment-settings', label: 'Payments', icon: CreditCard },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    localStorage.removeItem('adminToken')
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 bg-foreground text-background flex flex-col flex-shrink-0 min-h-screen">
        <div className="h-16 flex items-center px-4 border-b border-background/10">
          <div className="bg-background text-foreground p-1.5 rounded-lg">
            <ZyrocoreLogo size="sm" />
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                  active
                    ? 'bg-background/15 text-background'
                    : 'text-background/60 hover:text-background hover:bg-background/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            suppressHydrationWarning
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-background/60 hover:text-background hover:bg-background/10 mt-0.5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>

        <div className="p-4 border-t border-background/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-background/10 flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Admin</p>
              <p className="text-xs text-background/50 truncate">Zyrocore</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-background/50 hover:text-background mt-3 transition-colors">
            Back to Store <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}

