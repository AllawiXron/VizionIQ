/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, Settings, LogOut, Flame } from "lucide-react";
import { chaptersList } from "../data/chaptersData";

interface NavbarProps {
  activeSection: string;
  onLogout: () => void;
  onOpenAdmin: () => void;
  userCode: string;
}

export default function Navbar({ activeSection, onLogout, onOpenAdmin, userCode }: NavbarProps) {
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
            ? "bg-[#040B24]/90 backdrop-blur-md border-white/10 shadow-lg"
            : "bg-transparent border-transparent"
        }`}
        id="main-navbar"
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-[#F0C040] font-black text-sm md:text-base cursor-pointer tracking-wider"
          >
            <span className="text-xl">⚡</span>
            <span>فيزيون • Vizion</span>
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
            {/* Secrets trigger button */}
            <button
              onClick={() => handleScrollTo("vizion-growth-suite")}
              className="p-1.5 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/40 hover:border-[#D4A017]/80 rounded-xl text-[#F0C040] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black shadow shadow-[#D4A017]/10"
              title="نظام تشغيل وأدوات فيزيون التفاعلية"
            >
              <span>⚡</span>
              <span>أدوات Vizion OS</span>
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

            {/* User Code Tag */}
            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono font-medium">
              عضو: {userCode}
            </span>
          </div>

          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick user code display */}
            <span className="px-2 py-0.5 text-[9px] bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-md font-mono">
              {userCode}
            </span>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Fullscreen Mobile Dropdown Overlay Menu */}
      <div
        className={`fixed inset-x-0 bottom-0 top-16 z-30 bg-[#040B24] border-t border-white/10 lg:hidden transition-all duration-300 flex flex-col justify-between p-6 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        }`}
      >
        <div className="space-y-3 overflow-y-auto max-h-[60vh] no-scrollbar">
          <span className="text-[10px] text-white/40 block font-bold tracking-wider mr-2 uppercase">فهرس فصول الدليل:</span>
          
          {/* Mobile Elite Secrets Button */}
          <button
            onClick={() => handleScrollTo("elite-secrets-section")}
            className="w-full p-4 mb-2 bg-gradient-to-r from-[#D4A017]/15 to-amber-500/5 hover:from-[#D4A017]/25 hover:to-amber-500/10 border border-[#D4A017]/30 text-[#F0C040] hover:text-white rounded-xl text-right text-xs font-black transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>💡</span>
              <span>حقائق يكتشفها التجار بعد ما يخسرون</span>
            </span>
            <span className="bg-[#D4A017] text-[#040B24] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">مفتوح</span>
          </button>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`w-full p-3.5 rounded-xl text-right text-xs font-bold border transition-all flex items-center justify-between ${
                  isActive
                    ? "bg-[#D4A017]/10 border-[#D4A017] text-[#F0C040]"
                    : "bg-white/[0.02] border-white/5 text-white/80"
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="text-[#F0C040] text-xs">●</span>}
              </button>
            );
          })}
        </div>

        {/* Mobile controls */}
        <div className="space-y-3 pt-6 border-t border-white/15">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
          <div className="text-center text-[10px] text-white/30 font-light mt-2">
            تم تسجيل الدخول برمز {userCode} بنجاح.
          </div>
        </div>
      </div>
    </>
  );
}
