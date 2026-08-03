'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../admin-shell'
import { AlertTriangle, Package, Search, Save } from 'lucide-react'
import { toast } from 'sonner'

const STOCK_LEVEL = (stock: number) => {
  if (stock === 0) return { label: 'Out of Stock', cls: 'text-red-400 bg-red-400/10 border-red-400/20' }
  if (stock < 5)  return { label: 'Critical',     cls: 'text-red-400 bg-red-400/10 border-red-400/20' }
  if (stock < 10) return { label: 'Low Stock',    cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' }
  return              { label: 'In Stock',         cls: 'text-green-400 bg-green-400/10 border-green-400/20' }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editStock, setEditStock] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    fetch('/api/admin/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(r => r.ok ? r.json() : null).then(data => {
      const list = data?.products ?? []
      setProducts(list)
      setFiltered(list)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q)))
  }, [search, products])

  const lowStockCount = products.filter(p => p.stock < 10).length

  const handleSaveStock = async (p: any) => {
    const newStock = parseInt(editStock[p.id] ?? p.stock)
    if (isNaN(newStock) || newStock < 0) { toast.error('Invalid stock value'); return }
    setSaving(p.id)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...p, stock: newStock }),
    })
    if (res.ok) {
      toast.success(`Stock updated for "${p.name}"`)
      setEditStock(prev => { const n = { ...prev }; delete n[p.id]; return n })
      load()
    } else toast.error('Failed to update stock')
    setSaving(null)
  }

  return (
    <AdminShell>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-white text-xl font-bold">Inventory</h1>
          <p className="text-[#555] text-sm mt-0.5">Manage stock levels for all products</p>
        </div>

        {/* Alert banner */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-400 text-sm font-medium">
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} with low or no stock. Update quantities below.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            suppressHydrationWarning
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#d4a017] transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-[#444] text-sm">Loading inventory...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
              <p className="text-[#555] text-sm">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {['Product', 'Category', 'Status', 'Current Stock', 'Adjust Stock'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const level = STOCK_LEVEL(p.stock)
                    const changed = editStock[p.id] !== undefined && editStock[p.id] !== String(p.stock)
                    return (
                      <tr key={p.id} className="border-b border-[#181818] hover:bg-[#151515] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-[#1e1e1e]" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] flex items-center justify-center">
                                <Package className="w-3.5 h-3.5 text-[#444]" />
                              </div>
                            )}
                            <span className="text-white font-medium truncate max-w-[160px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#666]">{p.category_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${level.cls}`}>{level.label}</span>
                        </td>
                        <td className="px-4 py-3 text-white font-mono text-sm">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editStock[p.id] ?? p.stock}
                              onChange={e => setEditStock(prev => ({ ...prev, [p.id]: e.target.value }))}
                              suppressHydrationWarning
                              className="w-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-[#d4a017] transition-colors"
                            />
                            {changed && (
                              <button
                                onClick={() => handleSaveStock(p)}
                                disabled={saving === p.id}
                                suppressHydrationWarning
                                className="w-7 h-7 rounded-lg bg-[#d4a017]/15 hover:bg-[#d4a017]/25 flex items-center justify-center transition-colors disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5 text-[#d4a017]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
