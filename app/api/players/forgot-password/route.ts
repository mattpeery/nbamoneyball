import { NextRequest, NextResponse } from "next/server";
import { getPlayerPasswordHash } from "@/lib/data";
import { createPasswordResetToken } from "@/lib/passwordResetToken";
import { sendEmail, passwordResetEmail, SITE_URL } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Same response either way, whether or not that email has a roster -
  // avoids leaking which emails are registered.
  const existingHash = await getPlayerPasswordHash(email);
  if (existingHash) {
    const token = createPasswordResetToken(email);
    if (token) {
      await sendEmail({
        to: email,
        subject: "Reset your NBA Moneyball password",
        html: passwordResetEmail({ resetUrl: `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}` }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
