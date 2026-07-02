# Deploy The Autonomous Watch to Vercel (login-gated, ~5 users)

This folder is a complete Vercel project: the app (`index.html`) plus serverless
functions (`api/`) that replace the local PowerShell server, all behind a
**per-user username + password** login. No Node install needed on your PC — Vercel
builds it in the cloud.

## What you'll set up
- A free **GitHub** account (to hold the files) and a free **Vercel** account.
- Two secrets (environment variables) in Vercel:
  - `APP_USERS`   — the usernames + passwords allowed to sign in (see format below).
  - `AUTH_SECRET` — a long random string used to sign login cookies.

### APP_USERS format
Each user is a `username:password` pair. Two accepted formats:
- **Simple** (comma-separated): `alice:s3cret, bob:hunter2, carol:pa55phrase`
- **JSON**: `{"alice":"s3cret","bob":"hunter2"}`

Usernames are case-insensitive; passwords are exact. Use the **JSON** form if any
password contains a comma, semicolon, or colon. To add/remove people later, edit
`APP_USERS` in Vercel and Redeploy.

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
   | Name          | Value                                                          |
   |---------------|----------------------------------------------------------------|
   | `APP_USERS`   | your users, e.g. `alice:s3cret, bob:hunter2` (see format above) |
   | `AUTH_SECRET` | a long random string (40+ characters — see below)              |
5. Click **Deploy**. After ~1 minute you'll get a URL like
   `https://autonomous-watch-xxxx.vercel.app`.

### Generating AUTH_SECRET
Run this in PowerShell and copy the output:
```
[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
```
(Any long random string works; it just needs to stay secret.)

## Step 3 — Use it
- Open the Vercel URL → you'll see the **sign-in** screen → enter a username + password
  from `APP_USERS`.
- The wire loads through the hosted proxy. Share the URL + each person's own username/password.
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

## Adding / removing users or changing a password
Vercel → your project → **Settings → Environment Variables** → edit `APP_USERS`
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
