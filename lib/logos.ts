// ESPN CDN team-logo abbreviations. Swap for locally hosted files later if
// preferred - every consumer goes through teamLogoUrl().
const LOGO_ABBR: Record<string, string> = {
  Celtics: "bos", Nets: "bkn", Knicks: "ny", "76ers": "phi", Raptors: "tor",
  Bulls: "chi", Cavaliers: "cle", Pistons: "det", Pacers: "ind", Bucks: "mil",
  Hawks: "atl", Hornets: "cha", Heat: "mia", Magic: "orl", Wizards: "wsh",
  Thunder: "okc", Spurs: "sa", Nuggets: "den", Timberwolves: "min", Rockets: "hou",
  Lakers: "lal", "Trail Blazers": "por", Warriors: "gs", Suns: "phx", Jazz: "utah",
  Mavericks: "dal", Pelicans: "no", Clippers: "lac", Kings: "sac", Grizzlies: "mem",
};

export function teamLogoUrl(team: string): string | null {
  const abbr = LOGO_ABBR[team];
  return abbr ? `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png` : null;
}
