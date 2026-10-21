"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

/** The "i" next to the WAP column header; opens a short explainer. */
export function WapInfo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="What is WAP?"
        className="inline-flex text-[#9AA0A6] hover:text-[#131518] transition-colors"
      >
        <Info size={11} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl p-5 normal-case tracking-normal text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-[#9AA0A6] hover:text-[#131518]"
            >
              <X size={16} />
            </button>
            <h3 className="font-display uppercase tracking-wide text-[20px] font-bold text-[#131518] leading-none">
              WAP: Wins Above Expectation
            </h3>
            <p className="mt-3 text-[13px] font-semibold text-[#131518] leading-relaxed">
              Are your teams beating expectations?
            </p>
            <p className="mt-2 text-[13px] text-[#131518] leading-relaxed">
              During the draft, all teams were priced such that any combination of teams is expected to win 164 games
              (1 for each $1 in your budget).
            </p>
            <p className="mt-2 text-[13px] text-[#131518] leading-relaxed">
              Your WAP shows how many wins your teams have relative to what projections expect based on how many games
              they&apos;ve played so far.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
