"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function InviteLinkCard({ groupName }: { groupName: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = `${origin}/join/${groupName}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable - link is still visible to copy manually
    }
  }

  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Invite link</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[#F4F5F6] border border-[#DADFE3] text-[13px] text-[#131518] truncate">
          {link}
        </div>
        <button
          onClick={copy}
          className="shrink-0 w-10 h-10 rounded-xl bg-white border border-[#DADFE3] flex items-center justify-center active:scale-[0.96]"
          aria-label="Copy invite link"
        >
          {copied ? <Check size={16} className="text-[#CC0000]" /> : <Copy size={16} className="text-[#6B7280]" />}
        </button>
      </div>
    </div>
  );
}
