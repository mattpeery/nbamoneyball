"use client";

export function PricingInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#DADFE3] rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-3">
          How Does Pricing Work?
        </h3>

        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed mb-3">
          Teams are priced based on their projected regular season win totals, per Las Vegas (shown as &quot;Projected
          Wins&quot;).
        </p>
        <p className="text-[13.5px] text-[#3A3F45] leading-relaxed">
          Tip: to maximize wins, pick teams that you believe will most exceed their projected win totals.
        </p>

        <button
          onClick={onClose}
          className="font-display uppercase tracking-wide w-full mt-5 py-3 rounded-xl bg-[#CC0000] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
