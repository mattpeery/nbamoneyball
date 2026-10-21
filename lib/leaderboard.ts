import type { TeamData } from "./teams";
import type { PlayerRecord, PlayoffPlayerRecord } from "./scoring";
import { playoffPoints, regularEarned, sharesFor } from "./scoring";
import { slug } from "./format";

export type LeaderboardBasketItem = {
  team: string;
  shares: number;
  contrib: number;
  /** Regular season only: the team's actual record. */
  record?: { w: number; l: number };
};
export type LeaderboardRow = {
  key: string;
  name: string;
  sub: string | null;
  score: number;
  unit: "earned" | "points";
  basket: LeaderboardBasketItem[];
  /** Competition rank (1, 1, 3...): rows with equal displayed scores share a rank. */
  rank: number;
  tied: boolean;
  /** True when this row's picks were withheld (e.g. before the draft locks). */
  hidden?: boolean;
};

/** Assigns tied ranks by the score as displayed (2 decimals), to rows already sorted by score desc. */
function withRanks<T extends Omit<LeaderboardRow, "rank" | "tied">>(sorted: T[]): (T & { rank: number; tied: boolean })[] {
  const shown = (r: T) => r.score.toFixed(2);
  return sorted.map((r, i) => {
    const first = sorted.findIndex((o) => shown(o) === shown(r));
    const count = sorted.filter((o) => shown(o) === shown(r)).length;
    return { ...r, rank: first + 1, tied: count > 1 };
  });
}

export function buildLeaderboard(
  teamdata: TeamData,
  regularPlayers: PlayerRecord[],
  playoffPlayers: PlayoffPlayerRecord[]
): { isPlayoff: boolean; rows: LeaderboardRow[] } {
  const isPlayoff = teamdata.phase === "playoff";

  if (isPlayoff) {
    const rows = playoffPlayers
      .map((p) => {
        const score = playoffPoints(p, teamdata);
        const basket: LeaderboardBasketItem[] = Object.entries(p.picks || {})
          .filter(([, v]) => v > 0)
          .map(([team, dollars]) => {
            const shares = sharesFor(dollars, p.priceSnapshot, team, teamdata.playoff.prices);
            const rounds = teamdata.playoff.winsByRound[team] || [0, 0, 0, 0];
            const mult = teamdata.playoff.multipliers;
            const pts = rounds.reduce((s, w, i) => s + w * (mult[i] ?? i + 1), 0);
            return { team, shares, contrib: shares * pts };
          })
          .sort((a, b) => b.contrib - a.contrib);
        return { key: slug(p.email), name: p.entryName || p.name, sub: p.entryName ? p.name : null, score, basket, unit: "points" as const };
      })
      .sort((a, b) => b.score - a.score);
    return { isPlayoff, rows: withRanks(rows) };
  }

  const rows = regularPlayers
    .map((p) => {
      const score = regularEarned(p, teamdata);
      const basket: LeaderboardBasketItem[] = Object.entries(p.picks || {})
        .filter(([, v]) => v > 0)
        .map(([team, dollars]) => {
          const shares = sharesFor(dollars, p.priceSnapshot, team, teamdata.regular.prices);
          const w = teamdata.regular.wins[team] || 0;
          return { team, shares, contrib: shares * w, record: { w, l: teamdata.regular.losses?.[team] || 0 } };
        })
        .sort((a, b) => b.contrib - a.contrib);
      return { key: slug(p.email), name: p.entryName || p.name, sub: p.entryName ? p.name : null, score, basket, unit: "earned" as const };
    })
    .sort((a, b) => b.score - a.score);
  return { isPlayoff, rows: withRanks(rows) };
}
