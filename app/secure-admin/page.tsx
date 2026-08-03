'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from './admin-shell'
import {
  IndianRupee, ShoppingBag, Package, AlertTriangle,
  CalendarClock, ArrowUpRight, TrendingUp, PackagePlus,
  ClipboardList, Layers, BarChart2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Stats {
  revenue: number
  orders: number
  users: number
  products: number
  lowStock: number
}

interface RecentOrder {
  id: number
  status: string
  total: number
  created_at: string
  user_name: string | null
}

interface StatusCount {
  status: string
  count: string
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(s))
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-indigo-400 bg-indigo-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

const StatCard = ({ label, value, icon: Icon, sub, gold }: {
  label: string; value: string; icon: React.ElementType; sub?: string; gold?: boolean
}) => (
  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${gold ? 'bg-[#d4a017]/15' : 'bg-[#1e1e1e]'}`}>
      <Icon className={`w-5 h-5 ${gold ? 'text-[#d4a017]' : 'text-[#666]'}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${gold ? 'text-[#d4a017]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#555] mt-0.5">{sub}</p>}
    </div>
  </div>
)

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    fetch('/api/admin/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStats(data.stats)
          setRecentOrders(data.recentOrders || [])
          setStatusCounts(data.ordersByStatus || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = statusCounts.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    orders: parseInt(s.count),
  }))

  return (
    <AdminShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Dashboard</h1>
            <p className="text-[#555] text-sm mt-0.5">Welcome back. Here is what is happening today.</p>
          </div>
          <Link
            href="/secure-admin/products/new"
            className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#e6b01e] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Revenue" value={loading ? '...' : formatINR(stats?.revenue ?? 0)} icon={IndianRupee} gold sub="All time" />
          <StatCard label="Total Orders" value={loading ? '...' : String(stats?.orders ?? 0)} icon={ShoppingBag} sub="All time" />
          <StatCard label="Products" value={loading ? '...' : String(stats?.products ?? 0)} icon={Package} sub="In catalogue" />
          <StatCard label="Customers" value={loading ? '...' : String(stats?.users ?? 0)} icon={TrendingUp} sub="Registered" />
          <StatCard
            label="Low Stock"
            value={loading ? '...' : String(stats?.lowStock ?? 0)}
            icon={AlertTriangle}
            sub={stats?.lowStock ? 'Products need restock' : 'All stocked up'}
          />
        </div>

        {/* Charts + Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by status chart */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-4">Orders by Status</h2>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[#444] text-sm">No orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }}
                    cursor={{ fill: '#ffffff08' }}
                  />
                  <Bar dataKey="orders" fill="#d4a017" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-sm font-semibold">Recent Orders</h2>
              <Link href="/secure-admin/orders" className="text-[#d4a017] text-xs hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[#444] text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#888] text-xs font-mono">#{order.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${STATUS_COLOR[order.status] ?? 'text-[#666] bg-[#1e1e1e]'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium truncate mt-0.5">{order.user_name || 'Guest'}</p>
                      <p className="text-[#555] text-xs">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#d4a017] font-semibold text-sm">{formatINR(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/secure-admin/products/new', label: 'Add New Product', icon: PackagePlus },
            { href: '/secure-admin/products',     label: 'Manage Products',  icon: Package },
            { href: '/secure-admin/orders',        label: 'View Orders',      icon: ClipboardList },
            { href: '/secure-admin/inventory',     label: 'Check Inventory',  icon: Layers },
            { href: '/secure-admin/analytics',     label: 'Analytics',        icon: BarChart2 },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-[#111] border border-[#1e1e1e] hover:border-[#d4a017]/40 rounded-xl p-4 flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-[#1e1e1e] group-hover:bg-[#d4a017]/15 rounded-lg flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4 text-[#666] group-hover:text-[#d4a017] transition-colors" />
              </div>
              <span className="text-[#888] group-hover:text-white text-sm font-medium transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
