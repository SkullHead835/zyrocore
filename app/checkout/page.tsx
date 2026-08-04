'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ChevronRight, Smartphone, Truck, Upload, CheckCircle2, Copy, MapPin, Loader2 } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils-shop'
import { useAuth } from '@/components/auth-provider'
import { getCurrentLocationAddress } from '@/lib/google-maps'
import { toast } from 'sonner'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json())
}

interface CartItem {
  id: number
  product_id: number
  quantity: number
  size: string | null
  name: string
  price: number
  discount_price: number | null
  images: string[]
}

interface PaymentSettings {
  upi_id: string
  qr_image_url: string
  business_name: string
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const screenshotRef = useRef<HTMLInputElement>(null)
  const { data: cartData } = useSWR('/api/cart', fetcher)
  const { data: paymentData } = useSWR('/api/payment-settings', fetcher)

  const items: CartItem[] = cartData?.items ?? []
  const paymentSettings: PaymentSettings | null = paymentData?.settings ?? null

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    address2: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const paymentMethod = 'UPI'
  const [orderId, setOrderId] = useState<number | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [step, setStep] = useState<'form' | 'upi_payment' | 'done'>('form')

  const subtotal = items.reduce((sum, item) => sum + (item.discount_price ?? item.price) * item.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + shipping

  const [locating, setLocating] = useState(false)

  const handleUseLocation = async () => {
    setLocating(true)
    const toastId = toast.loading('Detecting your GPS location...')
    try {
      const geo = await getCurrentLocationAddress()
      setForm(f => ({
        ...f,
        address: geo.address || f.address,
        address2: geo.address2 || f.address2,
        landmark: geo.locality || f.landmark,
        city: geo.city || f.city,
        district: geo.district || f.district,
        state: geo.state || f.state,
        pincode: geo.pincode || f.pincode,
        country: 'India',
      }))
      toast.success('Address auto-filled from your location!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to detect location', { id: toastId })
    } finally {
      setLocating(false)
    }
  }

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const copyUpiId = () => {
    if (paymentSettings?.upi_id) {
      navigator.clipboard.writeText(paymentSettings.upi_id)
      toast.success('UPI ID copied!')
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    if (!form.state) { toast.error('Please select your state'); return }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Enter a valid 10-digit Indian mobile number'); return }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit PIN code'); return }

    setPlacing(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.name,
        product_image: item.images?.[0] || null,
        price: item.discount_price ?? item.price,
        quantity: item.quantity,
        size: item.size,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ shipping: form, items: orderItems, payment_method: paymentMethod }),
      })
      const json = await res.json()

      if (res.ok) {
        if (paymentMethod === 'UPI') {
          setOrderId(json.orderId)
          setStep('upi_payment')
        } else {
          router.push(`/orders/${json.orderId}?success=1`)
        }
      } else {
        toast.error(json.error || 'Failed to place order')
      }
    } finally {
      setPlacing(false)
    }
  }

  const uploadScreenshot = async (file: File) => {
    if (!orderId) return
    setUploadingScreenshot(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('order_id', String(orderId))
    const res = await fetch('/api/orders/upload-payment', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    setUploadingScreenshot(false)
    if (!res.ok) { toast.error('Screenshot upload failed'); return }
    const { url } = await res.json()
    setScreenshotUrl(url)
    toast.success('Screenshot uploaded!')
  }

  const handleConfirmPayment = async () => {
    if (!screenshotUrl) { toast.error('Please upload your payment screenshot first'); return }
    setStep('done')
  }

  // UPI payment step
  if (step === 'upi_payment' && paymentSettings) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-lg mx-auto px-4 py-10">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold mb-1">Complete Your Payment</h1>
                <p className="text-sm text-muted-foreground">Order #{orderId} · {formatPrice(total)}</p>
              </div>

              <div className="bg-muted/40 rounded-xl p-4 flex flex-col items-center gap-3">
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-border bg-white">
                  <Image src={paymentSettings.qr_image_url} alt="UPI QR Code" fill className="object-contain p-2" sizes="192px" />
                </div>
                <p className="text-xs text-muted-foreground">Scan with any UPI app to pay</p>
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 w-full justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">UPI ID</p>
                    <p className="text-sm font-mono font-medium">{paymentSettings.upi_id}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyUpiId} suppressHydrationWarning>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {paymentSettings.business_name && (
                  <p className="text-xs text-muted-foreground">Pay to: <strong>{paymentSettings.business_name}</strong></p>
                )}
                <Badge variant="outline" className="text-base font-bold px-4 py-1">
                  {formatPrice(total)}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">After payment, upload your screenshot</p>
                {screenshotUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800">Screenshot uploaded</p>
                      <p className="text-xs text-green-600 truncate">{screenshotUrl.split('/').pop()}</p>
                    </div>
                    <button onClick={() => setScreenshotUrl('')} className="text-xs text-green-700 underline" suppressHydrationWarning>Change</button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={screenshotRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadScreenshot(f); e.target.value = '' }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed"
                      disabled={uploadingScreenshot}
                      onClick={() => screenshotRef.current?.click()}
                      suppressHydrationWarning
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingScreenshot ? 'Uploading...' : 'Upload Payment Screenshot'}
                    </Button>
                  </>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!screenshotUrl}
                onClick={handleConfirmPayment}
                suppressHydrationWarning
              >
                Confirm Payment & Place Order
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your order will be confirmed once the admin verifies your payment screenshot.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Order done
  if (step === 'done') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground text-sm mb-2">Order #{orderId}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Thank you! Your payment screenshot has been submitted. We will verify and confirm your order shortly.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild><Link href={`/orders/${orderId}`}>View Order</Link></Button>
              <Button variant="outline" asChild><Link href="/products">Continue Shopping</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Sign in to checkout</h1>
            <Button asChild className="mt-3"><Link href="/login">Sign In</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/cart" className="hover:text-foreground">Cart</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>

          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping address */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <h2 className="font-semibold text-lg">Delivery Address</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseLocation}
                      disabled={locating}
                      suppressHydrationWarning
                      className="text-xs flex items-center gap-1.5 border-foreground/30 hover:border-foreground"
                    >
                      {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-red-500" />}
                      {locating ? 'Locating...' : 'Use My Current Location'}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g. Rahul Sharma" suppressHydrationWarning />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-lg border border-border bg-muted text-sm text-muted-foreground flex-shrink-0">+91</span>
                        <Input id="phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, ''))} required placeholder="9876543210" suppressHydrationWarning />
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="address">Address Line 1 *</Label>
                      <Input id="address" value={form.address} onChange={e => handleChange('address', e.target.value)} required placeholder="House No., Building, Street" suppressHydrationWarning />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="address2">Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="address2" value={form.address2} onChange={e => handleChange('address2', e.target.value)} placeholder="Apartment, floor, area, locality" suppressHydrationWarning />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="landmark">Landmark <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="landmark" value={form.landmark} onChange={e => handleChange('landmark', e.target.value)} placeholder="Near bus stop, school, etc." suppressHydrationWarning />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input id="pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, ''))} required placeholder="600001" suppressHydrationWarning />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City / Town *</Label>
                      <Input id="city" value={form.city} onChange={e => handleChange('city', e.target.value)} required placeholder="Chennai" suppressHydrationWarning />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="district">District <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="district" value={form.district} onChange={e => handleChange('district', e.target.value)} placeholder="Chennai" suppressHydrationWarning />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State *</Label>
                      <Select value={form.state} onValueChange={v => handleChange('state', v)} required>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value="India" readOnly className="bg-muted text-muted-foreground cursor-not-allowed" suppressHydrationWarning />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                  <div className="grid sm:grid-cols-1 gap-3">
                    {/* UPI option */}
                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-foreground bg-foreground/5 text-left">
                      <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">UPI Payment (Instant QR / VPA)</p>
                        <p className="text-xs text-muted-foreground">Scan QR code or pay via UPI ID and upload payment screenshot</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 ml-auto text-foreground flex-shrink-0" />
                    </div>
                  </div>

                  {paymentSettings && (
                    <div className="mt-4 p-3 bg-muted/40 rounded-lg flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-white flex-shrink-0">
                        <Image src={paymentSettings.qr_image_url} alt="QR" fill className="object-contain p-0.5" sizes="40px" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Pay to: {paymentSettings.business_name || 'ZYRØCORE'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{paymentSettings.upi_id}</p>
                      </div>
                    </div>
                  )}
                  {!paymentSettings && (
                    <p className="mt-3 text-xs text-muted-foreground">UPI payment details will be shown after placing the order.</p>
                  )}
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {items.map(item => {
                      const price = item.discount_price ?? item.price
                      return (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            {item.images?.[0] && (
                              <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="48px" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                            {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium flex-shrink-0">{formatPrice(price * item.quantity)}</p>
                        </div>
                      )
                    })}
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                        {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">Free delivery on orders above {formatPrice(999)}</p>
                    )}
                  </div>
                  <Separator className="mb-4" />
                  <div className="flex justify-between font-bold text-lg mb-5">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={placing || items.length === 0} suppressHydrationWarning>
                    {placing ? 'Placing Order...' : paymentMethod === 'UPI' ? 'Proceed to Pay' : 'Place Order'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">All prices include GST</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
