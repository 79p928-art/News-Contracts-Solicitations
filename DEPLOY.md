# Deploy The Autonomous Watch to Vercel (login-gated, ~5 users)

This folder is a complete Vercel project: the app (`index.html`) plus serverless
functions (`api/`) that replace the local PowerShell server, all behind a shared
**access code**. No Node install needed on your PC — Vercel builds it in the cloud.

## What you'll set up
- A free **GitHub** account (to hold the files) and a free **Vercel** account.
- Two secrets (environment variables) in Vercel:
  - `SITE_PASSWORD` — the access code you give the 5 people.
  - `AUTH_SECRET`   — a long random string used to sign login cookies.

---

## Step 1 — Put these files in a GitHub repo (all in the browser)
1. Go to https://github.com → sign in → **New repository** → name it e.g.
   `autonomous-watch` → set **Private** → **Create repository**.
2. On the empty repo page, click **“uploading an existing file.”**
3. Drag in the **contents of this `vercel-app` folder**, keeping the folders:
   `index.html`, `package.json`, `.gitignore`, the `api` folder, and the `lib` folder.
   (Do NOT upload `node_modules` — it isn't here, and Vercel installs it for you.)
4. Click **Commit changes**.

## Step 2 — Import into Vercel
1. Go to https://vercel.com → **Sign up / Log in** (use “Continue with GitHub”).
2. **Add New… → Project** → find your `autonomous-watch` repo → **Import**.
3. Leave the build settings at their defaults (Vercel detects it automatically).
4. Before clicking Deploy, expand **Environment Variables** and add:
   | Name            | Value                                                        |
   |-----------------|--------------------------------------------------------------|
   | `SITE_PASSWORD` | the access code you'll share (e.g. a strong passphrase)      |
   | `AUTH_SECRET`   | a long random string (40+ characters — see below)            |
5. Click **Deploy**. After ~1 minute you'll get a URL like
   `https://autonomous-watch-xxxx.vercel.app`.

### Generating AUTH_SECRET
Run this in PowerShell and copy the output:
```
[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
```
(Any long random string works; it just needs to stay secret.)

## Step 3 — Use it
- Open the Vercel URL → you'll see the **access-code** screen → enter `SITE_PASSWORD`.
- The wire loads through the hosted proxy. Share the URL + the code with your 5 people.
- Each person's clippings / archive / saved editions live in **their own browser**
  (this keeps the current model). SAM key / Janes URL are also entered per person.

---

## Updating the app later
The app here (`index.html`) is a copy of `maritime-autonomy-news.html`. When you
change the app, copy it over and re-upload:
```
Copy-Item "C:\Users\79p92\OneDrive\Documents\Code Playground\maritime-autonomy-news.html" `
          "C:\Users\79p92\OneDrive\Documents\Code Playground\vercel-app\index.html" -Force
```
Then in GitHub, upload the new `index.html` (Add file → Upload files → drag → Commit).
Vercel redeploys automatically on every commit.

## Changing the access code
Vercel → your project → **Settings → Environment Variables** → edit `SITE_PASSWORD`
→ then **Deployments → ⋯ → Redeploy** (so the new value takes effect).

## Notes & limits
- **Local-only features are hidden when hosted:** "Save PDF to Desktop" and the
  "save edition to a drive" options don't exist on a server. "Print / PDF",
  clippings, archive, and snapshot-to-browser all still work.
- **SAM.gov:** api.sam.gov sometimes blocks cloud/datacenter IPs. If live SAM
  solicitations don't load on the hosted version, that's why — it still works from
  the local PowerShell version. (Everything else works from Vercel.)
- **Janes:** stays per-user via each person's own subscription RSS URL — never shared.
- **Cost:** free tier is plenty for ~5 users.
- The same `maritime-autonomy-news.html` still runs locally via `serve-news.ps1`
  exactly as before — hosting doesn't change the local setup.
