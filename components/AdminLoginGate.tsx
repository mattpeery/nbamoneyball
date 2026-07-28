"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginGate() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErr(data?.error || "Wrong passcode.");
        setCode("");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setErr("Couldn't reach the server - try again.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4">
      <div className="w-full max-w-xs bg-white border border-[#DADFE3] rounded-2xl p-5">
        <h3 className="font-display uppercase tracking-wide text-[15px] font-semibold text-[#131518] mb-3">Admin access</h3>
        <input
          type="password"
          value={code}
          autoFocus
          onChange={(e) => {
            setCode(e.target.value);
            setErr(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Passcode"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
            err ? "border-[#CC0000]" : "border-[#DADFE3]"
          } text-[14px] text-[#131518] outline-none placeholder:text-[#9AA0A6]`}
        />
        {err && <p className="text-[11.5px] text-[#CC0000] mt-1.5">{err}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="font-display uppercase tracking-wide w-full mt-4 py-2.5 rounded-xl bg-[#CC0000] text-white text-[13.5px] font-semibold disabled:opacity-50"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </div>
    </div>
  );
}
