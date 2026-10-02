/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, SPRING_SNAPPY, allowBlur, overlayMotion, sheetMotion } from "../lib/motion";

// Step transitions blur through on desktop; phones use the same slide without filters.
const STEP_BLUR = allowBlur();
const STEP_BLUR_IN = STEP_BLUR ? { filter: "blur(6px)" } : {};
const STEP_BLUR_OUT = STEP_BLUR ? { filter: "blur(0px)" } : {};
const STEP_BLUR_EXIT = STEP_BLUR ? { filter: "blur(4px)" } : {};
import { 
  Sparkles, 
  Crown, 
  Zap, 
  Bot, 
  ShieldCheck, 
  BookOpen, 
  ChevronLeft,
  X,
  Flame,
  Calculator,
  FileText,
  Lock
} from "lucide-react";
import { isVipUser, isFreeTrialUser } from "./LockScreen";

interface WelcomeIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCode: string;
  onOpenAdvisor: () => void;
}

export const WelcomeIntroModal: React.FC<WelcomeIntroModalProps> = ({
  isOpen,
  onClose,
  userCode,
  onOpenAdvisor,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const isVip = isVipUser(userCode);
  const isFree = isFreeTrialUser(userCode);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      id: "the-secret",
      badge: "👑 نظرة حصرية على عالم الـ 1% الأوائل",
      title: "اللي كدامك مو مجرد كورس.. أنت على وشك تكتشف 'منظومة' متكاملة",
      subtitle: "هذا هو السر اللي يخفوه حيتان السوق العراقي، واللي راح يخليك تحول كل رسالة لربح صافي بجيبك.",
      icon: Crown,
    },
    {
      id: "the-pillars",
      badge: "الأدوات اللي راح تستخدمها",
      title: "شنو راح يتغير بشغلك لمن تنضم ويانا؟",
      subtitle: "تخيل إنك تبدي تشتغل بدون عشوائية. هذا النظام الشامل مصمم حتى يضاعف مبيعاتك ويحمي فلوسك:",
      icon: Zap,
    },
    {
      id: "the-action",
      badge: "خطة العمل لأول 24 ساعة",
      title: "تخيل نتائجك من أول يوم اشتراك",
      subtitle: "بمجرد دخولك للمنظومة، هاي الخطوات الـ 3 راح تكون طريقك المختصر حتى تبدي تحصد الأرباح فوراً:",
      icon: ShieldCheck,
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <div key="welcome-intro" className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 overflow-x-hidden overflow-y-auto dir-rtl font-sans safe-area-top safe-area-bottom">
        
        {/* Backdrop: darkens while its blur fades in */}
        <motion.div
          {...overlayMotion}
          onClick={onClose}
          className="fixed inset-0 vz-backdrop bg-black/70 z-[200]"
        />

        {/* MAIN DIALOG CONTAINER */}
        <motion.div
          {...sheetMotion}
          role="dialog" aria-modal="true" className="relative z-[202] w-full max-w-xl glass-elevated glass-edge rounded-3xl sm:rounded-4xl overflow-hidden text-white flex flex-col max-h-[92dvh] sm:max-h-[88vh] my-auto"
        >
          
          {/* Celestial Ray & Top Ambient Light - High Performance Radial Gradient */}
          <div className="absolute top-0 inset-x-0 h-36 bg-[radial-gradient(ellipse_at_top,rgba(72,128,255,0.226)_0%,rgba(72,128,255,0.044)_50%,transparent_100%)] pointer-events-none" />

          {/* Header Bar */}
          <div className="relative px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between vz-sheet-header shrink-0 z-20">
            {/* VIP / Code Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                {isVip ? <Crown className="w-3.5 h-3.5 fill-white" /> : <Lock className="w-3.5 h-3.5 fill-white" />}
                <span>{isVip ? "عضوية VIP النخبة" : isFree ? "النسخة التجريبية المحدودة" : "الاشتراك الذهبي الكامل"}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-white/60 font-mono font-bold bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                {userCode}
              </span>
            </div>

            {/* Skip / Close Button */}
            <button               onClick={onClose}
              className="vz-close focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explicit mobile escape hatch: do not make the tour the only path into the course. */}
          <div className="px-4 pt-3 sm:hidden">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-glass w-full rounded-full px-3 py-2 text-xs font-bold text-white/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              aria-label="تخطي المقدمة والانتقال إلى المحتوى"
            >
              تخطي المقدمة والانتقال إلى المحتوى
            </button>
          </div>

          {/* SCROLLABLE MODAL BODY SLIDES */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-6 relative no-scrollbar">
            <AnimatePresence mode="wait" initial={false}>
            
            {/* Step 1: Celestial Welcome & Psychological Hook */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -18, ...STEP_BLUR_IN }}
                animate={{ opacity: 1, x: 0, ...STEP_BLUR_OUT }}
                exit={{ opacity: 0, x: 14, ...STEP_BLUR_EXIT, transition: { duration: 0.16, ease: EASE_OUT } }}
                transition={{ duration: 0.42, ease: EASE_OUT }}
                className="space-y-4 sm:space-y-5 text-center"
              >
                {/* Crown Icon Emblem with Crisp Heavenly Glow */}
                <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(72,128,255,0.364)_0%,transparent_70%)]" />

                  <div className="relative w-full h-full rounded-[28px] bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_18px_40px_-14px_rgba(47,107,255,0.6)]">
                    <Crown className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>

                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-white/70" />
                </div>

                {/* Badge & Title */}
                <div className="space-y-1.5">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-bold text-white/80">
                    {steps[0].badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {steps[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold vz-silver-text max-w-md mx-auto leading-relaxed">
                    {steps[0].subtitle}
                  </p>
                </div>

                {/* Contrast Box: The Pain vs The Cure */}
                <div className="p-4 sm:p-5 rounded-3xl glass-subtle text-xs text-white/85 leading-relaxed font-light text-right space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[3px] bg-gradient-to-b from-red-400/80 to-white/20 h-full" />
                  <p className="text-justify leading-relaxed text-sm">
                    تعبت من رسايل <span className="text-red-400 font-bold">"بيش هاي؟"</span> اللي ما وراها بيعة؟ فلوسك دتحترق بإعلانات غالية؟ والـ <span className="text-red-400 font-bold">راجع كاسر ظهرك</span> وكروة التوصيل دتاكل براس مالك؟
                  </p>
                  <p className="text-justify leading-relaxed text-sm">
                    هنا راح ينتهي هالعذاب كله. أنت هسة دتكتشف بيئة الـ 1% من التجار المحترفين. كل أداة واستراتيجية هنا تصممت لغرض واحد: <strong className="text-emerald-400 font-black">حماية حلالك ومضاعفة أرباحك الصافية.</strong>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: The 4 Unfair Advantages */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -18, ...STEP_BLUR_IN }}
                animate={{ opacity: 1, x: 0, ...STEP_BLUR_OUT }}
                exit={{ opacity: 0, x: 14, ...STEP_BLUR_EXIT, transition: { duration: 0.16, ease: EASE_OUT } }}
                transition={{ duration: 0.42, ease: EASE_OUT }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-bold text-white/80">
                    {steps[1].badge}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    {steps[1].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto">
                    {steps[1].subtitle}
                  </p>
                </div>

                {/* 4 Feature Cards with Psychological Framing */}
                <div className="space-y-3">
                  
                  {/* Pillar 1: Chapters (The Brain) */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    transition={SPRING_SNAPPY}
                    className="p-3.5 sm:p-4 rounded-2xl glass-subtle hover:bg-white/[0.05] flex items-start gap-4 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-vz-accent shrink-0 mt-0.5 shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-vz-accent">1. الدليل الذهبي للبيع (11 فصل تكتيكي)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        مو مجرد تنظير.. هاي خطوات ميدانية حتى تقلل تكلفة الرسالة، تستهدف المحافظات بذكاء، وتقنع الزبون المتردد يشتري فوراً.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 2: AI Advisor (The Secret Weapon) */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    transition={SPRING_SNAPPY}
                    className="p-3.5 sm:p-4 rounded-2xl glass-subtle hover:bg-white/[0.05] flex items-start gap-4 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-slate-200">2. مستشارك الخاص (Vizion AI 24/7)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        انسى الحيرة. هذا الذكاء الاصطناعي مدرب خصيصاً على عقلية الزبون العراقي، يكتبلك إعلاناتك ويحل مشاكلك التسويقية بثواني.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 3: Growth Suite (The Shield) */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    transition={SPRING_SNAPPY}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-l from-emerald-400/[0.08] to-transparent border border-emerald-400/20 flex items-start gap-4 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-emerald-300">3. حزمة الحماية المالية (13 حاسبة ذكية)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        لا تشتغل عالتخمين. احسب أرباحك الصافية، وتوقع مخاطر الراجع، وتأكد من حملتك ربحانة <span className="font-bold text-emerald-300">قبل</span> لا تصرف عليها دينار واحد.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 4: Swipe Files (The Shortcut) */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    transition={SPRING_SNAPPY}
                    className="p-3.5 sm:p-4 rounded-2xl glass-subtle hover:bg-white/[0.05] flex items-start gap-4 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-200 shrink-0 mt-0.5 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-slate-200">4. مكتبة النسخ واللصق (النصوص السحرية)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        قوالب جاهزة للرد على الزبائن، نصوص إعلانية مجربة وناجحة، وسيناريوهات تفاوض بس تنسخها وتلصقها حتى تقفل البيعة.
                      </p>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}

            {/* Step 3: Action Roadmap & Instant Results */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -18, ...STEP_BLUR_IN }}
                animate={{ opacity: 1, x: 0, ...STEP_BLUR_OUT }}
                exit={{ opacity: 0, x: 14, ...STEP_BLUR_EXIT, transition: { duration: 0.16, ease: EASE_OUT } }}
                transition={{ duration: 0.42, ease: EASE_OUT }}
                className="space-y-5 text-center"
              >
                {/* Shield Emblem */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.18)_0%,transparent_70%)]" />
                  <div className="relative w-full h-full rounded-[24px] glass-elevated border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-xs font-bold text-emerald-300">
                    {steps[2].badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {steps[2].title}
                  </h3>
                  <p className="text-sm text-white/70 font-light">
                    {steps[2].subtitle}
                  </p>
                </div>

                {/* 3 Step Quick Action List - Actionable and psychological */}
                <div className="space-y-3 text-right mt-4">
                  <div className="p-3.5 rounded-2xl glass-subtle flex items-center gap-4 hover:bg-white/[0.06] transition-colors duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white font-black flex items-center justify-center text-sm shrink-0 shadow-lg">1</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      راح تتصفح <strong className="text-vz-accent">الفصل 1 و 2</strong> فوراً حتى تكتشف الثغرة اللي دتسرق أرباحك وشلون تسدها.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-subtle flex items-center gap-4 hover:bg-white/[0.06] transition-colors duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white font-black flex items-center justify-center text-sm shrink-0 shadow-lg">2</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      تفتح <strong className="text-slate-200">المستشار الذكي (Vizion)</strong> وتطلب منه يكتبلك إعلان منتجك الجاي بلهجة عراقية تقنع الزبون.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-subtle flex items-center gap-4 hover:bg-white/[0.06] transition-colors duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-lg">3</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      تستخدم <strong className="text-emerald-300">حاسبة تسعير المنتجات</strong> حتى تضمن كل طلبية تطلع بيها ربح حقيقي يفوت لجيبك.
                    </p>
                  </div>
                </div>

              </motion.div>
            )}
            </AnimatePresence>

          </div>

          {/* STICKY FOOTER ACTIONS & NAVIGATION FOR MOBILE */}
          <div className="p-3 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:pb-5 border-t border-white/[0.07] bg-black/20 flex items-center justify-between gap-2 dir-rtl shrink-0 z-30 relative">
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-1 sm:gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className="rounded-full cursor-pointer min-h-[44px] min-w-[32px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label={`الذهاب للخطوة ${idx + 1}`}
                  aria-current={currentStep === idx ? "step" : undefined}
                >
                  <motion.span
                    animate={{ width: currentStep === idx ? 22 : 7, opacity: currentStep === idx ? 1 : 0.3 }}
                    transition={SPRING_SNAPPY}
                    className="block h-[7px] rounded-full bg-vz-blue"
                  />
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {currentStep > 0 && (
                <button                   onClick={() => setCurrentStep(prev => prev - 1)}
                  className="btn btn-glass px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                >
                  رجوع
                </button>
              )}

              <button                 onClick={handleNext}
                className="btn btn-primary px-4 sm:px-8 rounded-full text-xs sm:text-base gap-1 sm:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <span>{currentStep === steps.length - 1 ? "🚀 استكشف المنظومة" : "التالي"}</span>
                {currentStep !== steps.length - 1 && <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

          </div>

        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
