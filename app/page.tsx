import fs from "node:fs";
import path from "node:path";
import { getTeamData } from "@/lib/data";
import { LandingHero } from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const teamdata = await getTeamData();
  const hasHero = fs.existsSync(path.join(process.cwd(), "public", "hero.png"));
  return <LandingHero draftDeadline={teamdata.draftDeadline} hasHero={hasHero} />;
}
