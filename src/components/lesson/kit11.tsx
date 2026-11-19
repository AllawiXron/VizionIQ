import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 11 visuals: the doubling trap, budget checkpoints, the team board, repeat customers and the cash you need.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pick = (on: boolean) =>
  `w-full min-h-[48px] rounded-xl border px-3.5 py-2.5 text-right text-[14px] leading-relaxed transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white font-bold" : "bg-white/[0.04] border-white/12 text-white/85"}`;
const tab = (on: boolean) =>
  `flex-1 min-h-[44px] rounded-xl px-2 text-[13px] font-black border transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

function Stat({ k, v, tone = "text-white" }: { k: string; v: string; tone?: string }) {
  return (
    <div className={`${card} p-3`}>
      <p className="text-[11px] sm:text-[12px] font-bold text-white/70 leading-snug">{k}</p>
      <motion.p key={v} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 text-[15px] sm:text-[18px] font-black ${tone}`}>{v}</motion.p>
    </div>
  );
}

/* ---------- doubletrap: more orders a day, but each order earns less ---------- */
type TrapData = { price: number; unit: number; comm: number; from: { orders: number; ad: number; ship: number; back: number }; to: { orders: number; ad: number; ship: number; back: number }; say: string };
function trapAt(d: TrapData, n: number) {
  const t = (n - d.from.orders) / (d.to.orders - d.from.orders);
  const ad = lerp(d.from.ad, d.to.ad, t);
  const ship = lerp(d.from.ship, d.to.ship, t);
  const back = lerp(d.from.back, d.to.back, t);
  const per = d.price - d.unit - d.comm - ship - ad;
  return { ad, ship, back, per, day: per * n };
}
function DoubleTrap({ d }: { d: TrapData }) {
  const [n, setN] = useState(d.from.orders);
  const r = trapAt(d, n);
  const steps = Array.from({ length: (d.to.orders - d.from.orders) / 5 + 1 }, (_, i) => d.from.orders + i * 5);
  const maxDay = Math.max(...steps.map((s) => trapAt(d, s).day));
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5`}>
        <Slider label="طلبات واصلة باليوم" value={n} min={d.from.orders} max={d.to.orders} step={1} show={String(n)} onChange={setN} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat k="الإعلان للطلب الواصل" v={fmt(r.ad)} />
        <Stat k="نسبة الراجع" v={`${Math.round(r.back)}%`} />
        <Stat k="التوصيل والتغليف" v={fmt(r.ship)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat k="ربح الطلب الواصل" v={fmt(r.per)} tone={r.per > 4000 ? "text-emerald-200" : "text-red-200"} />
        <Stat k="ربح اليوم" v={fmt(r.day)} tone={r.day >= maxDay * 0.9 ? "text-emerald-200" : "text-red-200"} />
      </div>
      <div className={`${card} p-3.5 space-y-1.5`}>
        <p className="text-[12px] font-bold text-white/70 mb-1">ربح اليوم حسب عدد الطلبات</p>
        {steps.map((s) => {
          const x = trapAt(d, s);
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-14 text-[12px] font-bold shrink-0 ${s === n ? "text-white" : "text-white/70"}`}>{s} طلب</span>
              <span className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.span className={`block h-full rounded-full ${x.day >= maxDay * 0.9 ? "bg-emerald-300/80" : "bg-sky-300/60"}`} initial={false} animate={{ width: `${Math.max(2, (x.day / maxDay) * 100)}%` }} transition={ease} />
              </span>
              <span dir="ltr" className="w-16 text-left text-[12px] font-black text-white shrink-0">{fmt(x.day)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[15px] text-white/80 leading-relaxed">{d.say}</p>
    </div>
  );
}

