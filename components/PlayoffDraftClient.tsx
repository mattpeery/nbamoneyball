"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { ALL_TEAMS, type TeamData } from "@/lib/teams";
import type { PlayerRecord, PlayoffPlayerRecord } from "@/lib/scoring";
import { isPlayoffDraftOpen, regularEarned } from "@/lib/scoring";
import { slug, rosterErrorMessage, PUBLIC_GROUP_ID, leaderboardPathFor } from "@/lib/format";
import { Section, BudgetBar, TeamCard, Banner, Check, X } from "@/components/ui";
import { ConfirmDetailsModal } from "@/components/ConfirmDetailsModal";

export function PlayoffDraftClient({
  teamdata,
  regularPlayers,
  playoffPlayers,
  initialEmail,
  groupId,
  groupName,
}: {
  teamdata: TeamData;
  regularPlayers: PlayerRecord[];
  playoffPlayers: PlayoffPlayerRecord[];
  initialEmail?: string;
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail || "");
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const myRegular = regularPlayers.find((p) => p.email && slug(p.email) === slug(email || ""));
  const budget = myRegular ? Math.floor(regularEarned(myRegular, teamdata)) : 0;
  const existing = playoffPlayers.find((p) => p.email && slug(p.email) === slug(email || ""));
  const locked = !isPlayoffDraftOpen(teamdata) || !myRegular;

  const spent = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const remaining = budget - spent;
  const distinctTeams = Object.values(alloc).filter((v) => v > 0).length;
  const playoffTeams = ALL_TEAMS.filter((t) => teamdata.playoff.teams[t]).sort(
    (a, b) => (teamdata.playoff.prices[b] ?? 0) - (teamdata.playoff.prices[a] ?? 0)
  );

  function toggleTeam(team: string) {
    setMsg(null);
    setAlloc((a) => {
      const owned = (a[team] || 0) > 0;
      if (owned) {
        const next = { ...a };
        delete next[team];
        return next;
      }
      const price = teamdata.playoff.prices[team] || 0;
      if (price > remaining) {
        setMsg({ tone: "error", text: "Not enough coins left to buy this team." });
        return a;
      }
      return { ...a, [team]: price };
    });
  }
  function removeTeam(team: string) {
    setAlloc((a) => {
      const next = { ...a };
      delete next[team];
      return next;
    });
  }

  function loadMine() {
    if (existing) {
      setAlloc(existing.picks || {});
      setMsg(null);
    }
  }

  function trySubmit() {
    setMsg(null);
    if (!email.trim()) return setMsg({ tone: "error", text: "Enter the email you used in the regular season." });
    if (!myRegular) return setMsg({ tone: "error", text: "No regular-season roster found for that email." });
    if (distinctTeams === 0) return setMsg({ tone: "error", text: rosterErrorMessage("empty") });
    setShowModal(true);
  }

  async function confirmSubmit({ name, entryName, email: confirmedEmail }: { name: string; entryName: string; email: string }) {
    setBusy(true);
    try {
      const res = await fetch("/api/players/playoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, name, entryName, email: confirmedEmail, picks: alloc }),
      });
      setShowModal(false);
      if (res.ok) {
        router.push(leaderboardPathFor(groupId));
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setMsg({ tone: "error", text: data?.error || "Couldn't submit - check your connection and try again." });
      }
    } catch {
      setShowModal(false);
      setMsg({ tone: "error", text: "Couldn't submit - check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="px-4 pt-6 pb-1">
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Build Your Playoff Roster</h1>
        {groupId !== PUBLIC_GROUP_ID && <p className="text-[12.5px] text-[#6B7280] mt-1">{groupName}</p>}
        <p className="text-[13px] text-[#55595E] leading-snug mt-1.5">
          Your budget is what you earned in the regular season. Playoff wins are worth more each round.
        </p>
      </div>
      <div className="px-4 mb-3">
        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Email used in the regular season</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          type="email"
          className="w-full mt-1.5 bg-white border border-[#DADFE3] rounded-xl px-4 py-3 text-[15px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />
        {existing && (
          <button onClick={loadMine} className="mt-2 text-[12.5px] text-[#CC0000] font-medium">
            You already have a playoff roster - tap to load and edit it
          </button>
        )}
      </div>
      {email.trim() && !myRegular && <Banner tone="error">No regular-season roster found for that email.</Banner>}
      {myRegular && (
        <BudgetBar label="Playoff budget remaining" spent={spent} total={budget} alloc={alloc} onRemove={removeTeam} />
      )}
      {teamdata.playoff.locked && (
        <div className="mt-3">
          <Banner>
            <Lock size={13} /> Playoff draft is locked - picks are view-only.
          </Banner>
        </div>
      )}

      <Section title="Playoff field">
        <div className="mx-4 bg-white border border-[#DADFE3] rounded-2xl overflow-hidden">
          {playoffTeams.length === 0 && (
            <div className="px-4 py-6 text-[13px] text-[#6B7280] text-center">Bracket not set yet - check back once it's announced.</div>
          )}
          {playoffTeams.map((t) => (
            <TeamCard
              key={t}
              team={t}
              price={teamdata.playoff.prices[t]}
              owned={(alloc[t] || 0) > 0}
              onToggle={toggleTeam}
              disabled={teamdata.playoff.locked || !myRegular}
              affordable={remaining >= (teamdata.playoff.prices[t] || 0)}
            />
          ))}
        </div>
      </Section>

      {!teamdata.playoff.locked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADFE3] p-3.5">
          {msg && (
            <Banner tone={msg.tone}>
              {msg.tone === "error" ? <X size={13} /> : <Check size={13} />}
              {msg.text}
            </Banner>
          )}
          <button
            onClick={trySubmit}
            disabled={busy || !myRegular}
            className="font-display uppercase tracking-wide w-full bg-[#CC0000] text-white font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.99]"
          >
            {busy ? "Submitting…" : "Submit Your Roster"}
          </button>
        </div>
      )}

      {showModal && (
        <ConfirmDetailsModal
          defaultName={existing?.name || myRegular?.name || ""}
          defaultEntryName={existing?.entryName || myRegular?.entryName || ""}
          defaultEmail={existing?.email || myRegular?.email || email || ""}
          onCancel={() => setShowModal(false)}
          onConfirm={confirmSubmit}
          busy={busy}
        />
      )}
    </div>
  );
}
