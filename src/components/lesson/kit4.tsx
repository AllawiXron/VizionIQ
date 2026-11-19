import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, MessageCircle, Users } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 4 visuals: ad setup screens you click through, the results table you judge, and your limits.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

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

/* ---------- cardrate: the dollar rate your card really charges ---------- */
function CardRate({ d }: { d: { usd: number; charged: number; official: number; daily: number; note: string } }) {
  const [charged, setCharged] = useState(d.charged);
  const rate = charged / d.usd;
  const day = d.daily * rate;
  const dayOfficial = d.daily * d.official;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4 space-y-1`}>
        <p className="text-[14px] text-white/70">المبلغ اللي صرفته بمدير الإعلانات هالشهر</p>
        <p dir="ltr" className="text-[24px] font-black text-white text-right">${d.usd}</p>
        <Slider label="انخصم المبلغ من بطاقتك" value={charged} min={d.usd * d.official} max={d.usd * 1650} step={5000} onChange={setCharged} show={fmt(charged)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} p-3.5`}>
          <p className="text-[12px] font-bold text-white/55">سعر الدولار عليك</p>
          <p className="text-[22px] font-black text-white">{fmt(rate)}</p>
          <p className="text-[12px] text-white/45">الرسمي {fmt(d.official)}</p>
        </div>
        <div className="rounded-2xl bg-amber-300/[0.07] border border-amber-200/25 p-3.5">
          <p className="text-[12px] font-bold text-white/55">إعلان بـ {d.daily} دولار باليوم</p>
          <motion.p key={Math.round(day / 100)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={ease} className="text-[22px] font-black text-amber-100">
            {fmt(day)}
          </motion.p>
          <p className="text-[12px] text-white/45">مو {fmt(dayOfficial)}</p>
        </div>
      </div>
      <p className="text-[15px] text-white/85 leading-relaxed">
        بالشهر يطلع {fmt(day * 30)} بدل {fmt(dayOfficial * 30)}، يعني {fmt((day - dayOfficial) * 30)} ما كانت بحسابك.
      </p>
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- objective: the first screen of a new campaign ---------- */
type Opt = { label: string; en: string; result: string; good?: boolean };
function Objective({ d }: { d: { options: Opt[]; places: { label: string; say: string }[]; done: string } }) {
  const [pick, setPick] = useState<number | null>(null);
  const [place, setPlace] = useState<number | null>(null);
  const o = pick === null ? null : d.options[pick];
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white text-[#1c1e21] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e4e6eb]">
          <p className="text-[15px] font-black">حملة إعلانية جديدة</p>
          <p className="text-[13px] text-[#65676b]">اختار هدف الحملة</p>
        </div>
        <ul>
          {d.options.map((x, j) => (
            <li key={x.en}>
              <button type="button" onClick={() => { setPick(j); setPlace(null); }} className={`w-full text-right flex items-center gap-3 px-4 py-3 border-b border-[#f0f2f5] transition-colors ${j === pick ? (x.good ? "bg-[#e7f3ff]" : "bg-[#fff1f0]") : "hover:bg-[#f7f8fa]"}`}>
                <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${j === pick ? "border-[#0866ff]" : "border-[#bcc0c4]"}`}>{j === pick && <span className="w-2.5 h-2.5 rounded-full bg-[#0866ff]" />}</span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold">{x.label}</span>
                  <span dir="ltr" className="block text-[12px] text-[#65676b] text-right">{x.en}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {o && (
        <motion.p key={pick} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${o.good ? "text-emerald-200" : "text-red-200"}`}>
          {o.result}
        </motion.p>
      )}
      {o?.good && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-3">
          <p className="text-[15px] font-black text-white">وين تريد تصير المحادثة؟</p>
          <div className="flex flex-wrap gap-2">
            {d.places.map((p, j) => (
              <button key={p.label} type="button" onClick={() => setPlace(j)} className={`min-h-[42px] px-3.5 rounded-xl text-[14px] font-black border flex items-center gap-1.5 ${j === place ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/85"}`}>
                <MessageCircle className="w-4 h-4" /> {p.label}
              </button>
            ))}
          </div>
          {place !== null && (
            <motion.p key={place} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="text-[15px] text-white/85 leading-relaxed">
              {d.places[place].say}
            </motion.p>
          )}
          {place !== null && <p className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[15px] font-bold text-emerald-100 leading-relaxed">{d.done}</p>}
        </motion.div>
      )}
    </div>
  );
}

/* ---------- audience: provinces, age and interests, with a rough size ---------- */
type Prov = { name: string; users: number; reach: "yes" | "later" | "no" };
function Audience({ d }: { d: { provinces: Prov[]; interests: string[]; note: string } }) {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(d.provinces.map((p) => [p.name, p.reach === "yes"])));
  const [minAge, setMin] = useState(25);
  const [maxAge, setMax] = useState(30);
  const [women, setWomen] = useState(true);
  const [ints, setInts] = useState<Record<string, boolean>>({ [d.interests[0]]: true, [d.interests[1]]: true });
  const base = d.provinces.filter((p) => on[p.name]).reduce((t, p) => t + p.users, 0);
  const ageShare = Math.max(0, Math.min(1, (maxAge - minAge + 1) / 40)) * 1.25;
  const nInt = Object.values(ints).filter(Boolean).length;
  const size = base * 1e6 * Math.min(1, ageShare) * (women ? 0.45 : 1) * Math.pow(0.4, nInt);
  const tooSmall = size < 400000;
  const far = d.provinces.filter((p) => on[p.name] && p.reach === "no");
  const label = size >= 1e6 ? `${(size / 1e6).toFixed(1)} مليون` : `${fmt(Math.round(size / 1000) * 1000)}`;
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white text-[#1c1e21] p-4 space-y-4">
        <div>
          <p className="text-[14px] font-black mb-2">المناطق</p>
          <div className="flex flex-wrap gap-1.5">
            {d.provinces.map((p) => (
              <button key={p.name} type="button" onClick={() => setOn((s) => ({ ...s, [p.name]: !s[p.name] }))} className={`px-3 py-1.5 rounded-full text-[13px] font-bold border ${on[p.name] ? "bg-[#0866ff] text-white border-[#0866ff]" : "bg-white text-[#1c1e21] border-[#ccd0d5]"}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[13px] font-bold text-[#65676b]">العمر من: {minAge}</span>
            <input dir="ltr" type="range" min={18} max={maxAge} value={minAge} onChange={(e) => setMin(Number(e.target.value))} className="w-full h-9" />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold text-[#65676b]">لحد: {maxAge}</span>
            <input dir="ltr" type="range" min={minAge} max={60} value={maxAge} onChange={(e) => setMax(Number(e.target.value))} className="w-full h-9" />
          </label>
        </div>
        <div className="flex gap-2">
          {[["نساء", true], ["الكل", false]].map(([l, v]) => (
            <button key={String(l)} type="button" onClick={() => setWomen(v as boolean)} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold border ${women === v ? "bg-[#e7f3ff] border-[#0866ff] text-[#0866ff]" : "border-[#ccd0d5]"}`}>
              {String(l)}
            </button>
          ))}
        </div>
        <div>
          <p className="text-[14px] font-black mb-2">الاهتمامات</p>
          <div className="flex flex-wrap gap-1.5">
            {d.interests.map((x) => (
              <button key={x} type="button" onClick={() => setInts((s) => ({ ...s, [x]: !s[x] }))} className={`px-3 py-1.5 rounded-full text-[13px] font-bold border flex items-center gap-1 ${ints[x] ? "bg-[#1c1e21] text-white border-[#1c1e21]" : "bg-white border-[#ccd0d5]"}`}>
                {ints[x] && <Check className="w-3.5 h-3.5" />} {x}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border p-4 ${tooSmall ? "bg-red-500/[0.07] border-red-400/30" : "bg-emerald-400/[0.07] border-emerald-300/25"}`}>
        <p className="text-[13px] font-bold text-white/55 flex items-center gap-1.5"><Users className="w-4 h-4" /> حجم الجمهور المتوقع</p>
        <motion.p key={label} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={ease} className={`text-[24px] font-black ${tooSmall ? "text-red-200" : "text-emerald-200"}`}>
          {label}
        </motion.p>
        <p className="text-[14px] text-white/80 leading-relaxed mt-1">
          {tooSmall ? "الجمهور صغير كلش. كلفة الألف ظهور ترتفع، والمنصة ما يبقى عدها مجال كافي حتى توصل للناس اللي يشترون. وسع الفئة العمرية وشيل الاهتمامات." : nInt > 0 ? "حجم الجمهور مناسب، بس الاهتمامات تضيق الاستهداف بدون داعي. جرب تشيلها وخلي الفيديو يوصل للناس المناسبة." : "جمهور واسع ويا تحديد واضح. هسه الفيديو هو اللي يساعد الإعلان يوصل للناس الصح."}
        </p>
        {far.length > 0 && <p className="text-[14px] font-bold text-amber-200 mt-2">{far.map((p) => p.name).join("، ")}: مندوبك ما يوصلها. لا تدفع على ناس ما تكدر توصلهم.</p>}
      </div>
      <p className="text-[13px] text-white/45 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- adtable: a results table; decide each row ---------- */
type AdRow = { name: string; cells: string[]; answer: string; why: string };
function AdTable({ d }: { d: { head: string; cols: string[]; rows: AdRow[]; actions: { id: string; label: string }[]; done: string } }) {
  const [picks, setPicks] = useState<Record<number, string>>({});
  const all = d.rows.every((r, i) => picks[i] === r.answer);
  return (
    <div className="space-y-3">
      <p className="text-[15px] text-white/75 leading-relaxed">{d.head}</p>
      <div className="rounded-[18px] bg-white text-[#1c1e21] overflow-x-auto">
        <table className="w-full min-w-[460px] text-[13px]">
          <thead>
            <tr className="bg-[#f5f6f7] text-[#65676b]">
              <th className="text-right font-bold px-3 py-2">الإعلان</th>
              {d.cols.map((c) => (
                <th key={c} className="text-right font-bold px-2 py-2 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.name} className="border-t border-[#ebedf0]">
                <td className="px-3 py-2.5 font-bold whitespace-nowrap">{r.name}</td>
                {r.cells.map((c, k) => (
                  <td key={k} dir="ltr" className="px-2 py-2.5 text-right whitespace-nowrap">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2.5">
        {d.rows.map((r, i) => {
          const p = picks[i];
          const ok = p === r.answer;
          return (
            <div key={r.name} className={`rounded-2xl border p-3 transition-colors ${p === undefined ? "bg-white/[0.04] border-white/10" : ok ? "bg-emerald-400/[0.08] border-emerald-300/40" : "bg-red-500/[0.06] border-red-400/30"}`}>
              <p className="text-[15px] font-black text-white mb-2">{r.name}</p>
              <div className="flex flex-wrap gap-2">
                {d.actions.map((a) => (
                  <button key={a.id} type="button" disabled={ok} onClick={() => setPicks((s) => ({ ...s, [i]: a.id }))} className={`min-h-[40px] px-3.5 rounded-xl text-[14px] font-black border ${p === a.id ? (ok ? "bg-emerald-400/20 border-emerald-300/60 text-white" : "bg-red-500/15 border-red-400/50 text-white") : "bg-white/[0.04] border-white/12 text-white/80"}`}>
                    {a.label}
                  </button>
                ))}
              </div>
              {p !== undefined && <p className={`mt-2 text-[14px] font-bold leading-relaxed ${ok ? "text-emerald-200" : "text-red-200"}`}>{ok ? r.why : "مو هذا الاختيار. ارجع للأرقام وقارنها ويا هدفك وحد الخسارة اللي محدده."}</p>}
            </div>
          );
        })}
      </div>
      {all && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>}
    </div>
  );
}

/* ---------- limits: from profit before ads to the most you can pay per message ---------- */
function Limits({ d }: { d: { before: number; keep: number; conv: number; note: string } }) {
  const [before, setBefore] = useState(d.before);
  const [keep, setKeep] = useState(d.keep);
  const [conv, setConv] = useState(d.conv);
  const k = Math.min(keep, before);
  const target = before - k;
  const msg = (target * conv) / 100;
  const msgLimit = (before * conv) / 100;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4 space-y-2`}>
        <Slider label="الربح اللي يبقالك من الطلب المستلم قبل الإعلان" value={before} min={6000} max={30000} step={500} onChange={setBefore} show={fmt(before)} />
        <Slider label="الربح اللي تريد يبقى بجيبك" value={keep} min={1000} max={20000} step={500} onChange={setKeep} show={fmt(k)} />
        <Slider label="من كل 100 رسالة، شكد طلب يوصل للزبون؟" value={conv} min={3} max={30} step={1} onChange={setConv} show={String(conv)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["أعلى خسارة تتحملها بالطلب", before, "text-red-200"],
          ["الربح اللي تستهدفه من كل طلب", target, "text-emerald-200"],
          ["حد الخسارة للرسالة الواحدة", msgLimit, "text-red-200"],
          ["أعلى كلفة للرسالة تقبل بيها", msg, "text-emerald-200"],
        ].map(([l, v, t]) => (
          <div key={String(l)} className={`${card} p-3.5`}>
            <p className="text-[12px] font-bold text-white/55">{String(l)}</p>
            <motion.p key={Math.round(Number(v))} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={ease} className={`text-[21px] font-black ${t}`}>
              {fmt(Number(v))}
            </motion.p>
          </div>
        ))}
      </div>
      <p className="text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

export const KIT4: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  cardrate: { render: (d) => <CardRate d={d} /> },
  objective: { render: (d) => <Objective d={d} /> },
  audience: { render: (d) => <Audience d={d} /> },
  adtable: { render: (d) => <AdTable d={d} /> },
  limits: { render: (d) => <Limits d={d} /> },
};