/* ---------- budgetdays: checkpoints in an ad's life, pick the move at each one ---------- */
type Check10 = { day: string; budget: string; facts: string[]; options: { text: string; good?: boolean; say: string }[] };
function BudgetDays({ d }: { d: { target: number; limit: number; checks: Check10[]; done: string } }) {
  const [got, setGot] = useState<Record<number, number>>({});
  const right = d.checks.filter((c, i) => got[i] !== undefined && c.options[got[i]].good).length;
  const upto = d.checks.findIndex((c, i) => got[i] === undefined || !c.options[got[i]].good);
  const showTo = upto === -1 ? d.checks.length : upto + 1;
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-white/75 leading-relaxed">الهدف {fmt(d.target)} وحد الخسارة {fmt(d.limit)}. بكل محطة اختار الخطوة الصحيحة حتى تنتقل للي بعدها.</p>
      {d.checks.slice(0, showTo).map((c, i) => {
        const g = got[i];
        const o = g !== undefined ? c.options[g] : null;
        return (
          <motion.div key={c.day} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-3.5 space-y-2.5`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-black text-white">{c.day}</p>
              <p className="text-[12px] font-bold text-white/60">{c.budget}</p>
            </div>
            <ul className="space-y-1">
              {c.facts.map((f) => (
                <li key={f} className="text-[13px] text-white/75 leading-relaxed">{f}</li>
              ))}
            </ul>
            <div className="grid gap-2 sm:grid-cols-2">
              {c.options.map((x, j) => (
                <button key={x.text} type="button" onClick={() => setGot((s) => ({ ...s, [i]: j }))} className={pick(g === j)}>{x.text}</button>
              ))}
            </div>
            {o && (
              <motion.p key={g} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`flex items-start gap-2 text-[14px] font-bold leading-relaxed ${o.good ? "text-emerald-200" : "text-red-200"}`}>
                {o.good ? <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                {o.say}
              </motion.p>
            )}
          </motion.div>
        );
      })}
      {upto === -1 && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">
          {right} من {d.checks.length} محطات صح. {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- teamboard: five stages, hand them to a helper and watch your hours ---------- */
type Stage = { name: string; hours: number; when: string; keep?: boolean; keepSay?: string };
function TeamBoard({ d }: { d: { orders: number; stages: Stage[]; pay: { text: string; good?: boolean; say: string }[]; done: string } }) {
  const [helper, setHelper] = useState<Record<number, boolean>>({});
  const [pay, setPay] = useState<number | null>(null);
  const mine = d.stages.reduce((t, s, i) => t + (helper[i] ? 0 : s.hours), 0);
  const theirs = d.stages.reduce((t, s, i) => t + (helper[i] ? s.hours : 0), 0);
  const wrongKeep = d.stages.map((s, i) => ({ s, i })).filter((x) => x.s.keep && helper[x.i]);
  const good = !wrongKeep.length && theirs > 0 && mine <= 6 && pay !== null && d.pay[pay].good;
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-white/75 leading-relaxed">{d.orders} طلب باليوم. اضغط على أي مرحلة حتى تسلمها للمساعد، وشوف ساعاتك.</p>
      <div className="space-y-2">
        {d.stages.map((s, i) => (
          <button key={s.name} type="button" onClick={() => setHelper((h) => ({ ...h, [i]: !h[i] }))} className={`w-full text-right rounded-xl border px-3.5 py-2.5 transition-colors duration-200 ${helper[i] ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/85"}`}>
            <span className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-black">{s.name}</span>
              <span className={`text-[12px] font-bold ${helper[i] ? "text-[#040e33]/70" : "text-white/70"}`}>{helper[i] ? "المساعد" : "إنت"}، تقريبا {s.hours} ساعة</span>
            </span>
            <span className={`block text-[12px] ${helper[i] ? "text-[#040e33]/60" : "text-white/60"}`}>{s.when}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat k="ساعاتك باليوم" v={`تقريبا ${mine}`} tone={mine <= 6 ? "text-emerald-200" : "text-red-200"} />
        <Stat k="ساعات المساعد" v={`تقريبا ${theirs}`} />
      </div>
      {wrongKeep.map(({ s }) => (
        <p key={s.name} className="flex items-start gap-2 text-[14px] font-bold text-red-200 leading-relaxed">
          <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          {s.name}: {s.keepSay}
        </p>
      ))}
      <div className="space-y-2">
        <p className="text-[14px] font-bold text-white/65">أجر المساعد:</p>
        {d.pay.map((p, i) => (
          <button key={p.text} type="button" onClick={() => setPay(i)} className={pick(pay === i)}>{p.text}</button>
        ))}
        {pay !== null && (
          <motion.p key={pay} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[14px] font-bold leading-relaxed ${d.pay[pay].good ? "text-emerald-200" : "text-red-200"}`}>{d.pay[pay].say}</motion.p>
        )}
      </div>
      {good && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
      )}
    </div>
  );
}

/* ---------- repeatcalc: one message to the customer list against new orders from ads ---------- */
type RepeatData = { list: number; orders: number; repeatProfit: number; adProfit: number; cadence: { text: string; good?: boolean; say: string }[] };
function RepeatCalc({ d }: { d: RepeatData }) {
  const [list, setList] = useState(d.list);
  const [orders, setOrders] = useState(d.orders);
  const [cad, setCad] = useState<number | null>(null);
  const n = Math.min(orders, list);
  const profit = n * d.repeatProfit;
  const equal = Math.round(profit / d.adProfit);
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5 space-y-4`}>
        <Slider label="زبائن استلموا وحافظين رقمك" value={list} min={100} max={1500} step={50} show={fmt(list)} onChange={setList} />
        <Slider label="طلبوا من رسالة وحدة" value={orders} min={0} max={60} step={1} show={`${n}، يعني ${list ? ((n / list) * 100).toFixed(1) : 0}%`} onChange={setOrders} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat k="ربح الطلب من زبون قديم" v={fmt(d.repeatProfit)} tone="text-emerald-200" />
        <Stat k="ربح الرسالة" v={fmt(profit)} tone="text-emerald-200" />
        <Stat k="يعادل طلبات جديدة من الإعلان" v={`تقريبا ${equal}`} />
      </div>
      <div className="space-y-2">
        <p className="text-[14px] font-bold text-white/65">كل شكد تدز عرض للقائمة؟</p>
        <div className="flex gap-2">
          {d.cadence.map((c, i) => (
            <button key={c.text} type="button" onClick={() => setCad(i)} className={tab(cad === i)}>{c.text}</button>
          ))}
        </div>
        {cad !== null && (
          <motion.p key={cad} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[14px] font-bold leading-relaxed ${d.cadence[cad].good ? "text-emerald-200" : "text-red-200"}`}>{d.cadence[cad].say}</motion.p>
        )}
      </div>
    </div>
  );
}

/* ---------- cashneed: cash tied up by the stock and the ads before the statements pay back ---------- */
type CashData = { unit: number; weeks: number; adDays: number; price: number; ship: number; comm: number; ad: { at: number; v: number }[]; have: number; say: string };
function CashNeed({ d }: { d: CashData }) {
  const [n, setN] = useState(10);
  const [have, setHave] = useState(d.have);
  const [a, b] = d.ad;
  const ad = lerp(a.v, b.v, (n - a.at) / (b.at - a.at));
  const stock = n * 7 * d.weeks * d.unit;
  const adCash = d.adDays * n * ad;
  const need = stock + adCash;
  const daily = (d.price - d.unit - d.ship - d.comm - ad) * n;
  const short = need > have;
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5 space-y-4`}>
        <Slider label="طلبات واصلة باليوم" value={n} min={5} max={30} step={1} show={String(n)} onChange={setN} />
        <Slider label="الكاش اللي عندك للشغل" value={have} min={1000000} max={10000000} step={250000} show={fmt(have)} onChange={setHave} />
      </div>
      <div className={`${card} p-3.5 space-y-1.5`}>
        <p className="flex justify-between gap-3 text-[14px] text-white/80"><span>بضاعة تكفي {d.weeks} أسابيع ({n * 7 * d.weeks} قطعة)</span><span dir="ltr" className="font-black text-white shrink-0">{fmt(stock)}</span></p>
        <p className="flex justify-between gap-3 text-[14px] text-white/80"><span>إعلان {d.adDays} أيام قبل لا ترجع فلوسه ({fmt(ad)} للطلب)</span><span dir="ltr" className="font-black text-white shrink-0">{fmt(adCash)}</span></p>
        <p className="flex justify-between gap-3 border-t border-white/10 pt-2 text-[15px] font-black text-white"><span>الكاش المحجوز بالشغل</span><span dir="ltr" className="shrink-0">{fmt(need)}</span></p>
        <p className="flex justify-between gap-3 text-[14px] text-emerald-200 font-bold"><span>الربح باليوم</span><span dir="ltr" className="shrink-0">{fmt(daily)}</span></p>
      </div>
      <motion.p key={String(short)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${short ? "text-red-200" : "text-emerald-200"}`}>
        {short ? `ناقصك ${fmt(need - have)}. تتوسع وتوقف بنص الطريق: تخلص البضاعة أو يوقف الإعلان.` : `الكاش يكفي، ويبقى ${fmt(have - need)} احتياط.`} {d.say}
      </motion.p>
    </div>
  );
}

export const KIT11 = {
  doubletrap: { render: (d: TrapData) => <DoubleTrap d={d} /> },
  budgetdays: { render: (d) => <BudgetDays d={d} /> },
  teamboard: { render: (d) => <TeamBoard d={d} /> },
  repeatcalc: { render: (d: RepeatData) => <RepeatCalc d={d} /> },
  cashneed: { render: (d: CashData) => <CashNeed d={d} /> },
};
