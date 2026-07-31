"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { ALL_TEAMS, type TeamData } from "@/lib/teams";
import { isPlayoffDraftOpen } from "@/lib/scoring";
import { rosterErrorMessage, PUBLIC_GROUP_ID, leaderboardPathFor } from "@/lib/format";
import { Section, BudgetBar, TeamCard, PasswordInput, Banner, Check, X } from "@/components/ui";
import { ConfirmDetailsModal } from "@/components/ConfirmDetailsModal";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";

type Unlocked = {
  myRegular: { name: string; entryName: string; email: string };
  budget: number;
  existingPicks: Record<string, number> | null;
};

export function PlayoffDraftClient({
  teamdata,
  preloaded,
  groupId,
  groupName,
}: {
  teamdata: TeamData;
  preloaded?: Unlocked | null;
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<Unlocked | null>(preloaded || null);
  const [email, setEmail] = useState(preloaded?.myRegular.email || "");
  const [password, setPassword] = useState("");
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);

  // Lifted out of the modal so name/entry name/email/password survive the
  // modal closing (backdrop click, a rejected submit, etc.) instead of
  // resetting every time it unmounts.
  const [detailName, setDetailName] = useState(preloaded?.myRegular.name || "");
  const [detailEntryName, setDetailEntryName] = useState(preloaded?.myRegular.entryName || "");
  const [detailEmail, setDetailEmail] = useState(preloaded?.myRegular.email || "");
  const [detailPassword, setDetailPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const myRegular = unlocked?.myRegular || null;
  const budget = unlocked?.budget || 0;
  const locked = !isPlayoffDraftOpen(teamdata) || !myRegular;

  const spent = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const remaining = budget - spent;
  const distinctTeams = Object.values(alloc).filter((v) => v > 0).length;
  const hasFractional = Object.entries(alloc).some(
    ([t, v]) => v > 0 && v < (teamdata.playoff.prices[t] || 0) - 0.01
  );
  const playoffTeams = ALL_TEAMS.filter((t) => teamdata.playoff.teams[t]).sort(
    (a, b) => (teamdata.playoff.prices[b] ?? 0) - (teamdata.playoff.prices[a] ?? 0)
  );

  // Removing any team makes an existing fractional pick's remainder stale
  // (it was sized to whatever budget was left at the time), so drop it too.
  function withoutTeam(a: Record<string, number>, team: string) {
    const next = { ...a };
    delete next[team];
    for (const [t, v] of Object.entries(next)) {
      if (v > 0 && v < (teamdata.playoff.prices[t] || 0) - 0.01) delete next[t];
    }
    return next;
  }

  function toggleTeam(team: string) {
    setMsg(null);
    setAlloc((a) => {
      const owned = (a[team] || 0) > 0;
      if (owned) return withoutTeam(a, team);

      const price = teamdata.playoff.prices[team] || 0;
      const currentSpent = Object.values(a).reduce((s, v) => s + v, 0);
      const currentRemaining = budget - currentSpent;
      const currentHasFractional = Object.entries(a).some(
        ([t, v]) => v > 0 && v < (teamdata.playoff.prices[t] || 0) - 0.01
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

  function loadMine() {
    if (unlocked?.existingPicks) {
      setAlloc(unlocked.existingPicks);
      setMsg(null);
    }
  }

  async function unlock() {
    if (!email.trim() || !password) {
      setUnlockMsg("Enter your email and password.");
      return;
    }
    setUnlockBusy(true);
    setUnlockMsg(null);
    try {
      const res = await fetch("/api/players/playoff-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setUnlockMsg(data?.error || "Couldn't verify your account - try again.");
        setUnlocked(null);
        return;
      }
      setUnlocked({ myRegular: data.myRegular, budget: data.budget, existingPicks: data.existingPicks });
      setDetailName(data.myRegular.name);
      setDetailEntryName(data.myRegular.entryName);
      setDetailEmail(data.myRegular.email);
    } catch {
      setUnlockMsg("Couldn't reach the server - check your connection.");
    } finally {
      setUnlockBusy(false);
    }
  }

  function trySubmit() {
    setMsg(null);
    if (!myRegular) return setMsg({ tone: "error", text: "Verify your email and password first." });
    if (distinctTeams === 0) return setMsg({ tone: "error", text: rosterErrorMessage("empty") });
    setSubmitError(null);
    setShowModal(true);
  }

  async function confirmSubmit() {
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/players/playoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          name: detailName.trim(),
          entryName: detailEntryName.trim(),
          email: detailEmail.trim(),
          password: detailPassword,
          picks: alloc,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        router.push(leaderboardPathFor(groupId));
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error || "Couldn't submit - check your connection and try again.");
      }
    } catch {
      setSubmitError("Couldn't reach the server - check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="px-4 pt-6 pb-1 max-w-2xl mx-auto">
        <h1 className="font-display uppercase tracking-wide text-[22px] font-bold text-[#131518]">Build Your Playoff Roster</h1>
        {groupId !== PUBLIC_GROUP_ID && <p className="text-[12.5px] text-[#6B7280] mt-1">{groupName}</p>}
        <p className="text-[13px] text-[#55595E] leading-snug mt-1.5">
          Your budget is what you earned in the regular season. Playoff wins are worth more each round.
        </p>
      </div>

      {!myRegular && (
        <div className="px-4 mb-3 max-w-2xl mx-auto">
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Email used in the regular season</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="w-full mt-1.5 mb-3 bg-white border border-[#DADFE3] rounded-xl px-4 py-3 text-[15px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
          />
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Password</label>
          <div className="mt-1.5 mb-3">
            <PasswordInput value={password} onChange={setPassword} onEnter={unlock} />
          </div>
          <button
            onClick={unlock}
            disabled={unlockBusy}
            className="font-display uppercase tracking-wide w-full bg-[#131518] text-white font-semibold text-[14px] rounded-xl py-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {unlockBusy ? "Checking…" : "Continue"}
          </button>
          {unlockMsg && (
            <div className="mt-3">
              <Banner tone="error">
                <X size={13} /> {unlockMsg}
              </Banner>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-[11.5px] text-[#6B7280] underline decoration-dotted mt-2"
          >
            Forgot password?
          </button>
          {showForgot && <ForgotPasswordModal initialEmail={email} onClose={() => setShowForgot(false)} />}
        </div>
      )}

      {myRegular && unlocked?.existingPicks && (
        <div className="px-4 mb-3 max-w-2xl mx-auto">
          <button onClick={loadMine} className="text-[12.5px] text-[#CC0000] font-medium">
            You already have a playoff roster - tap to load and edit it
          </button>
        </div>
      )}
      {myRegular && (
        <BudgetBar label="Playoff budget remaining" spent={spent} total={budget} alloc={alloc} prices={teamdata.playoff.prices} onRemove={removeTeam} onClearAll={clearAll} />
      )}
      {teamdata.playoff.locked && (
        <div className="mt-3 max-w-2xl mx-auto">
          <Banner>
            <Lock size={13} /> Playoff draft is locked - picks are view-only.
          </Banner>
        </div>
      )}

      {myRegular && (
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
                paidAmount={alloc[t] || 0}
                onToggle={toggleTeam}
                disabled={teamdata.playoff.locked}
                remaining={remaining}
                hasFractional={hasFractional}
              />
            ))}
          </div>
        </Section>
      )}

      {!teamdata.playoff.locked && myRegular && (
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
              {busy ? "Saving…" : "Save Roster"}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ConfirmDetailsModal
          name={detailName}
          setName={setDetailName}
          entryName={detailEntryName}
          setEntryName={setDetailEntryName}
          email={detailEmail}
          setEmail={setDetailEmail}
          password={detailPassword}
          setPassword={setDetailPassword}
          submitError={submitError}
          onCancel={() => setShowModal(false)}
          onConfirm={confirmSubmit}
          busy={busy}
        />
      )}
    </div>
  );
}
