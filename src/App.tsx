/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowUp, BookOpen, Settings, LogOut, ShieldAlert, Sparkles, Star, Smartphone, ShieldCheck, Heart, ArrowRight, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, RevealGroup, RevealItem, Magnetic } from "./components/ui/Motion";
import { EASE_OUT, SPRING, SPRING_SNAPPY } from "./lib/motion";
import { chaptersList } from "./data/chaptersData";

// Import modular components
import LockScreen, { isVipUser, isFreeTrialUser, isAiUser } from "./components/LockScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
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

export default function App() {
  useMobileKeyboard();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [activeSection, setActiveSection] = useState("hero-section");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [chapterFilter, setChapterFilter] = useState("all");
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Filter chapters helper
  const filteredChapters = chaptersList.filter((chap, index) => {
    if (chapterFilter === "foundation") return index < 3; // Chapters 1, 2, 3
    if (chapterFilter === "marketing") return index >= 3 && index < 6; // Chapters 4, 5, 6
    if (chapterFilter === "sales") return index >= 6 && index < 9; // Chapters 7, 8, 9
    if (chapterFilter === "scaling") return index >= 9; // Chapters 10, 11
    return true;
  });

  // Check login state on mount
  useEffect(() => {
    const handleOpenVip = () => setIsAdvisorOpen(true);
    const handleOpenUpgrade = () => setIsUpgradeModalOpen(true);
    const handleOpenWelcome = () => setIsWelcomeModalOpen(true);

    window.addEventListener("open-vip-advisor", handleOpenVip);
    window.addEventListener("open-upgrade-modal", handleOpenUpgrade);
    window.addEventListener("open-welcome-intro", handleOpenWelcome);

    // Execute immediate sign-out request
    const signoutVersion = "signout_2026_09_08_v1";
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

  // Back to top scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for Active Navigation Highlighting
  useEffect(() => {
    if (!isLoggedIn) return;

    const sections = [
      "hero-section",
      "contents-section",
      "vizion-growth-suite",
      "elite-secrets-section",
      "pricing-section",
      "chapter1",
      "chapter2",
      "chapter3",
      "chapter4",
      "chapter5",
      "chapter6",
      "chapter7",
      "chapter8",
      "chapter9",
      "ch10",
      "ch11"
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px", // optimal viewport triggers
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoggedIn]);

  const handleLoginSuccess = (validCode: string) => {
    localStorage.setItem("sales_guide_user_token", "true");
    localStorage.setItem("sales_guide_user_code", validCode);
    setIsLoggedIn(true);
    setUserCode(validCode);
    setIsWelcomeModalOpen(true);
    
    // Smooth scroll to top on login
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

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 70; // Nav offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleSelectPath = (path: "learn" | "diagnose" | "calculate") => {
    if (path === "learn") {
      setChapterFilter("all");
      handleScrollToSection("contents-section");
    } else if (path === "diagnose") {
      setIsAdvisorOpen(true);
    } else if (path === "calculate") {
      handleScrollToSection("vizion-growth-suite");
      window.dispatchEvent(new CustomEvent("open-tool-category", { detail: { category: "calculate" } }));
    }
  };

  const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506]";

  const chapterFilters = [
    { id: "all", label: "جميع الفصول (١١)", icon: "📚" },
    { id: "foundation", label: "١. التأسيس والسوق", icon: "🏛️" },
    { id: "marketing", label: "٢. الإعلانات والمحتوى", icon: "🎯" },
    { id: "sales", label: "٣. المبيعات والتوصيل", icon: "💬" },
    { id: "scaling", label: "٤. التحليل والتوسع", icon: "📈" }
  ];

  const outcomes = [
    { title: "تحويل الرسايل الهواية لمبيعات", desc: "بطل تخسر الزبائن اللي يسألون 'ببيش' ويختفون. استخدم سكريبتاتنا الجاهزة حتى تقفل البيعة فوراً.", icon: "💬" },
    { title: "وكف النزيف المالي مال المرتجعات", desc: "لا تدفع أجور التوصيل للراجع بعد اليوم. طبق نظام التأكيد الصارم ونزل نسبة المرتجع لأقل من 10%.", icon: "🛡️" },
    { title: "تخلص من الإعلانات الفاشلة", desc: "قبل لا تطلق أي حملة، استخدم أدواتنا حتى تحسب الأرباح المتوقعة، واعرف بالضبط شوكت تزيد ميزانية الإعلان وشوكت تطفيه.", icon: "📉" },
    { title: "خلّيك أوضح من منافسيك", desc: "تعلم شلون ترتب عرضك ومحتواك حتى يفهم الزبون قيمة منتجك ويختارك بثقة.", icon: "🚀" }
  ];

  const sectionFallback = (label: string) => (
    <div className="py-20 flex items-center justify-center">
      <div className="glass-subtle rounded-full px-5 py-2.5 text-xs text-white/55 flex items-center gap-2.5">
        <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white/80 rounded-full animate-spin" />
        {label}
      </div>
    </div>
  );

  return (
    <SensoryProvider>
      {/* Shared atmospheric background: every glass layer floats above it */}
      <div className="vz-atmosphere" aria-hidden="true" />

      {/* PAGE TRANSITION: lock screen ⇄ app — the old view softens away, the new one rises in */}
      <AnimatePresence mode="wait" initial={false}>
        {!isLoggedIn ? (
          <motion.div
            key="lock"
            className="relative z-[1]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(8px)", transition: { duration: 0.28, ease: EASE_OUT } }}
          >
            <LockScreen onSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
      <motion.div
        key="app"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }}
        exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.26, ease: EASE_OUT } }}
        className="relative z-[1] min-h-screen text-[#F5F5F7] overflow-x-hidden"
      >

      {/* FIXED HEADER NAVIGATION */}
      <Navbar
        activeSection={activeSection}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        userCode={userCode}
        onOpenMore={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
        isMoreOpen={isMobileMoreOpen}
      />

      {/* HERO SECTION */}
      <Hero 
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onSelectPath={handleSelectPath}
        onScrollToSection={handleScrollToSection}
      />

      {/* MAIN WEBSITE WRAPPER */}
      <main id="main-content" tabIndex={-1} className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 md:space-y-16 outline-none overflow-x-hidden">
        
        {/* CONTENTS TABLE SECTION */}
        <section
          id="contents-section"
          className="py-12 sm:py-16 md:py-28 scroll-mt-20 relative"
        >
          <div id="chapters-grid-section" className="scroll-mt-20" />

          {/* Header Title */}
          <Reveal className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-20 relative z-10 px-1">
            <div className="vz-eyebrow text-xs md:text-sm">
              <BookOpen className="w-4 h-4 opacity-80" />
              <span>فهرس خطوات الدليل</span>
            </div>
            
            <h2 className="text-[1.65rem] sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              مسارك المباشر <span className="vz-silver-text">لتكبير مبيعاتك وأرباحك الصافية</span>
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-white/55 max-w-2xl mx-auto font-light leading-relaxed">
              11 فصل عملي ومباشر، يعلمك أصول السوق والتسويق والتوصيل بالعراق خطوة بخطوة حتى تضمن نتائج ممتازة بمشروعك.
            </p>
          </Reveal>

          {/* Tangible Outcomes Highlight Card — elevated glass */}
          <Reveal className="mb-12 sm:mb-24 max-w-5xl mx-auto relative z-10" y={32} scale={0.96}>
            <div className="relative glass-elevated glass-edge rounded-3xl sm:rounded-4xl p-4 sm:p-8 md:p-14 text-right overflow-hidden">
              <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-5 mb-7 sm:mb-14 relative z-10">
                <div className="p-3 sm:p-4 bg-gradient-to-b from-white to-zinc-300 text-[#050506] rounded-2xl shadow-[inset_0_1px_0_#fff,0_10px_30px_-10px_rgba(255,255,255,0.35)]">
                  <Sparkles className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-2xl md:text-4xl font-black text-white leading-tight">
                  شلون يساعدك هذا النظام تطور مشروعك؟
                </h3>
                <p className="text-xs sm:text-base md:text-lg text-white/60 max-w-3xl font-light leading-relaxed">
                  إحنا جمعنالك خطوات عملية وأدوات واضحة تساعدك تفهم أرقام مشروعك، ترتب مبيعاتك، وتاخذ قراراتك بعيداً عن التخمين.
                </p>
              </div>

              <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative z-10" stagger={0.08}>
                {outcomes.map((item, idx) => (
                  <RevealItem key={idx}>
                    <div className="group h-full flex items-start gap-3.5 sm:gap-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-subtle glass-interactive relative cursor-default hover:bg-white/[0.05]">
                      <div className="text-2xl sm:text-3xl shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.04] glass-depth">{item.icon}</div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white mb-1.5">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-white/55 leading-relaxed font-light">{item.desc}</p>
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </Reveal>

          {/* Chapter Category Filter Bar — segmented chips */}
          <Reveal className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center justify-start sm:justify-center gap-2 pb-3 sm:pb-0 mb-10 relative z-10 px-1 -mx-2 sm:mx-0" y={12} scale={1}>
            {chapterFilters.map((tab) => {
              const isActive = chapterFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setChapterFilter(tab.id)}
                  data-active={isActive}
                  aria-pressed={isActive}
                  className={`vz-chip shrink-0 text-xs sm:text-sm ${focusRing}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Reveal>

          {/* Chapters Bento/Grid — cards reflow with layout springs when the filter changes */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            <AnimatePresence mode="popLayout" initial={false}>
            {filteredChapters.map((chap) => {
              const originalIndex = chaptersList.findIndex((c) => c.id === chap.id);
              return (
                <motion.div
                  layout
                  key={chap.id}
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE_OUT } }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ ...SPRING, delay: (originalIndex % 3) * 0.06, opacity: { duration: 0.5, ease: EASE_OUT, delay: (originalIndex % 3) * 0.06 } }}
                >
                <div
                  onClick={() => handleScrollToSection(chap.id)}
                  data-tilt
                  className="group h-full p-5 sm:p-7 md:p-8 rounded-3xl glass glass-interactive cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Layer & Icon Header */}
                  <div className="glass-depth">
                    <div className="flex justify-between items-start mb-5 sm:mb-6 relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center border border-white/10 font-mono font-black text-white/90 text-base sm:text-lg transition-colors duration-500 group-hover:bg-white group-hover:text-[#050506] group-hover:border-white">
                        {originalIndex + 1}
                      </div>
                      <span className="text-3xl sm:text-4xl transform transition-transform duration-500 group-hover:scale-[1.06]">{chap.icon}</span>
                    </div>

                    {/* Category Layer Tag */}
                    {chap.layer && (
                      <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[9px] sm:text-[10px] text-white/65 font-bold mb-2.5 sm:mb-3">
                        {chap.layer}
                      </span>
                    )}

                    {/* Info and Titles */}
                    <div className="relative z-10">
                      <span className="text-[11px] sm:text-xs text-white/45 uppercase font-bold tracking-widest mb-1 block">
                        {chap.number}
                      </span>
                      
                      <h3 className="text-base sm:text-xl font-black text-white mb-2 sm:mb-3 leading-snug">
                        {chap.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-white/55 leading-relaxed font-normal line-clamp-3 mb-4 sm:mb-6">
                        {chap.description}
                      </p>
                    </div>
                  </div>

                  {/* Read Time & Action footer */}
                  <div className="pt-3.5 sm:pt-4 border-t border-white/[0.07] flex justify-between items-center text-xs font-bold relative z-10 mt-auto">
                    <span className="text-[10px] sm:text-[11px] text-white/50 font-mono flex items-center gap-1">
                      ⏱️ {chap.readTime || "قراءة تطبيقية"}
                    </span>
                    <span className="flex items-center gap-1 text-white/80 group-hover:text-white text-xs transition-colors">
                      تصفح الفصل
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform duration-500" />
                    </span>
                  </div>
                </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        </section>

        <div className="vz-hairline" aria-hidden="true" />

        {/* VIZION OS INTEGRATED SOFTWARE SUITE */}
        <section
          id="vizion-growth-suite"
          className="py-12 md:py-24 scroll-mt-20 relative"
        >
          <React.Suspense fallback={sectionFallback("جاري تحميل صندوق الأدوات...")}><VizionGrowthSuite /></React.Suspense>
        </section>

        <div className="vz-hairline" aria-hidden="true" />

        {/* ELITE SECRETS SECTION */}
        <section
          id="elite-secrets-section"
          className="py-12 md:py-24 scroll-mt-20 relative"
        >
          <div id="iraqi-market-section" className="scroll-mt-20" />
          <React.Suspense fallback={sectionFallback("جاري تحميل الأداة...")}><IraqiInsights /></React.Suspense>
        </section>

        {/* SUBSCRIPTION PLANS SECTION (PRICING TIERS) - ONLY FOR FREE TRIAL USERS */}
        {isFreeTrialUser(userCode) && (
          <section
            id="pricing-section"
            className="py-6 md:py-12 scroll-mt-20 relative"
          >
            <div className="vz-hairline mb-10 md:mb-16" aria-hidden="true" />
            <React.Suspense fallback={sectionFallback("جاري تحميل الأسعار...")}><PricingSection onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} /></React.Suspense>
          </section>
        )}

        {/* loop and render each chapter dynamically */}
        {chaptersList.map((chapter) => (
          <ChapterView
            key={chapter.id}
            id={chapter.id}
            number={chapter.number}
            title={chapter.title}
            subtitle={chapter.subtitle}
            icon={chapter.icon}
            description={chapter.description}
          />
        ))}

      </main>

      {/* FOOTER SECTION */}
      <footer className="relative mt-16 sm:mt-28 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] lg:pb-12 safe-area-bottom overflow-hidden">
        <div className="vz-hairline" aria-hidden="true" />
        <div aria-hidden="true" className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70%] h-80 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
        
        <Reveal className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20" y={16} scale={1}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10 text-center md:text-right">
            
            {/* Logo and info */}
            <div className="space-y-3 sm:space-y-4 max-w-sm relative z-10">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                <span className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-white to-zinc-300 text-[#050506] flex items-center justify-center shadow-[inset_0_1px_0_#fff]">
                  <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.4} />
                </span>
                <span className="tracking-tight">فيزيون • Vizion</span>
              </span>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                نظام التشغيل المتكامل المخصص لإدارة المبيعات والتسويق الإلكتروني للمشاريع بالأرقام والتحليل والقضاء عالمرتجعات.
              </p>
            </div>

            {/* Links and trigger portal */}
            <div className="flex flex-wrap justify-center md:justify-end gap-2 text-xs sm:text-sm font-bold relative z-10">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`btn btn-ghost px-4 rounded-full ${focusRing}`}
              >
                الرجوع للبداية
              </button>
              <button
                onClick={() => handleScrollToSection("contents-section")}
                className={`btn btn-ghost px-4 rounded-full ${focusRing}`}
              >
                فهرس الفصول
              </button>
            </div>

          </div>

          <div className="vz-hairline my-8 sm:my-10" aria-hidden="true" />

          {/* Copyright and signature */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-white/45 text-center relative z-10 font-light">
            <span>© 2026 فيزيون • Vizion. جميع الحقوق محفوظة للنخبة المشتركة.</span>
            <span className="flex items-center gap-1.5 glass-subtle px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
              انصنع بحب للمسوقين المحترفين 
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 fill-red-400" />
            </span>
          </div>

        </Reveal>
      </footer>

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
          handleScrollToSection(targetId);
        }}
        onNavigateTool={(toolId, category) => {
          handleScrollToSection("vizion-growth-suite");
          window.dispatchEvent(
            new CustomEvent("open-tool-category", { detail: { category: category || "all", toolId } })
          );
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
        userCode={userCode}
        onOpenAdvisor={() => {
          setIsWelcomeModalOpen(false);
          setIsAdvisorOpen(true);
        }}
      /></React.Suspense>

      {/* FLOATING VIZION AI ADVISOR TRIGGER BUTTON (Desktop only, since MobileBottomNav handles mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.9 }}
        className="hidden lg:block fixed bottom-6 right-6 z-[45]"
      >
        <Magnetic strength={0.16} max={6}>
        <button
          onClick={() => setIsAdvisorOpen(true)}
          aria-label="فتح مستشار فيزيون للذكاء الاصطناعي"
          className={`btn glass-floating glass-edge group pl-5 pr-2.5 py-2.5 rounded-full text-white font-black text-xs gap-3 ${focusRing}`}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-white to-zinc-300 flex items-center justify-center text-[#050506] shadow-[inset_0_1px_0_#fff]">
              <Bot className="w-[18px] h-[18px]" />
            </div>
            {isAiUser(userCode) ? (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1c1c1f]" />
            ) : (
              <span className="absolute -top-1.5 -right-1 text-[10px]">👑</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-white text-xs font-black leading-none flex items-center gap-1.5">
              مستشار فيزيون
              {isAiUser(userCode) ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe" />
              ) : (
                <span className="px-1.5 py-px bg-white/10 text-white/70 text-[8px] rounded-full font-mono">AI</span>
              )}
            </div>
            <div className="text-[10px] text-white/50 font-light mt-1">
              {isAiUser(userCode) ? "المستشار الرقمي الذكي" : "اشتراك إضافي للمستشار 👑"}
            </div>
          </div>
        </button>
        </Magnetic>
      </motion.div>

      {/* FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SNAPPY }}
            exit={{ opacity: 0, y: 12, scale: 0.85, transition: { duration: 0.2, ease: EASE_OUT } }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="الرجوع إلى أعلى الصفحة"
            className={`btn glass-floating fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-3 sm:left-4 lg:bottom-6 lg:left-6 z-40 w-11 h-11 !min-h-0 rounded-full text-white/85 ${focusRing}`}
            title="الرجوع للبداية"
          >
            <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR (Hidden during modals or intro) */}
      <AnimatePresence>
      {!isWelcomeModalOpen && !isAdvisorOpen && !isAdminOpen && !isUpgradeModalOpen && (
        <MobileBottomNav
          key="mobile-bottom-nav"
          activeSection={activeSection}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
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
