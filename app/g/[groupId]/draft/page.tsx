import { cookies } from "next/headers";
import { getGroupById } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { getTeamData, getRegularPlayerByEmail, getPlayoffPlayerByEmail } from "@/lib/data";
import { regularEarned } from "@/lib/scoring";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { RegularDraftClient } from "@/components/RegularDraftClient";
import { PlayoffDraftClient } from "@/components/PlayoffDraftClient";

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
    let preloaded = null;
    if (identityEmail) {
      const myRegular = await getRegularPlayerByEmail(identityEmail);
      if (myRegular) {
        const existing = await getPlayoffPlayerByEmail(identityEmail);
        preloaded = {
          myRegular: { name: myRegular.name, entryName: myRegular.entryName, email: myRegular.email },
          budget: Math.floor(regularEarned(myRegular, teamdata)),
          existingPicks: existing?.picks || null,
        };
      }
    }
    return <PlayoffDraftClient teamdata={teamdata} preloaded={preloaded} groupId={group.id} groupName={group.name} />;
  }

  const preloaded = identityEmail ? await getRegularPlayerByEmail(identityEmail) : null;
  return <RegularDraftClient teamdata={teamdata} preloaded={preloaded} groupId={group.id} groupName={group.name} />;
}
