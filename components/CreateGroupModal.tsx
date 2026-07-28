"use client";

import { useState } from "react";
import { sanitizeGroupName } from "@/lib/format";

export function CreateGroupModal({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: (groupId: string, groupName: string) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return setErr("Group name is required.");
    if (password.length < 4) return setErr("Password must be at least 4 characters.");

    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Couldn't create the group - try again.");
        setBusy(false);
        return;
      }
      onSuccess(data.groupId, data.groupName);
    } catch {
      setErr("Couldn't reach the server - check your connection.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Create a group</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">Name it and set a password - you'll share both with whoever you invite.</p>

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Group name</label>
        <input
          value={name}
          onChange={(e) => setName(sanitizeGroupName(e.target.value))}
          placeholder="e.g. theboys2027"
          className="w-full mt-1 mb-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />
        <p className="text-[11px] text-[#9AA0A6] mb-3">Lowercase letters and numbers only, no spaces.</p>

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 4 characters"
          type="text"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full mt-1 mb-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        {err && <div className="text-[12px] text-[#CC0000] mb-1">{err}</div>}

        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium active:scale-[0.98]">
            Back
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="font-display uppercase tracking-wide flex-1 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
          >
            {busy ? "Creating…" : "Create group"}
          </button>
        </div>
      </div>
    </div>
  );
}
