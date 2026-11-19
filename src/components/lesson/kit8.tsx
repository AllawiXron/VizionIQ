import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, X, Clock } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 8 visuals: the order trip, the courier calculator, the confirmation call, the waybill check and the weekly statement.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pick = (on: boolean) =>
  `w-full min-h-[48px] rounded-xl border px-3.5 py-2.5 text-right text-[14px] leading-relaxed transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white font-bold" : "bg-white/[0.04] border-white/12 text-white/85"}`;
const mainBtn = "w-full min-h-[48px] rounded-xl bg-white text-[#040e33] text-[15px] font-black disabled:opacity-50";
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

/* ---------- codtrip: walk one order from the chat to the statement, stop it anywhere ---------- */
type TripStage = { title: string; text: string; stop?: string; lost?: { label: string; v: number }[]; say?: string };
type TripData = { order: string; stages: TripStage[]; paid: { start: number; items: { label: string; v: number }[]; result: string }; done: string };
function CodTrip({ d }: { d: TripData }) {
  const [at, setAt] = useState(0);
  const [stopped, setStopped] = useState(false);
  const last = d.stages.length - 1;
  const s = d.stages[at];
  const net = d.paid.items.reduce((t, x) => t - x.v, d.paid.start);
  const lost = (s.lost ?? []).reduce((t, x) => t + x.v, 0);
  const inHand = at === last && !stopped ? net : 0;
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/80 leading-relaxed">{d.order}</p>
      <div className="flex gap-1.5" aria-hidden="true">
        {d.stages.map((x, i) => (
          <span key={x.title} className={`flex-1 rounded-lg px-1 py-1.5 text-center text-[11px] sm:text-[12px] font-black border leading-tight transition-colors duration-300 ${i < at ? "border-emerald-300/50 text-emerald-200" : i === at ? (stopped ? "bg-red-300/90 text-[#040e33] border-red-300" : "bg-white text-[#040e33] border-white") : "border-white/10 text-white/40"}`}>
            {x.title}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`${card} p-3`}>
          <p className="text-[12px] font-bold text-white/55">بجدولك</p>
          <p className="mt-1 text-[16px] font-black text-white">{stopped ? "طلب ما انباع" : "طلب واحد مسجل"}</p>
        </div>
        <div className={`${card} p-3`}>
          <p className="text-[12px] font-bold text-white/55">الفلوس اللي بإيدك</p>
          <motion.p key={inHand} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 text-[18px] font-black ${inHand ? "text-emerald-200" : "text-white"}`}>
            {fmt(inHand)} د.ع
          </motion.p>
        </div>
      </div>
      <motion.div key={at + String(stopped)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`${card} p-3.5 space-y-2.5`}>
        {!stopped && <p className="text-[15px] text-white/85 leading-relaxed">{s.text}</p>}
        {stopped && (
          <>
            {(s.lost ?? []).length > 0 ? (
              <div className="space-y-1.5">
                {(s.lost ?? []).map((x) => (
                  <p key={x.label} className="flex justify-between gap-3 text-[14px] text-white/80">
                    <span>{x.label}</span>
                    <span dir="ltr" className="font-black text-red-200 shrink-0">- {fmt(x.v)}</span>
                  </p>
                ))}
                <p className="flex justify-between gap-3 border-t border-white/10 pt-2 text-[15px] font-black text-red-200">
                  <span>خسرت بدون أي بيع</span>
                  <span className="shrink-0">{fmt(lost)} د.ع</span>
                </p>
              </div>
            ) : (
              <p className="text-[15px] font-black text-emerald-200">ما دفعت كروة ولا تغليف</p>
            )}
            <p className="text-[15px] text-white/80 leading-relaxed">{s.say}</p>
          </>
        )}
        {at === last && !stopped && (
          <div className="space-y-1.5 pt-1">
            <p className="flex justify-between gap-3 text-[14px] text-white/80"><span>الزبون دفع للمندوب</span><span className="font-black text-white shrink-0">{fmt(d.paid.start)}</span></p>
            {d.paid.items.map((x) => (
              <p key={x.label} className="flex justify-between gap-3 text-[14px] text-white/80"><span>{x.label}</span><span dir="ltr" className="font-black text-red-200 shrink-0">- {fmt(x.v)}</span></p>
            ))}
            <p className="flex justify-between gap-3 border-t border-white/10 pt-2 text-[15px] font-black text-emerald-200"><span>{d.paid.result}</span><span className="shrink-0">{fmt(net)} د.ع</span></p>
          </div>
        )}
      </motion.div>
      {stopped ? (
        <button type="button" onClick={() => setStopped(false)} className={ghostBtn}>رجع وخلي الطلب يكمل</button>
      ) : at < last ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => setAt(at + 1)} className={mainBtn}>الطلب يكمل للمرحلة الجاية</button>
          {s.stop && <button type="button" onClick={() => setStopped(true)} className={ghostBtn}>{s.stop}</button>}
        </div>
      ) : (
        <>
          <p className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</p>
          <button type="button" onClick={() => setAt(0)} className={ghostBtn}>من البداية</button>
        </>
      )}
    </div>
  );
}

/* ---------- couriercalc: two companies, 100 orders each, cost per order that really got paid ---------- */
type Co = { name: string; kerwa: number; refusedShare: number; refusedLabel: string; delivered: number };
function CourierCalc({ d }: { d: { orders: number; ad: number; a: Co; b: Co; aWins: string; bWins: string } }) {
  const [got, setGot] = useState({ a: d.a.delivered, b: d.b.delivered });
  const calc = (c: Co, n: number) => {
    const refused = d.orders - n;
    const paid = n * c.kerwa + refused * c.kerwa * c.refusedShare;
    const ad = refused * d.ad;
    return { refused, paid, ad, per: (paid + ad) / n };
  };
  const ra = calc(d.a, got.a);
  const rb = calc(d.b, got.b);
  const round = (n: number) => Math.round(n / 100) * 100;
  const cols: [keyof typeof got, Co, ReturnType<typeof calc>][] = [["a", d.a, ra], ["b", d.b, rb]];
  const aCheaper = round(ra.per) < round(rb.per);
  const same = round(ra.per) === round(rb.per);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {cols.map(([k, c, r]) => {
          const best = !same && (k === "a" ? aCheaper : !aCheaper);
          return (
            <div key={k} className={`${card} p-3.5 space-y-3 ${best ? "border-emerald-300/40" : ""}`}>
              <div>
                <p className="text-[15px] font-black text-white">{c.name}</p>
                <p className="text-[13px] text-white/60">كروة {fmt(c.kerwa)}، والمرفوض {c.refusedLabel}</p>
              </div>
              <label className="block">
                <span className="flex justify-between text-[13px] font-bold text-white/70">
                  <span>طلبات وصلت من {d.orders}</span>
                  <span className="text-white">{got[k]}</span>
                </span>
                <input
                  type="range"
                  min={60}
                  max={96}
                  value={got[k]}
                  onChange={(e) => setGot((g) => ({ ...g, [k]: Number(e.target.value) }))}
                  className="mt-2 w-full accent-white"
                  aria-label={`طلبات وصلت عند ${c.name}`}
                />
              </label>
              <div className="space-y-1 text-[13px] text-white/75">
                <p className="flex justify-between gap-2"><span>اللي اندفع للتوصيل</span><span className="font-bold text-white">{fmt(r.paid)}</span></p>
                <p className="flex justify-between gap-2"><span>إعلان راح على {r.refused} مرفوض</span><span className="font-bold text-white">{fmt(r.ad)}</span></p>
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-[12px] font-bold text-white/55">الكلفة لكل طلب مستلم</p>
                <motion.p key={round(r.per)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[22px] font-black ${best ? "text-emerald-200" : "text-white"}`}>
                  تقريبا {fmt(round(r.per))} د.ع
                </motion.p>
              </div>
            </div>
          );
        })}
      </div>
      <motion.p key={String(aCheaper) + same} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-white/85 leading-relaxed">
        {same ? "هسه الكلفة تقريبا نفسها. الفرق يصير بالكشف وسرعة الفلوس." : aCheaper ? d.aWins : d.bWins}
      </motion.p>
    </div>
  );
}

