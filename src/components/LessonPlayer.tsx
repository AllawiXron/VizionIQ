import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Lightbulb, Lock, X } from "lucide-react";
import type { Block, Lesson } from "../data/course";
import { lessonMinutes } from "../data/course";
import { VISUALS } from "./lesson/visuals";
import { GENERIC } from "./lesson/generic";
import { EASE_OUT } from "../lib/motion";

type Screen =
  | { kind: "intro" }
  | { kind: "text"; texts: string[] }
  | { kind: "block"; block: Exclude<Block, { kind: "p" }> }
  | { kind: "takeaway" }
  | { kind: "done" };

function buildScreens(lesson: Lesson): Screen[] {
  const screens: Screen[] = [{ kind: "intro" }];
  let buf: string[] = [];
  const flush = () => {
    if (buf.length) screens.push({ kind: "text", texts: buf });
    buf = [];
  };
  for (const b of lesson.blocks) {
    if (b.kind === "p") {
      buf.push(b.text);
      if (buf.length === 2 || buf.join("").length > 420) flush();
    } else {
      flush();
      screens.push({ kind: "block", block: b });
    }
  }
  flush();
  screens.push({ kind: "takeaway" }, { kind: "done" });
  return screens;
}

const revealCount = (s: Screen) =>
  s.kind === "block" && (s.block.kind === "steps" || s.block.kind === "points")
    ? s.block.items.length
    : s.kind === "block" && s.block.kind === "visual"
      ? VISUALS[s.block.name]?.steps ?? GENERIC[s.block.name]?.steps?.(s.block.data) ?? 1
      : 1;

const NUM = /(\$?\d[\d,.]*\s?(?:%|٪)?(?:\s?(?:ألف|الف|آلاف|دينار|دولار|د\.ع|ساعة|يوم|أيام|ثواني))?)/g;

