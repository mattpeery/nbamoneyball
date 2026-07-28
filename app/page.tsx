import { getTeamData, getRegularPlayers } from "@/lib/data";
import { LandingHero } from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [teamdata, regularPlayers] = await Promise.all([getTeamData(), getRegularPlayers()]);
  return <LandingHero regularCount={regularPlayers.length} draftDeadline={teamdata.draftDeadline} />;
}
