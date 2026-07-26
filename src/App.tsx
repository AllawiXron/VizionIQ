/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowUp, BookOpen, Settings, LogOut, ShieldAlert, Sparkles, Star, Smartphone, ShieldCheck, Heart, ArrowRight, Bot } from "lucide-react";
import { motion } from "motion/react";
import { chaptersList } from "./data/chaptersData";

// Import modular components
import LockScreen, { isVipUser, isFreeTrialUser } from "./components/LockScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChapterView from "./components/ChapterView";
import AdminPanel from "./components/AdminPanel";
import IraqiInsights from "./components/IraqiInsights";
import VizionGrowthSuite from "./components/VizionGrowthSuite";
import { VizionAdvisorModal } from "./components/VizionAdvisorModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { FreeTrialPaywallModal } from "./components/FreeTrialPaywallModal";
import { PricingSection } from "./components/PricingSection";
import { WelcomeIntroModal } from "./components/WelcomeIntroModal";
import { SensoryProvider } from "./components/SensoryProvider";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [activeSection, setActiveSection] = useState("hero-section");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [chapterFilter, setChapterFilter] = useState("all");

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

    const sessionToken = localStorage.getItem("sales_guide_user_token");
    const sessionCode = localStorage.getItem("sales_guide_user_code");
    
    if (sessionToken === "true" && sessionCode) {
      setIsLoggedIn(true);
      setUserCode(sessionCode);

      // Check if welcome intro was already shown
      const welcomeSeen = localStorage.getItem(`sales_guide_welcome_seen_${sessionCode}`);
      if (!welcomeSeen) {
        setIsWelcomeModalOpen(true);
      }
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
    if (window.confirm("متأكد تريد تسجل خروج وتقفل الدليل الرقمي؟")) {
      localStorage.removeItem("sales_guide_user_token");
      localStorage.removeItem("sales_guide_user_code");
      setIsLoggedIn(false);
      setUserCode("");
      setIsAdminOpen(false);
    }
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

  // If not authenticated, render password lock screen
  if (!isLoggedIn) {
    return (
      <SensoryProvider>
        <LockScreen onSuccess={handleLoginSuccess} />
      </SensoryProvider>
    );
  }

  return (
    <SensoryProvider>
      <div className="relative min-h-screen bg-[#040B24] text-[#F0F4FF] overflow-x-hidden selection:bg-[#D4A017] selection:text-[#040B24]">
      
      {/* Background Ambience Globs (Global layout decorations) */}
      <div className="absolute top-[5%] right-[5%] w-[600px] h-[600px] bg-[#D4A017]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[2%] w-[500px] h-[500px] bg-[#1A2B73]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[3%] w-[550px] h-[550px] bg-[#D4A017]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* FIXED HEADER NAVIGATION */}
      <Navbar
        activeSection={activeSection}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        userCode={userCode}
      />

      {/* HERO SECTION */}
      <Hero />

      {/* MAIN WEBSITE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-16">
        
        {/* CONTENTS TABLE SECTION */}
        <section
          id="contents-section"
          className="py-12 md:py-24 border-b border-white/5 scroll-mt-20 relative"
        >
          <div id="chapters-grid-section" className="scroll-mt-20" />
          {/* Ambient Glows for Section */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4A017]/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1A2B73]/10 rounded-full blur-[150px] pointer-events-none" />

          {/* Header Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-5 mb-20 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#D4A017]/20 to-[#D4A017]/5 border border-[#D4A017]/30 text-xs md:text-sm text-[#F0C040] font-bold tracking-wide shadow-lg backdrop-blur-md">
              <BookOpen className="w-4 h-4" />
              <span>فهرس خطوات الدليل</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
              مسارك المباشر <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-[#FFE58F] to-[#D4A017]">لتكبير مبيعاتك وأرباحك الصافية</span>
            </h2>
            <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              11 فصل عملي ومباشر، يعلمك أصول السوق والتسويق والتوصيل بالعراق خطوة بخطوة حتى تضمن نتائج ممتازة بمشروعك.
            </p>
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#D4A017]/50 to-transparent mx-auto mt-6" />
          </motion.div>

          {/* Tangible Outcomes Highlight Card - Premium Redesign */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="mb-12 sm:mb-24 max-w-5xl mx-auto relative z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/10 via-transparent to-[#0D1B56]/40 rounded-2xl sm:rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-gradient-to-b from-[#0F1735]/80 to-[#040B24]/90 backdrop-blur-2xl border border-[#D4A017]/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-14 text-right shadow-[0_0_50px_rgba(212,160,23,0.15)] overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D4A017]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-5 mb-6 sm:mb-14 relative z-10">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/5 rounded-xl sm:rounded-2xl border border-[#D4A017]/30 shadow-[0_0_30px_rgba(212,160,23,0.2)]">
                  <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-[#F0C040]" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white drop-shadow-md leading-tight">
                  ليش هذا النظام يعتبر <span className="text-[#F0C040]">طوق النجاة</span> لمشروعك؟
                </h3>
                <p className="text-xs sm:text-base md:text-lg text-white/70 max-w-3xl font-light leading-relaxed">
                  إحنا ما جمعنا بس معلومات نظرية.. إحنا صممنا <strong className="text-white">"ماكينة تسويقية متكاملة"</strong> تعالج أعمق مشاكل التجارة الإلكترونية، حتى تنقل مشروعك من دوامة التخمين والنزيف المالي لمرحلة الأرباح والأرقام المضبوطة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {[
                  { title: "تحويل الرسايل الهواية لمبيعات", desc: "بطل تخسر الزبائن اللي يسألون 'ببيش' ويختفون. استخدم سكريبتاتنا الجاهزة حتى تقفل البيعة فوراً.", icon: "💬" },
                  { title: "وكف النزيف المالي مال المرتجعات", desc: "لا تدفع كروة شحن للراجع بعد اليوم. طبق نظام التأكيد الصارم ونزل نسبة المرتجع لأقل من 10%.", icon: "🛡️" },
                  { title: "تخلص من الإعلانات الفاشلة", desc: "قبل لا تطلق أي حملة، استخدم أدواتنا حتى تحسب الأرباح المتوقعة، واعرف بالضبط شوكت تزيد ميزانية الإعلان وشوكت تطفيه.", icon: "📉" },
                  { title: "اغلب منافسيك بصمت", desc: "تعلم زوايا تسويقية ما يستخدمها 95% من البيجات، وخلي الزبون يحس إن منتجك هو الخيار الوحيد كدامه.", icon: "🚀" }
                ].map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    key={idx} 
                    className="flex items-start gap-5 p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 hover:bg-gradient-to-br hover:from-white/[0.05] hover:to-[#D4A017]/10 hover:border-[#D4A017]/40 transition-all duration-500 group shadow-lg hover:shadow-[0_10px_30px_rgba(212,160,23,0.1)] hover:-translate-y-1 cursor-default"
                  >
                    <div className="text-4xl shrink-0 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">{item.icon}</div>
                    <div>
                      <h4 className="text-lg font-black text-[#F0C040] mb-2">{item.title}</h4>
                      <p className="text-sm text-white/70 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chapter Category Filter Bar */}
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center justify-start sm:justify-center gap-2 pb-3 sm:pb-0 mb-10 relative z-10 px-1 -mx-2 sm:mx-0">
            {[
              { id: "all", label: "جميع الفصول (١١)", icon: "📚" },
              { id: "foundation", label: "١. التأسيس والسوق", icon: "🏛️" },
              { id: "marketing", label: "٢. الإعلانات والمحتوى", icon: "🎯" },
              { id: "sales", label: "٣. المبيعات والتوصيل", icon: "💬" },
              { id: "scaling", label: "٤. التحليل والتوسع", icon: "📈" }
            ].map((tab) => {
              const isActive = chapterFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setChapterFilter(tab.id)}
                  className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer border whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-[#D4A017] to-amber-500 text-[#040B24] border-[#D4A017] font-black shadow-lg shadow-[#D4A017]/25 scale-105"
                      : "bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chapters Bento/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredChapters.map((chap) => {
              const originalIndex = chaptersList.findIndex((c) => c.id === chap.id);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (originalIndex % 3) * 0.08 }}
                  key={chap.id}
                  onClick={() => handleScrollToSection(chap.id)}
                  className="group p-8 rounded-[2rem] bg-gradient-to-b from-[#0F1735]/70 via-[#0A122E]/80 to-[#040B24]/95 backdrop-blur-md border border-white/10 hover:border-[#D4A017]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(212,160,23,0.25)] relative cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/0 via-transparent to-[#D4A017]/0 group-hover:from-[#D4A017]/10 group-hover:to-transparent transition-colors duration-500" />
                  <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#D4A017]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#D4A017]/25 transition-colors duration-500" />
                  
                  {/* Top Layer & Icon Header */}
                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/5 flex items-center justify-center border border-[#D4A017]/40 font-mono font-black text-[#F0C040] text-lg group-hover:bg-[#D4A017] group-hover:text-[#040B24] transition-all duration-500 shadow-[0_0_20px_rgba(212,160,23,0.25)]">
                        {originalIndex + 1}
                      </div>
                      <span className="text-4xl transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 drop-shadow-xl">{chap.icon}</span>
                    </div>

                    {/* Category Layer Tag */}
                    {chap.layer && (
                      <span className="inline-block px-3 py-1 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/30 text-[10px] text-[#F0C040] font-extrabold mb-3">
                        {chap.layer}
                      </span>
                    )}

                    {/* Info and Titles */}
                    <div className="relative z-10">
                      <span className="text-xs text-[#F0C040] uppercase font-black tracking-widest mb-1.5 block opacity-90 drop-shadow-sm">
                        {chap.number}
                      </span>
                      
                      <h3 className="text-lg sm:text-xl font-black text-white mb-3 group-hover:text-[#F0C040] transition-colors duration-300 leading-tight">
                        {chap.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal line-clamp-3 mb-6">
                        {chap.description}
                      </p>
                    </div>
                  </div>

                  {/* Read Time & Action footer */}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-[#F0C040] font-bold relative z-10 group-hover:border-[#D4A017]/30 transition-colors mt-auto">
                    <span className="text-[11px] text-white/50 font-mono flex items-center gap-1">
                      ⏱️ {chap.readTime || "قراءة تطبيقية"}
                    </span>
                    <span className="group-hover:tracking-wider transition-all duration-500 drop-shadow-sm flex items-center gap-1 text-[#F0C040]">
                      تصفح الفصل
                      <ArrowRight className="w-4 h-4 transform rotate-180 group-hover:-translate-x-2 transition-transform duration-500" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* VIZION OS INTEGRATED SOFTWARE SUITE */}
        <section
          id="vizion-growth-suite"
          className="py-12 md:py-24 border-b border-white/5 scroll-mt-20 relative"
        >
          <VizionGrowthSuite />
        </section>

        {/* ELITE SECRETS SECTION */}
        <section
          id="elite-secrets-section"
          className="py-12 md:py-24 border-b border-white/5 scroll-mt-20 relative"
        >
          <div id="iraqi-market-section" className="scroll-mt-20" />
          <IraqiInsights />
        </section>

        {/* SUBSCRIPTION PLANS SECTION (PRICING TIERS) - ONLY FOR FREE TRIAL USERS */}
        {isFreeTrialUser(userCode) && (
          <section
            id="pricing-section"
            className="py-6 md:py-12 border-b border-white/5 scroll-mt-20 relative"
          >
            <PricingSection onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} />
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
      <footer className="bg-gradient-to-b from-[#0F1735]/40 to-[#040B24] border-t border-[#D4A017]/10 mt-12 sm:mt-24 pb-28 lg:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0D1B56]/10 -z-10" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4A017]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-right">
            
            {/* Logo and info */}
            <div className="space-y-4 max-w-sm relative z-10">
              <span className="text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3 drop-shadow-md">
                <Sparkles className="w-6 h-6 text-[#F0C040]" />
                <span className="tracking-tight">فيزيون • Vizion</span>
              </span>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                نظام التشغيل المتكامل المخصص لإدارة المبيعات والتسويق الإلكتروني للمشاريع بالأرقام والتحليل والقضاء عالمرتجعات.
              </p>
            </div>

            {/* Links and trigger portal */}
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm font-bold text-[#F0C040] relative z-10">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer drop-shadow-sm"
              >
                الرجوع للبداية
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => handleScrollToSection("contents-section")}
                className="hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer drop-shadow-sm"
              >
                فهرس الفصول
              </button>
            </div>

          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/20 to-transparent my-10" />

          {/* Copyright and signature */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-white/40 text-center relative z-10 font-light">
            <span>© 2026 فيزيون • Vizion. جميع الحقوق محفوظة للنخبة المشتركة.</span>
            <span className="flex items-center gap-1.5 bg-white/[0.02] px-4 py-2 rounded-full border border-white/5 shadow-inner">
              انصنع بحب للمسوقين المحترفين 
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse-slow" />
            </span>
          </div>

        </div>
      </footer>

      {/* ADMIN CONTROL MODAL PANEL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCodesChange={() => {
          // Trigger force-reload logic if necessary
        }}
      />

      {/* VIZION AI ADVISOR CHATBOT MODAL */}
      <VizionAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        isVip={isVipUser(userCode)}
        userCode={userCode}
        onUpgradeSuccess={(newVipCode) => {
          setUserCode(newVipCode);
          localStorage.setItem("sales_guide_user_code", newVipCode);
        }}
      />

      {/* FREE TRIAL UPGRADE PAYWALL MODAL */}
      <FreeTrialPaywallModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userCode={userCode}
        onUpgradeSuccess={(newCode) => {
          setUserCode(newCode);
          localStorage.setItem("sales_guide_user_code", newCode);
        }}
      />

      {/* HEAVENLY WELCOME INTRO MODAL */}
      <WelcomeIntroModal
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
      />

      {/* FLOATING VIZION AI ADVISOR TRIGGER BUTTON (Desktop only, since MobileBottomNav handles mobile) */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-45">
        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="group px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0F1735] via-[#0A122E] to-[#040B24] border border-[#D4A017]/60 hover:border-[#D4A017] text-white font-black text-xs shadow-[0_10px_35px_rgba(212,160,23,0.35)] hover:shadow-[0_15px_45px_rgba(212,160,23,0.55)] transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A017] to-amber-600 flex items-center justify-center text-[#040B24] font-bold shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            {isVipUser(userCode) ? (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#040B24]" />
            ) : (
              <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-[#F0C040] text-xs font-black leading-none flex items-center gap-1">
              فيزيون بوت
              {isVipUser(userCode) ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ) : (
                <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 text-[8px] rounded font-mono">VIP</span>
              )}
            </div>
            <div className="text-[10px] text-white/70 font-light mt-1">
              {isVipUser(userCode) ? "المستشار الرقمي الذكي" : "خاص بأعضاء VIP 👑"}
            </div>
          </div>
        </button>
      </div>

      {/* FLOATING BACK TO TOP BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-45 w-11 h-11 rounded-full bg-black/60 border border-[#D4A017]/40 hover:border-[#D4A017] backdrop-blur-md text-[#F0C040] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="الرجوع للبداية"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        activeSection={activeSection}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        userCode={userCode}
      />

    </div>
    </SensoryProvider>
  );
}