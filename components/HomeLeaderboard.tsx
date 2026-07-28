import { Trophy } from "lucide-react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { RosterCell, LB_GRID } from "@/components/RosterCell";

export function HomeLeaderboard({ rows, isPlayoff }: { rows: LeaderboardRow[]; isPlayoff: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <Trophy className="mx-auto text-[#DADFE3] mb-3" size={30} />
        <p className="text-[#6B7280] text-[14px]">No rosters on the board yet.</p>
      </div>
    );
  }

  const headerCell = "text-[9.5px] uppercase tracking-wider text-[#9AA0A6] font-semibold";
  return (
    <div className="mt-4 bg-white border border-[#DADFE3] rounded-2xl overflow-hidden">
      <div className={`${LB_GRID} px-4 py-2.5 border-b border-[#ECEEF0] bg-[#FAFAFA]`}>
        <div className={headerCell}>Entry Name</div>
        <div className={headerCell}>Roster</div>
        <div className={headerCell}>{isPlayoff ? "Points" : "Total Wins"}</div>
        <div className={headerCell}>Rank</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.key} className={`${LB_GRID} px-4 py-3 border-b border-[#ECEEF0] last:border-b-0`}>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#131518] truncate">{r.name}</div>
            {r.sub && <div className="text-[10.5px] text-[#9AA0A6] truncate">{r.sub}</div>}
          </div>
          <RosterCell basket={r.basket} isPlayoff={isPlayoff} />
          <div className="text-[13px] font-bold text-[#131518]">{isPlayoff ? r.score.toFixed(1) : Math.round(r.score)}</div>
          <div className="text-[12px] text-[#6B7280]">#{i + 1}</div>
        </div>
      ))}
    </div>
  );
}
