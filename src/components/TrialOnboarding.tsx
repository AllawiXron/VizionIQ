/**
 * First visit on the free trial: a one-minute check on the member's own
 * numbers. They pick what they sell and what hurts, type their price and
 * cost, and see their real profit per order, where the money goes, what
 * fixing it is worth, and the exact solution waiting in the platform, with
 * one tap to subscribe on WhatsApp (the message already carries their result).
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, Check, LifeBuoy, Lock, Sparkles, TrendingUp, X } from "lucide-react";
import { EASE_OUT, overlayMotion } from "../lib/motion";
import { playbooksList } from "../data/playbooksData";
import { chaptersList } from "../data/chaptersData";
import type { Route } from "../lib/route";
import {
  TRIAL_CATEGORIES, TRIAL_DEFAULTS, TRIAL_PROBLEMS, TRIAL_STAGES,
  diagnose, iqd, saveTrialProfile, useTrialProfile,
  type TrialProfile, type TrialStage,
} from "../lib/trial";
import { PLAN_INCLUDES, STUDENT_COUNT } from "../lib/offer";
import { OfferPrice, SubscribeButton } from "./OfferPrice";
import { TopicIcon } from "./ui/TopicIcon";

interface TrialOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: Route) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

type Step = "intro" | "business" | "problem" | "numbers" | "working" | "result";
const FORM_STEPS: Step[] = ["business", "problem", "numbers"];

/** "35000", "35,000", "٣٥", "35 ألف" → 35000. Small numbers are read as thousands. */
function parseIqd(text: string): number | null {
  const western = text.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^\d.]/g, "");
  if (!western) return null;
  const n = Number(western);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1000 ? Math.round(n * 1000) : Math.round(n);
}

