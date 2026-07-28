import { teamLogoUrl } from "@/lib/logos";
import type { LeaderboardBasketItem } from "@/lib/leaderboard";

/** Shared column layout for leaderboard rows: Entry Name | Roster | Total | Rank. */
export const LB_GRID = "grid grid-cols-[minmax(72px,1fr)_minmax(0,1.7fr)_52px_38px] items-start gap-x-2";

export function RosterCell({ basket, isPlayoff }: { basket: LeaderboardBasketItem[]; isPlayoff: boolean }) {
  if (basket.length === 0) return <div className="text-[12px] text-[#9AA0A6]">—</div>;
  return (
    <div className="min-w-0 space-y-1">
      {basket.map((b) => {
        const logo = teamLogoUrl(b.team);
        return (
          <div key={b.team} className="flex items-center gap-1.5 min-w-0">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
            )}
            <span className="text-[12px] text-[#131518] truncate">{b.team}</span>
            <span className="text-[11px] text-[#6B7280] whitespace-nowrap">
              · {b.wins} {isPlayoff ? "pt" : "W"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
