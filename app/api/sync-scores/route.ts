import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { syncRecentGames } from "@/lib/syncScores";

// Bounded to a trailing day window (see lib/syncScores.ts), so this never
// needs to paginate a full season — safe within Vercel's function timeout.
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  // Vercel sends this header automatically when it invokes a scheduled cron,
  // as long as CRON_SECRET is set in the project's env vars.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`) return true;

  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const daysBackParam = req.nextUrl.searchParams.get("daysBack");
  const daysBack = Math.min(60, Math.max(1, Number(daysBackParam) || 3));

  const result = await syncRecentGames(daysBack);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result);
}

export const GET = handle;
export const POST = handle;
