import { makeToken, cookieHeader, checkUser } from "../lib/auth.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const username = (body && body.username) || "";
  const password = (body && body.password) || "";
  const r = checkUser(username, password);
  if (!r.configured) { res.status(401).json({ ok: false, configured: false }); return; }
  if (!r.ok) { res.status(401).json({ ok: false, configured: true }); return; }
  const token = await makeToken(r.user);
  res.setHeader("Set-Cookie", cookieHeader(token));
  res.status(200).json({ ok: true, user: r.user });
}
