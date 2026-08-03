'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Search, CheckCircle2, XCircle, ImageIcon } from 'lucide-react'
import AdminLayout from '../admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils-shop'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/lib/types'

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function paymentStatusBadge(status: string | null, method: string | null) {
  if (method === 'COD') return <Badge variant="outline" className="text-xs">COD</Badge>
  if (!status || status === 'pending') return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300 bg-yellow-50">Awaiting Payment</Badge>
  if (status === 'submitted') return <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50">Screenshot Submitted</Badge>
  if (status === 'confirmed') return <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">Payment Confirmed</Badge>
  if (status === 'rejected') return <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">Payment Rejected</Badge>
  return <Badge variant="outline" className="text-xs capitalize">{status}</Badge>
}

export default function AdminOrdersPage() {
  const [ready, setReady] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order & { payment_method?: string; payment_status?: string; payment_screenshot?: string } | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [tracking, setTracking] = useState('')
  const [updating, setUpdating] = useState(false)
  const [reviewingPayment, setReviewingPayment] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) window.location.replace('/admin/login')
    else setReady(true)
  }, [])

  const url = statusFilter ? `/api/admin/orders?status=${statusFilter}` : '/api/admin/orders'
  const { data, isLoading, mutate } = useSWR(ready ? url : null, fetcher)
  const orders = data?.orders ?? []

  const openOrder = (order: typeof selectedOrder) => {
    setSelectedOrder(order)
    setNewStatus((order?.status as OrderStatus) || 'pending')
    setTracking(order?.tracking_number || '')
  }

  const handleUpdate = async () => {
    if (!selectedOrder) return
    setUpdating(true)
    const token = localStorage.getItem('adminToken')
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ status: newStatus, tracking_number: tracking }),
    })
    setUpdating(false)
    if (res.ok) { toast.success('Order updated'); setSelectedOrder(null); mutate() }
    else toast.error('Failed to update order')
  }

  const handlePaymentAction = async (action: 'confirmed' | 'rejected') => {
    if (!selectedOrder) return
    setReviewingPayment(true)
    const token = localStorage.getItem('adminToken')
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ payment_status: action }),
    })
    setReviewingPayment(false)
    if (res.ok) {
      toast.success(action === 'confirmed' ? 'Payment confirmed — order set to Confirmed' : 'Payment rejected')
      setSelectedOrder(null)
      mutate()
    } else {
      toast.error('Failed to update payment status')
    }
  }

  const filtered = orders.filter((o: Order & { user_name?: string; user_email?: string }) =>
    o.id.toString().includes(search) ||
    (o.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.user_email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!ready) return null

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} total orders</p>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="pl-9" suppressHydrationWarning />
          </div>
          <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44" suppressHydrationWarning>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders found</td>
                  </tr>
                ) : filtered.map((order: Order & { payment_method?: string; payment_status?: string; user_name?: string; user_email?: string }) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user_name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs capitalize ${getOrderStatusColor(order.status)}`}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {paymentStatusBadge(order.payment_status ?? null, order.payment_method ?? null)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" onClick={() => openOrder(order)}>Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-1">
              {/* Order info */}
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> {selectedOrder.user_name}</p>
                <p><span className="text-muted-foreground">Total:</span> {formatPrice(selectedOrder.total)}</p>
                <p><span className="text-muted-foreground">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                <p><span className="text-muted-foreground">Payment:</span> {selectedOrder.payment_method || 'COD'}</p>
                {selectedOrder.shipping_address && (
                  <p><span className="text-muted-foreground">Ship to:</span> {selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                )}
              </div>

              {/* UPI Screenshot Review */}
              {selectedOrder.payment_method === 'UPI' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Payment Screenshot</h3>
                      {paymentStatusBadge(selectedOrder.payment_status ?? null, 'UPI')}
                    </div>
                    {selectedOrder.payment_screenshot ? (
                      <>
                        <a href={selectedOrder.payment_screenshot} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted hover:opacity-90 transition-opacity">
                            <Image
                              src={selectedOrder.payment_screenshot}
                              alt="Payment screenshot"
                              fill
                              className="object-contain"
                              sizes="400px"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-center">Click to view full size</p>
                        </a>
                        {selectedOrder.payment_status === 'submitted' && (
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handlePaymentAction('confirmed')}
                              disabled={reviewingPayment}
                              suppressHydrationWarning
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirm Payment
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handlePaymentAction('rejected')}
                              disabled={reviewingPayment}
                              suppressHydrationWarning
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {selectedOrder.payment_status === 'confirmed' && (
                          <p className="text-xs text-green-600 font-medium text-center">Payment has been confirmed</p>
                        )}
                        {selectedOrder.payment_status === 'rejected' && (
                          <p className="text-xs text-red-600 font-medium text-center">Payment was rejected</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                        <ImageIcon className="w-4 h-4 flex-shrink-0" />
                        Customer has not uploaded a payment screenshot yet
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Status & tracking */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Order Status</Label>
                  <Select value={newStatus} onValueChange={v => setNewStatus(v as OrderStatus)}>
                    <SelectTrigger suppressHydrationWarning><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tracking Number</Label>
                  <Input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="e.g. 1Z999AA10123456784" suppressHydrationWarning />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating} suppressHydrationWarning>
              {updating ? 'Updating...' : 'Update Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
