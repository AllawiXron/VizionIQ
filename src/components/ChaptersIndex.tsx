import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Check, Clock } from "lucide-react";
import { chaptersList } from "../data/chaptersData";
import { EASE_OUT } from "../lib/motion";
import { CHAPTER_STAGES, nextChapterId, useCourseProgress } from "../lib/progress";
import type { Route } from "../lib/route";
import { PageHeader } from "./ui/PageHeader";

interface ChaptersIndexProps {
  userCode: string;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** Short reading time ("25 دقيقة قراءة مكثفة" → "25 دقيقة"). */
const shortTime = (readTime?: string) => readTime?.match(/\d+\s*دقيقة/)?.[0] ?? readTime ?? "";

/** The course as a simple ordered list: four stages, one row per chapter. */
export default function ChaptersIndex({ userCode, onNavigate }: ChaptersIndexProps) {
  const progress = useCourseProgress(userCode);
  const done = new Set(progress.done);
  const nextId = nextChapterId(progress);
  const doneCount = chaptersList.filter((c) => done.has(c.id)).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-10 space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow={<><BookOpen className="w-4 h-4" /> فصول الكورس</>}
        title="اقرأها بالترتيب"
        subtitle={`${chaptersList.length} فصل مقسمة على 4 مراحل. كل فصل يبني على اللي قبله. خلصت ${doneCount} من ${chaptersList.length}.`}
      />

      <div className="space-y-8 sm:space-y-10">
        {CHAPTER_STAGES.map((stage, stageIndex) => (
          <motion.section
            key={stage.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 + stageIndex * 0.06, ease: EASE_OUT }}
            aria-labelledby={`stage-${stage.id}`}
            className="space-y-3"
          >
            <h2 id={`stage-${stage.id}`} className="flex items-center gap-2.5 text-sm sm:text-base font-black text-white/80">
              <span className="w-6 h-6 rounded-lg bg-white/[0.07] border border-white/10 text-[11px] font-black flex items-center justify-center text-white/80">{stageIndex + 1}</span>
              المرحلة {stageIndex + 1}: {stage.label}
            </h2>

            <ul className="glass rounded-2xl sm:rounded-3xl overflow-hidden divide-y divide-white/[0.06]">
              {stage.chapters.map((id) => {
                const chapter = chaptersList.find((c) => c.id === id);
                if (!chapter) return null;
                const index = chaptersList.indexOf(chapter);
                const isDone = done.has(id);
                const isNext = id === nextId;
                return (
                  <li key={id}>
                    <button
                      onClick={() => onNavigate({ view: "chapter", id })}
                      className={`group w-full text-right flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 min-h-[72px] cursor-pointer transition-colors duration-300 hover:bg-white/[0.04] active:bg-white/[0.06] ${isNext ? "bg-white/[0.035]" : ""} ${focusRing}`}
                    >
                      <span
                        className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-black font-mono border transition-colors duration-300 ${
                          isDone
                            ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-300"
                            : isNext
                              ? "bg-vz-blue border-vz-blue-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                              : "bg-white/[0.05] border-white/10 text-white/70"
                        }`}
                        aria-hidden="true"
                      >
                        {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-white leading-snug">{chapter.title}</span>
                          {isNext && (
                            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-vz-blue/25 border border-vz-blue-light/40 text-white">
                              {progress.last === id ? "وكفت هنا" : "الجاي"}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs sm:text-sm text-white/50 mt-1 line-clamp-1">{chapter.subtitle}</span>
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-white/45 font-mono shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {shortTime(chapter.readTime)}
                      </span>
                      <ArrowLeft className="w-4 h-4 text-white/40 shrink-0 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-white/80" />
                      <span className="sr-only">{isDone ? "(مكتمل)" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
