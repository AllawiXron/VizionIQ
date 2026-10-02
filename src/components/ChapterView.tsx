/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EASE_OUT, SPRING_SNAPPY } from "../lib/motion";
import { motion } from "motion/react";
import { 
  CheckCircle2, AlertTriangle, Layers, FileText,
  ArrowRight, ArrowLeft, Sparkles, CheckSquare, Wrench,
  Lock, Crown, KeyRound, BookOpen, Check, Clock
} from "lucide-react";
import { isFreeTrialUser } from "./LockScreen";
import { chaptersList, chaptersDetailedMap } from "../data/chaptersData";
import { caseStudiesList } from "../data/caseStudiesData";
import { swipeFilesList } from "../data/swipeFilesData";
import { chapterPlaybook, playbooksList } from "../data/playbooksData";
import { setChapterDone, setLastChapter, stageOf, useCourseProgress } from "../lib/progress";
import type { Route } from "../lib/route";

import FadeInUp from "./FadeInUp";

// Interactive Tools
const RoiCalculator = React.lazy(() => import("./RoiCalculator"));
const AdSimulator = React.lazy(() => import("./AdSimulator"));
const ScriptSimulator = React.lazy(() => import("./ScriptSimulator"));
const ThirtyDayPlan = React.lazy(() => import("./ThirtyDayPlan"));
const AdvancedCalculatorSuite = React.lazy(() => import("./AdvancedCalculatorSuite"));

