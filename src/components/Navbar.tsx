/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

/** Distance (px) over which the bar condenses into the floating capsule. */
const CONDENSE_DISTANCE = 140;

export default function Navbar({
  activeView,
  onNavigate,
  onLogout,
  onOpenAdvisor,
  onOpenUpgrade,
  userCode,
}: NavbarProps) {

  // Glass morphing: one continuous 0 → 1 progress drives every dimension of the bar.
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

  // Touch-size screens get the same morph built from transform + opacity only
  // (no per-frame layout): a pre-shaped capsule settles into place around the
  // content while the content glides down to its centre.
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

  return (
    <>
      <motion.nav
        id="main-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.06, opacity: { duration: 0.4, delay: 0.06 } }}
        className="fixed top-0 inset-x-0 z-40 pointer-events-none safe-area-top"
      >
        <motion.div
          style={gpuMorph ? undefined : { maxWidth: barMaxWidth, marginTop: barOffset, height: barHeight, borderRadius: barRadius }}
          className={`pointer-events-auto relative mx-auto ${gpuMorph ? "h-16" : ""}`}
        >
          {/* Floating glass layer: fades in as the bar condenses (blur stays constant, only opacity animates). */}
          {gpuMorph ? (
            <motion.div
              aria-hidden="true"
              style={{ opacity: glassOpacity, scale: capsuleScale, y: capsuleY }}
              className="absolute top-2 bottom-0 inset-x-2.5 rounded-[22px] glass-floating glass-edge"
            />
          ) : (
            <motion.div aria-hidden="true" style={{ opacity: glassOpacity }} className="absolute inset-0 rounded-[inherit] glass-floating glass-edge" />
          )}
          {/* Resting state: a single hairline under a transparent bar. */}
          <motion.div aria-hidden="true" style={{ opacity: hairlineOpacity }} className="absolute inset-x-0 bottom-0 vz-hairline" />

          <motion.div
            style={gpuMorph ? { y: contentY } : undefined}
            className={`relative w-full h-full flex items-center justify-between gap-3 ${gpuMorph ? "px-5" : "px-2.5 sm:px-5"}`}
          >

          {/* Logo Brand: Clear Vizion brand */}
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
                <span className="text-white/45 text-[10px] sm:text-xs font-bold font-mono tracking-[0.18em]">VIZION</span>
              </span>
              <span className="text-[9px] text-white/50 font-normal hidden sm:inline-block tracking-wide mt-1">
                منظومة التجارة والنمو
              </span>
            </div>
          </motion.button>

          {/* Desktop Navigation Links: segmented control with a sliding glass pill */}
          <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.035] border border-white/[0.06]">
            {desktopLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.route)}
                aria-current={link.active ? "true" : undefined}
                className={`relative px-4 xl:px-5 min-h-[38px] rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-300 ${
                  link.active ? "text-white" : "text-white/55 hover:text-white"
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

          {/* User Controls and Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {/* Optional sound feedback toggle */}
            <SoundToggleButton variant="compact" />

            {/* Logout */}
            <button
              onClick={onLogout}
              className={`btn btn-ghost px-2.5 xl:px-3 text-xs whitespace-nowrap text-white/55 hover:!text-red-300 ${focusRing}`}
              title="خروج وقفل الدليل"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">خروج</span>
            </button>

            {/* Free Trial Upgrade Button or User Tag */}
            {isFreeTrialUser(userCode) ? (
              <button
                onClick={onOpenUpgrade}
                className={`btn btn-glass px-3.5 text-xs rounded-full whitespace-nowrap ${focusRing}`}
                title="اضغط للترقية إلى الحساب الكامل"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>ترقية الكورس</span>
              </button>
            ) : null}

            {/* AI Advisor Button — the primary action, gently magnetic */}
            {onOpenAdvisor && (
              <Magnetic strength={0.18} max={5} reach={10}>
                <button
                  onClick={onOpenAdvisor}
                  className={`btn btn-primary px-4 text-xs rounded-full whitespace-nowrap ${focusRing}`}
                  title="المستشار الرقمي المباشر الذكي"
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
