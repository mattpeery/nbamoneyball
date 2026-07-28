import type { TeamData } from "./teams";
import type { PlayerRecord, PlayoffPlayerRecord } from "./scoring";
import { playoffPoints, regularEarned, sharesFor } from "./scoring";
import { slug } from "./format";

export type LeaderboardBasketItem = { team: string; shares: number; stat: string; contrib: number };
export type LeaderboardRow = {
  key: string;
  name: string;
  sub: string | null;
  score: number;
  unit: "earned" | "points";
  basket: LeaderboardBasketItem[];
};

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
            return { team, shares, stat: pts + " pt", contrib: shares * pts };
          })
          .sort((a, b) => b.contrib - a.contrib);
        return { key: slug(p.email), name: p.entryName || p.name, sub: p.entryName ? p.name : null, score, basket, unit: "points" as const };
      })
      .sort((a, b) => b.score - a.score);
    return { isPlayoff, rows };
  }

  const rows = regularPlayers
    .map((p) => {
      const score = regularEarned(p, teamdata);
      const basket: LeaderboardBasketItem[] = Object.entries(p.picks || {})
        .filter(([, v]) => v > 0)
        .map(([team, dollars]) => {
          const shares = sharesFor(dollars, p.priceSnapshot, team, teamdata.regular.prices);
          const w = teamdata.regular.wins[team] || 0;
          return { team, shares, stat: w + " W", contrib: shares * w };
        })
        .sort((a, b) => b.contrib - a.contrib);
      return { key: slug(p.email), name: p.entryName || p.name, sub: p.entryName ? p.name : null, score, basket, unit: "earned" as const };
    })
    .sort((a, b) => b.score - a.score);
  return { isPlayoff, rows };
}
