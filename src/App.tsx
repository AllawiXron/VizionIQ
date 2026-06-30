/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowUp, BookOpen, Settings, LogOut, ShieldAlert, Sparkles, Star, Smartphone, ShieldCheck, Heart } from "lucide-react";
import { chaptersList } from "./data/chaptersData";

// Import modular components
import LockScreen from "./components/LockScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChapterView from "./components/ChapterView";
import AdminPanel from "./components/AdminPanel";
import IraqiInsights from "./components/IraqiInsights";
import VizionGrowthSuite from "./components/VizionGrowthSuite";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [activeSection, setActiveSection] = useState("hero-section");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem("sales_guide_user_token");
    const sessionCode = localStorage.getItem("sales_guide_user_code");
    
    if (sessionToken === "true" && sessionCode) {
      setIsLoggedIn(true);
      setUserCode(sessionCode);
    }
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
    
    // Smooth scroll to top on login
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج وقفل الدليل الرقمي؟")) {
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
    return <LockScreen onSuccess={handleLoginSuccess} />;
  }

  return (
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
        userCode={userCode}
      />

      {/* HERO SECTION */}
      <Hero />

      {/* MAIN WEBSITE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-16">
        
        {/* CONTENTS TABLE SECTION */}
        <section
          id="contents-section"
          className="py-8 md:py-16 border-b border-white/5 scroll-mt-20 relative"
        >
          {/* Header Title */}
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#F0C040]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>فهرس المعرفة المنهجية</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              اكتشف ما يحتويه البرنامج
            </h2>
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto font-light leading-relaxed">
              ١١ فصلاً مرتبة خطوة بخطوة، حتى تبني مشروعك بطريقة صح وتحقق مبيعات أكثر بدون تخمين وعشوائية.
            </p>
            <div className="w-16 h-[2px] bg-[#D4A017] mx-auto mt-4" />
          </div>

          {/* Tangible Outcomes Highlight Card */}
          <div className="mb-12 glass-panel border border-[#D4A017]/30 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto text-right space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2 mb-2 border-b border-white/10 pb-3">
              <span>🎯</span>
              <span className="text-[#F0C040]">شنو ممكن تستفاد من البرنامج؟:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>حول نسبة أكبر من الرسائل إلى طلبات حقيقية:</strong>تعرف شلون تميز بين الشخص الجاد والفضولي، وشلون تتعامل مع الرسائل بطريقة تزيد فرص الشراء.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>قلل عدد الناس اللي تسأل عن السعر وتختفي:</strong>افهم شنو الأسباب اللي تخلي الزبون يتردد، وشلون تعرض منتجك بطريقة تخلي قرار الشراء أسهل.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>حسن نتائج إعلاناتك بنفس الميزانية:</strong>تعلم شلون تكتب عرض أفضل، وتصمم محتوى يجذب الناس المهتمة فعلاً بمنتجك.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>اعرف بالأرقام ليش إعلانك نجح أو فشل:</strong>بدل التخمين، تعلم شلون تقرأ الأرقام والنتائج حتى تعرف شنو اللي يحتاج تعديل.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>تجنب صرف فلوس على حملات نتائجها ضعيفة:</strong>خطط لحملاتك بشكل أوضح، واعرف إذا الحملة تستاهل تصرف عليها قبل ما تزيد ميزانيتها.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <p className="text-xs text-white/90 leading-relaxed"><strong>اعرف شكد ممكن تصرف وشكد ممكن تربح:</strong>استخدم الأدوات التفاعلية حتى تخطط لمصاريفك وأرباحك المتوقعة بصورة أوضح.</p>
              </div>
            </div>
          </div>

          {/* Chapters Bento/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chaptersList.map((chap, index) => (
              <div
                key={chap.id}
                onClick={() => handleScrollToSection(chap.id)}
                className="group p-6 rounded-2xl glass-panel border border-white/5 hover:border-[#D4A017]/40 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] shadow-lg relative cursor-pointer overflow-hidden"
              >
                {/* Chapter Index Bubble */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center border border-[#D4A017]/20 font-mono font-bold text-[#F0C040] text-sm group-hover:bg-[#D4A017] group-hover:text-[#040B24] transition-all">
                    {index + 1}
                  </div>
                  <span className="text-2xl transform group-hover:scale-110 transition-transform">{chap.icon}</span>
                </div>

                {/* Info and Titles */}
                <span className="text-[10px] text-[#F0C040] uppercase font-bold tracking-wider mb-1 block">
                  {chap.number}
                </span>
                
                <h3 className="text-base font-extrabold text-white mb-2 group-hover:text-[#F0C040] transition-colors leading-tight">
                  {chap.title}
                </h3>
                
                <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-3">
                  {chap.description}
                </p>

                {/* Action button inside card */}
                <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center text-[10px] text-[#F0C040] font-semibold">
                  <span>ابدأ قراءة المنهج العلمي</span>
                  <span className="group-hover:translate-x-[-4px] transition-transform">➔</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VIZION OS INTEGRATED SOFTWARE SUITE */}
        <section
          id="vizion-growth-suite"
          className="py-8 md:py-16 border-b border-white/5 scroll-mt-20 relative"
        >
          <VizionGrowthSuite />
        </section>

        {/* ELITE SECRETS SECTION */}
        <section
          id="elite-secrets-section"
          className="py-8 md:py-16 border-b border-white/5 scroll-mt-20 relative"
        >
          <IraqiInsights />
        </section>

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
      <footer className="bg-[#040B24] border-t border-white/10 mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0D1B56]/15 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-right">
            
            {/* Logo and info */}
            <div className="space-y-3 max-w-sm">
              <span className="text-xl md:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
                <span>⚡</span>
                <span>فيزيون • Vizion</span>
              </span>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                نظام التشغيل المتكامل المخصص لإدارة المبيعات والتسويق الإلكتروني للمشاريع العراقية بالأرقام والتحليل ومحاربة المرتجعات.
              </p>
            </div>

            {/* Links and trigger portal */}
            <div className="flex flex-wrap justify-center md:justify-end gap-3.5 text-xs font-bold text-[#F0C040]">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                العودة للقمة
              </button>
              <span>·</span>
              <button
                onClick={() => handleScrollToSection("contents-section")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                فهرس الفصول
              </button>

            </div>

          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

          {/* Copyright and signature */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-white/30 text-center">
            <span>© 2026 فيزيون • Vizion. جميع الحقوق محفوظة للنخبة المسجلة.</span>
            <span className="flex items-center gap-1">
              صُنع بحب في العراق والوطن العربي للمسوقين المحترفين <Heart className="w-3 h-3 text-red-500 fill-red-500" />
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

      {/* FLOATING BACK TO TOP BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 left-6 z-45 w-11 h-11 rounded-full bg-black/40 border border-[#D4A017]/30 hover:border-[#D4A017] backdrop-blur-md text-[#F0C040] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="العودة للقمة"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

    </div>
  );
}
