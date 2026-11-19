import React, { useCallback, useEffect, useRef, useState } from "react";
import { EASE_OUT, allowBlur } from "../lib/motion";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Segmented } from "./ui/Segmented";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock, ClipboardList,
  FileText, HelpCircle, Lightbulb, Lock, Play, RotateCcw, Target, TrendingUp, Wrench, X,
} from "lucide-react";
import LessonPlayer from "./LessonPlayer";
import { isFreeTrialUser } from "./LockScreen";
import { isTrialChapter } from "../lib/trial";
import { LockChip, TrialLock } from "./TrialLock";
import { TopicIcon } from "./ui/TopicIcon";
import { CopyButton } from "./ui/CopyButton";
import { chaptersList } from "../data/chaptersData";
import { courseChapters, chapterMinutes, lessonMinutes, type Block, type CourseChapter } from "../data/course";
import { chapterPlaybook, playbooksList } from "../data/playbooksData";
import { setChapterDone, setLastChapter, setLessonDone, stageOf, togglePlanDay, useCourseProgress, useLessonsDone, usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import type { PlaybookCalculator as CalculatorKind } from "../data/playbooksData";

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

const CHAPTER_TOOL: Record<string, { label: string; render: () => React.ReactNode }> = {
  chapter1: { label: "حاسبة تجربة الحملة الإعلانية", render: () => <RoiCalculator /> },
  chapter2: { label: "شكد تزيد مبيعاتك بدون ما تزيد ميزانية الإعلان", render: () => <PlaybookCalculator kind={"sales-levers" as CalculatorKind} /> },
  chapter3: { label: "حاسبات التسعير والأرباح", render: () => <AdvancedCalculatorSuite /> },
  chapter4: { label: "شكد تكدر تدفع على الرسالة", render: () => <PlaybookCalculator kind={"max-message-cost" as CalculatorKind} /> },
  chapter5: { label: "شوف إعلانك شلون راح يطلع قبل لا تنشره", render: () => <AdSimulator /> },
  chapter7: { label: "شكد تزيد مبيعاتك إذا حسنت ردودك", render: () => <PlaybookCalculator kind={"sales-levers" as CalculatorKind} /> },
  chapter8: { label: "مكالمات جاهزة حسب نوع الزبون", render: () => <ScriptSimulator /> },
  chapter9: { label: "شكد تكلفك الطلبات الراجعة", render: () => <PlaybookCalculator kind={"returns-cost" as CalculatorKind} /> },
  chapter10: { label: "حاسبات الأرقام واتخاذ القرارات", render: () => <AdvancedCalculatorSuite /> },
  chapter11: { label: "خطة 30 يوم حتى توصل لأول 100 طلب", render: () => <ThirtyDayPlan /> },
};

const minutesLabel = (n: number) => `${n} ${n <= 10 ? "دقايق" : "دقيقة"}`;

const TABS = [
  { id: "lessons", label: "الدروس", title: "الدروس" },
  { id: "practice", label: "تطبيق", title: "طبق على مشروعك" },
  { id: "templates", label: "قوالب", title: "رسائل وقوالب جاهزة" },
  { id: "example", label: "مثال", title: "مثال بالأرقام" },
  { id: "mistakes", label: "أخطاء", title: "أخطاء انتبه لا توقع بيها" },
  { id: "quiz", label: "اختبار", title: "اختبر نفسك" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const BLUR = allowBlur();
const PANEL_SPRING = { type: "spring", stiffness: 340, damping: 34, mass: 0.85 } as const;
const panelMotion: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? -28 : 28, ...(BLUR ? { filter: "blur(6px)" } : {}) }),
  center: {
    opacity: 1,
    x: 0,
    ...(BLUR ? { filter: "blur(0px)", transitionEnd: { filter: "none" } } : {}),
    transition: { x: PANEL_SPRING, opacity: { duration: 0.28, ease: EASE_OUT }, filter: { duration: 0.32, ease: EASE_OUT } },
  },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? 20 : -20, ...(BLUR ? { filter: "blur(4px)" } : {}), transition: { duration: 0.16, ease: EASE_OUT } }),
};

