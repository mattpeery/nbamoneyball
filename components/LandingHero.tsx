"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";
import { AdminGateModal } from "./AdminGateModal";
import { LoginModal } from "./LoginModal";

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[52px]">
      <div className="font-display text-[26px] font-bold text-[#131518] tabular-nums leading-none">{String(value).padStart(2, "0")}</div>
      <div className="text-[10px] text-[#6B7280] mt-1 tracking-wide uppercase">{label}</div>
    </div>
  );
}

export function LandingHero({
  playerCount,
  draftDeadline,
  hasHero,
}: {
  playerCount: number;
  draftDeadline: string;
  hasHero: boolean;
}) {
  const { d, h, m, s, done } = useCountdown(draftDeadline);
  const [tapCount, setTapCount] = useState(0);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTitleTap() {
    setTapCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        setShowAdminGate(true);
        return 0;
      }
      return next;
    });
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#CC0000] bg-[#CC0000]/8 border border-[#CC0000]/25 rounded-full px-3 py-1 mb-5">
            <Flag size={11} /> Season starts 10/20/2026
          </div>
          <h1
            onClick={handleTitleTap}
            className="font-display uppercase text-[34px] leading-[1.05] font-bold text-[#131518] tracking-tight select-none cursor-default"
          >
            NBA Moneyball
          </h1>
          <p className="font-display text-[19px] font-medium text-[#55595E] mt-2 leading-snug">How many wins can you buy?</p>
          {hasHero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/hero.png" alt="NBA Moneyball" className="mx-auto mt-5 w-48 h-auto" />
          )}
        </div>

        <Link
          href="/draft"
          className="font-display uppercase tracking-wide mt-7 block w-full py-4 rounded-2xl bg-[#16A34A] text-white text-[16px] font-semibold active:scale-[0.98] transition-transform text-center"
        >
          Play Now
        </Link>
        <button
          onClick={() => setShowLogin(true)}
          className="font-display uppercase tracking-wide mt-3 block w-full py-3 rounded-2xl bg-white border border-[#DADFE3] text-[#131518] text-[13.5px] font-semibold active:scale-[0.98] transition-transform"
        >
          Log In
        </button>

        <div className="mt-8 border border-[#DADFE3] bg-white rounded-2xl px-4 py-5 shadow-sm">
          <div className="text-center text-[11px] text-[#6B7280] uppercase tracking-wide mb-3">
            {done ? "Draft is closed" : "Draft closes in"}
          </div>
          {!done && (
            <div className="flex items-center justify-center gap-2">
              <CountUnit value={d} label="days" />
              <span className="text-[#DADFE3] text-[20px] pb-4">:</span>
              <CountUnit value={h} label="hrs" />
              <span className="text-[#DADFE3] text-[20px] pb-4">:</span>
              <CountUnit value={m} label="min" />
              <span className="text-[#DADFE3] text-[20px] pb-4">:</span>
              <CountUnit value={s} label="sec" />
            </div>
          )}
        </div>

        {playerCount > 0 && (
          <div className="mt-4 text-center text-[12.5px] text-[#6B7280]">
            <span className="text-[#131518] font-semibold">{playerCount}</span>{" "}
            {playerCount === 1 ? "player has" : "players have"} made their picks
          </div>
        )}
      </div>

      <div className="text-center pb-6 text-[11px] text-[#9AA0A6]">Free to play · results update nightly</div>

      {showAdminGate && <AdminGateModal onCancel={() => setShowAdminGate(false)} />}
      {showLogin && <LoginModal onCancel={() => setShowLogin(false)} />}
    </div>
  );
}
