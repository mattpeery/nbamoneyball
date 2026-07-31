"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { ALL_TEAMS, ROUND_LABELS, type TeamData } from "@/lib/teams";
import { Collapsible, ToggleRow, NumField, Banner } from "@/components/ui";

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminClient({ teamdata }: { teamdata: TeamData }) {
  const router = useRouter();
  const [local, setLocal] = useState<TeamData>(teamdata);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncDays, setSyncDays] = useState(3);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLocal(teamdata);
  }, [teamdata]);

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`/api/sync-scores?daysBack=${syncDays}`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setSyncMsg({
          tone: "success",
          text: `Synced ${data.gamesInWindow} game${data.gamesInWindow === 1 ? "" : "s"} from the last ${syncDays} day${syncDays === 1 ? "" : "s"} - ${data.teamsUpdated} team win total${data.teamsUpdated === 1 ? "" : "s"} updated.`,
        });
        router.refresh();
      } else {
        setSyncMsg({ tone: "error", text: data?.error || "Sync failed - try again." });
      }
    } catch {
      setSyncMsg({ tone: "error", text: "Couldn't reach the server - check your connection." });
    } finally {
      setSyncBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/teamdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local),
      });
      if (res.ok) {
        setMsg("Changes saved.");
        router.refresh();
        setTimeout(() => setMsg(null), 1800);
      } else {
        const data = await res.json().catch(() => null);
        setMsg(data?.error || "Couldn't save.");
      }
    } catch {
      setMsg("Couldn't save - check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] pb-28">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Admin</h1>
        <button onClick={logout} className="text-[12.5px] text-[#6B7280] underline decoration-dotted">
          Log out
        </button>
      </div>

      <div className="mx-4 mb-4 text-[11px] text-[#6B7280] bg-white border border-[#DADFE3] rounded-xl px-3 py-2.5">
        Reached via 5 taps on the landing page title. Passcode is checked server-side against{" "}
        <code className="text-[#3A3F45]">ADMIN_PASSCODE</code>.
      </div>

      <Collapsible title="Game phase" defaultOpen>
        <div className="p-4 flex gap-2">
          {(["regular", "playoff"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setLocal((l) => ({ ...l, phase: p }))}
              className={`py-2.5 flex-1 rounded-xl text-[13px] font-medium ${
                local.phase === p ? "bg-[#CC0000] text-white" : "bg-white text-[#6B7280] border border-[#DADFE3]"
              }`}
            >
              {p === "regular" ? "Regular Season" : "Playoffs"}
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Draft lock deadline</label>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(local.draftDeadline)}
            onChange={(e) => {
              const iso = new Date(e.target.value).toISOString();
              setLocal((l) => ({ ...l, draftDeadline: iso }));
            }}
            className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none"
          />
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            Regular-season picks auto-lock at this time (shown in your browser's local timezone). Editing this doesn't
            require a redeploy.
          </p>
        </div>
      </Collapsible>

      <Collapsible title="Regular season">
        <ToggleRow
          label="Lock draft"
          sub="Blocks new or edited rosters"
          value={local.regular.locked}
          onChange={(v) => setLocal((l) => ({ ...l, regular: { ...l.regular, locked: v } }))}
        />
        <div className="px-4 py-3.5 border-b border-[#ECEEF0]">
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Add/drop windows</label>
          <p className="text-[11px] text-[#6B7280] mt-1 mb-2.5">
            Reopens the draft for trading between these dates - drives the leaderboard countdown too. Set new prices
            below before each one opens.
          </p>
          {local.regular.addDropWindows.map((w, i) => (
            <div key={i} className="flex items-end gap-2 mb-2">
              <div className="flex-1">
                <label className="text-[10px] text-[#9AA0A6]">Opens</label>
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(w.opensAt)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value).toISOString();
                    setLocal((l) => {
                      const windows = [...l.regular.addDropWindows];
                      windows[i] = { ...windows[i], opensAt: iso };
                      return { ...l, regular: { ...l.regular, addDropWindows: windows } };
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-[#DADFE3] text-[13px] text-[#131518] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-[#9AA0A6]">Closes</label>
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(w.closesAt)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value).toISOString();
                    setLocal((l) => {
                      const windows = [...l.regular.addDropWindows];
                      windows[i] = { ...windows[i], closesAt: iso };
                      return { ...l, regular: { ...l.regular, addDropWindows: windows } };
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-[#DADFE3] text-[13px] text-[#131518] outline-none"
                />
              </div>
              <button
                onClick={() =>
                  setLocal((l) => ({
                    ...l,
                    regular: { ...l.regular, addDropWindows: l.regular.addDropWindows.filter((_, wi) => wi !== i) },
                  }))
                }
                className="w-9 h-9 rounded-lg border border-[#DADFE3] flex items-center justify-center text-[#6B7280] shrink-0"
                aria-label="Remove window"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const opensAt = new Date();
              const closesAt = new Date(opensAt.getTime() + 3 * 24 * 60 * 60 * 1000);
              setLocal((l) => ({
                ...l,
                regular: {
                  ...l.regular,
                  addDropWindows: [...l.regular.addDropWindows, { opensAt: opensAt.toISOString(), closesAt: closesAt.toISOString() }],
                },
              }));
            }}
            className="text-[12.5px] text-[#CC0000] font-medium underline decoration-dotted"
          >
            + Add window
          </button>
        </div>
        <div className="px-4 py-3.5 border-b border-[#ECEEF0]">
          <div className="text-[13.5px] text-[#131518] font-medium">Score sync</div>
          <div className="text-[11.5px] text-[#6B7280] mt-0.5">
            Pulls final scores from balldontlie.io and recomputes every team's win total below. Runs automatically
            once a night; use this to sync sooner or to catch up after a missed run.
          </div>
          <div className="text-[11px] text-[#9AA0A6] mt-1.5">
            Last synced: {local.regular.lastSyncedAt ? new Date(local.regular.lastSyncedAt).toLocaleString() : "Never"}
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <NumField value={syncDays} onChange={setSyncDays} suffix="days back" width="w-14" />
            <button
              onClick={syncNow}
              disabled={syncBusy}
              className="flex-1 py-2.5 rounded-xl bg-[#131518] text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {syncBusy ? "Syncing…" : "Sync now"}
            </button>
          </div>
          {syncMsg && (
            <div
              className={`mt-2.5 text-[12.5px] border rounded-xl px-3.5 py-2.5 ${
                syncMsg.tone === "error" ? "text-[#CC0000] bg-[#CC0000]/8 border-[#CC0000]/25" : "text-[#3A3F45] bg-[#131518]/5 border-[#DADFE3]"
              }`}
            >
              {syncMsg.text}
            </div>
          )}
        </div>
        <div className="px-4 py-3 text-[11.5px] text-[#6B7280]">
          Price (in dollars) sets what a team costs to draft. Wins is what you update as the season plays out - it
          drives everyone's earnings automatically.
        </div>
        {ALL_TEAMS.map((t) => (
          <div key={t} className="flex items-center gap-2 px-4 py-2 border-b border-[#ECEEF0] last:border-b-0">
            <span className="flex-1 text-[13px] text-[#131518] truncate">{t}</span>
            <NumField
              value={local.regular.prices[t] ?? 0}
              suffix="$"
              onChange={(v) => setLocal((l) => ({ ...l, regular: { ...l.regular, prices: { ...l.regular.prices, [t]: v } } }))}
            />
            <NumField
              value={local.regular.wins[t] ?? 0}
              suffix="W"
              onChange={(v) => setLocal((l) => ({ ...l, regular: { ...l.regular, wins: { ...l.regular.wins, [t]: v } } }))}
            />
          </div>
        ))}
      </Collapsible>

      <Collapsible title="Playoffs">
        <ToggleRow
          label="Lock draft"
          sub="Blocks new or edited playoff rosters"
          value={local.playoff.locked}
          onChange={(v) => setLocal((l) => ({ ...l, playoff: { ...l.playoff, locked: v } }))}
        />
        <div className="px-4 pt-3 pb-1 text-[11.5px] text-[#6B7280]">Points per win, by round:</div>
        <div className="flex gap-2 px-4 pb-3">
          {ROUND_LABELS.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <div className="text-[10px] text-[#6B7280] mb-1">{label}</div>
              <input
                type="number"
                value={local.playoff.multipliers[i]}
                onChange={(e) =>
                  setLocal((l) => {
                    const m = [...l.playoff.multipliers];
                    m[i] = Number(e.target.value) || 0;
                    return { ...l, playoff: { ...l.playoff, multipliers: m } };
                  })
                }
                className="w-full bg-white border border-[#DADFE3] rounded-lg text-center text-[13px] text-[#CC0000] font-mono py-1.5 outline-none"
              />
            </div>
          ))}
        </div>
        <div className="px-4 pt-2 pb-1 text-[11.5px] text-[#6B7280]">Toggle a team into the field, set its price, and log wins per round.</div>
        {ALL_TEAMS.map((t) => {
          const inField = !!local.playoff.teams[t];
          return (
            <div key={t} className="px-4 py-2.5 border-b border-[#ECEEF0] last:border-b-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setLocal((l) => ({ ...l, playoff: { ...l.playoff, teams: { ...l.playoff.teams, [t]: !inField } } }))}
                  className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center ${
                    inField ? "bg-[#CC0000] border-[#CC0000]" : "border-[#D1D5DB]"
                  }`}
                >
                  {inField && <Check size={12} className="text-white" />}
                </button>
                <span className={`flex-1 text-[13px] truncate ${inField ? "text-[#131518]" : "text-[#9AA0A6]"}`}>{t}</span>
                {inField && (
                  <NumField
                    value={local.playoff.prices[t] ?? 0}
                    suffix="$"
                    onChange={(v) => setLocal((l) => ({ ...l, playoff: { ...l.playoff, prices: { ...l.playoff.prices, [t]: v } } }))}
                  />
                )}
              </div>
              {inField && (
                <div className="flex gap-1.5 mt-2 pl-7">
                  {ROUND_LABELS.map((label, ri) => (
                    <input
                      key={label}
                      type="number"
                      value={(local.playoff.winsByRound[t] || [0, 0, 0, 0])[ri]}
                      onChange={(e) =>
                        setLocal((l) => {
                          const wr = { ...l.playoff.winsByRound };
                          const arr = [...(wr[t] || [0, 0, 0, 0])];
                          arr[ri] = Number(e.target.value) || 0;
                          wr[t] = arr;
                          return { ...l, playoff: { ...l.playoff, winsByRound: wr } };
                        })
                      }
                      className="w-11 bg-white border border-[#DADFE3] rounded-lg text-center text-[12px] text-[#131518] font-mono py-1 outline-none"
                    />
                  ))}
                  <span className="text-[10px] text-[#6B7280] self-center ml-1">wins per round</span>
                </div>
              )}
            </div>
          );
        })}
      </Collapsible>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADFE3] p-3.5">
        {msg && <Banner tone={msg === "Changes saved." ? "success" : "error"}>{msg === "Changes saved." && <Check size={13} />}{msg}</Banner>}
        <button
          onClick={save}
          disabled={busy}
          className="font-display uppercase tracking-wide w-full bg-[#CC0000] text-white font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
