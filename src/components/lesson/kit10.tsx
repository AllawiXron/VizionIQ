import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 10 visuals: the two ways to count a day, the live sheet, cost per delivered order, ad decisions and where the money went.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const tab = (on: boolean) =>
  `flex-1 min-h-[44px] rounded-xl px-2 text-[13px] font-black border transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;
const pick = (on: boolean) =>
  `w-full min-h-[48px] rounded-xl border px-3.5 py-2.5 text-right text-[14px] leading-relaxed transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white font-bold" : "bg-white/[0.04] border-white/12 text-white/85"}`;

function Row({ label, v, tone }: { label: string; v: string; tone?: "minus" | "total" | "good" }) {
  return (
    <p className={`flex justify-between gap-3 text-[14px] ${tone === "total" || tone === "good" ? "border-t border-white/10 pt-2 font-black" : ""} ${tone === "good" ? "text-emerald-200" : tone === "total" ? "text-white" : "text-white/80"}`}>
      <span>{label}</span>
      <span dir="ltr" className={`shrink-0 ${tone === "minus" ? "font-black text-red-200" : "font-black"}`}>{v}</span>
    </p>
  );
}

/* ---------- daycount: the same day counted the quick way and the real way ---------- */
type Fixed = { price: number; unit: number; kerwa: number; back: number; pack: number; comm: number };
type DayData = { fixed: Fixed; spend: number; rates: { label: string; v: number }[]; counts: { label: string; delivered: number; returned: number; sent: number; say: string }[]; done: string };
function dayProfit(f: Fixed, spend: number, rate: number, c: { delivered: number; returned: number; sent: number }) {
  const got = c.delivered * f.price;
  const ad = spend * rate;
  const goods = c.delivered * f.unit;
  const ship = c.delivered * f.kerwa + c.returned * f.back;
  const comm = (got * f.comm) / 100;
  const pack = c.sent * f.pack;
  return { got, ad, goods, ship, comm, pack, net: got - ad - goods - ship - comm - pack };
}
function DayCount({ d }: { d: DayData }) {
  const [ci, setCi] = useState(0);
  const [ri, setRi] = useState(0);
  const c = d.counts[ci];
  const r = dayProfit(d.fixed, d.spend, d.rates[ri].v, c);
  const real = ci === d.counts.length - 1 && ri === d.rates.length - 1;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[13px] font-bold text-white/65">تحسب الطلبات على:</p>
        <div className="flex gap-2">
          {d.counts.map((x, i) => (
            <button key={x.label} type="button" onClick={() => setCi(i)} className={tab(ci === i)}>{x.label}</button>
          ))}
        </div>
        <p className="text-[13px] font-bold text-white/65 pt-1">وسعر الدولار:</p>
        <div className="flex gap-2">
          {d.rates.map((x, i) => (
            <button key={x.label} type="button" onClick={() => setRi(i)} className={tab(ri === i)}>{x.label}</button>
          ))}
        </div>
      </div>
      <motion.div key={`${ci}-${ri}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-3.5 space-y-1.5`}>
        <Row label={`المبلغ: ${c.delivered} طلب × ${fmt(d.fixed.price)}`} v={fmt(r.got)} />
        <Row label={`الإعلان: ${d.spend} دولار × ${fmt(d.rates[ri].v)}`} v={`- ${fmt(r.ad)}`} tone="minus" />
        <Row label="البضاعة" v={`- ${fmt(r.goods)}`} tone="minus" />
        <Row label={c.returned ? `التوصيل، ويا ${c.returned} راجع` : "التوصيل"} v={`- ${fmt(r.ship)}`} tone="minus" />
        <Row label="العمولة والتغليف" v={`- ${fmt(r.comm + r.pack)}`} tone="minus" />
        <Row label={real ? "الربح الحقيقي لليوم" : "الربح اللي تتصوره"} v={`${fmt(r.net)} د.ع`} tone={real ? "good" : "total"} />
      </motion.div>
      <motion.p key={`s${ci}-${ri}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${real ? "text-emerald-200" : "text-white/85"}`}>
        {real ? d.done : c.say}
      </motion.p>
    </div>
  );
}

