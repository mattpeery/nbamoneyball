"use client";

import { FULL_NAMES, PROJECTED_WINS } from "@/lib/teams";
import { TEAM_BLURBS } from "@/lib/teamBlurbs";
import { teamLogoUrl } from "@/lib/logos";

export function TeamInfoModal({ team, onClose }: { team: string; onClose: () => void }) {
  const blurb = TEAM_BLURBS[team];
  const logo = teamLogoUrl(team);
  const projectedWins = PROJECTED_WINS[team];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#DADFE3] rounded-2xl p-5 max-h-[85vh] overflow-y-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="w-20 h-20 object-contain mx-auto mb-3" />
        )}
        <h3 className="font-display uppercase tracking-wide text-[19px] font-bold text-[#131518] mb-3">
          {FULL_NAMES[team] || team}
        </h3>
        <p className="text-[13px] text-[#6B7280] mb-4">
          Wins Last Year: {blurb?.winsLastYear ?? "—"} &nbsp;&nbsp; Projected Wins: {projectedWins}
        </p>
        <div className="text-left space-y-3">
          {blurb?.whyBeat && (
            <p className="text-[13.5px] text-[#3A3F45] leading-relaxed">
              <span className="font-semibold text-[#131518]">Why they&apos;ll beat {projectedWins} wins:</span>{" "}
              {blurb.whyBeat}
            </p>
          )}
          {blurb?.whyNot && (
            <p className="text-[13.5px] text-[#3A3F45] leading-relaxed">
              <span className="font-semibold text-[#131518]">Why they won&apos;t beat {projectedWins} wins:</span>{" "}
              {blurb.whyNot}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-5 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  );
}
