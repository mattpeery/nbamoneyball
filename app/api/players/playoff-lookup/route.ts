import { NextRequest, NextResponse } from "next/server";
import { getTeamData, getRegularPlayerByEmail, getPlayoffPlayerByEmail, getPlayerPasswordHash } from "@/lib/data";
import { regularEarned } from "@/lib/scoring";
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

  const myRegular = await getRegularPlayerByEmail(email);
  if (!myRegular) return NextResponse.json({ error: "No regular-season roster found for that email." }, { status: 400 });

  const [teamdata, existing] = await Promise.all([getTeamData(), getPlayoffPlayerByEmail(email)]);
  const budget = Math.floor(regularEarned(myRegular, teamdata));

  const res = NextResponse.json({
    ok: true,
    budget,
    myRegular: { name: myRegular.name, entryName: myRegular.entryName, email: myRegular.email },
    existingPicks: existing?.picks || null,
  });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
