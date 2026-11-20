import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, SPRING_SNAPPY } from "./lib/motion";
import { takeOrigin } from "./lib/origin";
import { routeForSection, routeToHash, useRoute, type Route } from "./lib/route";
import { requestTool, type ToolCategory } from "./lib/toolRequest";
import { requestLesson } from "./lib/lessonRequest";

import LockScreen, { isFreeTrialUser, isPaidUser } from "./components/LockScreen";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import ChaptersIndex from "./components/ChaptersIndex";
import ChapterView from "./components/ChapterView";
import SolutionsIndex from "./components/SolutionsIndex";
import PlaybookView from "./components/PlaybookView";
import GuideIndex from "./components/GuideIndex";
import GuideModuleView from "./components/GuideModuleView";
const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
const IraqiInsights = React.lazy(() => import("./components/IraqiInsights"));
const VizionGrowthSuite = React.lazy(() => import("./components/VizionGrowthSuite"));
const VizionAdvisorModal = React.lazy(() => import("./components/VizionAdvisorModal").then(module => ({ default: module.VizionAdvisorModal })));
import { MobileBottomNav } from "./components/MobileBottomNav";
const FreeTrialPaywallModal = React.lazy(() => import("./components/FreeTrialPaywallModal").then(module => ({ default: module.FreeTrialPaywallModal })));
const PricingSection = React.lazy(() => import("./components/PricingSection").then(module => ({ default: module.PricingSection })));
const WelcomeIntroModal = React.lazy(() => import("./components/WelcomeIntroModal").then(module => ({ default: module.WelcomeIntroModal })));
const TrialOnboarding = React.lazy(() => import("./components/TrialOnboarding").then(module => ({ default: module.TrialOnboarding })));
import { SensoryProvider } from "./components/SensoryProvider";
import { useMobileKeyboard } from "./hooks/useMobileKeyboard";

