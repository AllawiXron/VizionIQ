/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, Settings, LogOut, Flame, Bot, Sparkles, Crown } from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { isFreeTrialUser, isVipUser } from "./LockScreen";
import { SoundToggleButton } from "./SoundToggleButton";

interface NavbarProps {
  activeSection: string;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenAdvisor?: () => void;
  onOpenUpgrade?: () => void;
  userCode: string;
}

export default function Navbar({ activeSection, onLogout, onOpenAdmin, onOpenAdvisor, onOpenUpgrade, userCode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to style navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 70; // Height of fixed navbar
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

  const navItems = [
    { label: "١ السوق", id: "chapter1" },
    { label: "٢ المشاكل", id: "chapter2" },
    { label: "٣ الإعدادات", id: "chapter3" },
    { label: "٤ الحملة", id: "chapter4" },
    { label: "٥ التصميم", id: "chapter5" },
    { label: "٦ الثقة", id: "chapter6" },
    { label: "٧ الدفع", id: "chapter7" },
    { label: "٨ الأداء", id: "chapter8" },
    { label: "٩ الخطة", id: "chapter9" },
    { label: "١٠ رسائل", id: "ch10" },
    { label: "١١ متقدم", id: "ch11" }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 h-16 z-40 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#040B24]/85 backdrop-blur-2xl border-[#D4A017]/30 shadow-[0_10px_30px_rgba(4,11,36,0.8)]"
            : "bg-[#040B24]/40 backdrop-blur-md border-white/5"
        }`}
        id="main-navbar"
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text.transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-[#D4A017] to-[#F0C040] font-black text-sm md:text-base cursor-pointer tracking-wider hover:opacity-90 transition-opacity"
          >
            <span className="text-xl drop-shadow-[0_0_10px_#F0C040]">⚡</span>
            <span className="text-[#F0C040]">فيزيون • Vizion</span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer relative ${
                    isActive
                      ? "text-[#F0C040]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <span className="absolute inset-0 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg -z-10 animate-[pulse_2s_infinite]" />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Controls and Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Audio ASMR Sensory Sound Toggle */}
            <SoundToggleButton variant="compact" />

            {/* AI Advisor Button */}
            {onOpenAdvisor && (
              <button
                onClick={onOpenAdvisor}
                className="px-3 py-1.5 bg-gradient-to-r from-[#D4A017] to-amber-500 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-lg shadow-[#D4A017]/25 hover:scale-105 active:scale-95"
                title="المستشار الرقمي المباشر الذكي"
              >
                <Bot className="w-4 h-4" />
                <span>فيزيون بوت</span>
              </button>
            )}

            {/* Pricing Section Link - ONLY FOR FREE TRIAL USERS */}
            {isFreeTrialUser(userCode) && (
              <button
                onClick={() => handleScrollTo("pricing-section")}
                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-amber-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black"
                title="باقات واسعار الاشتراك"
              >
                <span>👑</span>
                <span>الاشتراكات</span>
              </button>
            )}

            {/* Secrets trigger button */}
            <button
              onClick={() => handleScrollTo("vizion-growth-suite")}
              className="p-1.5 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/40 hover:border-[#D4A017]/80 rounded-xl text-[#F0C040] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black shadow shadow-[#D4A017]/10"
              title="نظام تشغيل وأدوات فيزيون التفاعلية"
            >
              <span>⚡</span>
              <span>أدوات Vizion</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="خروج وقفل الدليل"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>

            {/* Free Trial Upgrade Button or User Tag */}
            {isFreeTrialUser(userCode) ? (
              <button
                onClick={onOpenUpgrade}
                className="px-3 py-1.5 bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 hover:scale-105 rounded-xl text-[#040B24] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-lg shadow-[#D4A017]/20"
                title="اضغط للترقية إلى الحساب الكامل"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>ترقية الكورس ⚡</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono font-medium">
                عضو: {userCode}
              </span>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <div className="flex items-center gap-2 lg:hidden">
            <SoundToggleButton variant="compact" />

            {isFreeTrialUser(userCode) ? (
              <button
                onClick={onOpenUpgrade}
                className="px-2.5 py-1.5 bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-[#D4A017]/20"
                title="ترقية الحساب إلى النسخة الكاملة"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>ترقية ⚡</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono font-bold">
                {userCode}
              </span>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 active:scale-95 transition-all cursor-pointer"
              aria-label="القائمة المنسدلة"
            >
              {isOpen ? <X className="w-5 h-5 text-[#F0C040]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Fullscreen Mobile Dropdown Drawer Menu */}
      <div
        className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-[#040B24]/98 backdrop-blur-3xl border-t border-[#D4A017]/30 lg:hidden transition-all duration-300 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto dir-rtl ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="space-y-4 max-w-lg mx-auto w-full">
          
          {/* User Account & Subscription Status Header Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center text-[#F0C040]">
                {isFreeTrialUser(userCode) ? <Sparkles className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-white">
                  {isFreeTrialUser(userCode) ? "حساب تجريبي مجاني" : `عضوية VIP : ${userCode}`}
                </div>
                <div className="text-[10px] text-white/50 font-light">
                  {isFreeTrialUser(userCode) ? "رمز الوصول: free#1" : "وصول كامل لكافة الأدوات"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isFreeTrialUser(userCode) && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenUpgrade?.();
                  }}
                  className="px-2.5 py-1.5 bg-[#D4A017] text-[#040B24] rounded-lg text-[10px] font-black hover:bg-amber-400 transition-colors shadow-sm"
                >
                  ترقية
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>

          {/* Quick Action Cards Grid (2 Columns) */}
          <div className="grid grid-cols-2 gap-2">
            {/* AI Advisor Button */}
            {onOpenAdvisor && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdvisor();
                }}
                className="p-3 rounded-2xl bg-gradient-to-br from-[#D4A017]/20 via-amber-500/10 to-[#040B24] border border-[#D4A017]/40 text-right space-y-1.5 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Bot className="w-5 h-5 text-[#F0C040]" />
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">ذكاء اصطناعي</span>
                </div>
                <div className="text-xs font-black text-[#F0C040]">فيزيون بوت</div>
                <div className="text-[10px] text-white/60 font-light">المستشار المباشر</div>
              </button>
            )}

            {/* Growth Tools Button */}
            <button
              onClick={() => handleScrollTo("vizion-growth-suite")}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1.5 active:scale-95 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-base">⚡</span>
                <span className="text-[9px] bg-[#D4A017]/20 text-[#F0C040] px-1.5 py-0.5 rounded font-mono">١٣ أداة</span>
              </div>
              <div className="text-xs font-black text-white">منظومة الأدوات</div>
              <div className="text-[10px] text-white/60 font-light">الحسابات والتحليل</div>
            </button>

            {/* Subscriptions Pricing Button (for Free Trial) */}
            {isFreeTrialUser(userCode) && (
              <button
                onClick={() => handleScrollTo("pricing-section")}
                className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 text-right space-y-1.5 active:scale-95 transition-all group cursor-pointer col-span-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-[#F0C040]">
                    <Crown className="w-4 h-4 text-[#F0C040]" />
                    <span>باقات واسعار الاشتراك المتاحة</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#D4A017] text-[#040B24] px-2 py-0.5 rounded-full">29,000 - 49,000 د.ع</span>
                </div>
                <div className="text-[10px] text-amber-200/80 font-light">اشتراك مدى الحياة بدون تجديد شهري</div>
              </button>
            )}

            {/* Elite Secrets Button */}
            <button
              onClick={() => handleScrollTo("elite-secrets-section")}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right space-y-1.5 active:scale-95 transition-all group cursor-pointer col-span-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>حقائق وأسرار التجار</span>
                </span>
                <span className="text-[9px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded">سيناريوهات حقيقية</span>
              </div>
            </button>
          </div>

          {/* Chapters Index Grid Header */}
          <div className="pt-2">
            <div className="text-[11px] text-white/50 font-bold mb-2 flex items-center justify-between px-1">
              <span>فهرس فصول الدليل (١١ فصل):</span>
              <span className="text-[10px] text-[#F0C040]">اضغط للتنقل السريع</span>
            </div>

            {/* Grid of Chapter Pills */}
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScrollTo(item.id)}
                    className={`p-2.5 rounded-xl text-right text-xs font-bold border transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-[#D4A017]/20 border-[#D4A017] text-[#F0C040] shadow-md shadow-[#D4A017]/10"
                        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-white/80"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F0C040] animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-4 pb-28">
            <button
              onClick={onLogout}
              className="w-full py-3 px-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold active:scale-95 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج وقفل التطبيق</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
