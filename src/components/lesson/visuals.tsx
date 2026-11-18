import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, Clock, MessageCircle, ShieldCheck, Truck, User, X } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

const ease = { duration: 0.5, ease: EASE_OUT };

function Toggle({ value, options, onChange }: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void }) {
  return (
    <div className="inline-flex p-1 rounded-2xl bg-white/[0.05] border border-white/10 mb-5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-4 sm:px-5 min-h-[44px] rounded-xl text-[15px] font-black transition-colors duration-200 ${
            value === o.id ? "bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const COLS = 10;
const ROWS = 6;
const TARGET = 24;

export function OnePerson() {
  const [mode, setMode] = useState("all");
  const focus = mode === "one";
  const tr = Math.floor(TARGET / COLS);
  const tc = TARGET % COLS;
  return (
    <div>
      <Toggle value={mode} onChange={setMode} options={[{ id: "all", label: "إعلان للكل" }, { id: "one", label: "إعلان لشخص واحد" }]} />
      <div className="glass rounded-3xl p-4 sm:p-6 grid grid-cols-10 gap-x-1 gap-y-3 sm:gap-y-4 justify-items-center">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const d = Math.max(Math.abs(Math.floor(i / COLS) - tr), Math.abs((i % COLS) - tc));
          const isTarget = i === TARGET;
          const opacity = !focus ? 0.32 : isTarget ? 1 : d === 1 ? 0.8 : 0.1;
          return (
            <motion.span
              key={i}
              animate={{ opacity, scale: focus && isTarget ? 1.6 : 1 }}
              transition={ease}
              className={focus && (isTarget || d === 1) ? "text-vz-blue-light" : "text-white"}
            >
              <User className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.4} />
            </motion.span>
          );
        })}
      </div>
      <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-5">
        {focus ? (
          <>
            <p className="text-[19px] sm:text-[22px] font-black text-white leading-relaxed">موظف ببغداد، يركن سيارته بالشمس من 8 لـ 2</p>
            <p className="text-[16px] sm:text-[18px] text-white/70 leading-relaxed mt-1">هو يحس الإعلان إله ويوكف. واللي يشبهونه حوله يوكفون هم.</p>
          </>
        ) : (
          <>
            <p className="text-[19px] sm:text-[22px] font-black text-white leading-relaxed">مظلة سيارة لكل أنواع السيارات</p>
            <p className="text-[16px] sm:text-[18px] text-white/70 leading-relaxed mt-1">الكل يشوفه، ومحد يحس إنه إله. يعبرون خلال ثانية.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

const SENTENCE = [
  { tag: "منو هو", text: "موظف ببغداد يركن سيارته بالشمس من 8 لـ 2", before: "زبوني هو ", tone: "bg-vz-blue/25 border-vz-blue-light/50 text-white" },
  { tag: "مشكلته بكلامه", text: "السيارة تصير فرن والستيرن ما ينلزم", before: "، مشكلته إنه ", tone: "bg-rose-500/20 border-rose-400/45 text-white" },
  { tag: "شنو يريد", text: "يصعد للسيارة الظهر وما يحترك", before: "، يريد ", tone: "bg-emerald-500/20 border-emerald-400/45 text-white" },
  { tag: "شنو يخاف", text: "تطلع رديئة وتتكسر بعد شهر", before: "، بس خايف ", tone: "bg-amber-400/20 border-amber-300/45 text-white" },
];

export function CustomerSentence({ shown = SENTENCE.length }: { shown?: number }) {
  const done = shown >= SENTENCE.length;
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {SENTENCE.map((s, i) => (
          <span key={s.tag} className={`px-3 py-1.5 rounded-xl border text-[14px] font-black transition-opacity duration-300 ${s.tone} ${i < shown ? "opacity-100" : "opacity-25"}`}>
            {i + 1}. {s.tag}
          </span>
        ))}
      </div>
      <div className="glass-elevated rounded-3xl p-5 sm:p-7 space-y-3 min-h-[240px]">
        {SENTENCE.slice(0, shown).map((s) => (
          <motion.p key={s.tag} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={ease} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[17px] sm:text-[20px] font-bold text-white/55 shrink-0">{s.before.replace(/^،\s*/, "")}</span>
            <span className={`px-3 py-1 rounded-xl border text-[19px] sm:text-[23px] font-black leading-[1.6] ${s.tone}`}>{s.text}</span>
          </motion.p>
        ))}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.2 }} className="mt-5 grid sm:grid-cols-3 gap-3">
          {[
            ["أول لقطة", "سيارة واقفة بالشمس"],
            ["أول جملة", "سيارتك تصير فرن من تطلع من الدوام؟"],
            ["الطمأنة", "تفحصها كدام المندوب قبل لا تدفع"],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-2xl p-4">
              <p className="text-[13px] font-black text-vz-accent mb-1">{k}</p>
              <p className="text-[16px] font-bold text-white leading-relaxed">{v}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

const STAIRS = [
  { id: "watcher", name: "المتفرج", people: 30, mind: "ما يحس إن عنده مشكلة، أو متعود عليها", see: "المشكلة نفسها بشكل يعرفه", content: "فيديو يبدي بالمشكلة، بدون سعر بالبداية" },
  { id: "interested", name: "المهتم", people: 14, mind: "يعرف المشكلة، بس يخاف ينغش", see: "دليل إن المنتج يشتغل: تجربة، آراء زبائن، مقارنة", content: "فيديو تجربة حقيقية، فتح طرد، رأي زبون" },
  { id: "ready", name: "الجاهز", people: 4, mind: "يريد يشتري، يقارن بينك وبين غيرك", see: "السعر، العرض، التوصيل، الفحص كدام المندوب", content: "بوست أو فيديو عرض واضح ويا طريقة الطلب" },
];

export function AwarenessStairs() {
  const [pick, setPick] = useState(1);
  const [walk, setWalk] = useState(-1);
  const s = STAIRS[pick];
  const startWalk = () => {
    setWalk(0);
    setPick(0);
    [1, 2].forEach((n) =>
      setTimeout(() => {
        setWalk(n);
        setPick(n);
      }, n * 1300),
    );
  };
  return (
    <div>
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
        {STAIRS.map((st, i) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setPick(i)}
            className={`relative flex flex-col justify-end items-center rounded-t-3xl rounded-b-xl border px-2 pt-6 pb-3 text-center transition-colors duration-300 ${
              pick === i ? "bg-gradient-to-b from-vz-blue/45 to-vz-blue/10 border-vz-blue-light/60" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07]"
            }`}
            style={{ height: 150 + i * 70 }}
          >
            {st.id === "interested" && <span className="absolute -top-3 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-lg bg-emerald-400 text-[#062018] text-[12px] font-black whitespace-nowrap">فرصتك</span>}
            <span className="flex flex-wrap justify-center gap-0.5 mb-2">
              {Array.from({ length: st.people }, (_, k) => (
                <span key={k} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/70" />
              ))}
            </span>
            {walk === i && (
              <motion.span layoutId="walker" transition={{ duration: 0.8, ease: EASE_OUT }} className="mx-auto mb-1 w-9 h-9 rounded-full bg-amber-300 text-[#2a1c00] flex items-center justify-center">
                <User className="w-5 h-5" strokeWidth={2.6} />
              </motion.span>
            )}
            <span className="mt-2 text-[16px] sm:text-[18px] font-black text-white">{st.name}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 mt-3 text-[13px] font-bold text-white/50">
        <span>ناس هواية، بعيدين عن الشراء</span>
        <span>قلة، والكل يتعارك عليهم</span>
      </div>
      <motion.div key={pick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 sm:p-6 mt-5 space-y-3">
        <p className="text-[20px] font-black text-white">{s.name}</p>
        <p className="text-[16px] text-white/80 leading-relaxed"><span className="font-black text-vz-accent">بباله: </span>{s.mind}</p>
        <p className="text-[16px] text-white/80 leading-relaxed"><span className="font-black text-vz-accent">لازم يشوف: </span>{s.see}</p>
        <p className="text-[16px] text-white/80 leading-relaxed"><span className="font-black text-vz-accent">المحتوى: </span>{s.content}</p>
      </motion.div>
      <button type="button" onClick={startWalk} className="mt-4 btn btn-glass min-h-[48px] px-5 rounded-2xl text-[15px]">
        {walk < 0 ? "شوف شلون ينتقل نفس الزبون" : walk === 0 ? "اليوم: شاف فيديو المشكلة" : walk === 1 ? "باجر: شاف التجربة" : "بعد أسبوع: شاف العرض وطلب"}
      </button>
    </div>
  );
}

const FEARS = [
  { fear: "أخاف أدفع وما يوصل شي", fix: "الدفع عند الاستلام، والفحص كدام المندوب" },
  { fear: "الصورة شي والواقع شي", fix: "فيديو حقيقي مصور بيدك" },
  { fear: "أصلي لو صيني؟ يتكسر؟", fix: "المادة والقياس بصراحة، وضمان واضح" },
  { fear: "إذا ما عجبني شنو أسوي؟", fix: "سياسة استبدال مكتوبة وبسيطة" },
  { fear: "هاي البيج أول مرة أشوفها", fix: "آراء زبائن حقيقيين، ورقم واتساب يرد" },
];

export function TrustScale() {
  const [fixed, setFixed] = useState<number[]>([]);
  const n = fixed.length;
  const angle = 12 - n * 4.4;
  const tipped = n === FEARS.length;
  const lift = Math.sin((angle * Math.PI) / 180) * 120;
  return (
    <div>
      <div className="relative h-[200px] sm:h-[210px] mt-4 mb-2">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-[130px] rounded-full bg-white/20" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-3 rounded-full bg-white/20" />
        <motion.div animate={{ rotate: angle }} transition={{ type: "tween", duration: 0.6, ease: EASE_OUT }} className="absolute left-[6%] right-[6%] top-[66px] h-2.5 rounded-full bg-white/60 origin-center" />
        <motion.div animate={{ y: lift }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute right-[2%] top-[84px] w-[42%] text-center">
          <p className="text-[14px] font-black text-red-300 mb-1">المخاوف</p>
          <p className="text-[34px] font-black text-white leading-none">{FEARS.length - n}</p>
        </motion.div>
        <motion.div animate={{ y: -lift }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute left-[2%] top-[84px] w-[42%] text-center">
          <p className="text-[14px] font-black text-emerald-300 mb-1">الطمأنة</p>
          <p className="text-[34px] font-black text-white leading-none">{n}</p>
        </motion.div>
      </div>
      <p className={`text-center text-[18px] sm:text-[20px] font-black mb-5 ${tipped ? "text-emerald-300" : "text-white/70"}`}>
        {tipped ? "هسه الكفة مالت، والزبون يطلب" : "اضغط على كل خوف وشوف شلون تطمنه"}
      </p>
      <div className="grid gap-2.5">
        {FEARS.map((f, i) => {
          const ok = fixed.includes(i);
          return (
            <button
              key={f.fear}
              type="button"
              disabled={ok}
              onClick={() => setFixed((x) => [...x, i])}
              className={`w-full text-right rounded-2xl p-4 border transition-colors duration-300 ${ok ? "bg-emerald-400/[0.1] border-emerald-400/40" : "bg-red-500/[0.07] border-red-400/25 hover:bg-red-500/[0.12] cursor-pointer"}`}
            >
              <span className={`block text-[16px] font-black ${ok ? "text-white/50 line-through decoration-red-300/60" : "text-white"}`}>{f.fear}</span>
              {ok && (
                <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-start gap-2 text-[16px] font-bold text-emerald-200">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  {f.fix}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const RIVALS = [
  { name: "منافس 1", offer: "35 ألف، توصيل مجاني", reply: "ساعتين", replyPct: 70, replyTone: "bg-amber-300", complaint: "تأخير التوصيل", chance: "توصيل أسرع وتأكيد بنفس اليوم" },
  { name: "منافس 2", offer: "29 ألف، بدون عرض", reply: "ما رد", replyPct: 100, replyTone: "bg-red-400", complaint: "الصور مو حقيقية", chance: "فيديو حقيقي بيدك" },
  { name: "منافس 3", offer: "40 ألف، ويا هدية", reply: "10 دقايق", replyPct: 12, replyTone: "bg-emerald-400", complaint: "ما يتبدل", chance: "سياسة استبدال واضحة" },
];

export function CompetitorBoard() {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className="grid gap-3">
      {RIVALS.map((r, i) => {
        const shown = open.includes(i);
        return (
          <div key={r.name} className="glass rounded-3xl p-5">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <p className="text-[19px] font-black text-white">{r.name}</p>
              <p className="text-[15px] font-bold text-white/70">{r.offer}</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-4 h-4 text-white/50 shrink-0" />
              <div className="flex-1 h-3 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.replyPct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.15 }} className={`h-full rounded-full ${r.replyTone}`} />
              </div>
              <span className="text-[14px] font-black text-white w-20 text-left">{r.reply}</span>
            </div>
            <p className="flex items-center gap-2 text-[16px] text-red-200 font-bold mb-3">
              <MessageCircle className="w-4 h-4 shrink-0" />
              زبائنه يشتكون: {r.complaint}
            </p>
            {shown ? (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 rounded-2xl bg-emerald-400/[0.1] border border-emerald-400/35 p-3 text-[16px] font-black text-emerald-200">
                <Check className="w-5 h-5 shrink-0" strokeWidth={3} />
                فرصتك: {r.chance}
              </motion.p>
            ) : (
              <button type="button" onClick={() => setOpen((o) => [...o, i])} className="btn btn-glass min-h-[44px] px-4 rounded-xl text-[15px]">
                شنو فرصتك هنا؟
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const dayStrength = (d: number) => (d <= 7 || d >= 28 ? 3 : d <= 14 ? 2 : 1);

export function SalaryMonth() {
  const [mode, setMode] = useState("demand");
  return (
    <div>
      <Toggle value={mode} onChange={setMode} options={[{ id: "demand", label: "قوة الشراء" }, { id: "budget", label: "شلون توزع الصرف" }]} />
      <div className="glass rounded-3xl p-4 sm:p-6">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {Array.from({ length: 30 }, (_, k) => {
            const d = k + 1;
            const s = dayStrength(d);
            const bg = s === 3 ? "bg-emerald-400" : s === 2 ? "bg-vz-blue-light/70" : "bg-white/10";
            const h = mode === "budget" ? [18, 30, 46][s - 1] : 44;
            return (
              <div key={d} className="flex flex-col items-center justify-end h-[60px]">
                <motion.div animate={{ height: h }} transition={{ duration: 0.5, ease: EASE_OUT, delay: (d % 10) * 0.02 }} className={`w-full rounded-lg ${bg}`} />
                <span className="text-[11px] sm:text-[12px] font-bold text-white/50 mt-1">{d}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[14px] font-bold text-white/75">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-400" />بعد الراتب: الطلب أسهل</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-vz-blue-light/70" />نص الشهر</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white/15" />قبل الراتب: أصعب</span>
        </div>
      </div>
      <p className="mt-4 text-[16px] sm:text-[18px] text-white/75 leading-relaxed">
        {mode === "demand"
          ? "هذا شكل تقريبي. الرواتب تنزل بأواخر الشهر أو بدايته، والمواعيد تتغير. سجل طلباتك شهرين وشوف شكل شهرك."
          : "الصرف الأقوى بعد الراتب، وتخفف قبله بدل ما تطفي الإعلان كليا. واحكم على أسبوع كامل، مو يوم أو يومين."}
      </p>
    </div>
  );
}

const ZONES = [
  { name: "داخل بغداد", days: "يوم أو يومين", pct: 30, risk: 1 },
  { name: "المحافظات", days: "يومين لثلاث", pct: 60, risk: 2 },
  { name: "الأقضية البعيدة", days: "أكثر، وكروة أعلى", pct: 100, risk: 3 },
];

export function DeliveryDistance() {
  return (
    <div className="glass rounded-3xl p-5 sm:p-6 space-y-5">
      {ZONES.map((z, i) => (
        <div key={z.name}>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="text-[17px] font-black text-white">{z.name}</p>
            <p className="text-[14px] font-bold text-white/60">{z.days}</p>
          </div>
          <div className="relative h-10 rounded-2xl bg-white/[0.05] overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${z.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_OUT, delay: i * 0.2 }} className="absolute inset-y-0 right-0 rounded-2xl bg-gradient-to-l from-vz-blue/60 to-vz-blue-light/30" />
            <motion.span initial={{ right: "0%" }} whileInView={{ right: `calc(${z.pct}% - 36px)` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_OUT, delay: i * 0.2 }} className="absolute top-1/2 -translate-y-1/2 text-white">
              <Truck className="w-7 h-7 -scale-x-100" />
            </motion.span>
          </div>
          <p className="mt-1.5 text-[13px] font-bold text-white/55">
            احتمال الراجع: <span className={["text-emerald-300", "text-amber-200", "text-red-300"][z.risk - 1]}>{["أقل", "أعلى", "الأعلى"][z.risk - 1]}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

const PRICE = 39000;
const COSTS = [
  { label: "كلفة القطعة الواصلة", v: 17500 },
  { label: "التوصيل", v: 5000 },
  { label: "عمولة الاستلام 2%", v: 780 },
  { label: "الإعلان لكل طلب واصل", v: 10000 },
  { label: "خسارة الراجع", v: 1500 },
];
const fmt = (n: number) => n.toLocaleString("en-US");

export function OrderWaterfall({ shown = COSTS.length + 2 }: { shown?: number }) {
  let left = PRICE;
  const rows = COSTS.map((c) => {
    const from = left;
    left -= c.v;
    return { ...c, from, to: left };
  });
  const profit = left;
  const pct = (n: number) => `${(n / PRICE) * 100}%`;
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[15px] font-black text-white">سعر البيع</span>
          <span className="text-[17px] font-black text-white">{fmt(PRICE)}</span>
        </div>
        <div className="h-9 rounded-xl bg-white/[0.05] overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.7, ease: EASE_OUT }} className="h-full mr-0 rounded-xl bg-gradient-to-l from-vz-blue-light to-vz-blue-deep" />
        </div>
      </div>
      {rows.slice(0, Math.max(0, shown - 1)).map((r) => (
        <motion.div key={r.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[15px] font-bold text-white/80">{r.label}</span>
            <span className="text-[16px] font-black text-red-300" dir="ltr">−{fmt(r.v)}</span>
          </div>
          <div className="relative h-9 rounded-xl bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 right-0 rounded-xl bg-white/10" style={{ width: pct(r.to) }} />
            <motion.div initial={{ width: 0 }} animate={{ width: pct(r.v) }} transition={{ duration: 0.6, ease: EASE_OUT }} className="absolute inset-y-0 rounded-xl bg-red-400/80" style={{ right: pct(r.to) }} />
          </div>
        </motion.div>
      ))}
      {shown > COSTS.length + 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="glass-elevated rounded-3xl p-5 mt-4">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <span className="text-[17px] font-black text-white">يبقالك من كل طلب واصل</span>
            <span className="text-[34px] sm:text-[42px] font-black text-emerald-300 leading-none">{fmt(profit)}</span>
          </div>
          <div className="relative h-9 rounded-xl bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 right-0 rounded-xl border-2 border-dashed border-amber-200/70" style={{ width: pct(28500) }} />
            <motion.div initial={{ width: 0 }} animate={{ width: pct(profit) }} transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }} className="absolute inset-y-0 right-0 rounded-xl bg-emerald-400" />
          </div>
          <p className="mt-3 text-[15px] font-bold text-amber-100 flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            الخط المنقط هو اللي كنت تتصوره بالحساب السريع: 28,500
          </p>
        </motion.div>
      )}
    </div>
  );
}

const PRICES = [29000, 34000, 39000, 44000, 49000];

export function PriceSlider() {
  const [i, setI] = useState(2);
  const price = PRICES[i];
  const before = 17500 + 5000 + Math.round(price * 0.02) + 1500;
  const limit = price - before;
  const profit = limit - 10000;
  const max = 26000;
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="text-[16px] font-black text-white/80 mb-2">حرك السعر وشوف شنو يصير</p>
      <p className="text-[52px] sm:text-[64px] font-black text-white leading-none mb-4" dir="ltr">{fmt(price)}</p>
      <input type="range" dir="ltr" min={0} max={PRICES.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} className="w-full" aria-label="السعر" />
      <div className="flex justify-between text-[12px] font-bold text-white/45 mt-1" dir="ltr">
        {PRICES.map((p) => <span key={p}>{p / 1000}</span>)}
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[15px] font-bold text-white/80">حد الخسارة (أعلى إعلان تتحمله للطلب)</span>
            <span className="text-[17px] font-black text-vz-accent">{fmt(limit)}</span>
          </div>
          <div className="h-8 rounded-xl bg-white/[0.05] overflow-hidden relative">
            <motion.div animate={{ width: `${(Math.max(0, limit) / max) * 100}%` }} transition={{ duration: 0.4, ease: EASE_OUT }} className="h-full rounded-xl bg-gradient-to-l from-vz-blue-light to-vz-blue-deep" />
            <span className="absolute inset-y-0 border-r-2 border-dashed border-amber-200" style={{ right: `${(10000 / max) * 100}%` }} />
          </div>
          <p className="mt-1 text-[13px] font-bold text-amber-200">الخط المنقط: إعلانك هسه 10,000 للطلب الواصل</p>
        </div>
        <div className="flex items-baseline justify-between gap-3 rounded-2xl p-4 bg-white/[0.04] border border-white/10">
          <span className="text-[17px] font-black text-white">يبقالك من كل طلب</span>
          <span className={`text-[34px] font-black leading-none ${profit >= 0 ? "text-emerald-300" : "text-red-300"}`} dir="ltr">
            {profit < 0 ? "−" : ""}
            {fmt(Math.abs(profit))}
          </span>
        </div>
        <p className="text-[15px] text-white/70 leading-relaxed">
          {profit < 0 ? "على هالسعر كل طلب يخسرك، حتى لو الإعلان زين." : limit < 15000 ? "تربح بس المسافة ضيقة: أي غلاء بالإعلان يقلبها خسارة." : "عندك مسافة: الإعلان يكدر يغلى شوية وتبقى رابح."}
        </p>
      </div>
    </div>
  );
}

export function ScrollStop() {
  const [mode, setMode] = useState("weak");
  const strong = mode === "strong";
  const cards = ["", "", "mine", "", "", "", "mine", ""];
  return (
    <div>
      <Toggle value={mode} onChange={setMode} options={[{ id: "weak", label: "بداية ضعيفة" }, { id: "strong", label: "بداية قوية" }]} />
      <div className="relative mx-auto w-[230px] sm:w-[260px] h-[380px] rounded-[36px] border-4 border-white/15 bg-black/40 overflow-hidden">
        <motion.div
          key={mode}
          className="absolute inset-x-3 top-3 space-y-3"
          initial={{ y: 0 }}
          animate={strong ? { y: [0, -560, -575, -560] } : { y: [0, -1000] }}
          transition={strong ? { duration: 2.2, times: [0, 0.8, 0.92, 1], ease: "easeOut" } : { duration: 3.2, repeat: Infinity, ease: "linear" }}
        >
          {[...cards, ...cards].map((c, i) => (
            <div key={i} className={`h-[110px] rounded-2xl p-3 flex items-end ${c === "mine" ? (strong ? "bg-gradient-to-b from-vz-blue/60 to-vz-blue/20 border border-vz-blue-light/60" : "bg-white/15") : "bg-white/[0.07]"}`}>
              {c === "mine" && (
                <p className={`text-[13px] font-black leading-snug ${strong ? "text-white" : "text-white/60"}`}>
                  {strong ? "بقعة الشاي؟ شوف شلون تروح بثانيتين" : "السلام عليكم، اليوم جبنالكم منتج جديد ومميز"}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </div>
      <p className={`mt-5 text-center text-[18px] font-black ${strong ? "text-emerald-300" : "text-red-300"}`}>
        {strong ? "الإصبع وكف: المشكلة بانت من أول فريم" : "الإعلان مالتك عبر ويا الباقي، محد وكف عليه"}
      </p>
    </div>
  );
}

export const VISUALS: Record<string, { render: (shown: number) => React.ReactNode; steps?: number }> = {
  "one-person": { render: () => <OnePerson /> },
  "customer-sentence": { render: (shown) => <CustomerSentence shown={shown} />, steps: SENTENCE.length },
  "awareness-stairs": { render: () => <AwarenessStairs /> },
  "trust-scale": { render: () => <TrustScale /> },
  "competitor-board": { render: () => <CompetitorBoard /> },
  "salary-month": { render: () => <SalaryMonth /> },
  "delivery-distance": { render: () => <DeliveryDistance /> },
  "order-waterfall": { render: (shown) => <OrderWaterfall shown={shown} />, steps: COSTS.length + 2 },
  "price-slider": { render: () => <PriceSlider /> },
  "scroll-stop": { render: () => <ScrollStop /> },
};
