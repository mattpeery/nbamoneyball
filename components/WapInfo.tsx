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
            <p className="mt-3 text-[13px] text-[#131518] leading-relaxed">
              A + or − number showing how many more (or fewer) wins your teams have than we&apos;d expect by now.
            </p>
            <p className="mt-2 text-[13px] text-[#131518] leading-relaxed">
              For each team: <span className="font-semibold">wins − expected wins</span>, where expected wins ={" "}
              projected win total ÷ 82 × games played. Add that up across every team on your roster (a partial share
              counts for its share).
            </p>
            <p className="mt-2 text-[12px] text-[#6B7280] leading-relaxed">
              Example: a team projected for 82 wins that is 3-0 is +3.00. A team projected for 41 that is 0-2 is −1.00.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
