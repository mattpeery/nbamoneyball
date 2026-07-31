import type { AddDropWindow, TeamData } from "./teams";

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
  const now = Date.now();
  if (now < new Date(teamdata.draftDeadline).getTime()) return true;
  return teamdata.regular.addDropWindows.some(
    (w) => now >= new Date(w.opensAt).getTime() && now <= new Date(w.closesAt).getTime()
  );
}

/** The add/drop window currently open, if any (independent of the `locked` override). */
export function getOpenAddDropWindow(teamdata: TeamData): AddDropWindow | null {
  const now = Date.now();
  return (
    teamdata.regular.addDropWindows.find(
      (w) => now >= new Date(w.opensAt).getTime() && now <= new Date(w.closesAt).getTime()
    ) || null
  );
}

/** The soonest upcoming add/drop window, if any. */
export function getNextAddDropWindow(teamdata: TeamData): AddDropWindow | null {
  const now = Date.now();
  const upcoming = teamdata.regular.addDropWindows
    .filter((w) => new Date(w.opensAt).getTime() > now)
    .sort((a, b) => new Date(a.opensAt).getTime() - new Date(b.opensAt).getTime());
  return upcoming[0] || null;
}

export function isPlayoffDraftOpen(teamdata: TeamData): boolean {
  return !teamdata.playoff.locked;
}

export type RosterValidationError = "empty" | "over-budget" | "invalid-amount" | "locked";

export function validateRoster(
  picks: Record<string, number>,
  budget: number,
  prices: Record<string, number>
): RosterValidationError | null {
  const entries = Object.entries(picks).filter(([, v]) => v > 0);
  if (entries.length === 0) return "empty";

  let spent = 0;
  let fractionalTeam: string | null = null;
  let fractionalDollars = 0;
  for (const [team, dollars] of entries) {
    const price = prices[team];
    if (price === undefined || dollars < 0) return "invalid-amount";
    const isFullPrice = Math.abs(dollars - price) <= 0.01;
    const isFractional = dollars < price - 0.01;
    if (!isFullPrice && !isFractional) return "invalid-amount";
    if (isFractional) {
      if (fractionalTeam) return "invalid-amount"; // only one fractional pick allowed
      fractionalTeam = team;
      fractionalDollars = dollars;
    }
    spent += dollars;
  }
  if (spent > budget) return "over-budget";

  // A fractional pick must spend exactly what was left after the rest of the
  // roster - it's only valid as the final pick using up the remainder.
  if (fractionalTeam) {
    const remainderAtPurchase = budget - (spent - fractionalDollars);
    if (Math.abs(fractionalDollars - remainderAtPurchase) > 0.01) return "invalid-amount";
  }

  return null;
}
