import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Fetch the absolute valid session from your Better Auth instance
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // --- PATHWAY A: AUTHENTICATED GUEST PROTECTION ---
  // If a logged-in user tries to manually visit sign-in or register, kick them back out to home
  const authRoutes = ["/sign-in", "/sign-up"];
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // --- PATHWAY B: PROTECTED CUSTOMER PIPELINE ---
  // If a visitor tries to view account or checkout without a session, force-route them to authenticate
  const protectedRoutes = ["/account", "/checkout"];
  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    url.pathname = "/sign-in";
    // Pass the target path along so they return directly after completing login
    const callbackPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.searchParams.set("callbackUrl", callbackPath);
    return NextResponse.redirect(url);
  }

  // --- PATHWAY C: ADMIN SECURITY ---
  // Admin portal requires authenticated admin role.
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      url.pathname = "/"; // Unauthorized entry sends them straight back to main index canvas
      return NextResponse.redirect(url);
    }
  }

  // Fallthrough: If all guard conditions pass successfully, continue serving the user's destination pipeline
  return NextResponse.next();
}

// Global Matcher Config to catch any core workflows without matching static system asset files
export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
