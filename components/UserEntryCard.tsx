"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { draftPathFor } from "@/lib/format";
import { RosterCell, LB_GRID } from "@/components/RosterCell";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";

const GREEN_BTN =
  "inline-flex items-center justify-center h-9 px-4 rounded-full border border-[#16A34A] text-[#16A34A] bg-white text-[12px] font-bold hover:bg-[#16A34A] hover:text-white active:bg-[#16A34A] active:text-white transition-colors";

export function UserEntryCard({
  row,
  rank,
  isPlayoff,
  groupId,
  editable,
}: {
  row: LeaderboardRow;
  rank: number;
  isPlayoff: boolean;
  groupId: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  async function adoptRoster(targetGroupId: string) {
    try {
      await fetch("/api/groups/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: targetGroupId }),
      });
    } catch {
      // best-effort copy - the group page has its own "make your picks" path
    }
  }

  return (
    <div className="mt-4 bg-white border border-[#16A34A]/40 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
        <Pin size={12} className="text-[#16A34A]" />
        <span className="text-[10.5px] uppercase tracking-wider text-[#16A34A] font-semibold">Your entry</span>
      </div>
      <div className={`${LB_GRID} px-4 pb-3`}>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[#131518] truncate">{row.name}</div>
          {row.sub && <div className="text-[10.5px] text-[#9AA0A6] truncate">{row.sub}</div>}
        </div>
        <RosterCell basket={row.basket} isPlayoff={isPlayoff} />
        <div className="text-[13px] font-bold text-[#131518]">{isPlayoff ? row.score.toFixed(1) : Math.round(row.score)}</div>
        <div className="text-[12px] text-[#6B7280]">#{rank}</div>
      </div>
      <div className="border-t border-[#ECEEF0] px-4 py-3 flex flex-wrap gap-2">
        <button className={GREEN_BTN} onClick={() => setShowCreate(true)}>
          Create Group
        </button>
        <button className={GREEN_BTN} onClick={() => setShowJoin(true)}>
          Join Group
        </button>
        {editable && (
          <Link className={GREEN_BTN} href={draftPathFor(groupId)}>
            Edit Picks
          </Link>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onCancel={() => setShowCreate(false)}
          onSuccess={async (newGroupId) => {
            await adoptRoster(newGroupId);
            router.push(`/g/${newGroupId}/invite`);
            router.refresh();
          }}
        />
      )}
      {showJoin && (
        <JoinGroupModal
          onCancel={() => setShowJoin(false)}
          onSuccess={async (joinedGroupId) => {
            await adoptRoster(joinedGroupId);
            router.push(`/home?g=${joinedGroupId}`);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
