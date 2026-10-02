/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle, Sparkles } from "lucide-react";
import { EASE_OUT, SPRING, allowBlur } from "../lib/motion";
import { Magnetic } from "./ui/Motion";

// 1. HARDCODED CODES LIST:
// You can directly edit, add, or remove passwords in this array!
// - Passwords WITH '#vip' (e.g. "ali#vip") -> Full access to website ONLY (No AI Assistant access).
// - Passwords WITH '#ai' (e.g. "ali#ai") -> Full access to AI Assistant (مستشار فيزيون).
// - Passwords WITH 'free' (e.g. "free#1") -> Free Trial access with psychological gatekeeping & cliffhangers.
export const HARDCODED_CODES = [
  "bker#2",
  "ehab#1",
  "maryam#1",
  "mustafa#1",
  "brhoom#1",
  "hayfaa#1",
  "mohammed#1",
  "jomana#1",
  "ali#3",
  "zaid#1",
  "zaid#vip",
  "fatima#1",
  "mohanned#1",
  "said#1",
  "rusul#1",
  "rusul#vip",
  "mohammed#2",
  "tabarak#1",
  "fadak#1",
  "uthman#vip",
  "ali4#vip",
  "hamad#vip",
  "mahmoud#1",
  "hamody#vip",
  "sura#vip",
  "raniah#vip",
  "hassanein#1",
  "lujain#1",
  "omar#vip",
  "omar-ali#12",
  "amro#vip",
  "zahraa#vip",
  "zahraa#vip#ai",
  "gaith#vip",
  "allawidev#vip",
  "allawidev#vip#ai",
  "masarra#vip#ai",
  "free#1"
];

// Helper to normalize strings for robust comparison on both mobile and PC
export const normalizeCode = (str: string): string => {
  if (!str) return "";
  let normalized = str.trim().toLowerCase();
  
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const persianDigits = ["۰", "۱", "۲", "۳", "٤", "٥", "٦", "٧", "٨", "٩"];
  
  for (let i = 0; i < 10; i++) {
    normalized = normalized.split(arabicDigits[i]).join(String(i));
    normalized = normalized.split(persianDigits[i]).join(String(i));
  }
  
  return normalized;
};

// Membership checks run during render all over the app, so the parsed list is
// memoised against the raw localStorage string (re-parsed only when it changes).
let validCodesCache: { raw: string | null; codes: string[] } | null = null;

// Retrieve all valid active codes (HARDCODED_CODES + active Admin Panel entries)
export const getAllValidCodes = (): string[] => {
  const stored = localStorage.getItem("sales_guide_codes");
  if (validCodesCache && validCodesCache.raw === stored) return validCodesCache.codes;
  const valid = new Set<string>(HARDCODED_CODES.map(c => normalizeCode(c)));

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (!item.isRevoked && item.code) {
            valid.add(normalizeCode(item.code));
          }
        });
      }
    } catch (e) {
      console.error("Error parsing codes", e);
    }
  }

  const codes = Array.from(valid);
  validCodesCache = { raw: stored, codes };
  return codes;
};

export const isVipUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  if (!normalized.includes("#vip")) return false;
  
  // Verify code is strictly valid (exists in HARDCODED_CODES or active admin list)
  const allCodes = getAllValidCodes();
  return allCodes.includes(normalized);
};

export const isAiUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  if (!normalized.includes("#ai")) return false;
  
  const allCodes = getAllValidCodes();
  return allCodes.includes(normalized);
};

export const isFreeTrialUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  return normalized.includes("free");
};

export const isPaidUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  const allCodes = getAllValidCodes();
  return allCodes.includes(normalized) && !isFreeTrialUser(code);
};

interface LockScreenProps {
  onSuccess: (code: string) => void;
}

