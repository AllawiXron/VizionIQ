import React, { useState } from "react";
import { X, Crown, Sparkles, CheckCircle2, KeyRound, ShieldAlert, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collapseMotion, overlayMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { getAllValidCodes, normalizeCode, isFreeTrialUser } from "./LockScreen";
import { OfferPrice, SubscribeButton } from "./OfferPrice";
import { PLAN_INCLUDES } from "../lib/offer";

interface FreeTrialPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCode: string;
  onUpgradeSuccess: (newCode: string) => void;
  title?: string;
  subtitle?: string;
}

export const FreeTrialPaywallModal: React.FC<FreeTrialPaywallModalProps> = ({
  isOpen,
  onClose,
  userCode,
  onUpgradeSuccess,
  title = "افتح الكورس كامل، وطبّقه على مشروعك",
  subtitle = "إنت هسه بالنسخة التجريبية. بالاشتراك الكامل ينفتحلك كلشي: الفصول، الحلول، الأدوات والمستشار."
}) => {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = inputCode.trim();
    if (!trimmed) {
      setError("الرجاء إدخال رمز الوصول المدفوع الخاص بك.");
      return;
    }

    const normalized = normalizeCode(trimmed);
    const validCodes = getAllValidCodes();

    // Check if code is valid and NOT another free code
    if (validCodes.includes(normalized) && !isFreeTrialUser(normalized)) {
      setSuccess("تم التوثيق بنجاح! جاري فتح الكورس بالكامل والمنظومة التشغيلية...");
      setTimeout(() => {
        onUpgradeSuccess(trimmed);
        onClose();
      }, 1200);
    } else if (isFreeTrialUser(normalized)) {
      setError("الرمز المدخل هو رمز نسخة تجريبية. رجاءً إدخال رمز الحساب الكامل.");
    } else {
      setError("رمز الوصول المدخل غير صحيح أو غير مسجل في النظام.");
    }
  };

  // Grows out of whichever upgrade button was pressed, and returns into it.
  const originSheet = useOriginSheet(isOpen, { width: 672 });

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div key="paywall-overlay" {...overlayMotion} className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 vz-backdrop safe-area-top safe-area-bottom">
        <motion.div
          {...originSheet}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl glass-elevated glass-edge rounded-3xl sm:rounded-4xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh] my-auto"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 vz-sheet-header flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider block truncate">
                  ترقية الحساب • Upgrade Access
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">النسخة المدفوعة الكاملة</span>
              </div>
            </div>

            <button               onClick={onClose}
              aria-label="إغلاق"
              className="vz-close focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-8 overflow-y-auto overscroll-contain space-y-5 sm:space-y-6">
            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="vz-eyebrow text-[10px] sm:text-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-vz-accent" />
                <span>تدفع مرة وحدة • مدى الحياة • بدون رسوم شهرية</span>
              </div>
              <h3 className="text-base sm:text-2xl font-black text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-lg mx-auto font-light">
                {subtitle}
              </p>
            </div>

            {/* THE ONE PLAN */}
            <div className="bg-gradient-to-b from-white/[0.1] to-white/[0.025] border border-white/20 rounded-3xl p-4 sm:p-6 space-y-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_-24px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-white/14 pb-4">
                <div>
                  <span className="text-[10px] bg-white/10 text-vz-accent font-bold px-2 py-0.5 rounded-full block w-fit mb-1.5 border border-white/18">
                    اشتراك واحد، كلشي مفتوح
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white">الاشتراك الكامل</h4>
                </div>
                <OfferPrice size="md" />
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-white/90">
                {PLAN_INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 pt-1">
                <SubscribeButton />
                <p className="text-[11px] text-center text-white/55 leading-relaxed">
                  تنفتح محادثة واتساب ويا رسالة جاهزة. ندزلك طريقة الدفع، ومن توصل الحوالة ندزلك رمز الدخول مالتك.
                </p>
              </div>
            </div>

            {/* Upgrade Password Input Form */}
            <form onSubmit={handleUpgrade} className="glass-subtle p-4 sm:p-5 rounded-3xl space-y-4">
              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-vz-accent" />
                  <span>اشتركت وعندك الرمز؟ اكتبه هنا:</span>
                </label>
                <p className="text-[11px] text-white/70">ينفتح كلشي فوراً، بدون ما تطلع وترجع تسجل.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input                   type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="اكتب الرمز هنا..."
                  className="vz-field flex-1 px-4 py-3 rounded-2xl text-white text-sm font-mono text-center sm:text-right min-h-[48px]"
                />

                <button                   type="submit"
                  className="btn btn-primary px-6 py-3 rounded-2xl text-xs sm:text-sm whitespace-nowrap min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                >
                  افتح حسابي
                </button>
              </div>

              <AnimatePresence initial={false}>
              {error && (
                <motion.div key="err" {...collapseMotion} className="overflow-hidden">
                <div className="p-3 bg-red-500/[0.08] border border-red-400/20 rounded-2xl text-xs text-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-300 shrink-0" />
                  <span>{error}</span>
                </div>
                </motion.div>
              )}

              {success && (
                <motion.div key="ok" {...collapseMotion} className="overflow-hidden">
                <div className="p-3 bg-emerald-500/[0.08] border border-emerald-400/20 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{success}</span>
                </div>
                </motion.div>
              )}
              </AnimatePresence>
            </form>

          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
