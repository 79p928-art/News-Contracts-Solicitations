// Shared auth helpers — signed session cookie (HMAC JWT via jose) + per-user credentials.
import { SignJWT, jwtVerify } from "jose";

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export async function makeToken(username) {
  return await new SignJWT({ ok: true, u: username || "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username || "user")
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

// APP_USERS holds the allowed username/password pairs. Two accepted formats:
//   JSON  : {"alice":"s3cret","bob":"hunter2"}
//   Simple: alice:s3cret, bob:hunter2   (comma / semicolon / newline separated)
// Usernames are matched case-insensitively; passwords are exact. Use the JSON form
// if any password contains a comma, semicolon or colon.
export function parseUsers() {
  const raw = (process.env.APP_USERS || "").trim();
  if (!raw) return null;                       // null => not configured
  const map = {};
  if (raw[0] === "{") {
    try {
      const o = JSON.parse(raw);
      for (const k in o) { const u = String(k).trim().toLowerCase(); if (u) map[u] = String(o[k]); }
      return Object.keys(map).length ? map : null;
    } catch { /* fall through to simple parser */ }
  }
  for (const pair of raw.split(/[\n,;]+/)) {
    const s = pair.trim();
    if (!s) continue;
    const i = s.indexOf(":");
    if (i < 0) continue;
    const u = s.slice(0, i).trim().toLowerCase();
    const p = s.slice(i + 1);                   // password kept verbatim (may contain colons)
    if (u) map[u] = p;
  }
  return Object.keys(map).length ? map : null;
}

// Returns { configured, ok, user }. `configured` is false when the server has no
// AUTH_SECRET or no APP_USERS set (so the UI can show a setup hint instead of "wrong password").
export function checkUser(username, password) {
  if (!process.env.AUTH_SECRET) return { configured: false, ok: false };
  const users = parseUsers();
  if (!users) return { configured: false, ok: false };
  const u = String(username || "").trim().toLowerCase();
  const expected = users[u];
  const ok = expected !== undefined && String(password || "") === String(expected) && String(password || "").length > 0;
  return { configured: true, ok, user: u };
}

export function cookieHeader(token) {
  return `aw_session=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}
export function clearCookieHeader() {
  return `aw_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
