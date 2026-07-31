import { NextRequest, NextResponse } from "next/server";
import { setPlayerPasswordHash } from "@/lib/data";
import { verifyPasswordResetToken } from "@/lib/passwordResetToken";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const email = verifyPasswordResetToken(token);
  if (!email) {
    return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Choose a password of at least 6 characters." }, { status: 400 });
  }

  const result = await setPlayerPasswordHash(email, hashPassword(password));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
