import { cookies } from "next/headers";
import { getGroupById } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import {
  getTeamData,
  getRegularPlayersForGroup,
  getPlayoffPlayersForGroup,
  getRegularPlayerByEmail,
  getPlayoffPlayerByEmail,
} from "@/lib/data";
import type { PlayerRecord } from "@/lib/scoring";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { slug } from "@/lib/format";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { RegularDraftClient } from "@/components/RegularDraftClient";
import { PlayoffDraftClient } from "@/components/PlayoffDraftClient";

/** Ensures the current visitor's own roster is searchable here even before they're a group member. */
function withSelf<T extends PlayerRecord>(players: T[], self: T | null): T[] {
  if (!self) return players;
  return players.some((p) => slug(p.email) === slug(self.email)) ? players : [...players, self];
}

export const dynamic = "force-dynamic";

export default async function DraftPage({ params }: { params: { groupId: string } }) {
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

  const teamdata = await getTeamData();
  const identityEmail = cookies().get(IDENTITY_COOKIE_NAME)?.value;

  if (teamdata.phase === "playoff") {
    const [groupRegular, groupPlayoff, myRegular, myPlayoff] = await Promise.all([
      getRegularPlayersForGroup(group.id),
      getPlayoffPlayersForGroup(group.id),
      identityEmail ? getRegularPlayerByEmail(identityEmail) : Promise.resolve(null),
      identityEmail ? getPlayoffPlayerByEmail(identityEmail) : Promise.resolve(null),
    ]);
    return (
      <PlayoffDraftClient
        teamdata={teamdata}
        regularPlayers={withSelf(groupRegular, myRegular)}
        playoffPlayers={withSelf(groupPlayoff, myPlayoff)}
        initialEmail={identityEmail}
        groupId={group.id}
        groupName={group.name}
      />
    );
  }

  const [groupRegular, myRegular] = await Promise.all([
    getRegularPlayersForGroup(group.id),
    identityEmail ? getRegularPlayerByEmail(identityEmail) : Promise.resolve(null),
  ]);
  return (
    <RegularDraftClient
      teamdata={teamdata}
      players={withSelf(groupRegular, myRegular)}
      initialEmail={identityEmail}
      groupId={group.id}
      groupName={group.name}
    />
  );
}
