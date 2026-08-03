import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AdminAuthProvider } from './admin-auth-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ASP Fashions — Admin',
  description: 'Internal admin panel for ASP Fashions',
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