function Chip({ selected, onClick, children }: { key?: React.Key; selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-sm font-bold border transition-colors duration-200 cursor-pointer ${focusRing} ${
        selected
          ? "bg-vz-blue border-vz-blue-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          : "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function ChipRow<T extends string | number>({ label, hint, options, value, onChange }: {
  label: string;
  hint?: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-black text-white">{label}</p>
      {hint && <p className="text-xs text-white/50 -mt-1">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={String(o.value)} selected={value === o.value} onClick={() => onChange(o.value)}>{o.label}</Chip>
        ))}
      </div>
    </div>
  );
}

/** Counts from what they think they earn down (or up) to what they really earn. */
function CountTo({ from, to, className }: { from: number; to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? to : from, { stiffness: 55, damping: 20, mass: 1 });
  useEffect(() => {
    const t = window.setTimeout(() => spring.set(to), 450);
    return () => window.clearTimeout(t);
  }, [spring, to]);
  useEffect(() => spring.on("change", (v) => {
    if (ref.current) ref.current.textContent = iqd(v);
  }), [spring]);
  return <span ref={ref} className={`tabular-nums ${className ?? ""}`}>{iqd(reduce ? to : from)}</span>;
}

export function TrialOnboarding({ isOpen, onClose, onNavigate }: TrialOnboardingProps) {
  const saved = useTrialProfile();
  const [step, setStep] = useState<Step>(saved ? "result" : "intro");
  const [category, setCategory] = useState<string | null>(saved?.category ?? null);
  const [stage, setStage] = useState<TrialStage | null>(saved?.stage ?? null);
  const [problem, setProblem] = useState<string | null>(saved?.problem ?? null);
  const [priceText, setPriceText] = useState(saved && !saved.estimated.includes("price") ? String(saved.price) : "");
  const [costText, setCostText] = useState(saved && !saved.estimated.includes("cost") ? String(saved.cost) : "");
  const [delivery, setDelivery] = useState<number>(saved?.delivery ?? TRIAL_DEFAULTS.delivery);
  const [messageCost, setMessageCost] = useState<number>(saved ? (saved.estimated.includes("messageCost") ? 0 : saved.messageCost) : -1);
  const [closeOf10, setCloseOf10] = useState<number>(saved ? (saved.estimated.includes("closeOf10") ? 0 : saved.closeOf10) : -1);
  const [returnsOf10, setReturnsOf10] = useState<number>(saved ? (saved.estimated.includes("returnPct") ? -2 : saved.returnPct / 10) : -1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reopened later: land on the result if there is one.
  useEffect(() => {
    if (isOpen) setStep(saved ? "result" : "intro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const price = parseIqd(priceText);
  const cost = parseIqd(costText);
  const numbersReady = price !== null && cost !== null && messageCost !== -1 && closeOf10 !== -1 && returnsOf10 !== -1;

  const finish = (useExample = false) => {
    const estimated: string[] = [];
    const p = useExample || price === null ? (estimated.push("price"), TRIAL_DEFAULTS.price) : price;
    const c = useExample || cost === null ? (estimated.push("cost"), TRIAL_DEFAULTS.cost) : cost;
    const mc = useExample || messageCost <= 0 ? (estimated.push("messageCost"), TRIAL_DEFAULTS.messageCost) : messageCost;
    const cl = useExample || closeOf10 <= 0 ? (estimated.push("closeOf10"), TRIAL_DEFAULTS.closeOf10) : closeOf10;
    const rp = useExample || returnsOf10 < 0 ? (estimated.push("returnPct"), TRIAL_DEFAULTS.returnPct) : returnsOf10 * 10;
    const profile: TrialProfile = {
      category: category ?? "غيرها",
      stage: stage ?? "starting",
      problem: problem ?? "ghosting",
      price: p,
      cost: c,
      delivery,
      messageCost: mc,
      closeOf10: cl,
      returnPct: rp,
      estimated,
      doneAt: Date.now(),
    };
    setStep("working");
    window.setTimeout(() => {
      saveTrialProfile(profile);
      setStep("result");
    }, 1500);
  };

  const formIndex = FORM_STEPS.indexOf(step);
  const back = () => {
    if (step === "business") setStep("intro");
    else if (step === "problem") setStep("business");
    else if (step === "numbers") setStep("problem");
  };

  const go = (route: Route) => {
    onClose();
    onNavigate(route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="trial-onboarding" className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center sm:p-6 dir-rtl font-sans">
          <motion.div {...overlayMotion} className="fixed inset-0 vz-backdrop bg-black/75 z-[200]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.22, ease: EASE_OUT } }}
            role="dialog"
            aria-modal="true"
            aria-label="شوف مشروعك بدقيقة"
            className="relative z-[202] w-full sm:max-w-lg h-[100dvh] sm:h-auto sm:max-h-[92vh] glass-elevated glass-edge sm:rounded-4xl overflow-hidden text-white flex flex-col"
          >
            <div aria-hidden="true" className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(72,128,255,0.25)_0%,transparent_75%)] pointer-events-none" />

            {/* Top bar: back, progress, close */}
            <div className="relative shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3">
              {formIndex >= 0 ? (
                <button onClick={back} aria-label="رجوع" className={`vz-close ${focusRing}`}>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : <span className="w-9" />}
              <div className="flex-1 flex items-center gap-1.5" aria-hidden="true">
                {FORM_STEPS.map((s, i) => (
                  <span key={s} className="flex-1 h-1.5 rounded-full bg-white/[0.1] overflow-hidden">
                    <motion.span
                      className="block h-full rounded-full bg-gradient-to-l from-vz-blue-light to-emerald-400"
                      initial={false}
                      animate={{ width: step === "working" || step === "result" || i < formIndex ? "100%" : i === formIndex ? "50%" : "0%" }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                    />
                  </span>
                ))}
              </div>
              <button onClick={onClose} aria-label="إغلاق" className={`vz-close ${focusRing}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE_OUT } }}
                  exit={{ opacity: 0, x: 18, transition: { duration: 0.18, ease: EASE_OUT } }}
                  className="text-right"
                >
                  {step === "intro" && (
                    <div className="space-y-6 pt-4">
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-vz-accent">أهلاً بيك بـ viZion</p>
                        <h2 className="text-[1.7rem] sm:text-4xl font-black leading-tight">قبل لا تبدي، خلي نشوف مشروعك بدقيقة وحدة</h2>
                        <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                          هنا مو فيديوهات طويلة ولا قناة تلكرام. تكتب أرقامك، وتعرف بالضبط وين تروح فلوسك وشنو تسوي بعدين.
                        </p>
                        <p className="text-xs text-white/45">{STUDENT_COUNT} مشترك يستخدمون المنصة لحد هسه.</p>
                      </div>
                      <ul className="space-y-2.5">
                        {[
                          { icon: Calculator, text: "تعرف ربحك الحقيقي من كل طلب، بعد التوصيل والإعلان والراجع" },
                          { icon: TrendingUp, text: "تشوف شكد يفرق وياك لو صلّحت الردود والراجع" },
                          { icon: LifeBuoy, text: "توصل للحل الجاهز لمشكلتك إنت، خطوة بخطوة" },
                        ].map(({ icon: Icon, text }, i) => (
                          <motion.li
                            key={text}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                            className="flex items-center gap-3 p-3.5 rounded-2xl glass-subtle"
                          >
                            <span className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/85">
                              <Icon className="w-5 h-5" />
                            </span>
                            <span className="text-sm leading-relaxed text-white/85">{text}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <div className="space-y-2 pt-1">
                        <button onClick={() => setStep("business")} className={`btn btn-primary w-full min-h-[54px] rounded-full text-base gap-2 ${focusRing}`}>
                          <span>يلا نبدي</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className={`btn btn-ghost w-full min-h-[44px] rounded-full text-sm text-white/60 ${focusRing}`}>
                          أتصفح بنفسي
                        </button>
                      </div>
                    </div>
                  )}

                  {step === "business" && (
                    <div className="space-y-6 pt-2">
                      <h2 className="text-2xl sm:text-3xl font-black leading-tight">شنو تبيع؟</h2>
                      <div className="flex flex-wrap gap-2">
                        {TRIAL_CATEGORIES.map((c) => (
                          <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>{c}</Chip>
                        ))}
                      </div>
                      <div className="space-y-2.5">
                        <p className="text-base font-black">ووين وصلت؟</p>
                        <div className="grid gap-2">
                          {TRIAL_STAGES.map((s) => (
                            <Chip key={s.id} selected={stage === s.id} onClick={() => setStage(s.id)}>{s.label}</Chip>
                          ))}
                        </div>
                      </div>
                      <button
                        disabled={!category || !stage}
                        onClick={() => setStep("problem")}
                        className={`btn btn-primary w-full min-h-[54px] rounded-full text-base gap-2 disabled:opacity-40 disabled:pointer-events-none ${focusRing}`}
                      >
                        <span>التالي</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {step === "problem" && (
                    <div className="space-y-5 pt-2">
                      <div className="space-y-1.5">
                        <h2 className="text-2xl sm:text-3xl font-black leading-tight">شنو أكبر مشكلة تواجهك هسه؟</h2>
                        <p className="text-sm text-white/55">اختار وحدة، الأقرب لحالتك.</p>
                      </div>
                      <div className="grid gap-2.5">
                        {TRIAL_PROBLEMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProblem(p.id);
                              window.setTimeout(() => setStep("numbers"), 180);
                            }}
                            aria-pressed={problem === p.id}
                            className={`w-full min-h-[60px] flex items-center gap-3.5 p-4 rounded-2xl border text-right transition-colors duration-200 cursor-pointer ${focusRing} ${
                              problem === p.id ? "bg-vz-blue/30 border-vz-blue-light" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"
                            }`}
                          >
                            <TopicIcon kind="playbook" id={p.id} size="sm" />
                            <span className="flex-1 text-sm sm:text-base font-bold text-white leading-snug">{p.label}</span>
                            {problem === p.id && <Check className="w-5 h-5 text-white shrink-0" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === "numbers" && (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1.5">
                        <h2 className="text-2xl sm:text-3xl font-black leading-tight">هسه أرقامك</h2>
                        <p className="text-sm text-white/55">
                          {stage === "idea" ? "حتى لو بعده فكرة: اكتب السعر اللي ناوي تبيع بيه." : "تقريبية تكفي. اللي ما تعرفه، اختار «ما أعرف» ونحسبه بالمعدل."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: stage === "idea" ? "ناوي تبيعه بكم؟" : "تبيعه للزبون بكم؟", value: priceText, set: setPriceText, ph: "35000" },
                          { label: "يكلفك إنت بكم؟", value: costText, set: setCostText, ph: "12000" },
                        ].map((f) => (
                          <label key={f.label} className="block space-y-1.5">
                            <span className="text-sm font-black text-white">{f.label}</span>
                            <span className="relative block">
                              <input
                                type="text"
                                inputMode="numeric"
                                dir="ltr"
                                value={f.value}
                                onChange={(e) => f.set(e.target.value)}
                                placeholder={f.ph}
                                className="vz-field w-full rounded-2xl pl-12 pr-3 py-3 text-lg text-white font-mono text-left min-h-[52px]"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/45 pointer-events-none">د.ع</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {price !== null && cost !== null && cost >= price && (
                        <p className="-mt-3 text-xs text-amber-200">الكلفة أكبر من سعر البيع؟ تأكد من الأرقام.</p>
                      )}

                      <ChipRow
                        label="كروة التوصيل"
                        options={[4000, 5000, 6000, 7000].map((v) => ({ value: v, label: iqd(v) }))}
                        value={delivery}
                        onChange={setDelivery}
                      />
                      <ChipRow
                        label="شكد تكلفك الرسالة من الإعلان؟"
                        hint="بالدينار، من مدير الإعلانات"
                        options={[...[500, 1000, 1500, 2500].map((v) => ({ value: v, label: iqd(v) })), { value: 0, label: "ما أعرف" }]}
                        value={messageCost === -1 ? null : messageCost}
                        onChange={setMessageCost}
                      />
                      <ChipRow
                        label="من كل 10 ناس يراسلوك، كم واحد يطلب فعلاً؟"
                        options={[...[1, 2, 3, 5].map((v) => ({ value: v, label: String(v) })), { value: 0, label: "ما أعرف" }]}
                        value={closeOf10 === -1 ? null : closeOf10}
                        onChange={setCloseOf10}
                      />
                      <ChipRow
                        label="ومن كل 10 طلبات، كم وحدة ترجع؟"
                        options={[...[0, 1, 2, 3].map((v) => ({ value: v, label: String(v) })), { value: -2, label: "ما أعرف" }]}
                        value={returnsOf10 === -1 ? null : returnsOf10}
                        onChange={setReturnsOf10}
                      />

                      <div className="space-y-2 pt-1">
                        <button
                          disabled={!numbersReady}
                          onClick={() => finish(false)}
                          className={`btn btn-primary w-full min-h-[54px] rounded-full text-base gap-2 disabled:opacity-40 disabled:pointer-events-none ${focusRing}`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>طلّعلي النتيجة</span>
                        </button>
                        <button onClick={() => finish(true)} className={`btn btn-ghost w-full min-h-[44px] rounded-full text-sm text-white/60 ${focusRing}`}>
                          ما عندي أرقام بعد، وريني على مثال
                        </button>
                      </div>
                    </div>
                  )}

                  {step === "working" && <Working />}

                  {step === "result" && saved && <Result profile={saved} onGo={go} onClose={onClose} onRedo={() => setStep("business")} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Working() {
  const lines = ["كلفة المنتج والتوصيل", "كلفة الإعلان على كل طلب", "الطلبات اللي ترجع"];
  return (
    <div className="min-h-[60vh] sm:min-h-[360px] flex flex-col items-center justify-center gap-6 text-center">
      <span className="w-12 h-12 border-[3px] border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true" />
      <div className="space-y-2.5" role="status">
        <p className="text-lg font-black">دا نحسب ربحك الحقيقي...</p>
        {lines.map((l, i) => (
          <motion.p
            key={l}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + i * 0.35, ease: EASE_OUT }}
            className="text-sm text-white/60 inline-flex items-center gap-2 justify-center w-full"
          >
            <Check className="w-4 h-4 text-emerald-400" /> {l}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

function Result({ profile, onGo, onClose, onRedo }: { profile: TrialProfile; onGo: (r: Route) => void; onClose: () => void; onRedo: () => void }) {
  const d = useMemo(() => diagnose(profile), [profile]);
  const pb = playbooksList.find((p) => p.id === profile.problem) ?? playbooksList[0];
  const problem = TRIAL_PROBLEMS.find((p) => p.id === profile.problem);
  const chapters = pb.relatedChapters.map((id) => chaptersList.find((c) => c.id === id)).filter(Boolean).slice(0, 3);
  const est = (field: string) => profile.estimated.includes(field);
  const example = est("price") && est("cost");
  const losing = d.real <= 0;
  const thin = !losing && d.real < d.thinks * 0.4;
  const gain = d.better - d.real;
  const tone = losing ? "text-red-300" : thin ? "text-amber-200" : "text-emerald-300";

  const rows: { label: string; value: number; hint?: string; estimated?: boolean }[] = [
    { label: "كلفة المنتج", value: -profile.cost, estimated: est("cost") },
    { label: "التوصيل", value: -profile.delivery },
    {
      label: "الإعلان على كل طلب",
      value: -d.cpa,
      hint: `الرسالة ${iqd(profile.messageCost)}، ويطلب ${profile.closeOf10} من كل 10`,
      estimated: est("messageCost") || est("closeOf10"),
    },
    {
      label: "الطلبات اللي ترجع",
      value: -d.returnLoss,
      hint: `${profile.returnPct / 10} من كل 10 ترجع: ربحها يروح، وتوصيلها وإعلانها مدفوعين`,
      estimated: est("returnPct"),
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* The number */}
      <section className="space-y-4">
        <p className="text-sm font-bold text-vz-accent">
          {example ? "مثال: منتج تبيعه بـ 35 ألف" : `نتيجة مشروعك (${profile.category})`}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-subtle rounded-2xl p-4 space-y-1">
            <p className="text-xs font-bold text-white/55">الربح اللي تحسبه</p>
            <p className="text-xl sm:text-2xl font-black font-mono text-white/45 line-through decoration-white/40">{iqd(d.thinks)}</p>
            <p className="text-[11px] text-white/40">سعر البيع − الكلفة</p>
          </div>
          <div className="glass rounded-2xl p-4 space-y-1 border border-white/15">
            <p className="text-xs font-bold text-white/70">ربحك الحقيقي بالطلب</p>
            <p className={`text-2xl sm:text-3xl font-black font-mono ${tone}`}>
              <CountTo from={d.thinks} to={d.real} />
            </p>
            <p className="text-[11px] text-white/45">دينار، بعد كلشي</p>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black leading-snug">
          {losing
            ? <>كل طلب دا يخسرك <span className="text-red-300 font-mono">{iqd(-d.real)}</span> دينار، حتى لو تبيع هواية.</>
            : thin
              ? <>من كل <span className="font-mono">{iqd(d.thinks)}</span> تحسبها ربح، يبقالك بس <span className="text-amber-200 font-mono">{iqd(d.real)}</span>.</>
              : <>مشروعك رابح بالطلب. الشغل الجاي إنك تكبّر بدون ما يضيع هالربح.</>}
        </h2>
      </section>

      {/* Where it goes */}
      <section className="glass rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] text-sm">
          <span className="font-bold text-white/70">سعر البيع</span>
          <span className="flex items-center gap-1.5 font-black font-mono">{est("price") && <EstTag />}{iqd(profile.price)}</span>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {rows.map((r) => (
            <li key={r.label} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 flex-wrap font-bold text-white/85">{r.label}{r.estimated && <EstTag />}</span>
                {r.hint && <span className="block text-[11px] text-white/45 mt-0.5 leading-relaxed">{r.hint}</span>}
              </span>
              <span className="font-mono font-bold text-red-300/90 shrink-0">{iqd(r.value)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.04] border-t border-white/[0.08]">
          <span className="font-black">يبقالك</span>
          <span className={`font-black font-mono text-lg ${tone}`}>{iqd(d.real)}</span>
        </div>
      </section>

      {/* What fixing it is worth */}
      {gain > 0 && (
        <section className="glass-elevated glass-edge rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold text-emerald-300 inline-flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> نفس المنتج، ونفس الإعلان
          </p>
          <p className="text-base sm:text-lg font-black leading-snug">
            لو صار يطلب {d.betterCloseOf10} من كل 10 بدل {profile.closeOf10}
            {d.betterReturnPct < profile.returnPct ? `، ونزل الراجع لواحد من كل 10` : ""}، ربحك بالطلب يصير{" "}
            <span className="text-emerald-300 font-mono">{iqd(d.better)}</span>
          </p>
          <p className="text-sm text-white/70">
            على كل 100 طلب، هذا <span className="font-black text-white font-mono">{iqd(gain * 100)}</span> دينار زيادة بجيبك.
          </p>
          <p className="text-xs text-white/50 leading-relaxed">
            مو وعد، حسبة على أرقامك. الرد اللي يقفل البيعة بالفصل 7، وتأكيد الطلب قبل لا يطلع بالفصل 8.
          </p>
        </section>
      )}

      {/* The solution waiting for them */}
      <section className="glass rounded-3xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <TopicIcon kind="playbook" id={pb.id} />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-bold text-vz-accent">حل مشكلتك جاهز بالمنصة{problem ? `: «${problem.label}»` : ""}</p>
            <h3 className="text-base sm:text-lg font-black leading-snug">{pb.title}</h3>
            <p className="text-xs text-white/55">{pb.steps.length} خطوات، {pb.scripts.length} رسائل جاهزة تنسخها، وخطة 7 أيام</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {pb.steps.slice(0, 3).map((st, i) => (
            <li key={st.title} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm text-white/80">
              <Lock className="w-3.5 h-3.5 text-white/35 shrink-0" />
              <span className="leading-snug">خطوة {i + 1}: {st.title}</span>
            </li>
          ))}
        </ul>
        {chapters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chapters.map((ch) => ch && (
              <span key={ch.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/60">
                <BookOpen className="w-3 h-3" />{ch.number}: {ch.title}
              </span>
            ))}
          </div>
        )}
        <button onClick={() => onGo({ view: "solution", id: pb.id })} className={`btn btn-glass w-full min-h-[48px] rounded-full text-sm gap-2 ${focusRing}`}>
          <span>شوف التشخيص الكامل لمشكلتك</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </section>

      {/* A real member */}
      <section className="glass-subtle rounded-3xl p-5 space-y-2">
        <p className="text-[11px] font-bold text-white/45">رسالة من واحد من {STUDENT_COUNT} مشترك</p>
        <p className="text-base sm:text-lg font-black leading-snug">«استاذ والله دامشي حسب الخطة بالضبط»</p>
        <p className="text-sm text-white/65 leading-relaxed">صرف 70$ على الإعلان، وباع بمليون و475 ألف.</p>
      </section>

      {/* The offer */}
      <section className="glass-elevated glass-edge rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black">افتح الحل كامل، وطبّقه من اليوم</h3>
          <p className="text-xs sm:text-sm text-white/60">اشتراك واحد يفتح كلشي، مو بس هالحل. وياك {STUDENT_COUNT} مشترك لحد هسه.</p>
        </div>
        <OfferPrice size="md" />
        <ul className="space-y-2 text-sm text-white/85">
          {PLAN_INCLUDES.slice(0, 5).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <SubscribeButton label="أريد أشترك، دزلي طريقة الدفع" />
          <p className="text-[11px] text-center text-white/50">تنفتح واتساب والرسالة مكتوبة بيها نتيجتك، بس دوس إرسال.</p>
        </div>
        <button onClick={() => onGo({ view: "chapter", id: "chapter1" })} className={`btn btn-ghost w-full min-h-[44px] rounded-full text-sm text-white/65 ${focusRing}`}>
          كمّل التجربة المجانية من الفصل الأول
        </button>
      </section>

      <div className="flex items-center justify-center gap-2">
        <button onClick={onRedo} className={`btn btn-ghost min-h-[40px] px-4 rounded-full text-xs text-white/50 ${focusRing}`}>
          عيدها بأرقام ثانية
        </button>
        <span className="text-white/20" aria-hidden="true">·</span>
        <button onClick={onClose} className={`btn btn-ghost min-h-[40px] px-4 rounded-full text-xs text-white/50 ${focusRing}`}>
          ارجع للمنصة
        </button>
      </div>
    </div>
  );
}

function EstTag() {
  return <span className="shrink-0 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.07] text-white/50">تقدير</span>;
}
