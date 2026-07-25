import React from "react";
import { BookOpen, Wrench, Bot, Crown, Sparkles, Flame } from "lucide-react";
import { isFreeTrialUser, isVipUser } from "./LockScreen";

interface MobileBottomNavProps {
  activeSection: string;
  onOpenAdvisor: () => void;
  onOpenAdmin?: () => void;
  userCode?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onOpenAdvisor,
  userCode = "",
}) => {
  const isFreeTrial = isFreeTrialUser(userCode);
  const isVip = isVipUser(userCode);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 70;
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

  const isChaptersActive = activeSection === "chapters-grid-section" || activeSection.startsWith("chapter") || activeSection.startsWith("ch");
  const isToolsActive = activeSection === "vizion-growth-suite";
  const isPricingActive = activeSection === "pricing-section";
  const isSecretsActive = activeSection === "elite-secrets-section";

  return (
    <div className="lg:hidden fixed bottom-2 inset-x-2 z-50 max-w-lg mx-auto dir-rtl pointer-events-none">
      <div className="pointer-events-auto bg-[#040B24]/92 backdrop-blur-2xl border border-[#D4A017]/40 rounded-2xl px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-1">
        
        {/* 1. Chapters Tab */}
        <button
          onClick={() => scrollToSection("chapters-grid-section")}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 relative ${
            isChaptersActive
              ? "text-[#F0C040] bg-[#D4A017]/15 border border-[#D4A017]/30"
              : "text-white/70 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <BookOpen className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isChaptersActive ? "scale-110 text-[#F0C040]" : "text-white/70"}`} />
          <span className="text-[10px] font-black mt-1 leading-none">
            الفصول
          </span>
        </button>

        {/* 2. Tools Suite Tab */}
        <button
          onClick={() => scrollToSection("vizion-growth-suite")}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 relative ${
            isToolsActive
              ? "text-[#F0C040] bg-[#D4A017]/15 border border-[#D4A017]/30"
              : "text-white/70 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Wrench className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isToolsActive ? "scale-110 text-amber-400" : "text-white/70"}`} />
          <span className="text-[10px] font-black mt-1 leading-none">
            الأدوات
          </span>
        </button>

        {/* 3. Center AI Advisor Launcher */}
        <button
          onClick={onOpenAdvisor}
          className="flex-1 flex flex-col items-center justify-center -mt-4 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#F0C040] via-[#D4A017] to-amber-600 shadow-lg shadow-[#D4A017]/30 group-hover:shadow-[#D4A017]/60 transition-all duration-300">
            <div className="w-11 h-11 rounded-[14px] bg-[#040B24] flex items-center justify-center text-[#F0C040] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4A017]/30 to-transparent animate-pulse" />
              <Bot className="w-5 h-5 relative z-10 text-[#F0C040]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
          <span className="text-[10px] font-black text-[#F0C040] mt-0.5 leading-none flex items-center gap-0.5">
            المستشار
          </span>
        </button>

        {/* 4. Subscriptions or Secrets Tab */}
        {isFreeTrial ? (
          <button
            onClick={() => scrollToSection("pricing-section")}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 relative ${
              isPricingActive
                ? "text-[#F0C040] bg-[#D4A017]/25 border border-[#D4A017]"
                : "text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0C040] animate-bounce" />
            <span className="text-[10px] font-black mt-1 leading-none text-[#F0C040]">
              الاشتراكات
            </span>
          </button>
        ) : (
          <button
            onClick={() => scrollToSection("elite-secrets-section")}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 relative ${
              isSecretsActive
                ? "text-[#F0C040] bg-[#D4A017]/15 border border-[#D4A017]/30"
                : "text-white/70 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Flame className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isSecretsActive ? "scale-110 text-amber-400" : "text-white/70"}`} />
            <span className="text-[10px] font-black mt-1 leading-none">
              الأسرار
            </span>
          </button>
        )}

      </div>
    </div>
  );
};

