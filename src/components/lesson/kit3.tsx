import React, { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 3 visuals: calculators that run on the lesson's own numbers and react as you move them.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const money = (n: number) => (n < 0 ? "خسارة" + fmt(-n) : fmt(n));

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-[14px] font-bold text-white/75">{label}</span>
        <span dir="ltr" className="text-[16px] font-black text-white">{show}</span>
      </span>
      <input dir="ltr" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-emerald-300 h-10" />
    </label>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "good" | "bad" }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${strong ? "pt-2 mt-1 border-t border-white/10" : ""}`}>
      <span className={`text-[14px] ${strong ? "font-black text-white" : "text-white/70"}`}>{label}</span>
      <span dir="ltr" className={`text-[15px] font-black ${tone === "good" ? "text-emerald-200" : tone === "bad" ? "text-red-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

/* ---------- landed: what one piece really costs once it is ready to ship ---------- */
function Landed({ d }: { d: { units: number; usd: number; official: number; rate: number; shipUsd: number; customs: number; transport: number; broken: number; pack: number; note: string } }) {
  const [rate, setRate] = useState(d.rate);
  const [customs, setCustoms] = useState(d.customs);
  const [broken, setBroken] = useState(d.broken);
  const goods = d.units * d.usd * rate;
  const ship = d.units * d.shipUsd * rate;
  const duty = (goods * customs) / 100;
  const total = goods + ship + duty + d.transport;
  const sound = d.units - broken;
  const real = Math.round((total / sound + d.pack) / 50) * 50;
  const quick = d.usd * d.official;
  const max = Math.max(real, quick);
  return (
    <div className="space-y-4">
      <div className={`${card} p-4 space-y-2`}>
        <Slider label="سعر الدولار اللي اشتريت بيه من الصراف" value={rate} min={d.official} max={1600} step={10} onChange={setRate} show={fmt(rate)} />
        <Slider label="الكمرك من قيمة البضاعة" value={customs} min={0} max={30} step={5} onChange={setCustoms} show={customs + "%"} />
        <Slider label={`قطع وصلت عاطلة من ${d.units}`} value={broken} min={0} max={20} step={1} onChange={setBroken} show={String(broken)} />
      </div>
      <div className={`${card} p-4 space-y-1.5`}>
        <Row label={`البضاعة: ${d.units} × ${d.usd} دولار`} value={fmt(goods)} />
        <Row label="كلفة الشحن للعراق" value={fmt(ship)} />
        <Row label="الكمرك والتخليص" value={fmt(duty)} />
        <Row label="النقل من مخزن الوكيل" value={fmt(d.transport)} />
        <Row label="مجموع كلفة الشحنة" value={fmt(total)} strong />
        <Row label={`تقسمها على ${sound} قطعة سليمة، وتضيف التغليف`} value={fmt(real)} strong tone="good" />
      </div>
      <div className="space-y-3">
        {[
          { label: `الحساب السريع: ${d.usd} دولار على السعر الرسمي`, v: quick, tone: "bg-red-400/80" },
          { label: "الكلفة الحقيقية بعد الوصول", v: real, tone: "bg-emerald-300" },
        ].map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-[14px] mb-1">
              <span className="text-white/75 font-bold">{b.label}</span>
              <span className="text-white font-black">{fmt(b.v)}</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div animate={{ width: `${(b.v / max) * 100}%` }} transition={ease} className={`h-full rounded-full ${b.tone}`} />
            </div>
          </div>
        ))}
      </div>
      <motion.p key={Math.round((real - quick) / 500)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={ease} className="rounded-2xl bg-amber-300/[0.08] border border-amber-200/25 p-4 text-[15px] font-bold text-amber-50 leading-relaxed">
        الفرق {fmt(real - quick)} بالقطعة، يعني {fmt((real - quick) * sound)} على الشحنة كلها تطلع من جيبك إذا سعرت على الحساب السريع.
      </motion.p>
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- orderprofit: divide by delivered orders, not by confirmed ones ---------- */
function OrderProfit({ d }: { d: { price: number; cost: number; delivery: number; fee: number; orders: number; spend: number; returnRate: number; returnLoss: number; note: string } }) {
  const [spend, setSpend] = useState(d.spend);
  const [ret, setRet] = useState(d.returnRate);
  const delivered = Math.max(1, Math.round(d.orders * (1 - ret / 100)));
  const returned = d.orders - delivered;
  const fee = (d.price * d.fee) / 100;
  const adReal = spend / delivered;
  const retReal = (returned * d.returnLoss) / delivered;
  const net = d.price - d.cost - d.delivery - fee - adReal - retReal;
  const adWrong = spend / d.orders;
  const netWrong = d.price - d.cost - d.delivery - fee - adWrong;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4 space-y-2`}>
        <Slider label="مبلغ الإعلان بالأسبوع" value={spend} min={100000} max={400000} step={10000} onChange={setSpend} show={fmt(spend)} />
        <Slider label="نسبة الطلبيات الراجعة" value={ret} min={5} max={40} step={5} onChange={setRet} show={ret + "%"} />
        <p className="text-[13px] text-white/55">
          {d.orders} طلب مؤكد: {delivered} وصل و{returned} رجع
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-red-500/[0.06] border border-red-400/25 p-3.5">
          <p className="text-[12px] font-bold text-white/55 leading-snug">إذا حسبت الربح على الطلبيات المؤكدة ونسيت الطلبات الراجعة</p>
          <p className="text-[13px] text-white/70 mt-1.5">إعلان {fmt(adWrong)} للطلب</p>
          <p className="text-[20px] font-black text-red-200 mt-0.5">{money(netWrong)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-400/[0.07] border border-emerald-300/25 p-3.5">
          <p className="text-[12px] font-bold text-white/55 leading-snug">الحسبة الصحيحة على الطلبيات المستلمة</p>
          <p className="text-[13px] text-white/70 mt-1.5">إعلان {fmt(adReal)}، وراجع {fmt(retReal)}</p>
          <motion.p key={Math.round(net / 100)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[20px] font-black mt-0.5 ${net >= 0 ? "text-emerald-200" : "text-red-300"}`}>
            {money(net)}
          </motion.p>
        </div>
      </div>
      <div className={`${card} p-4 space-y-1.5`}>
        <Row label="سعر البيع" value={fmt(d.price)} />
        <Row label="كلفة القطعة بعد الوصول" value={"− " + fmt(d.cost)} />
        <Row label="التوصيل" value={"− " + fmt(d.delivery)} />
        <Row label={`عمولة الاستلام ${d.fee}%`} value={"− " + fmt(fee)} />
        <Row label="كلفة الإعلان لكل طلب مستلم" value={"− " + fmt(adReal)} />
        <Row label="خسارة الطلبات الراجعة موزعة على كل طلب مستلم" value={"− " + fmt(retReal)} />
        <Row label="الصافي اللي يبقالك من كل طلب مستلم" value={money(net)} strong tone={net >= 0 ? "good" : "bad"} />
      </div>
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- rulecheck: 50/30/20 against the full math, on three products ---------- */
type RuleCase = { tab: string; price: number; cost: number; ad: number; verdict: string };
function RuleCheck({ d }: { d: { cases: RuleCase[] } }) {
  const [i, setI] = useState(0);
  const c = d.cases[i];
  const profit = c.price - c.cost - c.ad;
  const pct = (n: number) => Math.max(0, Math.round((n / c.price) * 100));
  const rows = [
    { label: "حسب الحسبة", parts: [{ l: "الكلفة", v: c.price * 0.5, t: "bg-white/35" }, { l: "الإعلان", v: c.price * 0.3, t: "bg-vz-blue-light/80" }, { l: "الربح", v: c.price * 0.2, t: "bg-emerald-300" }] },
    { label: "الحسبة بالتفصيل", parts: [{ l: "الكلفة", v: c.cost, t: c.cost > c.price * 0.55 ? "bg-red-400/85" : "bg-white/35" }, { l: "الإعلان", v: c.ad, t: "bg-vz-blue-light/80" }, { l: "الربح", v: Math.max(0, profit), t: "bg-emerald-300" }] },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {d.cases.map((x, j) => (
          <button key={x.tab} type="button" onClick={() => setI(j)} className={`min-h-[42px] px-3.5 rounded-xl text-[14px] font-black border transition-colors duration-200 ${j === i ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`}>
            {x.tab}
          </button>
        ))}
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-4 space-y-4`}>
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-[14px] font-black text-white mb-1.5">{r.label}</p>
            <div dir="rtl" className="flex h-9 rounded-xl overflow-hidden bg-white/[0.05]">
              {r.parts.map((p) => (
                <motion.div key={p.l} animate={{ width: `${pct(p.v)}%` }} transition={ease} className={`${p.t} flex items-center justify-center text-[12px] font-black text-[#040e33] overflow-hidden whitespace-nowrap`}>
                  {pct(p.v) >= 12 ? `${p.l} ${pct(p.v)}%` : ""}
                </motion.div>
              ))}
            </div>
            <p className="mt-1 text-[12px] text-white/55">
              {r.parts.map((p) => `${p.l} ${fmt(p.v)}`).join("، ")}
            </p>
          </div>
        ))}
        <Row label="صافي ربح الطلب المستلم" value={money(profit)} strong tone={profit >= 0 ? "good" : "bad"} />
        <p className="text-[15px] text-white/85 leading-relaxed">{c.verdict}</p>
      </motion.div>
    </div>
  );
}

