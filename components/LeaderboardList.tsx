"use client";

import { useState } from "react";
import { ChevronRight, Trophy } from "lucide-react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { usd } from "@/lib/format";

export function LeaderboardList({ rows, isPlayoff }: { rows: LeaderboardRow[]; isPlayoff: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <Trophy className="mx-auto text-[#DADFE3] mb-3" size={30} />
        <p className="text-[#6B7280] text-[14px]">No rosters on the board yet.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 pt-3">
      {rows.map((r, i) => (
        <div key={r.key} className="mt-2.5 bg-white border border-[#DADFE3] rounded-2xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                i === 0 ? "bg-[#CC0000] text-white" : "bg-[#EEF0F2] text-[#6B7280]"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] text-[#131518] font-medium truncate">{r.name}</div>
              <div className="text-[11.5px] text-[#6B7280]">
                {r.sub ? `${r.sub} · ` : ""}
                {r.basket.length} team{r.basket.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-[17px] font-bold text-[#131518]">
                {isPlayoff ? r.score.toFixed(1) : usd(r.score)}
              </div>
              <div className="text-[10px] text-[#6B7280]">{r.unit}</div>
            </div>
            <ChevronRight size={15} className={`text-[#9AA0A6] transition-transform ${open === i ? "rotate-90" : ""}`} />
          </button>
          {open === i && (
            <div className="border-t border-[#ECEEF0]">
              {r.basket.map((b) => (
                <div key={b.team} className="flex items-center justify-between px-4 py-2.5 border-b border-[#ECEEF0] last:border-b-0 text-[13px]">
                  <span className="text-[#3A3F45]">{b.team}</span>
                  <span className="text-[#6B7280] text-[12px]">{b.stat}</span>
                  <span className="text-[#131518] font-medium w-16 text-right">
                    {isPlayoff ? b.contrib.toFixed(1) + " pt" : usd(b.contrib)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
