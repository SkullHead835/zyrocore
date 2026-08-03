'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../admin-shell'
import { ShoppingBag, Search, X, ChevronDown, Truck } from 'lucide-react'
import { toast } from 'sonner'

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(s))
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped:   'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
}

interface Order {
  id: number; status: OrderStatus; total: number; created_at: string
  user_name: string | null; user_email: string | null
  shipping_name: string | null; shipping_address: string | null
  tracking_number: string | null; notes: string | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [trackingInput, setTrackingInput] = useState('')

  const load = (status = statusFilter) => {
    setLoading(true)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    const url = status ? `/api/admin/orders?status=${status}&limit=50` : '/api/admin/orders?limit=50'
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(r => r.ok ? r.json() : null).then(data => {
      setOrders(data?.orders ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(o.id).includes(q) || (o.user_name || '').toLowerCase().includes(q) || (o.user_email || '').toLowerCase().includes(q)
  })

  const handleFilterChange = (s: string) => {
    setStatusFilter(s)
    load(s)
  }

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus, tracking?: string) => {
    setUpdatingId(orderId)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: newStatus, tracking_number: tracking || null }),
    })
    if (res.ok) {
      toast.success(`Order #${orderId} status updated to ${newStatus}`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_number: tracking || o.tracking_number } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, tracking_number: tracking || prev.tracking_number } : null)
      }
    } else toast.error('Failed to update order')
    setUpdatingId(null)
  }

  return (
    <AdminShell>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-white text-xl font-bold">Orders</h1>
          <p className="text-[#555] text-sm mt-0.5">{orders.length} orders total</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID or customer..."
              suppressHydrationWarning
              className="bg-[#111] border border-[#222] rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#d4a017] transition-colors w-64"
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleFilterChange('')}
              suppressHydrationWarning
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? 'bg-[#d4a017] text-black' : 'bg-[#111] border border-[#222] text-[#666] hover:text-white'}`}
            >
              All
            </button>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                suppressHydrationWarning
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-[#d4a017] text-black' : 'bg-[#111] border border-[#222] text-[#666] hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Orders table */}
          <div className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden min-w-0">
            {loading ? (
              <div className="py-20 text-center text-[#444] text-sm">Loading orders...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
                <p className="text-[#555] text-sm">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e1e]">
                      {['Order', 'Customer', 'Status', 'Total', 'Date', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || '') }}
                        className={`border-b border-[#181818] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#d4a017]/5' : 'hover:bg-[#151515]'}`}
                      >
                        <td className="px-4 py-3 text-[#888] font-mono text-xs">#{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{order.user_name || 'Guest'}</p>
                          <p className="text-[#555] text-xs truncate max-w-[140px]">{order.user_email || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_STYLE[order.status] ?? 'text-[#666] bg-[#1e1e1e] border-[#2a2a2a]'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#d4a017] font-semibold">{formatINR(order.total)}</td>
                        <td className="px-4 py-3 text-[#666] text-xs">{fmtDate(order.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={e => { e.stopPropagation(); handleStatusUpdate(order.id, e.target.value as OrderStatus) }}
                              disabled={updatingId === order.id}
                              onClick={e => e.stopPropagation()}
                              suppressHydrationWarning
                              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-2.5 pr-6 py-1 text-white text-xs focus:outline-none focus:border-[#d4a017] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555] pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order detail panel */}
          {selectedOrder && (
            <div className="w-72 flex-shrink-0 bg-[#111] border border-[#1e1e1e] rounded-xl p-4 space-y-4 self-start">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} suppressHydrationWarning className="text-[#555] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#555]">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_STYLE[selectedOrder.status] ?? ''}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555]">Total</span>
                  <span className="text-[#d4a017] font-semibold">{formatINR(selectedOrder.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555]">Date</span>
                  <span className="text-[#888] text-xs">{fmtDate(selectedOrder.created_at)}</span>
                </div>
              </div>

              <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
                <p className="text-[#555] text-xs uppercase tracking-wider font-medium">Customer</p>
                <p className="text-white text-sm">{selectedOrder.user_name || 'Guest'}</p>
                {selectedOrder.user_email && <p className="text-[#555] text-xs">{selectedOrder.user_email}</p>}
                {selectedOrder.shipping_name && <p className="text-[#666] text-xs">{selectedOrder.shipping_name}</p>}
                {selectedOrder.shipping_address && <p className="text-[#555] text-xs">{selectedOrder.shipping_address}</p>}
              </div>

              {/* Tracking number */}
              <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
                <p className="text-[#555] text-xs uppercase tracking-wider font-medium">Tracking Number</p>
                <div className="flex gap-2">
                  <input
                    value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                    placeholder="Enter tracking no."
                    suppressHydrationWarning
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder:text-[#444] focus:outline-none focus:border-[#d4a017] transition-colors"
                  />
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, selectedOrder.status, trackingInput)}
                    disabled={updatingId === selectedOrder.id}
                    suppressHydrationWarning
                    className="bg-[#d4a017]/15 hover:bg-[#d4a017]/25 disabled:opacity-50 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#d4a017]" />
                  </button>
                </div>
              </div>

              {/* Quick status update */}
              <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
                <p className="text-[#555] text-xs uppercase tracking-wider font-medium">Update Status</p>
                <div className="grid grid-cols-1 gap-1">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s || updatingId === selectedOrder.id}
                      suppressHydrationWarning
                      className={`text-xs px-3 py-1.5 rounded-lg text-left capitalize transition-colors disabled:cursor-default ${
                        selectedOrder.status === s
                          ? 'bg-[#d4a017]/15 text-[#d4a017] font-medium'
                          : 'text-[#666] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-50'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
