import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, X, Clock } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 7 visuals: the reply log, the price reply builder, the sales chat, the objections and the follow-up plan.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const tab = (on: boolean) =>
  `flex-1 min-h-[44px] rounded-xl text-[14px] font-black border transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;
const pick = (on: boolean) =>
  `w-full min-h-[48px] rounded-xl border px-3.5 py-2.5 text-right text-[14px] leading-relaxed transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white font-bold" : "bg-white/[0.04] border-white/12 text-white/85"}`;
const wait = (m: number) => (m < 60 ? `${m} دقيقة` : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} ساعة`);

function Bubble({ from, children, delay = 0 }: { from: "customer" | "seller"; children: React.ReactNode; delay?: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ease, delay }}
      className={`w-fit max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-line ${from === "customer" ? "bg-white/[0.09] text-white/90" : "mr-auto bg-[#1d3a7a]/80 text-white"}`}
    >
      {children}
    </motion.p>
  );
}

/* ---------- replylog: 20 chats, how long each waited for the first reply ---------- */
type LogSide = { label: string; waits: number[]; say: string };
function ReplyLog({ d }: { d: { cost: number; before: LogSide; after: LogSide } }) {
  const [after, setAfter] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const s = after ? d.after : d.before;
  const avg = s.waits.reduce((a, b) => a + b, 0) / s.waits.length;
  const fast = s.waits.filter((w) => w <= 5).length;
  const late = s.waits.filter((w) => w > 30).length;
  const max = 320;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => { setAfter(false); setOpen(null); }} className={tab(!after)}>{d.before.label}</button>
        <button type="button" onClick={() => { setAfter(true); setOpen(null); }} className={tab(after)}>{d.after.label}</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["معدل وقت الرد", wait(Math.round(avg))],
          ["رد خلال 5 دقايق", `${fast} من ${s.waits.length}`],
          ["رسائل دافع عليها وتأخرت أكثر من نص ساعة", `${fmt(late * d.cost)} د.ع`],
        ].map(([k, v]) => (
          <div key={k} className={`${card} p-3`}>
            <p className="text-[12px] font-bold text-white/55 leading-snug">{k}</p>
            <motion.p key={v + after} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-1 text-[18px] sm:text-[20px] font-black text-white">{v}</motion.p>
          </div>
        ))}
      </div>
      <div className={`${card} p-3.5 space-y-1`}>
        <p className="text-[13px] font-bold text-white/55 mb-2">آخر 20 محادثة. اضغط على أي وحدة حتى تشوف وقت الرد</p>
        {s.waits.map((w, i) => (
          <button key={i} type="button" onClick={() => setOpen(i)} className="w-full flex items-center gap-2 min-h-[22px]" aria-label={`محادثة ${i + 1}: ${wait(w)}`}>
            <span className="w-6 text-[11px] font-bold text-white/45 shrink-0">{i + 1}</span>
            <span className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.span
                className={`block h-full rounded-full ${w <= 5 ? "bg-emerald-300" : w <= 30 ? "bg-sky-300/80" : "bg-red-300/80"}`}
                initial={false}
                animate={{ width: `${Math.max(2, (Math.min(w, max) / max) * 100)}%` }}
                transition={{ ...ease, delay: i * 0.02 }}
              />
            </span>
            <span className={`w-20 text-left text-[11px] font-bold shrink-0 ${open === i ? "text-white" : "text-white/45"}`}>{open === i ? wait(w) : ""}</span>
          </button>
        ))}
        <p className="pt-2 text-[12px] text-white/50">الأخضر خلال 5 دقايق، الأزرق لحد نص ساعة، والأحمر أكثر من نص ساعة</p>
      </div>
      <motion.p key={String(after)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${after ? "text-emerald-200" : "text-red-200"}`}>
        {s.say}
      </motion.p>
    </div>
  );
}