const SIGNOUT_VERSION = "signout_2026_09_08_v1";

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStoredSession() !== null);
  const [userCode, setUserCode] = useState(() => readStoredSession() ?? "");
  const [route, navigate] = useRoute();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isTrialOnboardingOpen, setIsTrialOnboardingOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const routeKey = routeToHash(route);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMoreOpen(false);
  }, [routeKey]);

  useEffect(() => {
    const handleOpenVip = () => setIsAdvisorOpen(true);
    const handleOpenUpgrade = () => setIsUpgradeModalOpen(true);
    const handleOpenWelcome = () => setIsWelcomeModalOpen(true);
    const handleOpenTrialOnboarding = () => setIsTrialOnboardingOpen(true);

    window.addEventListener("open-vip-advisor", handleOpenVip);
    window.addEventListener("open-upgrade-modal", handleOpenUpgrade);
    window.addEventListener("open-welcome-intro", handleOpenWelcome);
    window.addEventListener("open-trial-onboarding", handleOpenTrialOnboarding);

    const signoutVersion = SIGNOUT_VERSION;
    if (localStorage.getItem("sales_guide_signout_flag") !== signoutVersion) {
      localStorage.removeItem("sales_guide_user_token");
      localStorage.removeItem("sales_guide_user_code");
      localStorage.setItem("sales_guide_signout_flag", signoutVersion);
    }

    const sessionToken = localStorage.getItem("sales_guide_user_token");
    const sessionCode = localStorage.getItem("sales_guide_user_code");
    
    if (sessionToken === "true" && sessionCode) {
      setIsLoggedIn(true);
      setUserCode(sessionCode);

      const welcomeSeen = localStorage.getItem(`sales_guide_welcome_seen_${sessionCode}`);
      if (!welcomeSeen) {
        if (isFreeTrialUser(sessionCode)) startFreeLesson(sessionCode);
        else setIsWelcomeModalOpen(true);
      }
    } else {
      setIsLoggedIn(false);
      setUserCode("");
    }

    return () => {
      window.removeEventListener("open-vip-advisor", handleOpenVip);
      window.removeEventListener("open-upgrade-modal", handleOpenUpgrade);
      window.removeEventListener("open-welcome-intro", handleOpenWelcome);
      window.removeEventListener("open-trial-onboarding", handleOpenTrialOnboarding);
    };
  }, []);

  const handleLoginSuccess = (validCode: string) => {
    localStorage.setItem("sales_guide_user_token", "true");
    localStorage.setItem("sales_guide_user_code", validCode);
    setIsLoggedIn(true);
    setUserCode(validCode);
    window.scrollTo({ top: 0 });
    if (isFreeTrialUser(validCode)) {
      startFreeLesson(validCode);
      return;
    }
    setIsWelcomeModalOpen(true);
    navigate({ view: "home" });
  };

  // a free visitor starts inside the first lesson, not in a form or the advisor
  function startFreeLesson(code: string) {
    try {
      localStorage.setItem(`sales_guide_welcome_seen_${code}`, "true");
    } catch {
      /* storage blocked: the lesson still opens */
    }
    requestLesson("chapter1", 0);
    navigate({ view: "chapter", id: "chapter1" });
  }

  const handleLogout = () => {
    localStorage.removeItem("sales_guide_user_token");
    localStorage.removeItem("sales_guide_user_code");
    setIsLoggedIn(false);
    setUserCode("");
    setIsAdminOpen(false);
    setIsAdvisorOpen(false);
    setIsUpgradeModalOpen(false);
    setIsWelcomeModalOpen(false);
    setIsTrialOnboardingOpen(false);
    setIsMobileMoreOpen(false);
    window.scrollTo({ top: 0 });
  };

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

  const isSheetOpen = isAdvisorOpen || isUpgradeModalOpen || isWelcomeModalOpen || isTrialOnboardingOpen || isAdminOpen;
  const [stageEnabled] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
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

  const stageContent = useMemo(() => {
    let screen: React.ReactNode;
    switch (route.view) {
      case "chapters":
        screen = <ChaptersIndex userCode={userCode} onNavigate={navigate} />;
        break;
      case "chapter":
        screen = <ChapterView key={route.id} id={route.id} userCode={userCode} onNavigate={navigate} />;
        break;
      case "solutions":
        screen = <SolutionsIndex userCode={userCode} onNavigate={navigate} />;
        break;
      case "solution":
        screen = (
          <PlaybookView
            key={route.id}
            id={route.id}
            userCode={userCode}
            onNavigate={navigate}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onOpenTool={(toolId) => openTool(toolId)}
          />
        );
        break;
      case "guide":
        screen = <GuideIndex userCode={userCode} onNavigate={navigate} />;
        break;
      case "guideModule":
        screen = <GuideModuleView key={route.id} id={route.id} userCode={userCode} onNavigate={navigate} />;
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
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-10">
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ y: { type: "spring", stiffness: 300, damping: 32, mass: 0.9 }, opacity: { duration: 0.35, ease: EASE_OUT } }}
          className="w-full outline-none min-h-[70vh]"
        >
          {screen}
        </motion.main>

        <footer className="relative mt-10 sm:mt-16 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] lg:pb-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
            <div className="vz-hairline mb-6" aria-hidden="true" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-white/40 text-center">
              <span>© 2026 فيزيون viZion</span>
              <span>كورس عملي بالتجارة الإلكترونية بالعراق</span>
            </div>
          </div>
        </footer>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, userCode]);

  const modalLayer = useMemo(() => (
    <>
      <React.Suspense fallback={null}><AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCodesChange={() => {
        }}
      /></React.Suspense>

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
        isVip={isPaidUser(userCode)}
        userCode={userCode}
        onUpgradeSuccess={(newVipCode) => {
          setUserCode(newVipCode);
          localStorage.setItem("sales_guide_user_code", newVipCode);
        }}
      /></React.Suspense>

      <React.Suspense fallback={null}><FreeTrialPaywallModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userCode={userCode}
        onUpgradeSuccess={(newCode) => {
          setUserCode(newCode);
          localStorage.setItem("sales_guide_user_code", newCode);
        }}
      /></React.Suspense>

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

      <React.Suspense fallback={null}><TrialOnboarding
        isOpen={isTrialOnboardingOpen}
        onClose={() => {
          setIsTrialOnboardingOpen(false);
          if (userCode) {
            localStorage.setItem(`sales_guide_welcome_seen_${userCode}`, "true");
          }
        }}
        onNavigate={navigate}
      /></React.Suspense>
    </>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [isAdminOpen, isAdvisorOpen, isUpgradeModalOpen, isWelcomeModalOpen, isTrialOnboardingOpen, userCode]);

  return (
    <SensoryProvider>
      <div className="vz-atmosphere" aria-hidden="true" />

      <AnimatePresence mode="wait" presenceAffectsLayout={false}>
        {!isLoggedIn ? (
          <motion.div
            key="lock"
            className="relative z-[1]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
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

      <Navbar
        activeView={route.view}
        onNavigate={navigate}
        onLogout={handleLogout}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        userCode={userCode}
      />

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

      <BackToTop className={focusRing} />

      <AnimatePresence>
      {!isWelcomeModalOpen && !isTrialOnboardingOpen && !isAdvisorOpen && !isAdminOpen && !isUpgradeModalOpen && (
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

function BackToTop({ className }: { className: string }) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
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
          aria-label="الرجوع لأعلى الصفحة"
          className={`btn glass-floating fixed bottom-6 left-6 z-40 w-11 h-11 !min-h-0 rounded-full text-white/85 max-lg:!hidden ${className}`}
          title="الرجوع للبداية"
        >
          <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      )}
    </AnimatePresence>
    </>
  );
}
