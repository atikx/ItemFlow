import { NextResponse, NextRequest } from 'next/server';

// Middleware function
export function middleware(request: NextRequest) {
  const token = request.cookies.get('org_id')?.value;
  console.log('Middleware: Token:', token);
  const url = request.nextUrl;
  const path = url.pathname;

  const isAuthPage = path.startsWith('/auth');
  const publicRoutes = ['/', '/about', '/contact']; // define your public pages here
  const isProtectedRoute = !isAuthPage && !publicRoutes.includes(path);

  // ✅ If user is logged in and tries to access /auth/* → redirect to /home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // ✅ If user is NOT logged in and tries to access a protected route → redirect to /auth/login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // ✅ Allow the request to continue
  return NextResponse.next();
}

// Matcher config
export const config = {
  matcher: [
    '/',              
    '/home',         
    '/auth/:path*',   
    '/members', 
    '/items',       
    '/departments',      
    '/events',      
  ],
};
