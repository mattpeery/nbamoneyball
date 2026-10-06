"use client";

import { InviteLinkCard } from "@/components/InviteLinkCard";

export function InviteGroupModal({ groupName, onClose }: { groupName: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4"
      onClick={onClose}
    >
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">
          Invite to {groupName}
        </h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">
          Share this link. Friends will also need the group password to join.
        </p>

        <InviteLinkCard groupName={groupName} />

        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-4 py-3 rounded-xl bg-[#131518] text-white text-[14px] font-semibold active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
