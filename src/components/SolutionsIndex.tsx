import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clock, LifeBuoy } from "lucide-react";
import { playbooksList } from "../data/playbooksData";
import { EASE_OUT } from "../lib/motion";
import { usePlaybookPlans } from "../lib/progress";
import type { Route } from "../lib/route";
import { PageHeader } from "./ui/PageHeader";

interface SolutionsIndexProps {
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** The playbooks, listed by the problem as the merchant would say it. */
export default function SolutionsIndex({ userCode, onNavigate }: SolutionsIndexProps) {
  const plans = usePlaybookPlans(userCode);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-10 space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow={<><LifeBuoy className="w-4 h-4" /> الحلول</>}
        title="شنو مشكلتك هسه؟"
        subtitle="كل حل خطة كاملة: شلون تعرف إنها مشكلتك بالأرقام، ليش تصير، الخطوات بالترتيب، رسائل جاهزة تنسخها، وخطة 7 أيام."
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {playbooksList.map((pb, i) => {
          const done = (plans[pb.id] ?? []).length;
          const total = pb.plan.length;
          return (
            <motion.li
              key={pb.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 + i * 0.05, ease: EASE_OUT }}
            >
              <button
                onClick={() => onNavigate({ view: "solution", id: pb.id })}
                className={`group w-full h-full text-right glass glass-interactive rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 cursor-pointer ${focusRing}`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-3xl leading-none shrink-0" aria-hidden="true">{pb.icon}</span>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">«{pb.problem}»</p>
                    <h2 className="text-base sm:text-lg font-black text-white leading-snug">{pb.title}</h2>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pb.minutes} دقيقة</span>
                    <span>{pb.steps.length} خطوات · {pb.scripts.length} رسائل جاهزة</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-white/75 group-hover:text-white transition-colors">
                    {done > 0 ? `${done}/${total} من الخطة` : "افتح الحل"}
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
