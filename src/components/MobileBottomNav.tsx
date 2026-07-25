import React from "react";
import { BookOpen, Wrench, Bot } from "lucide-react";

interface MobileBottomNavProps {
  activeSection: string;
  onOpenAdvisor: () => void;
  onOpenAdmin?: () => void;
  userCode?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAdvisor,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 60;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#040B24]/90 backdrop-blur-2xl border-t border-[#D4A017]/30 px-4 py-2 shadow-[0_-12px_35px_rgba(0,0,0,0.85)] dir-rtl">
      <div className="grid grid-cols-3 items-center max-w-xs sm:max-w-sm mx-auto text-center gap-2">
        {/* 1. Chapters */}
        <button
          onClick={() => scrollToSection("chapters-grid-section")}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-white/70 hover:text-[#F0C040] hover:bg-white/[0.04] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="p-1.5 rounded-xl bg-white/[0.03] group-hover:bg-[#D4A017]/10 transition-colors">
            <BookOpen className="w-5 h-5 text-[#F0C040]" />
          </div>
          <span className="text-[11px] font-black mt-1 leading-tight text-white/80 group-hover:text-[#F0C040]">
            الفصول
          </span>
        </button>

        {/* 2. Vizion Bot AI (Center Highlighted) */}
        <button
          onClick={onOpenAdvisor}
          className="flex flex-col items-center justify-center -mt-6 cursor-pointer group"
        >
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#F0C040] via-[#D4A017] to-amber-600 shadow-xl shadow-[#D4A017]/30 group-hover:shadow-[#D4A017]/50 group-active:scale-95 transition-all duration-300">
            <div className="w-12 h-12 rounded-[14px] bg-[#040B24] flex items-center justify-center text-[#F0C040] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4A017]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bot className="w-6 h-6 animate-pulse relative z-10 text-[#F0C040]" />
            </div>
          </div>
          <span className="text-[11px] font-black text-[#F0C040] mt-1 leading-tight flex items-center gap-1 drop-shadow-sm">
            المستشار
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </span>
        </button>

        {/* 3. Tools Suite */}
        <button
          onClick={() => scrollToSection("vizion-growth-suite")}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-white/70 hover:text-[#F0C040] hover:bg-white/[0.04] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="p-1.5 rounded-xl bg-white/[0.03] group-hover:bg-[#D4A017]/10 transition-colors">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] font-black mt-1 leading-tight text-white/80 group-hover:text-[#F0C040]">
            الأدوات
          </span>
        </button>
      </div>
    </div>
  );
};