/* ---------- pricereply: build the answer to "how much?" and watch the customer answer ---------- */
type Part = { id: string; label: string; text: string };
type Closer = { text: string; ask: boolean };
type PriceData = {
  ask: string;
  parts: Part[];
  closers: Closer[];
  replies: { noPrice: string; bare: string; think: string; fear: string; compare: string; win: string; winOffer: string };
  says: { noPrice: string; bare: string; think: string; fear: string; compare: string; win: string };
};
function PriceReply({ d }: { d: PriceData }) {
  const [on, setOn] = useState<Record<string, boolean>>({ price: true });
  const [closer, setCloser] = useState<number | null>(null);
  const [sent, setSent] = useState(0);
  const has = (id: string) => !!on[id];
  const text = [...d.parts.filter((p) => has(p.id)).map((p) => p.text), closer !== null ? d.closers[closer].text : ""].filter(Boolean).join(" ");
  let key: keyof PriceData["says"];
  if (!has("price")) key = "noPrice";
  else if (!has("benefit") && !has("guarantee") && closer === null) key = "bare";
  else if (closer !== null && d.closers[closer].ask) key = "think";
  else if (!has("guarantee")) key = "fear";
  else if (!has("benefit")) key = "compare";
  else if (closer === null) key = "bare";
  else key = "win";
  const reply = key === "win" ? (has("offer") ? d.replies.winOffer : d.replies.win) : d.replies[key];
  const good = key === "win";
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/75 leading-relaxed">اختار شنو يدخل بردك، واختار السؤال اللي تختم بيه، وبعدها دز الرد.</p>
      <div className="flex flex-wrap gap-2">
        {d.parts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setOn((o) => ({ ...o, [p.id]: !o[p.id] })); setSent(0); }}
            className={`min-h-[44px] px-3.5 rounded-xl border text-[14px] font-black flex items-center gap-1.5 transition-colors duration-200 ${has(p.id) ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/75"}`}
          >
            {has(p.id) && <Check className="w-4 h-4" aria-hidden="true" />}
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {d.closers.map((c, i) => (
          <button key={c.text} type="button" onClick={() => { setCloser(closer === i ? null : i); setSent(0); }} className={pick(closer === i)}>
            {c.text}
          </button>
        ))}
      </div>
      <div className={`${card} p-3.5 space-y-2.5`}>
        <Bubble from="customer">{d.ask}</Bubble>
        {text && <Bubble from="seller">{text}</Bubble>}
        {sent > 0 && (
          <motion.div key={sent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="space-y-2.5">
            <Bubble from="customer" delay={0.6}>{reply}</Bubble>
          </motion.div>
        )}
      </div>
      <button type="button" onClick={() => setSent((n) => n + 1)} disabled={!text} className="w-full min-h-[48px] rounded-xl bg-white text-[#040e33] text-[15px] font-black disabled:opacity-50">
        دز الرد
      </button>
      {sent > 0 && (
        <motion.p key={"s" + sent} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 1 }} className={`text-[16px] font-bold leading-relaxed ${good ? "text-emerald-200" : "text-red-200"}`}>
          {d.says[key]}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- salechat: pick the next message, stage by stage, up to the order summary ---------- */
type COpt = { text: string; good?: boolean; say: string };
type CStep = { stage: string; customer: string; options: COpt[] };
function SaleChat({ d }: { d: { stages: string[]; steps: CStep[]; done: string } }) {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState<{ step: number; i: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const finished = at >= d.steps.length;
  const choose = (i: number) => {
    const o = d.steps[at].options[i];
    if (o.good) { setAt(at + 1); setMiss(null); }
    else { setMiss({ step: at, i }); setMisses((m) => m + 1); }
  };
  const stageNow = finished ? d.stages.length : d.stages.indexOf(d.steps[at].stage);
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5" aria-hidden="true">
        {d.stages.map((s, i) => (
          <span key={s} className={`flex-1 rounded-lg px-1 py-1.5 text-center text-[12px] font-black border transition-colors duration-300 ${i < stageNow ? "border-emerald-300/50 text-emerald-200" : i === stageNow ? "bg-white text-[#040e33] border-white" : "border-white/10 text-white/40"}`}>
            {s}
          </span>
        ))}
      </div>
      <div className={`${card} p-3.5 space-y-2.5`}>
        {d.steps.slice(0, Math.min(at + 1, d.steps.length)).map((s, k) => (
          <React.Fragment key={k}>
            <Bubble from="customer">{s.customer}</Bubble>
            {k < at && <Bubble from="seller">{s.options.find((o) => o.good)!.text}</Bubble>}
          </React.Fragment>
        ))}
        {miss && miss.step === at && (
          <>
            <Bubble from="seller">{d.steps[at].options[miss.i].text}</Bubble>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.5 }} className="text-[12px] text-white/45">شافت الرسالة وما ردت</motion.p>
          </>
        )}
      </div>
      {!finished && (
        <div className="space-y-2">
          <p className="text-[14px] font-bold text-white/65">شنو تدز هسه؟</p>
          {d.steps[at].options.map((o, i) => (
            <button key={o.text} type="button" onClick={() => choose(i)} className={pick(miss?.step === at && miss.i === i)}>
              {o.text}
            </button>
          ))}
          {miss && miss.step === at && (
            <motion.p key={miss.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              {d.steps[at].options[miss.i].say} جرب رد ثاني.
            </motion.p>
          )}
        </div>
      )}
      {finished && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">
          {d.done} {misses ? `وقفت المحادثة ${misses === 1 ? "مرة وحدة" : misses === 2 ? "مرتين" : `${misses} مرات`} بالطريق، وكل وقفة بالحقيقة ممكن تكون زبون ما يرجع.` : "وما وقفت المحادثة ولا مرة."}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- objections: four rounds, each answer costs or keeps something ---------- */
type OOpt = { text: string; kind: "good" | "cut" | "bad"; reply: string; say: string; cut?: number };
type Round = { product: string; says: string; options: OOpt[] };
function Objections({ d }: { d: { rounds: Round[]; done: string } }) {
  const [got, setGot] = useState<Record<number, number>>({});
  const n = Object.keys(got).length;
  const kept = d.rounds.filter((r, i) => got[i] !== undefined && r.options[got[i]].kind === "good").length;
  const cut = d.rounds.reduce((t, r, i) => t + (got[i] !== undefined ? r.options[got[i]].cut ?? 0 : 0), 0);
  return (
    <div className="space-y-4">
      {d.rounds.map((r, i) => {
        const g = got[i];
        const o = g !== undefined ? r.options[g] : null;
        return (
          <div key={r.says} className={`${card} p-3.5 space-y-2.5`}>
            <p className="text-[12px] font-bold text-white/50">{r.product}</p>
            <Bubble from="customer">{r.says}</Bubble>
            {o === null ? (
              <div className="space-y-2">
                {r.options.map((x, j) => (
                  <button key={x.text} type="button" onClick={() => setGot((s) => ({ ...s, [i]: j }))} className={pick(false)}>
                    {x.text}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <Bubble from="seller">{o.text}</Bubble>
                <Bubble from="customer" delay={0.5}>{o.reply}</Bubble>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.9 }} className={`flex items-start gap-2 text-[15px] font-bold leading-relaxed ${o.kind === "good" ? "text-emerald-200" : "text-red-200"}`}>
                  {o.kind === "good" ? <Check className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />}
                  {o.say}
                </motion.p>
                <button type="button" onClick={() => setGot((s) => { const c = { ...s }; delete c[i]; return c; })} className="text-[13px] font-bold text-white/55 min-h-[32px]">
                  جرب رد ثاني
                </button>
              </>
            )}
          </div>
        );
      })}
      {n === d.rounds.length && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-4 space-y-1`}>
          <p className="text-[16px] font-black text-white">جاوبت صح على {kept} من {d.rounds.length}{cut ? `، ونزلت من ربحك ${fmt(cut)} دينار` : "، وسعرك بقى مثل ما هو"}</p>
          <p className="text-[15px] text-white/75 leading-relaxed">{d.done}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- followplan: pick which follow-ups to send and check them against the rules ---------- */
type FMsg = { when: string; hour: number; text: string; fresh: boolean; why: string };
function FollowPlan({ d }: { d: { silent: string; msgs: FMsg[]; okSay: string } }) {
  const [on, setOn] = useState<Record<number, boolean>>({});
  const chosen = d.msgs.map((m, i) => ({ m, i })).filter((x) => on[x.i]);
  const late = (h: number) => h < 10 || h >= 23;
  const issues: string[] = [];
  if (chosen.length > 3) issues.push(`${chosen.length} رسائل. بعد الثالثة توقف وحط ملصق ما كمل.`);
  chosen.forEach(({ m }) => {
    if (late(m.hour)) issues.push(`${m.when}: برة الوقت المناسب، قبل 10 الصبح أو بعد 11 بالليل.`);
    else if (!m.fresh) issues.push(`${m.when}: ما بيها شي جديد، بس ضغط.`);
  });
  const perfect = chosen.length === 3 && issues.length === 0;
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5 flex items-start gap-2.5`}>
        <Clock className="w-4 h-4 mt-1 text-white/60 shrink-0" aria-hidden="true" />
        <p className="text-[15px] text-white/80 leading-relaxed">{d.silent}</p>
      </div>
      <p className="text-[14px] font-bold text-white/65">اختار الرسائل اللي راح تدزها:</p>
      <div className="space-y-2">
        {d.msgs.map((m, i) => (
          <button key={m.text} type="button" onClick={() => setOn((o) => ({ ...o, [i]: !o[i] }))} className={pick(!!on[i])}>
            <span className={`block text-[12px] font-black ${on[i] ? "text-[#040e33]/60" : "text-white/50"}`}>{m.when}</span>
            {m.text}
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <motion.div key={chosen.map((c) => c.i).join(",")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-1.5">
          {perfect ? (
            <p className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.okSay}</p>
          ) : issues.length ? (
            issues.map((t) => (
              <p key={t} className="flex items-start gap-2 text-[15px] font-bold text-red-200 leading-relaxed">
                <X className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />
                {t}
              </p>
            ))
          ) : (
            <p className="text-[15px] font-bold text-white/80 leading-relaxed">لحد هسه زين. {3 - chosen.length > 0 ? `تكدر تضيف لحد ${3 - chosen.length} بعد، كل وحدة بيها شي جديد.` : ""}</p>
          )}
          {chosen.filter(({ m }) => !late(m.hour) && m.fresh).map(({ m }) => (
            <p key={m.when} className="flex items-start gap-2 text-[14px] text-white/70 leading-relaxed">
              <Check className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" aria-hidden="true" />
              {m.when}: {m.why}
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export const KIT7 = {
  replylog: { render: (d) => <ReplyLog d={d} /> },
  pricereply: { render: (d: PriceData) => <PriceReply d={d} /> },
  salechat: { render: (d) => <SaleChat d={d} /> },
  objections: { render: (d) => <Objections d={d} /> },
  followplan: { render: (d) => <FollowPlan d={d} /> },
};
