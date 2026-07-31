"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!password || password.length < 6) {
      setErr("Choose a password of at least 6 characters.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/players/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setDone(true);
      } else {
        setErr(data?.error || "Couldn't reset your password - try again.");
      }
    } catch {
      setErr("Couldn't reach the server - check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-6">
        {done ? (
          <>
            <h1 className="font-display uppercase tracking-wide text-[20px] font-bold text-[#131518] mb-2">Password updated</h1>
            <p className="text-[13px] text-[#6B7280] mb-4">You can now log in with your new password.</p>
            <button
              onClick={() => router.push("/")}
              className="font-display uppercase tracking-wide w-full py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold active:scale-[0.98]"
            >
              Back to homepage
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display uppercase tracking-wide text-[20px] font-bold text-[#131518] mb-2">Set a new password</h1>
            {!token ? (
              <p className="text-[13px] text-[#CC0000]">This reset link is missing its token. Request a new one from the login screen.</p>
            ) : (
              <>
                <p className="text-[12.5px] text-[#6B7280] mb-4">At least 6 characters.</p>
                <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">New password</label>
                <div className="mt-1 mb-2">
                  <PasswordInput value={password} onChange={setPassword} placeholder="At least 6 characters" onEnter={submit} />
                </div>
                {err && <div className="text-[12px] text-[#CC0000] mb-2">{err}</div>}
                <button
                  onClick={submit}
                  disabled={busy}
                  className="font-display uppercase tracking-wide w-full py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98] mt-2"
                >
                  {busy ? "Saving…" : "Save password"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
