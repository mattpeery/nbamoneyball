import Link from "next/link";
import { cookies } from "next/headers";
import { getGroupById } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { getTeamData, getRegularPlayers, getPlayoffPlayers } from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard";
import { isPlayoffDraftOpen, isRegularDraftOpen } from "@/lib/scoring";
import { slug } from "@/lib/format";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { LeaderboardList } from "@/components/LeaderboardList";
import { PinnedEntryCard } from "@/components/PinnedEntryCard";
import { Flag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ params }: { params: { groupId: string } }) {
  const group = await getGroupById(params.groupId);
  if (!group) {
    return (
      <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4 text-center">
        <p className="text-[14px] text-[#6B7280]">That group doesn&apos;t exist. Check the link, or create a new one from the homepage.</p>
      </div>
    );
  }

  const token = cookies().get(groupCookieName(group.id))?.value;
  if (!verifyGroupSessionToken(group.id, token)) {
    return <GroupPasswordGate groupId={group.id} groupName={group.name} />;
  }

  const [teamdata, regularPlayers, playoffPlayers] = await Promise.all([
    getTeamData(),
    getRegularPlayers(group.id),
    getPlayoffPlayers(group.id),
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
        <p className="text-[13px] text-[#6B7280] mt-1">{group.name} · Leaderboard</p>
      </div>

      {pinnedRow ? (
        <PinnedEntryCard row={pinnedRow} rank={pinnedIndex + 1} isPlayoff={isPlayoff} editable={editable} groupId={group.id} />
      ) : (
        editable && (
          <div className="mx-4 mt-4 bg-white border border-[#DADFE3] rounded-2xl p-4 text-center">
            <p className="text-[13px] text-[#6B7280] mb-3">You haven&apos;t built a roster in this group yet.</p>
            <Link
              href={`/g/${group.id}/draft`}
              className="font-display uppercase tracking-wide block w-full text-center py-2.5 rounded-xl bg-[#CC0000] text-white text-[13.5px] font-semibold active:scale-[0.98] transition-transform"
            >
              Create Your Roster
            </Link>
          </div>
        )
      )}

      <LeaderboardList rows={rows} isPlayoff={isPlayoff} />
    </div>
  );
}
