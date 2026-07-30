import { NextRequest, NextResponse } from "next/server";
import { createGroup } from "@/lib/groups";
import { addGroupMember } from "@/lib/data";
import { createGroupSessionToken, groupCookieName } from "@/lib/groupSession";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const result = await createGroup(name, password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const token = createGroupSessionToken(result.group.id);
  if (!token) {
    return NextResponse.json({ error: "Group sessions aren't configured (GROUP_SESSION_SECRET is unset)." }, { status: 500 });
  }

  const identityEmail = req.cookies.get(IDENTITY_COOKIE_NAME)?.value;
  if (identityEmail) await addGroupMember(result.group.id, identityEmail);

  const res = NextResponse.json({ ok: true, groupId: result.group.id, groupName: result.group.name });
  res.cookies.set(groupCookieName(result.group.id), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
