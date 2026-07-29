"use client";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#DADFE3] rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-3">How To Play</h3>

        <h4 className="text-[14.5px] font-bold text-[#131518] mb-2">Regular Season</h4>
        <ol className="space-y-2 mb-3">
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">1.</span> Before Opening Day (Oct. 20), use your $164
            budget to build your roster of NBA teams.
          </li>
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">2.</span> During the 2026-2027 NBA regular season, you
            will earn $1 for each of your teams&apos; wins.
          </li>
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">3.</span> You will use the money you earn in the regular
            season to buy your playoff teams in April.
          </li>
        </ol>
        <p className="text-[12.5px] text-[#3A3F45] leading-relaxed mb-3">
          <span className="font-semibold text-[#131518]">Tip:</span> pick teams that you think will beat their
          projected wins for the best value.
        </p>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-5 italic">
          Example: Bill Simmons uses his $164 to buy the Thunder, Warriors, Celtics, and Nets. Those teams combine to
          win 163 games, earning Bill $163, which he will use to construct his playoff team.
        </p>

        <h4 className="text-[14.5px] font-bold text-[#131518] mb-2">Playoffs</h4>
        <ol className="space-y-2 mb-3">
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">1.</span> After the NBA Playoff bracket is set in April,
            use your new budget to build your playoff team (more regular season wins = more spending power to pick
            your playoff roster).
          </li>
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">2.</span> Points are awarded in the playoffs for wins,
            with increasing value in later rounds.
          </li>
          <li className="text-[13.5px] text-[#3A3F45] leading-relaxed">
            <span className="font-semibold text-[#131518]">3.</span> The player whose playoff roster accrues the
            most points is crowned NBA Moneyball Champion.
          </li>
        </ol>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed italic">
          Example: Bill Simmons trades in his $163 from the regular season to buy shares of the Spurs and Celtics,
          two playoff teams. He gets points for games won by both teams. Full playoff scoring details will be shared
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
