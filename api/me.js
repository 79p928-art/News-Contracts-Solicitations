import { isAuthed } from "../lib/auth.mjs";

export default async function handler(req, res) {
  if (await isAuthed(req)) res.status(200).json({ ok: true });
  else res.status(401).json({ ok: false });
}