/* ---------- confirmcall: the call line by line, the order card fills, the clock runs ---------- */
type Field = { id: string; label: string; value?: string };
type CallOpt = { text: string; good?: boolean; say: string; secs: number };
type CallStep = { title: string; options: CallOpt[]; reply: string; fills: Record<string, string> };
function ConfirmCall({ d }: { d: { order: string; fields: Field[]; steps: CallStep[]; done: string } }) {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState<number | null>(null);
  const [secs, setSecs] = useState(0);
  const finished = at >= d.steps.length;
  const filled: Record<string, string> = {};
  d.fields.forEach((f) => { if (f.value) filled[f.id] = f.value; });
  d.steps.slice(0, at).forEach((s) => Object.assign(filled, s.fills));
  const choose = (i: number) => {
    const o = d.steps[at].options[i];
    setSecs((t) => t + o.secs);
    if (o.good) { setAt(at + 1); setMiss(null); } else setMiss(i);
  };
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/80 leading-relaxed">{d.order}</p>
      <div className={`${card} p-3.5`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-black text-white/70">بطاقة الطلب</p>
          <p className="flex items-center gap-1.5 text-[13px] font-black text-white/80"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{clock}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {d.fields.map((f) => {
            const v = filled[f.id];
            const changed = v && f.value && v !== f.value;
            return (
              <div key={f.id} className="min-w-0">
                <p className="text-[11px] font-bold text-white/45">{f.label}</p>
                <motion.p key={v ?? "none"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className={`text-[13px] font-bold leading-snug ${!v ? "text-red-200/80" : changed ? "text-emerald-200" : "text-white"}`}>
                  {v ?? "ناقص"}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${card} p-3.5 space-y-2.5`}>
        {d.steps.slice(0, at).map((s, k) => (
          <React.Fragment key={k}>
            <Bubble from="seller">{s.options.find((o) => o.good)!.text}</Bubble>
            <Bubble from="customer">{s.reply}</Bubble>
          </React.Fragment>
        ))}
        {!finished && miss !== null && <Bubble from="seller">{d.steps[at].options[miss].text}</Bubble>}
        {at === 0 && miss === null && <p className="text-[13px] text-white/50">الزبونة رفعت الخط. شنو أول شي تكوله؟</p>}
      </div>
      {!finished ? (
        <div className="space-y-2">
          <p className="text-[14px] font-bold text-white/65">{d.steps[at].title}</p>
          {d.steps[at].options.map((o, i) => (
            <button key={o.text} type="button" onClick={() => choose(i)} className={pick(miss === i)}>
              {o.text}
            </button>
          ))}
          {miss !== null && (
            <motion.p key={at + "-" + miss} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              {d.steps[at].options[miss].say}
            </motion.p>
          )}
        </div>
      ) : (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">
          المكالمة خلصت بـ {clock}. {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- waybillcheck: what was agreed on the call against what got written on the waybill ---------- */
type BillRow = { label: string; agreed: string; written: string; wrong?: boolean; why?: string };
function WaybillCheck({ d }: { d: { rows: BillRow[]; ship: string; done: string } }) {
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const [shipped, setShipped] = useState(false);
  const wrongs = d.rows.map((r, i) => ({ r, i })).filter((x) => x.r.wrong);
  const found = wrongs.filter((x) => seen[x.i]).length;
  const all = found === wrongs.length;
  const firstMissed = wrongs.find((x) => !seen[x.i]);
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-white/75 leading-relaxed">على اليمين اللي اتفقت عليه بالمكالمة، وعلى اليسار اللي انكتب بالوصل. اضغط على أي سطر تشوفه غلط قبل لا تسد الكارتون.</p>
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-[1fr_1fr] gap-2 px-3.5 py-2 text-[12px] font-black text-white/50 border-b border-white/10">
          <span>بالمكالمة</span>
          <span>بالوصل</span>
        </div>
        {d.rows.map((r, i) => {
          const open = seen[i];
          return (
            <button key={r.label} type="button" onClick={() => { setSeen((s) => ({ ...s, [i]: true })); setShipped(false); }} className="w-full text-right px-3.5 py-2.5 border-b border-white/[0.06] last:border-0">
              <span className="block text-[11px] font-bold text-white/45">{r.label}</span>
              <span className="grid grid-cols-[1fr_1fr] gap-2 text-[14px] leading-snug">
                <span className="text-white/85">{r.agreed}</span>
                <span className={`font-bold ${open ? (r.wrong ? "text-red-200 line-through decoration-red-300/70" : "text-emerald-200") : "text-white"}`}>{r.written}</span>
              </span>
              {open && (
                <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 flex items-start gap-1.5 text-[13px] leading-relaxed ${r.wrong ? "text-red-200" : "text-emerald-200/90"}`}>
                  {r.wrong ? <X className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" /> : <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />}
                  {r.wrong ? r.why : "مطابق"}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[14px] font-bold text-white/70">لكيت {found} من {wrongs.length} أغلاط</p>
      {all ? (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
      ) : (
        <>
          <button type="button" onClick={() => setShipped(true)} className={ghostBtn}>{d.ship}</button>
          {shipped && firstMissed && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              الطلبية طلعت والغلط بعده بالوصل: {firstMissed.r.label}. {firstMissed.r.why}
            </motion.p>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- statement: the courier's weekly statement, find the rows that eat the difference ---------- */
type SRow = { no: string; area: string; status: string; amount: number; kerwa: number; comm: number; diff?: number; why?: string };
function Statement({ d }: { d: { deal: string; expected: number; got: number; rows: SRow[]; rest: string; done: string } }) {
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const gap = d.expected - d.got;
  const explained = d.rows.reduce((t, r, i) => t + (seen[i] && r.diff ? r.diff : 0), 0);
  const open = d.rows.map((r, i) => ({ r, i })).filter((x) => seen[x.i]);
  const lastOpen = open.length ? open[open.length - 1] : null;
  return (
    <div className="space-y-4">
      <div className={`${card} p-3.5`}>
        <p className="text-[12px] font-bold text-white/55">الاتفاق ويا الشركة</p>
        <p className="mt-1 text-[14px] text-white/85 leading-relaxed">{d.deal}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["حسابك", fmt(d.expected), "text-white"],
          ["سلموك", fmt(d.got), "text-white"],
          ["الفرق اللي انعرف سببه", `${fmt(explained)} من ${fmt(gap)}`, explained === gap ? "text-emerald-200" : "text-red-200"],
        ].map(([k, v, c]) => (
          <div key={k} className={`${card} p-3`}>
            <p className="text-[11px] sm:text-[12px] font-bold text-white/55 leading-snug">{k}</p>
            <motion.p key={v} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 text-[14px] sm:text-[17px] font-black ${c}`}>{v}</motion.p>
          </div>
        ))}
      </div>
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-[3.2rem_1fr_3.6rem_3.4rem_3rem] gap-1.5 px-3 py-2 text-[11px] font-black text-white/50 border-b border-white/10">
          <span>الوصل</span><span>المحافظة والحالة</span><span>المبلغ</span><span>الكروة</span><span>العمولة</span>
        </div>
        {d.rows.map((r, i) => {
          const on = seen[i];
          const bad = on && !!r.diff;
          return (
            <button key={r.no} type="button" onClick={() => setSeen((s) => ({ ...s, [i]: true }))} className={`w-full grid grid-cols-[3.2rem_1fr_3.6rem_3.4rem_3rem] gap-1.5 px-3 py-2.5 text-right text-[12px] sm:text-[13px] border-b border-white/[0.06] last:border-0 transition-colors duration-200 ${bad ? "bg-red-300/[0.08]" : on ? "bg-emerald-300/[0.05]" : ""}`}>
              <span className="font-bold text-white/60">{r.no}</span>
              <span className="text-white/85 leading-snug">{r.area}، {r.status}</span>
              <span className="font-bold text-white">{r.amount ? fmt(r.amount) : "0"}</span>
              <span className="font-bold text-white">{fmt(r.kerwa)}</span>
              <span className="font-bold text-white">{r.comm ? fmt(r.comm) : "0"}</span>
            </button>
          );
        })}
        <p className="px-3 py-2 text-[12px] text-white/50">{d.rest}</p>
      </div>
      {lastOpen && explained < gap && (
        <motion.p key={lastOpen.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`flex items-start gap-2 text-[15px] font-bold leading-relaxed ${lastOpen.r.diff ? "text-red-200" : "text-emerald-200/90"}`}>
          {lastOpen.r.diff ? <X className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" /> : <Check className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />}
          {lastOpen.r.diff ? `${lastOpen.r.no}: ${lastOpen.r.why} الفرق ${fmt(lastOpen.r.diff)}.` : `${lastOpen.r.no}: مطابق للاتفاق.`}
        </motion.p>
      )}
      {explained === gap && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">{d.done}</motion.p>
      )}
    </div>
  );
}

export const KIT8 = {
  codtrip: { render: (d: TripData) => <CodTrip d={d} /> },
  couriercalc: { render: (d) => <CourierCalc d={d} /> },
  confirmcall: { render: (d) => <ConfirmCall d={d} /> },
  waybillcheck: { render: (d) => <WaybillCheck d={d} /> },
  statement: { render: (d) => <Statement d={d} /> },
};
