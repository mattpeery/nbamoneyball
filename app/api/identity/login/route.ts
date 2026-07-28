import { NextRequest, NextResponse } from "next/server";
import { findRegularPlayerAnyGroup } from "@/lib/data";
import { IDENTITY_COOKIE_NAME } from "@/lib/identity";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const found = await findRegularPlayerAnyGroup(email);
  if (!found) {
    return NextResponse.json(
      { error: "No entry found for that email - tap Play Now to make your picks." },
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
