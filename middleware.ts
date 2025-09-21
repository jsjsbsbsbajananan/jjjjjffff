import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin-site") && !request.nextUrl.pathname.startsWith("/admin-site/login")) {
    // Check if user is authenticated (this is a basic check)
    // In a real app, you'd validate a JWT token or session
    const adminAuth = request.cookies.get("adminAuthenticated")

    if (!adminAuth) {
      return NextResponse.redirect(new URL("/admin-site/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin-site/:path*"],
}
