import React, { useId, useState } from "react";
import { Calculator } from "lucide-react";
import type { PlaybookCalculator as CalculatorKind } from "../../data/playbooksData";

const fmt = (n: number) => `⁦${Math.round(n).toLocaleString("en-US")}⁩`;
const clampPct = (n: number) => Math.min(95, Math.max(0, n));

function Field({ label, value, onChange, suffix, step = 1000 }: { label: string; value: number; onChange: (n: number) => void; suffix: string; step?: number }) {
  const id = useId();
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-bold text-white/65">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="vz-field w-full rounded-xl pl-14 pr-3 py-2.5 text-sm text-white font-mono text-left min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60"
          dir="ltr"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/45 pointer-events-none">{suffix}</span>
      </span>
    </label>
  );
}

function Result({ label, value, tone = "plain", hint }: { label: string; value: string; tone?: "good" | "bad" | "plain"; hint?: string }) {
  const color = tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-red-300" : "text-white";
  return (
    <div className="glass-subtle rounded-2xl p-4 space-y-1">
      <p className="text-xs text-white/55 font-bold">{label}</p>
      <p className={`text-lg sm:text-xl font-black font-mono ${color}`}>{value}</p>
      {hint && <p className="text-[11px] text-white/45 leading-relaxed">{hint}</p>}
    </div>
  );
}

/** "How much can I pay per message?" from the member's own numbers. */
function MaxMessageCost() {
  const [price, setPrice] = useState(35000);
  const [cost, setCost] = useState(12000);
  const [delivery, setDelivery] = useState(5000);
  const [returns, setReturns] = useState(20);
  const [close, setClose] = useState(10);

  const r = clampPct(returns) / 100;
  const breakEvenCpa = (1 - r) * (price - cost) - delivery;
  const target = breakEvenCpa * 0.7;
  const c = clampPct(close) / 100;
  const maxMessage = breakEvenCpa * c;
  const targetMessage = target * c;
  const losing = breakEvenCpa <= 0;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Field label="سعر البيع" value={price} onChange={setPrice} suffix="د.ع" />
        <Field label="كلفة المنتج" value={cost} onChange={setCost} suffix="د.ع" />
        <Field label="كلفة التوصيل" value={delivery} onChange={setDelivery} suffix="د.ع" step={500} />
        <Field label="نسبة الراجع" value={returns} onChange={setReturns} suffix="%" step={1} />
        <Field label="من الرسائل للطلبات" value={close} onChange={setClose} suffix="%" step={1} />
      </div>
      {losing ? (
        <p className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-sm text-red-200 leading-relaxed">
          بهاي الأرقام كل طلب خسران حتى قبل الإعلان. ارفع السعر، نزّل الكلفة، أو نزّل الراجع أول (شوف حل الراجع).
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Result label="حد الخسارة لكل طلب" value={`${fmt(breakEvenCpa)} د.ع`} hint="فوك هذا الرقم كل طلب يخسرك" />
          <Result label="أعلى تكلفة رسالة" value={`${fmt(maxMessage)} د.ع`} tone="bad" hint="إذا الرسالة أغلى من هذا، تخسر" />
          <Result label="الهدف الصحي للرسالة" value={`${fmt(targetMessage)} د.ع`} tone="good" hint="تحت هذا يبقالك ربح يستاهل (70%)" />
        </div>
      )}
      {!losing && c > 0 && (
        <p className="text-xs text-white/55 leading-relaxed">
          لاحظ: إذا رفعت التحويل من {Math.round(c * 100)}% إلى {Math.round(Math.min(0.95, c * 2) * 100)}%، تكدر تدفع لحد {fmt(breakEvenCpa * Math.min(0.95, c * 2))} د.ع على الرسالة وتبقى رابح. تحسين الرد أرخص من تخفيض الإعلان.
        </p>
      )}
    </>
  );
}

