import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamData, getRegularPlayerByEmail } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { LandingHero } from "@/components/LandingHero";

export const dynamic = "force-dynamic";

export default async function LandingPage({ searchParams }: { searchParams: { landing?: string } }) {
  // Returning players (valid identity cookie for an existing roster) skip the landing page and go straight to
  // their leaderboard. Add ?landing=1 to see the landing page anyway.
  const identityEmail = cookies().get(IDENTITY_COOKIE_NAME)?.value;
  if (identityEmail && searchParams.landing !== "1" && (await getRegularPlayerByEmail(identityEmail))) {
    redirect("/home");
  }

  const teamdata = await getTeamData();
  const hasHero = fs.existsSync(path.join(process.cwd(), "public", "hero.png"));
  return <LandingHero draftDeadline={teamdata.draftDeadline} hasHero={hasHero} />;
}
