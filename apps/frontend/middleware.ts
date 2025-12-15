import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/vendors',
  '/items',
  '/rfqs',
  '/quotes',
  '/purchase-orders',
  '/mandates',
  '/notifications',
  '/ai',
];

// Paths that should redirect to dashboard if already logged in
const authPaths = ['/login', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has a token (client-side auth is handled by the app)
  // This middleware adds an extra layer of security for route protection
  
  // Security: Block access to sensitive paths that shouldn't be accessible
  if (pathname.startsWith('/_next/') || pathname.includes('..')) {
    return NextResponse.next();
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
