/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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

  if (!isOpen) return null;

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
      badge: "⚡ ترسانة الأسلحة اللي راح تمتلكها",
      title: "شنو راح يتغير بشغلك لمن تنضم ويانا؟",
      subtitle: "تخيل إنك تبدي تشتغل بدون عشوائية. هذا النظام الشامل مصمم حتى يضاعف مبيعاتك ويحمي فلوسك:",
      icon: Zap,
    },
    {
      id: "the-action",
      badge: "🔥 خطة الأرباح لأول 24 ساعة",
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-x-hidden overflow-y-auto dir-rtl font-sans">
        
        {/* Heavenly Dark Backdrop overlay with luxury blur & ambient glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#020512]/92 backdrop-blur-3xl transition-all"
        />

        {/* Floating Heavenly Golden Dust & Light Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(22)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                scale: Math.random() * 0.7 + 0.3,
                opacity: Math.random() * 0.8 + 0.2,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.sin(i) * 25, 0],
                opacity: [0.2, 0.9, 0.2],
                scale: [0.4, 1.1, 0.4],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.25,
              }}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#F0C040] to-amber-300 shadow-[0_0_15px_#F0C040]"
            />
          ))}
        </div>

        {/* MAIN DIALOG CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 240 }}
          className="relative z-10 w-full max-w-xl bg-[#040B24] border-2 border-[#D4A017]/70 rounded-3xl shadow-[0_20px_90px_rgba(212,160,23,0.4)] overflow-hidden text-white flex flex-col max-h-[88vh] sm:max-h-[90vh] my-auto"
        >
          
          {/* Celestial Ray & Top Ambient Light */}
          <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#D4A017]/35 via-[#D4A017]/10 to-transparent pointer-events-none" />
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#D4A017]/25 rounded-full blur-[80px] pointer-events-none" 
          />

          {/* Header Bar */}
          <div className="relative px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 shrink-0 bg-[#040B24]/85 backdrop-blur-md z-20">
            {/* VIP / Code Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4A017] via-amber-400 to-amber-500 text-[#040B24] text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#D4A017]/30">
                {isVip ? <Crown className="w-3.5 h-3.5 fill-[#040B24]" /> : <Lock className="w-3.5 h-3.5 fill-[#040B24]" />}
                <span>{isVip ? "عضوية VIP النخبة" : isFree ? "النسخة التجريبية المحدودة" : "الاشتراك الذهبي الكامل"}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-amber-200/80 font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                {userCode}
              </span>
            </div>

            {/* Skip / Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SCROLLABLE MODAL BODY SLIDES */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative no-scrollbar">
            
            {/* Step 1: Celestial Welcome & Psychological Hook */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 text-center"
              >
                {/* Glowing Crown Icon Emblem with Heavenly Aura Rings */}
                <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-[#F0C040]/50"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D4A017] via-amber-400 to-amber-600 opacity-70 blur-md"
                  />

                  <div className="relative w-full h-full rounded-3xl bg-[#040B24] border-2 border-[#F0C040] flex items-center justify-center text-[#F0C040] shadow-[0_0_35px_rgba(240,192,64,0.55)]">
                    <Crown className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
                  </div>

                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#F0C040] animate-spin" style={{ animationDuration: "7s" }} />
                  <Flame className="absolute -bottom-1 -left-1 w-5 h-5 text-amber-400" />
                </div>

                {/* Badge & Title */}
                <div className="space-y-1.5">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/50 text-[11px] sm:text-xs font-black text-[#F0C040] shadow-sm">
                    {steps[0].badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {steps[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-amber-300 to-amber-500 max-w-md mx-auto leading-relaxed">
                    {steps[0].subtitle}
                  </p>
                </div>

                {/* Contrast Box: The Pain vs The Cure */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-500/5 via-white/[0.02] to-transparent border border-white/10 text-xs text-white/90 leading-relaxed font-light text-right space-y-4 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-red-500 to-amber-500 h-full" />
                  <p className="text-justify leading-relaxed text-sm">
                    تعبت من رسايل <span className="text-red-400 font-bold">"بيش هاي؟"</span> اللي ما وراها بيعة؟ فلوسك دتحترق بإعلانات غالية؟ والـ <span className="text-red-400 font-bold">راجع كاسر ظهرك</span> وكروة الشحن دتاكل براس مالك؟
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
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/50 text-[11px] sm:text-xs font-black text-[#F0C040]">
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
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-white/[0.03] to-transparent border border-[#D4A017]/40 flex items-start gap-4 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#D4A017]/25 border border-[#D4A017]/50 flex items-center justify-center text-[#F0C040] shrink-0 mt-0.5 shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-[#F0C040]">1. الدليل الذهبي للبيع (11 فصل تكتيكي)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        مو مجرد تنظير.. هاي خطوات ميدانية حتى تقلل تكلفة الرسالة، تستهدف المحافظات بذكاء، وتقنع الزبون المتردد يشتري فوراً.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 2: AI Advisor (The Secret Weapon) */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-white/[0.03] to-transparent border border-blue-500/40 flex items-start gap-4 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/25 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-blue-300">2. مستشارك الخاص (Vizion AI 24/7)</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        انسى الحيرة. هذا الذكاء الاصطناعي مدرب خصيصاً على عقلية الزبون العراقي، يكتبلك إعلاناتك ويحل مشاكلك التسويقية بثواني.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 3: Growth Suite (The Shield) */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-white/[0.03] to-transparent border border-emerald-500/40 flex items-start gap-4 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
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
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-white/[0.03] to-transparent border border-purple-500/40 flex items-start gap-4 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/25 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-purple-300">4. مكتبة النسخ واللصق (النصوص السحرية)</h4>
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
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 text-center"
              >
                {/* Shield Emblem */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl bg-emerald-500/40 blur-md"
                  />
                  <div className="relative w-full h-full rounded-2xl bg-[#040B24] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)]">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-xs font-black text-emerald-300">
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
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A017] to-amber-500 text-[#040B24] font-black flex items-center justify-center text-sm shrink-0 shadow-lg">1</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      راح تتصفح <strong className="text-[#F0C040]">الفصل 1 و 2</strong> فوراً حتى تكتشف الثغرة اللي دتسرق أرباحك وشلون تسدها.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[#040B24] font-black flex items-center justify-center text-sm shrink-0 shadow-lg">2</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      تفتح <strong className="text-blue-300">المستشار الذكي (Vizion)</strong> وتطلب منه يكتبلك إعلان منتجك الجاي بلهجة عراقية تقنع الزبون.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#040B24] font-black flex items-center justify-center text-sm shrink-0 shadow-lg">3</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      تستخدم <strong className="text-emerald-300">حاسبة تسعير المنتجات</strong> حتى تضمن كل طلبية تطلع بيها ربح حقيقي يفوت لجيبك.
                    </p>
                  </div>
                </div>

              </motion.div>
            )}

          </div>

          {/* STICKY FOOTER ACTIONS & NAVIGATION FOR MOBILE */}
          <div className="p-4 sm:p-5 bg-[#040B24]/95 border-t border-white/10 flex items-center justify-between gap-3 dir-rtl shrink-0 z-20">
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === idx
                      ? "w-8 sm:w-10 bg-[#F0C040] shadow-[0_0_10px_#F0C040]"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`الذهاب للخطوة ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white border border-white/10 text-sm font-bold transition-all cursor-pointer"
                >
                  رجوع
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-400 to-amber-500 text-[#040B24] font-black text-sm sm:text-base shadow-[0_0_20px_rgba(212,160,23,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <span>{currentStep === steps.length - 1 ? "🚀 استكشف المنظومة هسة" : "التالي"}</span>
                {currentStep !== steps.length - 1 && <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};