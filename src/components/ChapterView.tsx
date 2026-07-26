/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle2, AlertTriangle, Lightbulb, Star, ShieldCheck, 
  MapPin, BookOpen, Layers, Zap, Play, FileText, Compass, 
  ChevronLeft, ArrowRight, Sparkles, HelpCircle, CheckSquare, Wrench,
  Lock, Crown, KeyRound
} from "lucide-react";
import { isVipUser, isFreeTrialUser } from "./LockScreen";
import { chaptersList, chaptersDetailedMap } from "../data/chaptersData";
import { caseStudiesList } from "../data/caseStudiesData";
import { swipeFilesList } from "../data/swipeFilesData";
import { videoLessonsList } from "../data/videoLessonsData";

import FadeInUp from "./FadeInUp";

// Interactive Tools
import RoiCalculator from "./RoiCalculator";
import AdSimulator from "./AdSimulator";
import ScriptSimulator from "./ScriptSimulator";
import ThirtyDayPlan from "./ThirtyDayPlan";
import AdvancedCalculatorSuite from "./AdvancedCalculatorSuite";
import DecisionTreeViewer from "./DecisionTreeViewer";
import VideoPlayerModule from "./VideoPlayerModule";

interface ChapterViewProps {
  key?: string;
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

export default function ChapterView({ id, number, title, subtitle, icon, description }: ChapterViewProps) {
  const [activeTab, setActiveTab] = useState<"framework" | "deepdive" | "casestudy" | "swipe" | "tools">("framework");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const detailedData = chaptersDetailedMap[id] || chaptersDetailedMap["chapter1"];
  const relatedCaseStudy = caseStudiesList.find((cs) => cs.chapterId === id) || caseStudiesList[0];
  const relatedVideo = videoLessonsList.find((v) => v.chapterId === id) || videoLessonsList[0];
  const relatedSwipeFiles = swipeFilesList.filter((s) => s.chapterId === id || s.category === "ad_copy").slice(0, 2);

  const chapterIndex = chaptersList.findIndex((c) => c.id === id);
  const prevChapter = chapterIndex > 0 ? chaptersList[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chaptersList.length - 1 ? chaptersList[chapterIndex + 1] : null;

  const userCode = typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") || "" : "";
  const isFreeTrial = isFreeTrialUser(userCode);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  const scrollToChapter = (chapterId: string) => {
    const element = document.getElementById(chapterId);
    if (element) {
      const offset = 70;
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && nextChapter) {
        scrollToChapter(nextChapter.id);
      } else if (deltaX > 0 && prevChapter) {
        scrollToChapter(prevChapter.id);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <section 
      id={id} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="py-8 sm:py-14 md:py-20 px-2 sm:px-4 md:px-0 border-b border-white/5 relative scroll-mt-20 sm:scroll-mt-24 overflow-hidden group touch-pan-y"
    >
      
      {/* Background Graphic Effect */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-[#D4A017]/10 to-transparent rounded-full blur-[100px] sm:blur-[140px] pointer-events-none transition-opacity duration-1000 opacity-60" />

      {/* Hero Chapter Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-[#0F1735] via-[#040B24] to-[#0A122E] rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-8 md:p-12 mb-6 sm:mb-10 overflow-hidden shadow-2xl border border-[#D4A017]/30 max-w-5xl mx-auto"
      >
        <div className="absolute top-0 right-0 w-1.5 sm:w-2.5 h-full bg-gradient-to-b from-[#F0C040] via-[#D4A017] to-amber-700" />
        
        {/* Mobile Swipe Hint Badge */}
        <div className="sm:hidden flex items-center justify-between bg-[#D4A017]/10 border border-[#D4A017]/25 px-2.5 py-1.5 rounded-xl text-[10px] text-[#F0C040] mb-3">
          <span className="flex items-center gap-1 font-semibold">
            <span>👆</span> اسحب يمنة ويسرة حتى تكلب بين الفصول
          </span>
          <span className="font-mono text-[9px] text-white/50">{chapterIndex + 1} / {chaptersList.length}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-3.5 sm:mb-6 relative z-10">
          <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 sm:p-5 bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/5 rounded-xl sm:rounded-2xl border border-[#D4A017]/40 shadow-inner backdrop-blur-md shrink-0 w-full sm:w-auto">
             <span className="text-[10px] sm:text-xs font-black text-[#F0C040] uppercase tracking-widest block">الفصل {number}</span>
             <span className="text-xl sm:text-5xl inline-block animate-pulse">{icon}</span>
          </div>

          <div className="space-y-1 sm:space-y-3 border-r-2 sm:border-r-4 border-[#D4A017]/40 pr-2.5 sm:pr-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/15 border border-[#D4A017]/30 text-[#F0C040] text-[10px] sm:text-xs font-bold">
                {detailedData.chapterNumber ? `الفصل ${detailedData.chapterNumber}` : number}
              </span>
              <span className="text-[10px] sm:text-xs text-white/50 font-mono">25-35 دقيقة قراءة وتطبيق عملي</span>
            </div>

            <h2 className="text-lg sm:text-3xl md:text-5xl font-black text-white leading-snug sm:leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-lg md:text-xl text-[#F0C040] font-extrabold leading-snug">
              {subtitle}
            </p>
          </div>
        </div>

        <p className="fluid-lead-text text-white/85 font-normal bg-white/[0.03] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 backdrop-blur-sm">
          {description}
        </p>

        {/* Chapter Internal Navigation Tabs */}
        <div className="space-y-2 pt-4 sm:pt-6 border-t border-white/10 mt-4 sm:mt-6">
          <div className="sm:hidden flex items-center justify-between text-[10px] text-white/60 font-mono px-1">
            <span className="font-bold text-[#F0C040]">تصفح أقسام الفصل:</span>
            <span className="text-white/40">اسحب يمنة ويسرة 👈</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar snap-x touch-pan-x">
            {[
              { id: "framework", label: "📘 الفكرة الأساسية وشلون تطبقها", icon: BookOpen },
              { id: "deepdive", label: "🔬 تفاصيل أكثر وأمثلة حقيقية", icon: Layers },
              { id: "casestudy", label: "💼 أمثلة من مشاريع حقيقية", icon: Sparkles },
              { id: "swipe", label: "📝 رسائل جاهزة للنسخ", icon: FileText },
              { id: "tools", label: "🧰 حاسبات وأدوات عملية", icon: Wrench }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-300 cursor-pointer border shrink-0 snap-start active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-[#F0C040] via-[#D4A017] to-amber-600 text-[#040B24] border-[#F0C040] font-black shadow-[0_0_20px_rgba(212,160,23,0.35)] scale-102"
                      : "bg-[#040B24]/70 text-white/70 hover:text-white border-white/10 hover:border-[#D4A017]/40 hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? "text-[#040B24]" : "text-[#F0C040]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* TAB CONTENT 1: CORE FRAMEWORK */}
      {activeTab === "framework" && (
        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-[#0A122E] border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-xl space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-3xl font-black text-[#F0C040] flex items-center gap-2.5 pb-2 border-b border-white/10">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-[#D4A017] shrink-0" />
              <span>{detailedData.coreFramework?.title || "الفكرة الأساسية لهذا الفصل"}</span>
            </h3>

            <p className="fluid-prose text-white/90 font-normal bg-white/5 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 max-readable-prose">
              {detailedData.coreFramework?.summary}
            </p>

            <div className="space-y-5 sm:space-y-8 pt-1">
              {detailedData.coreFramework?.sections?.map((sec, idx) => {
                const isLockedSection = isFreeTrial ? (id !== "chapter1" && id !== "chapter2" ? true : idx >= 1) : false;
                return (
                  <FadeInUp key={idx} delay={idx * 0.08}>
                    <div className="bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 space-y-3.5 sm:space-y-4 shadow-md relative overflow-hidden">
                      <h4 className="text-base sm:text-xl font-black text-white border-r-4 border-[#D4A017] pr-2.5 sm:pr-3 flex items-center justify-between">
                        <span>{sec.heading}</span>
                        {isLockedSection && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-black flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#F0C040]" />
                            <span>محتوى مقفول (نسخة تجريبية)</span>
                          </span>
                        )}
                      </h4>

                      {!isLockedSection ? (
                        <>
                          <p className="fluid-prose text-white/85 font-normal max-readable-prose">{sec.content}</p>

                          {sec.keyTakeaway && (
                            <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#F0C040] font-bold flex items-start gap-2.5 sm:gap-3">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-[#F0C040]" />
                              <span className="leading-relaxed">{sec.keyTakeaway}</span>
                            </div>
                          )}

                          {sec.bulletPoints && (
                            <ul className="space-y-2.5 pt-1 sm:pt-2">
                              {sec.bulletPoints.map((bp, bidx) => (
                                <li key={bidx} className="text-xs sm:text-sm text-white/80 flex items-start gap-2.5 leading-relaxed">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        /* Zeigarnik Effect Cliffhanger Paywall */
                        <div className="relative pt-2">
                          <p className="text-xs sm:text-sm text-white/40 blur-[3px] select-none leading-relaxed line-clamp-2">
                            {sec.content}
                          </p>
                          <div className="mt-3 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0F1735] via-[#121A3D] to-[#0F1735] border border-[#D4A017]/40 text-center space-y-3 shadow-2xl">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4A017]/20 border border-[#D4A017]/50 text-[#F0C040]">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <h5 className="text-sm sm:text-base font-black text-white">
                                الخطوات المضبوطة للتطبيق محميّة
                              </h5>
                              <p className="text-xs text-white/70 max-w-lg mx-auto font-light">
                                هذا الجزء بي الخطوات المضبوطة حتى توكف الراجع وتزيد مبيعاتك. ينفتحلك فوراً بالنسخة المدفوعة.
                              </p>
                            </div>
                            <button
                              onClick={triggerUpgradeModal}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-xs sm:text-sm shadow-lg shadow-[#D4A017]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                            >
                              <Crown className="w-4 h-4 text-[#040B24]" />
                              <span>افتح هذا القسم وكمل الكورس هسة ⚡</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FadeInUp>
                );
              })}
            </div>
          </div>

          {/* Action Steps & Common Mistakes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            
            {/* Action Steps Box */}
            <FadeInUp delay={0.1}>
              <div className="bg-[#0A122E] border border-emerald-500/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 space-y-4 shadow-xl h-full">
                <h4 className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>خطوات الشغل (شلون تطبق):</span>
                </h4>
                <div className="space-y-2.5 sm:space-y-3">
                  {detailedData.actionSteps?.map((st) => (
                    <div key={st.step} className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">خطوة {st.step}: {st.title}</span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded-md">{st.timeframe}</span>
                      </div>
                      <p className="text-xs text-white/60">{st.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* Common Mistakes Box */}
            <FadeInUp delay={0.2}>
              <div className="bg-[#0A122E] border border-red-500/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 space-y-4 shadow-xl h-full">
                <h4 className="text-sm sm:text-base font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>أغلاط دير بالك توكع بيها:</span>
                </h4>
                <div className="space-y-2.5 sm:space-y-3">
                  {detailedData.commonMistakes?.map((m, idx) => (
                    <div key={idx} className="bg-red-950/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-500/20 space-y-1">
                      <span className="text-xs font-bold text-red-300 block">⚠️ {m.mistake}</span>
                      <p className="text-xs text-white/60">{m.whyItFails}</p>
                      <div className="text-[11px] text-emerald-400 font-bold pt-1 border-t border-white/5">
                        💡 الحل: {m.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DEEP DIVE */}
      {activeTab === "deepdive" && (
        <div className="bg-[#0A122E] border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-xl space-y-8 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out] relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-black text-[#F0C040] flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Layers className="w-7 h-7 text-[#D4A017] shrink-0" />
              <span>{detailedData.deepDive?.title || "تفاصيل أكثر وشلون تطبقها"}</span>
            </div>
            {isFreeTrial && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#F0C040]" />
                <span>نسخة مجانية للتجربة</span>
              </span>
            )}
          </h3>

          <div className="space-y-6">
            {detailedData.deepDive?.sections?.map((sec, idx) => {
              const isLockedDeep = isFreeTrial && idx >= 1;
              return (
                <FadeInUp key={idx} delay={idx * 0.1}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4 relative">
                    <h4 className="text-base sm:text-xl font-bold text-white border-r-4 border-[#D4A017] pr-3">{sec.heading}</h4>
                    {!isLockedDeep ? (
                      <>
                        <p className="fluid-prose text-white/85 font-normal max-readable-prose">{sec.content}</p>
                        {sec.examples && (
                          <div className="bg-black/40 p-5 rounded-2xl space-y-2 border border-white/5">
                            <span className="text-xs sm:text-sm font-bold text-[#F0C040] block">أمثلة حقيقية من سوكنا:</span>
                            <ul className="list-disc list-inside text-xs sm:text-sm text-white/80 space-y-1.5 leading-relaxed">
                              {sec.examples.map((ex, eidx) => (
                                <li key={eidx}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-2 p-5 rounded-2xl bg-gradient-to-br from-[#0F1735] to-[#0B102B] border border-[#D4A017]/40 text-center space-y-3 shadow-xl">
                        <p className="text-xs text-white/40 blur-[3px] select-none line-clamp-1">{sec.content}</p>
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#D4A017]/20 text-[#F0C040]">
                          <Crown className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-black text-white">التفاصيل والأمثلة العميقة مقفولة هسة</h5>
                        <p className="text-xs text-white/70 max-w-md mx-auto">
                          اشترك بالحساب المدفوع حتى تفتح كل الأمثلة العملية وخطط الشغل.
                        </p>
                        <button
                          onClick={triggerUpgradeModal}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <KeyRound className="w-4 h-4 text-[#040B24]" />
                          <span>رقي حسابك وافتح كل التفاصيل ⚡</span>
                        </button>
                      </div>
                    )}
                  </div>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CASE STUDY */}
      {activeTab === "casestudy" && (
        <div className="max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          {relatedCaseStudy ? (
            <FadeInUp>
              <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-[2.5rem] p-6 md:p-12 shadow-xl space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F0C040] text-xs sm:text-sm font-bold">
                    مثال حقيقي: {relatedCaseStudy.businessName}
                  </span>
                  <span className="text-xs sm:text-sm text-white/60 font-mono">المحافظة: {relatedCaseStudy.city}</span>
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">{relatedCaseStudy.title}</h3>
                
                {!isFreeTrial ? (
                  <>
                    <p className="fluid-prose text-white/85 font-normal max-readable-prose">{relatedCaseStudy.thePsychology}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                      <div>
                        <span className="text-xs text-white/50 block font-bold mb-1">الربح من الإعلان</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.roas}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/50 block font-bold mb-1">كلفة الطلب</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.cpa}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/50 block font-bold mb-1">نسبة الراجع</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.returnRate}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/50 block font-bold mb-1">الطلبات باليوم</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.dailyOrders}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F1735] via-[#121A3D] to-[#0F1735] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4A017]/20 text-[#F0C040]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">الأرقام المضبوطة وتفاصيل الشغل مقفولة</h4>
                      <p className="text-xs text-white/70 max-w-lg mx-auto">
                        شوف شلون صعدنا مبيعات مشروع {relatedCaseStudy.businessName} بـ {relatedCaseStudy.city} وقللنا الراجع. تنفتحلك من تشترك بالحساب الكامل.
                      </p>
                    </div>
                    <button
                      onClick={triggerUpgradeModal}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-[#040B24]" />
                      <span>افتح القصة والأرقام كاملة هسة ⚡</span>
                    </button>
                  </div>
                )}
              </div>
            </FadeInUp>
          ) : (
            <p className="text-sm text-white/60">شوف قسم الأمثلة الحقيقية بالأدوات حتى تشوف نماذج أكثر.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: SWIPE FILES */}
      {activeTab === "swipe" && (
        <div className="bg-[#0A122E] border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-xl space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          <h3 className="text-xl sm:text-2xl font-black text-[#F0C040] flex items-center justify-between">
            <span>رسائل جاهزة للنسخ تفيدك بهذا الفصل:</span>
            {isFreeTrial && <span className="text-xs text-amber-300 font-normal">بعض الرسائل مقفولة</span>}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {relatedSwipeFiles.map((sf, idx) => {
              const isSwipeLocked = isFreeTrial && idx >= 1;
              return (
                <FadeInUp key={sf.id} delay={idx * 0.1}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 relative">
                    <h4 className="text-base sm:text-lg font-bold text-white">{sf.title}</h4>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{sf.description}</p>
                    {!isSwipeLocked ? (
                      <pre className="bg-black/60 p-3 sm:p-4 rounded-xl text-xs font-mono text-white/90 whitespace-pre-wrap dir-rtl max-h-48 overflow-y-auto border border-white/5">
                        {sf.content}
                      </pre>
                    ) : (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/30 text-center space-y-2">
                        <Lock className="w-5 h-5 text-[#F0C040] mx-auto" />
                        <p className="text-xs text-white/80 font-bold">الرسائل الاحترافية مقفولة هسة</p>
                        <button
                          onClick={triggerUpgradeModal}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black text-xs shadow hover:scale-105 transition-all cursor-pointer"
                        >
                          افتح وانسخ كل الرسائل ⚡
                        </button>
                      </div>
                    )}
                  </div>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: INTERACTIVE TOOLS */}
      {activeTab === "tools" && (
        <div className="space-y-8 max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          {isFreeTrial && !["chapter1", "chapter2"].includes(id) ? (
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-[#0F1735] via-[#0A122E] to-[#040B24] border border-[#D4A017]/40 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-white">الأدوات والحاسبات مال هذا الفصل مقفولة</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  هاي الأدوات تحسبلك شكد تربح صافي، وشكد تكلفك الرسالة، وتختبرلك رسائل الواتساب. تنفتحلك بالكامل بالنسخة المدفوعة.
                </p>
              </div>
              <button
                onClick={triggerUpgradeModal}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl shadow-[#D4A017]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <KeyRound className="w-5 h-5 text-[#040B24]" />
                <span>افتح كل الأدوات والحاسبات هسة ⚡</span>
              </button>
            </div>
          ) : (
            <>
              {id === "chapter1" && <RoiCalculator />}
              {id === "chapter2" && <ScriptSimulator />}
              {id === "chapter3" && <AdvancedCalculatorSuite />}
              {id === "chapter4" && <AdSimulator />}
              {id === "chapter5" && <AdSimulator />}
              {id === "chapter7" && <ScriptSimulator />}
              {id === "chapter10" && <AdvancedCalculatorSuite />}
              {id === "chapter11" && <ThirtyDayPlan />}
              
              {!["chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "chapter7", "chapter10", "chapter11"].includes(id) && (
                <AdvancedCalculatorSuite />
              )}
            </>
          )}
        </div>
      )}

      {/* CHAPTER BOTTOM QUICK NAV TOOLBAR */}
      <div className="max-w-5xl mx-auto mt-8 sm:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 dir-rtl px-2">
        {prevChapter ? (
          <button
            onClick={() => scrollToChapter(prevChapter.id)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4A017]/40 text-white font-bold text-xs sm:text-sm flex items-center justify-between sm:justify-start gap-3 transition-all cursor-pointer group"
          >
            <ArrowRight className="w-4 h-4 text-[#F0C040] group-hover:translate-x-1 transition-transform shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-white/50 block font-normal">الفصل القبله</span>
              <span className="text-xs sm:text-sm text-[#F0C040] line-clamp-1">{prevChapter.number}: {prevChapter.title}</span>
            </div>
          </button>
        ) : <div className="hidden sm:block" />}

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/25 text-[11px] text-[#F0C040]">
          <span>👈 اسحب يمنة ويسرة حتى تكلب بين الفصول 👉</span>
        </div>

        {nextChapter ? (
          <button
            onClick={() => scrollToChapter(nextChapter.id)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4A017]/20 to-[#D4A017]/10 hover:from-[#D4A017]/30 hover:to-[#D4A017]/20 border border-[#D4A017]/40 text-white font-bold text-xs sm:text-sm flex items-center justify-between sm:justify-end gap-3 transition-all cursor-pointer group"
          >
            <div className="text-right">
              <span className="text-[10px] text-[#F0C040]/80 block font-normal">الفصل الجاي</span>
              <span className="text-xs sm:text-sm text-[#F0C040] line-clamp-1">{nextChapter.number}: {nextChapter.title}</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-[#F0C040] group-hover:-translate-x-1 transition-transform shrink-0" />
          </button>
        ) : <div className="hidden sm:block" />}
      </div>

    </section>
  );
}