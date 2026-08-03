'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import ZyrocoreLogo from '@/components/zyrocore-logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        setError(data.error || 'Login failed')
        return
      }
      if (data.user?.role !== 'admin') {
        toast.error('Access denied. Admin account required.')
        setError('Access denied. Admin accounts only.')
        return
      }
      if (data.token) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('userToken', data.token)
      }
      toast.success('Welcome back!')
      router.push('/secure-admin')
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl border border-neutral-200 mb-4 inline-block shadow-sm">
            <ZyrocoreLogo showTagline size="md" invertInDark={false} className="text-black" />
          </div>
          <h1 className="text-neutral-900 text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-neutral-500 text-sm mt-1">Sign in to your ZYRØCORE admin account</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@zyrocore.in"
                  required
                  suppressHydrationWarning
                  className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  suppressHydrationWarning
                  className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-10 py-2.5 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  suppressHydrationWarning
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-black hover:bg-neutral-900 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-400 text-xs mt-6">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
