# NBA Moneyball

Fantasy NBA pick-'em game. Next.js 14 App Router + Supabase Postgres, hosted on Vercel.

## Email

Transactional email goes through Resend (`lib/email.ts`), a free-tier REST
API call via `fetch` — no SDK dependency. Requires `RESEND_API_KEY` (from a
free https://resend.com account) and a verified `nbamoneyball.com` sending
domain; without the key set, sends are skipped and logged instead (safe for
local dev). `EMAIL_FROM` optionally overrides the from-address.

Currently sent:
- **Roster confirmation** — fired from `/api/players/regular` and
  `/api/players/playoff` on a player's *first* save only (not on edits), with
  their picks and a link back to the leaderboard.

## Planned / deferred work

- **Password reset via email.** Roster passwords (`players.password_hash`, set at
  submit time in `ConfirmDetailsModal`) currently have no recovery path if
  forgotten — the only fallback is a manual reset by an admin directly in
  Supabase. Now that the email system exists, this is the natural next
  email to add.
- **Deadline reminder email.** A "picks lock soon" nudge shortly before
  `teamdata.draftDeadline`, sent to everyone with a saved roster (we have
  their emails). Needs a Vercel Cron route (mirroring `/api/sync-scores`'s
  `CRON_SECRET` pattern) plus a way to avoid double-sending — not built yet
  since the deadline is months out.
- **Abandoned-draft nudge.** Can't currently email someone who started
  picking teams but never saved, because email is only captured at final
  submit. Would need an earlier email-capture step in the draft flow.
