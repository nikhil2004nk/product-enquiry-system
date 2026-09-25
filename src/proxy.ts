import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-super-secret-key-12345"
);

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session");
  let isValidSession = false;

  if (sessionCookie?.value) {
    try {
      await jwtVerify(sessionCookie.value, JWT_SECRET);
      isValidSession = true;
    } catch (err) {
      isValidSession = false;
    }
  }

  // Protect these routes (including the admin enquiry page)
  const protectedPaths = ["/dashboard", "/enquiries", "/customers", "/admin", "/admin-enquiry"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !isValidSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect / to /dashboard if logged in, else to /enquiry
  if (request.nextUrl.pathname === "/") {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/enquiry", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
