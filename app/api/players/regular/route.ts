import { NextRequest, NextResponse } from "next/server";
import { getTeamData, upsertRegularPlayer, getPlayerPasswordHash } from "@/lib/data";
import { isRegularDraftOpen, validateRoster } from "@/lib/scoring";
import { ALL_TEAMS, REG_BUDGET } from "@/lib/teams";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { rosterErrorMessage, PUBLIC_GROUP_ID } from "@/lib/format";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const groupId = typeof body?.groupId === "string" ? body.groupId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const entryName = typeof body?.entryName === "string" ? body.entryName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
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
  for (const team of Object.keys(picks)) {
    if (!ALL_TEAMS.includes(team)) {
      return NextResponse.json({ error: `Unknown team: ${team}` }, { status: 400 });
    }
  }

  const existingHash = await getPlayerPasswordHash(email);
  const isNew = !existingHash;
  let passwordHash: string;
  if (existingHash) {
    if (!password || !verifyPassword(password, existingHash)) {
      return NextResponse.json({ error: "Incorrect password for this email." }, { status: 401 });
    }
    passwordHash = existingHash;
  } else {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Choose a password of at least 6 characters." }, { status: 400 });
    }
    passwordHash = hashPassword(password);
  }

  const teamdata = await getTeamData();
  if (!isRegularDraftOpen(teamdata)) {
    return NextResponse.json({ error: "The regular-season draft is locked." }, { status: 423 });
  }

  const validationError = validateRoster(picks, REG_BUDGET, teamdata.regular.prices);
  if (validationError) {
    return NextResponse.json({ error: rosterErrorMessage(validationError) }, { status: 400 });
  }

  const spent = Object.values(picks)
    .filter((v) => v > 0)
    .reduce((a, b) => a + b, 0);

  const result = await upsertRegularPlayer(
    {
      name,
      entryName,
      email,
      picks,
      spent,
      priceSnapshot: teamdata.regular.prices,
      updatedAt: Date.now(),
    },
    passwordHash,
    groupId
  );

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  const res = NextResponse.json({ ok: true, isNew });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
