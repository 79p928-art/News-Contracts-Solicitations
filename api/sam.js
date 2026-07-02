import { isAuthed } from "../lib/auth.mjs";

// SAM.gov Opportunities proxy. The user's API key is in the query string they send;
// it transits this function only (auth-gated) on its way to api.sam.gov.
export default async function handler(req, res) {
  if (!(await isAuthed(req))) { res.status(200).json({ error: "unauthorized" }); return; }
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = "https://api.sam.gov/opportunities/v2/search" + qs;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(target, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (AutonomousWatch)" } });
    clearTimeout(t);
    const text = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(text);
  } catch (e) {
    clearTimeout(t);
    res.status(200).json({ error: String(e.message || e).slice(0, 120) });
  }
}
