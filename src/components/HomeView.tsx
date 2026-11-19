import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calculator, CheckCircle2, Compass, Crown } from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { playbooksList } from "../data/playbooksData";
import { upcomingSeasons } from "./guide/GuideTools";
import { EASE_OUT } from "../lib/motion";
import { nextChapterId, stageOf, useCourseProgress } from "../lib/progress";
import type { Route } from "../lib/route";
import { isFreeTrialUser } from "./LockScreen";
import { TRIAL_PROBLEMS, diagnose, iqd, useTrialProfile } from "../lib/trial";
import { FULL_PRICE, OFFER_LAST_DAY, deadlineLabel, offerState, thousands } from "../lib/offer";
import { SubscribeButton } from "./OfferPrice";
import { TopicIcon } from "./ui/TopicIcon";

interface HomeViewProps {
  userCode: string;
  onNavigate: (route: Route) => void;
  onOpenAdvisor: () => void;
  onOpenUpgrade: () => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";
const rowClass = `group w-full min-h-[56px] py-3 flex items-center gap-3 text-right cursor-pointer transition-colors duration-200 hover:bg-white/[0.03] ${focusRing}`;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE_OUT },
});

export default function HomeView({ userCode, onNavigate, onOpenUpgrade }: HomeViewProps) {
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
  const offer = offerState();
  const trial = isFreeTrialUser(userCode);

  const progressBar = (
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount} aria-label="عدد الفصول المكتملة">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
          className="h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400"
        />
      </div>
      <p className="text-[13px] text-white/70 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        خلصت <span dir="ltr" className="font-bold text-white">{doneCount} / {total}</span> فصول
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-[4.5rem] lg:pt-32 pb-10 space-y-7 sm:space-y-12 text-right">
      <motion.div {...rise(0.05)} className="space-y-1.5 sm:space-y-3">
        <p className="text-[14px] sm:text-base font-bold text-vz-accent">{started ? "هلا بيك من جديد" : "أهلا بيك بمنصة فيزيون"}</p>
        <h1 className="text-[1.6rem] sm:text-5xl font-black text-white tracking-tight leading-tight">
          {finished ? "كملت الكورس كله، عاشت إيدك" : started ? "كمل من المكان اللي وقفت بيه" : "ابدأ من هنا، خطوة وحدة بكل مرة"}
        </h1>
        <p className="hidden sm:block text-lg text-white/70 max-w-2xl leading-relaxed">
          {total} فصل قصير، أدوات تحسبلك أرقامك، ومستشار يجاوبك على مشروعك.
        </p>
      </motion.div>

      <motion.section {...rise(0.12)} aria-label="خطوتك الجاية" className="glass-elevated glass-edge rounded-3xl sm:rounded-4xl p-5 sm:p-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-24 -left-24 w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(72,128,255,0.22),transparent_70%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <div className="flex-1 min-w-0 space-y-4">
            <span className="inline-flex items-center gap-2 text-[13px] sm:text-sm font-bold text-white/75">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {finished ? "راجع أي فصل تحتاجه" : "خطوتك الجاية"}
            </span>
            {next && !finished ? (
              <>
                <div className="flex items-start gap-3 sm:gap-4">
                  <TopicIcon kind="chapter" id={next.id} size="lg" />
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-sm text-white/70 font-bold">
                      الفصل {nextIndex + 1} من {total}
                      {stage && <>، {stage.stage.label}</>}
                    </p>
                    <h2 className="text-xl sm:text-3xl font-black text-white leading-snug mt-1">{next.title}</h2>
                    <p className="hidden sm:block text-base text-white/70 mt-1.5 leading-relaxed">{next.subtitle}</p>
                  </div>
                </div>
                <div className="md:hidden">{progressBar}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate({ view: "chapter", id: next.id })}
                    className={`btn btn-primary w-full sm:w-auto min-h-[52px] px-7 rounded-2xl sm:rounded-full text-base gap-2 ${focusRing}`}
                  >
                    <span>{progress.last === next.id ? "كمل الفصل" : started ? "ابدأ الفصل" : "ابدأ الفصل الأول"}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate({ view: "chapters" })}
                    className={`min-h-[44px] px-3 text-[14px] font-bold text-white/75 hover:text-white rounded-xl ${focusRing}`}
                  >
                    شوف كل الفصول
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-3xl font-black text-white leading-snug">خلصت كل الفصول الـ {total}</h2>
                <p className="text-[15px] sm:text-base text-white/70">هسه تكدر تستخدم الأدوات والمستشار على مشروعك كل أسبوع.</p>
                <button onClick={() => onNavigate({ view: "chapters" })} className={`btn btn-glass min-h-[50px] px-6 rounded-full text-sm ${focusRing}`}>
                  كل الفصول
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:block md:w-56 shrink-0 space-y-3 border-r border-white/10 pr-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white/70">نسبة تقدمك</span>
              <span dir="ltr" className="text-2xl font-black text-white font-mono">{percent}%</span>
            </div>
            {progressBar}
          </div>
        </div>
      </motion.section>

      {trial && <TrialHomeCard />}

      <motion.section {...rise(0.2)} aria-labelledby="home-solutions" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 id="home-solutions" className="text-lg sm:text-2xl font-black text-white">عندك مشكلة حاليا؟</h2>
            <p className="hidden sm:block text-sm text-white/70">حلول كاملة خطوة بخطوة، ويا رسائل جاهزة تكدر تنسخها وتستخدمها.</p>
          </div>
          <button onClick={() => onNavigate({ view: "solutions" })} className={`min-h-[44px] px-2 text-[14px] font-bold text-vz-accent inline-flex items-center gap-1 shrink-0 rounded-xl ${focusRing}`}>
            كل الحلول
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {playbooksList.filter((pb) => ["message-cost", "ghosting", "more-sales"].includes(pb.id)).map((pb) => (
            <li key={pb.id}>
              <button onClick={() => onNavigate({ view: "solution", id: pb.id })} className={rowClass}>
                <TopicIcon kind="playbook" id={pb.id} size="sm" />
                <span className="flex-1 min-w-0 text-[15px] sm:text-base font-bold text-white leading-snug">{pb.problem}</span>
                <ArrowLeft className="w-4 h-4 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.ul {...rise(0.28)} className="divide-y divide-white/10 border-y border-white/10">
        <li>
          <button onClick={() => onNavigate({ view: "guide" })} className={rowClass}>
            <span className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-vz-accent">
              <Compass className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] sm:text-base font-black text-white">الدليل العراقي</span>
              <span className="block text-[13px] text-white/70 mt-0.5 leading-snug">
                {nextSeason ? <>الموسم الجاي: {nextSeason.title} بعد {nextSeason.days} يوم</> : "السوق والدفع والتوصيل والكمرك والقانون"}
              </span>
            </span>
            <ArrowLeft className="w-4 h-4 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </li>
        {trial && (
          <li>
            <button onClick={onOpenUpgrade} className={rowClass}>
              <span className="w-10 h-10 shrink-0 rounded-xl bg-vz-blue/30 border border-vz-blue-light/40 flex items-center justify-center text-white">
                <Crown className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] sm:text-base font-black text-white">افتح الكورس كامل</span>
                <span className="block text-[13px] text-white/70 mt-0.5">{offer.active ? `${thousands(offer.price)} بدل ${thousands(FULL_PRICE)}، لحد ${OFFER_LAST_DAY}` : `${thousands(offer.price)}، مدى الحياة`}</span>
              </span>
              <ArrowLeft className="w-4 h-4 text-white/60 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          </li>
        )}
      </motion.ul>
    </div>
  );
}

