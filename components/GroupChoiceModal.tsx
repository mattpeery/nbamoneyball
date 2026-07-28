"use client";

export function GroupChoiceModal({
  onSkip,
  onCreate,
  onJoin,
  onCancel,
  busy,
}: {
  onSkip: () => void;
  onCreate: () => void;
  onJoin: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">Join a private group?</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">
          Compete against just your friends, or stick with the public leaderboard.
        </p>

        <button
          onClick={onSkip}
          disabled={busy}
          className="font-display uppercase tracking-wide w-full py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98] mb-2"
        >
          {busy ? "Submitting…" : "Use Public Leaderboard"}
        </button>
        <button
          onClick={onCreate}
          disabled={busy}
          className="w-full py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium disabled:opacity-50 active:scale-[0.98] mb-2"
        >
          Create a Group
        </button>
        <button
          onClick={onJoin}
          disabled={busy}
          className="w-full py-3 rounded-xl bg-white border border-[#DADFE3] text-[#131518] text-[14px] font-medium disabled:opacity-50 active:scale-[0.98]"
        >
          Join a Group
        </button>

        {!busy && (
          <button onClick={onCancel} className="block w-full text-center mt-3 text-[12.5px] text-[#6B7280]">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
