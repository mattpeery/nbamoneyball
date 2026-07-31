# NBA Moneyball

Fantasy NBA pick-'em game. Next.js 14 App Router + Supabase Postgres, hosted on Vercel.

## Email

Transactional email goes through Resend (`lib/email.ts`), a free-tier REST
API call via `fetch` — no SDK dependency. Requires `RESEND_API_KEY` (from a
free https://resend.com account) and a verified `nbamoneyball.com` sending
domain; without the key set, sends are skipped and logged instead (safe for
local dev). `EMAIL_FROM` optionally overrides the from-address.

Currently sent:
- **Welcome / roster confirmation** — fired from `/api/players/regular` and
  `/api/players/playoff` on a player's *first* save only (not on edits), with
  their picks and a link back to the leaderboard.
- **Password reset** — `/api/players/forgot-password` issues a signed,
  1-hour-expiry token (`lib/passwordResetToken.ts`, HMAC-signed like the
  admin/group session tokens, no DB storage) and emails a link to
  `/reset-password?token=...`, which posts to `/api/players/reset-password`
  to set a new `password_hash`. Always responds `{ok:true}` regardless of
  whether the email has a roster, to avoid leaking which emails are
  registered. "Forgot password?" links live in `LoadLookup` (ui.tsx), the
  playoff email/password unlock step (`PlayoffDraftClient`), and
  `ConfirmDetailsModal` (shown only after an incorrect-password error).
  Requires `PASSWORD_RESET_SECRET`.
- **Deadline reminder** ("Your picks lock tomorrow!") — `/api/send-deadline-reminders`,
  a daily Vercel Cron job (`vercel.json`, same `CRON_SECRET` auth pattern as
  `/api/sync-scores`). Fires once, in the 12-to-36-hour window before
  `teamdata.draftDeadline`, to everyone with a saved regular roster;
  idempotency is a `regular.deadlineReminderSentFor` field on `teamdata`
  (sent-for-this-deadline marker, no schema migration needed — same pattern
  as `firstWindowDate`) so it never double-sends for the same deadline.

## Planned / deferred work

- **Abandoned-draft nudge.** Can't currently email someone who started
  picking teams but never saved, because email is only captured at final
  submit. Would need an earlier email-capture step in the draft flow.
