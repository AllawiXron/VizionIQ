import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 9 visuals: the return cost, the returns log, the pre-shipping queue, the door calls and the public complaint.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pick = (on: boolean) =>
  `w-full min-h-[48px] rounded-xl border px-3.5 py-2.5 text-right text-[14px] leading-relaxed transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white font-bold" : "bg-white/[0.04] border-white/12 text-white/85"}`;
const chip = (on: boolean) =>
  `min-h-[40px] px-3 rounded-xl border text-[13px] font-black transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;
const ghostBtn = "w-full min-h-[48px] rounded-xl border border-white/15 bg-white/[0.04] text-white/85 text-[14px] font-bold";

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

function Slider({ label, value, min, max, step, show, onChange }: { label: string; value: number; min: number; max: number; step: number; show: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-[13px] font-bold text-white/70">
        <span>{label}</span>
        <span className="text-white">{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-white" aria-label={label} />
    </label>
  );
}

/* ---------- returncost: what one return costs and what the month adds up to ---------- */
type CostData = { orders: number; rate: number; target: number; parts: { label: string; v: number }[]; note: string };
function ReturnCost({ d }: { d: CostData }) {
  const [orders, setOrders] = useState(d.orders);
  const [rate, setRate] = useState(d.rate);
  const per = d.parts.reduce((t, p) => t + p.v, 0);
  const back = Math.round((orders * rate) / 100);
  const month = back * per;
  const atTarget = Math.round((orders * d.target) / 100) * per;
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5 space-y-1.5`}>
        <p className="text-[13px] font-black text-white/60 mb-1">كل طلبية ترجع تكلفك</p>
        {d.parts.map((p) => (
          <p key={p.label} className="flex justify-between gap-3 text-[14px] text-white/80">
            <span>{p.label}</span>
            <span dir="ltr" className="font-black text-white shrink-0">{fmt(p.v)}</span>
          </p>
        ))}
        <p className="flex justify-between gap-3 border-t border-white/10 pt-2 text-[15px] font-black text-red-200">
          <span>الطلبية الراجعة الوحدة</span>
          <span className="shrink-0">{fmt(per)} د.ع</span>
        </p>
        <p className="text-[12px] text-white/65">{d.note}</p>
      </div>
      <div className={`${card} p-3.5 space-y-4`}>
        <Slider label="طلبيات تطلع بالشهر" value={orders} min={100} max={600} step={50} show={fmt(orders)} onChange={setOrders} />
        <Slider label="نسبة الراجع" value={rate} min={0} max={40} step={1} show={`${rate}%`} onChange={setRate} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`${card} p-3`}>
          <p className="text-[12px] font-bold text-white/70">ترجع بالشهر</p>
          <motion.p key={back} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-1 text-[18px] font-black text-white">{back} طلبية</motion.p>
        </div>
        <div className={`${card} p-3`}>
          <p className="text-[12px] font-bold text-white/70">خسارة الشهر</p>
          <motion.p key={month} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-1 text-[18px] font-black text-red-200">{fmt(month)} د.ع</motion.p>
        </div>
      </div>
      <motion.p key={`${orders}-${rate}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${rate > d.target ? "text-white/85" : "text-emerald-200"}`}>
        {rate > d.target
          ? `إذا نزلت النسبة لـ ${d.target}%، توفر تقريبا ${fmt(month - atTarget)} دينار بالشهر بدون ما تبيع ولا قطعة زيادة.`
          : `على ${rate}% الراجع تحت السيطرة. حافظ على التأكيد والمتابعة وراجع النسبة كل أسبوع.`}
      </motion.p>
    </div>
  );
}

