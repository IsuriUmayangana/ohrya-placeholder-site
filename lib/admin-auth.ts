const LOCAL_DEV_ADMIN_PASSWORD = "admin";
const LOCAL_DEV_SESSION_SECRET = "local-dev-admin-session";

function isLocalDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getAdminPassword(): string | undefined {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  return isLocalDev() ? LOCAL_DEV_ADMIN_PASSWORD : undefined;
}

export function getAdminSessionSecret(): string | undefined {
  const fromEnv = process.env.ADMIN_SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;
  return isLocalDev() ? LOCAL_DEV_SESSION_SECRET : undefined;
}

export function adminCookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}
