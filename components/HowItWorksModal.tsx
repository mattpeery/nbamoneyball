"use client";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#DADFE3] rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-3">How it works</h3>

        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed mb-2">
          <span className="font-semibold text-[#131518]">1.</span> Before the regular season begins (10/20/2026), all
          players are given 200 gold coins to build a roster of NBA teams - each team costs coins equal to its
          projected win total. Every team you own earns you 1 coin for every game it wins during the
          &apos;26–&apos;27 regular season. Players who earn more coins during the regular season will have more to
          build their playoff rosters.
        </p>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-4 italic">
          Example: Bill Simmons spends 152.50 of his 200 coins on the Thunder (61.50), Warriors (40.50), and Celtics
          (50.50), leaving 47.50 coins unspent. Those three teams combine to win 152 games, earning Bill 152 coins,
          which he will use to build his playoff team.
        </p>

        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed mb-2">
          <span className="font-semibold text-[#131518]">2.</span> Before playoffs begin (4/17/2027), players will
          use the coins earned during the regular season to build a playoff roster of NBA playoff teams. Points are
          awarded in the playoffs for wins, with increasing value in later rounds. The player whose playoff roster
          accrues the most points is crowned NBA Moneyball Champion.
        </p>
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed italic">
          Example: Bill Simmons uses the 152 coins his regular season team earned him to create his playoff team. He
          buys the Spurs and the Celtics. Bill receives some points for the Spurs, who win 3 games before exiting in
          the first round, and a lot of points for the Celtics, who reach the NBA Finals. (More details on playoff
          scoring to come after play-in games conclude in April 2027.)
        </p>

        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-5 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
