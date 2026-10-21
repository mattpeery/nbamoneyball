import { teamLogoUrl } from "@/lib/logos";
import type { LeaderboardBasketItem } from "@/lib/leaderboard";

/** Shared column layout for leaderboard rows: Entry Name | Roster | Total | Rank. */
export const LB_GRID = "grid grid-cols-[minmax(72px,1fr)_minmax(0,1.7fr)_52px_38px] items-start gap-x-2";

/** Regular season adds a far-right WAP column. */
export const LB_GRID_WAP = "grid grid-cols-[minmax(72px,1fr)_minmax(0,1.7fr)_52px_38px_46px] items-start gap-x-2";

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
            {Math.abs(b.shares - 1) > 0.005 && <span className="text-[10px] text-[#16A34A] whitespace-nowrap">({b.shares.toFixed(2)})</span>}
            <span className="text-[11px] text-[#6B7280] whitespace-nowrap">
              {isPlayoff || !b.record ? `${b.contrib.toFixed(1)} ${isPlayoff ? "pt" : "W"}` : `${b.record.w}-${b.record.l}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
