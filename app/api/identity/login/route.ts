import { NextRequest, NextResponse } from "next/server";
import { getRegularPlayerByEmail, getPlayerPasswordHash } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !email.includes("@") || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const passwordHash = await getPlayerPasswordHash(email);
  if (!passwordHash || !verifyPassword(password, passwordHash)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const found = await getRegularPlayerByEmail(email);
  if (!found) {
    return NextResponse.json(
      { error: "No entry found for that email." },
      { status: 404 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(IDENTITY_COOKIE_NAME, email.toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
