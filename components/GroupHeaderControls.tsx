"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Group } from "@/lib/groups";
import { PUBLIC_GROUP_ID } from "@/lib/format";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";

const GREEN_BTN =
  "inline-flex items-center justify-center h-9 px-4 rounded-full border border-[#16A34A] text-[#16A34A] bg-white text-[12px] font-bold hover:bg-[#16A34A] hover:text-white active:bg-[#16A34A] active:text-white transition-colors whitespace-nowrap";

export function GroupHeaderControls({
  selected,
  selectedName,
  memberGroups,
}: {
  selected: string;
  selectedName: string;
  memberGroups: Group[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap mt-3">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-11 pl-4 pr-3 rounded-full bg-white border border-[#DADFE3]"
        >
          <span className="text-[12.5px] text-[#6B7280]">Group:</span>
          <span className="text-[16px] font-bold text-[#131518]">{selectedName}</span>
          <ChevronDown size={22} className={`text-[#6B7280] transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-[#DADFE3] rounded-xl shadow-lg overflow-hidden z-40">
            <Link
              href="/home"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-[13px] ${
                selected === PUBLIC_GROUP_ID ? "font-semibold text-[#131518] bg-[#F4F5F6]" : "text-[#3A3F45]"
              }`}
            >
              Public
            </Link>
            {memberGroups.map((g) => (
              <Link
                key={g.id}
                href={`/home?g=${g.id}`}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-[13px] ${
                  selected === g.id ? "font-semibold text-[#131518] bg-[#F4F5F6]" : "text-[#3A3F45]"
                }`}
              >
                {g.name}
              </Link>
            ))}
            <div className="border-t border-[#ECEEF0]" />
            <button
              onClick={() => {
                setOpen(false);
                setShowCreate(true);
              }}
              className="block w-full text-left px-4 py-2.5 text-[13px] text-[#16A34A] font-medium"
            >
              + Create Group
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setShowJoin(true);
              }}
              className="block w-full text-left px-4 py-2.5 text-[13px] text-[#16A34A] font-medium"
            >
              + Join Group
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className={GREEN_BTN} onClick={() => setShowCreate(true)}>
          Create Group
        </button>
        <button className={GREEN_BTN} onClick={() => setShowJoin(true)}>
          Join Group
        </button>
      </div>

      {showCreate && (
        <CreateGroupModal
          onCancel={() => setShowCreate(false)}
          onSuccess={(newGroupId) => {
            router.push(`/g/${newGroupId}/invite`);
            router.refresh();
          }}
        />
      )}
      {showJoin && (
        <JoinGroupModal
          onCancel={() => setShowJoin(false)}
          onSuccess={(joinedGroupId) => {
            router.push(`/home?g=${joinedGroupId}`);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
