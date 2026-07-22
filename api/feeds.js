import { isAuthed } from "../lib/auth.mjs";

// Only these hosts may be proxied — prevents the function being used as an open relay.
const ALLOWED = [
  "navalnews.com", "naval-technology.com", "usni.org", "maritime-executive.com",
  "breakingdefense.com", "twz.com", "defensenews.com", "gcaptain.com", "thedefensepost.com",
  "defence-blog.com", "suasnews.com", "dronelife.com", "armyrecognition.com",
  "bairdmaritime.com", "follow.it", "shephardmedia.com", "defencetoday.com", "defensefeeds.com",
  "airandspaceforces.com", "theaviationist.com", "overtdefense.com",
  "army-technology.com", "tankandafvnews.com", "soldiersystems.net", "edrmagazine.eu",
  "csis.org", "armscontrol.org", "defensedaily.com",
  "foxnews.com", "cnn.com", "bbci.co.uk", "npr.org", "theguardian.com",
  "aljazeera.com", "thehill.com", "militarytimes.com"
];
function hostAllowed(u) {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "");
    return ALLOWED.some(a => h === a || h.endsWith("." + a));
  } catch { return false; }
}
async function fetchOne(u) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(u, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (AutonomousWatch)" } });
    clearTimeout(t);
    if (!r.ok) return { url: u, ok: false, code: String(r.status), body: "" };
    const body = await r.text();
    return { url: u, ok: true, code: "200", body };
  } catch (e) {
    clearTimeout(t);
    const code = e.name === "AbortError" ? "timeout" : "unreachable";
    return { url: u, ok: false, code, body: String(e.message || e).slice(0, 80) };
  }
}

export default async function handler(req, res) {
  if (!(await isAuthed(req))) { res.status(401).json({ error: "unauthorized", results: [] }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const urls = Array.isArray(body?.urls) ? body.urls.filter(hostAllowed).slice(0, 60) : [];
  const results = await Promise.all(urls.map(fetchOne));
  res.status(200).json({ results });
}
