import { NextRequest, NextResponse } from "next/server";
import { getGroupByNormalizedName, getGroupById } from "@/lib/groups";
import { verifyPassword } from "@/lib/password";
import { addGroupMember } from "@/lib/data";
import { createGroupSessionToken, groupCookieName } from "@/lib/groupSession";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const groupId = typeof body?.groupId === "string" ? body.groupId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if ((!groupId && !name) || !password) {
    return NextResponse.json({ error: "Enter the group name and password." }, { status: 400 });
  }

  const group = groupId ? await getGroupById(groupId) : await getGroupByNormalizedName(name);
  const genericError = "Group name or password is incorrect.";
  if (!group || !verifyPassword(password, group.passwordHash)) {
    return NextResponse.json({ error: genericError }, { status: 401 });
  }

  const token = createGroupSessionToken(group.id);
  if (!token) {
    return NextResponse.json({ error: "Group sessions aren't configured (GROUP_SESSION_SECRET is unset)." }, { status: 500 });
  }

  const identityEmail = req.cookies.get(IDENTITY_COOKIE_NAME)?.value;
  if (identityEmail) await addGroupMember(group.id, identityEmail);

  const res = NextResponse.json({ ok: true, groupId: group.id, groupName: group.name });
  res.cookies.set(groupCookieName(group.id), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
