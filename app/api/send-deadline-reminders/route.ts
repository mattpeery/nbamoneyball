import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { getTeamData, saveTeamData, getRegularPlayers } from "@/lib/data";
import { sendEmail, deadlineReminderEmail, SITE_URL } from "@/lib/email";
import { FULL_NAMES } from "@/lib/teams";
import { leaderboardPathFor, PUBLIC_GROUP_ID } from "@/lib/format";

// Sending N emails sequentially can take a while once the player list
// grows - give it room within Vercel's Hobby-plan cap.
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

  const teamdata = await getTeamData();
  const deadlineLabel = new Date(teamdata.draftDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Admin-only preview: sends one sample email without touching the real
  // window/idempotency logic below, so it's safe to run any time.
  const testEmail = req.nextUrl.searchParams.get("testEmail");
  if (testEmail) {
    await sendEmail({
      to: testEmail,
      subject: "Your picks lock tomorrow!",
      html: deadlineReminderEmail({
        entryName: "Test Entry",
        teamNames: ["Boston Celtics", "Denver Nuggets", "Golden State Warriors"],
        deadlineLabel,
        leaderboardUrl: `${SITE_URL}${leaderboardPathFor(PUBLIC_GROUP_ID)}`,
      }),
    });
    return NextResponse.json({ ok: true, sent: 1, test: true });
  }

  const hoursUntilDeadline = (new Date(teamdata.draftDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
  const alreadySent = teamdata.regular.deadlineReminderSentFor === teamdata.draftDeadline;

  // Fires once, in a ~36-to-12-hour window before the deadline - wide
  // enough that a once-a-day cron catches it regardless of what time it runs.
  if (alreadySent || hoursUntilDeadline > 36 || hoursUntilDeadline < 12) {
    return NextResponse.json({ ok: true, sent: 0, reason: alreadySent ? "already-sent" : "outside-window" });
  }

  const players = await getRegularPlayers();

  for (const player of players) {
    const teamNames = Object.keys(player.picks)
      .filter((t) => player.picks[t] > 0)
      .map((t) => FULL_NAMES[t] || t);
    await sendEmail({
      to: player.email,
      subject: "Your picks lock tomorrow!",
      html: deadlineReminderEmail({
        entryName: player.entryName,
        teamNames,
        deadlineLabel,
        leaderboardUrl: `${SITE_URL}${leaderboardPathFor(PUBLIC_GROUP_ID)}`,
      }),
    });
  }

  await saveTeamData({ ...teamdata, regular: { ...teamdata.regular, deadlineReminderSentFor: teamdata.draftDeadline } });

  return NextResponse.json({ ok: true, sent: players.length });
}

export const GET = handle;
export const POST = handle;
