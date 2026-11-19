import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, CheckCircle } from "lucide-react";
import { EASE_OUT, SPRING, allowBlur } from "../lib/motion";
import { Magnetic } from "./ui/Motion";
import { FULL_PRICE, OFFER_LAST_DAY, STUDENT_COUNT, offerState } from "../lib/offer";

export const TRIAL_CODE = "free#1";

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

let validCodesCache: { raw: string | null; codes: string[] } | null = null;

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
  const [passwordInput, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const offer = offerState();

  useEffect(() => {
    const stored = localStorage.getItem("sales_guide_codes");
    
    const hardcodedAccessCodes = HARDCODED_CODES.map(code => ({
      code,
      isRevoked: false,
      buyerName: code === "iraq#gold" ? "مشترك مميز" :
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
            const isOriginalDefault = ["iraq#gold", "premium2026", "admin#1", "ali#1"].includes(p.code) || p.buyerName === "رمز مضاف من الكود المصدري";
            if (isOriginalDefault && !HARDCODED_CODES.includes(p.code)) {
              return false;
            }
            return true;
          });

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

  const getValidCodes = (): string[] => {
    return getAllValidCodes();
  };

  const handleSubmit = (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const password = codeOverride ?? passwordInput;
    if (!password.trim()) {
      setError("اكتب رمز الدخول.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    const normalizedInput = normalizeCode(password);
    const normalizedValidCodes = getValidCodes().map((code) => normalizeCode(code));

    if (normalizedValidCodes.includes(normalizedInput)) {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(password.trim());
      }, 150);
    } else {
      setIsLoading(false);
      setError("الرمز غلط أو مو مفعل. تأكد منه وجرب مرة ثانية.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

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
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] sm:w-[70vw] max-w-[1000px] h-[80vh] bg-[radial-gradient(ellipse_at_center,rgba(72,128,255,0.26)_0%,rgba(72,128,255,0.078)_40%,transparent_70%)] pointer-events-none"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.1, opacity: { duration: 0.5, delay: 0.1, ease: EASE_OUT } }}
        className="relative w-full max-w-[440px] z-10 my-auto"
        id="lock-card"
      >
        <div className={shake ? "animate-shake" : undefined}>
        <div className="glass-elevated glass-edge rounded-4xl p-5 sm:p-9 relative overflow-hidden dir-rtl">

          <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
            <motion.div
              {...rise(0.15)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_34px_-12px_rgba(47,107,255,0.6)] mb-4"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSuccess ? (
                  <motion.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING} className="flex">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.5]" />
                  </motion.span>
                ) : (
                  <motion.span key="mark" dir="ltr" exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }} className="text-white text-[20px] sm:text-[22px] font-black">
                    VZ
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.h1 {...rise(0.2)} className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              فيزيون
            </motion.h1>
            <motion.p {...rise(0.25)} className="text-white/75 text-[15px] sm:text-base font-medium leading-relaxed max-w-[320px]">
              كورس عملي يعلمك تبيع أونلاين بالعراق، وتعرف ربحك الحقيقي من كل طلب.
            </motion.p>
          </div>

          <motion.div {...rise(0.3)} className="space-y-2">
            <button
              type="button"
              disabled={isLoading || isSuccess}
              onClick={() => {
                setPassword(TRIAL_CODE);
                handleSubmit(undefined, TRIAL_CODE);
              }}
              className={`btn btn-primary w-full min-h-[56px] rounded-2xl px-4 text-base font-black gap-2 ${focusRing}`}
            >
              <span>جرب الدرس الأول مجانا</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <p className="text-[13px] text-white/65 text-center">بدون رمز وبدون دفع، تبدي هسه.</p>
          </motion.div>

          <motion.form {...rise(0.35)} onSubmit={handleSubmit} className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
            <label htmlFor="access-code" className="text-[13px] text-white/75 font-bold block">
              عندك رمز اشتراك؟
            </label>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  id="access-code"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز الدخول"
                  className="vz-field w-full h-12 pr-3.5 pl-11 rounded-2xl text-white text-base font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                  disabled={isLoading || isSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "اخفي الرمز" : "اظهر الرمز"}
                  className={`absolute left-1 top-1/2 -translate-y-1/2 rounded-xl text-white/60 hover:text-white transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${focusRing}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`btn btn-glass h-12 min-w-[84px] px-4 rounded-2xl text-[15px] font-black ${focusRing}`}
              >
                {isSuccess ? <CheckCircle className="w-5 h-5" /> : "دخول"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0, transition: { ...SPRING, opacity: { duration: 0.2 } } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-red-500/[0.08] border border-red-400/20 rounded-2xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-red-200/90 font-medium leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <motion.p {...rise(0.4)} className="mt-5 pt-4 border-t border-white/10 text-[13px] text-white/70 text-center leading-relaxed">
            الكورس كامل بـ <span dir="ltr" className="font-black text-white">{offer.price.toLocaleString("en-US")}</span> دينار، تدفع مرة وحدة
            {offer.active && (
              <> بدل <span dir="ltr" className="line-through">{FULL_PRICE.toLocaleString("en-US")}</span> لحد {OFFER_LAST_DAY}</>
            )}
            ، ويا الحلول والأدوات والمستشار. {STUDENT_COUNT} مشترك.
          </motion.p>
        </div>
        </div>
      </motion.div>

      <motion.div {...rise(0.7)} className="relative text-center z-10 text-[12px] text-white/65 mt-5 sm:mt-7 pb-2 safe-area-bottom">
        © 2026 viZion
      </motion.div>
    </div>
  );
}
