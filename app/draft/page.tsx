import { cookies } from "next/headers";
import { getTeamData, getRegularPlayers, getPlayoffPlayers } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { RegularDraftClient } from "@/components/RegularDraftClient";
import { PlayoffDraftClient } from "@/components/PlayoffDraftClient";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
  const teamdata = await getTeamData();
  const identityEmail = cookies().get(IDENTITY_COOKIE_NAME)?.value;

  if (teamdata.phase === "playoff") {
    const [regularPlayers, playoffPlayers] = await Promise.all([getRegularPlayers(), getPlayoffPlayers()]);
    return (
      <PlayoffDraftClient
        teamdata={teamdata}
        regularPlayers={regularPlayers}
        playoffPlayers={playoffPlayers}
        initialEmail={identityEmail}
      />
    );
  }

  const regularPlayers = await getRegularPlayers();
  return <RegularDraftClient teamdata={teamdata} players={regularPlayers} initialEmail={identityEmail} />;
}