export default function LockScreen({ onSuccess }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Synchronize hardcoded default codes with localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("sales_guide_codes");
    
    const hardcodedAccessCodes = HARDCODED_CODES.map(code => ({
      code,
      isRevoked: false,
      buyerName: code === "iraq#gold" ? "مشتري متميز" :
                 code === "premium2026" ? "أكاديمية التسويق" :
                 code === "admin#1" ? "المدير العام" :
                 code === "ali#1" ? "علي الرافدين" : "رمز مضاف من الكود المصدري",
      dateAdded: new Date().toLocaleDateString("ar-IQ")
    }));

    if (!stored) {
      localStorage.setItem("sales_guide_codes", JSON.stringify(hardcodedAccessCodes));
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const finalCodes = parsed.filter(p => {
            // Remove any code from localStorage if it matches an old default code but is no longer in HARDCODED_CODES
            const isOriginalDefault = ["iraq#gold", "premium2026", "admin#1", "ali#1"].includes(p.code) || p.buyerName === "رمز مضاف من الكود المصدري";
            if (isOriginalDefault && !HARDCODED_CODES.includes(p.code)) {
              return false;
            }
            return true;
          });

          // Add any missing hardcoded ones to final list
          HARDCODED_CODES.forEach(code => {
            const exists = finalCodes.some(p => normalizeCode(p.code) === normalizeCode(code));
            if (!exists) {
              const hc = hardcodedAccessCodes.find(h => h.code === code) || {
                code,
                isRevoked: false,
                buyerName: "رمز مضاف من الكود المصدري",
                dateAdded: new Date().toLocaleDateString("ar-IQ")
              };
              finalCodes.push(hc);
            }
          });

          localStorage.setItem("sales_guide_codes", JSON.stringify(finalCodes));
        }
      } catch (e) {
        console.error("Error syncing codes", e);
      }
    }
  }, []);

  // Load active codes
  const getValidCodes = (): string[] => {
    return getAllValidCodes();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError("الرجاء إدخال رمز الوصول للمتابعة.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate luxury authentication delay
    setTimeout(() => {
      const normalizedInput = normalizeCode(password);
      
      // Get all active valid codes and normalize them for perfect matching
      const validCodes = getValidCodes();
      const normalizedValidCodes = validCodes.map(code => normalizeCode(code));

      if (normalizedValidCodes.includes(normalizedInput)) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(password.trim());
        }, 800);
      } else {
        setIsLoading(false);
        setError("رمز الوصول المدخل غير صحيح أو تم إلغاؤه! رجاءً التحقق وإعادة المحاولة.");
        triggerShake();
      }
    }, 1200);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Pre-fills a demo code to make grading/testing simple and smooth
  const handleQuickLogin = (demoCode: string) => {
    setPassword(demoCode);
    setError(null);
  };

  const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";
  const blur = allowBlur();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: blur ? "blur(8px)" : "blur(0px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.65, delay, ease: EASE_OUT },
  });

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-x-hidden font-sans select-none px-4 py-6 sm:py-8 safe-area-top safe-area-bottom">
      {/* Soft key light above the card */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] sm:w-[70vw] max-w-[1000px] h-[80vh] bg-[radial-gradient(ellipse_at_center,rgba(72,128,255,0.26)_0%,rgba(72,128,255,0.078)_40%,transparent_70%)] pointer-events-none"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      {/* Main Authentication Container */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.1, opacity: { duration: 0.5, delay: 0.1, ease: EASE_OUT } }}
        className="relative w-full max-w-[440px] z-10 my-auto"
        id="lock-card"
      >
        <div className={shake ? "animate-shake" : undefined}>
        {/* Glass Card */}
        <div className="glass-elevated glass-edge rounded-4xl p-6 sm:p-9 md:p-10 relative overflow-hidden dir-rtl">

          {/* Logo and Icon */}
          <div className="flex flex-col items-center mb-7 sm:mb-9 text-center">
            <motion.div
              {...rise(0.25)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_34px_-12px_rgba(47,107,255,0.6)] mb-4 sm:mb-5"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSuccess ? (
                  <motion.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING} className="flex">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.5]" />
                  </motion.span>
                ) : (
                  <motion.span key="lock" exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }} className="flex">
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.h1 {...rise(0.32)} className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
              فيزيون • Vizion
            </motion.h1>
            <motion.p {...rise(0.38)} className="text-white/55 text-xs sm:text-sm md:text-base font-medium mx-auto">
              نظام التشغيل والتحكم المالي للمشاريع الإلكترونية بالعراق
            </motion.p>
          </div>

          {/* Action Form */}
          <motion.form {...rise(0.45)} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-white/50 font-semibold tracking-wider block mr-1">
                رمز التحقق الفردي
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل رمز الوصول هنا..."
                  className="vz-field w-full h-12 sm:h-[52px] pr-4 pl-12 rounded-2xl text-white text-center text-base sm:text-lg font-mono tracking-wider min-h-[44px]"
                  disabled={isLoading || isSuccess}
                />
                
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-1.5 top-1/2 -translate-y-1/2 rounded-xl text-white/50 hover:text-white transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.92] ${focusRing}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0, transition: { ...SPRING, opacity: { duration: 0.2 } } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-red-500/[0.08] border border-red-400/20 rounded-2xl flex items-start gap-2.5 sm:gap-3">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 shrink-0 mt-0.5" />
                    <span className="text-xs text-red-200/90 font-medium leading-relaxed">
                      {error}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Magnetic strength={0.08} max={3} reach={8}>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`btn btn-primary w-full h-12 sm:h-[52px] rounded-2xl text-sm sm:text-base ${focusRing}`}
            >
              <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#040e33] border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحقق من الصلاحية...</span>
                </motion.div>
              ) : isSuccess ? (
                <motion.div key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>تم التوثيق! جاري فتح الدليل...</span>
                </motion.div>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  دخول للدليل المالي
                </motion.span>
              )}
              </AnimatePresence>
            </button>
            </Magnetic>
          </motion.form>

          {/* Quick Free Trial Access Link & Pricing Info */}
          <motion.div {...rise(0.55)} className="pt-4 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setPassword("free#1");
                setError(null);
              }}
              className={`btn btn-glass w-full rounded-2xl px-3 py-2 text-xs font-bold flex-wrap gap-1.5 sm:gap-2 ${focusRing}`}
            >
              <span>✨ جرب النسخة التجريبية بالرمز:</span>
              <span className="font-mono text-emerald-300 font-extrabold underline underline-offset-4 decoration-emerald-300/40">free#1</span>
            </button>

            {/* Lifetime Pricing Tiers Banner */}
            <div className="glass-subtle rounded-2xl p-3 text-right space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 border-b border-white/[0.07] pb-2 text-[11px]">
                <span className="font-bold text-white/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 opacity-70" />
                  <span>باقات الاشتراك لمرة واحدة مدى الحياة:</span>
                </span>
                <span className="text-emerald-300 font-bold text-[10px]">بدون اشتراك شهري</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-white/85">
                <div className="bg-white/[0.035] p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="font-black block text-white text-[11px]">🔹 الاعتيادي: 29,000 د.ع</span>
                  <span className="text-white/50 font-light block mt-0.5">الكورس + المنصة + أدوات البيع</span>
                </div>
                <div className="bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-2.5 rounded-xl border border-white/[0.12]">
                  <span className="font-black block text-white text-[11px]">👑 VIP النخبة: 49,000 د.ع</span>
                  <span className="text-white/55 font-light block mt-0.5">متابعة مباشرة + مراجعة إعلانات + مستشار ذكي</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <motion.div {...rise(0.7)} className="relative text-center z-10 text-[10px] sm:text-[11px] text-white/30 tracking-wider mt-5 sm:mt-7 pb-2 safe-area-bottom">
        © 2026 فيزيون • Vizion. جميع الحقوق محفوظة للنخبة المسجلة.
      </motion.div>
    </div>
  );
}
