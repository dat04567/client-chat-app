import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

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

// Handler for /messages path exact match
async function handleMessagesPath(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // If not logged in, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Skip redirect for API requests to avoid interfering with data fetching
  const isApiRequest = request.headers.get('x-requested-with') === 'XMLHttpRequest' || 
                      request.headers.get('accept')?.includes('application/json');
  
  if (isApiRequest) {
    return NextResponse.next();
  }
  
  try {
    // Get the most recent conversation and redirect to it
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    
    const response = await fetch(`${apiUrl}/conversations`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });
    
    if (!response.ok) {
      // If API request fails, just continue to messages page
      return NextResponse.next();
    }
    
    const data = await response.json();
    const conversations = data.conversations || [];
    
    // If there are conversations, redirect to the most recent one
    if (conversations.length > 0 && conversations[0].conversationId) {
      return NextResponse.redirect(new URL(`/messages/${conversations[0].conversationId}`, request.url));
    }
  } catch (error) {
    // In case of error, continue to regular messages page
    console.error("Error in middleware when fetching conversations:", error);
  }
  
  // If no conversations or there was an error, continue to regular messages page
  return NextResponse.next();
}

// Map paths to their handlers
const pathHandlers: Record<string, (request: NextRequest) => Promise<NextResponse> | NextResponse> = {
  '/': handleRootPath,
  '/verify-email': handleVerifyEmailPath,
  '/dashboard': handleProtectedRoutes,
  '/messages': handleMessagesPath,
  '/contacts': handleProtectedRoutes,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for exact path matches
  if (pathHandlers[pathname]) {
    return pathHandlers[pathname](request);
  }
  
  // Check for path prefixes
  for (const path in pathHandlers) {
    // Skip /messages exact path check for sub-paths like /messages/[conversationId]
    if (path === '/messages' && pathname.startsWith('/messages/')) {
      return handleProtectedRoutes(request);
    }
    
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
    '/messages',
    '/messages/:path*',
    '/contacts/:path*',
  ],
};