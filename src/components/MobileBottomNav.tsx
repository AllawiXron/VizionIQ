import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Home,
  BookOpen,
  Wrench,
  Bot,
  Menu,
  X,
  Lightbulb,
  LifeBuoy,
  Crown,
  Sparkles,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useLiquidGlass } from "../lib/liquidGlass";
import { EASE_OUT, SPRING, bottomSheetMotion, overlayMotion, sheetMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { isFreeTrialUser } from "./LockScreen";
import type { Route } from "../lib/route";
import { SoundToggleButton } from "./SoundToggleButton";
import { useLensOn } from "./ui/Segmented";

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

  // the dock steps aside while reading down a page and comes back on the first scroll up
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (y < 120 || nearEnd) setTucked(false);
        else if (y > last + 8) setTucked(true);
        else if (y < last - 8) setTucked(false);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [activeView]);
  useEffect(() => setTucked(false), [activeView]);
  const hidden = tucked && !isMoreSheetOpen;

  const dockItems = [
    { key: "home", label: "الرئيسية", aria: "الرئيسية", icon: Home, active: !isMoreSheetOpen && activeView === "home", onClick: () => go({ view: "home" }) },
    { key: "chapters", label: "الفصول", aria: "فصول الكورس", icon: BookOpen, active: !isMoreSheetOpen && (activeView === "chapters" || activeView === "chapter"), onClick: () => go({ view: "chapters" }) },
    {
      key: "advisor",
      label: "المستشار",
      aria: "افتح مستشار فيزيون الذكي",
      icon: Bot,
      active: false,
      accent: true,
      onClick: () => {
        setMoreSheetOpen(false);
        onOpenAdvisor();
      }
    },
    { key: "solutions", label: "الحلول", aria: "حلول المشاكل خطوة بخطوة", icon: LifeBuoy, active: !isMoreSheetOpen && (activeView === "solutions" || activeView === "solution"), onClick: () => go({ view: "solutions" }) },
    { key: "more", label: "المزيد", aria: "المزيد", icon: Menu, active: isMoreSheetOpen || activeView === "tools" || activeView === "market" || activeView === "guide" || activeView === "guideModule", expanded: isMoreSheetOpen, onClick: () => setMoreSheetOpen(!isMoreSheetOpen) }
  ];

  // one glass drop marks the current tab; pressing turns it into a lens that follows the finger
  const barRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const activeIndex = dockItems.findIndex((i) => i.active);
  const [pressed, setPressed] = useState(false);
  const press = useRef<{ id: number; startX: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const placed = useRef(false);
  const dropX = useMotionValue(0);
  const dropW = useMotionValue(0);
  const glide = { stiffness: 520, damping: 40, mass: 0.7 };
  const springX = useSpring(dropX, glide);
  const springW = useSpring(dropW, glide);
  // the lens is placed with left/width, never a transform: refraction is drawn in the element's own box
  const lensLeft = useTransform([springX, springW], ([x, w]: number[]) => x - w * 0.09);
  const lensWidth = useTransform(springW, (w) => w * 1.18);

  useLiquidGlass(barRef, { bezel: 14, strength: 28, extra: "blur(3.5px) saturate(180%) brightness(1.04)" });
  useLiquidGlass(lensRef, { bezel: 12, strength: 16, magnify: 0.2, dispersion: true, extra: "saturate(190%) brightness(1.16)" });
  const lensOn = useLensOn(pressed);

  const placeOn = (i: number) => {
    const b = itemRefs.current[i];
    if (!b) return;
    dropX.set(b.offsetLeft);
    dropW.set(b.offsetWidth);
    if (!placed.current || reduce) {
      springX.jump(b.offsetLeft);
      springW.jump(b.offsetWidth);
      placed.current = true;
    }
  };

  useLayoutEffect(() => {
    if (!pressed && activeIndex >= 0) placeOn(activeIndex);
  }, [activeIndex, pressed]);

  useEffect(() => {
    const onResize = () => {
      if (activeIndex < 0) return;
      placed.current = false;
      placeOn(activeIndex);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  const follow = (clientX: number) => {
    const bar = barRef.current;
    const first = itemRefs.current[0];
    if (!bar || !first) return;
    const box = bar.getBoundingClientRect();
    const w = first.offsetWidth;
    dropX.set(Math.max(4, Math.min(box.width - w - 4, clientX - box.left - w / 2)));
    dropW.set(w);
  };

  const nearest = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const x = clientX - bar.getBoundingClientRect().left;
    let best = 0;
    let gap = Infinity;
    itemRefs.current.forEach((b, i) => {
      if (!b) return;
      const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - x);
      if (d < gap) {
        gap = d;
        best = i;
      }
    });
    return best;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    press.current = { id: e.pointerId, startX: e.clientX, moved: false };
    setPressed(true);
    follow(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && Math.abs(e.clientX - p.startX) > 6) {
      p.moved = true;
      barRef.current?.setPointerCapture(e.pointerId);
    }
    follow(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    if (p.moved) {
      const i = nearest(e.clientX);
      placeOn(i);
      skipClick.current = true;
      window.setTimeout(() => (skipClick.current = false), 0);
      dockItems[i]?.onClick();
    }
    setPressed(false);
  };
  const onPointerCancel = () => {
    press.current = null;
    setPressed(false);
  };

  const originSheet = useOriginSheet(isMoreSheetOpen, { width: 480, anchor: "bottom", height: 420 });
  const moreSheetMotion = originSheet === sheetMotion ? bottomSheetMotion : originSheet;

  return (
    <>
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden dir-rtl">
            <motion.div
              {...overlayMotion}
              onClick={() => setMoreSheetOpen(false)}
              className="absolute inset-0 vz-backdrop cursor-pointer"
              aria-hidden="true"
            />

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
              <div className="w-10 h-[5px] bg-white/25 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 cursor-grab active:cursor-grabbing" />

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
                  onClick={() => go({ view: "tools" })}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-right cursor-pointer min-h-[56px] active:scale-[0.98] transition-[transform,background-color] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0"><Wrench className="w-4 h-4 text-white/85" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-black text-white">الأدوات والحاسبات</span>
                    <span className="block text-[11px] text-white/55 truncate">13 أداة تحسبلك أرقامك بالدينار</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-white/40 shrink-0" />
                </button>
                <button
                  onClick={() => go({ view: "guide" })}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-right cursor-pointer min-h-[56px] active:scale-[0.98] transition-[transform,background-color] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0"><Lightbulb className="w-4 h-4 text-amber-200" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-black text-white">الدليل العراقي</span>
                    <span className="block text-[11px] text-white/55 truncate">السوق، الدفع، التوصيل، الكمرك، المواسم والقانون</span>
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
                    <span className="block text-[11px] text-white/55 truncate">إنت حاليا بالتجربة المجانية</span>
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
                    <span className="block text-sm font-black text-white">شلون تستخدم الموقع؟</span>
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

      <motion.nav
        role="navigation"
        aria-label="شريط التنقل السفلي للموبايل"
        initial={{ y: 96, opacity: 0 }}
        animate={hidden ? { y: 96, opacity: 0, transition: { duration: 0.22, ease: EASE_OUT } } : { y: 0, opacity: 1, transition: { ...SPRING, delay: 0.05 } }}
        exit={{ y: 96, opacity: 0, transition: { duration: 0.25, ease: EASE_OUT } }}
        aria-hidden={hidden || undefined}
        className={`mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-[45] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] px-3 sm:px-4 pointer-events-none dir-rtl`}
      >
        <div
          ref={barRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className={`${hidden ? "pointer-events-none" : "pointer-events-auto"} max-w-md mx-auto lg-glass rounded-[26px] p-1 flex items-center justify-between gap-1 touch-pan-y select-none`}
        >
          <motion.span
            aria-hidden="true"
            style={{ x: springX, width: springW }}
            initial={false}
            animate={{ opacity: activeIndex >= 0 && !pressed ? 1 : 0 }}
            transition={{ duration: pressed ? 0.12 : 0.3, ease: EASE_OUT, delay: pressed ? 0 : 0.1 }}
            className="lg-pill absolute left-0 top-1 bottom-1 rounded-[22px] pointer-events-none"
          />
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                ref={(b) => {
                  itemRefs.current[index] = b;
                }}
                onClick={() => {
                  if (skipClick.current) return;
                  item.onClick();
                }}
                aria-label={item.aria}
                aria-current={item.active && !item.expanded ? "page" : undefined}
                aria-expanded={item.expanded}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-[22px] cursor-pointer min-h-[50px] relative transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  item.active ? "text-white" : item.accent ? "text-white/90" : "text-white/55"
                }`}
              >
                <motion.span
                  className="relative flex"
                  initial={false}
                  animate={item.active ? { scale: [1, 1.14, 0.97, 1], y: [0, -2, 0, 0] } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.55, times: [0, 0.35, 0.7, 1], ease: EASE_OUT }}
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
          <motion.span
            ref={lensRef}
            aria-hidden="true"
            style={{ left: lensLeft, width: lensWidth, visibility: lensOn ? "visible" : "hidden" }}
            initial={false}
            animate={
              pressed
                ? { opacity: 1, clipPath: reduce ? "inset(8px 8% 8px 8% round 22px)" : "inset(0px 0% 0px 0% round 28px)" }
                : { opacity: 0, clipPath: "inset(8px 8% 8px 8% round 22px)" }
            }
            transition={
              pressed
                ? { type: "spring", stiffness: 520, damping: 26, mass: 0.6, opacity: { duration: 0.1 } }
                : { type: "spring", stiffness: 420, damping: 30, mass: 0.7, opacity: { duration: 0.26, delay: 0.12, ease: EASE_OUT } }
            }
            className="lg-lens absolute -top-1 -bottom-1 rounded-[28px] pointer-events-none"
          />
        </div>
      </motion.nav>
    </>
  );
};
