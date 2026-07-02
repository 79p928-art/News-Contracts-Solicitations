import { isAuthed } from "../lib/auth.mjs";

// Single-feed proxy — used for the user's personal Janes RSS URL (auth-gated).
export default async function handler(req, res) {
  if (!(await isAuthed(req))) { res.status(200).send("__FEEDERR__|auth|unauthorized"); return; }
  const u = req.query.url;
  if (!u || !/^https?:\/\//i.test(u)) { res.status(200).send("__FEEDERR__|badurl|invalid url"); return; }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(u, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (AutonomousWatch)" } });
    clearTimeout(t);
    if (!r.ok) { res.status(200).send(`__FEEDERR__|${r.status}|http ${r.status}`); return; }
    const text = await r.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(text);
  } catch (e) {
    clearTimeout(t);
    const code = e.name === "AbortError" ? "timeout" : "unreachable";
    res.status(200).send(`__FEEDERR__|${code}|${String(e.message || e).slice(0, 80)}`);
  }
}
