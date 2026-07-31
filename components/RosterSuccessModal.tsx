"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { teamLogoUrl } from "@/lib/logos";
import { FULL_NAMES } from "@/lib/teams";
import { Confetti, type ConfettiOrigin } from "@/components/Confetti";

export function RosterSuccessModal({
  teams,
  onClose,
}: {
  teams: string[];
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setConfettiOrigin({ left: rect.left, right: rect.right, y: rect.top + rect.height * 0.5 });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6" onClick={onClose}>
      {confettiOrigin && <Confetti origin={confettiOrigin} />}
      <div
        ref={cardRef}
        className="relative w-full max-w-sm bg-white border border-[#DADFE3] rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F4F5F6] flex items-center justify-center text-[#6B7280] hover:text-[#131518]"
        >
          <X size={16} />
        </button>

        <div className="text-center">
          <div className="text-[12px] font-semibold text-[#9AA0A6]">nbamoneyball.com</div>
          <div className="w-14 h-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mt-4 mb-4">
            <Check size={28} className="text-[#16A34A]" strokeWidth={3} />
          </div>
          <h2 className="font-display uppercase tracking-wide text-[26px] font-bold text-[#131518] leading-tight">
            Your picks are in!
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {teams.map((team) => {
            const logo = teamLogoUrl(team);
            return (
              <span
                key={team}
                className="inline-flex items-center gap-2.5 bg-[#F4F5F6] border border-[#DADFE3] rounded-full pl-2.5 pr-5 py-2.5 text-[17px] font-semibold text-[#131518]"
              >
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="w-9 h-9 object-contain shrink-0" />
                )}
                <span>{FULL_NAMES[team] || team}</span>
              </span>
            );
          })}
        </div>

        <p className="text-center text-[10.5px] text-[#9AA0A6] mt-6">
          Picks can be edited until Opening Day (Oct. 20).
        </p>

        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-4 py-3.5 rounded-2xl bg-[#16A34A] text-white text-[15px] font-semibold active:scale-[0.98] transition-transform"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
