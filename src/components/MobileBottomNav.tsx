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
import { EASE_OUT, SPRING, SPRING_SNAPPY, bottomSheetMotion, overlayMotion } from "../lib/motion";
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

  const dockItems = [
    { key: "home", label: "الرئيسية", aria: "الانتقال إلى الرئيسية", icon: Home, active: isHomeActive, current: isHomeActive, onClick: () => scrollToSection("hero-section") },
    { key: "path", label: "مساري", aria: "الانتقال إلى مساري وفصول الدليل", icon: Compass, active: isPathActive, current: isPathActive, onClick: () => scrollToSection("contents-section") },
    { key: "tools", label: "الأدوات", aria: "الانتقال إلى حقيبة الأدوات الذكية", icon: Wrench, active: isToolsActive, current: isToolsActive, onClick: () => scrollToSection("vizion-growth-suite") },
    {
      key: "advisor",
      label: "المستشار",
      aria: "فتح مستشار فيزيون للذكاء الاصطناعي",
      icon: Bot,
      active: false,
      accent: true,
      onClick: () => {
        setMoreSheetOpen(false);
        onOpenAdvisor();
      }
    },
    { key: "more", label: "المزيد", aria: "فتح قائمة المزيد والخدمات الثانوية", icon: SlidersHorizontal, active: isMoreSheetOpen, expanded: isMoreSheetOpen, onClick: () => setMoreSheetOpen(!isMoreSheetOpen) }
  ];

  return (
    <>
      {/* 1. SLIDE-UP BOTTOM SHEET FOR "المزيد" (SECONDARY ACTIONS) */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden dir-rtl">
            {/* Backdrop: darkens while its blur fades in */}
            <motion.div
              {...overlayMotion}
              onClick={() => setMoreSheetOpen(false)}
              className="absolute inset-0 vz-backdrop cursor-pointer"
              aria-hidden="true"
            />

            {/* Bottom Sheet — anchored to thumb reach, drag down to dismiss */}
            <motion.div
              {...bottomSheetMotion}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 500) setMoreSheetOpen(false);
              }}
              role="dialog"
              aria-modal="true"
              aria-label="المزيد من الوجهات والخدمات"
              className="absolute inset-x-0 bottom-0 max-h-[85vh] glass-elevated glass-edge rounded-t-4xl overflow-hidden flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] touch-pan-y"
            >
              {/* Drag bar indicator */}
              <div className="w-10 h-[5px] bg-white/25 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 cursor-grab active:cursor-grabbing" />

              {/* Sheet Header */}
              <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-right min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/14 flex items-center justify-center text-vz-accent shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white truncate">المزيد من الوجهات والخدمات</h3>
                    <p className="text-[10px] text-white/60 font-light truncate">إجراءات وإعدادات سريعة بيد واحدة</p>
                  </div>
                </div>

                <button                   onClick={() => setMoreSheetOpen(false)}
                  aria-label="إغلاق قائمة المزيد"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-right">
                
                {/* User Status / Upgrade Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/14 flex items-center justify-center text-vz-accent shrink-0">
                      {isFreeTrialUser(userCode) ? <Sparkles className="w-4 h-4" /> : <Crown className="w-4 h-4 text-vz-accent" />}
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
                      className="btn btn-primary px-3 py-1.5 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <div className="flex items-center justify-between">
                        <Flame className="w-4 h-4 text-vz-accent group-hover:scale-[1.04] transition-transform" />
                        <span className="text-[9px] bg-white/10 text-vz-accent px-1.5 py-0.5 rounded font-mono">نخبة</span>
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
                        className="p-3 rounded-2xl bg-gradient-to-br from-white/8 via-white/5 to-transparent border border-white/18 text-right space-y-1 active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                      >
                        <div className="flex items-center justify-between">
                          <Crown className="w-4 h-4 text-vz-accent group-hover:scale-[1.04] transition-transform" />
                          <span className="text-[9px] bg-white/15 text-vz-accent px-1.5 py-0.5 rounded font-mono">خصم</span>
                        </div>
                        <div className="text-xs font-black text-vz-accent">باقات الاشتراك</div>
                        <div className="text-[10px] text-vz-accent/60 font-light truncate">مدى الحياة بدون رسوم شهرية</div>
                      </button>
                    ) : (
                      /* Quick ROI calculator */
                      <button                         onClick={() => scrollToSection("roi-calculator")}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                      >
                        <div className="flex items-center justify-between">
                          <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-[1.04] transition-transform" />
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">حاسبة</span>
                        </div>
                        <div className="text-xs font-black text-white">حاسبة الأرباح ROI</div>
                        <div className="text-[10px] text-white/70 font-light truncate">حساب العائد وصافي الربح</div>
                      </button>
                    )}

                    {/* Ad simulator */}
                    <button                       onClick={() => scrollToSection("ad-simulator")}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <div className="flex items-center justify-between">
                        <Tv className="w-4 h-4 text-slate-300 group-hover:scale-[1.04] transition-transform" />
                        <span className="text-[9px] bg-white/10 text-slate-200 px-1.5 py-0.5 rounded font-mono">محاكي</span>
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
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1 active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                      >
                        <div className="flex items-center justify-between">
                          <Sparkles className="w-4 h-4 text-vz-accent group-hover:scale-[1.04] transition-transform" />
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

                {/* Logout Action Button */}
                {onLogout && (
                  <button                     onClick={() => {
                      setMoreSheetOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer active:scale-[0.97] shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
      <motion.nav
        role="navigation"
        aria-label="شريط التنقل السفلي المخصص للجوال"
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { ...SPRING, delay: 0.35 } }}
        exit={{ y: 96, opacity: 0, transition: { duration: 0.25, ease: EASE_OUT } }}
        className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-[45] pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] px-3 sm:px-4 pointer-events-none dir-rtl"
      >
        <div className="pointer-events-auto max-w-md mx-auto glass-floating glass-edge rounded-[26px] p-1.5 flex items-center justify-between gap-1">
          {dockItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={item.onClick}
                aria-label={item.aria}
                aria-current={item.current ? "page" : undefined}
                aria-expanded={item.expanded}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-[20px] cursor-pointer min-h-[52px] relative transition-[color,scale] duration-300 active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  item.active ? "text-white" : item.accent ? "text-white/90" : "text-white/50"
                }`}
              >
                {item.active && (
                  <motion.span
                    layoutId="dock-active"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-white/[0.14] to-white/[0.05] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                )}
                <motion.span
                  className="relative flex"
                  initial={false}
                  animate={item.active ? { scale: [1, 1.24, 0.94, 1], y: [0, -3, 0, 0] } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.55, times: [0, 0.35, 0.7, 1], ease: EASE_OUT }}
                  whileTap={{ scale: 0.82 }}
                >
                  <Icon className="w-5 h-5" strokeWidth={item.active ? 2.4 : 2} />
                  {item.accent && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 border-[1.5px] border-[#0c1a4a]" />}
                </motion.span>
                <span className={`relative text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight ${item.active || item.accent ? "font-black" : "font-bold"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
};
