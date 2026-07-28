"use client";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#DADFE3] rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-3">How To Play</h3>

        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed mb-2">
          <span className="font-semibold text-[#131518]">1.</span> Before Opening Day (Oct. 20), use your $164 budget
          to pick NBA teams. Your goal is to build a roster of teams that wins the most games during the 2026-2027
          NBA regular season. Tip: pick teams that you think will beat their projected wins for the best value.
        </p>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-4 italic">
          Example: Bill Simmons uses his $164 to buy the Thunder, Warriors, and Celtics. Those teams combine to win
          152 games. Bill will trade in his 152 wins to build his playoff team in April.
        </p>

        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed mb-2">
          <span className="font-semibold text-[#131518]">2.</span> Before NBA Playoffs (4/17/2027), the wins you earn
          during the regular season will become the currency you use to build your playoff team (i.e., more regular
          season wins = more spending power to pick your playoff roster). Points are awarded in the playoffs for
          wins, with increasing value in later rounds. The player whose playoff roster accrues the most points is
          crowned NBA Moneyball Champion.
        </p>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed italic">
          Example: Bill Simmons trades in his 152 regular season wins to buy shares of the Spurs and Celtics, two
          playoff teams. He gets points for games won by both teams. Full playoff scoring details will be shared
          after play-in games conclude in April 2027.
        </p>

        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-5 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
