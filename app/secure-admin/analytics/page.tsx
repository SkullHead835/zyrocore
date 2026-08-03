'use client'

import { useEffect, useState } from 'react'
import AdminShell from '../admin-shell'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend,
} from 'recharts'
import { TrendingUp, Package, Star } from 'lucide-react'

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/analytics', { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([statsData, analyticsData]) => {
      if (statsData) setStats(statsData.stats)
      if (analyticsData) setTopProducts(analyticsData.topProducts || [])
    }).finally(() => setLoading(false))
  }, [])

  const statusData = stats ? [] : []

  return (
    <AdminShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-white text-xl font-bold">Analytics</h1>
          <p className="text-[#555] text-sm mt-0.5">Business insights and performance overview</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: loading ? '...' : formatINR(stats?.revenue ?? 0), icon: TrendingUp, gold: true },
            { label: 'Total Orders', value: loading ? '...' : String(stats?.orders ?? 0), icon: Package },
            { label: 'Products Listed', value: loading ? '...' : String(stats?.products ?? 0), icon: Star },
          ].map(({ label, value, icon: Icon, gold }) => (
            <div key={label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gold ? 'bg-[#d4a017]/15' : 'bg-[#1e1e1e]'}`}>
                <Icon className={`w-5 h-5 ${gold ? 'text-[#d4a017]' : 'text-[#666]'}`} />
              </div>
              <div>
                <p className="text-[#555] text-xs uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold ${gold ? 'text-[#d4a017]' : 'text-white'}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products table */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-4">Best Selling Products</h2>
          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-[#444] text-sm">
              No sales data yet. Orders will appear here once customers purchase products.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#1e1e1e]">
                    {['Product', 'Units Sold', 'Revenue'].map(h => (
                      <th key={h} className="pb-3 text-xs font-medium text-[#555] uppercase tracking-wider pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p: any, i) => (
                    <tr key={i} className="border-b border-[#1a1a1a] last:border-0">
                      <td className="py-3 text-white pr-4">{p.product_name}</td>
                      <td className="py-3 text-[#888] pr-4">{p.total_qty}</td>
                      <td className="py-3 text-[#d4a017] font-medium">{formatINR(p.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly revenue note */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h2 className="text-white text-sm font-semibold mb-2">Monthly Sales Summary</h2>
          <p className="text-[#444] text-sm py-8 text-center">
            Monthly chart will populate as orders come in over time.
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
