/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Home,
  Compass,
  Wrench,
  Bot,
  SlidersHorizontal,
  X,
  Flame,
  Crown,
  Sparkles,
  Shield,
  LogOut,
  TrendingUp,
  Tv,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isFreeTrialUser, isVipUser } from "./LockScreen";
import { SoundToggleButton } from "./SoundToggleButton";

export interface MobileBottomNavProps {
  activeSection: string;
  onOpenAdvisor: () => void;
  onOpenAdmin?: () => void;
  onOpenUpgrade?: () => void;
  onOpenIntro?: () => void;
  onLogout?: () => void;
  userCode?: string;
  isMoreOpen?: boolean;
  setIsMoreOpen?: (open: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onOpenAdvisor,
  onOpenAdmin,
  onOpenUpgrade,
  onOpenIntro,
  onLogout,
  userCode = "",
  isMoreOpen,
  setIsMoreOpen,
}) => {
  const [internalMoreOpen, setInternalMoreOpen] = useState(false);

  const isMoreSheetOpen = isMoreOpen !== undefined ? isMoreOpen : internalMoreOpen;
  const setMoreSheetOpen = (open: boolean) => {
    if (setIsMoreOpen) setIsMoreOpen(open);
    setInternalMoreOpen(open);
  };

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMoreSheetOpen) {
        setMoreSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreSheetOpen]);

  const scrollToSection = (id: string) => {
    setMoreSheetOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Active states
  const isHomeActive =
    !isMoreSheetOpen &&
    (activeSection === "hero-section" || !activeSection || activeSection === "hero");

  const isPathActive =
    !isMoreSheetOpen &&
    (activeSection === "contents-section" ||
      activeSection === "chapters-grid-section" ||
      activeSection.startsWith("chapter") ||
      activeSection.startsWith("ch"));

  const isToolsActive =
    !isMoreSheetOpen &&
    (activeSection === "vizion-growth-suite" ||
      activeSection === "roi-calculator" ||
      activeSection === "ad-simulator" ||
      activeSection === "script-simulator" ||
      activeSection === "thirty-day-plan");

  return (
    <>
      {/* 1. SLIDE-UP BOTTOM SHEET FOR "المزيد" (SECONDARY ACTIONS) */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden dir-rtl">
            {/* Backdrop with comfortable blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreSheetOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />

            {/* Bottom Sheet Modal Container - Ergonomically anchored to thumb reach */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-gradient-to-b from-[#0F1735] via-[#0A122E] to-[#040B24] border-t-2 border-[#D4A017]/40 rounded-t-3xl md:shadow-[0_-15px_45px_rgba(0,0,0,0.95)] shadow-xl overflow-hidden flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] touch-pan-y"
            >
              {/* Drag bar indicator */}
              <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto my-2.5 shrink-0" />

              {/* Sheet Header */}
              <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#040B24]/60">
                <div className="flex items-center gap-2 text-right min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center text-[#F0C040] shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white truncate">المزيد من الوجهات والخدمات</h3>
                    <p className="text-[10px] text-white/60 font-light truncate">إجراءات وإعدادات سريعة بيد واحدة</p>
                  </div>
                </div>

                <button                   onClick={() => setMoreSheetOpen(false)}
                  aria-label="إغلاق قائمة المزيد"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-right">
                
                {/* User Status / Upgrade Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center text-[#F0C040] shrink-0">
                      {isFreeTrialUser(userCode) ? <Sparkles className="w-4 h-4" /> : <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">
                        {isFreeTrialUser(userCode) ? "حساب تجريبي مجاني" : `عضوية VIP : ${userCode}`}
                      </div>
                      <div className="text-[10px] text-white/70 font-light truncate">
                        {isFreeTrialUser(userCode) ? "كود محدود: free#1" : "مفتوح كافة الميزات والأدوات"}
                      </div>
                    </div>
                  </div>

                  {isFreeTrialUser(userCode) && onOpenUpgrade && (
                    <button                       onClick={() => {
                        setMoreSheetOpen(false);
                        onOpenUpgrade();
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#D4A017] to-amber-500 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] rounded-xl text-xs font-black shadow-md md:shadow-[#D4A017] shadow-xl/20 flex items-center gap-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                    >
                      <Crown className="w-3 h-3" />
                      <span>ترقية ⚡</span>
                    </button>
                  )}
                </div>

                {/* Secondary Destinations Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-white/70 block px-1">وجهات إضافية متميزة</span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Elite Secrets */}
                    <button                       onClick={() => scrollToSection("elite-secrets-section")}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                    >
                      <div className="flex items-center justify-between">
                        <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">نخبة</span>
                      </div>
                      <div className="text-xs font-black text-white">أسرار السوق</div>
                      <div className="text-[10px] text-white/70 font-light truncate">حقائق التجار وأخطاء الإعلانات</div>
                    </button>

                    {/* Pricing Section (Free trial) */}
                    {isFreeTrialUser(userCode) ? (
                      <button                         onClick={() => {
                          setMoreSheetOpen(false);
                          if (onOpenUpgrade) {
                            onOpenUpgrade();
                          } else {
                            scrollToSection("pricing-section");
                          }
                        }}
                        className="p-3 rounded-2xl bg-gradient-to-br from-[#D4A017]/15 via-amber-500/10 to-transparent border border-[#D4A017]/40 text-right space-y-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                      >
                        <div className="flex items-center justify-between">
                          <Crown className="w-4 h-4 text-[#F0C040] group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] bg-[#D4A017]/30 text-[#F0C040] px-1.5 py-0.5 rounded font-mono">خصم</span>
                        </div>
                        <div className="text-xs font-black text-[#F0C040]">باقات الاشتراك</div>
                        <div className="text-[10px] text-amber-200/60 font-light truncate">مدى الحياة بدون رسوم شهرية</div>
                      </button>
                    ) : (
                      /* Quick ROI calculator */
                      <button                         onClick={() => scrollToSection("roi-calculator")}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                      >
                        <div className="flex items-center justify-between">
                          <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">حاسبة</span>
                        </div>
                        <div className="text-xs font-black text-white">حاسبة الأرباح ROI</div>
                        <div className="text-[10px] text-white/70 font-light truncate">حساب العائد وصافي الربح</div>
                      </button>
                    )}

                    {/* Ad simulator */}
                    <button                       onClick={() => scrollToSection("ad-simulator")}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                    >
                      <div className="flex items-center justify-between">
                        <Tv className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">محاكي</span>
                      </div>
                      <div className="text-xs font-black text-white">محاكي الإعلانات</div>
                      <div className="text-[10px] text-white/70 font-light truncate">تجربة سيناريوهات الحملات</div>
                    </button>

                    {/* Welcome Intro Modal Tour */}
                    {onOpenIntro && (
                      <button                         onClick={() => {
                          setMoreSheetOpen(false);
                          onOpenIntro();
                        }}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                      >
                        <div className="flex items-center justify-between">
                          <Sparkles className="w-4 h-4 text-[#F0C040] group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded font-mono">دليل</span>
                        </div>
                        <div className="text-xs font-black text-white">جولة المنظومة</div>
                        <div className="text-[10px] text-white/70 font-light truncate">استكشاف الميزات الأساسية</div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sound & Experience Controls */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white block">المؤثرات الصوتية</span>
                      <span className="text-[10px] text-white/70 font-light block">أصوات خفيفة للتفاعل مع الأزرار</span>
                    </div>
                    <SoundToggleButton variant="pill" />
                  </div>
                </div>

                {/* Admin and Management Link */}
                {onOpenAdmin && (
                  <button                     onClick={() => {
                      setMoreSheetOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between text-right cursor-pointer active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">بوابة الإدارة والتحكم بالأكواد</div>
                        <div className="text-[10px] text-white/70 font-light">توليد وإيقاف أكواد وصول المشتركين</div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                  </button>
                )}

                {/* Logout Action Button */}
                {onLogout && (
                  <button                     onClick={() => {
                      setMoreSheetOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer active:scale-95 shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج وقفل المنظومة</span>
                  </button>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. THE FLOATING MOBILE BOTTOM NAVIGATION DOCK (USABLE WITH ONE HAND) */}
      <nav
        role="navigation"
        aria-label="شريط التنقل السفلي المخصص للجوال"
        className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-[45] pb-[max(0.4rem,env(safe-area-inset-bottom,0px))] px-2 sm:px-4 pointer-events-none dir-rtl"
      >
        <div className="pointer-events-auto max-w-md mx-auto bg-[#040B24]/95 backdrop-blur-2xl border border-[#D4A017]/35 rounded-2xl p-1 md:shadow-[0_12px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(212,160,23,0.15)] shadow-xl flex items-center justify-between gap-1">
          
          {/* 1. الرئيسية (Home) */}
          <button             onClick={() => scrollToSection("hero-section")}
            aria-label="الانتقال إلى الرئيسية"
            aria-current={isHomeActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer active:scale-95 min-h-[50px] relative ${ isHomeActive ? "text-[#F0C040] bg-gradient-to-b from-[#D4A017]/25 to-[#D4A017]/10 border border-[#D4A017]/40 shadow-sm" : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent" } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            {isHomeActive && (
              <span className="absolute -top-1 w-5 h-0.5 bg-[#F0C040] rounded-full md:shadow-[0_0_8px_#F0C040] shadow-xl" />
            )}
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? "scale-110 text-[#F0C040]" : "text-white/70"}`} />
            <span className="text-[10px] sm:text-[11px] font-bold mt-1 leading-none tracking-tight">
              الرئيسية
            </span>
          </button>

          {/* 2. مساري (My Path / Chapters) */}
          <button             onClick={() => scrollToSection("contents-section")}
            aria-label="الانتقال إلى مساري وفصول الدليل"
            aria-current={isPathActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer active:scale-95 min-h-[50px] relative ${ isPathActive ? "text-[#F0C040] bg-gradient-to-b from-[#D4A017]/25 to-[#D4A017]/10 border border-[#D4A017]/40 shadow-sm" : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent" } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            {isPathActive && (
              <span className="absolute -top-1 w-5 h-0.5 bg-[#F0C040] rounded-full md:shadow-[0_0_8px_#F0C040] shadow-xl" />
            )}
            <Compass className={`w-5 h-5 transition-transform ${isPathActive ? "scale-110 text-[#F0C040]" : "text-white/70"}`} />
            <span className="text-[10px] sm:text-[11px] font-bold mt-1 leading-none tracking-tight">
              مساري
            </span>
          </button>

          {/* 3. الأدوات (Tools / Vizion Growth Suite) */}
          <button             onClick={() => scrollToSection("vizion-growth-suite")}
            aria-label="الانتقال إلى حقيبة الأدوات الذكية"
            aria-current={isToolsActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer active:scale-95 min-h-[50px] relative ${ isToolsActive ? "text-[#F0C040] bg-gradient-to-b from-[#D4A017]/25 to-[#D4A017]/10 border border-[#D4A017]/40 shadow-sm" : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent" } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            {isToolsActive && (
              <span className="absolute -top-1 w-5 h-0.5 bg-[#F0C040] rounded-full md:shadow-[0_0_8px_#F0C040] shadow-xl" />
            )}
            <Wrench className={`w-5 h-5 transition-transform ${isToolsActive ? "scale-110 text-[#F0C040]" : "text-white/70"}`} />
            <span className="text-[10px] sm:text-[11px] font-bold mt-1 leading-none tracking-tight">
              الأدوات
            </span>
          </button>

          {/* 4. المستشار (Vizion AI Advisor) */}
          <button             onClick={() => {
              setMoreSheetOpen(false);
              onOpenAdvisor();
            }}
            aria-label="فتح مستشار فيزيون للذكاء الاصطناعي"
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer active:scale-95 min-h-[50px] relative text-[#F0C040] hover:bg-[#D4A017]/10 border border-transparent hover:border-[#D4A017]/30 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-[#F0C040]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black mt-1 leading-none tracking-tight text-[#F0C040]">
              المستشار
            </span>
          </button>

          {/* 5. المزيد (Secondary Menu & Settings) */}
          <button             onClick={() => setMoreSheetOpen(!isMoreSheetOpen)}
            aria-label="فتح قائمة المزيد والخدمات الثانوية"
            aria-expanded={isMoreSheetOpen}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer active:scale-95 min-h-[50px] relative ${ isMoreSheetOpen ? "text-[#F0C040] bg-gradient-to-b from-[#D4A017]/25 to-[#D4A017]/10 border border-[#D4A017]/40 shadow-sm" : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent" } min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            {isMoreSheetOpen && (
              <span className="absolute -top-1 w-5 h-0.5 bg-[#F0C040] rounded-full md:shadow-[0_0_8px_#F0C040] shadow-xl" />
            )}
            <SlidersHorizontal className={`w-5 h-5 transition-transform ${isMoreSheetOpen ? "scale-110 text-[#F0C040]" : "text-white/70"}`} />
            <span className="text-[10px] sm:text-[11px] font-bold mt-1 leading-none tracking-tight">
              المزيد
            </span>
          </button>

        </div>
      </nav>
    </>
  );
};
