export const EAST = [
  "Celtics", "Nets", "Knicks", "76ers", "Raptors", "Bulls", "Cavaliers", "Pistons",
  "Pacers", "Bucks", "Hawks", "Hornets", "Heat", "Magic", "Wizards",
];
export const WEST = [
  "Thunder", "Spurs", "Nuggets", "Timberwolves", "Rockets", "Lakers", "Trail Blazers", "Warriors",
  "Suns", "Jazz", "Mavericks", "Pelicans", "Clippers", "Kings", "Grizzlies",
];
export const ALL_TEAMS = [...EAST, ...WEST];

// Vegas-projected regular-season win totals, shown alongside price on the
// draft screen. Static reference data, not derived from anything else.
// Source: sportsbook 2026-27 season win-total lines (updated Oct 2026).
export const PROJECTED_WINS: Record<string, number> = {
  Thunder: 62.5, Spurs: 59.5, Nuggets: 49.5, Timberwolves: 48.5, Rockets: 47.5, Lakers: 46.5,
  "Trail Blazers": 42.5, Warriors: 40.5, Suns: 40.5, Jazz: 37.5, Mavericks: 34.5, Pelicans: 27.5,
  Clippers: 28.5, Grizzlies: 29.5, Kings: 21.5,
  Knicks: 52.5, Celtics: 51.5, Pistons: 49.5, Cavaliers: 47.5, "76ers": 50.5, Heat: 46.5,
  Raptors: 46.5, Pacers: 43.5, Magic: 43.5, Hawks: 43.5, Hornets: 39.5, Wizards: 34.5,
  Bucks: 25.5, Bulls: 29.5, Nets: 24.5,
};

// A team's price in dollars is exactly its Vegas-projected win total.
export const DEFAULT_PRICES: Record<string, number> = { ...PROJECTED_WINS };

export const REG_BUDGET = 164;
export const ROUND_LABELS = ["Rd 1", "Rd 2", "Conf Finals", "Finals"];
export const DEFAULT_MULTIPLIERS = [1, 2, 3, 4];
// Picks lock at the first tip-off of opening night: Celtics at Pistons, 3:00 PM ET.
export const DEFAULT_DRAFT_DEADLINE = "2026-10-20T15:00:00-04:00";

export const FULL_NAMES: Record<string, string> = {
  Celtics: "Boston Celtics", Nets: "Brooklyn Nets", Knicks: "New York Knicks", "76ers": "Philadelphia 76ers",
  Raptors: "Toronto Raptors", Bulls: "Chicago Bulls", Cavaliers: "Cleveland Cavaliers", Pistons: "Detroit Pistons",
  Pacers: "Indiana Pacers", Bucks: "Milwaukee Bucks", Hawks: "Atlanta Hawks", Hornets: "Charlotte Hornets",
  Heat: "Miami Heat", Magic: "Orlando Magic", Wizards: "Washington Wizards",
  Thunder: "Oklahoma City Thunder", Spurs: "San Antonio Spurs", Nuggets: "Denver Nuggets",
  Timberwolves: "Minnesota Timberwolves", Rockets: "Houston Rockets", Lakers: "Los Angeles Lakers",
  "Trail Blazers": "Portland Trail Blazers", Warriors: "Golden State Warriors", Suns: "Phoenix Suns",
  Jazz: "Utah Jazz", Mavericks: "Dallas Mavericks", Pelicans: "New Orleans Pelicans", Clippers: "LA Clippers",
  Kings: "Sacramento Kings", Grizzlies: "Memphis Grizzlies",
};

export type RegularTeamData = {
  prices: Record<string, number>;
  wins: Record<string, number>;
  locked: boolean;
  lastSyncedAt?: string;
  // Set to the draftDeadline value the "picks lock tomorrow" reminder was
  // last sent for, so the daily cron doesn't send it twice.
  deadlineReminderSentFor?: string;
};

export type PlayoffTeamData = {
  teams: Record<string, boolean>;
  prices: Record<string, number>;
  winsByRound: Record<string, number[]>;
  multipliers: number[];
  locked: boolean;
};

export type TeamData = {
  phase: "regular" | "playoff";
  draftDeadline: string;
  regular: RegularTeamData;
  playoff: PlayoffTeamData;
};

export function defaultTeamData(): TeamData {
  return {
    phase: "regular",
    draftDeadline: DEFAULT_DRAFT_DEADLINE,
    regular: {
      prices: { ...DEFAULT_PRICES },
      wins: Object.fromEntries(ALL_TEAMS.map((t) => [t, 0])),
      locked: false,
    },
    playoff: {
      teams: Object.fromEntries(ALL_TEAMS.map((t) => [t, false])),
      prices: { ...DEFAULT_PRICES },
      winsByRound: Object.fromEntries(ALL_TEAMS.map((t) => [t, [0, 0, 0, 0]])),
      multipliers: [...DEFAULT_MULTIPLIERS],
      locked: false,
    },
  };
}
