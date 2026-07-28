import Link from "next/link";
import { Pin, Lock, Banknote } from "lucide-react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { coins, draftPathFor } from "@/lib/format";

export function PinnedEntryCard({
  row,
  rank,
  isPlayoff,
  editable,
  groupId,
}: {
  row: LeaderboardRow;
  rank: number;
  isPlayoff: boolean;
  editable: boolean;
  groupId: string;
}) {
  return (
    <div className="mx-4 mt-4 bg-white border border-[#CC0000]/30 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
        <Pin size={12} className="text-[#CC0000]" />
        <span className="text-[10.5px] uppercase tracking-wider text-[#CC0000] font-semibold">Your roster · rank #{rank}</span>
      </div>
      <div className="flex items-center gap-3 px-4 pb-3.5">
        <div className="flex-1 min-w-0">
          <div className="text-[16px] text-[#131518] font-semibold truncate">{row.name}</div>
          <div className="text-[11.5px] text-[#6B7280]">
            {row.sub ? `${row.sub} · ` : ""}
            {row.basket.length} team{row.basket.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[19px] font-bold text-[#131518] flex items-center gap-1 justify-end">
            {isPlayoff ? row.score.toFixed(1) : coins(row.score)}
            {!isPlayoff && <Banknote size={15} className="text-[#16A34A]" />}
          </div>
          <div className="text-[10px] text-[#6B7280]">{row.unit}</div>
        </div>
      </div>
      <div className="border-t border-[#ECEEF0] px-4 py-3">
        {editable ? (
          <Link
            href={draftPathFor(groupId)}
            className="font-display uppercase tracking-wide block w-full text-center py-2.5 rounded-xl bg-[#CC0000] text-white text-[13.5px] font-semibold active:scale-[0.98] transition-transform"
          >
            {row.basket.length === 0 ? "Build roster" : "Edit roster"}
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 justify-center text-[12px] text-[#6B7280]">
            <Lock size={12} /> Picks are locked - no further changes.
          </div>
        )}
      </div>
    </div>
  );
}
