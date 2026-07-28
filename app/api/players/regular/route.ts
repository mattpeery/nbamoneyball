import { NextRequest, NextResponse } from "next/server";
import { getTeamData, upsertRegularPlayer } from "@/lib/data";
import { isRegularDraftOpen, validateRoster } from "@/lib/scoring";
import { ALL_TEAMS, MAX_TEAMS, MIN_TEAMS, REG_BUDGET } from "@/lib/teams";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { rosterErrorMessage } from "@/lib/format";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const entryName = typeof body?.entryName === "string" ? body.entryName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const picks: Record<string, number> = body?.picks && typeof body.picks === "object" ? body.picks : {};

  if (!name || !entryName || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name, entry name, and a valid email are required." }, { status: 400 });
  }
  for (const team of Object.keys(picks)) {
    if (!ALL_TEAMS.includes(team)) {
      return NextResponse.json({ error: `Unknown team: ${team}` }, { status: 400 });
    }
  }

  const teamdata = await getTeamData();
  if (!isRegularDraftOpen(teamdata)) {
    return NextResponse.json({ error: "The regular-season draft is locked." }, { status: 423 });
  }

  const validationError = validateRoster(picks, REG_BUDGET, MIN_TEAMS, MAX_TEAMS);
  if (validationError) {
    return NextResponse.json({ error: rosterErrorMessage(validationError) }, { status: 400 });
  }

  const spent = Object.values(picks)
    .filter((v) => v > 0)
    .reduce((a, b) => a + b, 0);

  if (spent < REG_BUDGET) {
    return NextResponse.json(
      { error: `You need to spend your full $${REG_BUDGET}M budget before submitting - $${REG_BUDGET - spent}M is unallocated.` },
      { status: 400 }
    );
  }

  const result = await upsertRegularPlayer({
    name,
    entryName,
    email,
    picks,
    spent,
    priceSnapshot: teamdata.regular.prices,
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