/* ---------- discount: what a discount takes from the profit, and what it asks of the ads ---------- */
function Discount({ d }: { d: { price: number; before: number; fee: number; ad: number; note: string } }) {
  const [off, setOff] = useState(5000);
  const [old, setOld] = useState(false);
  const sale = d.price - off;
  const fee = (sale * d.fee) / 100;
  const ad = old ? 0 : d.ad;
  const base = d.price - d.before - (d.price * d.fee) / 100 - d.ad;
  const profit = sale - d.before - fee - ad;
  const needAd = sale - d.before - fee - base;
  const times = needAd > 0 ? d.ad / needAd : Infinity;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4`}>
        <Slider label="الخصم" value={off} min={0} max={10000} step={1000} onChange={setOff} show={off ? fmt(off) : "بدون خصم"} />
        <p className="text-[13px] text-white/55">
          الزبون يدفع {fmt(sale)} بدل {fmt(d.price)}، يعني خصم <span dir="ltr">{Math.round((off / d.price) * 100)}%</span> من السعر
        </p>
      </div>
      <button type="button" onClick={() => setOld((o) => !o)} className={`w-full text-right flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors duration-200 ${old ? "bg-emerald-400/[0.08] border-emerald-300/40" : "bg-white/[0.04] border-white/10"}`}>
        <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${old ? "bg-emerald-400 border-emerald-300" : "border-white/30"}`}>{old && <Check className="w-4 h-4 text-[#03140c]" strokeWidth={3} />}</span>
        <span className="text-[15px] font-bold text-white">خصم للزبون القديم اللي يطلب بدون إعلان</span>
      </button>
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} p-3.5`}>
          <p className="text-[12px] font-bold text-white/55">بدون خصم</p>
          <p className="text-[20px] font-black text-white">{money(base)}</p>
        </div>
        <motion.div key={Math.round(profit / 100) + (old ? "o" : "n")} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={ease} className={`rounded-2xl border p-3.5 ${profit >= base ? "bg-emerald-400/[0.07] border-emerald-300/25" : profit >= 0 ? "bg-amber-300/[0.07] border-amber-200/25" : "bg-red-500/[0.07] border-red-400/30"}`}>
          <p className="text-[12px] font-bold text-white/55">ويا الخصم</p>
          <p className={`text-[20px] font-black ${profit >= base ? "text-emerald-200" : profit >= 0 ? "text-amber-100" : "text-red-200"}`}>{money(profit)}</p>
        </motion.div>
      </div>
      {!old && off > 0 && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] text-white/85 leading-relaxed">
          {needAd > 0
            ? `حتى يبقى ربحك ${fmt(base)}، لازم الإعلان يجيب الطلب الواصل بـ ${fmt(needAd)} بدل ${fmt(d.ad)}. يعني نفس الصرف لازم يجيب طلبات أكثر بـ ${Math.round((times - 1) * 100)}%.`
            : `هذا الخصم أكبر من كل اللي يبقى من الطلب قبل الإعلان. حتى لو الإعلان ببلاش، ما ترجع لربحك القديم.`}
        </motion.p>
      )}
      {old && off > 0 && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-emerald-100 leading-relaxed">
          الزبون القديم ما يكلفك إعلان، ولهذا حتى لو تعطيه خصم يبقالك ربح أكثر من الزبون الجديد اللي يشتري بالسعر الكامل.
        </motion.p>
      )}
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

export const KIT3: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  landed: { render: (d) => <Landed d={d} /> },
  orderprofit: { render: (d) => <OrderProfit d={d} /> },
  rulecheck: { render: (d) => <RuleCheck d={d} /> },
  discount: { render: (d) => <Discount d={d} /> },
};
