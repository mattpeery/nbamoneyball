import { getTeamData, countAllPlayers } from "@/lib/data";
import { LandingHero } from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [teamdata, playerCount] = await Promise.all([getTeamData(), countAllPlayers()]);
  return <LandingHero playerCount={playerCount} draftDeadline={teamdata.draftDeadline} />;
}
