// Team scouting-report copy shown in the Pick Your Teams info popup.
// Sourced from the "moneyball blurbs" Google Sheet.
export type TeamBlurb = { winsLastYear: number; whyBeat: string; whyNot: string };

export const TEAM_BLURBS: Record<string, TeamBlurb> = {
  "Knicks": {
    winsLastYear: 53,
    whyBeat: "The Knicks didn't just win last year's title: they rolled through the playoffs with a +15.4 net rating, the largest margin by any playoff team in 70 years.",
    whyNot: "No team has repeated as champion since the Warriors in 2018, and the Knicks just lost star rebounder Mitchell Robinson.",
  },
  "Celtics": {
    winsLastYear: 56,
    whyBeat: "Last year, the Celtics had the league's 2nd best offense and 4th best defense (#1 paint defense). If there's an organization that can win without Jaylen Brown, it's the Celtics, led by Coach of The Year Joe Mazzulla.",
    whyNot: "Trading Finals MVP Jaylen Brown for Paul George is a significant downgrade and sent shockwaves through the Boston fanbase.",
  },
  "Pistons": {
    winsLastYear: 60,
    whyBeat: "The Pistons boasted the NBA's 2nd best defense last year, leading the league in steals and blocks per game. They were the first team in NBA history to win 60 games after losing 60 games just two years prior.",
    whyNot: "The Pistons' offensive woes were exposed in a 2nd round loss to the Cavaliers. Wins will not be easier to come by in this year's more competitive Eastern Conference.",
  },
  "76ers": {
    winsLastYear: 45,
    whyBeat: "Avengers assemble: the 76ers' starting lineup features two MVPs (Lebron, Embiid), two recent MVP candidates (Brown, Maxey), and one hyper-athletic rising star (Edgecombe).",
    whyNot: "The odds of Embiid and James staying healthy all year approximate zero.",
  },
  "Cavaliers": {
    winsLastYear: 52,
    whyBeat: "The Cavs had a very quiet offseason, and expect to cruise to another Top 10 record (averaging 52 wins per year over the past five years).",
    whyNot: "The Cavs have a middling defense (15th) and were excessively reliant on an aging and ball-dominant James Harden in the playoffs.",
  },
  "Raptors": {
    winsLastYear: 46,
    whyBeat: "The Raptors' long, switchy, 5th-ranked defense from last year will only be scarier with \"The Claw\" Kawhi Leonard.",
    whyNot: "The advanced metrics suggest Toronto is a very average team: it's hard to imagine this team greatly exceeding 45.5 wins.",
  },
  "Heat": {
    winsLastYear: 43,
    whyBeat: "The Heat added superstar Giannis Antetokounmpo this summer, who will headline a terrifying forward attack with Bam Adebayo on the NBA's #1 fastest-paced, #2 best-fastbreaking offense.",
    whyNot: "Pat Riley and Co. gutted their locker room to trade for Giannis, shipping off four key pieces (Herro, Powell, Jaquez, Ware); who is left?",
  },
  "Pacers": {
    winsLastYear: 19,
    whyBeat: "The Pacers were one win away from an NBA title a year and a half ago, and Indy fans have every right to believe again with the imminent return of Tyrese Haliburton.",
    whyNot: "Tides change quickly in the modern NBA; how hard is it to recapture the magic of just two years ago?",
  },
  "Magic": {
    winsLastYear: 45,
    whyBeat: "The Magic have a big, switchy, athletic core around Banchero, Wagner, Suggs, and Bane, who attack the rim and led the league in free throw rate last season.",
    whyNot: "The Magic have had a bottom-15 defense for 13 consecutive seasons (!!!); firing their head coach isn't going to fix that.",
  },
  "Hawks": {
    winsLastYear: 46,
    whyBeat: "The Hawks have an embarrassment of A+ perimeter defenders this year with Lu Dort and Aaron Wiggins joining Dyson \"Vacuum\" Daniels. Pair that with rising stars Jalen Johnson and Nickeil Alexander-Walker and 42.5 wins feels like a sure thing.",
    whyNot: "Atlanta lacks the superstar firepower required to break into the upper echelon, as evidenced by their reliance on Steady Eddy CJ McCollum.",
  },
  "Hornets": {
    winsLastYear: 44,
    whyBeat: "The Hornets were the league's hottest team over the last 3 months of the regular season, posting a league-best +11.1 net rating.",
    whyNot: "Losing star Lamelo Ball could prove devastating for a young Charlotte team in need of an offensive engine.",
  },
  "Wizards": {
    winsLastYear: 17,
    whyBeat: "This must be the league's most unpredictable boom-or-bust squad, led by Trae Young, Anthony Davis, and #1 pick AJ Dybantsa.",
    whyNot: "Washington has been a dumpster fire for nearly a decade now, averaging 26 wins per year over the past eight years. Can two injury-prone stars and the #1 pick really save them?",
  },
  "Bucks": {
    winsLastYear: 32,
    whyBeat: "The Bucks brought in a wave of young talent (Ware, Jaquez, Herro) in the Giannis trade, to say nothing of high-potential rookie Brayden Burries.",
    whyNot: "The Bucks struggled to score easy buckets last year: they were dead last in points in the paint and fastbreak points. This will only get harder with Giannis gone.",
  },
  "Bulls": {
    winsLastYear: 31,
    whyBeat: "New additions Caleb Wilson (what a summer league!), Nic Claxton, and Norman Powell should reinvigorate this reeling Bulls franchise.",
    whyNot: "Chicago has been on the treadmill of mediocrity for so long it is difficult to believe in change without a blockbuster signing.",
  },
  "Nets": {
    winsLastYear: 20,
    whyBeat: "The Nets added Julius Randle this offseason, who should raise their offensive floor considerably.",
    whyNot: "Brooklyn had the worst offensive rating and 3rd worst defensive rating in the NBA last year. They were also worst in rebounding, worst in 3-point percentage, 2nd worst in turnovers...I think I'm going to be sick...",
  },
  "Thunder": {
    winsLastYear: 64,
    whyBeat: "The Thunder enter the 2026 season as title favorites, seeking to win the most games in the NBA for the 3rd straight year, led by back-to-back MVP Shai Gilgeous-Alexander and a suffocating #1 defense.",
    whyNot: "Isaiah Joe, Aaron Wiggins, and Lu Dort represent notable role players who are not running it back this year.",
  },
  "Spurs": {
    winsLastYear: 62,
    whyBeat: "The Spurs won 20 more games than projected last year en route to the NBA finals. Victor Wembanyama is favored to win MVP this year.",
    whyNot: "This Spurs team has no holes, but 60.5 wins is a high bar to reach, especially if Wembanyama faces any injury time.",
  },
  "Nuggets": {
    winsLastYear: 54,
    whyBeat: "The Nuggets offense built around superstar Nikola Jokic wasn't just #1 in the league last year: it had the 2nd best offensive net rating in the league history.",
    whyNot: "Injury woes and defensive holes (worst in points off turnovers, 25th in opponent 2nd chance points) have plagued this Nuggets squad since its title in 2023.",
  },
  "Timberwolves": {
    winsLastYear: 49,
    whyBeat: "Anthony Edwards and newly-added Lamelo Ball and Ayo Dosunmu are sure to run the NBA's most exciting backcourt this season.",
    whyNot: "The Timberwolves are lacking depth and size after shipping off key pieces Julius Randle and Naz Reid.",
  },
  "Rockets": {
    winsLastYear: 52,
    whyBeat: "The Rockets' expectations are sky high this season, with a potent combination of rising stars Amen Thompson, Alperen Sengun, and Reed Sheppard backed by veterans Kevin Durant, Steven Adams, and Fred VanVleet.",
    whyNot: "Houston fell apart last year from late-season locker room issues, ultimately collapsing in a first-round upset to Lebron James's Lakers.",
  },
  "Lakers": {
    winsLastYear: 53,
    whyBeat: "The Lakers are still led by scoring champion Luka Doncic, whose teams consistently sleepwalk into 44.5+ wins almost every year.",
    whyNot: "Bookmakers in Vegas say losing Lebron James will hurt the Lakers to the tune of 8 games lost this season.",
  },
  "Trail Blazers": {
    winsLastYear: 42,
    whyBeat: "Portland adds two stars in Damian Lillard and Ja Morant to a pressing, rebounding machine that just led the league in 2nd chance points.",
    whyNot: "Lillard is 36, Morant is a culture problem, and their new teammates had last year's worst turnover rate.",
  },
  "Warriors": {
    winsLastYear: 37,
    whyBeat: "If they can avoid last season's injury bug, there is always magic in a Steve Kerr / Stephen Curry pairing, whose motion-heavy offense led the league in assist rate last season.",
    whyNot: "Aside from the addition of exciting rookie Yaxel Lendeborg, the Warriors are running it back with an old squad that limped to 37 wins last year.",
  },
  "Suns": {
    winsLastYear: 45,
    whyBeat: "The Suns outperformed expectations last season with 45 wins; adding Miles Bridges and getting a healthy Jalen Green back could make them even better.",
    whyNot: "New coach Jordan Ott's \"we play hard\" culture certainly helped last season, but how far can that really take this Phoenix team?",
  },
  "Jazz": {
    winsLastYear: 22,
    whyBeat: "For the first time in five years, the Jazz are no longer tanking! #2 pick Darryn Peterson, Jaren Jackson Jr., Ace Bailey, and Lauri Markkanen headline a very intriguing Utah team.",
    whyNot: "Shipping off rebounding machine Walker Kessler for a war chest of draft assets will hurt the Jazz's short-term prospects.",
  },
  "Mavericks": {
    winsLastYear: 26,
    whyBeat: "New coach May, savvy president Ujiri, budding star Flagg, and a now-healthy Kyrie Irving all give Dallas fans reason to hope in a playoff berth.",
    whyNot: "The Mavericks have the league's 4th worst offense and worst paint defense. Their roster continuity (or lack thereof) is also a concern.",
  },
  "Pelicans": {
    winsLastYear: 26,
    whyBeat: "New Orleans faced every kind of bad fortune last year, with all four key players (Williamson, Murray, Jones, Murphy) missing significant time with injuries. That can't possibly happen again...right?",
    whyNot: "If there was ever a franchise cursed with mediocrity, it is the Pelicans.",
  },
  "Clippers": {
    winsLastYear: 42,
    whyBeat: "It's hard to imagine highly-acclaimed Ty Lue letting a 42-win team slip below 28.5 games, even with the Clippers' recent departures (Leonard, Zubac).",
    whyNot: "\"I've been poor, I've been rich, I've been fat, I've been skinny, I've been old, I've been in the Hall of Fame, and one thing I can always tell you: the Clippers have always sucked.” - Charles Barkley",
  },
  "Grizzlies": {
    winsLastYear: 25,
    whyBeat: "Rookie Cam Boozer looks ready to lead this Grizzlies team from Day 1, flanked by other rising stars Cedric Coward and Zach Edey.",
    whyNot: "The lack of proven talent on this team suggests this may not be the \"speedy rebuild\" Memphis's front office expects.",
  },
  "Kings": {
    winsLastYear: 22,
    whyBeat: "Flashy guard Darius Acuff and rumors of impending front office moves have breathed life into the Kings.",
    whyNot: "All expectations are that ever-dysfunctional Sacramento will be fighting to stay out of Adam Silver's new \"Bottom 3.\"",
  },
};
