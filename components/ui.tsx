"use client";

import { useState } from "react";
import { Check, X, ChevronDown, Banknote } from "lucide-react";
import { FULL_NAMES } from "@/lib/teams";
import { coins } from "@/lib/format";

const CASH = "#16A34A";

export function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="font-display uppercase tracking-wide text-[13px] font-semibold text-[#131518]">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

export function BudgetBar({
  label,
  spent,
  total,
  alloc = {},
  onRemove,
}: {
  label: string;
  spent: number;
  total: number;
  alloc?: Record<string, number>;
  onRemove?: (team: string) => void;
}) {
  const remaining = total - spent;
  const over = remaining < 0;
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const roster = Object.entries(alloc).filter(([, v]) => v > 0);
  return (
    <div className="sticky top-0 z-30 bg-[#F4F5F6] px-4 pt-2 pb-3 border-b border-[#DADFE3]">
      <div className="bg-white border border-[#DADFE3] rounded-2xl px-4 py-3.5 shadow-sm">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[11.5px] text-[#6B7280]">{label}</div>
            <div
              className={`font-display text-[26px] font-bold leading-tight flex items-center gap-1.5 ${over ? "text-[#CC0000]" : "text-[#131518]"}`}
            >
              {coins(remaining)}
              <Banknote size={19} style={{ color: over ? "#CC0000" : CASH }} />
            </div>
          </div>
          <div className="text-right text-[11.5px] text-[#6B7280]">
            {coins(spent)} of {coins(total)} spent
            <br />
            {roster.length} team{roster.length !== 1 ? "s" : ""} selected
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[#E5E7EA] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: over ? "#CC0000" : CASH }}
          />
        </div>

        {roster.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#ECEEF0]">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA0A6] mb-1.5">My roster</div>
            <div className="flex flex-wrap gap-1.5">
              {roster.map(([team, dollars]) => (
                <span
                  key={team}
                  className="inline-flex items-center gap-1 bg-[#F4F5F6] border border-[#DADFE3] rounded-full pl-2.5 pr-1.5 py-1 text-[11px] text-[#3A3F45]"
                >
                  {team} · {coins(dollars)}
                  <Banknote size={10} style={{ color: CASH }} />
                  {onRemove && (
                    <button
                      onClick={() => onRemove(team)}
                      className="w-3.5 h-3.5 rounded-full bg-[#E5E7EA] flex items-center justify-center text-[#6B7280]"
                    >
                      <X size={9} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TeamCard({
  team,
  price,
  owned,
  onToggle,
  disabled,
  affordable,
  projectedWins,
}: {
  team: string;
  price: number;
  owned: boolean;
  onToggle: (team: string) => void;
  disabled?: boolean;
  affordable?: boolean;
  projectedWins?: number;
}) {
  const canBuy = !disabled && !owned && affordable;
  const canRemove = !disabled && owned;
  return (
    <div className={`flex items-center justify-between gap-3 py-3 px-3 border-b border-[#ECEEF0] last:border-b-0 ${owned ? "bg-[#FAFAFA]" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <div className="text-[13px] font-medium text-[#131518]">{FULL_NAMES[team] || team}</div>
          {projectedWins !== undefined && <div className="text-[13px] text-[#6B7280]">{projectedWins} projected wins</div>}
        </div>
      </div>
      <button
        disabled={owned ? !canRemove : !canBuy}
        onClick={() => onToggle(team)}
        className={`shrink-0 flex items-center gap-1.5 px-3.5 h-10 rounded-full justify-center text-[12px] font-bold active:scale-95 transition-colors whitespace-nowrap ${
          owned
            ? "bg-[#131518] text-white"
            : canBuy
            ? "bg-[#16A34A] text-white"
            : "bg-[#E5E7EA] text-[#AEB2B8]"
        }`}
      >
        {owned ? (
          <>
            <Check size={13} /> Owned
          </>
        ) : (
          <>
            Buy {team}: {coins(price)}
            <Banknote size={13} />
          </>
        )}
      </button>
    </div>
  );
}

export function LoadLookup({
  label,
  value,
  setValue,
  onLoad,
  foundMsg,
  notFoundMsg,
  found,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  onLoad: () => void;
  foundMsg: string;
  notFoundMsg: string;
  found?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 mb-3">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-[12.5px] text-[#6B7280] underline decoration-dotted">
          Already submitted? Load your roster to edit it
        </button>
      ) : (
        <div className="bg-white border border-[#DADFE3] rounded-xl p-3">
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280]">{label}</label>
          <div className="flex gap-2 mt-1.5">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="you@email.com"
              type="email"
              className="flex-1 bg-[#F9FAFA] border border-[#DADFE3] rounded-lg px-3 py-2 text-[13.5px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
            />
            <button onClick={onLoad} className="px-3.5 rounded-lg bg-[#131518] text-white text-[12.5px] font-medium">
              Load
            </button>
          </div>
          {found === true && <p className="text-[11.5px] text-[#131518] font-medium mt-1.5">{foundMsg}</p>}
          {found === false && <p className="text-[11.5px] text-[#CC0000] mt-1.5">{notFoundMsg}</p>}
        </div>
      )}
    </div>
  );
}

export function Banner({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles =
    tone === "error"
      ? "text-[#CC0000] bg-[#CC0000]/8 border-[#CC0000]/25"
      : "text-[#3A3F45] bg-[#131518]/5 border-[#DADFE3]";
  return <div className={`mx-4 mb-3 flex items-center gap-2 text-[12.5px] border rounded-xl px-3.5 py-2.5 ${styles}`}>{children}</div>;
}

export function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mx-4 mb-3 bg-white border border-[#DADFE3] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="font-display uppercase tracking-wide text-[13.5px] font-semibold text-[#131518]">{title}</span>
        <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="border-t border-[#ECEEF0]">{children}</div>}
    </div>
  );
}

export function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#ECEEF0] last:border-b-0">
      <div className="pr-3">
        <div className="text-[13.5px] text-[#131518]">{label}</div>
        {sub && <div className="text-[11.5px] text-[#6B7280] mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${value ? "bg-[#CC0000]" : "bg-[#D1D5DB]"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function NumField({
  value,
  onChange,
  suffix,
  width = "w-14",
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  width?: string;
}) {
  return (
    <div className="flex items-center bg-white border border-[#DADFE3] rounded-lg">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`${width} bg-transparent text-right py-1.5 px-2 text-[13px] text-[#131518] font-mono outline-none`}
      />
      {suffix && <span className="text-[10px] text-[#9AA0A6] pr-2">{suffix}</span>}
    </div>
  );
}

export { Check, X };
