import "server-only";

const SITE_URL = "https://nbamoneyball.com";
const FROM = process.env.EMAIL_FROM || "NBA Moneyball <picks@nbamoneyball.com>";

// No API key in this environment (local dev, or not configured yet) -
// log instead of sending so the rest of the request never fails because
// of email. Real delivery only happens once RESEND_API_KEY is set.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set - skipping "${subject}" to ${to}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[email] Resend send failed (${res.status}): ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    console.error("[email] Resend request threw:", err);
  }
}

function shell(bodyHtml: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#131518;">
      <div style="font-size:12px;font-weight:600;color:#9AA0A6;letter-spacing:0.02em;">nbamoneyball.com</div>
      ${bodyHtml}
    </div>
  `;
}

export function rosterConfirmationEmail({
  entryName,
  teamNames,
  editableUntilLabel,
  leaderboardUrl,
}: {
  entryName: string;
  teamNames: string[];
  editableUntilLabel: string;
  leaderboardUrl: string;
}): string {
  const teamsHtml = teamNames
    .map(
      (t) =>
        `<span style="display:inline-block;background:#F4F5F6;border:1px solid #DADFE3;border-radius:999px;padding:6px 14px;margin:0 6px 6px 0;font-size:14px;font-weight:600;">${t}</span>`
    )
    .join("");

  return shell(`
    <h1 style="font-size:22px;font-weight:800;margin:16px 0 4px;">Your picks are in!</h1>
    <p style="font-size:14px;color:#6B7280;margin:0 0 16px;">${entryName}</p>
    <div style="margin-bottom:16px;">${teamsHtml}</div>
    <p style="font-size:12px;color:#9AA0A6;margin:0 0 20px;">${editableUntilLabel}</p>
    <a href="${leaderboardUrl}" style="display:inline-block;background:#16A34A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;">View Leaderboard</a>
  `);
}

export { SITE_URL };
