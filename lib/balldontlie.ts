import "server-only";
import { ALL_TEAMS, FULL_NAMES } from "./teams";

const BASE_URL = "https://api.balldontlie.io/v1";

function authHeaders(): Record<string, string> {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error("BALLDONTLIE_API_KEY is unset.");
  return { Authorization: key };
}

type BdlTeam = {
  id: number;
  full_name: string;
};

type BdlGame = {
  id: number;
  date: string;
  status: string;
  postseason: boolean;
  season: number;
  home_team: BdlTeam;
  visitor_team: BdlTeam;
  home_team_score: number;
  visitor_team_score: number;
};

export type SyncedGame = {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  postseason: boolean;
  season: number;
};

/** Maps balldontlie's numeric team id -> our short team key (e.g. "Celtics"), via FULL_NAMES. */
export async function fetchTeamIdMap(): Promise<Map<number, string>> {
  const res = await fetch(`${BASE_URL}/teams`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`balldontlie /teams failed: ${res.status} ${await res.text()}`);
  const { data } = (await res.json()) as { data: BdlTeam[] };

  const byFullName = new Map(ALL_TEAMS.map((t) => [FULL_NAMES[t], t]));
  const map = new Map<number, string>();
  for (const team of data) {
    const short = byFullName.get(team.full_name);
    if (short) map.set(team.id, short);
  }
  return map;
}

/** Fetches all completed games (status === "Final") in [startDate, endDate], paginated. */
export async function fetchCompletedGames(opts: {
  startDate: string;
  endDate: string;
  postseason: boolean;
}): Promise<SyncedGame[]> {
  const teamIdMap = await fetchTeamIdMap();
  const games: SyncedGame[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      start_date: opts.startDate,
      end_date: opts.endDate,
      postseason: String(opts.postseason),
      per_page: "100",
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/games?${params.toString()}`, { headers: authHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error(`balldontlie /games failed: ${res.status} ${await res.text()}`);
    const body = (await res.json()) as { data: BdlGame[]; meta?: { next_cursor?: string | null } };

    for (const g of body.data) {
      if (g.status !== "Final") continue;
      const homeTeam = teamIdMap.get(g.home_team.id);
      const awayTeam = teamIdMap.get(g.visitor_team.id);
      if (!homeTeam || !awayTeam) continue; // unmapped team (shouldn't happen for regular-season NBA games)
      games.push({
        id: g.id,
        date: g.date,
        homeTeam,
        awayTeam,
        homeScore: g.home_team_score,
        awayScore: g.visitor_team_score,
        postseason: g.postseason,
        season: g.season,
      });
    }

    cursor = body.meta?.next_cursor ? String(body.meta.next_cursor) : undefined;
  } while (cursor);

  return games;
}
