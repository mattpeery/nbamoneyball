import Link from "next/link";
import { cookies } from "next/headers";
import { Flag } from "lucide-react";
import { getGroupById, type Group } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { getTeamData, getRegularPlayers, getPlayoffPlayers, getRegularPlayersForGroup, getPlayoffPlayersForGroup } from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard";
import { isPlayoffDraftOpen, isRegularDraftOpen, getOpenAddDropWindow, getNextAddDropWindow } from "@/lib/scoring";
import { slug, PUBLIC_GROUP_ID, draftPathFor } from "@/lib/format";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { HomeLeaderboard } from "@/components/HomeLeaderboard";
import { UserEntryCard } from "@/components/UserEntryCard";
import { GroupHeaderControls } from "@/components/GroupHeaderControls";
import { CalendarCountdown } from "@/components/ui";
import { RosterSuccessGate } from "@/components/RosterSuccessGate";

export const dynamic = "force-dynamic";

const GROUP_COOKIE_PREFIX = "nba_group_";

/** Whole days until an ISO date, or null once it's passed. */
function daysUntil(iso: string): number | null {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
}

export default async function HomePage({ searchParams }: { searchParams: { g?: string; new?: string } }) {
  const cookieStore = cookies();

  // Groups this browser has joined (valid signed cookies only).
  const memberGroupIds = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith(GROUP_COOKIE_PREFIX))
    .map((c) => ({ id: c.name.slice(GROUP_COOKIE_PREFIX.length), token: c.value }))
    .filter(({ id, token }) => id !== PUBLIC_GROUP_ID && verifyGroupSessionToken(id, token))
    .map(({ id }) => id);
  const memberGroups = (await Promise.all(memberGroupIds.map((id) => getGroupById(id)))).filter(
    (g): g is Group & { passwordHash: string } => !!g
  );

  const selected = searchParams.g && searchParams.g !== PUBLIC_GROUP_ID ? searchParams.g : PUBLIC_GROUP_ID;
  if (selected !== PUBLIC_GROUP_ID) {
    const group = await getGroupById(selected);
    if (!group) {
      return (
        <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4 text-center">
          <p className="text-[14px] text-[#6B7280]">That group doesn&apos;t exist. Check the link, or head back to the homepage.</p>
        </div>
      );
    }
    const token = cookieStore.get(groupCookieName(group.id))?.value;
    if (!verifyGroupSessionToken(group.id, token)) {
      return <GroupPasswordGate groupId={group.id} groupName={group.name} />;
    }
    if (!memberGroups.some((g) => g.id === group.id)) memberGroups.push(group);
  }

  const [teamdata, regularPlayers, playoffPlayers] = await Promise.all([
    getTeamData(),
    selected === PUBLIC_GROUP_ID ? getRegularPlayers() : getRegularPlayersForGroup(selected),
    selected === PUBLIC_GROUP_ID ? getPlayoffPlayers() : getPlayoffPlayersForGroup(selected),
  ]);
  const { isPlayoff, rows } = buildLeaderboard(teamdata, regularPlayers, playoffPlayers);

  const identityEmail = cookieStore.get(IDENTITY_COOKIE_NAME)?.value;
  const myKey = identityEmail ? slug(identityEmail) : null;
  const myIndex = myKey ? rows.findIndex((r) => r.key === myKey) : -1;
  const myRow = myIndex >= 0 ? rows[myIndex] : null;
  const editable = isPlayoff ? isPlayoffDraftOpen(teamdata) : isRegularDraftOpen(teamdata);

  const daysToSubmit = !isPlayoff ? daysUntil(teamdata.draftDeadline) : null;
  const openWindow = !isPlayoff ? getOpenAddDropWindow(teamdata) : null;
  const nextWindow = !isPlayoff && !openWindow ? getNextAddDropWindow(teamdata) : null;
  const daysToWindowClose = openWindow ? daysUntil(openWindow.closesAt) : null;
  const daysToNextWindow = nextWindow ? daysUntil(nextWindow.opensAt) : null;

  // Editable because of a currently-open window vs. still-before-the-initial-
  // deadline both need "days left to lock" - just pointed at whichever
  // boundary is actually the reason picks are open right now.
  const pastDeadline = Date.now() > new Date(teamdata.draftDeadline).getTime();
  const daysToLock = !isPlayoff ? (pastDeadline ? daysToWindowClose : daysToSubmit) : null;
  const plural = (n: number) => (n === 1 ? "day" : "days");
  const entryNote = isPlayoff
    ? null
    : editable
    ? daysToLock !== null
      ? `${daysToLock} ${plural(daysToLock)} left to lock your picks`
      : null
    : daysToNextWindow !== null
    ? `Rosters are locked — ${daysToNextWindow} ${plural(daysToNextWindow)} until the next rebalancing window`
    : "Rosters are locked";

  const countdowns = (
    <>
      {daysToSubmit !== null && <CalendarCountdown label="Submit deadline" days={daysToSubmit} />}
      {daysToWindowClose !== null ? (
        <CalendarCountdown label="Window closes" days={daysToWindowClose} />
      ) : (
        daysToNextWindow !== null && <CalendarCountdown label="Next add/drop window" days={daysToNextWindow} />
      )}
    </>
  );
  const hasCountdowns = daysToSubmit !== null || daysToWindowClose !== null || daysToNextWindow !== null;

  return (
    <div className="min-h-screen bg-[#F4F5F6] pb-10">
      <div className="px-4 pt-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display uppercase tracking-wide text-[40px] font-bold text-[#131518] leading-none">
            Leaderboard
          </h1>
          <div className="flex items-center gap-2.5">
            {hasCountdowns && <div className="hidden sm:flex items-center gap-2.5">{countdowns}</div>}
            {isPlayoff && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#CC0000] bg-[#CC0000]/8 border border-[#CC0000]/25 rounded-full px-2.5 py-1">
                <Flag size={11} /> Playoffs
              </span>
            )}
          </div>
        </div>

        <GroupHeaderControls
          selected={selected}
          selectedName={selected === PUBLIC_GROUP_ID ? "Public" : memberGroups.find((g) => g.id === selected)?.name ?? selected}
          memberGroups={memberGroups}
        />

        {hasCountdowns && <div className="flex sm:hidden flex-wrap gap-2.5 mt-3">{countdowns}</div>}

        {myRow ? (
          <UserEntryCard row={myRow} rank={myIndex + 1} isPlayoff={isPlayoff} groupId={selected} editable={editable} note={entryNote} />
        ) : (
          editable && (
            <div className="mt-4 bg-white border border-[#DADFE3] rounded-2xl p-4 text-center">
              <p className="text-[13px] text-[#6B7280] mb-3">
                {selected === PUBLIC_GROUP_ID
                  ? "You haven't made your picks yet."
                  : "You haven't made picks in this group yet."}
              </p>
              <Link
                href={draftPathFor(selected)}
                className="font-display uppercase tracking-wide inline-block px-8 py-2.5 rounded-full bg-[#16A34A] text-white text-[13.5px] font-semibold active:scale-[0.98] transition-transform"
              >
                {selected === PUBLIC_GROUP_ID ? "Play Now" : "Make Your Picks"}
              </Link>
            </div>
          )
        )}

        <HomeLeaderboard rows={rows} isPlayoff={isPlayoff} />
      </div>

      {searchParams.new === "1" && myRow && <RosterSuccessGate teams={myRow.basket.map((b) => b.team)} />}
    </div>
  );
}