/* ---------- returnlog: tag each returned order with one word, then read the tally ---------- */
type LogEntry = { no: string; where: string; opened: boolean; says: string; courier: string; answer: string; why: string };
function ReturnLog({ d }: { d: { reasons: string[]; entries: LogEntry[]; belief: string; done: string } }) {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const finished = at >= d.entries.length;
  const e = d.entries[Math.min(at, d.entries.length - 1)];
  const tagged = d.entries.slice(0, at);
  const counts = d.reasons.map((r) => ({ r, n: tagged.filter((x) => x.answer === r).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const after = tagged.filter((x) => x.opened).length;
  const places = new Set(tagged.map((x) => x.where)).size;
  const choose = (r: string) => {
    if (r === e.answer) { setAt(at + 1); setMiss(null); } else setMiss(r);
  };
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/75 leading-relaxed">{d.belief}</p>
      {!finished && (
        <motion.div key={at} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-3.5 space-y-2`}>
          <div className="flex items-center justify-between text-[12px] font-black text-white/65">
            <span>طلبية {e.no}، {e.where}</span>
            <span>{at + 1} من {d.entries.length}</span>
          </div>
          <p className={`w-fit rounded-lg px-2 py-1 text-[12px] font-black ${e.opened ? "bg-white/10 text-white" : "bg-white/[0.04] text-white/70"}`}>{e.opened ? "رفض بعد ما فتح الكارتونة" : "رفض قبل لا يفتح"}</p>
          <p className="text-[14px] text-white/85 leading-relaxed"><span className="font-black text-white/60">الزبون: </span>{e.says}</p>
          <p className="text-[14px] text-white/85 leading-relaxed"><span className="font-black text-white/60">المندوب: </span>{e.courier}</p>
        </motion.div>
      )}
      {!finished && (
        <div className="space-y-2">
          <p className="text-[14px] font-bold text-white/65">اكتب السبب بكلمة وحدة:</p>
          <div className="flex flex-wrap gap-2">
            {d.reasons.map((r) => (
              <button key={r} type="button" onClick={() => choose(r)} className={chip(miss === r)}>{r}</button>
            ))}
          </div>
          {miss && (
            <motion.p key={at + miss} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              مو {miss}. {e.why}
            </motion.p>
          )}
        </div>
      )}
      {tagged.length > 0 && (
        <div className={`${card} p-3.5 space-y-2`}>
          <p className="text-[13px] font-black text-white/60">السجل لحد هسه</p>
          {counts.map(({ r, n }, i) => (
            <div key={r} className="flex items-center gap-2">
              <span className="w-16 text-[13px] font-bold text-white/80 shrink-0">{r}</span>
              <span className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.span className={`block h-full rounded-full ${i === 0 ? "bg-red-300/80" : "bg-sky-300/70"}`} initial={false} animate={{ width: `${(n / d.entries.length) * 100}%` }} transition={ease} />
              </span>
              <span className="w-5 text-left text-[13px] font-black text-white shrink-0">{n}</span>
            </div>
          ))}
          <p className="pt-1 text-[12px] text-white/70">{after} من {tagged.length} رفضوا بعد الفتح، والطلبيات من {places} محافظات مختلفة</p>
        </div>
      )}
      {finished && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
      )}
    </div>
  );
}

/* ---------- preship: seven orders waiting, ship or hold each one before paying the delivery fee ---------- */
type ShipOpt = { text: string; good?: boolean; say: string };
type ShipOrder = { name: string; facts: string[]; risky: boolean; options: ShipOpt[] };
function PreShip({ d }: { d: { cost: number; orders: ShipOrder[]; done: string } }) {
  const [got, setGot] = useState<Record<number, number>>({});
  const n = Object.keys(got).length;
  const right = d.orders.filter((o, i) => got[i] !== undefined && o.options[got[i]].good).length;
  const saved = d.orders.filter((o, i) => o.risky && got[i] !== undefined && o.options[got[i]].good).length;
  return (
    <div className="space-y-3">
      {d.orders.map((o, i) => {
        const g = got[i];
        const chosen = g !== undefined ? o.options[g] : null;
        return (
          <div key={o.name} className={`${card} p-3.5 space-y-2.5`}>
            <p className="text-[15px] font-black text-white">{o.name}</p>
            <ul className="space-y-1">
              {o.facts.map((f) => (
                <li key={f} className="text-[13px] text-white/75 leading-relaxed">{f}</li>
              ))}
            </ul>
            {chosen === null ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {o.options.map((x, j) => (
                  <button key={x.text} type="button" onClick={() => setGot((s) => ({ ...s, [i]: j }))} className={pick(false)}>{x.text}</button>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-1.5">
                <p className={`flex items-start gap-2 text-[14px] font-bold leading-relaxed ${chosen.good ? "text-emerald-200" : "text-red-200"}`}>
                  {chosen.good ? <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                  <span><span className="text-white">{chosen.text}: </span>{chosen.say}</span>
                </p>
                <button type="button" onClick={() => setGot((s) => { const c = { ...s }; delete c[i]; return c; })} className="text-[13px] font-bold text-white/70 min-h-[32px]">غير قرارك</button>
              </motion.div>
            )}
          </div>
        );
      })}
      {n === d.orders.length && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-4 space-y-1`}>
          <p className="text-[16px] font-black text-white">قرار صح بـ {right} من {d.orders.length} طلبيات</p>
          <p className="text-[15px] text-white/80 leading-relaxed">وقفت {saved} طلبيات كانت راح ترجع، يعني وفرت تقريبا {fmt(saved * d.cost)} دينار قبل لا تدفع كروة. {d.done}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- doorcall: the courier says the customer won't take it, you have two minutes ---------- */
type DoorOpt = { text: string; kind: "save" | "later" | "polite" | "discount" | "lost"; result: string; say: string };
type DoorCase = { product: string; courier: string; customer: string; options: DoorOpt[] };
const doorLabel: Record<DoorOpt["kind"], string> = { save: "الطلبية انباعت", later: "تأجلت لموعد", polite: "رجعت والزبون مو زعلان", discount: "انباعت بخصم", lost: "رجعت والزبون زعلان" };
function DoorCall({ d }: { d: { cases: DoorCase[]; done: string } }) {
  const [got, setGot] = useState<Record<number, number>>({});
  const picked = d.cases.map((c, i) => (got[i] !== undefined ? c.options[got[i]] : null));
  const good = picked.filter((o) => o && (o.kind === "save" || o.kind === "later" || o.kind === "polite")).length;
  const discounts = picked.filter((o) => o?.kind === "discount").length;
  return (
    <div className="space-y-3">
      {d.cases.map((c, i) => {
        const o = picked[i];
        return (
          <div key={c.customer} className={`${card} p-3.5 space-y-2.5`}>
            <p className="text-[12px] font-bold text-white/65">{c.product}</p>
            <p className="text-[14px] text-white/80 leading-relaxed"><span className="font-black text-white/60">المندوب: </span>{c.courier}</p>
            <Bubble from="customer">{c.customer}</Bubble>
            {o === null ? (
              <div className="space-y-2">
                {c.options.map((x, j) => (
                  <button key={x.text} type="button" onClick={() => setGot((s) => ({ ...s, [i]: j }))} className={pick(false)}>{x.text}</button>
                ))}
              </div>
            ) : (
              <>
                <Bubble from="seller">{o.text}</Bubble>
                <Bubble from="customer" delay={0.5}>{o.result}</Bubble>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.9 }} className="space-y-1">
                  <p className={`w-fit rounded-lg px-2 py-1 text-[12px] font-black ${o.kind === "lost" || o.kind === "discount" ? "bg-red-300/15 text-red-200" : "bg-emerald-300/15 text-emerald-200"}`}>{doorLabel[o.kind]}</p>
                  <p className="text-[14px] text-white/80 leading-relaxed">{o.say}</p>
                </motion.div>
                <button type="button" onClick={() => setGot((s) => { const n = { ...s }; delete n[i]; return n; })} className="text-[13px] font-bold text-white/70 min-h-[32px]">جرب رد ثاني</button>
              </>
            )}
          </div>
        );
      })}
      {Object.keys(got).length === d.cases.length && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${good === d.cases.length ? "text-emerald-200" : "text-white/85"}`}>
          تصرفت صح بـ {good} من {d.cases.length}.{discounts ? ` وعطيت خصم ${discounts === 1 ? "مرة" : `${discounts} مرات`} عند الباب، والزبائن يتعلمون إن الرفض يجيب خصم.` : ""} {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- commentreply: a complaint under the ad, everyone reading watches how you answer ---------- */
type CROpt = { text: string; good?: boolean; say: string; trust: number; crowd?: string };
type CRStep = { title: string; where: "public" | "private"; options: CROpt[]; reply: string };
function CommentReply({ d }: { d: { page: string; complaint: string; steps: CRStep[]; final: string; done: string } }) {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState<number | null>(null);
  const [trust, setTrust] = useState(40);
  const finished = at >= d.steps.length;
  const choose = (i: number) => {
    const o = d.steps[at].options[i];
    setTrust((t) => Math.max(0, Math.min(100, t + o.trust)));
    if (o.good) { setAt(at + 1); setMiss(null); } else setMiss(i);
  };
  const shown = finished ? Math.min(100, trust + 20) : trust;
  const pub = d.steps.filter((s, k) => k < at && s.where === "public");
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5`}>
        <div className="flex justify-between text-[13px] font-bold text-white/70 mb-2">
          <span>ثقة الناس اللي تقرا التعليقات</span>
          <span className="text-white">{shown}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div className={`h-full rounded-full ${shown >= 60 ? "bg-emerald-300" : shown >= 35 ? "bg-sky-300/80" : "bg-red-300/80"}`} initial={false} animate={{ width: `${shown}%` }} transition={ease} />
        </div>
      </div>
      <div className={`${card} p-3.5 space-y-2.5`}>
        <p className="text-[12px] font-bold text-white/65">التعليقات تحت إعلان {d.page}</p>
        <Bubble from="customer">{d.complaint}</Bubble>
        {pub.map((s) => (
          <React.Fragment key={s.title}>
            <Bubble from="seller">{s.options.find((o) => o.good)!.text}</Bubble>
          </React.Fragment>
        ))}
        {!finished && miss !== null && d.steps[at].where === "public" && (
          <>
            <Bubble from="seller">{d.steps[at].options[miss].text}</Bubble>
            {d.steps[at].options[miss].crowd && <Bubble from="customer" delay={0.5}>{d.steps[at].options[miss].crowd}</Bubble>}
          </>
        )}
        {finished && <Bubble from="customer">{d.final}</Bubble>}
      </div>
      {d.steps.slice(0, at).some((s) => s.where === "private") || (!finished && d.steps[at].where === "private") ? (
        <div className={`${card} p-3.5 space-y-2.5`}>
          <p className="text-[12px] font-bold text-white/65">بالخاص</p>
          {d.steps.slice(0, at).filter((s) => s.where === "private").map((s) => (
            <React.Fragment key={s.title}>
              <Bubble from="seller">{s.options.find((o) => o.good)!.text}</Bubble>
              <Bubble from="customer">{s.reply}</Bubble>
            </React.Fragment>
          ))}
          {!finished && miss !== null && d.steps[at].where === "private" && <Bubble from="seller">{d.steps[at].options[miss].text}</Bubble>}
        </div>
      ) : null}
      {!finished ? (
        <div className="space-y-2">
          <p className="text-[14px] font-bold text-white/65">{d.steps[at].title}</p>
          {d.steps[at].options.map((o, i) => (
            <button key={o.text} type="button" onClick={() => choose(i)} className={pick(miss === i)}>{o.text}</button>
          ))}
          {miss !== null && (
            <motion.p key={at + "-" + miss} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              {d.steps[at].options[miss].say}
            </motion.p>
          )}
        </div>
      ) : (
        <>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
          <button type="button" onClick={() => { setAt(0); setMiss(null); setTrust(40); }} className={ghostBtn}>من البداية</button>
        </>
      )}
    </div>
  );
}

export const KIT9 = {
  returncost: { render: (d: CostData) => <ReturnCost d={d} /> },
  returnlog: { render: (d) => <ReturnLog d={d} /> },
  preship: { render: (d) => <PreShip d={d} /> },
  doorcall: { render: (d) => <DoorCall d={d} /> },
  commentreply: { render: (d) => <CommentReply d={d} /> },
};
