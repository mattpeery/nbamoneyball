"use client";

import { useState } from "react";

export function ForgotPasswordModal({ initialEmail = "", onClose }: { initialEmail?: string; onClose: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !email.includes("@")) {
      setErr("Enter a valid email address.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await fetch("/api/players/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setErr("Couldn't reach the server - check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <>
            <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Check your email</h3>
            <p className="text-[13px] text-[#6B7280] mb-4">
              If {email.trim()} has a saved roster, we just sent a link to reset its password.
            </p>
            <button
              onClick={onClose}
              className="font-display uppercase tracking-wide w-full py-3 rounded-xl bg-[#131518] text-white text-[14px] font-semibold active:scale-[0.98]"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Reset password</h3>
            <p className="text-[12.5px] text-[#6B7280] mb-4">We&apos;ll email you a link to set a new one.</p>

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

            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium active:scale-[0.98]">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="font-display uppercase tracking-wide flex-1 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98]"
              >
                {busy ? "Sending…" : "Send link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
