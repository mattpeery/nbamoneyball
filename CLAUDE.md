# NBA Moneyball

Fantasy NBA pick-'em game. Next.js 14 App Router + Supabase Postgres, hosted on Vercel.

## Planned / deferred work

- **Password reset via email.** Roster passwords (`players.password_hash`, set at
  submit time in `ConfirmDetailsModal`) currently have no recovery path if
  forgotten — the only fallback is a manual reset by an admin directly in
  Supabase. Add a "forgot password" email flow once the email system
  (Resend or similar) is built.
