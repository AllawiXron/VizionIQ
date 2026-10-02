import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle, ArrowRight, BookOpen, Bot, Check, CheckCircle2, Clock, Copy,
  Gauge, ListChecks, MessageSquareText, Search, TrendingUp, Wrench, X,
} from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { playbooksList } from "../data/playbooksData";
import { guideModules, playbookGuide } from "../data/iraqGuideData";
import { EASE_OUT } from "../lib/motion";
import { togglePlanDay, usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import { PlaybookCalculator } from "./playbook/PlaybookCalculator";

interface PlaybookViewProps {
  key?: string;
  id: string;
  userCode: string;
  onNavigate: (route: Route) => void;
  onOpenAdvisor: () => void;
  onOpenTool: (toolId: string) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

const SECTIONS = [
  { id: "pb-numbers", label: "الأرقام", icon: Gauge },
  { id: "pb-causes", label: "الأسباب", icon: Search },
  { id: "pb-steps", label: "الخطوات", icon: ListChecks },
  { id: "pb-scripts", label: "رسائل جاهزة", icon: MessageSquareText },
  { id: "pb-example", label: "مثال", icon: TrendingUp },
  { id: "pb-plan", label: "خطة 7 أيام", icon: CheckCircle2 },
];

function SectionTitle({ id, icon: Icon, children, sub }: { id: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; sub?: string }) {
  return (
    <div id={id} className="scroll-mt-36 space-y-1.5 mb-4 sm:mb-5">
      <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2.5">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-vz-accent shrink-0" />
        {children}
      </h2>
      {sub && <p className="text-sm text-white/55 leading-relaxed">{sub}</p>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className={`btn btn-glass px-3.5 min-h-[36px] rounded-full text-xs gap-1.5 shrink-0 ${focusRing}`} aria-live="polite">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "انتسخت" : "انسخ"}</span>
    </button>
  );
}

/** One playbook: diagnose with numbers, fix in order, copy the messages, follow the 7-day plan. */
export default function PlaybookView({ id, userCode, onNavigate, onOpenAdvisor, onOpenTool }: PlaybookViewProps) {
  const pb = playbooksList.find((p) => p.id === id) ?? playbooksList[0];
  const plans = usePlaybookPlans(userCode);
  const ticked = new Set(plans[pb.id] ?? []);
  const planPercent = Math.round((ticked.size / pb.plan.length) * 100);

  const jump = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  };

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 text-right">
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <button onClick={() => onNavigate({ view: "solutions" })} className={`btn btn-ghost px-3 -mr-3 rounded-full text-xs sm:text-sm gap-1.5 ${focusRing}`}>
          <ArrowRight className="w-4 h-4" />
          <span>كل الحلول</span>
        </button>
        <span className="text-xs text-white/50 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pb.minutes} دقيقة قراءة</span>
      </div>

      {/* Title */}
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-4 mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-white/60 leading-relaxed">
          <span className="text-2xl ml-2 align-middle" aria-hidden="true">{pb.icon}</span>«{pb.problem}»
        </p>
        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">{pb.title}</h1>
        <p className="text-sm sm:text-lg text-white/70 leading-relaxed">{pb.promise}</p>
        {ticked.size > 0 && (
          <p className="text-xs font-bold text-emerald-300 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> خلصت {ticked.size} من {pb.plan.length} أيام بالخطة
          </p>
        )}
      </motion.header>

      {/* In-page sections */}
      <nav aria-label="أقسام الحل" className="sticky top-[4.5rem] sm:top-[4.75rem] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-10">
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

      <div className="space-y-12 sm:space-y-16">
        {/* Numbers */}
        <section>
          <SectionTitle id="pb-numbers" icon={Gauge} sub={pb.metrics.intro}>شلون تعرف إن هاي مشكلتك؟</SectionTitle>
          <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 px-5 py-3 text-xs font-bold text-white/50 border-b border-white/[0.07]">
              <span>الرقم</span>
              <span className="text-emerald-300/90">زين</span>
              <span className="text-amber-200/90">انتبه</span>
              <span className="text-red-300/90">مشكلة</span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {pb.metrics.rows.map((row) => (
                <li key={row.label} className="px-4 sm:px-5 py-3.5 grid grid-cols-3 sm:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-3 gap-y-2 items-center text-sm">
                  <span className="col-span-3 sm:col-span-1 font-bold text-white">{row.label}</span>
                  <span className="text-emerald-300 text-xs sm:text-sm"><span className="sm:hidden text-white/40 block text-[10px]">زين</span>{row.good}</span>
                  <span className="text-amber-200 text-xs sm:text-sm"><span className="sm:hidden text-white/40 block text-[10px]">انتبه</span>{row.warning}</span>
                  <span className="text-red-300 text-xs sm:text-sm"><span className="sm:hidden text-white/40 block text-[10px]">مشكلة</span>{row.bad}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-xs text-white/50 leading-relaxed">{pb.metrics.note}</p>
          {pb.calculator && (
            <div className="mt-6">
              <PlaybookCalculator kind={pb.calculator} />
            </div>
          )}
        </section>

        {/* Causes */}
        <section>
          <SectionTitle id="pb-causes" icon={Search} sub="لكل سبب: شلون تعرف إنه هو، وشنو الحل.">ليش يصير هذا؟</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pb.causes.map((c, i) => (
              <div key={c.cause} className="glass-subtle rounded-2xl p-4 sm:p-5 space-y-2.5">
                <h3 className="text-sm sm:text-base font-black text-white flex items-start gap-2">
                  <span className="w-6 h-6 shrink-0 rounded-lg bg-white/[0.07] text-[11px] font-black flex items-center justify-center text-white/75">{i + 1}</span>
                  {c.cause}
                </h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed"><span className="font-bold text-white/75">العلامة: </span>{c.signs}</p>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pr-3 border-r-2 border-emerald-400/60"><span className="font-bold text-emerald-300">الحل: </span>{c.fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section>
          <SectionTitle id="pb-steps" icon={ListChecks} sub="طبقها بالترتيب. كل خطوة تبني على اللي قبلها.">الحل خطوة بخطوة</SectionTitle>
          <ol className="relative space-y-4 sm:space-y-5 before:absolute before:top-2 before:bottom-2 before:right-[1.2rem] sm:before:right-[1.45rem] before:w-px before:bg-white/[0.1]">
            {pb.steps.map((step, i) => (
              <li key={step.title} className="relative pr-12 sm:pr-16">
                <span className="absolute right-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white font-black flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">{i + 1}</span>
                <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">{step.title}</h3>
                    {step.time && <span className="shrink-0 text-[11px] font-bold text-white/55 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">{step.time}</span>}
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed">{step.why}</p>
                  <ul className="space-y-2">
                    {step.how.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-white/85 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {step.example && (
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <span className="font-bold text-vz-accent">مثال: </span>{step.example}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Scripts */}
        <section>
          <SectionTitle id="pb-scripts" icon={MessageSquareText} sub="انسخها، غيّر اللي بين الأقواس [ ] لمنتجك، وحطها ردود سريعة بواتساب بزنس.">رسائل جاهزة تنسخها</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {pb.scripts.map((s) => (
              <div key={s.title} className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-white">{s.title}</h3>
                    <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">{s.when}</p>
                  </div>
                  <CopyButton text={s.text} />
                </div>
                <pre className="flex-1 whitespace-pre-wrap font-sans text-sm text-white/85 leading-relaxed p-3.5 rounded-xl bg-black/25 border border-white/[0.06]">{s.text}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Example */}
        <section>
          <SectionTitle id="pb-example" icon={TrendingUp} sub={pb.example.story}>{`مثال توضيحي: ${pb.example.title}`}</SectionTitle>
          <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="grid grid-cols-3 gap-3 px-4 sm:px-5 py-3 text-xs font-bold text-white/50 border-b border-white/[0.07]">
              <span>الرقم</span>
              <span>قبل</span>
              <span>بعد</span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {pb.example.rows.map((r) => (
                <li key={r.label} className="grid grid-cols-3 gap-3 px-4 sm:px-5 py-3 text-sm items-center">
                  <span className="font-bold text-white">{r.label}</span>
                  <span className="text-red-300/90">{r.before}</span>
                  <span className="text-emerald-300 font-bold">{r.after}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-sm text-white/75 leading-relaxed"><span className="font-bold text-vz-accent">الدرس: </span>{pb.example.lesson}</p>
        </section>

        {/* Mistakes */}
        <section>
          <SectionTitle id="pb-mistakes" icon={AlertTriangle}>أغلاط لا توكع بيها</SectionTitle>
          <ul className="space-y-2.5">
            {pb.mistakes.map((m) => (
              <li key={m.mistake} className="glass-subtle rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                <span className="flex items-start gap-2 text-red-200/90"><X className="w-4 h-4 shrink-0 mt-0.5 text-red-300" />{m.mistake}</span>
                <span className="flex items-start gap-2 text-emerald-100/90"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" />{m.fix}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 7-day plan */}
        <section>
          <SectionTitle id="pb-plan" icon={CheckCircle2} sub="علّم كل يوم تخلصه. تقدمك ينحفظ.">خطة 7 أيام</SectionTitle>
          <div className="glass-elevated glass-edge rounded-3xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={pb.plan.length} aria-valuenow={ticked.size} aria-label="تقدم الخطة">
                <div className="h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400 transition-[width] duration-500" style={{ width: `${planPercent}%` }} />
              </div>
              <span className="text-xs font-bold text-white/70 font-mono">{ticked.size}/{pb.plan.length}</span>
            </div>
            <ul className="space-y-2">
              {pb.plan.map((p, i) => {
                const isDone = ticked.has(i);
                return (
                  <li key={p.day}>
                    <button
                      onClick={() => togglePlanDay(userCode, pb.id, i)}
                      aria-pressed={isDone}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-right cursor-pointer transition-colors duration-300 min-h-[56px] ${isDone ? "bg-emerald-400/[0.08] border border-emerald-400/25" : "bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06]"} ${focusRing}`}
                    >
                      <span className={`w-6 h-6 shrink-0 mt-0.5 rounded-lg border flex items-center justify-center ${isDone ? "bg-emerald-400 border-emerald-300 text-[#062018]" : "border-white/25"}`}>
                        {isDone && <Check className="w-4 h-4" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-white/50">{p.day}</span>
                        <span className={`block text-sm leading-relaxed ${isDone ? "text-white/60 line-through decoration-white/30" : "text-white/90"}`}>{p.task}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Related */}
        <section className="glass rounded-3xl p-5 sm:p-7 space-y-5">
          <h2 className="text-base sm:text-lg font-black text-white">كمّل من هنا</h2>
          <div className="flex flex-wrap gap-2">
            {pb.relatedChapters.map((cid) => {
              const ch = chaptersList.find((c) => c.id === cid);
              if (!ch) return null;
              return (
                <button key={cid} onClick={() => onNavigate({ view: "chapter", id: cid })} className={`btn btn-glass px-3.5 min-h-[40px] rounded-full text-xs gap-1.5 ${focusRing}`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  {ch.number}: {ch.title}
                </button>
              );
            })}
            {pb.relatedTools.map((t) => (
              <button key={t.id} onClick={() => onOpenTool(t.id)} className={`btn btn-glass px-3.5 min-h-[40px] rounded-full text-xs gap-1.5 ${focusRing}`}>
                <Wrench className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
            {(playbookGuide[pb.id] ?? []).map((gid) => {
              const gm = guideModules.find((g) => g.id === gid);
              if (!gm) return null;
              return (
                <button key={gid} onClick={() => onNavigate({ view: "guideModule", id: gid })} className={`btn btn-glass px-3.5 min-h-[40px] rounded-full text-xs gap-1.5 ${focusRing}`}>
                  <span aria-hidden="true">{gm.icon}</span>
                  الدليل العراقي: {gm.title.split(":")[0]}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-white/[0.07]">
            <p className="flex-1 text-sm text-white/65">عندك حالة خاصة؟ اكتب أرقامك للمستشار ويطبق هذا الحل على مشروعك.</p>
            <button onClick={onOpenAdvisor} className={`btn btn-primary min-h-[48px] px-6 rounded-full text-sm gap-2 ${focusRing}`}>
              <Bot className="w-4 h-4" />
              اسأل المستشار
            </button>
          </div>
        </section>
      </div>
    </article>
  );
}
