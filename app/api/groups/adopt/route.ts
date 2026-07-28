import { NextRequest, NextResponse } from "next/server";
import { getRegularPlayerByEmail, upsertRegularPlayer } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { PUBLIC_GROUP_ID } from "@/lib/format";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";

/**
 * Copies the caller's public-pool roster into a group they just joined, so
 * they show up on that group's leaderboard immediately. No-op if they have
 * no public roster or already have one in the group.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const groupId = typeof body?.groupId === "string" ? body.groupId : "";
  if (!groupId || groupId === PUBLIC_GROUP_ID) {
    return NextResponse.json({ error: "Missing group." }, { status: 400 });
  }
  const token = req.cookies.get(groupCookieName(groupId))?.value;
  if (!verifyGroupSessionToken(groupId, token)) {
    return NextResponse.json({ error: "Join the group first." }, { status: 401 });
  }
  const email = req.cookies.get(IDENTITY_COOKIE_NAME)?.value;
  if (!email) return NextResponse.json({ ok: true, copied: false });

  const [publicRoster, existing] = await Promise.all([
    getRegularPlayerByEmail(PUBLIC_GROUP_ID, email),
    getRegularPlayerByEmail(groupId, email),
  ]);
  if (!publicRoster || existing) return NextResponse.json({ ok: true, copied: false });

  const result = await upsertRegularPlayer(groupId, { ...publicRoster, updatedAt: Date.now() });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true, copied: true });
}
