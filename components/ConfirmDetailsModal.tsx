"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui";

export function ConfirmDetailsModal({
  defaultName = "",
  defaultEntryName = "",
  defaultEmail = "",
  onCancel,
  onConfirm,
  busy,
}: {
  defaultName?: string;
  defaultEntryName?: string;
  defaultEmail?: string;
  onCancel: () => void;
  onConfirm: (details: { name: string; entryName: string; email: string; password: string }) => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(defaultName);
  const [entryName, setEntryName] = useState(defaultEntryName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function confirm() {
    if (!name.trim()) return setErr("Name is required.");
    if (!entryName.trim()) return setErr("Entry name is required.");
    if (!email.trim() || !email.includes("@") || !email.includes(".")) return setErr("Enter a valid email address.");
    if (!password) return setErr("Password is required.");
    setErr(null);
    onConfirm({ name: name.trim(), entryName: entryName.trim(), email: email.trim(), password });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Save Your Roster</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">Enter your details to submit your roster</p>

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Entry name</label>
        <input
          value={entryName}
          onChange={(e) => setEntryName(e.target.value)}
          placeholder="What shows on the leaderboard"
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Email address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          type="email"
          className="w-full mt-1 mb-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Password</label>
        <div className="mt-1 mb-2">
          <PasswordInput value={password} onChange={setPassword} placeholder="Protects your roster" onEnter={confirm} />
        </div>
        <p className="text-[11px] text-[#9AA0A6] mb-2">
          Set this once, then use it to edit your picks later. At least 6 characters.
        </p>

        {err && <div className="text-[12px] text-[#CC0000] mb-1">{err}</div>}

        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="font-display uppercase tracking-wide flex-1 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
          >
            {busy ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
