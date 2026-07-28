import { cookies } from "next/headers";
import { getTeamData, getRegularPlayers, getPlayoffPlayers } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { PUBLIC_GROUP_ID } from "@/lib/format";
import { RegularDraftClient } from "@/components/RegularDraftClient";
import { PlayoffDraftClient } from "@/components/PlayoffDraftClient";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
  const teamdata = await getTeamData();
  const identityEmail = cookies().get(IDENTITY_COOKIE_NAME)?.value;

  if (teamdata.phase === "playoff") {
    const [regularPlayers, playoffPlayers] = await Promise.all([
      getRegularPlayers(PUBLIC_GROUP_ID),
      getPlayoffPlayers(PUBLIC_GROUP_ID),
    ]);
    return (
      <PlayoffDraftClient
        teamdata={teamdata}
        regularPlayers={regularPlayers}
        playoffPlayers={playoffPlayers}
        initialEmail={identityEmail}
        groupId={PUBLIC_GROUP_ID}
        groupName="Public Leaderboard"
      />
    );
  }

  const regularPlayers = await getRegularPlayers(PUBLIC_GROUP_ID);
  return (
    <RegularDraftClient
      teamdata={teamdata}
      players={regularPlayers}
      initialEmail={identityEmail}
      groupId={PUBLIC_GROUP_ID}
      groupName="Public Leaderboard"
    />
  );
}
