import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('token')?.value;
  return !!token;
}

/**
 * Chuyển hướng người dùng đã đăng nhập đến trang messages
 * nếu họ cố gắng truy cập các trang không yêu cầu xác thực
 */
export function redirectAuthenticatedUser(request: NextRequest): NextResponse | null {
  if (isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/messages', request.url));
  }
  return null;
}
