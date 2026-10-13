import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin-auth";

const SESSION_COOKIE = "admin_session";

/** Returns a 401 response if the request is not an authenticated admin session. */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  const secret = getAdminSessionSecret();
  if (!secret || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
