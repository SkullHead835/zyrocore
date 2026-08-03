'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../admin-shell'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import { toast } from 'sonner'

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const STOCK_BADGE = (stock: number) => {
  if (stock === 0) return 'text-red-400 bg-red-400/10 border-red-400/20'
  if (stock < 10) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
  return 'text-green-400 bg-green-400/10 border-green-400/20'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    fetch('/api/admin/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = data?.products ?? []
        setProducts(list)
        setFiltered(list)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) || (p.category_name || '').toLowerCase().includes(q)
    ))
  }, [search, products])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) { toast.success('Product deleted'); load() }
    else toast.error('Failed to delete product')
    setDeletingId(null)
  }

  return (
    <AdminShell>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Products</h1>
            <p className="text-[#555] text-sm mt-0.5">{products.length} total products</p>
          </div>
          <Link
            href="/secure-admin/products/new"
            className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#e6b01e] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            suppressHydrationWarning
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#d4a017] transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-[#444] text-sm">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
              <p className="text-[#555] text-sm">{search ? 'No products match your search' : 'No products yet'}</p>
              {!search && (
                <Link href="/secure-admin/products/new" className="text-[#d4a017] text-sm hover:underline mt-2 inline-block">
                  Add your first product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-[#181818] hover:bg-[#151515] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-[#1e1e1e]" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#1e1e1e] flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#444]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[200px]">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#666]">{p.category_name || '—'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-white font-medium">
                            {formatINR(p.discount_price ?? p.price)}
                          </span>
                          {p.discount_price && (
                            <span className="ml-1.5 text-[#555] line-through text-xs">{formatINR(p.price)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${STOCK_BADGE(p.stock)}`}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.is_featured ? (
                          <span className="text-[#d4a017] text-xs bg-[#d4a017]/10 px-2 py-0.5 rounded-md">Featured</span>
                        ) : (
                          <span className="text-[#444] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/secure-admin/products/${p.id}/edit`}
                            className="w-7 h-7 rounded-lg bg-[#1e1e1e] hover:bg-[#d4a017]/15 flex items-center justify-center transition-colors group"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#666] group-hover:text-[#d4a017]" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            suppressHydrationWarning
                            className="w-7 h-7 rounded-lg bg-[#1e1e1e] hover:bg-red-500/10 flex items-center justify-center transition-colors group disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#666] group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
