import { NextRequest, NextResponse } from "next/server";
import { getTeamData, getRegularPlayerByEmail, upsertRegularPlayer } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const groupId = typeof body?.groupId === "string" ? body.groupId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const entryName = typeof body?.entryName === "string" ? body.entryName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!groupId) {
    return NextResponse.json({ error: "Missing group." }, { status: 400 });
  }
  const groupToken = req.cookies.get(groupCookieName(groupId))?.value;
  if (!verifyGroupSessionToken(groupId, groupToken)) {
    return NextResponse.json({ error: "You need to rejoin this group before continuing." }, { status: 401 });
  }
  if (!name || !entryName || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name, entry name, and a valid email are required." }, { status: 400 });
  }

  const [teamdata, existing] = await Promise.all([getTeamData(), getRegularPlayerByEmail(groupId, email)]);

  const result = await upsertRegularPlayer(groupId, {
    name,
    entryName,
    email,
    picks: existing?.picks || {},
    spent: existing?.spent || 0,
    priceSnapshot: existing && Object.keys(existing.priceSnapshot || {}).length ? existing.priceSnapshot : teamdata.regular.prices,
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
