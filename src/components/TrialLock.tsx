import React from "react";
import { Crown, Lock } from "lucide-react";
import { FULL_PRICE, OFFER_LAST_DAY, offerState, thousands } from "../lib/offer";

const openUpgrade = () => window.dispatchEvent(new CustomEvent("open-upgrade-modal"));

/**
 * What a trial member sees in place of paid content: what is inside (titles
 * only, so they know exactly what they are missing) and one way to open it.
 */
export function TrialLock({
  id,
  title,
  desc,
  items = [],
  cta = "افتح الحل الكامل",
  className = "",
}: {
  id?: string;
  title: string;
  desc?: string;
  items?: string[];
  cta?: string;
  className?: string;
}) {
  const offer = offerState();
  return (
    <div id={id} className={`scroll-mt-36 glass-elevated glass-edge rounded-3xl p-5 sm:p-7 space-y-4 text-right ${className}`}>
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
          <Lock className="w-5 h-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">{title}</h3>
          {desc && <p className="text-xs sm:text-sm text-white/65 leading-relaxed">{desc}</p>}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={`${i}-${item}`} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-sm text-white/80">
              <Lock className="w-3.5 h-3.5 text-white/35 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <button
          type="button"
          onClick={openUpgrade}
          className="btn btn-primary min-h-[48px] px-6 rounded-full text-sm gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
        >
          <Crown className="w-4 h-4" />
          <span>{cta}</span>
        </button>
        <span className="text-xs text-white/50">
          {offer.active ? `${thousands(offer.price)} بدل ${thousands(FULL_PRICE)} لحد ${OFFER_LAST_DAY}، مدى الحياة` : `${thousands(offer.price)}، مدى الحياة`}
        </span>
      </div>
    </div>
  );
}

/** Small "locked" marker for list rows. */
export function LockChip({ label = "بالاشتراك الكامل" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] sm:text-[11px] font-bold text-white/55">
      <Lock className="w-3 h-3" />
      {label}
    </span>
  );
}
