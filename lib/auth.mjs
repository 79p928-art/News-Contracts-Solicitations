// Shared auth helpers — signed session cookie (HMAC JWT via jose).
import { SignJWT, jwtVerify } from "jose";

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export async function makeToken() {
  return await new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
}

export async function isAuthed(req) {
  if (!process.env.AUTH_SECRET) return false;
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)aw_session=([^;]+)/);
  if (!m) return false;
  try { await jwtVerify(decodeURIComponent(m[1]), key()); return true; }
  catch { return false; }
}

export function cookieHeader(token) {
  return `aw_session=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}
export function clearCookieHeader() {
  return `aw_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
