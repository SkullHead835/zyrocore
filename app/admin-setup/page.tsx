'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'

export default function AdminSetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', secret: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required')
      return
    }
    if (form.secret !== 'ZYROCORE2026') {
      toast.error('Incorrect admin secret key')
      return
    }
    setLoading(true)
    // Register the user first
    const regRes = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    if (!regRes.ok) {
      const err = await regRes.json()
      toast.error(err.error || 'Registration failed')
      setLoading(false)
      return
    }
    // Promote to admin
    const promoteRes = await fetch('/api/auth/setup-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, secret: form.secret }),
    })
    setLoading(false)
    if (promoteRes.ok) {
      toast.success('Admin account created! Please log in.')
      router.push('/login')
    } else {
      toast.error('Failed to grant admin role')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-foreground mb-4">
            <ShieldCheck className="w-6 h-6 text-background" />
          </div>
          <h1 className="text-2xl font-bold">Admin Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">Create the first admin account for ZYRØCORE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Admin Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@zyrocore.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="secret">Admin Secret Key</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Enter admin secret key"
              value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">Secret: ZYROCORE2026</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
