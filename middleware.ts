import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";
const LOGIN_PATH = "/admin/login";

function getSubdomain(host: string): string {
  // "admin.ohrya.org" → "admin" | "localhost:3000" → ""
  const parts = host.split(".");
  return parts.length >= 3 ? parts[0] : "";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const sub = getSubdomain(host);

  // ── dashboard.ohrya.org ───────────────────────────────────────────────────
  if (sub === "dashboard") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/my-dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── admin.ohrya.org ───────────────────────────────────────────────────────
  if (sub === "admin") {
    // Redirect bare root to /admin
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    // Guard all /admin/* except the login page itself
    if (pathname.startsWith("/admin") && !pathname.startsWith(LOGIN_PATH)) {
      const session = req.cookies.get(SESSION_COOKIE)?.value;
      const secret = process.env.ADMIN_SESSION_SECRET;
      if (!secret || session !== secret) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // ── form.ohrya.org (and any other domain) ────────────────────────────────
  // Keep existing admin protection for non-subdomain access
  if (!pathname.startsWith("/admin") || pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || session !== secret) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
