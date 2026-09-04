import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin-auth";

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

  // ── dashboard.ohrya.org → ohrya.org (canonical) ───────────────────────────
  if (sub === "dashboard") {
    const mainSite = process.env.NEXT_PUBLIC_MAIN_SITE_ORIGIN ?? "https://ohrya.org";
    const target = new URL(`${pathname}${req.nextUrl.search}`, mainSite);
    return NextResponse.redirect(target);
  }

  // ── leaderboard.ohrya.org → ohrya.org (canonical) ─────────────────────────
  if (sub === "leaderboard") {
    const mainSite = process.env.NEXT_PUBLIC_MAIN_SITE_ORIGIN ?? "https://ohrya.org";
    const target = new URL(`${pathname}${req.nextUrl.search}`, mainSite);
    return NextResponse.redirect(target);
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
      const secret = getAdminSessionSecret();
      if (!secret || session !== secret) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // ── form.ohrya.org ────────────────────────────────────────────────────────
  if (sub === "form") {
    if (pathname === "/") {
      const ref = req.nextUrl.searchParams.get("ref");
      if (ref) {
        const mainSite =
          process.env.NEXT_PUBLIC_MAIN_SITE_ORIGIN ?? "https://ohrya.org";
        const landing = new URL("/", mainSite);
        landing.searchParams.set("ref", ref);
        return NextResponse.redirect(landing);
      }
      return NextResponse.rewrite(new URL("/form-blank", req.url));
    }
    return NextResponse.next();
  }

  // ── All other domains ─────────────────────────────────────────────────────
  // Keep existing admin protection for non-subdomain access
  if (!pathname.startsWith("/admin") || pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = getAdminSessionSecret();

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
