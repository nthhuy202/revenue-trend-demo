import { NextResponse, type NextRequest } from "next/server";

// UX guard only — the API verifies the JWT on every admin request.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!request.cookies.has("token")) return NextResponse.redirect(new URL("/admin/login", request.url));

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
