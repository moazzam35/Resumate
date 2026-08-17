import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

let JWT_SECRET = null;

function getJwtSecret() {
  if (JWT_SECRET) return JWT_SECRET;
  const raw = process.env.JWT_SECRET;
  if (!raw || raw === "undefined" || raw.length < 32) return null;
  JWT_SECRET = new TextEncoder().encode(raw);
  return JWT_SECRET;
}

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

const GUEST_ALLOWED_PAGES = [
  "/",
  "/features",
  "/faq",
  "/contact",
  "/about",
  "/privacy",
  "/terms",
  "/security",
  "/templates",
  "/help",
  "/support",
  "/pricing",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  "/twitter-image",
];

const GUEST_ALLOWED_API = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
  "/api/ats-score",
  "/api/ats-improve",
  "/api/extract-text",
  "/api/upload",
  "/api/templates",
  "/api/contact",
  "/api/support",
];

function matchPathname(pathname, routes) {
  return routes.some((route) => {
    if (route === "/") return pathname === "/";
    if (route.endsWith("/")) return pathname.startsWith(route);
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isStaticAsset(pathname) {
  return pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".avif") ||
    pathname.endsWith(".ico");
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  if (!token) {
    token = request.cookies.get("token")?.value;
  }

  let payload = null;
  const secret = getJwtSecret();
  if (token && secret) {
    try {
      const result = await jwtVerify(token, secret, {
        issuer: "ai-resume-builder",
      });
      payload = result.payload;
    } catch {
      // token invalid
    }
  }

  const isAuthenticated = !!payload;
  const role = payload?.role || "USER";

  // If authenticated and visiting auth pages, redirect based on role
  if (isAuthenticated && matchPathname(pathname, AUTH_PAGES)) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If admin visits root "/", redirect to /admin
  if (isAuthenticated && role === "ADMIN" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow guest-allowed pages without auth
  if (matchPathname(pathname, GUEST_ALLOWED_PAGES) || matchPathname(pathname, AUTH_PAGES)) {
    return NextResponse.next();
  }

  // Allow guest-allowed API routes without auth
  if (matchPathname(pathname, GUEST_ALLOWED_API)) {
    return NextResponse.next();
  }

  // Guest access to blog pages
  if (pathname.startsWith("/blog/") || pathname === "/blog") {
    return NextResponse.next();
  }

  // If not authenticated, protect all non-public routes
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route protection
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Client route protection - admins get redirected
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/resume/") || pathname.startsWith("/cover-letter/")) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
