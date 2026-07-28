export const EAST = [
  "Celtics", "Nets", "Knicks", "76ers", "Raptors", "Bulls", "Cavaliers", "Pistons",
  "Pacers", "Bucks", "Hawks", "Hornets", "Heat", "Magic", "Wizards",
];
export const WEST = [
  "Thunder", "Spurs", "Nuggets", "Timberwolves", "Rockets", "Lakers", "Trail Blazers", "Warriors",
  "Suns", "Jazz", "Mavericks", "Pelicans", "Clippers", "Kings", "Grizzlies",
];
export const ALL_TEAMS = [...EAST, ...WEST];

export const DEFAULT_PRICES: Record<string, number> = {
  Celtics: 25, Pistons: 25, Cavaliers: 24, "76ers": 24, Heat: 23, Raptors: 23, Pacers: 22, Magic: 22,
  Hawks: 21, Hornets: 19, Wizards: 18, Bucks: 13, Bulls: 13, Knicks: 26, Nets: 8,
  Thunder: 31, Spurs: 30, Nuggets: 25, Timberwolves: 24, Rockets: 24, Lakers: 22, "Trail Blazers": 22,
  Warriors: 20, Suns: 19, Jazz: 18, Mavericks: 17, Pelicans: 15, Clippers: 14, Kings: 20, Grizzlies: 21,
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
