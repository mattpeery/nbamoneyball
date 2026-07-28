export const EAST = [
  "Celtics", "Nets", "Knicks", "76ers", "Raptors", "Bulls", "Cavaliers", "Pistons",
  "Pacers", "Bucks", "Hawks", "Hornets", "Heat", "Magic", "Wizards",
];
export const WEST = [
  "Thunder", "Spurs", "Nuggets", "Timberwolves", "Rockets", "Lakers", "Trail Blazers", "Warriors",
  "Suns", "Jazz", "Mavericks", "Pelicans", "Clippers", "Kings", "Grizzlies",
];
export const ALL_TEAMS = [...EAST, ...WEST];

// Sourced from the "2026-2027 version" tab (columns A-C) of the team's
// shared pricing sheet -- derived from Vegas-projected win totals.
export const DEFAULT_PRICES: Record<string, number> = {
  Knicks: 30, Celtics: 29, Pistons: 29, Cavaliers: 27, "76ers": 27, Heat: 26, Raptors: 26, Pacers: 25,
  Magic: 25, Hawks: 24, Hornets: 21, Wizards: 20, Bucks: 15, Bulls: 15, Nets: 11,
  Thunder: 35, Spurs: 35, Nuggets: 28, Timberwolves: 28, Rockets: 27, Lakers: 25, "Trail Blazers": 25,
  Warriors: 23, Suns: 22, Jazz: 20, Mavericks: 20, Pelicans: 17, Clippers: 16, Grizzlies: 16, Kings: 13,
};

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

export const REG_BUDGET = 100;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 10;
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

export type RegularTeamData = {
  prices: Record<string, number>;
  wins: Record<string, number>;
  locked: boolean;
  lastSyncedAt?: string;
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