/* ---------- livesheet: fixed cells on top feed one day's row ---------- */
type SheetData = { fixed: (keyof Fixed | "rate")[]; labels: Record<string, string>; start: Fixed & { rate: number }; day: { spend: number; msgs: number; reg: number; sent: number; delivered: number; returned: number }; try: string };
function LiveSheet({ d }: { d: SheetData }) {
  const [f, setF] = useState(d.start);
  const [day, setDay] = useState(d.day);
  const ad = day.spend * f.rate;
  const r = dayProfit(f, day.spend, f.rate, day);
  const open = day.delivered + day.returned < day.sent;
  const cols: [string, string][] = [
    ["4. الصرف بالدينار", fmt(ad)],
    ["6. كلفة الرسالة", day.msgs ? fmt(ad / day.msgs) : "0"],
    ["11. نسبة الراجع", day.sent ? `${Math.round((day.returned / day.sent) * 100)}%` : "0%"],
    ["12. المبلغ المستلم", fmt(r.got)],
    ["13. كلفة البضاعة", fmt(r.goods)],
    ["14. التوصيل", fmt(r.ship)],
    ["15. العمولة", fmt(r.comm)],
    ["16. التغليف", fmt(r.pack)],
    ["17. الربح الصافي", fmt(r.net)],
    ["18. الإعلان لكل طلب واصل", day.delivered ? fmt(ad / day.delivered) : "0"],
  ];
  const num = (v: number, set: (n: number) => void, label: string) => (
    <input
      type="number"
      inputMode="decimal"
      value={v}
      onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))}
      aria-label={label}
      className="w-full min-h-[40px] rounded-lg bg-white/[0.06] border border-white/12 px-2 text-[14px] font-bold text-white text-left"
      dir="ltr"
    />
  );
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5`}>
        <p className="text-[13px] font-black text-white/60 mb-2">الخلايا الثابتة (B1 لـ B7)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {d.fixed.map((k) => (
            <label key={k} className="block">
              <span className="block text-[11px] font-bold text-white/50 mb-1">{d.labels[k]}</span>
              {num(f[k], (n) => setF((o) => ({ ...o, [k]: n })), d.labels[k])}
            </label>
          ))}
        </div>
      </div>
      <div className={`${card} p-3.5 ${open ? "border-sky-300/40 bg-sky-300/[0.04]" : ""}`}>
        <p className="text-[13px] font-black text-white/60 mb-2">صف اليوم: تعبيه إنت</p>
        <div className="grid grid-cols-3 gap-2">
          {([["spend", "3. الصرف $"], ["msgs", "5. الرسائل"], ["reg", "7. المسجلة"], ["sent", "8. المرسلة"], ["delivered", "9. الواصلة"], ["returned", "10. الراجعة"]] as const).map(([k, l]) => (
            <label key={k} className="block">
              <span className="block text-[11px] font-bold text-white/50 mb-1">{l}</span>
              {num(day[k], (n) => setDay((o) => ({ ...o, [k]: n })), l)}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {cols.map(([k, v]) => (
            <p key={k} className={`flex justify-between gap-2 text-[12px] sm:text-[13px] ${k.startsWith("17") ? "font-black text-emerald-200" : "text-white/75"}`}>
              <span>{k}</span>
              <span dir="ltr" className="font-bold text-white shrink-0">{v}</span>
            </p>
          ))}
        </div>
        {open && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="mt-3 text-[14px] font-bold text-sky-200 leading-relaxed">
            {day.sent - day.delivered - day.returned} طلب بعده بالطريق. هالصف ناقص ولونه مختلف: لا تحسب ربحه قبل لا يكتمل الكشف.
          </motion.p>
        )}
      </div>
      <p className="text-[14px] text-white/70 leading-relaxed">{d.try}</p>
    </div>
  );
}

/* ---------- perorder: the return rate moves the cost per delivered order and the loss limit ---------- */
type PerData = { sent: number; spendUsd: number; rate: number; price: number; unit: number; kerwa: number; pack: number; comm: number; start: number; head: number; fixedCosts: number };
function PerOrder({ d }: { d: PerData }) {
  const [back, setBack] = useState(d.start);
  const delivered = Math.round(d.sent * (1 - back / 100));
  const ad = (d.spendUsd * d.rate) / delivered;
  const ship = (d.sent * d.kerwa) / delivered;
  const pack = (d.sent * d.pack) / delivered;
  const comm = (d.price * d.comm) / 100;
  const profit = d.price - d.unit - ad - ship - pack - comm;
  const limit = d.price - d.unit - ship - pack - comm;
  const month = profit * delivered - d.fixedCosts;
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5`}>
        <label className="block">
          <span className="flex justify-between text-[13px] font-bold text-white/70">
            <span>نسبة الراجع ({d.sent} طلب انرسل)</span>
            <span className="text-white">{back}%، يوصل {delivered}</span>
          </span>
          <input type="range" min={5} max={40} step={1} value={back} onChange={(e) => setBack(Number(e.target.value))} className="mt-2 w-full accent-white" aria-label="نسبة الراجع" />
        </label>
      </div>
      <div className={`${card} p-3.5 space-y-1.5`}>
        <Row label="سعر البيع" v={fmt(d.price)} />
        <Row label="كلفة القطعة" v={`- ${fmt(d.unit)}`} tone="minus" />
        <Row label="الإعلان للطلب الواصل" v={`- ${fmt(ad)}`} tone="minus" />
        <Row label="التوصيل للطلب الواصل" v={`- ${fmt(ship)}`} tone="minus" />
        <Row label="التغليف للطلب الواصل" v={`- ${fmt(pack)}`} tone="minus" />
        <Row label="العمولة" v={`- ${fmt(comm)}`} tone="minus" />
        <Row label="الربح الحقيقي من الطلب الواصل" v={`${fmt(profit)} د.ع`} tone={profit > 0 ? "good" : "total"} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["بالراس", fmt(d.head), "text-white/60 line-through"],
          ["حد الخسارة", fmt(limit), "text-white"],
          ["الشهر بعد المصاريف الثابتة", fmt(month), month > 0 ? "text-emerald-200" : "text-red-200"],
        ].map(([k, v, c]) => (
          <div key={k} className={`${card} p-3`}>
            <p className="text-[11px] sm:text-[12px] font-bold text-white/55 leading-snug">{k}</p>
            <motion.p key={v} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 text-[15px] sm:text-[18px] font-black ${c}`}>{v}</motion.p>
          </div>
        ))}
      </div>
      <p className="text-[15px] text-white/80 leading-relaxed">
        الإعلان يكلفك {fmt(ad)} من حد خسارة {fmt(limit)}، يعني {Math.round((ad / limit) * 100)}% منه. {ad < limit * 0.7 ? "تحت الهدف بـ 70%، وضع زين." : ad < limit ? "بين الهدف والحد: ربحك ضعيف." : "فوك الحد: كل طلب واصل يخسرك."}
      </p>
    </div>
  );
}

/* ---------- adcalls: expected cost per delivered order for each ad, then the call ---------- */
type Ad = { name: string; days: number; usd: number; sent: number; answer: number; why: string };
function AdCalls({ d }: { d: { rate: number; reach: number; target: number; limit: number; ads: Ad[]; actions: string[]; done: string } }) {
  const [got, setGot] = useState<Record<number, number>>({});
  const right = d.ads.filter((a, i) => got[i] === a.answer).length;
  return (
    <div className="space-y-3">
      <div className={`${card} p-3.5 text-[14px] text-white/80 leading-relaxed`}>
        الهدف {fmt(d.target)}، وحد الخسارة {fmt(d.limit)}. نسبة الوصول آخر أسبوعين {Math.round(d.reach * 100)}%، والدولار على البطاقة {fmt(d.rate)}.
      </div>
      {d.ads.map((a, i) => {
        const spend = a.usd * d.rate;
        const exp = a.sent ? spend / a.sent / d.reach : null;
        const g = got[i];
        return (
          <div key={a.name} className={`${card} p-3.5 space-y-2.5`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-black text-white">{a.name}</p>
              <p className="text-[12px] font-bold text-white/50">{a.days === 1 ? "أول يوم" : `${a.days} أيام`}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <p className="text-white/60">صرف<span className="block text-[14px] font-black text-white">{a.usd}$ = {fmt(spend)}</span></p>
              <p className="text-white/60">طلبات مرسلة<span className="block text-[14px] font-black text-white">{a.sent}</span></p>
              <p className="text-white/60">المتوقع للواصل<span className={`block text-[14px] font-black ${exp === null ? "text-red-200" : exp <= d.target ? "text-emerald-200" : exp <= d.limit ? "text-sky-200" : "text-red-200"}`}>{exp === null ? "ولا طلب" : fmt(exp)}</span></p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {d.actions.map((t, j) => (
                <button key={t} type="button" onClick={() => setGot((s) => ({ ...s, [i]: j }))} className={pick(g === j)}>{t}</button>
              ))}
            </div>
            {g !== undefined && (
              <motion.p key={g} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`flex items-start gap-2 text-[14px] font-bold leading-relaxed ${g === a.answer ? "text-emerald-200" : "text-red-200"}`}>
                {g === a.answer ? <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                {g === a.answer ? a.why : `مو هذا. ${a.why}`}
              </motion.p>
            )}
          </div>
        );
      })}
      {Object.keys(got).length === d.ads.length && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${right === d.ads.length ? "text-emerald-200" : "text-white/85"}`}>
          قرار صح بـ {right} من {d.ads.length}. {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- wheremoney: profit on the sheet against cash in hand, tap the reasons that close the gap ---------- */
type Reason = { text: string; v?: number; say: string };
function WhereMoney({ d }: { d: { sheet: number; hand: number; reasons: Reason[]; done: string } }) {
  const [on, setOn] = useState<Record<number, boolean>>({});
  const [last, setLast] = useState<number | null>(null);
  const gap = d.sheet - d.hand;
  const found = d.reasons.reduce((t, r, i) => t + (on[i] && r.v ? r.v : 0), 0);
  const closed = found === gap;
  const tones = ["bg-sky-300/80", "bg-violet-300/70", "bg-teal-300/70"];
  const real = d.reasons.map((r, i) => ({ r, i })).filter((x) => x.r.v);
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5 space-y-3`}>
        <div className="flex justify-between text-[14px]">
          <span className="text-white/70">الربح بالجدول بعد المصاريف الثابتة</span>
          <span className="font-black text-white">{fmt(d.sheet)}</span>
        </div>
        <div className="flex h-5 rounded-full overflow-hidden bg-white/[0.06]">
          <span className="h-full bg-emerald-300/80" style={{ width: `${(d.hand / d.sheet) * 100}%` }} />
          {real.map((x, k) => (
            <motion.span key={x.i} className={`h-full ${tones[k % tones.length]}`} initial={false} animate={{ width: on[x.i] ? `${((x.r.v as number) / d.sheet) * 100}%` : "0%" }} transition={ease} />
          ))}
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-white/70">الفلوس اللي بإيدك</span>
          <span className="font-black text-emerald-200">{fmt(d.hand)}</span>
        </div>
        <p className={`text-[14px] font-black ${closed ? "text-emerald-200" : "text-red-200"}`}>انعرف {fmt(found)} من فرق {fmt(gap)}</p>
      </div>
      <p className="text-[14px] font-bold text-white/65">وين راح الفرق؟ اضغط على الأسباب اللي تشوفها صح:</p>
      <div className="space-y-2">
        {d.reasons.map((r, i) => (
          <button key={r.text} type="button" onClick={() => { setOn((s) => ({ ...s, [i]: true })); setLast(i); }} className={pick(!!on[i])}>
            {r.text}
          </button>
        ))}
      </div>
      {last !== null && !closed && (
        <motion.p key={last} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`flex items-start gap-2 text-[15px] font-bold leading-relaxed ${d.reasons[last].v ? "text-emerald-200" : "text-red-200"}`}>
          {d.reasons[last].v ? <Check className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />}
          {d.reasons[last].say}
        </motion.p>
      )}
      {closed && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
      )}
    </div>
  );
}

export const KIT10 = {
  daycount: { render: (d: DayData) => <DayCount d={d} /> },
  livesheet: { render: (d: SheetData) => <LiveSheet d={d} /> },
  perorder: { render: (d: PerData) => <PerOrder d={d} /> },
  adcalls: { render: (d) => <AdCalls d={d} /> },
  wheremoney: { render: (d) => <WhereMoney d={d} /> },
};
