import { NextRequest, NextResponse } from "next/server";
import { getTeamData, getRegularPlayerByEmail, upsertPlayoffPlayer } from "@/lib/data";
import { isPlayoffDraftOpen, regularEarned, validateRoster } from "@/lib/scoring";
import { ALL_TEAMS } from "@/lib/teams";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { rosterErrorMessage, PUBLIC_GROUP_ID } from "@/lib/format";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const groupId = typeof body?.groupId === "string" ? body.groupId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const entryName = typeof body?.entryName === "string" ? body.entryName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const picks: Record<string, number> = body?.picks && typeof body.picks === "object" ? body.picks : {};

  if (!groupId) {
    return NextResponse.json({ error: "Missing group." }, { status: 400 });
  }
  if (groupId !== PUBLIC_GROUP_ID) {
    const groupToken = req.cookies.get(groupCookieName(groupId))?.value;
    if (!verifyGroupSessionToken(groupId, groupToken)) {
      return NextResponse.json({ error: "You need to rejoin this group before submitting a roster." }, { status: 401 });
    }
  }

  if (!name || !entryName || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name, entry name, and a valid email are required." }, { status: 400 });
  }

  const teamdata = await getTeamData();
  if (!isPlayoffDraftOpen(teamdata)) {
    return NextResponse.json({ error: "The playoff draft is locked." }, { status: 423 });
  }

  const fieldTeams = ALL_TEAMS.filter((t) => teamdata.playoff.teams[t]);
  for (const team of Object.keys(picks)) {
    if (!fieldTeams.includes(team)) {
      return NextResponse.json({ error: `${team} is not in the playoff field.` }, { status: 400 });
    }
  }

  const myRegular = await getRegularPlayerByEmail(groupId, email);
  if (!myRegular) {
    return NextResponse.json({ error: "No regular-season roster found for that email in this group." }, { status: 400 });
  }
  const budget = Math.floor(regularEarned(myRegular, teamdata));

  const validationError = validateRoster(picks, budget, teamdata.playoff.prices);
  if (validationError) {
    return NextResponse.json({ error: rosterErrorMessage(validationError) }, { status: 400 });
  }

  const spent = Object.values(picks)
    .filter((v) => v > 0)
    .reduce((a, b) => a + b, 0);

  const result = await upsertPlayoffPlayer(groupId, {
    name,
    entryName,
    email,
    picks,
    spent,
    budget,
    priceSnapshot: teamdata.playoff.prices,
    updatedAt: Date.now(),
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
