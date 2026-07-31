import { NextRequest, NextResponse } from "next/server";
import { getTeamData, upsertRegularPlayer, getPlayerPasswordHash, getRegularPlayerByEmail } from "@/lib/data";
import { isRegularDraftOpen, validateRoster } from "@/lib/scoring";
import { ALL_TEAMS, REG_BUDGET } from "@/lib/teams";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { rosterErrorMessage, PUBLIC_GROUP_ID, leaderboardPathFor } from "@/lib/format";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendEmail, rosterConfirmationEmail, SITE_URL } from "@/lib/email";
import { FULL_NAMES } from "@/lib/teams";

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

  // A team a player already held keeps validating (and gets snapshotted)
  // against its OLD price, not today's live price - otherwise an admin
  // repricing teams for an add/drop window would break every existing
  // holder's roster the next time they save anything, even teams they
  // never touched. Only a genuinely new/changed dollar amount for a team
  // uses today's live price.
  const existing = isNew ? null : await getRegularPlayerByEmail(email);
  const oldPicks = existing?.picks || {};
  const oldSnapshot = existing?.priceSnapshot || {};

  const effectivePrices = { ...teamdata.regular.prices };
  for (const [team, dollars] of Object.entries(picks)) {
    const unchanged = dollars > 0 && oldPicks[team] !== undefined && Math.abs(dollars - oldPicks[team]) <= 0.01;
    if (unchanged) effectivePrices[team] = dollars;
  }

  const validationError = validateRoster(picks, REG_BUDGET, effectivePrices);
  if (validationError) {
    return NextResponse.json({ error: rosterErrorMessage(validationError) }, { status: 400 });
  }

  const spent = Object.values(picks)
    .filter((v) => v > 0)
    .reduce((a, b) => a + b, 0);

  const priceSnapshot: Record<string, number> = {};
  for (const [team, dollars] of Object.entries(picks)) {
    if (!(dollars > 0)) continue;
    const unchanged = oldPicks[team] !== undefined && Math.abs(dollars - oldPicks[team]) <= 0.01 && oldSnapshot[team] !== undefined;
    priceSnapshot[team] = unchanged ? oldSnapshot[team] : teamdata.regular.prices[team];
  }

  const result = await upsertRegularPlayer(
    {
      name,
      entryName,
      email,
      picks,
      spent,
      priceSnapshot,
      updatedAt: Date.now(),
    },
    passwordHash,
    groupId
  );

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  if (isNew) {
    const teamNames = Object.keys(picks)
      .filter((t) => picks[t] > 0)
      .map((t) => FULL_NAMES[t] || t);
    const deadlineLabel = new Date(teamdata.draftDeadline).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    await sendEmail({
      to: email,
      subject: "Welcome to NBA Moneyball! Your picks are in",
      html: rosterConfirmationEmail({
        entryName,
        teamNames,
        editableUntilLabel: `Picks can be edited until Opening Day (${deadlineLabel}).`,
        leaderboardUrl: `${SITE_URL}${leaderboardPathFor(groupId)}`,
      }),
    });
  }

  const res = NextResponse.json({ ok: true, isNew });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