/** Messages × close rate × order value × repeat: what a small lift on each does. */
function SalesLevers() {
  const [messages, setMessages] = useState(1500);
  const [close, setClose] = useState(10);
  const [aov, setAov] = useState(25000);
  const [repeat, setRepeat] = useState(5);
  const [lift, setLift] = useState(20);

  const revenue = (m: number, c: number, a: number, rp: number) => m * (c / 100) * a * (1 + rp / 100);
  const now = revenue(messages, clampPct(close), aov, clampPct(repeat));
  const k = 1 + lift / 100;
  const after = revenue(messages, clampPct(close * k), aov * k, clampPct(repeat * k));
  const growth = now > 0 ? ((after - now) / now) * 100 : 0;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="رسائل بالشهر" value={messages} onChange={setMessages} suffix="رسالة" step={100} />
        <Field label="من الرسائل للطلبات" value={close} onChange={setClose} suffix="%" step={1} />
        <Field label="متوسط قيمة الطلب" value={aov} onChange={setAov} suffix="د.ع" />
        <Field label="زبائن يرجعون يشترون" value={repeat} onChange={setRepeat} suffix="%" step={1} />
      </div>
      <label className="block space-y-2">
        <span className="text-xs font-bold text-white/65">لو حسنت التحويل وقيمة الطلب والرجوع كل وحدة بـ {lift}%</span>
        <input type="range" min={5} max={50} step={5} value={lift} onChange={(e) => setLift(Number(e.target.value))} className="w-full accent-[#4f8cff]" />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Result label="مبيعاتك هسه بالشهر" value={`${fmt(now)} د.ع`} />
        <Result label="بعد التحسين (نفس الإعلان)" value={`${fmt(after)} د.ع`} tone="good" />
        <Result label="الزيادة" value={`+${Math.round(growth)}%`} tone="good" hint="بدون دينار إعلان زيادة" />
      </div>
    </>
  );
}

/** What returns cost per month, and what getting them to 10% saves. */
function ReturnsCost() {
  const [orders, setOrders] = useState(400);
  const [returns, setReturns] = useState(25);
  const [delivery, setDelivery] = useState(5000);
  const [cpa, setCpa] = useState(8000);

  const lossPerReturn = delivery + cpa;
  const monthly = orders * (clampPct(returns) / 100) * lossPerReturn;
  const atTen = orders * 0.1 * lossPerReturn;
  const saving = Math.max(0, monthly - atTen);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="طلبات تطلع بالشهر" value={orders} onChange={setOrders} suffix="طلب" step={10} />
        <Field label="نسبة الراجع" value={returns} onChange={setReturns} suffix="%" step={1} />
        <Field label="كلفة التوصيل" value={delivery} onChange={setDelivery} suffix="د.ع" step={500} />
        <Field label="كلفة الإعلان للطلب" value={cpa} onChange={setCpa} suffix="د.ع" step={500} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Result label="خسارة الراجع بالشهر" value={`${fmt(monthly)} د.ع`} tone="bad" hint="توصيل + إعلان على طلبات ما انباعت" />
        <Result label="لو نزل الراجع لـ 10%" value={`${fmt(atTen)} د.ع`} />
        <Result label="توفّر بالشهر" value={`${fmt(saving)} د.ع`} tone="good" hint="ربح صافي يرجع لجيبك" />
      </div>
    </>
  );
}

const TITLES: Record<CalculatorKind, string> = {
  "max-message-cost": "احسب: شكد أكدر أدفع على الرسالة؟",
  "sales-levers": "احسب: شكد تزيد مبيعاتي بدون إعلان زيادة؟",
  "returns-cost": "احسب: شكد يخسرني الراجع بالشهر؟",
};

export function PlaybookCalculator({ kind }: { kind: CalculatorKind }) {
  return (
    <div className="glass-elevated glass-edge rounded-3xl p-5 sm:p-7 space-y-5">
      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
        <Calculator className="w-5 h-5 text-vz-accent" />
        {TITLES[kind]}
      </h3>
      {kind === "max-message-cost" && <MaxMessageCost />}
      {kind === "sales-levers" && <SalesLevers />}
      {kind === "returns-cost" && <ReturnsCost />}
      <p className="text-[11px] text-white/40">غيّر الأرقام لأرقام مشروعك. الحساب يصير على جهازك وما ينحفظ.</p>
    </div>
  );
}
