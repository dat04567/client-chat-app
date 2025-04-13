import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Handler for root path
function handleRootPath(request: NextRequest) {
  // Kiểm tra token trong cookie
  const token = request.cookies.get('token')?.value;
  
  // Nếu đã có token (đã đăng nhập), chuyển hướng đến dashboard
  if (token) {
    return NextResponse.redirect(new URL('/messages', request.url));
  }
  
  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  return NextResponse.redirect(new URL('/login', request.url));
}

// Handler for verify-email path
function handleVerifyEmailPath(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const email = request.cookies.get('pendingVerificationEmail')?.value;

  if (email) {
    return NextResponse.next();
  }

  // We will check for email in the server component since it might be stored in session
  // If token or userId is missing, redirect to register page
  if (!token || !userId) {    
    return NextResponse.redirect(new URL('/register', request.url));
  }
  
  return NextResponse.next();
}

// Handler for protected routes
function handleProtectedRoutes(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Nếu không có token, chuyển hướng đến trang login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Add more path handlers here as needed
// function handleAnotherPath(request: NextRequest) { ... }

// Map paths to their handlers
const pathHandlers: Record<string, (request: NextRequest) => NextResponse> = {
  '/': handleRootPath,
  '/verify-email': handleVerifyEmailPath,
  '/dashboard': handleProtectedRoutes,
  '/messages': handleProtectedRoutes,
  '/contacts': handleProtectedRoutes,
  // Add more paths and their handlers here
  // '/another-path': handleAnotherPath,
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for exact path matches
  if (pathHandlers[pathname]) {
    return pathHandlers[pathname](request);
  }
  
  // Check for path prefixes
  for (const path in pathHandlers) {
    if (path !== '/' && pathname.startsWith(path)) {
      return pathHandlers[path](request);
    }
  }
  
  return NextResponse.next();
}

// Configure matcher to apply this middleware
export const config = {
  matcher: [
    '/', 
    '/verify-email/:path*',
    '/dashboard/:path*',
    '/messages/:path*',
    '/contacts/:path*',
    // Add more paths here as needed
  ],
};