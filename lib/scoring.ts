import type { TeamData } from "./teams";

export type PlayerRecord = {
  name: string;
  entryName: string;
  email: string;
  picks: Record<string, number>;
  spent: number;
  priceSnapshot: Record<string, number>;
  updatedAt: number;
};

export type PlayoffPlayerRecord = PlayerRecord & { budget: number };

export function sharesFor(
  dollars: number,
  priceSnapshot: Record<string, number> | undefined,
  team: string,
  currentPrices: Record<string, number>
): number {
  const price = (priceSnapshot && priceSnapshot[team]) || currentPrices[team] || 1;
  return price > 0 ? dollars / price : 0;
}

export function regularEarned(record: PlayerRecord | null | undefined, teamdata: TeamData): number {
  if (!record) return 0;
  let total = 0;
  for (const [team, dollars] of Object.entries(record.picks || {})) {
    if (!dollars) continue;
    total += sharesFor(dollars, record.priceSnapshot, team, teamdata.regular.prices) * (teamdata.regular.wins[team] || 0);
  }
  return total;
}

export function playoffPoints(record: PlayoffPlayerRecord | PlayerRecord | null | undefined, teamdata: TeamData): number {
  if (!record) return 0;
  let total = 0;
  for (const [team, dollars] of Object.entries(record.picks || {})) {
    if (!dollars) continue;
    const shares = sharesFor(dollars, record.priceSnapshot, team, teamdata.playoff.prices);
    const rounds = teamdata.playoff.winsByRound[team] || [0, 0, 0, 0];
    const mult = teamdata.playoff.multipliers;
    const pts = rounds.reduce((s, w, i) => s + w * (mult[i] ?? i + 1), 0);
    total += shares * pts;
  }
  return total;
}

export function isRegularDraftOpen(teamdata: TeamData): boolean {
  if (teamdata.regular.locked) return false;
  return Date.now() < new Date(teamdata.draftDeadline).getTime();
}

export function isPlayoffDraftOpen(teamdata: TeamData): boolean {
  return !teamdata.playoff.locked;
}

export type RosterValidationError =
  | "empty"
  | "too-few-teams"
  | "over-budget"
  | "too-many-teams"
  | "invalid-amount"
  | "locked";

export function validateRoster(
  picks: Record<string, number>,
  budget: number,
  minTeams: number,
  maxTeams: number
): RosterValidationError | null {
  const entries = Object.entries(picks).filter(([, v]) => v > 0);
  if (entries.length === 0) return "empty";
  if (entries.length < minTeams) return "too-few-teams";
  if (entries.length > maxTeams) return "too-many-teams";
  let spent = 0;
  for (const [, dollars] of entries) {
    if (!Number.isInteger(dollars) || dollars < 0) return "invalid-amount";
    spent += dollars;
  }
  if (spent > budget) return "over-budget";
  return null;
}
