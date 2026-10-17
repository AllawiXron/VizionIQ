import React from "react";
import { Clock, MessageCircle } from "lucide-react";
import { FULL_PRICE, OFFER_LAST_DAY, deadlineLabel, offerState, subscribeMessage, whatsappLink } from "../lib/offer";
import { TRIAL_PROBLEMS, diagnose, iqd, useTrialProfile } from "../lib/trial";

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** 99,000 struck through, 49,000, and the real deadline (or the full price once it has passed). */
export function OfferPrice({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const state = offerState();
  const big = size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-3xl sm:text-4xl" : "text-2xl";
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-end gap-2.5 flex-wrap">
        <span className={`${big} font-black text-white font-mono tracking-tight leading-none`}>{iqd(state.price)}</span>
        <span className="text-sm font-bold text-white/70 pb-0.5">د.ع</span>
        {state.active && (
          <span className="text-base sm:text-lg font-bold text-white/40 font-mono line-through decoration-red-400/80 decoration-2 pb-0.5">{iqd(FULL_PRICE)}</span>
        )}
      </div>
      <p className="text-xs text-white/60">تدفع مرة وحدة، والحساب يبقى الك مدى الحياة. بدون اشتراك شهري.</p>
      {state.active && (
        <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/[0.12] border border-red-400/30 text-red-200 text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          الخصم لحد {OFFER_LAST_DAY} · {deadlineLabel(state)}
        </p>
      )}
    </div>
  );
}

/** The trial member's diagnosis as lines for the WhatsApp message, so the conversation starts from their project. */
export function useSubscribeMessage(): string {
  const profile = useTrialProfile();
  if (!profile) return subscribeMessage();
  const problem = TRIAL_PROBLEMS.find((p) => p.id === profile.problem);
  const d = diagnose(profile);
  const ownNumbers = !profile.estimated.includes("price") && !profile.estimated.includes("cost");
  return subscribeMessage([
    `أبيع: ${profile.category}`,
    ...(problem ? [`مشكلتي: ${problem.label}`] : []),
    ...(ownNumbers ? [`ربحي الحقيقي بالطلب طلع: ${Math.round(d.real).toLocaleString("en-US")} د.ع`] : []),
  ]);
}

/** Opens WhatsApp with "I want to subscribe" already written. */
export function SubscribeButton({ label, className = "" }: { label?: string; className?: string }) {
  const message = useSubscribeMessage();
  const state = offerState();
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn w-full min-h-[54px] px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border border-emerald-300/30 text-[#03140c] text-sm sm:text-base font-black gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_34px_-14px_rgba(16,185,129,0.7)] ${focusRing} ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>{label ?? `اشترك بـ ${Math.round(state.price / 1000)} ألف عالواتساب`}</span>
    </a>
  );
}
