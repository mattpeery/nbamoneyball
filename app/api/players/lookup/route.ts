import { NextRequest, NextResponse } from "next/server";
import { getRegularPlayerByEmail, getPlayerPasswordHash } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { verifyPassword } from "@/lib/password";

const GENERIC_ERROR = "Email or password is incorrect.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const passwordHash = await getPlayerPasswordHash(email);
  if (!passwordHash || !verifyPassword(password, passwordHash)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const player = await getRegularPlayerByEmail(email);
  if (!player) return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });

  const res = NextResponse.json({
    ok: true,
    player: {
      name: player.name,
      entryName: player.entryName,
      email: player.email,
      picks: player.picks,
      priceSnapshot: player.priceSnapshot,
    },
  });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
