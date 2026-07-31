"use client";

import { Check } from "lucide-react";
import { teamLogoUrl } from "@/lib/logos";
import { usd } from "@/lib/format";

export function RosterSuccessModal({
  alloc,
  prices,
  onContinue,
}: {
  alloc: Record<string, number>;
  prices: Record<string, number>;
  onContinue: () => void;
}) {
  const roster = Object.entries(alloc).filter(([, v]) => v > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA0A6] mb-4">NBA Moneyball</div>
          <div className="w-14 h-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-[#16A34A]" strokeWidth={3} />
          </div>
          <h2 className="font-display uppercase tracking-wide text-[26px] font-bold text-[#131518] leading-tight">
            Your picks are in!
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {roster.map(([team, dollars]) => {
            const price = prices[team] || 0;
            const shares = price > 0 ? dollars / price : 1;
            const fractional = shares < 0.995;
            const logo = teamLogoUrl(team);
            return (
              <span
                key={team}
                className="inline-flex items-center gap-2 bg-[#F4F5F6] border border-[#DADFE3] rounded-full pl-2.5 pr-4 py-2.5 text-[18px] text-[#131518] font-semibold"
              >
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="w-10 h-10 object-contain shrink-0" />
                )}
                <span>
                  {team} · {usd(dollars)}
                </span>
                {fractional && <span className="text-[#16A34A] font-medium text-[15px]">({shares.toFixed(2)})</span>}
              </span>
            );
          })}
        </div>

        <p className="text-center text-[10.5px] text-[#9AA0A6] mt-6">
          Picks can be edited until Opening Day (Oct. 20).
        </p>

        <button
          onClick={onContinue}
          className="font-display uppercase tracking-wide w-full mt-4 py-3.5 rounded-2xl bg-[#16A34A] text-white text-[15px] font-semibold active:scale-[0.98] transition-transform"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
