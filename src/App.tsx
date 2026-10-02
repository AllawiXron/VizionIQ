/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, SPRING_SNAPPY } from "./lib/motion";
import { takeOrigin } from "./lib/origin";
import { routeForSection, routeToHash, useRoute, type Route } from "./lib/route";
import { requestTool, type ToolCategory } from "./lib/toolRequest";

// Import modular components
import LockScreen, { isFreeTrialUser, isAiUser } from "./components/LockScreen";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import ChaptersIndex from "./components/ChaptersIndex";
import ChapterView from "./components/ChapterView";
const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
const IraqiInsights = React.lazy(() => import("./components/IraqiInsights"));
const VizionGrowthSuite = React.lazy(() => import("./components/VizionGrowthSuite"));
const VizionAdvisorModal = React.lazy(() => import("./components/VizionAdvisorModal").then(module => ({ default: module.VizionAdvisorModal })));
import { MobileBottomNav } from "./components/MobileBottomNav";
const FreeTrialPaywallModal = React.lazy(() => import("./components/FreeTrialPaywallModal").then(module => ({ default: module.FreeTrialPaywallModal })));
const PricingSection = React.lazy(() => import("./components/PricingSection").then(module => ({ default: module.PricingSection })));
const WelcomeIntroModal = React.lazy(() => import("./components/WelcomeIntroModal").then(module => ({ default: module.WelcomeIntroModal })));
import { SensoryProvider } from "./components/SensoryProvider";
import { useMobileKeyboard } from "./hooks/useMobileKeyboard";

const SIGNOUT_VERSION = "signout_2026_09_08_v1";

/** Returns the stored member code when a valid session exists, otherwise null. */
function readStoredSession(): string | null {
  try {
    if (localStorage.getItem("sales_guide_signout_flag") !== SIGNOUT_VERSION) return null;
    const token = localStorage.getItem("sales_guide_user_token");
    const code = localStorage.getItem("sales_guide_user_code");
    return token === "true" && code ? code : null;
  } catch {
    return null;
  }
}

