import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AdminAuthProvider } from './admin-auth-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZYRØCORE — Admin Panel',
  description: 'Internal admin panel for Zyrocore',
  robots: 'noindex, nofollow',
}

export default function SecureAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
      <Toaster theme="dark" position="bottom-right" />
    </AdminAuthProvider>
  )
}
