import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { defaultTeamData, type TeamData } from "./teams";
import type { PlayerRecord, PlayoffPlayerRecord } from "./scoring";
import { slug } from "./format";

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

export async function getRegularPlayers(): Promise<PlayerRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("players").select("*").order("updated_at", { ascending: false });
  return (data as PlayerRow[] | null)?.map(rowToPlayer) || [];
}

export async function getPlayoffPlayers(): Promise<PlayoffPlayerRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("playoff_players").select("*").order("updated_at", { ascending: false });
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

export async function upsertRegularPlayer(record: PlayerRecord): Promise<SaveResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  const { error } = await supabase.from("players").upsert({
    id: slug(record.email),
    name: record.name,
    entry_name: record.entryName,
    email: record.email,
    picks: record.picks,
    spent: record.spent,
    price_snapshot: record.priceSnapshot,
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
