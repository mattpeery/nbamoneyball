import fs from "node:fs";
import path from "node:path";
import { getTeamData, countAllPlayers } from "@/lib/data";
import { LandingHero } from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [teamdata, playerCount] = await Promise.all([getTeamData(), countAllPlayers()]);
  const hasHero = fs.existsSync(path.join(process.cwd(), "public", "hero.png"));
  return <LandingHero playerCount={playerCount} draftDeadline={teamdata.draftDeadline} hasHero={hasHero} />;
}
