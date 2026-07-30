import { NextResponse } from 'next/server';

export function middleware(request) {
  // If the user is trying to access an admin route...
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to the login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for the admin auth cookie
    const token = request.cookies.get('admin_token');

    // If there's no token or it's empty, redirect to the login page
    if (!token || !token.value) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
