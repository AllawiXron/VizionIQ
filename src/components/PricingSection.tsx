/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { WordsReveal } from "./ui/Motion";
import { CheckCircle2, ShieldCheck, Clock, KeyRound, Sparkles, TrendingUp } from "lucide-react";
import { PLAN_INCLUDES } from "../lib/offer";
import { OfferPrice, SubscribeButton } from "./OfferPrice";

interface PricingSectionProps {
  onOpenUpgradeModal?: () => void;
}

/** The one plan, shown under Home for trial members. */
export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenUpgradeModal }) => {
  const openCodeEntry = () => {
    if (onOpenUpgradeModal) onOpenUpgradeModal();
    else window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  return (
    <section id="pricing-section" className="py-8 sm:py-16 relative overflow-hidden text-right">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-[radial-gradient(circle_at_center,rgba(72,128,255,0.135)_0%,rgba(72,128,255,0.044)_40%,transparent_70%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="vz-eyebrow text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 opacity-80" />
            <span>اشتراك واحد • تدفع مرة وحدة • مدى الحياة</span>
          </motion.div>
          <WordsReveal
            delay={0.1}
            className="text-xl sm:text-4xl font-black text-white leading-tight tracking-tight px-2"
            segments={["افتح كلشي، و", { text: "طبّقه على مشروعك", className: "vz-silver-text" }]}
          />
          <p className="text-xs sm:text-base text-white/55 leading-relaxed px-2">
            مو فيديوهات طويلة ولا قناة تلكرام: منصة تقرا بيها خطوة، تحسب أرقامك، وتنسخ الرسائل الجاهزة لمشروعك.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl sm:rounded-4xl p-5 sm:p-8 relative glass-elevated glass-edge overflow-hidden space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-white/14 pb-5">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-3xl font-black text-white">الاشتراك الكامل</h3>
              <p className="text-xs sm:text-sm text-white/60">كل الكورس وكل أدوات المنصة، بسعر واحد.</p>
            </div>
            <OfferPrice size="lg" />
          </div>

          <ul className="space-y-3 text-sm text-white/90">
            {PLAN_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="glass-subtle rounded-2xl p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-vz-accent shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              إعلان واحد بدون خطة، ويا كروة الطلبات الراجعة، ممكن يكلفك أكثر من سعر الاشتراك كله. الفرق إنك هنا تتعلمها مرة وحدة وتبقى وياك.
            </p>
          </div>

          <div className="space-y-3">
            <SubscribeButton />
            <button
              type="button"
              onClick={openCodeEntry}
              className="btn btn-ghost w-full min-h-[44px] rounded-2xl text-xs sm:text-sm gap-1.5 text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <KeyRound className="w-4 h-4" />
              اشتركت وعندك الرمز؟ افتح حسابك
            </button>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/75">
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>بدون رسوم مخفية ولا اشتراك شهري</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-vz-accent" />
            <span>الحساب يبقى الك، وكل التحديثات الجاية ببلاش</span>
          </span>
        </div>
      </div>
    </section>
  );
};
