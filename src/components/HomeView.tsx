import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Bot, Calculator, CheckCircle2, Compass, Crown } from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { playbooksList } from "../data/playbooksData";
import { upcomingSeasons } from "./guide/GuideTools";
import { EASE_OUT } from "../lib/motion";
import { nextChapterId, stageOf, useCourseProgress } from "../lib/progress";
import type { Route } from "../lib/route";
import { isFreeTrialUser } from "./LockScreen";

interface HomeViewProps {
  userCode: string;
  onNavigate: (route: Route) => void;
  onOpenAdvisor: () => void;
  onOpenUpgrade: () => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE_OUT },
});

/**
 * "Start here": one obvious next step, how the site works in three steps,
 * and nothing else. Everything else lives on its own screen.
 */
export default function HomeView({ userCode, onNavigate, onOpenAdvisor, onOpenUpgrade }: HomeViewProps) {
  const progress = useCourseProgress(userCode);
  const doneCount = progress.done.filter((id) => chaptersList.some((c) => c.id === id)).length;
  const total = chaptersList.length;
  const nextId = nextChapterId(progress);
  const next = chaptersList.find((c) => c.id === nextId) ?? null;
  const nextIndex = next ? chaptersList.indexOf(next) : -1;
  const stage = next ? stageOf(next.id) : null;
  const started = doneCount > 0 || progress.last !== null;
  const finished = doneCount >= total;
  const percent = Math.round((doneCount / total) * 100);
  const nextSeason = upcomingSeasons(new Date(), 1)[0];

  const steps = [
    {
      n: 1,
      icon: BookOpen,
      title: "اقرأ الفصل",
      desc: "كل فصل يشرح خطوة وحدة بأمثلة من السوق العراقي.",
      cta: "الفصول",
      onClick: () => onNavigate({ view: "chapters" }),
    },
    {
      n: 2,
      icon: Calculator,
      title: "طبّق بالأدوات",
      desc: "احسب ربحك وتكلفة الرسالة بالدينار قبل لا تصرف.",
      cta: "الأدوات",
      onClick: () => onNavigate({ view: "tools" }),
    },
    {
      n: 3,
      icon: Bot,
      title: "اسأل المستشار",
      desc: "اكتب مشكلتك ويجاوبك حسب أرقام مشروعك.",
      cta: "المستشار",
      onClick: onOpenAdvisor,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-10 space-y-10 sm:space-y-14 text-right">
      {/* Greeting */}
      <motion.div {...rise(0.05)} className="space-y-2 sm:space-y-3">
        <p className="text-sm sm:text-base font-bold text-vz-accent">{started ? "هلا بيك مرة ثانية 👋" : "أهلاً بيك بـ فيزيون 👋"}</p>
        <h1 className="text-[1.75rem] sm:text-5xl font-black text-white tracking-tight leading-tight">
          {finished ? "خلصت الكورس كله، عاشت إيدك" : started ? "كمّل من وين ما وكفت" : "ابدأ من هنا، خطوة وحدة كل مرة"}
        </h1>
        <p className="text-sm sm:text-lg text-white/60 max-w-2xl leading-relaxed">
          {total} فصل قصير، أدوات تحسبلك أرقامك، ومستشار يجاوبك على مشروعك.
        </p>
      </motion.div>

      {/* The one next step */}
      <motion.section {...rise(0.15)} aria-label="خطوتك الجاية" className="glass-elevated glass-edge rounded-3xl sm:rounded-4xl p-5 sm:p-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-24 -left-24 w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(72,128,255,0.22),transparent_70%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {finished ? "راجع أي فصل تحتاجه" : "خطوتك الجاية"}
              </span>
              {/* Phones: progress as one compact line instead of a box */}
              <span className="md:hidden text-xs font-bold text-white/55 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {doneCount}/{total}
              </span>
            </div>
            {next && !finished ? (
              <>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl leading-none shrink-0" aria-hidden="true">{next.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white/55 font-bold">
                      الفصل {nextIndex + 1} من {total}
                      {stage && <> · {stage.stage.label}</>}
                    </p>
                    <h2 className="text-xl sm:text-3xl font-black text-white leading-snug mt-1">{next.title}</h2>
                    <p className="text-sm sm:text-base text-white/60 mt-1.5 leading-relaxed">{next.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={() => onNavigate({ view: "chapter", id: next.id })}
                    className={`btn btn-primary min-h-[50px] px-7 rounded-full text-sm sm:text-base gap-2 ${focusRing}`}
                  >
                    <span>{progress.last === next.id ? "كمّل الفصل" : started ? "ابدأ الفصل" : "ابدأ الفصل الأول"}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate({ view: "chapters" })}
                    className={`btn btn-ghost min-h-[50px] px-5 rounded-full text-sm ${focusRing}`}
                  >
                    شوف كل الفصول
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-3xl font-black text-white leading-snug">خلصت كل الفصول الـ {total} 🎉</h2>
                <p className="text-sm sm:text-base text-white/60">هسة استخدم الأدوات والمستشار على مشروعك كل أسبوع.</p>
                <button onClick={() => onNavigate({ view: "chapters" })} className={`btn btn-glass min-h-[50px] px-6 rounded-full text-sm ${focusRing}`}>
                  كل الفصول
                </button>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="hidden md:block md:w-56 shrink-0 glass-subtle rounded-3xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs sm:text-sm font-bold text-white/60">تقدّمك</span>
              <span className="text-lg sm:text-2xl font-black text-white font-mono">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount} aria-label="الفصول المكتملة">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
                className="h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400"
              />
            </div>
            <p className="text-xs text-white/55 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              خلصت {doneCount} من {total} فصول
            </p>
          </div>
        </div>
      </motion.section>

      {/* Problem → playbook shortcuts */}
      <motion.section {...rise(0.22)} aria-labelledby="home-solutions" className="space-y-4 sm:space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 id="home-solutions" className="text-lg sm:text-2xl font-black text-white">عندك مشكلة هسه؟</h2>
            <p className="text-xs sm:text-sm text-white/55">حلول كاملة خطوة بخطوة، ويا رسائل جاهزة تنسخها.</p>
          </div>
          <button onClick={() => onNavigate({ view: "solutions" })} className={`btn btn-ghost px-3 rounded-full text-xs sm:text-sm gap-1 shrink-0 ${focusRing}`}>
            كل الحلول
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {playbooksList.filter((pb) => ["message-cost", "ghosting", "more-sales"].includes(pb.id)).map((pb) => (
            <li key={pb.id}>
              <button
                onClick={() => onNavigate({ view: "solution", id: pb.id })}
                className={`group w-full h-full text-right glass glass-interactive rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex md:flex-col items-start gap-3.5 cursor-pointer ${focusRing}`}
              >
                <span className="text-2xl sm:text-3xl leading-none shrink-0" aria-hidden="true">{pb.icon}</span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="block text-sm sm:text-base font-black text-white leading-snug">«{pb.problem}»</span>
                  <span className="hidden md:inline-flex items-center gap-1 pt-2 text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                    شوف الحل
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </span>
                <ArrowLeft className="md:hidden w-4 h-4 text-white/45 shrink-0 self-center" />
              </button>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* How it works */}
      <motion.section {...rise(0.28)} aria-labelledby="how-it-works" className="space-y-4 sm:space-y-5">
        <h2 id="how-it-works" className="text-lg sm:text-2xl font-black text-white">شلون تستفاد من الموقع؟</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.n}>
                <button
                  onClick={step.onClick}
                  className={`group w-full h-full text-right glass glass-interactive rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex md:flex-col items-start gap-4 cursor-pointer ${focusRing}`}
                >
                  <span className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/85 group-hover:bg-vz-blue group-hover:border-vz-blue-light group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-vz-blue text-white text-[11px] font-black flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">{step.n}</span>
                  </span>
                  <span className="flex-1 min-w-0 space-y-1">
                    <span className="block text-base sm:text-lg font-black text-white">{step.title}</span>
                    <span className="block text-xs sm:text-sm text-white/55 leading-relaxed">{step.desc}</span>
                    <span className="hidden md:inline-flex items-center gap-1 pt-2 text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                      {step.cta}
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </motion.section>

      {/* Secondary: the Iraq Guide (with the next season) + (trial) upgrade */}
      <motion.div {...rise(0.34)} className={`grid grid-cols-1 gap-3 sm:gap-4 ${isFreeTrialUser(userCode) ? "md:grid-cols-2" : ""}`}>
        <button
          onClick={() => onNavigate({ view: "guide" })}
          className={`group text-right glass-subtle glass-interactive rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer ${focusRing}`}
        >
          <span className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-amber-200">
            <Compass className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm sm:text-base font-black text-white">الدليل العراقي: السوق، الدفع، التوصيل، الكمرك والقانون</span>
            <span className="block text-xs text-white/55 mt-0.5">
              {nextSeason ? <>الموسم الجاي: {nextSeason.title} بعد {nextSeason.days} يوم. شوف شنو تجهز.</> : "معلومات مبنية على بحث ومصادر عن البيع بالعراق."}
            </span>
          </span>
          <ArrowLeft className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        </button>

        {isFreeTrialUser(userCode) && (
          <button
            onClick={onOpenUpgrade}
            className={`group text-right glass-subtle glass-interactive rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer ${focusRing}`}
          >
            <span className="w-10 h-10 shrink-0 rounded-xl bg-vz-blue/30 border border-vz-blue-light/40 flex items-center justify-center text-white">
              <Crown className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm sm:text-base font-black text-white">افتح الكورس كامل</span>
              <span className="block text-xs text-white/55 mt-0.5">إنت هسة بالنسخة التجريبية. شوف الباقات.</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
