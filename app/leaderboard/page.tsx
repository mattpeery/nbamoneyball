import Link from "next/link";
import { cookies } from "next/headers";
import { getTeamData, getRegularPlayers, getPlayoffPlayers } from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard";
import { isPlayoffDraftOpen, isRegularDraftOpen } from "@/lib/scoring";
import { slug } from "@/lib/format";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { LeaderboardList } from "@/components/LeaderboardList";
import { PinnedEntryCard } from "@/components/PinnedEntryCard";
import { Flag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [teamdata, regularPlayers, playoffPlayers] = await Promise.all([
    getTeamData(),
    getRegularPlayers(),
    getPlayoffPlayers(),
  ]);
  const { isPlayoff, rows } = buildLeaderboard(teamdata, regularPlayers, playoffPlayers);

  const identityEmail = cookies().get(IDENTITY_COOKIE_NAME)?.value;
  const myKey = identityEmail ? slug(identityEmail) : null;
  const pinnedIndex = myKey ? rows.findIndex((r) => r.key === myKey) : -1;
  const pinnedRow = pinnedIndex >= 0 ? rows[pinnedIndex] : null;
  const editable = isPlayoff ? isPlayoffDraftOpen(teamdata) : isRegularDraftOpen(teamdata);

  return (
    <div className="min-h-screen bg-[#F4F5F6] pb-6">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-display uppercase tracking-wide text-[20px] font-bold text-[#131518]">
            NBA Moneyball
          </Link>
          {isPlayoff && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#CC0000] bg-[#CC0000]/8 border border-[#CC0000]/25 rounded-full px-2.5 py-1">
              <Flag size={11} /> Playoffs
            </span>
          )}
        </div>
        <p className="text-[13px] text-[#6B7280] mt-1">Leaderboard</p>
      </div>

      {pinnedRow && <PinnedEntryCard row={pinnedRow} rank={pinnedIndex + 1} isPlayoff={isPlayoff} editable={editable} />}

      <LeaderboardList rows={rows} isPlayoff={isPlayoff} />
    </div>
  );
}
