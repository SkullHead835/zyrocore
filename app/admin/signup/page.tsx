'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, KeyRound } from 'lucide-react'

export default function AdminSignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', secretCode: '' })
  const [showPw, setShowPw] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }
      localStorage.setItem('adminToken', data.token)
      window.location.replace('/admin/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Admin Name' },
    { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'admin@zyrocore.com' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpeg"
              alt="ASP Fashions Admin"
              className="h-20 w-auto object-contain rounded-xl shadow-lg shadow-black/40"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ASP <span className="text-[#d4a017]">Admin</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Create your admin account</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    required
                    suppressHydrationWarning
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4a017]/50 focus:ring-1 focus:ring-[#d4a017]/20 transition-colors"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  required
                  suppressHydrationWarning
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4a017]/50 focus:ring-1 focus:ring-[#d4a017]/20 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} suppressHydrationWarning
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Secret Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Admin Secret Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={form.secretCode}
                  onChange={set('secretCode')}
                  placeholder="Enter secret code"
                  required
                  suppressHydrationWarning
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4a017]/50 focus:ring-1 focus:ring-[#d4a017]/20 transition-colors"
                />
                <button type="button" onClick={() => setShowSecret(!showSecret)} suppressHydrationWarning
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showSecret ? 'Hide code' : 'Show code'}>
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-white/25">Required to create an admin account.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-[#d4a017] hover:bg-[#b8891a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-4">
          Already have an account?{' '}
          <Link href="/admin/login" className="text-[#d4a017]/70 hover:text-[#d4a017] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
