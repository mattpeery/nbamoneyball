"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GroupPasswordGate({ groupId, groupName }: { groupId: string; groupName: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!password) return setErr("Enter the group password.");
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Couldn't join the group - try again.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setErr("Couldn't reach the server - check your connection.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5">
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">{groupName}</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">This group is password-protected. Enter the password to continue.</p>

        <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Password</label>
        <input
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErr(null);
          }}
          placeholder="Group password"
          type="password"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full mt-1 mb-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
        />

        {err && <div className="text-[12px] text-[#CC0000] mb-1">{err}</div>}

        <button
          onClick={submit}
          disabled={busy}
          className="font-display uppercase tracking-wide w-full mt-3 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