export default function App() {
  useMobileKeyboard();
  // Read the stored session synchronously so returning members land straight in
  // the app (no lock-screen flash). The mount effect below still runs the
  // sign-out migration and remains the source of truth.
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStoredSession() !== null);
  const [userCode, setUserCode] = useState(() => readStoredSession() ?? "");
  const [route, navigate] = useRoute();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const routeKey = routeToHash(route);

  // Every screen starts at its top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMoreOpen(false);
  }, [routeKey]);

  // Check login state on mount
  useEffect(() => {
    const handleOpenVip = () => setIsAdvisorOpen(true);
    const handleOpenUpgrade = () => setIsUpgradeModalOpen(true);
    const handleOpenWelcome = () => setIsWelcomeModalOpen(true);

    window.addEventListener("open-vip-advisor", handleOpenVip);
    window.addEventListener("open-upgrade-modal", handleOpenUpgrade);
    window.addEventListener("open-welcome-intro", handleOpenWelcome);

    // Execute immediate sign-out request
    const signoutVersion = SIGNOUT_VERSION;
    if (localStorage.getItem("sales_guide_signout_flag") !== signoutVersion) {
      localStorage.removeItem("sales_guide_user_token");
      localStorage.removeItem("sales_guide_user_code");
      localStorage.setItem("sales_guide_signout_flag", signoutVersion);
    }

    // Check session
    const sessionToken = localStorage.getItem("sales_guide_user_token");
    const sessionCode = localStorage.getItem("sales_guide_user_code");
    
    // If signout was triggered or session exists
    if (sessionToken === "true" && sessionCode) {
      setIsLoggedIn(true);
      setUserCode(sessionCode);

      // Check if welcome intro was already shown
      const welcomeSeen = localStorage.getItem(`sales_guide_welcome_seen_${sessionCode}`);
      if (!welcomeSeen) {
        setIsWelcomeModalOpen(true);
      }
    } else {
      setIsLoggedIn(false);
      setUserCode("");
    }

    return () => {
      window.removeEventListener("open-vip-advisor", handleOpenVip);
      window.removeEventListener("open-upgrade-modal", handleOpenUpgrade);
      window.removeEventListener("open-welcome-intro", handleOpenWelcome);
    };
  }, []);

  const handleLoginSuccess = (validCode: string) => {
    localStorage.setItem("sales_guide_user_token", "true");
    localStorage.setItem("sales_guide_user_code", validCode);
    setIsLoggedIn(true);
    setUserCode(validCode);
    setIsWelcomeModalOpen(true);
    navigate({ view: "home" });
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    localStorage.removeItem("sales_guide_user_token");
    localStorage.removeItem("sales_guide_user_code");
    setIsLoggedIn(false);
    setUserCode("");
    setIsAdminOpen(false);
    setIsAdvisorOpen(false);
    setIsUpgradeModalOpen(false);
    setIsWelcomeModalOpen(false);
    setIsMobileMoreOpen(false);
    window.scrollTo({ top: 0 });
  };

  /** Old section ids (advisor links, legacy components) open the matching screen. */
  const handleScrollToSection = (id: string) => {
    const target = routeForSection(id);
    if (target) {
      navigate(target);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const openTool = (toolId?: string, category?: string) => {
    requestTool({ toolId, category: (category as ToolCategory) || (toolId ? undefined : "all") });
    navigate({ view: "tools" });
  };

  const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

  // iOS-style depth: while a sheet is open, the page behind it recedes slightly.
  // Desktop/tablet only (phones show most sheets full-screen anyway).
  const isSheetOpen = isAdvisorOpen || isUpgradeModalOpen || isWelcomeModalOpen || isAdminOpen;
  const [stageEnabled] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  // Rack focus, like an app launching on iOS: the page pushes in toward the
  // control that opened the sheet (and settles back from the same point).
  // Default: the centre of the visible viewport (not of the whole page).
  const stageOriginRef = useRef(
    typeof window !== "undefined" ? `50% ${Math.round(window.scrollY + window.innerHeight / 2)}px` : "50% 0px"
  );
  const stageOrigin = useMemo(() => {
    if (isSheetOpen && typeof window !== "undefined") {
      const o = takeOrigin();
      stageOriginRef.current = o
        ? `${Math.round(o.x)}px ${Math.round(window.scrollY + o.y)}px`
        : `50% ${Math.round(window.scrollY + window.innerHeight / 2)}px`;
    }
    return stageOriginRef.current;
  }, [isSheetOpen]);

  const sectionFallback = (label: string) => (
    <div className="pt-40 pb-20 flex items-center justify-center">
      <div className="glass-subtle rounded-full px-5 py-2.5 text-xs text-white/55 flex items-center gap-2.5">
        <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white/80 rounded-full animate-spin" />
        {label}
      </div>
    </div>
  );

  // One screen at a time. Memoised so sheets opening/closing never re-render
  // the page behind them.
  const stageContent = useMemo(() => {
    let screen: React.ReactNode;
    switch (route.view) {
      case "chapters":
        screen = <ChaptersIndex userCode={userCode} onNavigate={navigate} />;
        break;
      case "chapter":
        screen = <ChapterView key={route.id} id={route.id} userCode={userCode} onNavigate={navigate} />;
        break;
      case "tools":
        screen = (
          <div className="pt-16 sm:pt-20">
            <React.Suspense fallback={sectionFallback("جاري تحميل الأدوات...")}><VizionGrowthSuite /></React.Suspense>
          </div>
        );
        break;
      case "market":
        screen = (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-10">
            <React.Suspense fallback={sectionFallback("جاري التحميل...")}><IraqiInsights /></React.Suspense>
          </div>
        );
        break;
      default:
        screen = (
          <>
            <HomeView
              userCode={userCode}
              onNavigate={navigate}
              onOpenAdvisor={() => setIsAdvisorOpen(true)}
              onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            />
            {isFreeTrialUser(userCode) && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <React.Suspense fallback={sectionFallback("جاري تحميل الأسعار...")}><PricingSection onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} /></React.Suspense>
              </div>
            )}
          </>
        );
    }

    return (
      <>
        <motion.main
          key={routeKey}
          id="main-content"
          tabIndex={-1}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="w-full outline-none min-h-[70vh]"
        >
          {screen}
        </motion.main>

        <footer className="relative mt-10 sm:mt-16 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] lg:pb-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
            <div className="vz-hairline mb-6" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-white/40 text-center">
              <span>© 2026 فيزيون • Vizion</span>
              <span>كورس عملي للتجارة الإلكترونية بالعراق</span>
            </div>
          </div>
        </footer>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, userCode]);

  // Sheets only re-render when one opens/closes or the member changes — not
  // when the active section changes while scrolling (the closed advisor alone
  // is a large component).
  const modalLayer = useMemo(() => (
    <>
      {/* ADMIN CONTROL MODAL PANEL */}
      <React.Suspense fallback={null}><AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCodesChange={() => {
          // Trigger force-reload logic if necessary
        }}
      /></React.Suspense>

      {/* VIZION AI ADVISOR CHATBOT MODAL */}
      <React.Suspense fallback={null}><VizionAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        onNavigateToSection={(targetId) => {
          setIsAdvisorOpen(false);
          handleScrollToSection(targetId);
        }}
        onNavigateTool={(toolId, category) => {
          setIsAdvisorOpen(false);
          openTool(toolId, category);
        }}
        isVip={isAiUser(userCode)}
        userCode={userCode}
        onUpgradeSuccess={(newVipCode) => {
          setUserCode(newVipCode);
          localStorage.setItem("sales_guide_user_code", newVipCode);
        }}
      /></React.Suspense>

      {/* FREE TRIAL UPGRADE PAYWALL MODAL */}
      <React.Suspense fallback={null}><FreeTrialPaywallModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userCode={userCode}
        onUpgradeSuccess={(newCode) => {
          setUserCode(newCode);
          localStorage.setItem("sales_guide_user_code", newCode);
        }}
      /></React.Suspense>

      {/* HEAVENLY WELCOME INTRO MODAL */}
      <React.Suspense fallback={null}><WelcomeIntroModal
        isOpen={isWelcomeModalOpen}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          if (userCode) {
            localStorage.setItem(`sales_guide_welcome_seen_${userCode}`, "true");
          }
        }}
        onStart={() => {
          setIsWelcomeModalOpen(false);
          if (userCode) {
            localStorage.setItem(`sales_guide_welcome_seen_${userCode}`, "true");
          }
          navigate({ view: "chapter", id: "chapter1" });
        }}
      /></React.Suspense>
    </>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [isAdminOpen, isAdvisorOpen, isUpgradeModalOpen, isWelcomeModalOpen, userCode]);

  return (
    <SensoryProvider>
      {/* Shared atmospheric background: every glass layer floats above it */}
      <div className="vz-atmosphere" aria-hidden="true" />

      {/* PAGE TRANSITION: lock screen ⇄ app — the old view softens away, the new one rises in */}
      {/* presenceAffectsLayout={false}: otherwise the presence context is rebuilt on
          every App render and every motion element in the page re-renders with it. */}
      <AnimatePresence mode="wait" presenceAffectsLayout={false}>
        {!isLoggedIn ? (
          <motion.div
            key="lock"
            className="relative z-[1]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
            // Unlock: the lock screen zooms toward you and dissolves into blur.
            exit={{ opacity: 0, scale: 1.08, filter: "blur(14px)", transition: { duration: 0.34, ease: EASE_OUT } }}
          >
            <LockScreen onSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
      <motion.div
        key="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: { duration: 0.26, ease: EASE_OUT } }}
        className="relative z-[1] min-h-screen text-white overflow-x-clip"
      >

      {/* FIXED HEADER NAVIGATION */}
      <Navbar
        activeView={route.view}
        onNavigate={navigate}
        onLogout={handleLogout}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        userCode={userCode}
      />

      {/* PAGE STAGE — hero, sections and footer recede together behind sheets */}
      <motion.div
        className="vz-stage"
        style={{ transformOrigin: stageOrigin }}
        initial={stageEnabled ? { y: 0, scale: 0.97 } : false}
        animate={stageEnabled && isSheetOpen ? { y: 0, scale: 1.035, opacity: 0.5 } : { y: 0, scale: 1, opacity: 1 }}
        transition={isSheetOpen ? { type: "spring", stiffness: 240, damping: 30, mass: 1 } : { type: "spring", stiffness: 300, damping: 30, mass: 0.9 }}
      >

      {stageContent}
      </motion.div>

      {modalLayer}

      {/* FLOATING BACK TO TOP BUTTON (owns its scroll listener, so scrolling never re-renders the app) */}
      <BackToTop className={focusRing} />

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR (Hidden during modals or intro) */}
      <AnimatePresence>
      {!isWelcomeModalOpen && !isAdvisorOpen && !isAdminOpen && !isUpgradeModalOpen && (
        <MobileBottomNav
          key="mobile-bottom-nav"
          activeView={route.view}
          onNavigate={navigate}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenIntro={() => setIsWelcomeModalOpen(true)}
          onLogout={handleLogout}
          userCode={userCode}
          isMoreOpen={isMobileMoreOpen}
          setIsMoreOpen={setIsMobileMoreOpen}
        />
      )}
      </AnimatePresence>

      </motion.div>
        )}
      </AnimatePresence>
    </SensoryProvider>
  );
}

/**
 * Floating back-to-top control. Visibility comes from an IntersectionObserver
 * on a sentinel 400px down the page, so scrolling does no per-frame work and
 * the app never re-renders for it.
 */
function BackToTop({ className }: { className: string }) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      // Sentinel above the viewport → the page has scrolled past 400px.
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
    <div ref={sentinelRef} aria-hidden="true" className="absolute top-[400px] right-0 w-px h-px pointer-events-none" />
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SNAPPY }}
          exit={{ opacity: 0, y: 12, scale: 0.85, transition: { duration: 0.2, ease: EASE_OUT } }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="الرجوع إلى أعلى الصفحة"
          className={`btn glass-floating fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-3 sm:left-4 lg:bottom-6 lg:left-6 z-40 w-11 h-11 !min-h-0 rounded-full text-white/85 ${className}`}
          title="الرجوع للبداية"
        >
          <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      )}
    </AnimatePresence>
    </>
  );
}
