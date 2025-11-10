import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Skip middleware for login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check if user is admin for other admin routes
    const isAdmin = token?.email === 'niyateshaukkalyan@gmail.com';
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Always allow login page
        if (pathname === '/admin/login') {
          return true;
        }
        
        // For other admin routes, just check if logged in
        // The actual admin check happens in the middleware function above
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};