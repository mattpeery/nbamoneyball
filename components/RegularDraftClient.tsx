"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronDown } from "lucide-react";
import { EAST, WEST, REG_BUDGET, PROJECTED_WINS, type TeamData } from "@/lib/teams";
import type { PlayerRecord } from "@/lib/scoring";
import { isRegularDraftOpen } from "@/lib/scoring";
import { slug, rosterErrorMessage, PUBLIC_GROUP_ID, leaderboardPathFor } from "@/lib/format";
import { Section, BudgetBar, TeamCard, LoadLookup, Banner, Check, X } from "@/components/ui";
import { ConfirmDetailsModal } from "@/components/ConfirmDetailsModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";

type PendingDetails = { name: string; entryName: string; email: string };

export function RegularDraftClient({
  teamdata,
  players,
  initialEmail,
  groupId,
  groupName,
}: {
  teamdata: TeamData;
  players: PlayerRecord[];
  initialEmail?: string;
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const preloaded = useMemo(
    () => (initialEmail ? players.find((p) => slug(p.email) === slug(initialEmail)) : undefined),
    [initialEmail, players]
  );

  const [alloc, setAlloc] = useState<Record<string, number>>(preloaded?.picks || {});
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [confOpen, setConfOpen] = useState({ East: true, West: true });
  const [showModal, setShowModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [loaded, setLoaded] = useState<{ name?: string; entryName?: string; email?: string; found: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  // Auto-open the How To Play popup the first time someone lands here.
  useEffect(() => {
    try {
      if (!localStorage.getItem("nbamb_howto_seen")) {
        setShowHowItWorks(true);
        localStorage.setItem("nbamb_howto_seen", "1");
      }
    } catch {
      // localStorage unavailable (private mode) - skip the auto-popup
    }
  }, []);

  const open = isRegularDraftOpen(teamdata);
  const locked = !open;

  const spent = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const remaining = REG_BUDGET - spent;
  const distinctTeams = Object.values(alloc).filter((v) => v > 0).length;
  const hasFractional = Object.entries(alloc).some(
    ([t, v]) => v > 0 && v < (teamdata.regular.prices[t] || 0) - 0.01
  );

  // Removing any team makes an existing fractional pick's remainder stale
  // (it was sized to whatever budget was left at the time), so drop it too.
  function withoutTeam(a: Record<string, number>, team: string) {
    const next = { ...a };
    delete next[team];
    for (const [t, v] of Object.entries(next)) {
      if (v > 0 && v < (teamdata.regular.prices[t] || 0) - 0.01) delete next[t];
    }
    return next;
  }

  function toggleTeam(team: string) {
    setMsg(null);
    setAlloc((a) => {
      const owned = (a[team] || 0) > 0;
      if (owned) return withoutTeam(a, team);

      const price = teamdata.regular.prices[team] || 0;
      const currentSpent = Object.values(a).reduce((s, v) => s + v, 0);
      const currentRemaining = REG_BUDGET - currentSpent;
      const currentHasFractional = Object.entries(a).some(
        ([t, v]) => v > 0 && v < (teamdata.regular.prices[t] || 0) - 0.01
      );

      if (currentRemaining >= price) {
        return { ...a, [team]: price };
      }
      if (!currentHasFractional && currentRemaining > 0.01) {
        return { ...a, [team]: currentRemaining };
      }
      setMsg({ tone: "error", text: "Not enough budget left to buy this team." });
      return a;
    });
  }
  function removeTeam(team: string) {
    setAlloc((a) => withoutTeam(a, team));
  }
  function clearAll() {
    setMsg(null);
    setAlloc({});
  }

  function doLookup() {
    const found = players.find((p) => p.email && slug(p.email) === slug(lookupEmail || ""));
    if (found) {
      setAlloc(found.picks || {});
      setLoaded({ name: found.name, entryName: found.entryName, email: found.email, found: true });
    } else setLoaded({ found: false });
  }

  function trySubmit() {
    setMsg(null);
    if (distinctTeams === 0) return setMsg({ tone: "error", text: rosterErrorMessage("empty") });
    setShowModal(true);
  }

  async function confirmSubmit(details: PendingDetails) {
    setBusy(true);
    try {
      const res = await fetch("/api/players/regular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, ...details, picks: alloc }),
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
    <div className="pb-32">
      <div className="px-4 pt-6 pb-1 max-w-2xl mx-auto">
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Pick Your Teams</h1>
        {groupId !== PUBLIC_GROUP_ID && <p className="text-[12.5px] text-[#6B7280] mt-1">{groupName}</p>}
        <button
          onClick={() => setShowHowItWorks(true)}
          className="block mt-1.5 mb-2 text-[14px] text-[#CC0000] font-medium underline decoration-dotted"
        >
          How To Play
        </button>
      </div>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

      <div className="max-w-2xl mx-auto">
        {!preloaded && (
          <LoadLookup
            label="Your email"
            value={lookupEmail}
            setValue={setLookupEmail}
            onLoad={doLookup}
            found={loaded?.found}
            foundMsg="Roster loaded - make changes and submit again to update it."
            notFoundMsg="No roster found for that email."
          />
        )}
      </div>
      <BudgetBar label="Budget remaining" spent={spent} total={REG_BUDGET} alloc={alloc} prices={teamdata.regular.prices} onRemove={removeTeam} onClearAll={clearAll} />

      {locked && (
        <div className="mt-3 max-w-2xl mx-auto">
          <Banner>
            <Lock size={13} /> Draft is locked - picks are view-only.
          </Banner>
        </div>
      )}

      {([["East", EAST], ["West", WEST]] as const).map(([label, teams]) => {
        const sorted = [...teams].sort((a, b) => (teamdata.regular.prices[b] ?? 0) - (teamdata.regular.prices[a] ?? 0));
        return (
          <Section
            key={label}
            title={label === "East" ? "Eastern Conference" : "Western Conference"}
            right={
              <button onClick={() => setConfOpen((o) => ({ ...o, [label]: !o[label] }))} className="text-[#6B7280]">
                <ChevronDown size={16} className={`transition-transform ${confOpen[label] ? "" : "-rotate-90"}`} />
              </button>
            }
          >
            {confOpen[label] && (
              <div className="mx-4 bg-white border border-[#DADFE3] rounded-2xl overflow-hidden">
                {sorted.map((t) => (
                  <TeamCard
                    key={t}
                    team={t}
                    price={teamdata.regular.prices[t]}
                    owned={(alloc[t] || 0) > 0}
                    paidAmount={alloc[t] || 0}
                    onToggle={toggleTeam}
                    disabled={locked}
                    remaining={remaining}
                    hasFractional={hasFractional}
                    projectedWins={PROJECTED_WINS[t]}
                  />
                ))}
              </div>
            )}
          </Section>
        );
      })}

      {!locked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADFE3] p-3.5">
          <div className="max-w-2xl mx-auto">
            {msg && (
              <Banner tone={msg.tone}>
                {msg.tone === "error" ? <X size={13} /> : <Check size={13} />}
                {msg.text}
              </Banner>
            )}
            <button
              onClick={trySubmit}
              disabled={busy}
              className="font-display uppercase tracking-wide w-full bg-[#16A34A] text-white font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.99]"
            >
              {busy ? "Submitting…" : "Submit Roster"}
            </button>
            <p className="text-center text-[11px] text-[#6B7280] mt-1.5">Picks are editable until NBA Opening Day (Oct. 20)</p>
          </div>
        </div>
      )}

      {showModal && (
        <ConfirmDetailsModal
          defaultName={loaded?.name || preloaded?.name || ""}
          defaultEntryName={loaded?.entryName || preloaded?.entryName || ""}
          defaultEmail={loaded?.email || preloaded?.email || lookupEmail || initialEmail || ""}
          onCancel={() => setShowModal(false)}
          onConfirm={confirmSubmit}
          busy={busy}
        />
      )}
    </div>
  );
}
