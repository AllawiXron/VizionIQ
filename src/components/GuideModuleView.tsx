import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, BookOpen, Check, CheckCircle2, Clock, ExternalLink, LifeBuoy, Lightbulb } from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { GUIDE_RESEARCHED, guideModules } from "../data/iraqGuideData";
import { playbooksList } from "../data/playbooksData";
import { EASE_OUT } from "../lib/motion";
import { togglePlanDay, usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import { GuideToolView } from "./guide/GuideTools";

interface GuideModuleViewProps {
  key?: string;
  id: string;
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** One researched Iraq Guide module: stats, sections, an interactive tool, a checklist and sources. */
export default function GuideModuleView({ id, userCode, onNavigate }: GuideModuleViewProps) {
  const m = guideModules.find((g) => g.id === id) ?? guideModules[0];
  const plans = usePlaybookPlans(userCode);
  const planKey = `guide:${m.id}`;
  const ticked = new Set(plans[planKey] ?? []);
  const index = guideModules.indexOf(m);
  const nextModule = guideModules[index + 1] ?? null;

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 text-right">
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <button onClick={() => onNavigate({ view: "guide" })} className={`btn btn-ghost px-3 -mr-3 rounded-full text-xs sm:text-sm gap-1.5 ${focusRing}`}>
          <ArrowRight className="w-4 h-4" />
          <span>الدليل العراقي</span>
        </button>
        <span className="text-xs text-white/50 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.minutes} دقيقة · محدث {GUIDE_RESEARCHED}</span>
      </div>

      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-3 sm:space-y-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight flex items-start gap-3">
          <span aria-hidden="true" className="shrink-0">{m.icon}</span>
          <span>{m.title}</span>
        </h1>
        <p className="text-sm sm:text-lg text-white/65 leading-relaxed">{m.subtitle}</p>
      </motion.header>

      {/* Key numbers */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT }} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-10 sm:mb-14">
        {m.stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 space-y-1.5">
            <p className="text-lg sm:text-2xl font-black text-white leading-tight">{s.value}</p>
            <p className="text-[11px] sm:text-xs text-white/55 leading-relaxed">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="space-y-10 sm:space-y-14">
        {m.sections.map((sec) => (
          <section key={sec.heading} className="space-y-4">
            <h2 className="text-lg sm:text-2xl font-black text-white">{sec.heading}</h2>
            {sec.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-sm sm:text-base text-white/80 leading-loose">{p}</p>
            ))}
            {sec.table && (
              <div className="glass rounded-2xl sm:rounded-3xl overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-white/50 border-b border-white/[0.07]">
                      {sec.table.head.map((h) => <th key={h} className="text-right font-bold px-4 py-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {sec.table.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-4 py-3 align-top leading-relaxed ${ci === 0 ? "font-bold text-white" : "text-white/75"}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {sec.bullets && (
              <ul className="space-y-2.5">
                {sec.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {sec.tip && (
              <p className="flex items-start gap-2.5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-sm text-white/85 leading-relaxed">
                <Lightbulb className="w-4 h-4 text-amber-200 shrink-0 mt-0.5" />
                <span><span className="font-bold text-amber-100">نصيحة: </span>{sec.tip}</span>
              </p>
            )}
            {sec.warning && (
              <p className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/[0.07] border border-red-400/20 text-sm text-red-50/90 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                <span><span className="font-bold text-red-200">انتبه: </span>{sec.warning}</span>
              </p>
            )}
          </section>
        ))}

        {m.tool && <GuideToolView tool={m.tool} />}

        {/* Checklist */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-vz-accent" />
            طبّقها هالأسبوع
            <span className="text-sm font-bold text-white/50 font-mono">{ticked.size}/{m.checklist.length}</span>
          </h2>
          <ul className="space-y-2">
            {m.checklist.map((task, i) => {
              const isDone = ticked.has(i);
              return (
                <li key={task}>
                  <button
                    onClick={() => togglePlanDay(userCode, planKey, i)}
                    aria-pressed={isDone}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-right cursor-pointer transition-colors duration-300 min-h-[52px] ${isDone ? "bg-emerald-400/[0.08] border border-emerald-400/25" : "bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06]"} ${focusRing}`}
                  >
                    <span className={`w-6 h-6 shrink-0 rounded-lg border flex items-center justify-center ${isDone ? "bg-emerald-400 border-emerald-300 text-[#062018]" : "border-white/25"}`}>
                      {isDone && <Check className="w-4 h-4" strokeWidth={3} />}
                    </span>
                    <span className={`text-sm leading-relaxed ${isDone ? "text-white/60 line-through decoration-white/30" : "text-white/90"}`}>{task}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Related */}
        {(m.relatedPlaybooks.length > 0 || m.relatedChapters.length > 0) && (
          <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-black text-white">طبّقها ويا</h2>
            <div className="flex flex-wrap gap-2">
              {m.relatedPlaybooks.map((pid) => {
                const pb = playbooksList.find((p) => p.id === pid);
                if (!pb) return null;
                return (
                  <button key={pid} onClick={() => onNavigate({ view: "solution", id: pid })} className={`btn btn-glass px-3.5 min-h-[40px] rounded-full text-xs gap-1.5 ${focusRing}`}>
                    <LifeBuoy className="w-3.5 h-3.5" />
                    {pb.title}
                  </button>
                );
              })}
              {m.relatedChapters.map((cid) => {
                const ch = chaptersList.find((c) => c.id === cid);
                if (!ch) return null;
                return (
                  <button key={cid} onClick={() => onNavigate({ view: "chapter", id: cid })} className={`btn btn-glass px-3.5 min-h-[40px] rounded-full text-xs gap-1.5 ${focusRing}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                    {ch.number}: {ch.title}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Sources */}
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-white/80">المصادر</h2>
          <p className="text-xs text-white/45 leading-relaxed">
            جمعنا هاي المعلومات بـ {GUIDE_RESEARCHED}. الأسعار والقوانين والتعرفات تتغير، فتأكد من المصدر قبل أي قرار كبير.
          </p>
          <ol className="space-y-1.5">
            {m.sources.map((s, i) => (
              <li key={s.url} className="text-xs sm:text-sm">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-white/65 hover:text-white underline decoration-white/20 underline-offset-4 transition-colors">
                  <span className="font-mono text-white/40">{i + 1}.</span>
                  <span>{s.label}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 mt-1 opacity-60" />
                </a>
              </li>
            ))}
          </ol>
        </section>

        {nextModule && (
          <button
            onClick={() => onNavigate({ view: "guideModule", id: nextModule.id })}
            className={`group w-full text-right glass-elevated glass-edge rounded-3xl p-5 sm:p-6 flex items-center gap-4 cursor-pointer ${focusRing}`}
          >
            <span className="text-3xl leading-none shrink-0" aria-hidden="true">{nextModule.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-vz-accent">الوحدة الجاية</span>
              <span className="block text-base sm:text-lg font-black text-white leading-snug">{nextModule.title}</span>
            </span>
            <ArrowRight className="w-5 h-5 text-white/60 shrink-0 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        )}
      </div>
    </article>
  );
}