function NextTab({ to, onGo }: { to: Tab; onGo: (t: Tab) => void }) {
  const t = TABS.find((x) => x.id === to)!;
  return (
    <button
      onClick={() => onGo(to)}
      className={`group mt-8 w-full flex items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl glass text-right cursor-pointer active:scale-[0.985] transition-transform duration-200 ${focusRing}`}
    >
      <span className="min-w-0">
        <span className="block text-xs font-bold text-white/50">الدرس الجاي بهذا الفصل</span>
        <span className="block text-base sm:text-lg font-black text-white mt-0.5">{t.title}</span>
      </span>
      <span className="w-10 h-10 shrink-0 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:-translate-x-1">
        <ArrowLeft className="w-4 h-4 text-white" />
      </span>
    </button>
  );
}

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
    case "visual":
    case "check":
    case "apply":
      return null;
    case "image":
      return (
        <figure className="space-y-2">
          <img src={block.src} alt={block.alt ?? block.caption} className="w-full h-auto rounded-2xl" />
          <figcaption className="text-xs text-white/55">{block.caption}</figcaption>
        </figure>
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
  const [at, setAt] = useState(0);
  const total = chapter.quiz.length;
  const finished = at >= total;
  const right = chapter.quiz.filter((q, i) => picked[i] === q.answer).length;

  if (finished) {
    return (
      <div className="glass-elevated glass-edge rounded-3xl p-6 sm:p-8 text-center">
        <p className="text-sm font-bold text-white/55 mb-2">نتيجتك</p>
        <p className="text-6xl sm:text-7xl font-black text-white mb-3" dir="ltr">{right}/{total}</p>
        <p className="text-base text-white/75 mb-6">{right === total ? "فاهم الفصل كله. كمل للفصل الجاي." : "راجع الدروس اللي جاوبت بيها غلط، وجرب الاختبار مرة ثانية."}</p>
        <button onClick={() => { setPicked({}); setAt(0); }} className={`btn btn-glass min-h-[48px] px-6 rounded-2xl text-sm ${focusRing}`}>عيد الاختبار</button>
      </div>
    );
  }

  const q = chapter.quiz[at];
  const choice = picked[at];
  const done = choice !== undefined;
  return (
    <div className="glass-elevated glass-edge rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-sm font-black text-vz-accent">السؤال {at + 1} من {total}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          {chapter.quiz.map((qq, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < at ? (picked[i] === qq.answer ? "bg-emerald-400" : "bg-red-400") : i === at ? "bg-white" : "bg-white/15"}`} />
          ))}
        </span>
      </div>
      <p className="text-lg sm:text-2xl font-black text-white leading-relaxed mb-5">{q.q}</p>
      <div className="grid gap-2.5">
        {q.options.map((opt, oi) => {
          const isRight = oi === q.answer;
          const state = !done ? "idle" : isRight ? "right" : oi === choice ? "wrong" : "idle";
          return (
            <button
              key={opt}
              disabled={done}
              onClick={() => setPicked((p) => ({ ...p, [at]: oi }))}
              className={`w-full text-right flex items-center gap-3 p-4 rounded-2xl border text-base leading-relaxed transition-colors min-h-[56px] ${focusRing} ${
                state === "right" ? "bg-emerald-400/[0.12] border-emerald-400/45 text-white"
                  : state === "wrong" ? "bg-red-500/[0.1] border-red-400/40 text-white"
                    : done ? "bg-white/[0.02] border-white/[0.06] text-white/45"
                      : "bg-white/[0.04] border-white/12 text-white/90 hover:bg-white/[0.08] cursor-pointer"
              }`}
            >
              <span className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center ${state === "right" ? "bg-emerald-400 border-emerald-300 text-[#062018]" : state === "wrong" ? "bg-red-400 border-red-300 text-[#2a0606]" : "border-white/25"}`}>
                {state === "right" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                {state === "wrong" && <X className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
          <p className={`text-base font-black ${choice === q.answer ? "text-emerald-300" : "text-red-300"}`}>{choice === q.answer ? "صح" : "مو هذا"}</p>
          <p className="text-sm sm:text-base text-white/75 leading-relaxed">{q.why}</p>
          <button onClick={() => setAt((a) => a + 1)} className={`btn btn-primary min-h-[52px] px-6 rounded-2xl text-base gap-2 ${focusRing}`}>
            <span>{at + 1 < total ? "السؤال الجاي" : "شوف نتيجتك"}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function MistakeCard({ m }: { key?: React.Key; m: CourseChapter["mistakes"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="glass rounded-3xl p-5 sm:p-6">
      <p className="flex items-start gap-3 text-base sm:text-lg font-black text-white leading-snug">
        <span className="w-8 h-8 shrink-0 rounded-xl bg-red-500/15 text-red-300 flex items-center justify-center"><X className="w-4 h-4" strokeWidth={3} /></span>
        <span className="pt-0.5">{m.mistake}</span>
      </p>
      {open ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3 pr-11">
          <p className="text-sm sm:text-base text-white/65 leading-relaxed"><span className="font-black text-white/80">سبب الإجابة الغلط: </span>{m.why}</p>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1 text-emerald-300" strokeWidth={3} /><span><span className="font-black">الإجابة الصحيحة: </span>{m.fix}</span></p>
        </motion.div>
      ) : (
        <button onClick={() => setOpen(true)} className={`mt-4 mr-11 btn btn-glass min-h-[40px] px-4 rounded-xl text-sm ${focusRing}`}>شنو الإجابة الصحيحة؟</button>
      )}
    </li>
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

  useEffect(() => {
    setLastChapter(userCode, chapter.id);
  }, [userCode, chapter.id]);

  const lessonsDone = useLessonsDone(userCode);
  const doneLessons = new Set(
    lessonsDone.filter((x) => x.startsWith(`${chapter.id}:`)).map((x) => Number(x.split(":")[1])),
  );
  const nextLesson = course.lessons.findIndex((_, i) => i < openLessons && !doneLessons.has(i));
  const [playing, setPlaying] = useState<number | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const closePlayer = useCallback(() => setPlaying(null), []);
  const markLessonDone = useCallback((i: number) => setLessonDone(userCode, chapter.id, i), [userCode, chapter.id]);

  const [tab, setTab] = useState<Tab>("lessons");
  const [tabDir, setTabDir] = useState(1);
  const tabsTop = useRef<HTMLDivElement>(null);
  const tabIndex = TABS.findIndex((t) => t.id === tab);

  const openTab = (next: Tab) => {
    if (next === tab) return;
    setTabDir(TABS.findIndex((t) => t.id === next) > tabIndex ? 1 : -1);
    setTab(next);
    const el = tabsTop.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 84;
    if (window.scrollY > top + 2) window.scrollTo({ top, behavior: "smooth" });
  };

  const jump = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  };

  const outcomesBox = (
    <div className="glass rounded-3xl p-5 sm:p-6 space-y-3">
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
  );

  const finishAndContinue = () => {
    setChapterDone(userCode, chapter.id, true);
    onNavigate(nextChapter ? { view: "chapter", id: nextChapter.id } : { view: "chapters" });
  };

  return (
    <section id={chapter.id} className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 relative text-right">
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <button onClick={() => onNavigate({ view: "chapters" })} className={`btn btn-ghost px-3 -mr-3 rounded-full text-xs sm:text-sm gap-1.5 ${focusRing}`}>
          <ArrowRight className="w-4 h-4" />
          <span>كل الفصول</span>
        </button>
        <span dir="ltr" className="text-xs text-white/50 font-mono">{chapterIndex + 1} / {chaptersList.length}</span>
      </div>

      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-white/55">
          <span className="text-vz-accent">{chapter.number}</span>
          {stage && <><span>المرحلة {stage.index + 1}: {stage.stage.label}</span></>}
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{minutesLabel(minutes)}</span>
            <span>{course.lessons.length} دروس</span>
          </span>
          {trialLocked && <LockChip label="بالتجربة تكدر تشوف المحتوى بس" />}
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
        <div>
          <p className={`text-[15px] sm:text-lg text-white/65 leading-relaxed ${goalOpen ? "" : "line-clamp-3 sm:line-clamp-none"}`}>{course.goal}</p>
          {!goalOpen && (
            <button type="button" onClick={() => setGoalOpen(true)} className={`sm:hidden mt-1 min-h-[36px] text-[14px] font-bold text-vz-accent ${focusRing}`}>
              اقرا هدف الفصل كامل
            </button>
          )}
        </div>
        {!trialLocked && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => setPlaying(nextLesson >= 0 ? nextLesson : 0)}
              className={`btn btn-primary w-full sm:w-auto min-h-[52px] px-7 rounded-2xl text-base gap-2 ${focusRing}`}
            >
              {nextLesson >= 0 ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
              <span>{nextLesson < 0 ? "عيد الفصل من البداية" : nextLesson === 0 ? "ابدأ بالدرس الأول" : `كمل، الدرس ${nextLesson + 1}`}</span>
            </button>
            <span className="text-sm font-bold text-white/55">
              خلصت {doneLessons.size} من {course.lessons.length} دروس
            </span>
          </div>
        )}
      </motion.header>

      {trialLocked ? (
        <div className="space-y-4">
          {outcomesBox}
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
            title="هذا الفصل متاح ويا الاشتراك الكامل"
            desc={`${course.lessons.length} دروس مفصلة، ${course.practice.tasks.length} مهام تطبقها على مشروعك، ${course.templates.length} رسائل وقوالب جاهزة، مثال بالأرقام، واختبار قصير.`}
            cta="افتح الكورس كامل"
          />
        </div>
      ) : (
        <>
          <div ref={tabsTop} aria-hidden="true" />
          <nav aria-label="أقسام الفصل" className="vz-tabs-sticky sticky top-[4.75rem] sm:top-[4.9rem] z-20 mb-6 sm:mb-8">
            <Segmented
              items={TABS.map((t) => ({
                id: t.id,
                label: t.label,
                done:
                  (t.id === "lessons" && doneLessons.size === course.lessons.length) ||
                  (t.id === "practice" && ticked.size === course.practice.tasks.length),
              }))}
              active={tab}
              onChange={(id) => openTab(id as Tab)}
              layoutId={`chapter-tab-${chapter.id}`}
              label="أقسام الفصل"
            />
          </nav>

          <AnimatePresence mode="wait" initial={false} custom={tabDir}>
            <motion.div key={tab} custom={tabDir} variants={panelMotion} initial="enter" animate="center" exit="exit" role="tabpanel" aria-label={TABS[tabIndex].title}>
              {tab === "lessons" && (
                <section>
                  <SectionTitle id="ch-lessons" icon={BookOpen} sub="كل درس تمشي بيه خطوة خطوة: تفهم الفكرة، تشوفها بالرسوم والأرقام، تجربها بنفسك، وبالأخير تطبقها على منتجك.">الدروس</SectionTitle>
                  <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden mb-5" role="progressbar" aria-valuemin={0} aria-valuemax={course.lessons.length} aria-valuenow={doneLessons.size} aria-label="الدروس اللي كملتها">
                    <div className="h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400 transition-[width] duration-500" style={{ width: `${Math.round((doneLessons.size / course.lessons.length) * 100)}%` }} />
                  </div>
                  <ol className="relative space-y-3">
                    {course.lessons.map((l, i) => {
                      const locked = i >= openLessons;
                      const done = doneLessons.has(i);
                      const isNext = i === nextLesson;
                      return (
                        <motion.li
                          key={l.title}
                          className="relative"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.04 + i * 0.05, ease: EASE_OUT }}
                        >
                          {i < course.lessons.length - 1 && (
                            <span aria-hidden="true" className={`absolute right-[35px] sm:right-[43px] top-16 sm:top-[4.5rem] bottom-[-12px] w-0.5 ${done ? "bg-emerald-400/50" : "bg-white/10"}`} />
                          )}
                          <button
                            onClick={() => (locked ? jump("ch-lessons-locked") : setPlaying(i))}
                            className={`relative w-full flex items-center gap-4 p-3 sm:p-4 rounded-3xl text-right cursor-pointer active:scale-[0.985] transition-[transform,background-color] duration-200 ${
                              isNext ? "glass-elevated glass-edge" : "hover:bg-white/[0.04] active:bg-white/[0.04]"
                            } ${focusRing}`}
                          >
                            <span
                              className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black ${
                                done
                                  ? "bg-emerald-400/15 border border-emerald-400/40 text-emerald-300"
                                  : isNext
                                    ? "bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_-10px_rgba(47,107,255,0.7)]"
                                    : locked
                                      ? "bg-white/[0.03] border border-white/[0.08] text-white/35"
                                      : "bg-white/[0.06] border border-white/10 text-white/80"
                              }`}
                            >
                              {done ? <Check className="w-6 h-6" strokeWidth={3} /> : locked ? <Lock className="w-5 h-5" /> : isNext ? <Play className="w-5 h-5" /> : i + 1}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-xs sm:text-sm font-bold text-white/50">الدرس {i + 1}، {minutesLabel(lessonMinutes(l))}</span>
                              <span className={`block text-base sm:text-lg font-black leading-snug mt-0.5 ${locked ? "text-white/45" : "text-white"}`}>{l.title}</span>
                            </span>
                            {!locked && (
                              <span className={`inline-flex items-center gap-1.5 text-sm font-black shrink-0 ${isNext ? "text-white" : "text-white/55"}`}>
                                <span className="hidden sm:inline">{done ? "إعادة الدرس" : isNext ? "ابدأ" : "افتح"}</span>
                                <ArrowLeft className="w-4 h-4" />
                              </span>
                            )}
                          </button>
                        </motion.li>
                      );
                    })}
                  </ol>
                  {openLessons < course.lessons.length && (
                    <div className="mt-6">
                      <TrialLock
                        id="ch-lessons-locked"
                        title="باقي الدروس متاحة ويا الاشتراك"
                        desc="جربت الدرس الأول. باقي الدروس بنفس الطريقة، خطوة خطوة، ويا رسوم وأمثلة وأسئلة."
                        items={course.lessons.slice(openLessons).map((l, i) => `الدرس ${openLessons + i + 1}: ${l.title}`)}
                        cta="افتح الكورس كامل"
                      />
                    </div>
                  )}
                  <div className="mt-8">{outcomesBox}</div>
                  <NextTab to="practice" onGo={openTab} />
                </section>
              )}

              {tab === "practice" && (
                <section>
                  <SectionTitle id="ch-practice" icon={ClipboardList} sub={course.practice.intro}>طبق على مشروعك</SectionTitle>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={course.practice.tasks.length} aria-valuenow={ticked.size} aria-label="تقدمك بالتطبيق">
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
                            className={`w-full flex items-start gap-3 p-4 rounded-2xl text-right cursor-pointer active:scale-[0.985] transition-[transform,background-color,border-color] duration-300 ${done ? "bg-emerald-400/[0.08] border border-emerald-400/25" : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06]"} ${focusRing}`}
                          >
                            <span className={`w-6 h-6 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center transition-colors duration-300 ${done ? "bg-emerald-400 border-emerald-300 text-[#062018]" : "border-white/25"}`}>
                              <AnimatePresence initial={false}>
                                {done && (
                                  <motion.span initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 26 }} className="flex">
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </span>
                            <span className="min-w-0 space-y-1">
                              <span className={`block text-sm sm:text-base font-black ${done ? "text-white/60" : "text-white"}`}>{task.title}</span>
                              <span className="block text-sm text-white/70 leading-relaxed">{task.detail}</span>
                              <span className="block text-xs text-emerald-200/80 leading-relaxed"><span className="font-bold">راح تطلع بـ: </span>{task.output}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {tool && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-vz-accent" /> الأداة: {tool.label}</h3>
                      <React.Suspense fallback={<div className="p-4 text-center text-white/60 text-sm">جاري التحميل...</div>}>{tool.render()}</React.Suspense>
                    </div>
                  )}
                  <NextTab to="templates" onGo={openTab} />
                </section>
              )}

              {tab === "templates" && (
                <section>
                  <SectionTitle id="ch-templates" icon={FileText} sub="انسخها، وبدل الكلام اللي بين الأقواس [ ] بتفاصيل مشروعك، واستخدمها.">رسائل وقوالب جاهزة</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {course.templates.slice(0, openTemplates).map((t) => (
                      <div key={t.title} className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-white">{t.title}</h3>
                            <p className="text-xs text-white/55 mt-0.5 leading-relaxed"><span className="font-bold text-white/65">متى تستخدمها: </span>{t.when}</p>
                          </div>
                          <CopyButton text={t.text} />
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-sm text-white/90 leading-relaxed p-3.5 rounded-xl bg-black/25 border border-white/[0.06]">{t.text}</pre>
                        {t.note && <p className="text-xs text-white/60 leading-relaxed pr-3 border-r-2 border-white/15">{t.note}</p>}
                      </div>
                    ))}
                    {openTemplates < course.templates.length && (
                      <TrialLock
                        title="باقي القوالب متاحة ويا الاشتراك"
                        items={course.templates.slice(openTemplates).map((t) => t.title)}
                        cta="افتح كل القوالب"
                      />
                    )}
                  </div>
                  <NextTab to="example" onGo={openTab} />
                </section>
              )}

              {tab === "example" && (
                <section>
                  <SectionTitle id="ch-example" icon={TrendingUp} sub={isFreeTrial ? undefined : course.example.setup}>{`مثال بالأرقام: ${course.example.title}`}</SectionTitle>
                  {isFreeTrial ? (
                    <TrialLock title="المثال بالأرقام متاح ويا الاشتراك" desc="مثال محسوب خطوة بخطوة: الأرقام قبل وبعد، وشنو اللي تغير بالضبط." cta="افتح الكورس كامل" />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.example.rows.map((r, ri) => {
                          const last = ri === course.example.rows.length - 1;
                          return (
                            <motion.div
                              key={r.label}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.45, delay: 0.05 + ri * 0.06, ease: EASE_OUT }}
                              className={`${last ? "glass-elevated glass-edge sm:col-span-2" : "glass"} rounded-3xl p-5`}
                            >
                              <p className="text-sm font-black text-white/65 mb-3">{r.label}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-base sm:text-lg text-red-300/90 line-through decoration-red-400/60">{r.before}</span>
                                <ArrowLeft className="w-5 h-5 text-white/40 shrink-0" />
                                <span className={`${last ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} font-black text-emerald-300`}>{r.after}</span>
                              </div>
                            </motion.div>
                          );
                        })}
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
                  <NextTab to="mistakes" onGo={openTab} />
                </section>
              )}

              {tab === "mistakes" && (
                <section>
                  <SectionTitle id="ch-mistakes" icon={AlertTriangle}>أخطاء انتبه لا توقع بيها</SectionTitle>
                  <ul className="space-y-3">
                    {course.mistakes.slice(0, openMistakes).map((m) => (
                      <MistakeCard key={m.mistake} m={m} />
                    ))}
                  </ul>
                  {openMistakes < course.mistakes.length && (
                    <p className="mt-3 text-xs text-white/50 inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {course.mistakes.length - openMistakes} أغلاط ثانية تنفتح ويا الاشتراك</p>
                  )}
                  <NextTab to="quiz" onGo={openTab} />
                </section>
              )}

              {tab === "quiz" && (
                <section>
                  <SectionTitle id="ch-quiz" icon={HelpCircle} sub="أسئلة قصيرة حتى تتأكد من فهمك للفصل.">اختبر نفسك</SectionTitle>
                  <Quiz chapter={course} />
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {playbook && (
        <button
          onClick={() => onNavigate({ view: "solution", id: playbook.id })}
          className={`group mt-12 sm:mt-16 w-full text-right glass-elevated glass-edge rounded-3xl p-5 sm:p-7 flex items-center gap-4 cursor-pointer ${focusRing}`}
        >
          <TopicIcon kind="playbook" id={playbook.id} size="lg" />
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-xs sm:text-sm font-bold text-vz-accent">إذا هاي هي مشكلتك حاليا</span>
            <span className="block text-base sm:text-xl font-black text-white leading-snug">{playbook.title}</span>
            <span className="block text-xs sm:text-sm text-white/55">{playbook.steps.length} خطوات، {playbook.scripts.length} رسائل جاهزة، وخطة 7 أيام</span>
          </span>
          <ArrowLeft className="w-5 h-5 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
      )}

      <div className="mt-4 sm:mt-5 glass rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-black text-white">{isDone ? "أنهيت هذا الفصل" : "كملت الفصل؟"}</p>
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
            <span>{nextChapter ? (isDone ? "الفصل الجاي" : "كملت، انتقل للفصل الجاي") : "كملت الكورس"}</span>
            {nextChapter && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {playing !== null && (
          <LessonPlayer
            key="lesson-player"
            chapterId={course.id}
            chapterLabel={chapter.number}
            lessons={course.lessons}
            index={playing}
            openLessons={openLessons}
            onOpenLesson={setPlaying}
            onDone={markLessonDone}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
