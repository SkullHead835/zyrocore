import { NextRequest, NextResponse } from 'next/server'

export const config = {
  // Only protect API admin routes at middleware level.
  // Page-level auth for /admin/* is handled inside the components via localStorage.
  matcher: ['/api/admin/:path*', '/secure-admin/:path*'],
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public admin auth API endpoints
  if (
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/signup' ||
    pathname === '/api/admin/auth/logout' ||
    pathname === '/secure-admin/login'
  ) {
    return NextResponse.next()
  }

  // For secure-admin pages, check session_id or adminToken cookie
  if (pathname.startsWith('/secure-admin')) {
    const token = req.cookies.get('session_id')?.value || req.cookies.get('adminToken')?.value
    if (!token) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/secure-admin/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // For /api/admin/* routes, check adminToken cookie, session_id cookie, OR Authorization header
  const token =
    req.cookies.get('adminToken')?.value ||
    req.cookies.get('session_id')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}
