import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "Admin login isn't configured (ADMIN_PASSCODE is unset)." }, { status: 500 });
  }
  if (passcode !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Admin login isn't configured (ADMIN_SESSION_SECRET is unset)." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
