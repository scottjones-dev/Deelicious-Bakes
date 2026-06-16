import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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
    const authRoutes = ["/sign-in", "/register"];
    if (session && authRoutes.some((route) => pathname.startsWith(route))) {
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    // --- PATHWAY B: PROTECTED CHECKOUT ENGINE ---
    // If a visitor tries to view checkout without an account session, force-route them to authenticate
    if (!session && pathname.startsWith("/checkout")) {
        url.pathname = "/sign-in";
        // Optional: Pass the target path along so they return directly to checkout after completing login
        url.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(url);
    }

    // --- PATHWAY C: STRATIFIED ADMIN SECURITY ---
    // If anyone tries to access the admin portal, they must be authenticated and explicitly have the "admin" role
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
        "/checkout/:path*",
        "/admin/:path*",
        "/sign-in",
        "/register"
    ],
};