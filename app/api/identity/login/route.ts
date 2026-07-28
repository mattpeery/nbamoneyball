import { NextRequest, NextResponse } from "next/server";
import { getRegularPlayerByEmail, getPlayoffPlayerByEmail } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) return NextResponse.json({ found: false }, { status: 400 });

  const [regular, playoff] = await Promise.all([getRegularPlayerByEmail(email), getPlayoffPlayerByEmail(email)]);
  if (!regular && !playoff) return NextResponse.json({ found: false });

  const res = NextResponse.json({ found: true });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
