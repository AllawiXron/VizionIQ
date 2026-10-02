import React, { useMemo, useState } from "react";
import { Calculator, Check, Save, TrendingDown, TrendingUp } from "lucide-react";
import { computeUnitEconomics, formatIqd, type CalcInput } from "../../lib/advisor/calc";
import type { BusinessProfile } from "../../lib/advisor/profile";

/**
 * Live profit calculator rendered from the advisor's ```calc block. The
 * numbers are computed here (exactly), and every input is editable so the
 * merchant can try "what if I raise the price / cut the cost per message".
 */

type Key = "price" | "productCost" | "delivery" | "cpa" | "costPerMessage" | "closeRate" | "returnRate" | "ordersPerDay";

const FIELDS: { key: Key; label: string; unit: string; step: number }[] = [
  { key: "price", label: "سعر البيع", unit: "د.ع", step: 1000 },
  { key: "productCost", label: "كلفة المنتج", unit: "د.ع", step: 500 },
  { key: "delivery", label: "كروة التوصيل", unit: "د.ع", step: 500 },
  { key: "returnRate", label: "نسبة الراجع", unit: "%", step: 1 },
];
const AD_BY_MESSAGE: typeof FIELDS = [
  { key: "costPerMessage", label: "كلفة الرسالة", unit: "$", step: 0.1 },
  { key: "closeRate", label: "نسبة الإغلاق", unit: "%", step: 1 },
];
const AD_BY_CPA: typeof FIELDS = [{ key: "cpa", label: "كلفة الإعلان للطلب", unit: "د.ع", step: 500 }];

export function CalcCard({ initial, onSaveToProfile }: { key?: React.Key; initial: CalcInput; onSaveToProfile?: (p: BusinessProfile) => void }) {
  const [v, setV] = useState<CalcInput>(initial);
  const [saved, setSaved] = useState(false);
  const byMessage = initial.cpa === undefined && (initial.costPerMessage !== undefined || initial.closeRate !== undefined);
  const r = useMemo(() => computeUnitEconomics(v), [v]);
  const fields = [...FIELDS, ...(byMessage ? AD_BY_MESSAGE : AD_BY_CPA), { key: "ordersPerDay" as Key, label: "طلبات باليوم", unit: "", step: 1 }];

  const tone = r.verdict === "profit" ? "text-emerald-300" : r.verdict === "thin" ? "text-amber-300" : "text-rose-300";
  const ring = r.verdict === "profit" ? "border-emerald-400/30 bg-emerald-400/[0.07]" : r.verdict === "thin" ? "border-amber-400/30 bg-amber-400/[0.07]" : "border-rose-400/30 bg-rose-400/[0.07]";
  const verdictText = r.verdict === "profit" ? "الحسبة رابحة" : r.verdict === "thin" ? "ربح ضعيف — أي تذبذب يقلبه خسارة" : "الحسبة خسرانة بهالأرقام";

  return (
    <div className="my-1 rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.02] overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <span className="w-7 h-7 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </span>
          حسبة الطلب الواحد
        </div>
        <span className="text-[11px] text-white/50 font-bold">غيّر أي رقم وتتحدث فوراً</span>
      </div>

      <div className={`mx-3 mt-3 rounded-2xl border px-4 py-3 ${ring}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-bold text-white/60">الربح الصافي لكل طلب واصل</div>
            <div className={`text-2xl sm:text-3xl font-black tabular-nums ${tone}`}>
              <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
                {r.net >= 0 ? "+" : "−"}
                {Math.round(Math.abs(r.net)).toLocaleString("en-US")}
              </span>{" "}
              <span className="text-base">د.ع</span>
            </div>
          </div>
          {r.net > 0 ? <TrendingUp className={`w-9 h-9 ${tone}`} /> : <TrendingDown className={`w-9 h-9 ${tone}`} />}
        </div>
        <div className={`mt-1 text-xs font-bold ${tone}`}>
          {verdictText} • هامش {r.marginPct.toFixed(0)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        <Stat label="أعلى كلفة إعلان للطلب (حد التعادل)" value={r.breakEvenCpa > 0 ? formatIqd(r.breakEvenCpa) : "ماكو — المنتج خسران حتى بدون إعلان"} />
        {r.breakEvenCostPerMessage !== undefined && <Stat label="أعلى كلفة رسالة تتحملها" value={`$${r.breakEvenCostPerMessage.toFixed(2)}`} highlight />}
        {r.breakEvenCloseRate !== undefined && <Stat label="أقل نسبة إغلاق تحتاجها" value={`${r.breakEvenCloseRate.toFixed(1)}%`} />}
        <Stat label="كلفة الإعلان للطلب هسة" value={formatIqd(r.cpa)} />
        <Stat label="حصة الراجع على كل طلب" value={formatIqd(r.returnShare)} />
        {r.monthlyNet !== undefined && <Stat label="الصافي الشهري المتوقع" value={formatIqd(r.monthlyNet)} highlight />}
      </div>

      <details className="group border-t border-white/10">
        <summary className="list-none cursor-pointer px-4 py-2.5 text-xs font-bold text-vz-accent flex items-center justify-between">
          <span>عدّل الأرقام</span>
          <span className="transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 rounded-xl bg-black/25 border border-white/10 px-3 py-2">
              <span className="text-[11px] font-bold text-white/55">{f.label}</span>
              <span className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={f.step}
                  value={v[f.key] ?? ""}
                  onChange={(e) => {
                    setSaved(false);
                    const n = e.target.value === "" ? undefined : Number(e.target.value);
                    setV((prev) => ({ ...prev, [f.key]: n === undefined || Number.isNaN(n) ? (f.key === "price" ? 0 : undefined) : n }));
                  }}
                  className="w-full bg-transparent text-white font-black text-sm outline-none tabular-nums"
                  dir="ltr"
                />
                <span className="text-[11px] text-white/45 shrink-0">{f.unit}</span>
              </span>
            </label>
          ))}
        </div>
      </details>

      {onSaveToProfile && (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => {
              onSaveToProfile({
                price: v.price,
                productCost: v.productCost,
                deliveryCost: v.delivery,
                returnRate: v.returnRate,
                costPerMessage: v.costPerMessage,
                closeRate: v.closeRate,
                ordersPerDay: v.ordersPerDay,
              });
              setSaved(true);
            }}
            className={`w-full min-h-[40px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-colors ${
              saved ? "border-emerald-400/40 text-emerald-300 bg-emerald-400/10" : "border-white/12 text-white/80 hover:bg-white/[0.06]"
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "انحفظت بملف مشروعك" : "احفظ هالأرقام بملف مشروعي"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-2.5 border ${highlight ? "border-vz-blue/40 bg-vz-blue/10" : "border-white/10 bg-white/[0.03]"}`}>
      <div className="text-[11px] font-bold text-white/55 leading-snug">{label}</div>
      <div className="mt-0.5 text-[14px] sm:text-[15px] font-black text-white tabular-nums">{value}</div>
    </div>
  );
}
