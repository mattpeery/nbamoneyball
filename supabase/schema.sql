-- NBA Moneyball schema. Run once in the Supabase SQL editor.
--
-- No RLS policies are defined on purpose: the app has no per-user auth
-- model (players are identified only by a low-sensitivity email cookie,
-- not a Supabase auth session), so the browser never talks to Supabase
-- directly. All reads/writes go through Next.js server code using the
-- service-role key, which bypasses RLS. Leaving RLS enabled with zero
-- policies means the anon key -- if it ever leaked -- could still do
-- nothing, which is the point.

create table if not exists public.teamdata (
  id integer primary key default 1,
  phase text not null default 'regular' check (phase in ('regular', 'playoff')),
  regular jsonb not null,
  playoff jsonb not null,
  draft_deadline timestamptz not null default '2026-10-20T00:00:00-04:00',
  updated_at timestamptz not null default now(),
  constraint teamdata_singleton check (id = 1)
);

alter table public.teamdata enable row level security;

create table if not exists public.players (
  id text primary key,
  name text not null,
  entry_name text not null,
  email text not null,
  picks jsonb not null default '{}'::jsonb,
  spent numeric not null default 0,
  price_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create table if not exists public.playoff_players (
  id text primary key,
  name text not null,
  entry_name text not null,
  email text not null,
  picks jsonb not null default '{}'::jsonb,
  spent numeric not null default 0,
  budget numeric not null default 0,
  price_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.playoff_players enable row level security;

-- Regular-season games already pulled from balldontlie.io, keyed by their
-- game id so re-syncing an overlapping date window is a no-op for games
-- already recorded. Win totals are recomputed from this table on each sync
-- rather than incremented, so a corrected final score self-heals too.
create table if not exists public.synced_games (
  id integer primary key,
  date date not null,
  home_team text not null,
  away_team text not null,
  home_score integer not null,
  away_score integer not null,
  postseason boolean not null,
  season integer not null
);

alter table public.synced_games enable row level security;

create index if not exists synced_games_date_idx on public.synced_games (date);
