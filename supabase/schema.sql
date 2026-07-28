-- NBA Moneyball schema. Run once in the Supabase SQL editor for a fresh
-- project. If you already have these tables (players/playoff_players
-- without group_id), skip to the MIGRATION block at the bottom instead.
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

-- Password-protected groups (leagues). Joined by name + password, not
-- just a link -- see lib/groups.ts / lib/groupPassword.ts.
create table if not exists public.groups (
  id text primary key,
  name text not null,
  name_normalized text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

create table if not exists public.players (
  id text not null,
  group_id text not null references public.groups(id),
  name text not null,
  entry_name text not null,
  email text not null,
  picks jsonb not null default '{}'::jsonb,
  spent numeric not null default 0,
  price_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (group_id, id)
);

alter table public.players enable row level security;

create table if not exists public.playoff_players (
  id text not null,
  group_id text not null references public.groups(id),
  name text not null,
  entry_name text not null,
  email text not null,
  picks jsonb not null default '{}'::jsonb,
  spent numeric not null default 0,
  budget numeric not null default 0,
  price_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (group_id, id)
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

-- ============================================================
-- MIGRATION: adds groups to an existing NBA Moneyball database
-- (one that already has players/playoff_players without group_id).
-- Run this whole block once. Safe to re-run.
-- ============================================================

create table if not exists public.groups (
  id text primary key,
  name text not null,
  name_normalized text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.groups enable row level security;

insert into public.groups (id, name, name_normalized, password_hash)
values (
  'early-adopters',
  'Early Adopters',
  'early adopters',
  '016f50f5908b5c8c7600edb7dbd47236:90bf0c36cf8035b1884e9267a74f491404f07ac7ac9a7a110389381ba9ca67fbaad1fe35811a9e5099704eac110c81eb458922f7d6aefdaa498d71847425e7b7'
)
on conflict (id) do nothing;

alter table public.players add column if not exists group_id text references public.groups(id);
update public.players set group_id = 'early-adopters' where group_id is null;
alter table public.players alter column group_id set not null;
alter table public.players drop constraint if exists players_pkey;
alter table public.players add primary key (group_id, id);

alter table public.playoff_players add column if not exists group_id text references public.groups(id);
update public.playoff_players set group_id = 'early-adopters' where group_id is null;
alter table public.playoff_players alter column group_id set not null;
alter table public.playoff_players drop constraint if exists playoff_players_pkey;
alter table public.playoff_players add primary key (group_id, id);
