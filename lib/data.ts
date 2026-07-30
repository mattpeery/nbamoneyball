import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { defaultTeamData, type TeamData } from "./teams";
import type { PlayerRecord, PlayoffPlayerRecord } from "./scoring";
import { slug, PUBLIC_GROUP_ID } from "./format";

type TeamdataRow = {
  id: number;
  phase: "regular" | "playoff";
  regular: TeamData["regular"];
  playoff: TeamData["playoff"];
  draft_deadline: string;
};

function rowToTeamData(row: TeamdataRow): TeamData {
  return {
    phase: row.phase,
    draftDeadline: row.draft_deadline,
    regular: row.regular,
    playoff: row.playoff,
  };
}

export async function getTeamData(): Promise<TeamData> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultTeamData();

  const { data, error } = await supabase.from("teamdata").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    const fresh = defaultTeamData();
    await supabase.from("teamdata").upsert({
      id: 1,
      phase: fresh.phase,
      regular: fresh.regular,
      playoff: fresh.playoff,
      draft_deadline: fresh.draftDeadline,
    });
    return fresh;
  }
  return rowToTeamData(data as TeamdataRow);
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveTeamData(next: TeamData): Promise<SaveResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  const { error } = await supabase.from("teamdata").upsert({
    id: 1,
    phase: next.phase,
    regular: next.regular,
    playoff: next.playoff,
    draft_deadline: next.draftDeadline,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

type PlayerRow = {
  id: string;
  name: string;
  entry_name: string;
  email: string;
  picks: Record<string, number>;
  spent: number;
  price_snapshot: Record<string, number>;
  updated_at: string;
  budget?: number;
  group_ids?: string[];
  password_hash?: string;
};

function rowToPlayer(row: PlayerRow): PlayerRecord {
  return {
    name: row.name,
    entryName: row.entry_name,
    email: row.email,
    picks: row.picks || {},
    spent: Number(row.spent) || 0,
    priceSnapshot: row.price_snapshot || {},
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function rowToPlayoffPlayer(row: PlayerRow): PlayoffPlayerRecord {
  return { ...rowToPlayer(row), budget: Number(row.budget) || 0 };
}

/** Every regular-season roster - there is exactly one per player, shared across every group they're in. */
export async function getRegularPlayers(): Promise<PlayerRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("players").select("*").order("updated_at", { ascending: false });
  return (data as PlayerRow[] | null)?.map(rowToPlayer) || [];
}

/** Regular-season rosters for players who are members of the given group. */
export async function getRegularPlayersForGroup(groupId: string): Promise<PlayerRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("players")
    .select("*")
    .contains("group_ids", [groupId])
    .order("updated_at", { ascending: false });
  return (data as PlayerRow[] | null)?.map(rowToPlayer) || [];
}

export async function getPlayoffPlayers(): Promise<PlayoffPlayerRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("playoff_players").select("*").order("updated_at", { ascending: false });
  return (data as PlayerRow[] | null)?.map(rowToPlayoffPlayer) || [];
}

/** Group membership lives on the regular-season row, so playoff rosters are filtered via that member list. */
export async function getGroupMemberIds(groupId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("players").select("id").contains("group_ids", [groupId]);
  return (data as { id: string }[] | null)?.map((r) => r.id) || [];
}

export async function getPlayoffPlayersForGroup(groupId: string): Promise<PlayoffPlayerRecord[]> {
  const memberIds = await getGroupMemberIds(groupId);
  if (memberIds.length === 0) return [];
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("playoff_players")
    .select("*")
    .in("id", memberIds)
    .order("updated_at", { ascending: false });
  return (data as PlayerRow[] | null)?.map(rowToPlayoffPlayer) || [];
}

export async function getRegularPlayerByEmail(email: string): Promise<PlayerRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from("players").select("*").eq("id", slug(email)).maybeSingle();
  return data ? rowToPlayer(data as PlayerRow) : null;
}

export async function getPlayoffPlayerByEmail(email: string): Promise<PlayoffPlayerRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from("playoff_players").select("*").eq("id", slug(email)).maybeSingle();
  return data ? rowToPlayoffPlayer(data as PlayerRow) : null;
}

/** The stored password hash for a player's roster, or null if they have no roster yet. */
export async function getPlayerPasswordHash(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from("players").select("password_hash").eq("id", slug(email)).maybeSingle();
  return (data as { password_hash?: string } | null)?.password_hash || null;
}

/**
 * Saves a player's one and only regular-season roster. `groupId`, when given
 * and not the public pool, tags them as a member of that group (additively -
 * it never removes them from groups they're already in) so the same picks
 * show up on every group's leaderboard without redrafting. `passwordHash` is
 * required - callers verify/create it via getPlayerPasswordHash + lib/password
 * before calling this, so the hash saved here is always the correct one.
 */
export async function upsertRegularPlayer(record: PlayerRecord, passwordHash: string, groupId?: string): Promise<SaveResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  const id = slug(record.email);
  const { data: existing } = await supabase.from("players").select("group_ids").eq("id", id).maybeSingle();
  const current = (existing as { group_ids?: string[] } | null)?.group_ids || [];
  const groupIds = groupId && groupId !== PUBLIC_GROUP_ID && !current.includes(groupId) ? [...current, groupId] : current;

  const { error } = await supabase.from("players").upsert({
    id,
    name: record.name,
    entry_name: record.entryName,
    email: record.email,
    picks: record.picks,
    spent: record.spent,
    price_snapshot: record.priceSnapshot,
    group_ids: groupIds,
    password_hash: passwordHash,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertPlayoffPlayer(record: PlayoffPlayerRecord): Promise<SaveResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  const { error } = await supabase.from("playoff_players").upsert({
    id: slug(record.email),
    name: record.name,
    entry_name: record.entryName,
    email: record.email,
    picks: record.picks,
    spent: record.spent,
    budget: record.budget,
    price_snapshot: record.priceSnapshot,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Adds a player to a group's membership list. No-op if they have no roster yet - membership attaches when they first submit one. */
export async function addGroupMember(groupId: string, email: string): Promise<void> {
  if (groupId === PUBLIC_GROUP_ID) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const id = slug(email);
  const { data: existing } = await supabase.from("players").select("group_ids").eq("id", id).maybeSingle();
  if (!existing) return;
  const current = (existing as { group_ids?: string[] }).group_ids || [];
  if (current.includes(groupId)) return;
  await supabase.from("players").update({ group_ids: [...current, groupId] }).eq("id", id);
}

export async function countAllPlayers(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { data } = await supabase.from("players").select("id");
  return data?.length || 0;
}
