"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountSetupForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [entryName, setEntryName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return setErr("Name is required.");
    if (!entryName.trim()) return setErr("Entry name is required.");
    if (!email.trim() || !email.includes("@") || !email.includes(".")) return setErr("Enter a valid email address.");

    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/groups/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, name: name.trim(), entryName: entryName.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Couldn't save your details - try again.");
        setBusy(false);
        return;
      }
      router.push(`/g/${groupId}/invite`);
      router.refresh();
    } catch {
      setErr("Couldn't reach the server - check your connection.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5">
      <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Create your account</h3>
      <p className="text-[12.5px] text-[#6B7280] mb-4">This is how you'll show up on the leaderboard.</p>

      <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        autoFocus
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
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-full mt-1 mb-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#DADFE3] text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
      />

      {err && <div className="text-[12px] text-[#CC0000] mb-1">{err}</div>}

      <button
        onClick={submit}
        disabled={busy}
        className="font-display uppercase tracking-wide w-full mt-3 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
      >
        {busy ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
