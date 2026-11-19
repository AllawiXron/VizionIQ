import React, { useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { LogOut, Bot, Sparkles, Crown } from "lucide-react";
import { isFreeTrialUser } from "./LockScreen";
import type { Route } from "../lib/route";
import { SoundToggleButton } from "./SoundToggleButton";
import { Magnetic } from "./ui/Motion";
import { SPRING, SPRING_SNAPPY } from "../lib/motion";

interface NavbarProps {
  activeView: Route["view"];
  onNavigate: (route: Route) => void;
  onLogout: () => void;
  onOpenAdvisor?: () => void;
  onOpenUpgrade?: () => void;
  userCode: string;
}

const CONDENSE_DISTANCE = 140;

export default function Navbar({
  activeView,
  onNavigate,
  onLogout,
  onOpenAdvisor,
  onOpenUpgrade,
  userCode,
}: NavbarProps) {

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, CONDENSE_DISTANCE], [0, 1], { clamp: true });
  const smoothProgress = useSpring(rawProgress, { stiffness: 320, damping: 38, mass: 0.6 });
  const progress = reduceMotion ? rawProgress : smoothProgress;

  const barMaxWidth = useTransform(progress, (v) => `min(${Math.round(1280 - 110 * v)}px, calc(100% - ${Math.round(20 * v)}px))`);
  const barOffset = useTransform(progress, [0, 1], [0, 10]);
  const barHeight = useTransform(progress, [0, 1], [64, 56]);
  const barRadius = useTransform(progress, [0, 1], [0, 22]);
  const glassOpacity = useTransform(progress, [0, 0.85], [0, 1]);
  const hairlineOpacity = useTransform(progress, [0, 0.4], [1, 0]);
  const logoScale = useTransform(progress, [0, 1], [1, 0.94]);

  const [gpuMorph] = useState(() => typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches);
  const capsuleScale = useTransform(progress, [0, 1], [1.045, 1]);
  const capsuleY = useTransform(progress, [0, 1], [-6, 0]);
  const contentY = useTransform(progress, [0, 1], [0, 4]);

  const desktopLinks: { route: Route; label: string; active: boolean }[] = [
    { route: { view: "home" }, label: "الرئيسية", active: activeView === "home" },
    { route: { view: "chapters" }, label: "الفصول", active: activeView === "chapters" || activeView === "chapter" },
    { route: { view: "solutions" }, label: "الحلول", active: activeView === "solutions" || activeView === "solution" },
    { route: { view: "guide" }, label: "الدليل العراقي", active: activeView === "guide" || activeView === "guideModule" || activeView === "market" },
    { route: { view: "tools" }, label: "الأدوات", active: activeView === "tools" },
  ];

  const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";
  // detail pages carry their own slim back header on phones, so the global bar steps aside there
  const isDetail = activeView === "chapter" || activeView === "solution" || activeView === "guideModule";
  const trial = isFreeTrialUser(userCode);

  return (
    <>
      {!isDetail && (
        <header className="lg:hidden fixed top-0 inset-x-0 z-40 safe-area-top border-b border-white/10 bg-[#040e33]/95 backdrop-blur-md">
          <div className="h-[52px] px-4 flex items-center justify-between gap-3">
            <button
              onClick={() => onNavigate({ view: "home" })}
              className={`flex items-center gap-2 min-h-[44px] rounded-xl ${focusRing}`}
              aria-label="فيزيون، الصفحة الرئيسية"
            >
              <span dir="ltr" className="w-8 h-8 rounded-[10px] bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white text-[13px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                VZ
              </span>
              <span className="text-white font-black text-[16px]">فيزيون</span>
            </button>
            <div className="flex items-center gap-1.5">
              {trial && onOpenUpgrade && (
                <button
                  onClick={onOpenUpgrade}
                  className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-white/15 text-[13px] font-black text-white ${focusRing}`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>اشترك</span>
                </button>
              )}
              <SoundToggleButton variant="compact" />
            </div>
          </div>
        </header>
      )}

      <motion.nav
        id="main-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.06, opacity: { duration: 0.4, delay: 0.06 } }}
        className="hidden lg:block fixed top-0 inset-x-0 z-40 pointer-events-none safe-area-top"
      >
        <motion.div
          style={gpuMorph ? undefined : { maxWidth: barMaxWidth, marginTop: barOffset, height: barHeight, borderRadius: barRadius }}
          className={`pointer-events-auto relative mx-auto ${gpuMorph ? "h-16" : ""}`}
        >
          {gpuMorph ? (
            <motion.div
              aria-hidden="true"
              style={{ opacity: glassOpacity, scale: capsuleScale, y: capsuleY }}
              className="absolute top-2 bottom-0 inset-x-2.5 rounded-[22px] glass-floating glass-edge"
            />
          ) : (
            <motion.div aria-hidden="true" style={{ opacity: glassOpacity }} className="absolute inset-0 rounded-[inherit] glass-floating glass-edge" />
          )}
          <motion.div aria-hidden="true" style={{ opacity: hairlineOpacity }} className="absolute inset-x-0 bottom-0 vz-hairline" />

          <motion.div
            style={gpuMorph ? { y: contentY } : undefined}
            className={`relative w-full h-full flex items-center justify-between gap-3 ${gpuMorph ? "px-5" : "px-2.5 sm:px-5"}`}
          >

          <motion.button
            style={{ scale: logoScale }}
            onClick={() => onNavigate({ view: "home" })}
            className={`flex items-center gap-2.5 group cursor-pointer select-none text-right shrink-0 min-h-[44px] min-w-[44px] rounded-full origin-right active:opacity-70 transition-opacity ${focusRing}`}
            aria-label="فيزيون - الصفحة الرئيسية"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_14px_-4px_rgba(47,107,255,0.6)] shrink-0">
              <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.4} />
            </div>
            <div className="flex flex-col text-right leading-none">
              <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-tight flex items-center gap-1.5">
                <span>فيزيون</span>
                <span className="text-white/60 text-[10px] sm:text-xs font-bold font-mono tracking-[0.18em]">VIZION</span>
              </span>
              <span className="text-[9px] text-white/65 font-normal hidden sm:inline-block tracking-wide mt-1">
                كورس التجارة الإلكترونية
              </span>
            </div>
          </motion.button>

          <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.035] border border-white/[0.06]">
            {desktopLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.route)}
                aria-current={link.active ? "true" : undefined}
                className={`relative px-4 xl:px-5 min-h-[38px] rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-300 ${
                  link.active ? "text-white" : "text-white/70 hover:text-white"
                } ${focusRing}`}
              >
                {link.active && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_14px_-6px_rgba(0,0,0,0.6)]"
                  />
                )}
                <span className="relative">{link.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <SoundToggleButton variant="compact" />

            <button
              onClick={onLogout}
              className={`btn btn-ghost px-2.5 xl:px-3 text-xs whitespace-nowrap text-white/70 hover:!text-red-300 ${focusRing}`}
              title="خروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">خروج</span>
            </button>

            {trial ? (
              <button
                onClick={onOpenUpgrade}
                className={`btn btn-glass px-3.5 text-xs rounded-full whitespace-nowrap ${focusRing}`}
                title="الاشتراك الكامل"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>اشترك</span>
              </button>
            ) : null}

            {onOpenAdvisor && (
              <Magnetic strength={0.18} max={5} reach={10}>
                <button
                  onClick={onOpenAdvisor}
                  className={`btn btn-primary px-4 text-xs rounded-full whitespace-nowrap ${focusRing}`}
                  title="مستشار فيزيون"
                >
                  <Bot className="w-4 h-4" />
                  <span>اسأل المستشار</span>
                </button>
              </Magnetic>
            )}
          </div>

          </motion.div>
        </motion.div>
      </motion.nav>

    </>
  );
}
