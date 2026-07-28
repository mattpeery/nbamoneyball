"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronDown } from "lucide-react";
import { EAST, WEST, REG_BUDGET, MAX_TEAMS, MIN_TEAMS, type TeamData } from "@/lib/teams";
import type { PlayerRecord } from "@/lib/scoring";
import { isRegularDraftOpen } from "@/lib/scoring";
import { slug, M, rosterErrorMessage } from "@/lib/format";
import { Section, BudgetBar, TeamCard, LoadLookup, Banner, Check, X } from "@/components/ui";
import { ConfirmDetailsModal } from "@/components/ConfirmDetailsModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";

export function RegularDraftClient({
  teamdata,
  players,
  initialEmail,
}: {
  teamdata: TeamData;
  players: PlayerRecord[];
  initialEmail?: string;
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

  const open = isRegularDraftOpen(teamdata);
  const locked = !open;

  const spent = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const remaining = REG_BUDGET - spent;
  const distinctTeams = Object.values(alloc).filter((v) => v > 0).length;
  const atCap = distinctTeams >= MAX_TEAMS;

  function setTeam(team: string, rawVal: number) {
    setAlloc((a) => {
      const already = (a[team] || 0) > 0;
      const otherSpent = Object.entries(a).reduce((s, [k, v]) => (k === team ? s : s + v), 0);
      const maxAllowed = Math.max(0, REG_BUDGET - otherSpent);
      const val = Math.max(0, Math.min(rawVal, maxAllowed));
      if (val > 0 && !already && distinctTeams >= MAX_TEAMS) {
        setMsg({ tone: "error", text: rosterErrorMessage("too-many-teams") });
        return a;
      }
      return { ...a, [team]: val };
    });
  }
  function removeTeam(team: string) {
    setTeam(team, 0);
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
    if (distinctTeams < MIN_TEAMS) return setMsg({ tone: "error", text: rosterErrorMessage("too-few-teams") });
    if (remaining < 0) return setMsg({ tone: "error", text: `Over budget by ${M(-remaining)}.` });
    if (remaining > 0)
      return setMsg({
        tone: "error",
        text: `You need to spend your full $100M budget before submitting - you have ${M(remaining)} left to allocate.`,
      });
    setShowModal(true);
  }

  async function confirmSubmit({ name, entryName, email }: { name: string; entryName: string; email: string }) {
    setBusy(true);
    try {
      const res = await fetch("/api/players/regular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, entryName, email, picks: alloc }),
      });
      setShowModal(false);
      if (res.ok) {
        router.push("/leaderboard");
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
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Build Your Roster</h1>
        <ol className="text-[13px] text-[#55595E] leading-snug mt-2 space-y-1.5">
          <li>1. Allocate your $100M budget across {MIN_TEAMS}–{MAX_TEAMS} NBA teams to build your roster.</li>
          <li>
            2. During the &apos;26–&apos;27 regular season, you will earn $1M for each of your teams&apos; wins,
            multiplied by the number of shares you have.
          </li>
          <li>
            3. You will use your regular season earnings to build your playoff roster in April.{" "}
            <button
              onClick={() => setShowHowItWorks(true)}
              className="text-[#CC0000] font-medium underline decoration-dotted"
            >
              More details
            </button>
          </li>
        </ol>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#CC0000] bg-[#CC0000]/8 border border-[#CC0000]/25 rounded-full px-3 py-1.5">
          <Lock size={11} /> Picks lock at tip-off on NBA Opening Day (Oct. 20)
        </div>
      </div>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

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
      <BudgetBar label="Budget remaining" spent={spent} total={REG_BUDGET} alloc={alloc} prices={teamdata.regular.prices} onRemove={removeTeam} />

      {locked && (
        <div className="mt-3">
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
                    allocated={alloc[t] || 0}
                    onChange={setTeam}
                    disabled={locked}
                    atCap={atCap}
                  />
                ))}
              </div>
            )}
          </Section>
        );
      })}

      {!locked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADFE3] p-3.5">
          {msg && (
            <Banner tone={msg.tone}>
              {msg.tone === "error" ? <X size={13} /> : <Check size={13} />}
              {msg.text}
            </Banner>
          )}
          <button
            onClick={trySubmit}
            disabled={busy}
            className="font-display uppercase tracking-wide w-full bg-[#CC0000] text-white font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.99]"
          >
            {busy ? "Submitting…" : "Submit Your Roster"}
          </button>
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
