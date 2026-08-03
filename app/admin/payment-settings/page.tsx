'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Upload, Save, QrCode, ImageIcon } from 'lucide-react'
import AdminLayout from '../admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Image from 'next/image'

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

export default function AdminPaymentSettingsPage() {
  const [ready, setReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [upiId, setUpiId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) window.location.replace('/admin/login')
    else setReady(true)
  }, [])

  const { data, isLoading, mutate } = useSWR(ready ? '/api/admin/payment-settings' : null, fetcher)

  useEffect(() => {
    if (data?.settings) {
      setUpiId(data.settings.upi_id || '')
      setBusinessName(data.settings.business_name || '')
      setQrUrl(data.settings.qr_image_url || '')
    }
  }, [data])

  const uploadQR = async (file: File) => {
    setUploading(true)
    const token = localStorage.getItem('adminToken')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    setUploading(false)
    if (!res.ok) { toast.error('QR image upload failed'); return }
    const { url } = await res.json()
    setQrUrl(url)
    toast.success('QR image uploaded')
  }

  const handleSave = async () => {
    if (!upiId.trim()) { toast.error('UPI ID is required'); return }
    if (!qrUrl) { toast.error('Please upload a QR code image'); return }
    setSaving(true)
    const token = localStorage.getItem('adminToken')
    const res = await fetch('/api/admin/payment-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ upi_id: upiId.trim(), qr_image_url: qrUrl, business_name: businessName.trim() }),
    })
    const json = await res.json()
    setSaving(false)
    if (res.ok) {
      toast.success('Payment settings saved')
      mutate()
    } else {
      toast.error(json.error || 'Failed to save settings')
    }
  }

  if (!ready) return null

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your UPI payment details for customers</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-48" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="w-4 h-4" /> UPI Details
                </CardTitle>
                <CardDescription>Customers will see this when paying via UPI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Business / Name</Label>
                  <Input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Zyrocore Men's Shirt"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>UPI ID <span className="text-destructive">*</span></Label>
                  <Input
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-muted-foreground">e.g. aspfashion@paytm or 9876543210@ybl</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4" /> QR Code Image
                </CardTitle>
                <CardDescription>Upload the UPI QR code customers will scan to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrUrl && (
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-border bg-muted">
                    <Image src={qrUrl} alt="UPI QR Code" fill className="object-contain p-2" sizes="192px" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadQR(f); e.target.value = '' }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  suppressHydrationWarning
                  className="border-dashed"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : qrUrl ? 'Replace QR Image' : 'Upload QR Image'}
                </Button>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving} suppressHydrationWarning className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
