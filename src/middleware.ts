import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  const path = request.nextUrl.pathname;

  // Define protected routes that require ANY valid login
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/superadmin') ||
    path.startsWith('/customers') ||
    path.startsWith('/enquiries') ||
    path.startsWith('/notifications') ||
    path.startsWith('/settings');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/enquiry', request.url));
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/enquiry', request.url));
      response.cookies.delete('admin_session');
      return response;
    }

    // --- Role-Based Access Control (RBAC) ---
    const role = payload.role as string;
    
    // Block regular ADMINs from accessing Super Admin areas
    if (path.startsWith('/superadmin') && role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect SUPERADMINs away from regular admin areas to their specific portal
    // (Optional, but keeps things clean)
    if ((path.startsWith('/dashboard') || path === '/') && role === 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // Prevent logged-in users from accessing the login page
  if (path === '/login' && token) {
    const payload = await verifyJwt(token);
    if (payload) {
      if (payload.role === 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except API, static files, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
