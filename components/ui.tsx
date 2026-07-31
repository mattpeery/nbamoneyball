"use client";

import { useState } from "react";
import { Check, X, ChevronDown, Info, Eye, EyeOff } from "lucide-react";
import { FULL_NAMES } from "@/lib/teams";
import { usd } from "@/lib/format";
import { teamLogoUrl } from "@/lib/logos";
import { TeamInfoModal } from "@/components/TeamInfoModal";

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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="font-display uppercase tracking-wide text-[13px] font-semibold text-[#131518]">{title}</h2>
          {right}
        </div>
        {children}
      </div>
    </div>
  );
}

export function BudgetBar({
  label,
  spent,
  total,
  alloc = {},
  prices = {},
  onRemove,
  onClearAll,
}: {
  label: string;
  spent: number;
  total: number;
  alloc?: Record<string, number>;
  prices?: Record<string, number>;
  onRemove?: (team: string) => void;
  onClearAll?: () => void;
}) {
  const remaining = total - spent;
  const over = remaining < 0;
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const roster = Object.entries(alloc).filter(([, v]) => v > 0);
  return (
    <div className="sticky top-0 z-30 bg-[#F4F5F6] px-4 pt-2 pb-3 border-b border-[#DADFE3]">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#DADFE3] rounded-2xl px-4 py-3.5 shadow-sm">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-[11.5px] text-[#6B7280]">{label}</div>
              <div className={`font-display text-[26px] font-bold leading-tight ${over ? "text-[#CC0000]" : "text-[#131518]"}`}>
                {usd(remaining)}
              </div>
            </div>
            <div className="text-right text-[11.5px] text-[#6B7280]">
              {usd(spent)} of {usd(total)} spent
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

          <div className="mt-3 pt-3 border-t border-[#ECEEF0]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[14px] font-semibold text-[#131518]">My roster</div>
              {onClearAll && roster.length > 0 && (
                <button onClick={onClearAll} className="text-[11.5px] text-[#CC0000] font-medium underline decoration-dotted">
                  Clear all
                </button>
              )}
            </div>
            {roster.length === 0 ? (
              <p className="text-[12px] text-[#9AA0A6] leading-relaxed">
                Teams you add will appear here. You can easily remove/change picks before submitting.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roster.map(([team, dollars]) => {
                  const price = prices[team] || 0;
                  const shares = price > 0 ? dollars / price : 1;
                  const fractional = shares < 0.995;
                  const logo = teamLogoUrl(team);
                  return (
                    <span
                      key={team}
                      className="inline-flex items-center gap-[6px] bg-[#F4F5F6] border border-[#DADFE3] rounded-full pl-[8px] pr-[8px] py-[5px] text-[14px] text-[#3A3F45]"
                    >
                      {logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="" className="w-8 h-8 object-contain shrink-0" />
                      )}
                      <span>
                        {team} · {usd(dollars)}
                      </span>
                      {fractional && <span className="text-[#16A34A] font-medium">({shares.toFixed(2)})</span>}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(team)}
                          className="w-[18px] h-[18px] rounded-full bg-[#E5E7EA] flex items-center justify-center text-[#6B7280]"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamCard({
  team,
  price,
  owned,
  paidAmount = 0,
  onToggle,
  disabled,
  remaining = 0,
  hasFractional,
  projectedWins,
}: {
  team: string;
  price: number;
  owned: boolean;
  paidAmount?: number;
  onToggle: (team: string) => void;
  disabled?: boolean;
  remaining?: number;
  hasFractional?: boolean;
  projectedWins?: number;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const fullyAffordable = !disabled && !owned && remaining >= price;
  const fractionallyAffordable = !disabled && !owned && !fullyAffordable && !hasFractional && remaining > 0.01;
  const canBuy = fullyAffordable || fractionallyAffordable;
  const canRemove = !disabled && owned;
  const buyAmount = fullyAffordable ? price : fractionallyAffordable ? remaining : price;
  const ownedShares = price > 0 ? paidAmount / price : 1;
  const ownedFractionally = owned && ownedShares < 0.995;

  let buttonClass = "border ";
  if (owned) {
    buttonClass += "bg-[#131518] border-[#131518] text-white";
  } else if (canBuy) {
    buttonClass +=
      "border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#16A34A] hover:text-white active:bg-[#16A34A] active:text-white";
  } else {
    buttonClass += "border-[#E5E7EA] text-[#AEB2B8] bg-white";
  }

  const logo = teamLogoUrl(team);
  return (
    <>
      <div
        className={`grid grid-cols-[34px_1fr_84px] items-center gap-x-2 py-2 px-2.5 border-b border-[#ECEEF0] last:border-b-0 ${
          owned ? "bg-[#FAFAFA]" : ""
        }`}
      >
        <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="w-8 h-8 object-contain" loading="lazy" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[14px] font-semibold text-[#131518] truncate">
              {FULL_NAMES[team] || team}
              {ownedFractionally && <span className="text-[#16A34A] font-medium"> ({ownedShares.toFixed(2)})</span>}
            </span>
            <button
              onClick={() => setShowInfo(true)}
              className="shrink-0 text-[#6B7280] hover:text-[#131518]"
              aria-label={`About the ${team}`}
            >
              <Info size={14} />
            </button>
          </div>
          {projectedWins !== undefined && (
            <div className="text-[12.5px] text-[#6B7280] truncate">{projectedWins} projected wins</div>
          )}
          {fractionallyAffordable && <div className="text-[11px] text-[#16A34A] truncate">Partial share available</div>}
        </div>
        <button
          disabled={owned ? !canRemove : !canBuy}
          onClick={() => onToggle(team)}
          className={`w-[84px] h-8 rounded-full flex items-center justify-center text-[10.5px] font-bold active:scale-95 transition-colors whitespace-nowrap ${buttonClass}`}
        >
          {owned ? (
            <>
              <Check size={11} className="mr-1" /> Owned
            </>
          ) : (
            `Buy: ${usd(buyAmount)}`
          )}
        </button>
      </div>
      {showInfo && <TeamInfoModal team={team} onClose={() => setShowInfo(false)} />}
    </>
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  onEnter,
  bg = "bg-white",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  bg?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={show ? "text" : "password"}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className={`w-full ${bg} border border-[#DADFE3] rounded-xl px-3.5 py-2.5 pr-10 text-[14px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function LoadLookup({
  label,
  value,
  setValue,
  password,
  setPassword,
  onLoad,
  message,
  busy,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onLoad: () => void;
  message?: { tone: "success" | "error"; text: string } | null;
  busy?: boolean;
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
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="w-full mt-1.5 bg-[#F9FAFA] border border-[#DADFE3] rounded-lg px-3 py-2 text-[13.5px] text-[#131518] outline-none focus:border-[#CC0000]/60 placeholder:text-[#9AA0A6]"
          />
          <label className="text-[11px] uppercase tracking-wider text-[#6B7280] mt-2 block">Password</label>
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1">
              <PasswordInput value={password} onChange={setPassword} placeholder="Your password" onEnter={onLoad} bg="bg-[#F9FAFA]" />
            </div>
            <button
              onClick={onLoad}
              disabled={busy}
              className="px-3.5 rounded-lg bg-[#131518] text-white text-[12.5px] font-medium disabled:opacity-50"
            >
              {busy ? "Loading…" : "Load"}
            </button>
          </div>
          {message && (
            <p className={`text-[11.5px] font-medium mt-1.5 ${message.tone === "success" ? "text-[#131518]" : "text-[#CC0000]"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CountdownPill({ label, days }: { label: string; days: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-white border border-[#DADFE3] rounded-full pl-3 pr-3.5 py-1.5">
      <span className="font-display text-[15px] font-bold text-[#131518] tabular-nums">{days}</span>
      <span className="text-[11px] text-[#6B7280]">
        {days === 1 ? "day" : "days"} {label}
      </span>
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
