import React, { useState } from "react";
import { X, Crown, Lock, Sparkles, CheckCircle2, Zap, KeyRound, ShieldAlert, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllValidCodes, normalizeCode, isFreeTrialUser } from "./LockScreen";

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
  title = "افتح الكورس الكامل والمنظومة التسويقية الشاملة",
  subtitle = "أنت الآن تستخدم النسخة التجريبية (Free Trial). قم بترقية حسابك للوصول الفوري لكافة الاستراتيجيات والأدوات المتقدمة."
}) => {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

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
      setError("الرمز المدخل هو رمز نسخة تجريبية. يرجى إدخال رمز الحساب الكامل.");
    } else {
      setError("رمز الوصول المدخل غير صحيح أو غير مسجل في النظام.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-gradient-to-b from-[#0F1735] via-[#0A122E] to-[#040B24] border border-[#D4A017]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#121A3D] via-[#0F1735] to-[#0B102B] border-b border-[#D4A017]/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A017] to-amber-600 p-[1px] flex items-center justify-center shadow-lg shadow-[#D4A017]/20">
                <div className="w-full h-full bg-[#040B24] rounded-[11px] flex items-center justify-center text-[#F0C040]">
                  <Crown className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-xs font-black text-[#F0C040] uppercase tracking-wider block">
                  ترقية الحساب • Upgrade Access
                </span>
                <span className="text-sm font-bold text-white">النسخة المدفوعة الكاملة</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/15 border border-[#D4A017]/40 text-xs font-black text-[#F0C040]">
                <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
                <span>اشتراك لمرة واحدة مدى الحياة • بدون أي رسوم شهرية</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-lg mx-auto font-light">
                {subtitle}
              </p>
            </div>

            {/* TWO SUBSCRIPTION TIERS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              {/* Standard Tier */}
              <div className="bg-[#040B24] border border-white/15 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div>
                      <span className="text-[10px] bg-white/10 text-white/80 font-bold px-2 py-0.5 rounded-full block w-fit mb-1">
                        الاشتراك الأساسي
                      </span>
                      <h4 className="text-base font-black text-white">الاشتراك الاعتيادي</h4>
                    </div>
                    <div className="text-left">
                      <span className="text-xl font-black text-white font-mono block">29,000</span>
                      <span className="text-[10px] text-[#F0C040] font-bold block">د.ع • مدى الحياة</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/70 font-light mt-2 mb-3 leading-relaxed">
                    يشمل الكورس بالكامل والمنصة لتأسيس مبيعات وإعلانات ناجحة.
                  </p>

                  <ul className="space-y-2 text-[11px] text-white/85">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>تسوي إعلانات تجيب مبيعات حقيقية.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>تقليل تكلفة الرسائل والوصول للجمهور الصح.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>تحويل الاستفسارات لطلبات واستبعاد الفضوليين.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>أدوات اختبار الإعلانات، حوار البيع وحاسبة الأرباح.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* VIP Tier */}
              <div className="bg-gradient-to-b from-[#121C42] to-[#080E2B] border-2 border-[#D4A017] rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-[#D4A017] text-[#040B24] font-black text-[9px] px-2.5 py-0.5 rounded-br-lg">
                  👑 الموصى به - أسرع نتيجة
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-[#D4A017]/30 pb-2.5 pt-2">
                    <div>
                      <span className="text-[10px] bg-[#D4A017]/20 text-[#F0C040] font-bold px-2 py-0.5 rounded-full block w-fit mb-1 border border-[#D4A017]/40">
                        الاشتراك الكامل VIP
                      </span>
                      <h4 className="text-base font-black text-[#F0C040]">اشتراك VIP</h4>
                    </div>
                    <div className="text-left">
                      <span className="text-2xl font-black text-[#F0C040] font-mono block">49,000</span>
                      <span className="text-[10px] text-amber-200 font-bold block">د.ع • مدى الحياة</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-100/90 font-bold mt-2 mb-3 leading-relaxed">
                    إذا تريد أسرع نتيجة وأقل أخطاء وتوجيه مباشر خطوة بخطوة.
                  </p>

                  <ul className="space-y-2 text-[11px] text-white">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F0C040] shrink-0 mt-0.5" />
                      <span><strong>كل مميزات الاعتيادي</strong> + المتابعة المباشرة وياي.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F0C040] shrink-0 mt-0.5" />
                      <span>مراجعة إعلاناتك وإعطاء ملاحظات فورية عليها.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F0C040] shrink-0 mt-0.5" />
                      <span>مساعدتك باختيار المنتج، الاستهداف والعروض.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F0C040] shrink-0 mt-0.5" />
                      <span>توجيه مخصص لمشروعك + مستشار ذكاء اصطناعي (Vizion AI).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upgrade Password Input Form */}
            <form onSubmit={handleUpgrade} className="bg-gradient-to-r from-[#0F1735] via-[#141E47] to-[#0F1735] p-5 rounded-2xl border border-[#D4A017]/40 space-y-4 shadow-xl">
              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#F0C040]" />
                  <span>تمتلك رمز وصول مدفوع؟ أدخله هنا للترقية الفورية:</span>
                </label>
                <p className="text-[11px] text-white/50">سيتم فتح جميع الاستراتيجيات فوراً ودون الحاجة لإعادة التسجيل.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="أدخل رمز الوصول الخاص بك..."
                  className="flex-1 px-4 py-3 bg-[#040B24] border border-white/15 rounded-xl text-white text-sm placeholder-white/30 font-mono focus:border-[#D4A017] outline-none text-center sm:text-right"
                />

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-xs sm:text-sm shadow-lg shadow-[#D4A017]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  ترقية الحساب الآن ⚡
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
