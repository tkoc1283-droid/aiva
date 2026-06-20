import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "aiva_session";

export function getSessionToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function checkPassword(password: string): boolean {
  const correctPassword = process.env.ADMIN_PASSWORD || "aiva-admin";
  return password === correctPassword;
}

export async function isAuthed(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!sessionToken) return false;
    
    const correctPassword = process.env.ADMIN_PASSWORD || "aiva-admin";
    const expectedToken = getSessionToken(correctPassword);
    
    return sessionToken === expectedToken;
  } catch (error) {
    return false;
  }
}
