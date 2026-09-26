import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";
import { cache } from "react";

/**
 * Reads the admin_session cookie and decodes the JWT.
 * Wrapped in React cache() so it only executes the cryptography once per request.
 */
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  
  if (!token) return null;
  
  const payload = await verifyJwt(token);
  return payload as { id: string; role: string; mobile: string } | null;
});
