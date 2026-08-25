import { auth } from './app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Public routes
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/unauthorized'
  ) {
    return NextResponse.next()
  }

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/today')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Admin only
  if (session && request.nextUrl.pathname.startsWith('/admin')) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user?.email !== adminEmail) {
      return NextResponse.redirect(new URL('/today', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.svg|manifest.json|icons/.*|robots.txt).*)',
  ],
}
