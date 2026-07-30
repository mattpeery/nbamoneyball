import { cookies } from "next/headers";
import { getTeamData, getRegularPlayerByEmail, getPlayoffPlayerByEmail } from "@/lib/data";
import { regularEarned } from "@/lib/scoring";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { PUBLIC_GROUP_ID } from "@/lib/format";
import { RegularDraftClient } from "@/components/RegularDraftClient";
import { PlayoffDraftClient } from "@/components/PlayoffDraftClient";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
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
    return (
      <PlayoffDraftClient teamdata={teamdata} preloaded={preloaded} groupId={PUBLIC_GROUP_ID} groupName="Public Leaderboard" />
    );
  }

  const preloaded = identityEmail ? await getRegularPlayerByEmail(identityEmail) : null;
  return (
    <RegularDraftClient teamdata={teamdata} preloaded={preloaded} groupId={PUBLIC_GROUP_ID} groupName="Public Leaderboard" />
  );
}
