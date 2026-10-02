import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, Clock, Compass, Lightbulb } from "lucide-react";
import { GUIDE_RESEARCHED, guideModules } from "../data/iraqGuideData";
import { EASE_OUT } from "../lib/motion";
import { usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import { PageHeader } from "./ui/PageHeader";
import { upcomingSeasons } from "./guide/GuideTools";

interface GuideIndexProps {
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** The Iraq Guide: researched modules on how online selling works in Iraq. */
export default function GuideIndex({ userCode, onNavigate }: GuideIndexProps) {
  const plans = usePlaybookPlans(userCode);
  const next = upcomingSeasons(new Date(), 2);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-10 space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow={<><Compass className="w-4 h-4" /> الدليل العراقي</>}
        title="شلون يشتغل البيع أونلاين بالعراق فعلاً"
        subtitle={`مبني على بحث ومصادر: أرقام المنصات، الدفع، التوصيل، الاستيراد والكمرك، المواسم، والقانون الجديد. آخر تحديث: ${GUIDE_RESEARCHED}.`}
      />

      {next.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: EASE_OUT }}
          onClick={() => onNavigate({ view: "guideModule", id: "seasons" })}
          className={`group w-full text-right glass-elevated glass-edge rounded-3xl p-5 sm:p-6 flex items-center gap-4 cursor-pointer ${focusRing}`}
        >
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-vz-accent">
            <CalendarDays className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-xs font-bold text-vz-accent">الموسم الجاي</span>
            <span className="block text-base sm:text-lg font-black text-white">
              {next[0].title} بعد {next[0].days} يوم
              {next[1] && <span className="text-white/50 font-bold text-sm"> · وبعده {next[1].title} ({next[1].days} يوم)</span>}
            </span>
            <span className="block text-xs sm:text-sm text-white/60 line-clamp-2">{next[0].prepare}</span>
          </span>
          <ArrowLeft className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
        </motion.button>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {guideModules.map((m, i) => {
          const done = (plans[`guide:${m.id}`] ?? []).length;
          return (
            <motion.li key={m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 + i * 0.04, ease: EASE_OUT }}>
              <button
                onClick={() => onNavigate({ view: "guideModule", id: m.id })}
                className={`group w-full h-full text-right glass glass-interactive rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-3 cursor-pointer ${focusRing}`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-3xl leading-none shrink-0" aria-hidden="true">{m.icon}</span>
                  <div className="min-w-0 space-y-1.5">
                    <h2 className="text-base sm:text-lg font-black text-white leading-snug">{m.title}</h2>
                    <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-2">{m.subtitle}</p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.minutes} دقيقة</span>
                    <span>{m.sources.length} مصادر</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-white/75 group-hover:text-white transition-colors">
                    {done > 0 ? `${done}/${m.checklist.length} منجز` : "اقرا"}
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </button>
            </motion.li>
          );
        })}
        <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 + guideModules.length * 0.04, ease: EASE_OUT }}>
          <button
            onClick={() => onNavigate({ view: "market" })}
            className={`group w-full h-full text-right glass-subtle glass-interactive rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 cursor-pointer ${focusRing}`}
          >
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-amber-200">
              <Lightbulb className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-base font-black text-white">أسرار السوق: دروس من التجار</span>
              <span className="block text-xs sm:text-sm text-white/55 mt-0.5">أكثر من 50 درس قصير من تجارب السوق العراقي.</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </motion.li>
      </ul>
    </div>
  );
}
