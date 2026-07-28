import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { saveTeamData } from "@/lib/data";
import type { TeamData } from "@/lib/teams";

export async function POST(req: NextRequest) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as TeamData | null;
  if (!body || !body.regular || !body.playoff || !body.draftDeadline) {
    return NextResponse.json({ error: "Malformed team data." }, { status: 400 });
  }

  const result = await saveTeamData(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
