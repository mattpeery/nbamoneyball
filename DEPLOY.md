# Deploy checklist (~10 minutes)

You need free accounts on **GitHub**, **Supabase**, and **Vercel**.

## 1. Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick any name (e.g. `nba-moneyball`), a strong database password, and a region near you.
2. Once created, open **SQL Editor** → **New query**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **service_role secret** (⚠️ not the `anon` `public` key — this app uses the service-role key server-side only, since there's no per-user login to build RLS policies around)

## 2. Local setup

1. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Set `ADMIN_PASSCODE` to whatever you want the admin passcode to be.
3. Generate `ADMIN_SESSION_SECRET` and `GROUP_SESSION_SECRET` (two separate values):
   ```bash
   openssl rand -hex 32
   ```
4. `npm install && npm run dev`, open `http://localhost:3000`.

## 3. GitHub

1. Create a new repository (e.g. `nba-moneyball`).
2. From this project folder:

```bash
git init
git add .
git commit -m "NBA Moneyball MVP"
git remote add origin https://github.com/YOUR_USERNAME/nba-moneyball.git
git push -u origin main
```

## 4. Vercel (hosting)

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the `nba-moneyball` repo. Vercel auto-detects Next.js.
2. Under **Environment Variables**, add all seven from `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSCODE`
   - `ADMIN_SESSION_SECRET`
   - `GROUP_SESSION_SECRET`
   - `BALLDONTLIE_API_KEY`
   - `CRON_SECRET`
3. Click **Deploy**. You'll get a URL like `nba-moneyball.vercel.app`.

## After deploying

- **Admin access**: tap the landing page title 5× within ~2 seconds, enter `ADMIN_PASSCODE`. From there you can set team prices/wins, toggle the game phase, set the playoff field/multipliers, and edit the draft lock deadline — all without a redeploy.
- **Groups**: everyone drafts inside a password-protected group, created or joined from the homepage (name + password). Prices, wins, phase, and the draft deadline stay global and shared across all groups; only rosters and each group's leaderboard are partitioned.
- **Draft deadline**: defaults to 2026-10-20 midnight ET. Change it any time from the Admin page.
- Every `git push` to `main` deploys automatically.
- Custom domain: Vercel → Project → Settings → Domains.

- **Score sync**: `vercel.json` runs `/api/sync-scores` once nightly (Vercel Cron), pulling the last 3 days of completed regular-season games from balldontlie.io and recomputing win totals. Admin also has a manual "Sync now" button (with a configurable day-count) for catching up after a missed run. Playoff wins-by-round still need to be entered by hand — balldontlie has no way to identify playoff round.

## Not included in this pass

- Automated **playoff** win syncing — balldontlie's API has no field identifying playoff round (Round 1 vs Conf Finals vs Finals), so wins-by-round stay manual in Admin. Revisit once there's a reliable way to detect rounds.
