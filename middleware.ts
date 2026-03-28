import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  if (isMaintenanceMode) {
    if (
      pathname === "/maintenance" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // Admin routes - require ADMIN role (NextAuth JWT)
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (pathname === "/admin/login") {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Applicant routes - require member_session cookie
  if (pathname.startsWith("/applicant")) {
    const memberSession = request.cookies.get("member_session")?.value;

    // Allow login and register pages
    if (
      pathname === "/applicant/login" ||
      pathname === "/applicant/register"
    ) {
      if (memberSession) {
        return NextResponse.redirect(
          new URL("/applicant/dashboard", request.url)
        );
      }
      return NextResponse.next();
    }

    // Protect all other applicant routes
    if (!memberSession) {
      return NextResponse.redirect(
        new URL("/applicant/login", request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
