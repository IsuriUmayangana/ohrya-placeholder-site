/** Read IG credentials at runtime — dynamic keys avoid build-time empty inlining on Amplify. */
export function getInstagramCredentials(): { userId: string; accessToken: string } {
  const env = process.env;
  const userId = env["IG" + "_USER_ID"]?.trim();
  const accessToken = env["IG" + "_ACCESS_TOKEN"]?.trim();

  if (!userId || !accessToken) {
    throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN.");
  }

  return { userId, accessToken };
}