function TrialHomeCard() {
  const profile = useTrialProfile();
  const offer = offerState();
  const openCheck = () => window.dispatchEvent(new CustomEvent("open-trial-onboarding"));

  if (!profile) {
    return (
      <motion.button
        {...rise(0.16)}
        onClick={openCheck}
        className={`group w-full text-right rounded-2xl border border-vz-blue-light/30 bg-vz-blue/[0.12] p-4 sm:p-6 flex items-center gap-3.5 cursor-pointer transition-colors hover:bg-vz-blue/[0.18] ${focusRing}`}
      >
        <span className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          <Calculator className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0 space-y-0.5">
          <span className="block text-[15px] sm:text-xl font-black text-white leading-snug">اعرف ربحك الحقيقي من كل طلب بدقيقة</span>
          <span className="block text-[13px] sm:text-sm text-white/70">اكتب سعر البيع والكلفة، ونحسبلك وين تروح فلوسك.</span>
        </span>
        <ArrowLeft className="w-5 h-5 text-white/70 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
      </motion.button>
    );
  }

  const d = diagnose(profile);
  const problem = TRIAL_PROBLEMS.find((p) => p.id === profile.problem);
  const pb = playbooksList.find((p) => p.id === profile.problem);
  const tone = d.real <= 0 ? "text-red-300" : d.real < d.thinks * 0.4 ? "text-sky-200" : "text-emerald-300";

  return (
    <motion.section {...rise(0.16)} aria-label="نتيجة مشروعك" className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-7 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[13px] sm:text-sm font-bold text-vz-accent">نتيجة مشروعك{problem ? `، ${problem.label}` : ""}</p>
          <p className="text-[14px] text-white/75">
            احسب ربحك <span dir="ltr" className="font-mono line-through text-white/70">{iqd(d.thinks)}</span>، هذا المبلغ اللي يبقالك من كل طلب:
          </p>
          <p className={`text-3xl sm:text-4xl font-black font-mono ${tone}`}><span dir="ltr">{iqd(d.real)}</span> <span className="text-sm text-white/70 font-sans font-bold">دينار</span></p>
          {pb && <p className="text-[13px] sm:text-sm text-white/70">حلك جاهز: {pb.title}</p>}
        </div>
        <div className="sm:w-72 shrink-0 space-y-2">
          <SubscribeButton label="افتح الحل بالكامل" />
          <p className="text-[12px] text-center text-white/65">
            {offer.active ? `${thousands(offer.price)} بدل ${thousands(FULL_PRICE)}، ${deadlineLabel(offer)}` : `${thousands(offer.price)}، مدى الحياة`}
          </p>
        </div>
      </div>
      <button onClick={openCheck} className={`min-h-[44px] text-right text-[13px] sm:text-sm font-bold text-white/75 inline-flex items-center gap-1.5 rounded-xl ${focusRing}`}>
        شوف النتيجة كاملة، وشكد راح يفرق وياك إذا حليت المشكلة
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
      </button>
    </motion.section>
  );
}
