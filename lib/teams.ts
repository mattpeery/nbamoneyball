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
export const PROJECTED_WINS: Record<string, number> = {
  Thunder: 61.5, Spurs: 60.5, Nuggets: 49.5, Timberwolves: 48.5, Rockets: 47.5, Lakers: 44.5,
  "Trail Blazers": 43.5, Warriors: 40.5, Suns: 38.5, Jazz: 35.5, Mavericks: 34.5, Pelicans: 29.5,
  Clippers: 28.5, Grizzlies: 28.5, Kings: 22.5,
  Knicks: 52.5, Celtics: 50.5, Pistons: 50.5, Cavaliers: 47.5, "76ers": 47.5, Heat: 45.5,
  Raptors: 45.5, Pacers: 44.5, Magic: 43.5, Hawks: 42.5, Hornets: 37.5, Wizards: 35.5,
  Bucks: 26.5, Bulls: 25.5, Nets: 19.5,
};

// A team's price in dollars is exactly its Vegas-projected win total.
export const DEFAULT_PRICES: Record<string, number> = { ...PROJECTED_WINS };

export const REG_BUDGET = 164;
export const ROUND_LABELS = ["Rd 1", "Rd 2", "Conf Finals", "Finals"];
export const DEFAULT_MULTIPLIERS = [1, 2, 3, 4];
export const DEFAULT_DRAFT_DEADLINE = "2026-10-20T00:00:00-04:00";

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

// An admin-scheduled period, after the initial draft deadline, when the
// draft reopens for trading. Prices for the window are set separately
// (same `prices` map, just edited again by the admin before it opens).
export type AddDropWindow = { opensAt: string; closesAt: string };

export type RegularTeamData = {
  prices: Record<string, number>;
  wins: Record<string, number>;
  locked: boolean;
  lastSyncedAt?: string;
  addDropWindows: AddDropWindow[];
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
      addDropWindows: [],
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
