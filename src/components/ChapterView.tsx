/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EASE_OUT } from "../lib/motion";
import { motion } from "motion/react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock, ClipboardList,
  FileText, HelpCircle, Lightbulb, Lock, Target, TrendingUp, Wrench, X,
} from "lucide-react";
import { isFreeTrialUser } from "./LockScreen";
import { isTrialChapter } from "../lib/trial";
import { LockChip, TrialLock } from "./TrialLock";
import { TopicIcon } from "./ui/TopicIcon";
import { CopyButton } from "./ui/CopyButton";
import { chaptersList } from "../data/chaptersData";
import { courseChapters, chapterMinutes, lessonMinutes, type Block, type CourseChapter } from "../data/course";
import { chapterPlaybook, playbooksList } from "../data/playbooksData";
import { setChapterDone, setLastChapter, stageOf, togglePlanDay, useCourseProgress, usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import type { PlaybookCalculator as CalculatorKind } from "../data/playbooksData";

// Interactive tools
const RoiCalculator = React.lazy(() => import("./RoiCalculator"));
const AdSimulator = React.lazy(() => import("./AdSimulator"));
const ScriptSimulator = React.lazy(() => import("./ScriptSimulator"));
const ThirtyDayPlan = React.lazy(() => import("./ThirtyDayPlan"));
const AdvancedCalculatorSuite = React.lazy(() => import("./AdvancedCalculatorSuite"));
const PlaybookCalculator = React.lazy(() => import("./playbook/PlaybookCalculator").then((m) => ({ default: m.PlaybookCalculator })));

interface ChapterViewProps {
  key?: string;
  id: string;
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** The tool that goes with each chapter's practice. */
const CHAPTER_TOOL: Record<string, { label: string; render: () => React.ReactNode }> = {
  chapter1: { label: "حاسبة الحملة التجريبية", render: () => <RoiCalculator /> },
  chapter2: { label: "شكد يزيد البيع بدون ما تزيد الإعلان", render: () => <PlaybookCalculator kind={"sales-levers" as CalculatorKind} /> },
  chapter3: { label: "حاسبات التسعير والربح", render: () => <AdvancedCalculatorSuite /> },
  chapter4: { label: "شكد أكدر أدفع على الرسالة", render: () => <PlaybookCalculator kind={"max-message-cost" as CalculatorKind} /> },
  chapter5: { label: "شوف شكل إعلانك قبل لا تنزله", render: () => <AdSimulator /> },
  chapter7: { label: "شكد يزيد البيع لو صلحت الردود", render: () => <PlaybookCalculator kind={"sales-levers" as CalculatorKind} /> },
  chapter8: { label: "مكالمات جاهزة حسب نوع الزبون", render: () => <ScriptSimulator /> },
  chapter9: { label: "شكد يكلفك الراجع", render: () => <PlaybookCalculator kind={"returns-cost" as CalculatorKind} /> },
  chapter10: { label: "حاسبات الأرقام والقرارات", render: () => <AdvancedCalculatorSuite /> },
  chapter11: { label: "خطة 30 يوم لأول 100 طلب", render: () => <ThirtyDayPlan /> },
};

/** "5 دقايق" / "25 دقيقة" */
const minutesLabel = (n: number) => `${n} ${n <= 10 ? "دقايق" : "دقيقة"}`;

const SECTIONS = [
  { id: "ch-lessons", label: "الدروس" },
  { id: "ch-practice", label: "طبّق" },
  { id: "ch-templates", label: "جاهز للنسخ" },
  { id: "ch-example", label: "مثال بالأرقام" },
  { id: "ch-mistakes", label: "أغلاط" },
  { id: "ch-quiz", label: "اختبر نفسك" },
];

function SectionTitle({ id, icon: Icon, children, sub }: { id: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; sub?: string }) {
  return (
    <div id={id} className="scroll-mt-36 space-y-1.5 mb-5 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-vz-accent shrink-0" />
        {children}
      </h2>
      {sub && <p className="text-sm text-white/55 leading-relaxed">{sub}</p>}
    </div>
  );
}

/** One block of a lesson. */
function LessonBlock({ block }: { key?: React.Key; block: Block }) {
  switch (block.kind) {
    case "p":
      return <p className="fluid-prose text-white/85 leading-loose">{block.text}</p>;
    case "points":
      return (
        <div className="space-y-2.5">
          {block.title && <h4 className="text-sm sm:text-base font-black text-white">{block.title}</h4>}
          <ul className="space-y-2">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-vz-accent shrink-0 mt-2.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "steps":
      return (
        <div className="space-y-3">
          {block.title && <h4 className="text-sm sm:text-base font-black text-white">{block.title}</h4>}
          <ol className="space-y-2.5">
            {block.items.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/[0.035] border border-white/[0.07]">
                <span className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                <span className="min-w-0 space-y-1">
                  <span className="block text-sm sm:text-base font-black text-white">{step.title}</span>
                  <span className="block text-sm text-white/75 leading-relaxed">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "example":
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-vz-blue/[0.12] border border-vz-blue-light/25 space-y-1.5">
          <p className="text-xs sm:text-sm font-black text-vz-accent">{block.title}</p>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed">{block.text}</p>
        </div>
      );
    case "tip":
      return (
        <p className="flex items-start gap-2.5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-sm sm:text-base text-white/85 leading-relaxed">
          <Lightbulb className="w-4 h-4 text-amber-200 shrink-0 mt-1" />
          <span><span className="font-bold text-amber-100">ملاحظة: </span>{block.text}</span>
        </p>
      );
    case "warning":
      return (
        <p className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/[0.07] border border-red-400/20 text-sm sm:text-base text-red-50/90 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-1" />
          <span><span className="font-bold text-red-200">انتبه: </span>{block.text}</span>
        </p>
      );
    case "table":
      return (
        <div className="space-y-2.5">
          {block.title && <h4 className="text-sm sm:text-base font-black text-white">{block.title}</h4>}
          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-xs text-white/50 border-b border-white/[0.07]">
                  {block.head.map((h) => <th key={h} className="text-right font-bold px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {block.rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-3 align-top leading-relaxed ${ci === 0 ? "font-bold text-white" : "text-white/75"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "compare":
      return (
        <div className="space-y-2.5">
          {block.title && <h4 className="text-sm sm:text-base font-black text-white">{block.title}</h4>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-4 rounded-2xl bg-red-500/[0.06] border border-red-400/20 space-y-1.5">
              <p className="text-xs font-black text-red-200 flex items-center gap-1.5"><X className="w-3.5 h-3.5" />{block.bad.label}</p>
              <p className="text-sm text-white/80 leading-relaxed">{block.bad.text}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-400/[0.06] border border-emerald-400/25 space-y-1.5">
              <p className="text-xs font-black text-emerald-200 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />{block.good.label}</p>
              <p className="text-sm text-white/85 leading-relaxed">{block.good.text}</p>
            </div>
          </div>
        </div>
      );
  }
}

function Quiz({ chapter }: { chapter: CourseChapter }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const right = chapter.quiz.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="space-y-3">
      {chapter.quiz.map((q, qi) => {
        const choice = picked[qi];
        const done = choice !== undefined;
        return (
          <div key={q.q} className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
            <p className="text-sm sm:text-base font-black text-white leading-relaxed">{qi + 1}. {q.q}</p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isRight = oi === q.answer;
                const state = !done ? "idle" : isRight ? "right" : oi === choice ? "wrong" : "idle";
                return (
                  <button
                    key={opt}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    className={`w-full text-right flex items-center gap-2.5 p-3 rounded-xl border text-sm leading-relaxed transition-colors min-h-[48px] ${focusRing} ${
                      state === "right" ? "bg-emerald-400/[0.1] border-emerald-400/40 text-white"
                        : state === "wrong" ? "bg-red-500/[0.08] border-red-400/35 text-white"
                          : done ? "bg-white/[0.02] border-white/[0.06] text-white/50"
                            : "bg-white/[0.04] border-white/10 text-white/85 hover:bg-white/[0.08] cursor-pointer"
                    }`}
                  >
                    <span className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${state === "right" ? "bg-emerald-400 border-emerald-300 text-[#062018]" : state === "wrong" ? "bg-red-400 border-red-300 text-[#2a0606]" : "border-white/25"}`}>
                      {state === "right" && <Check className="w-3 h-3" strokeWidth={3} />}
                      {state === "wrong" && <X className="w-3 h-3" strokeWidth={3} />}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {done && <p className="text-xs sm:text-sm text-white/70 leading-relaxed pr-3 border-r-2 border-vz-accent/60">{q.why}</p>}
          </div>
        );
      })}
      {answered === chapter.quiz.length && (
        <p className="text-sm font-bold text-white/80">جاوبت صح على {right} من {chapter.quiz.length}.{right < chapter.quiz.length ? " راجع الدروس اللي غلطت بيها قبل لا تكمل." : " ممتاز، كمّل للفصل الجاي."}</p>
      )}
    </div>
  );
}

export default function ChapterView({ id, userCode, onNavigate }: ChapterViewProps) {
  const chapter = chaptersList.find((c) => c.id === id) || chaptersList[0];
  const course = courseChapters[chapter.id] ?? courseChapters.chapter1;
  const chapterIndex = chaptersList.findIndex((c) => c.id === chapter.id);
  const prevChapter = chapterIndex > 0 ? chaptersList[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chaptersList.length - 1 ? chaptersList[chapterIndex + 1] : null;
  const stage = stageOf(chapter.id);
  const minutes = chapterMinutes(course);

  const isFreeTrial = isFreeTrialUser(userCode);
  // Trial members get the first lesson (and some of the rest) of chapters 1–2; other chapters show their outline only.
  const trialLocked = isFreeTrial && !isTrialChapter(chapter.id);
  const progress = useCourseProgress(userCode);
  const isDone = progress.done.includes(chapter.id);
  const plans = usePlaybookPlans(userCode);
  const practiceKey = `chapter:${chapter.id}`;
  const ticked = new Set(plans[practiceKey] ?? []);
  const playbook = playbooksList.find((p) => p.id === chapterPlaybook[chapter.id]);
  const tool = CHAPTER_TOOL[chapter.id];

  const openLessons = isFreeTrial ? 1 : course.lessons.length;
  const openTemplates = isFreeTrial ? 2 : course.templates.length;
  const openMistakes = isFreeTrial ? 3 : course.mistakes.length;

  // Remember where the member stopped so Home can offer "continue".
  useEffect(() => {
    setLastChapter(userCode, chapter.id);
  }, [userCode, chapter.id]);

  const jump = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  };

  const finishAndContinue = () => {
    setChapterDone(userCode, chapter.id, true);
    onNavigate(nextChapter ? { view: "chapter", id: nextChapter.id } : { view: "chapters" });
  };

  return (
    <section id={chapter.id} className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 relative text-right">
      {/* Back to the list + position */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <button onClick={() => onNavigate({ view: "chapters" })} className={`btn btn-ghost px-3 -mr-3 rounded-full text-xs sm:text-sm gap-1.5 ${focusRing}`}>
          <ArrowRight className="w-4 h-4" />
          <span>كل الفصول</span>
        </button>
        <span className="text-xs text-white/50 font-mono">{chapterIndex + 1} / {chaptersList.length}</span>
      </div>

      {/* Title */}
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-white/55">
          <span className="text-vz-accent">{chapter.number}</span>
          {stage && <><span aria-hidden="true">·</span><span>المرحلة {stage.index + 1}: {stage.stage.label}</span></>}
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{minutesLabel(minutes)}</span>
          <span aria-hidden="true">·</span>
          <span>{course.lessons.length} دروس</span>
          {trialLocked && <LockChip label="بالتجربة تشوف المحتوى بس" />}
          {isDone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[11px]">
              <Check className="w-3 h-3" strokeWidth={3} /> مكتمل
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight flex items-start gap-3">
          <TopicIcon kind="chapter" id={chapter.id} size="lg" className="mt-0.5" />
          <span>{chapter.title}</span>
        </h1>
        <p className="text-sm sm:text-lg text-white/65 leading-relaxed">{course.goal}</p>
      </motion.header>

      {/* What you will be able to do */}
      <div className="glass rounded-3xl p-5 sm:p-6 mb-8 sm:mb-10 space-y-3">
        <p className="text-sm font-black text-white flex items-center gap-2"><Target className="w-4 h-4 text-vz-accent" /> بنهاية هذا الفصل</p>
        <ul className="space-y-2">
          {course.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-sm text-white/80 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      {trialLocked ? (
        <div className="space-y-4">
          <div className="glass rounded-3xl overflow-hidden">
            <p className="px-5 py-3.5 text-sm font-black text-white border-b border-white/[0.07]">دروس الفصل</p>
            <ol className="divide-y divide-white/[0.06]">
              {course.lessons.map((l, i) => (
                <li key={l.title} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-white/[0.06] border border-white/10 text-xs font-black flex items-center justify-center text-white/70">{i + 1}</span>
                  <span className="flex-1 text-white/85">{l.title}</span>
                  <span className="text-xs text-white/40 font-mono shrink-0">{lessonMinutes(l)} د</span>
                  <Lock className="w-3.5 h-3.5 text-white/35 shrink-0" />
                </li>
              ))}
            </ol>
          </div>
          <TrialLock
            title="هذا الفصل ينفتح ويا الاشتراك الكامل"
            desc={`${course.lessons.length} دروس مفصلة، ${course.practice.tasks.length} مهام تطبقها على مشروعك، ${course.templates.length} رسائل وقوالب جاهزة، مثال بالأرقام، واختبار قصير.`}
            cta="افتح الكورس كامل"
          />
        </div>
      ) : (
        <>
          {/* In-page sections */}
          <nav aria-label="أقسام الفصل" className="sticky top-[4.5rem] sm:top-[4.75rem] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-10">
            <div className="flex items-center gap-1 p-1 rounded-full glass-floating overflow-x-auto no-scrollbar w-full sm:w-fit">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => jump(s.id)}
                  className="px-3.5 sm:px-4 min-h-[38px] rounded-full text-xs sm:text-sm font-bold whitespace-nowrap text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="space-y-14 sm:space-y-20">
            {/* Lessons */}
            <section>
              <SectionTitle id="ch-lessons" icon={BookOpen} sub="اقراها بالترتيب. كل درس يبني على اللي قبله.">الدروس</SectionTitle>
              <ol className="glass rounded-3xl overflow-hidden divide-y divide-white/[0.06] mb-8 sm:mb-10">
                {course.lessons.map((l, i) => {
                  const locked = i >= openLessons;
                  return (
                    <li key={l.title}>
                      <button
                        onClick={() => jump(locked ? "ch-lessons-locked" : `ch-lesson-${i}`)}
                        className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-right text-sm hover:bg-white/[0.04] transition-colors cursor-pointer ${focusRing}`}
                      >
                        <span className="w-7 h-7 shrink-0 rounded-full bg-white/[0.06] border border-white/10 text-xs font-black flex items-center justify-center text-white/75">{i + 1}</span>
                        <span className={`flex-1 ${locked ? "text-white/55" : "text-white/90 font-bold"}`}>{l.title}</span>
                        <span className="text-xs text-white/40 font-mono shrink-0">{lessonMinutes(l)} د</span>
                        {locked && <Lock className="w-3.5 h-3.5 text-white/35 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="space-y-12 sm:space-y-16">
                {course.lessons.slice(0, openLessons).map((lesson, i) => (
                  <article key={lesson.title} id={`ch-lesson-${i}`} className="scroll-mt-36 space-y-5 sm:space-y-6">
                    <header className="space-y-2">
                      <p className="text-xs sm:text-sm font-bold text-vz-accent">الدرس {i + 1} · {minutesLabel(lessonMinutes(lesson))}</p>
                      <h3 className="text-xl sm:text-3xl font-black text-white leading-snug">{lesson.title}</h3>
                      <p className="text-sm sm:text-lg text-white/70 leading-relaxed">{lesson.intro}</p>
                    </header>
                    {lesson.blocks.map((b, bi) => <LessonBlock key={bi} block={b} />)}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-white leading-relaxed"><span className="font-black">الخلاصة: </span>{lesson.takeaway}</p>
                    </div>
                  </article>
                ))}
                {openLessons < course.lessons.length && (
                  <TrialLock
                    id="ch-lessons-locked"
                    title="باقي الدروس تنفتح ويا الاشتراك"
                    desc="قريت أول درس. الدروس الباقية بنفس التفصيل، ويا أمثلة وخطوات تطبقها."
                    items={course.lessons.slice(openLessons).map((l, i) => `الدرس ${openLessons + i + 1}: ${l.title}`)}
                    cta="افتح الكورس كامل"
                  />
                )}
              </div>
            </section>

            {/* Practice */}
            <section>
              <SectionTitle id="ch-practice" icon={ClipboardList} sub={course.practice.intro}>طبّق على مشروعك</SectionTitle>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={course.practice.tasks.length} aria-valuenow={ticked.size} aria-label="تقدم التطبيق">
                  <div className="h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400 transition-[width] duration-500" style={{ width: `${Math.round((ticked.size / course.practice.tasks.length) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-white/70 font-mono">{ticked.size}/{course.practice.tasks.length}</span>
              </div>
              <ul className="space-y-2.5">
                {course.practice.tasks.map((task, i) => {
                  const done = ticked.has(i);
                  return (
                    <li key={task.title}>
                      <button
                        onClick={() => togglePlanDay(userCode, practiceKey, i)}
                        aria-pressed={done}
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl text-right cursor-pointer transition-colors duration-300 ${done ? "bg-emerald-400/[0.08] border border-emerald-400/25" : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06]"} ${focusRing}`}
                      >
                        <span className={`w-6 h-6 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center ${done ? "bg-emerald-400 border-emerald-300 text-[#062018]" : "border-white/25"}`}>
                          {done && <Check className="w-4 h-4" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 space-y-1">
                          <span className={`block text-sm sm:text-base font-black ${done ? "text-white/60" : "text-white"}`}>{task.title}</span>
                          <span className="block text-sm text-white/70 leading-relaxed">{task.detail}</span>
                          <span className="block text-xs text-emerald-200/80 leading-relaxed"><span className="font-bold">تطلع بـ: </span>{task.output}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {tool && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-vz-accent" /> الأداة: {tool.label}</h3>
                  <React.Suspense fallback={<div className="p-4 text-center text-white/60 text-sm">دا يحمّل...</div>}>{tool.render()}</React.Suspense>
                </div>
              )}
            </section>

            {/* Templates */}
            <section>
              <SectionTitle id="ch-templates" icon={FileText} sub="انسخها، غيّر اللي بين القوسين [ ] لمشروعك، واستخدمها.">جاهز للنسخ</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {course.templates.slice(0, openTemplates).map((t) => (
                  <div key={t.title} className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white">{t.title}</h3>
                        <p className="text-xs text-white/55 mt-0.5 leading-relaxed"><span className="font-bold text-white/65">متى: </span>{t.when}</p>
                      </div>
                      <CopyButton text={t.text} />
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-white/90 leading-relaxed p-3.5 rounded-xl bg-black/25 border border-white/[0.06]">{t.text}</pre>
                    {t.note && <p className="text-xs text-white/60 leading-relaxed pr-3 border-r-2 border-white/15">{t.note}</p>}
                  </div>
                ))}
                {openTemplates < course.templates.length && (
                  <TrialLock
                    title="باقي القوالب تنفتح ويا الاشتراك"
                    items={course.templates.slice(openTemplates).map((t) => t.title)}
                    cta="افتح كل القوالب"
                  />
                )}
              </div>
            </section>

            {/* Worked example */}
            <section>
              <SectionTitle id="ch-example" icon={TrendingUp} sub={isFreeTrial ? undefined : course.example.setup}>{`مثال بالأرقام: ${course.example.title}`}</SectionTitle>
              {isFreeTrial ? (
                <TrialLock title="المثال بالأرقام ينفتح ويا الاشتراك" desc="مثال محسوب خطوة بخطوة: الأرقام قبل وبعد، وشنو تغير بالضبط." cta="افتح الكورس كامل" />
              ) : (
                <div className="space-y-4">
                  <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-3 gap-3 px-4 sm:px-5 py-3 text-xs font-bold text-white/50 border-b border-white/[0.07]">
                      <span>الرقم</span><span>قبل</span><span>بعد</span>
                    </div>
                    <ul className="divide-y divide-white/[0.06]">
                      {course.example.rows.map((r) => (
                        <li key={r.label} className="grid grid-cols-3 gap-3 px-4 sm:px-5 py-3 text-sm items-center">
                          <span className="font-bold text-white">{r.label}</span>
                          <span className="text-red-300/90">{r.before}</span>
                          <span className="text-emerald-300 font-bold">{r.after}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ul className="space-y-2">
                    {course.example.whatChanged.map((w) => (
                      <li key={w} className="flex items-start gap-2.5 text-sm text-white/80 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-vz-accent shrink-0 mt-2" aria-hidden="true" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed"><span className="font-black text-vz-accent">الدرس: </span>{course.example.lesson}</p>
                </div>
              )}
            </section>

            {/* Mistakes */}
            <section>
              <SectionTitle id="ch-mistakes" icon={AlertTriangle}>أغلاط لا توكع بيها</SectionTitle>
              <ul className="space-y-2.5">
                {course.mistakes.slice(0, openMistakes).map((m) => (
                  <li key={m.mistake} className="glass-subtle rounded-2xl p-4 sm:p-5 space-y-2 text-sm">
                    <p className="flex items-start gap-2 font-black text-red-200"><X className="w-4 h-4 shrink-0 mt-0.5 text-red-300" />{m.mistake}</p>
                    <p className="text-white/65 leading-relaxed pr-6">{m.why}</p>
                    <p className="flex items-start gap-2 text-emerald-100/90 leading-relaxed"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" />{m.fix}</p>
                  </li>
                ))}
              </ul>
              {openMistakes < course.mistakes.length && (
                <p className="mt-3 text-xs text-white/50 inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {course.mistakes.length - openMistakes} أغلاط ثانية تنفتح ويا الاشتراك</p>
              )}
            </section>

            {/* Quiz */}
            <section>
              <SectionTitle id="ch-quiz" icon={HelpCircle} sub="أسئلة قصيرة تتأكد بيها إنك فهمت الفصل.">اختبر نفسك</SectionTitle>
              <Quiz chapter={course} />
            </section>
          </div>
        </>
      )}

      {/* Practice: the matching playbook */}
      {playbook && (
        <button
          onClick={() => onNavigate({ view: "solution", id: playbook.id })}
          className={`group mt-12 sm:mt-16 w-full text-right glass-elevated glass-edge rounded-3xl p-5 sm:p-7 flex items-center gap-4 cursor-pointer ${focusRing}`}
        >
          <TopicIcon kind="playbook" id={playbook.id} size="lg" />
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-xs sm:text-sm font-bold text-vz-accent">إذا هاي مشكلتك هسه</span>
            <span className="block text-base sm:text-xl font-black text-white leading-snug">{playbook.title}</span>
            <span className="block text-xs sm:text-sm text-white/55">{playbook.steps.length} خطوات، {playbook.scripts.length} رسائل جاهزة، وخطة 7 أيام</span>
          </span>
          <ArrowLeft className="w-5 h-5 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
      )}

      {/* Finish + move on */}
      <div className="mt-4 sm:mt-5 glass rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-black text-white">{isDone ? "خلصت هذا الفصل" : "خلصت الفصل؟"}</p>
          <p className="text-xs sm:text-sm text-white/55 mt-1">{nextChapter ? <>الجاي: {nextChapter.title}</> : "هذا آخر فصل بالكورس."}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
          {prevChapter && (
            <button onClick={() => onNavigate({ view: "chapter", id: prevChapter.id })} className={`btn btn-ghost min-h-[48px] px-5 rounded-full text-sm gap-1.5 ${focusRing}`}>
              <ArrowRight className="w-4 h-4" />
              <span>الفصل السابق</span>
            </button>
          )}
          <button onClick={finishAndContinue} className={`btn btn-primary min-h-[48px] px-6 rounded-full text-sm gap-2 ${focusRing}`}>
            {!isDone && <Check className="w-4 h-4" strokeWidth={3} />}
            <span>{nextChapter ? (isDone ? "الفصل الجاي" : "خلصت، الفصل الجاي") : "خلصت الكورس"}</span>
            {nextChapter && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
