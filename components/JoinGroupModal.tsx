"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinGroupModal({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !password) return setErr("Enter the group name and password.");

    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Couldn't join the group - try again.");
        setBusy(false);
        return;
      }
      router.push(`/g/${data.groupId}/leaderboard`);
      router.refresh();
    } catch {
      setErr("Couldn't reach the server - check your connection.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Join a group</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">Enter the group name and password exactly as they were shared with you.</p>

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Group name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Boys"
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Group password"
          type="password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full mt-1 mb-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        {err && <div className="text-[12px] text-[#CC0000] mb-1">{err}</div>}

        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="font-display uppercase tracking-wide flex-1 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
          >
            {busy ? "Joining…" : "Join group"}
          </button>
        </div>
      </div>
    </div>
  );
}
