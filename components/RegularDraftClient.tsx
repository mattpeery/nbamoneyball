"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronDown } from "lucide-react";
import { EAST, WEST, REG_BUDGET, PROJECTED_WINS, type TeamData } from "@/lib/teams";
import type { PlayerRecord } from "@/lib/scoring";
import { isRegularDraftOpen } from "@/lib/scoring";
import { slug, usd, rosterErrorMessage, PUBLIC_GROUP_ID, leaderboardPathFor } from "@/lib/format";
import { Section, BudgetBar, TeamCard, LoadLookup, Banner, Check, X } from "@/components/ui";
import { ConfirmDetailsModal } from "@/components/ConfirmDetailsModal";
import { GroupChoiceModal } from "@/components/GroupChoiceModal";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { PricingInfoModal } from "@/components/PricingInfoModal";

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
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [loaded, setLoaded] = useState<{ name?: string; entryName?: string; email?: string; found: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDetails, setPendingDetails] = useState<PendingDetails | null>(null);
  const [groupStep, setGroupStep] = useState<"choice" | "create" | "join" | null>(null);

  const open = isRegularDraftOpen(teamdata);
  const locked = !open;

  const spent = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const remaining = REG_BUDGET - spent;
  const distinctTeams = Object.values(alloc).filter((v) => v > 0).length;

  function toggleTeam(team: string) {
    setMsg(null);
    setAlloc((a) => {
      const owned = (a[team] || 0) > 0;
      if (owned) {
        const next = { ...a };
        delete next[team];
        return next;
      }
      const price = teamdata.regular.prices[team] || 0;
      if (price > remaining) {
        setMsg({ tone: "error", text: "Not enough budget left to buy this team." });
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

  function onDetailsConfirmed(details: PendingDetails) {
    setShowModal(false);
    if (groupId === PUBLIC_GROUP_ID) {
      setPendingDetails(details);
      setGroupStep("choice");
    } else {
      submitRoster(groupId, details);
    }
  }

  async function submitRoster(targetGroupId: string, details: PendingDetails, redirectTo?: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/players/regular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: targetGroupId, ...details, picks: alloc }),
      });
      if (res.ok) {
        setGroupStep(null);
        setPendingDetails(null);
        router.push(redirectTo || leaderboardPathFor(targetGroupId));
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setGroupStep(null);
        setMsg({ tone: "error", text: data?.error || "Couldn't submit - check your connection and try again." });
      }
    } catch {
      setGroupStep(null);
      setMsg({ tone: "error", text: "Couldn't submit - check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="px-4 pt-6 pb-1 max-w-2xl mx-auto">
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Build Your Roster</h1>
        {groupId !== PUBLIC_GROUP_ID && <p className="text-[12.5px] text-[#6B7280] mt-1">{groupName}</p>}
        <ol className="text-[13px] text-[#55595E] leading-snug mt-2 space-y-1.5">
          <li>1. Spend up to {usd(REG_BUDGET)} buying NBA teams to build your roster.</li>
          <li>
            2. During the &apos;26–&apos;27 regular season, each team on your roster earns you $1 for every game it
            wins.
          </li>
          <li>
            3. You will use what you earn to build your playoff roster in April.{" "}
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
        <button
          onClick={() => setShowPricingInfo(true)}
          className="block mt-2.5 text-[12.5px] text-[#CC0000] font-medium underline decoration-dotted"
        >
          How Does Pricing Work?
        </button>
      </div>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
      {showPricingInfo && <PricingInfoModal onClose={() => setShowPricingInfo(false)} />}

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
      <BudgetBar label="Budget remaining" spent={spent} total={REG_BUDGET} alloc={alloc} onRemove={removeTeam} onClearAll={clearAll} />

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
                    onToggle={toggleTeam}
                    disabled={locked}
                    affordable={remaining >= (teamdata.regular.prices[t] || 0)}
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
              className="font-display uppercase tracking-wide w-full bg-[#CC0000] text-white font-semibold text-[15px] rounded-xl py-3.5 disabled:opacity-50 active:scale-[0.99]"
            >
              {busy ? "Submitting…" : "Submit Your Roster"}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ConfirmDetailsModal
          defaultName={loaded?.name || preloaded?.name || ""}
          defaultEntryName={loaded?.entryName || preloaded?.entryName || ""}
          defaultEmail={loaded?.email || preloaded?.email || lookupEmail || initialEmail || ""}
          onCancel={() => setShowModal(false)}
          onConfirm={onDetailsConfirmed}
          busy={busy}
        />
      )}

      {groupStep === "choice" && pendingDetails && (
        <GroupChoiceModal
          busy={busy}
          onCancel={() => {
            setGroupStep(null);
            setPendingDetails(null);
          }}
          onSkip={() => submitRoster(PUBLIC_GROUP_ID, pendingDetails)}
          onCreate={() => setGroupStep("create")}
          onJoin={() => setGroupStep("join")}
        />
      )}

      {groupStep === "create" && pendingDetails && (
        <CreateGroupModal
          onCancel={() => setGroupStep("choice")}
          onSuccess={(newGroupId) => submitRoster(newGroupId, pendingDetails, `/g/${newGroupId}/invite`)}
        />
      )}

      {groupStep === "join" && pendingDetails && (
        <JoinGroupModal
          onCancel={() => setGroupStep("choice")}
          onSuccess={(joinedGroupId) => submitRoster(joinedGroupId, pendingDetails)}
        />
      )}
    </div>
  );
}
