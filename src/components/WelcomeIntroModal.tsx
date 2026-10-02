/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, overlayMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { BookOpen, Bot, Calculator, X, ArrowLeft } from "lucide-react";

interface WelcomeIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Close the welcome and open the first chapter. */
  onStart: () => void;
}

const STEPS = [
  { icon: BookOpen, title: "اقرأ فصل", desc: "11 فصل بالترتيب، كل واحد يشرح خطوة وحدة." },
  { icon: Calculator, title: "طبّق بالأدوات", desc: "احسب ربحك وتكلفة الرسالة بأرقامك." },
  { icon: Bot, title: "اسأل المستشار", desc: "اكتبله مشكلتك ويجاوبك على مشروعك." },
];

/** First-visit welcome: what the site is and the one place to start. */
export const WelcomeIntroModal: React.FC<WelcomeIntroModalProps> = ({ isOpen, onClose, onStart }) => {
  const originSheet = useOriginSheet(isOpen, { width: 480 });

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="welcome-intro" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto dir-rtl font-sans safe-area-top safe-area-bottom">
          <motion.div {...overlayMotion} onClick={onClose} className="fixed inset-0 vz-backdrop bg-black/70 z-[200]" />

          <motion.div
            {...originSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="relative z-[202] w-full max-w-md glass-elevated glass-edge rounded-3xl sm:rounded-4xl overflow-hidden text-white my-auto"
          >
            <div aria-hidden="true" className="absolute top-0 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(72,128,255,0.22)_0%,transparent_75%)] pointer-events-none" />

            <button
              onClick={onClose}
              className="vz-close absolute top-3 left-3 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6 sm:p-8 space-y-6 text-right">
              <div className="space-y-2 pt-2">
                <p className="text-sm font-bold text-vz-accent">أهلاً بيك بـ فيزيون 👋</p>
                <h2 id="welcome-title" className="text-2xl sm:text-3xl font-black leading-tight">الطريقة بسيطة</h2>
                <p className="text-sm text-white/60 leading-relaxed">ثلاث خطوات، وكرر عليها لكل فصل:</p>
              </div>

              <ol className="space-y-2.5">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.li
                      key={step.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: EASE_OUT }}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-subtle"
                    >
                      <span className="relative w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/85">
                        <Icon className="w-5 h-5" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-vz-blue text-[11px] font-black flex items-center justify-center">{i + 1}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black">{step.title}</span>
                        <span className="block text-xs text-white/55 leading-relaxed">{step.desc}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ol>

              <div className="space-y-2">
                <button
                  onClick={onStart}
                  className="btn btn-primary w-full min-h-[52px] rounded-full text-base gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                >
                  <span>ابدأ الفصل الأول</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-ghost w-full min-h-[44px] rounded-full text-sm text-white/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  أتصفح بنفسي
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
