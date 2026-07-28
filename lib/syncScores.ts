import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { fetchCompletedGames, type SyncedGame } from "./balldontlie";
import { getTeamData, saveTeamData } from "./data";
import { ALL_TEAMS } from "./teams";

export type SyncResult =
  | { ok: true; gamesInWindow: number; teamsUpdated: number }
  | { ok: false; error: string };

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Syncs regular-season results for the trailing `daysBack` days: fetches
 * completed games from balldontlie, upserts them into synced_games (a no-op
 * for games already recorded), then recomputes every team's win total from
 * that table (not incremented) so a corrected score self-heals too.
 */
export async function syncRecentGames(daysBack: number): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  }
  if (!process.env.BALLDONTLIE_API_KEY) {
    return { ok: false, error: "BALLDONTLIE_API_KEY is unset." };
  }

  let games: SyncedGame[];
  try {
    games = await fetchCompletedGames({
      startDate: isoDateDaysAgo(daysBack),
      endDate: isoDateDaysAgo(0),
      postseason: false,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch games from balldontlie." };
  }

  if (games.length > 0) {
    const { error } = await supabase.from("synced_games").upsert(
      games.map((g) => ({
        id: g.id,
        date: g.date,
        home_team: g.homeTeam,
        away_team: g.awayTeam,
        home_score: g.homeScore,
        away_score: g.awayScore,
        postseason: g.postseason,
        season: g.season,
      }))
    );
    if (error) return { ok: false, error: `Couldn't save synced games: ${error.message}` };
  }

  const { data: allGames, error: fetchError } = await supabase
    .from("synced_games")
    .select("home_team, away_team, home_score, away_score")
    .eq("postseason", false)
    .limit(3000);
  if (fetchError) return { ok: false, error: `Couldn't recompute wins: ${fetchError.message}` };

  const wins = Object.fromEntries(ALL_TEAMS.map((t) => [t, 0])) as Record<string, number>;
  for (const g of (allGames as { home_team: string; away_team: string; home_score: number; away_score: number }[]) || []) {
    const winner = g.home_score > g.away_score ? g.home_team : g.away_team;
    if (winner in wins) wins[winner] += 1;
  }

  const teamdata = await getTeamData();
  const teamsUpdated = ALL_TEAMS.filter((t) => teamdata.regular.wins[t] !== wins[t]).length;

  const saveResult = await saveTeamData({
    ...teamdata,
    regular: { ...teamdata.regular, wins, lastSyncedAt: new Date().toISOString() },
  });
  if (!saveResult.ok) return { ok: false, error: saveResult.error };

  return { ok: true, gamesInWindow: games.length, teamsUpdated };
}
