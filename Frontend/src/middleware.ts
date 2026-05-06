import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Các trang cần đăng nhập
const PROTECTED_ROUTES = ["/scan", "/profile", "/favorites", "/history", "/settings"]

// Các trang chỉ dành cho admin
const ADMIN_ROUTES = ["/admin"]

// Các trang chỉ dành cho guest (chưa đăng nhập)
const GUEST_ONLY_ROUTES = ["/login", "/register", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Đọc access token từ cookie (Next.js middleware không đọc được localStorage)
  // Token được lưu vào cookie khi đăng nhập
  const token = request.cookies.get("access_token")?.value

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))

  // Chưa đăng nhập mà vào trang protected → redirect login
  if ((isProtected || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Đã đăng nhập mà vào trang guest-only → redirect home
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/scan/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
}