function Rich({ text }: { text: string }) {
  const parts = text.split(NUM);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-black text-white whitespace-nowrap">{p}</span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

function Kicker({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "amber" | "red" | "green" }) {
  const cls = { accent: "text-vz-accent", amber: "text-amber-200", red: "text-red-300", green: "text-emerald-300" }[tone];
  return <p className={`text-sm sm:text-base font-black mb-3 flex items-center gap-2 ${cls}`}>{children}</p>;
}

function TextScreen({ texts }: { texts: string[] }) {
  return (
    <div className="space-y-6">
      {texts.map((t, i) => (
        <p
          key={i}
          className={i === 0 ? "text-[22px] sm:text-[28px] font-bold text-white leading-[1.75]" : "text-[18px] sm:text-[21px] text-white/75 leading-[1.9]"}
        >
          <Rich text={t} />
        </p>
      ))}
    </div>
  );
}

function StepsScreen({ block, shown }: { block: Extract<Block, { kind: "steps" }>; shown: number }) {
  return (
    <div>
      <Kicker>{block.title ?? "خطوة بخطوة"}</Kicker>
      <div className="flex items-center gap-1.5 mb-6" aria-hidden="true">
        {block.items.map((_, i) => (
          <span
            key={i}
            className={`h-9 min-w-9 px-2 rounded-full text-sm font-black flex items-center justify-center transition-colors duration-300 ${
              i < shown - 1 ? "bg-white/15 text-white" : i === shown - 1 ? "bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white" : "bg-white/[0.04] text-white/30 border border-white/10"
            }`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <ol className="space-y-3">
        {block.items.slice(0, shown).map((step, i) => {
          const current = i === shown - 1;
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className={current ? "glass-elevated rounded-3xl p-5 sm:p-6" : "rounded-2xl px-4 py-3 bg-white/[0.03] border border-white/[0.06]"}
            >
              <p className={current ? "text-[20px] sm:text-[24px] font-black text-white leading-snug mb-2" : "text-[15px] font-bold text-white/60 flex items-center gap-2"}>
                {!current && <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />}
                {step.title}
              </p>
              {current && (
                <p className="text-[17px] sm:text-[19px] text-white/80 leading-[1.85]">
                  <Rich text={step.text} />
                </p>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function PointsScreen({ block, shown }: { block: Extract<Block, { kind: "points" }>; shown: number }) {
  return (
    <div>
      <Kicker>{block.title ?? "النقاط المهمة"}</Kicker>
      <ul className="space-y-3">
        {block.items.slice(0, shown).map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex items-start gap-4 glass rounded-2xl p-4 sm:p-5"
          >
            <span className="text-[28px] font-black text-vz-accent leading-none w-8 shrink-0 text-center">{i + 1}</span>
            <span className="text-[17px] sm:text-[19px] text-white/90 leading-[1.8]">
              <Rich text={item} />
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function CompareScreen({
  block,
  choice,
  onChoose,
}: {
  block: Extract<Block, { kind: "compare" }>;
  choice: "good" | "bad" | "skip" | undefined;
  onChoose: (c: "good" | "bad") => void;
}) {
  const goodFirst = block.good.text.length % 2 === 0;
  const options: ("good" | "bad")[] = goodFirst ? ["good", "bad"] : ["bad", "good"];
  const revealed = choice !== undefined;
  return (
    <div>
      <Kicker>{block.title ?? "قارن"}</Kicker>
      <h3 className="text-[22px] sm:text-[28px] font-black text-white leading-snug mb-6">أي وحدة أصح برأيك؟</h3>
      <div className="grid gap-3">
        {options.map((side, i) => {
          const data = block[side];
          const picked = choice === side;
          const state = !revealed ? "idle" : side === "good" ? "good" : "bad";
          return (
            <button
              key={side}
              type="button"
              disabled={revealed}
              onClick={() => onChoose(side)}
              className={`w-full text-right rounded-3xl p-5 sm:p-6 border transition-colors duration-300 ${
                state === "idle"
                  ? "bg-white/[0.04] border-white/12 hover:bg-white/[0.08] cursor-pointer"
                  : state === "good"
                    ? "bg-emerald-400/[0.1] border-emerald-400/45"
                    : "bg-red-500/[0.07] border-red-400/30 opacity-80"
              } ${picked ? "ring-2 ring-white/40" : ""}`}
            >
              <span className="flex items-center justify-between gap-3 mb-2">
                <span className={`text-sm font-black ${state === "good" ? "text-emerald-300" : state === "bad" ? "text-red-300" : "text-white/45"}`}>
                  {state === "idle" ? (i === 0 ? "الأولى" : "الثانية") : data.label}
                </span>
                {state === "good" && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                {state === "bad" && <X className="w-5 h-5 text-red-300" />}
              </span>
              <span className="block text-[17px] sm:text-[19px] text-white/90 leading-[1.8]">
                <Rich text={data.text} />
              </span>
            </button>
          );
        })}
      </div>
      {revealed && choice !== "skip" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-5 text-[17px] font-black ${choice === "good" ? "text-emerald-300" : "text-red-300"}`}>
          {choice === "good" ? "صح، هاي هي الطريقة اللي تبيع." : "مو هاي. شوف الفرق بين الثنتين."}
        </motion.p>
      )}
    </div>
  );
}

function ExampleScreen({ block }: { block: Extract<Block, { kind: "example" }> }) {
  return (
    <div>
      <Kicker>مثال من السوق العراقي</Kicker>
      <div className="glass-elevated rounded-3xl p-6 sm:p-8">
        <h3 className="text-[21px] sm:text-[26px] font-black text-white leading-snug mb-4">{block.title}</h3>
        <p className="text-[17px] sm:text-[20px] text-white/85 leading-[1.9]">
          <Rich text={block.text} />
        </p>
      </div>
    </div>
  );
}

function NoteScreen({ block }: { block: Extract<Block, { kind: "tip" | "warning" }> }) {
  const tip = block.kind === "tip";
  const Icon = tip ? Lightbulb : AlertTriangle;
  return (
    <div className={`rounded-3xl p-6 sm:p-8 border ${tip ? "bg-amber-300/[0.06] border-amber-200/25" : "bg-red-500/[0.07] border-red-400/25"}`}>
      <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${tip ? "bg-amber-300/15 text-amber-200" : "bg-red-500/15 text-red-300"}`}>
        <Icon className="w-7 h-7" />
      </span>
      <Kicker tone={tip ? "amber" : "red"}>{tip ? "نصيحة" : "انتبه"}</Kicker>
      <p className="text-[20px] sm:text-[24px] font-bold text-white leading-[1.75]">
        <Rich text={block.text} />
      </p>
    </div>
  );
}

function TableScreen({ block }: { block: Extract<Block, { kind: "table" }> }) {
  return (
    <div>
      <Kicker>{block.title ?? "قارن بسرعة"}</Kicker>
      <div className={`grid gap-3 ${block.rows.length > 2 ? "sm:grid-cols-2" : ""}`}>
        {block.rows.map((row) => (
          <div key={row.join("|")} className="glass rounded-3xl p-5">
            <p className="text-[18px] sm:text-[20px] font-black text-white leading-snug mb-3">{row[0]}</p>
            <dl className="space-y-2.5">
              {row.slice(1).map((cell, ci) => (
                <div key={ci}>
                  <dt className="text-[13px] font-bold text-vz-accent">{block.head[ci + 1]}</dt>
                  <dd className="text-[16px] text-white/85 leading-[1.75]">
                    <Rich text={cell} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualScreen({ block, shown }: { block: Extract<Block, { kind: "visual" }>; shown: number }) {
  const v = VISUALS[block.name];
  const g = GENERIC[block.name];
  if (!v && !(g && block.data)) return null;
  return (
    <div>
      <Kicker>{block.title}</Kicker>
      {v ? v.render(shown) : g.render(block.data, shown)}
      {block.caption && <p className="mt-5 text-[16px] sm:text-[18px] text-white/70 leading-relaxed">{block.caption}</p>}
    </div>
  );
}

function ImageScreen({ block }: { block: Extract<Block, { kind: "image" }> }) {
  return (
    <figure>
      <img src={block.src} alt={block.alt ?? block.caption} className="w-full h-auto max-h-[60vh] object-contain rounded-3xl" />
      <figcaption className="mt-4 text-[17px] sm:text-[19px] text-white/80 leading-[1.8]">
        <Rich text={block.caption} />
      </figcaption>
    </figure>
  );
}

interface LessonPlayerProps {
  chapterLabel: string;
  lessons: Lesson[];
  index: number;
  openLessons: number;
  onOpenLesson: (i: number) => void;
  onDone: (i: number) => void;
  onClose: () => void;
}

export default function LessonPlayer({ chapterLabel, lessons, index, openLessons, onOpenLesson, onDone, onClose }: LessonPlayerProps) {
  const lesson = lessons[index];
  const screens = useMemo(() => buildScreens(lesson), [lesson]);
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(1);
  const [dir, setDir] = useState(1);
  const [choices, setChoices] = useState<Record<number, "good" | "bad" | "skip">>({});
  const screen = screens[at];
  const lastStep = screens.length - 2;

  useEffect(() => {
    setAt(0);
    setShown(1);
    setChoices({});
  }, [index]);

  useEffect(() => {
    if (screen.kind === "done") onDone(index);
  }, [screen.kind, index, onDone]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.history.pushState({ lessonPlayer: true }, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("popstate", onPop);
    };
  }, [onClose]);

  const close = useCallback(() => window.history.back(), []);

  const next = useCallback(() => {
    if (screen.kind === "block" && screen.block.kind === "compare" && choices[at] === undefined) {
      setChoices((c) => ({ ...c, [at]: "skip" }));
      return;
    }
    if (shown < revealCount(screen)) {
      setShown((s) => s + 1);
      return;
    }
    if (at < screens.length - 1) {
      setDir(1);
      setAt((a) => a + 1);
      setShown(1);
    }
  }, [screen, shown, at, screens.length, choices]);

  const back = useCallback(() => {
    if (at === 0) return;
    setDir(-1);
    setAt((a) => a - 1);
    setShown(revealCount(screens[at - 1]));
  }, [at, screens]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") next();
      else if (e.key === "ArrowRight") back();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back, close]);

  const nextLabel =
    screen.kind === "intro" ? "يلا نبدي"
      : screen.kind === "takeaway" ? "خلصت الدرس"
        : screen.kind === "block" && screen.block.kind === "compare" && choices[at] === undefined ? "شوف الجواب"
          : shown < revealCount(screen) ? (screen.kind === "block" && screen.block.kind === "visual" ? "كمل" : "الخطوة الجاية")
            : "التالي";

  const hasNextLesson = index + 1 < lessons.length;
  const nextLocked = index + 1 >= openLessons;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#040e33] text-right" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div className="vz-atmosphere" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-5 sm:pt-6 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={close} className="vz-close" aria-label="سكر الدرس">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white/55 truncate">{chapterLabel}، الدرس {index + 1} من {lessons.length}</p>
            <div className="mt-1.5 flex gap-1" aria-hidden="true">
              {screens.slice(0, -1).map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < at ? "bg-vz-blue-light" : i === at ? "bg-white" : "bg-white/12"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
        <div className="w-full max-w-2xl mx-auto px-5 py-8 sm:py-12 min-h-full flex flex-col justify-center">
            <motion.div
              key={at}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
              }}
              initial="enter"
              animate="center"
              transition={{ duration: 0.28, ease: EASE_OUT }}
              drag={screen.kind === "done" || (screen.kind === "block" && screen.block.kind === "visual") ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) next();
                else if (info.offset.x > 70) back();
              }}
            >
              {screen.kind === "intro" && (
                <div>
                  <p className="text-[15px] font-black text-vz-accent mb-4">الدرس {index + 1}</p>
                  <h2 className="text-[30px] sm:text-[42px] font-black text-white leading-[1.35] mb-5">{lesson.title}</h2>
                  <p className="text-[18px] sm:text-[21px] text-white/75 leading-[1.85] mb-6">
                    <Rich text={lesson.intro} />
                  </p>
                  <p className="inline-flex items-center gap-2 text-[14px] font-bold text-white/50">
                    <Clock className="w-4 h-4" />
                    {lessonMinutes(lesson)} دقايق، {screens.length - 2} شاشات
                  </p>
                </div>
              )}
              {screen.kind === "text" && <TextScreen texts={screen.texts} />}
              {screen.kind === "block" && screen.block.kind === "steps" && <StepsScreen block={screen.block} shown={shown} />}
              {screen.kind === "block" && screen.block.kind === "points" && <PointsScreen block={screen.block} shown={shown} />}
              {screen.kind === "block" && screen.block.kind === "compare" && (
                <CompareScreen block={screen.block} choice={choices[at]} onChoose={(c) => setChoices((s) => ({ ...s, [at]: c }))} />
              )}
              {screen.kind === "block" && screen.block.kind === "example" && <ExampleScreen block={screen.block} />}
              {screen.kind === "block" && (screen.block.kind === "tip" || screen.block.kind === "warning") && <NoteScreen block={screen.block} />}
              {screen.kind === "block" && screen.block.kind === "table" && <TableScreen block={screen.block} />}
              {screen.kind === "block" && screen.block.kind === "image" && <ImageScreen block={screen.block} />}
              {screen.kind === "block" && screen.block.kind === "visual" && <VisualScreen block={screen.block} shown={shown} />}
              {screen.kind === "takeaway" && (
                <div>
                  <Kicker tone="green">
                    <CheckCircle2 className="w-5 h-5" /> الخلاصة
                  </Kicker>
                  <p className="text-[24px] sm:text-[32px] font-black text-white leading-[1.6]">
                    <Rich text={lesson.takeaway} />
                  </p>
                </div>
              )}
              {screen.kind === "done" && (
                <div className="text-center">
                  <span className="mx-auto w-20 h-20 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-emerald-300" strokeWidth={3} />
                  </span>
                  <h2 className="text-[28px] sm:text-[36px] font-black text-white mb-2">خلصت الدرس {index + 1}</h2>
                  <p className="text-[17px] text-white/65 mb-8">{lesson.title}</p>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    {hasNextLesson && !nextLocked && (
                      <button onClick={() => onOpenLesson(index + 1)} className="btn btn-primary min-h-[56px] px-6 rounded-2xl text-[16px] gap-2">
                        <span className="truncate">الدرس الجاي: {lessons[index + 1].title}</span>
                        <ArrowLeft className="w-5 h-5 shrink-0" />
                      </button>
                    )}
                    {hasNextLesson && nextLocked && (
                      <button onClick={() => window.dispatchEvent(new CustomEvent("open-upgrade-modal"))} className="btn btn-primary min-h-[56px] px-6 rounded-2xl text-[16px] gap-2">
                        <Lock className="w-5 h-5" />
                        <span>باقي الدروس تنفتح ويا الاشتراك</span>
                      </button>
                    )}
                    <button onClick={close} className="btn btn-glass min-h-[52px] px-6 rounded-2xl text-[16px]">
                      {hasNextLesson ? "رجوع للفصل" : "رجوع للفصل، طبق واختبر نفسك"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
        </div>
      </div>

      {screen.kind !== "done" && (
        <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pb-5 pt-3 safe-area-bottom flex items-center gap-3">
          <button onClick={back} disabled={at === 0} className="btn btn-glass w-14 h-14 rounded-2xl shrink-0" aria-label="رجوع">
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={next} className="btn btn-primary flex-1 h-14 rounded-2xl text-[17px] gap-2">
            <span>{nextLabel}</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}
      <span className="sr-only">{at <= lastStep ? `${at + 1} من ${lastStep + 1}` : ""}</span>
    </div>
  );
}
