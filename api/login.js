import { makeToken, cookieHeader } from "../lib/auth.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const password = (body && body.password) || "";
  const expected = process.env.SITE_PASSWORD || "";
  if (!expected) { res.status(401).json({ ok: false, configured: false }); return; }
  if (password !== expected) { res.status(401).json({ ok: false, configured: true }); return; }
  const token = await makeToken();
  res.setHeader("Set-Cookie", cookieHeader(token));
  res.status(200).json({ ok: true });
}