interface ChapterViewProps {
  key?: string;
  id: string;
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

const CHAPTER_TABS = [
  { id: "framework", label: "الدرس", icon: BookOpen },
  { id: "deepdive", label: "أمثلة أكثر", icon: Layers },
  { id: "casestudy", label: "قصة مشروع", icon: Sparkles },
  { id: "swipe", label: "رسائل جاهزة", icon: FileText },
  { id: "tools", label: "الأداة", icon: Wrench },
] as const;
type ChapterTab = (typeof CHAPTER_TABS)[number]["id"];

export default function ChapterView({ id, userCode, onNavigate }: ChapterViewProps) {
  const [activeTab, setActiveTab] = useState<ChapterTab>("framework");

  const chapter = chaptersList.find((c) => c.id === id) || chaptersList[0];
  const detailedData = chaptersDetailedMap[id] || chaptersDetailedMap["chapter1"];
  const relatedCaseStudy = caseStudiesList.find((cs) => cs.chapterId === id) || caseStudiesList[0];
  const relatedSwipeFiles = swipeFilesList.filter((s) => s.chapterId === id || s.category === "ad_copy").slice(0, 2);

  const chapterIndex = chaptersList.findIndex((c) => c.id === id);
  const prevChapter = chapterIndex > 0 ? chaptersList[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chaptersList.length - 1 ? chaptersList[chapterIndex + 1] : null;
  const stage = stageOf(id);
  const readTime = chapter.readTime?.match(/\d+\s*دقيقة/)?.[0];

  const isFreeTrial = isFreeTrialUser(userCode);
  const progress = useCourseProgress(userCode);
  const isDone = progress.done.includes(id);
  const playbook = playbooksList.find((p) => p.id === chapterPlaybook[id]);

  // Remember where the member stopped so Home can offer "continue".
  useEffect(() => {
    setLastChapter(userCode, id);
  }, [userCode, id]);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  const finishAndContinue = () => {
    setChapterDone(userCode, id, true);
    onNavigate(nextChapter ? { view: "chapter", id: nextChapter.id } : { view: "chapters" });
  };

  return (
    <section
      id={id}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 relative"
    >
      {/* Back to the list + position */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <button
          onClick={() => onNavigate({ view: "chapters" })}
          className={`btn btn-ghost px-3 -mr-3 rounded-full text-xs sm:text-sm gap-1.5 ${focusRing}`}
        >
          <ArrowRight className="w-4 h-4" />
          <span>كل الفصول</span>
        </button>
        <span className="text-xs text-white/50 font-mono">{chapterIndex + 1} / {chaptersList.length}</span>
      </div>

      {/* Chapter title */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-right"
      >
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-white/55">
          <span className="text-vz-accent">{chapter.number}</span>
          {stage && <><span aria-hidden="true">·</span><span>المرحلة {stage.index + 1}: {stage.stage.label}</span></>}
          {readTime && <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime}</span></>}
          {isDone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[11px]">
              <Check className="w-3 h-3" strokeWidth={3} /> مكتمل
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight flex items-start gap-3">
          <span aria-hidden="true" className="shrink-0">{chapter.icon}</span>
          <span>{chapter.title}</span>
        </h1>
        <p className="text-sm sm:text-lg text-white/60 leading-relaxed max-w-3xl">{chapter.description}</p>
      </motion.header>

      {/* Chapter sections */}
      <div className="sticky top-[4.5rem] sm:top-[4.75rem] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
        <div role="tablist" aria-label="أقسام الفصل" className="flex items-center gap-1 p-1 rounded-full glass-floating overflow-x-auto no-scrollbar w-full sm:w-fit">
          {CHAPTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 sm:flex-none px-3.5 sm:px-5 min-h-[40px] rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors duration-300 cursor-pointer ${isActive ? "text-white" : "text-white/60 hover:text-white"} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60`}
              >
                {isActive && <motion.span layoutId="chapter-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />}
                <Icon className="relative w-4 h-4 hidden sm:block" />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: CORE FRAMEWORK */}
      {activeTab === "framework" && (
        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in">
          <div className="glass-subtle border rounded-2xl sm:rounded-4xl p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2.5 pb-3 border-b border-white/[0.07]">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-slate-200 shrink-0" />
              <span>{detailedData.coreFramework?.title || "الفكرة الأساسية لهذا الفصل"}</span>
            </h3>

            <p className="fluid-prose text-white/80 font-normal glass-subtle p-4 sm:p-6 rounded-2xl max-readable-prose">
              {detailedData.coreFramework?.summary}
            </p>

            <div className="space-y-5 sm:space-y-8 pt-1">
              {detailedData.coreFramework?.sections?.map((sec, idx) => {
                const isLockedSection = isFreeTrial ? (id !== "chapter1" && id !== "chapter2" ? true : idx >= 1) : false;
                return (
                  <FadeInUp key={idx} delay={idx * 0.08}>
                    <div className="glass border rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 space-y-3.5 sm:space-y-4 relative overflow-hidden">
                      <h4 className="text-base sm:text-xl font-black text-white border-r-2 border-white/25 pr-3 flex items-center justify-between">
                        <span>{sec.heading}</span>
                        {isLockedSection && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-vz-accent border border-white/18 text-[10px] sm:text-xs font-black flex items-center gap-1">
                            <Lock className="w-3 h-3 text-vz-accent" />
                            <span>محتوى مقفول (نسخة تجريبية)</span>
                          </span>
                        )}
                      </h4>

                      {!isLockedSection ? (
                        <>
                          <p className="fluid-prose text-white/85 font-normal max-readable-prose">{sec.content}</p>

                          {sec.keyTakeaway && (
                            <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.1] p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-white font-bold flex items-start gap-2.5 sm:gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-vz-accent" />
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
                          <p className="text-xs sm:text-sm text-white/60 blur-[3px] select-none leading-relaxed line-clamp-2">
                            {sec.content}
                          </p>
                          <div className="mt-3 p-4 sm:p-6 rounded-2xl glass border text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/22 text-vz-accent">
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
                            <button                               onClick={triggerUpgradeModal}
                              className="btn btn-primary px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                            >
                              <Crown className="w-4 h-4 text-white" />
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
              <div className="glass-subtle border border-emerald-500/30 rounded-2xl sm:rounded-4xl p-4 sm:p-6 md:p-8 space-y-4 h-full">
                <h4 className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>خطوات الشغل (شلون تطبق):</span>
                </h4>
                <div className="space-y-2.5 sm:space-y-3">
                  {detailedData.actionSteps?.map((st) => (
                    <div key={st.step} className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">خطوة {st.step}: {st.title}</span>
                        <span className="text-[10px] text-emerald-300 font-mono bg-emerald-400/10 px-2 py-0.5 rounded-full">{st.timeframe}</span>
                      </div>
                      <p className="text-xs text-white/60">{st.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* Common Mistakes Box */}
            <FadeInUp delay={0.2}>
              <div className="glass-subtle border border-red-500/30 rounded-2xl sm:rounded-4xl p-4 sm:p-6 md:p-8 space-y-4 h-full">
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
        <div className="glass-subtle border rounded-4xl p-6 md:p-12 space-y-8 max-w-5xl mx-auto animate-fade-in relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-black text-vz-accent flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Layers className="w-7 h-7 text-slate-200 shrink-0" />
              <span>{detailedData.deepDive?.title || "تفاصيل أكثر وشلون تطبقها"}</span>
            </div>
            {isFreeTrial && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-vz-accent border border-white/18 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-vz-accent" />
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
                    <h4 className="text-base sm:text-xl font-bold text-white border-r-2 border-white/35 pr-3">{sec.heading}</h4>
                    {!isLockedDeep ? (
                      <>
                        <p className="fluid-prose text-white/85 font-normal max-readable-prose">{sec.content}</p>
                        {sec.examples && (
                          <div className="bg-black/40 p-5 rounded-2xl space-y-2 border border-white/5">
                            <span className="text-xs sm:text-sm font-bold text-vz-accent block">أمثلة حقيقية من سوكنا:</span>
                            <ul className="list-disc list-inside text-xs sm:text-sm text-white/80 space-y-1.5 leading-relaxed">
                              {sec.examples.map((ex, eidx) => (
                                <li key={eidx}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-2 p-5 rounded-2xl glass border text-center space-y-3">
                        <p className="text-xs text-white/60 blur-[3px] select-none line-clamp-1">{sec.content}</p>
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-vz-accent">
                          <Crown className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-black text-white">التفاصيل والأمثلة العميقة مقفولة هسة</h5>
                        <p className="text-xs text-white/70 max-w-md mx-auto">
                          اشترك بالحساب المدفوع حتى تفتح كل الأمثلة العملية وخطط الشغل.
                        </p>
                        <button                           onClick={triggerUpgradeModal}
                          className="btn btn-primary px-5 py-2.5 rounded-xl text-white font-black text-xs inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                        >
                          <KeyRound className="w-4 h-4 text-white" />
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
        <div className="max-w-5xl mx-auto animate-fade-in">
          {relatedCaseStudy ? (
            <FadeInUp>
              <div className="glass-subtle border rounded-4xl p-6 md:p-12 space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/18 text-vz-accent text-xs sm:text-sm font-bold">
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
                        <span className="text-xs text-white/70 block font-bold mb-1">الربح من الإعلان</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.roas}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/70 block font-bold mb-1">كلفة الطلب</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.cpa}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/70 block font-bold mb-1">نسبة الراجع</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.returnRate}</span>
                      </div>
                      <div>
                        <span className="text-xs text-white/70 block font-bold mb-1">الطلبات باليوم</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">{relatedCaseStudy.afterMetrics.dailyOrders}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl glass border text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-vz-accent">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">الأرقام المضبوطة وتفاصيل الشغل مقفولة</h4>
                      <p className="text-xs text-white/70 max-w-lg mx-auto">
                        شوف شلون صعدنا مبيعات مشروع {relatedCaseStudy.businessName} بـ {relatedCaseStudy.city} وقللنا الراجع. تنفتحلك من تشترك بالحساب الكامل.
                      </p>
                    </div>
                    <button                       onClick={triggerUpgradeModal}
                      className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <Crown className="w-4 h-4 text-white" />
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
        <div className="glass-subtle border rounded-2xl sm:rounded-4xl p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-fade-in">
          <h3 className="text-xl sm:text-2xl font-black text-vz-accent flex items-center justify-between">
            <span>رسائل جاهزة للنسخ تفيدك بهذا الفصل:</span>
            {isFreeTrial && <span className="text-xs text-vz-accent font-normal">بعض الرسائل مقفولة</span>}
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
                      <div className="p-4 rounded-xl glass border text-center space-y-2">
                        <Lock className="w-5 h-5 text-vz-accent mx-auto" />
                        <p className="text-xs text-white/80 font-bold">الرسائل الاحترافية مقفولة هسة</p>
                        <button                           onClick={triggerUpgradeModal}
                          className="btn btn-primary px-4 py-2 rounded-lg text-white font-black text-xs min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
        <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
          {isFreeTrial && !["chapter1", "chapter2"].includes(id) ? (
            <div className="p-8 sm:p-12 rounded-4xl glass border text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-white">الأدوات والحاسبات مال هذا الفصل مقفولة</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  هاي الأدوات تحسبلك شكد تربح صافي، وشكد تكلفك الرسالة، وتختبرلك رسائل الواتساب. تنفتحلك بالكامل بالنسخة المدفوعة.
                </p>
              </div>
              <button                 onClick={triggerUpgradeModal}
                className="btn btn-primary px-8 py-3.5 rounded-2xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <KeyRound className="w-5 h-5 text-white" />
                <span>افتح كل الأدوات والحاسبات هسة ⚡</span>
              </button>
            </div>
          ) : (
            <>
              {id === "chapter1" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><RoiCalculator /></React.Suspense>}
              {id === "chapter2" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><ScriptSimulator /></React.Suspense>}
              {id === "chapter3" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><AdvancedCalculatorSuite /></React.Suspense>}
              {id === "chapter4" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><AdSimulator /></React.Suspense>}
              {id === "chapter5" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><AdSimulator /></React.Suspense>}
              {id === "chapter7" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><ScriptSimulator /></React.Suspense>}
              {id === "chapter10" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><AdvancedCalculatorSuite /></React.Suspense>}
              {id === "chapter11" && <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><ThirtyDayPlan /></React.Suspense>}
              
              {!["chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "chapter7", "chapter10", "chapter11"].includes(id) && (
                <React.Suspense fallback={<div className="p-4 text-center text-white/70">جاري التحميل...</div>}><AdvancedCalculatorSuite /></React.Suspense>
              )}
            </>
          )}
        </div>
      )}

      {/* Practice: the matching playbook */}
      {playbook && (
        <button
          onClick={() => onNavigate({ view: "solution", id: playbook.id })}
          className={`group mt-10 sm:mt-14 w-full text-right glass-elevated glass-edge rounded-3xl p-5 sm:p-7 flex items-center gap-4 cursor-pointer ${focusRing}`}
        >
          <span className="text-3xl sm:text-4xl leading-none shrink-0" aria-hidden="true">{playbook.icon}</span>
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-xs sm:text-sm font-bold text-vz-accent">طبّق هذا الفصل على مشروعك</span>
            <span className="block text-base sm:text-xl font-black text-white leading-snug">{playbook.title}</span>
            <span className="block text-xs sm:text-sm text-white/55">{playbook.steps.length} خطوات، {playbook.scripts.length} رسائل جاهزة، وخطة 7 أيام</span>
          </span>
          <ArrowLeft className="w-5 h-5 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
      )}

      {/* Finish + move on */}
      <div className="mt-4 sm:mt-5 glass rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0 text-right">
          <p className="text-base sm:text-lg font-black text-white">{isDone ? "خلصت هذا الفصل ✓" : "خلصت الفصل؟"}</p>
          <p className="text-xs sm:text-sm text-white/55 mt-1">
            {nextChapter ? <>الجاي: {nextChapter.title}</> : "هذا آخر فصل بالكورس."}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
          {prevChapter && (
            <button
              onClick={() => onNavigate({ view: "chapter", id: prevChapter.id })}
              className={`btn btn-ghost min-h-[48px] px-5 rounded-full text-sm gap-1.5 ${focusRing}`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>الفصل السابق</span>
            </button>
          )}
          <button
            onClick={finishAndContinue}
            className={`btn btn-primary min-h-[48px] px-6 rounded-full text-sm gap-2 ${focusRing}`}
          >
            {!isDone && <Check className="w-4 h-4" strokeWidth={3} />}
            <span>{nextChapter ? (isDone ? "الفصل الجاي" : "خلصت، الفصل الجاي") : "خلصت الكورس"}</span>
            {nextChapter && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </section>
  );
}