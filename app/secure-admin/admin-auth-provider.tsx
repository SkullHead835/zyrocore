'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '@/lib/types'

interface AdminAuthCtx {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthCtx>({ user: null, loading: true, logout: async () => {} })

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) : null
    fetch('/api/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/secure-admin/login'
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
