/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Wrench,
  Bot,
  Menu,
  X,
  Lightbulb,
  Crown,
  Sparkles,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, SPRING, SPRING_SNAPPY, bottomSheetMotion, overlayMotion, sheetMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { isFreeTrialUser } from "./LockScreen";
import type { Route } from "../lib/route";
import { SoundToggleButton } from "./SoundToggleButton";

export interface MobileBottomNavProps {
  activeView: Route["view"];
  onNavigate: (route: Route) => void;
  onOpenAdvisor: () => void;
  onOpenUpgrade?: () => void;
  onOpenIntro?: () => void;
  onLogout?: () => void;
  userCode?: string;
  isMoreOpen?: boolean;
  setIsMoreOpen?: (open: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenAdvisor,
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

  const go = (route: Route) => {
    setMoreSheetOpen(false);
    onNavigate(route);
  };

  const dockItems = [
    { key: "home", label: "الرئيسية", aria: "الرئيسية", icon: Home, active: !isMoreSheetOpen && activeView === "home", onClick: () => go({ view: "home" }) },
    { key: "chapters", label: "الفصول", aria: "فصول الكورس", icon: BookOpen, active: !isMoreSheetOpen && (activeView === "chapters" || activeView === "chapter"), onClick: () => go({ view: "chapters" }) },
    {
      key: "advisor",
      label: "المستشار",
      aria: "فتح مستشار فيزيون الذكي",
      icon: Bot,
      active: false,
      accent: true,
      onClick: () => {
        setMoreSheetOpen(false);
        onOpenAdvisor();
      }
    },
    { key: "tools", label: "الأدوات", aria: "الأدوات والحاسبات", icon: Wrench, active: !isMoreSheetOpen && activeView === "tools", onClick: () => go({ view: "tools" }) },
    { key: "more", label: "المزيد", aria: "المزيد", icon: Menu, active: isMoreSheetOpen || (!isMoreSheetOpen && activeView === "market"), expanded: isMoreSheetOpen, onClick: () => setMoreSheetOpen(!isMoreSheetOpen) }
  ];

  // The More sheet grows out of the dock button (or top menu button) like a liquid-glass panel.
  const originSheet = useOriginSheet(isMoreSheetOpen, { width: 480, anchor: "bottom", height: 420 });
  const moreSheetMotion = originSheet === sheetMotion ? bottomSheetMotion : originSheet;

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
              {...moreSheetMotion}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 500) setMoreSheetOpen(false);
              }}
              role="dialog"
              aria-modal="true"
              aria-label="المزيد"
              className="absolute inset-x-0 bottom-0 max-h-[85vh] glass-elevated glass-edge rounded-t-4xl overflow-hidden flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] touch-pan-y"
            >
              {/* Drag bar indicator */}
              <div className="w-10 h-[5px] bg-white/25 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 cursor-grab active:cursor-grabbing" />

              {/* Sheet Header */}
              <div className="px-4 pb-2.5 flex items-center justify-between shrink-0">
                <h3 className="text-base font-black text-white">المزيد</h3>
                <button
                  onClick={() => setMoreSheetOpen(false)}
                  aria-label="إغلاق"
                  className="vz-close focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-2 overflow-y-auto space-y-2 text-right">
                <button
                  onClick={() => go({ view: "market" })}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-right cursor-pointer min-h-[56px] active:scale-[0.98] transition-[transform,background-color] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0"><Lightbulb className="w-4 h-4 text-amber-200" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-black text-white">أسرار السوق العراقي</span>
                    <span className="block text-[11px] text-white/55 truncate">دروس قصيرة من تجارب التجار</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-white/40 shrink-0" />
                </button>
                {isFreeTrialUser(userCode) && onOpenUpgrade && (
                <button
                  onClick={() => { setMoreSheetOpen(false); onOpenUpgrade(); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-right cursor-pointer min-h-[56px] active:scale-[0.98] transition-[transform,background-color] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0"><Crown className="w-4 h-4 text-white" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-black text-white">افتح الكورس كامل</span>
                    <span className="block text-[11px] text-white/55 truncate">إنت بالنسخة التجريبية</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-white/40 shrink-0" />
                </button>
                )}
                {onOpenIntro && (
                <button
                  onClick={() => { setMoreSheetOpen(false); onOpenIntro(); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-right cursor-pointer min-h-[56px] active:scale-[0.98] transition-[transform,background-color] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-vz-accent" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-black text-white">شلون أستخدم الموقع؟</span>
                    <span className="block text-[11px] text-white/55 truncate">شرح سريع بثلاث خطوات</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-white/40 shrink-0" />
                </button>
                )}

                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-sm font-black text-white">أصوات الأزرار</span>
                  <SoundToggleButton variant="pill" />
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      setMoreSheetOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-2xl text-red-300/90 hover:text-red-300 hover:bg-red-500/10 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[48px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
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
                aria-current={item.active && !item.expanded ? "page" : undefined}
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
