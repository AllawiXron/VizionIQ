/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { Calculator, Megaphone, Package, TrendingDown, TrendingUp } from "lucide-react";
import { NumberField } from "./ui/NumberField";

const fmt = (n: number) => `⁦${Math.round(n).toLocaleString("en-US")}⁩`;

/**
 * A test campaign before spending: the ad budget in dollars (that is how Meta
 * bills), everything else in dinars, and the result as money in or out.
 */
export default function RoiCalculator() {
  const [budgetUsd, setBudgetUsd] = useState(100);
  const [rate, setRate] = useState(1490);
  const [cpm, setCpm] = useState(2.5);
  const [ctr, setCtr] = useState(2);
  const [orderPct, setOrderPct] = useState(2);
  const [price, setPrice] = useState(35000);
  const [cost, setCost] = useState(12000);
  const [delivery, setDelivery] = useState(5000);
  const [deliveredPct, setDeliveredPct] = useState(80);
  const [returnFee, setReturnFee] = useState(5000);

  const r = useMemo(() => {
    const spend = budgetUsd * rate;
    const impressions = cpm > 0 ? (budgetUsd / cpm) * 1000 : 0;
    const clicks = impressions * (ctr / 100);
    const orders = clicks * (orderPct / 100);
    const delivered = orders * (deliveredPct / 100);
    const returned = orders - delivered;
    const revenue = delivered * price;
    const goods = delivered * cost;
    const shipping = delivered * delivery;
    const returns = returned * returnFee;
    const net = revenue - spend - goods - shipping - returns;
    const cpa = orders > 0 ? spend / orders : 0;
    // Before ads, what one order (delivered or not) leaves on average.
    const maxCpa = (deliveredPct / 100) * (price - cost - delivery) - (1 - deliveredPct / 100) * returnFee;
    return { spend, impressions, clicks, orders, delivered, returned, revenue, goods, shipping, returns, net, cpa, maxCpa, roi: spend > 0 ? (net / spend) * 100 : 0 };
  }, [budgetUsd, rate, cpm, ctr, orderPct, price, cost, delivery, deliveredPct, returnFee]);

  const winning = r.net >= 0;

  return (
    <div className="vizion-roi-calculator w-full glass rounded-3xl sm:rounded-4xl glass-edge border p-4 sm:p-6 md:p-8 space-y-6 text-right" id="roi-calculator">
      <div className="flex items-start gap-3 border-b border-white/10 pb-5">
        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
          <Calculator className="w-5 h-5 text-vz-accent" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base sm:text-xl font-black text-white leading-snug">حاسبة الحملة التجريبية</h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">قبل لا تصرف على إعلان، حط أرقامك وشوف الحملة تطلع رابحة لو خسرانة، ووين تروح الفلوس.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <section className="glass-subtle rounded-2xl p-4 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2"><Megaphone className="w-4 h-4 text-vz-accent" /> الإعلان</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="ميزانية الحملة" unit="$" value={budgetUsd} onChange={setBudgetUsd} step={10} />
              <NumberField label="سعر الدولار" unit="د.ع" value={rate} onChange={setRate} step={10} />
              <NumberField label="كلفة الألف ظهور" unit="$" value={cpm} onChange={setCpm} step={0.1} hint="CPM من مدير الإعلانات" />
              <NumberField label="نسبة النقر" unit="%" value={ctr} onChange={setCtr} max={100} step={0.1} hint="CTR" />
            </div>
            <NumberField label="من كل 100 واحد يدوس عالإعلان، كم يطلب؟" unit="%" value={orderPct} onChange={setOrderPct} max={100} step={0.5} />
          </section>

          <section className="glass-subtle rounded-2xl p-4 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2"><Package className="w-4 h-4 text-vz-accent" /> المنتج والتوصيل</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="سعر البيع" unit="د.ع" value={price} onChange={setPrice} step={1000} />
              <NumberField label="كلفة المنتج" unit="د.ع" value={cost} onChange={setCost} step={500} />
              <NumberField label="التوصيل" unit="د.ع" value={delivery} onChange={setDelivery} step={500} />
              <NumberField label="كلفة الطلب الراجع" unit="د.ع" value={returnFee} onChange={setReturnFee} step={500} />
            </div>
            <NumberField label="من كل 100 طلب، كم يستلم الزبون فعلاً؟" unit="%" value={deliveredPct} onChange={setDeliveredPct} max={100} step={1} />
          </section>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`rounded-2xl p-5 sm:p-6 border ${winning ? "bg-emerald-400/[0.06] border-emerald-400/25" : "bg-red-500/[0.07] border-red-400/25"}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-white/70">صافي الحملة بعد كل المصاريف</p>
                <p className={`text-3xl sm:text-5xl font-black font-mono tracking-tight ${winning ? "text-emerald-300" : "text-red-300"}`}>
                  {fmt(r.net)} <span className="text-sm sm:text-base font-sans font-bold text-white/60">د.ع</span>
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${winning ? "bg-emerald-400/15 text-emerald-200" : "bg-red-500/15 text-red-200"}`}>
                {winning ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {winning ? "الحملة رابحة" : "الحملة خسرانة"} · العائد {Math.round(r.roi)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/65 leading-relaxed mt-3">
              {r.orders < 1
                ? "بهالأرقام الحملة ما تجيب ولا طلب. زيد الميزانية أو حسّن نسبة النقر."
                : r.cpa <= r.maxCpa
                  ? <>كل طلب يكلفك إعلان <span className="font-mono font-bold text-white">{fmt(r.cpa)}</span> د.ع، وتكدر تتحمل لحد <span className="font-mono font-bold text-white">{fmt(r.maxCpa)}</span> د.ع وتبقى رابح.</>
                  : r.maxCpa <= 0
                    ? "حتى لو الإعلان ببلاش، هالسعر ما يغطي الكلفة والتوصيل والراجع. ارفع السعر أو قلل الكلفة قبل لا تعلن."
                    : <>كل طلب يكلفك إعلان <span className="font-mono font-bold text-white">{fmt(r.cpa)}</span> د.ع، والحد اللي تتحمله <span className="font-mono font-bold text-white">{fmt(r.maxCpa)}</span> د.ع. لازم ترفع نسبة الطلب أو تقلل الراجع.</>}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "ظهور", value: r.impressions },
              { label: "نقرة", value: r.clicks },
              { label: "طلب", value: r.orders },
              { label: "طلب واصل", value: r.delivered },
            ].map((s) => (
              <div key={s.label} className="glass-subtle rounded-2xl p-3.5 text-center space-y-0.5">
                <p className="text-lg sm:text-xl font-black font-mono text-white">{fmt(s.value)}</p>
                <p className="text-[11px] sm:text-xs text-white/55">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-subtle rounded-2xl overflow-hidden">
            <p className="px-4 py-3 text-xs sm:text-sm font-black text-white border-b border-white/[0.07]">وين تروح الفلوس</p>
            <ul className="divide-y divide-white/[0.06] text-sm">
              {[
                { label: `الفلوس اللي تدخل (${fmt(r.delivered)} طلب واصل)`, value: r.revenue, plus: true },
                { label: `الإعلان (${fmt(budgetUsd)}$)`, value: -r.spend },
                { label: "كلفة البضاعة الواصلة", value: -r.goods },
                { label: "توصيل الطلبات الواصلة", value: -r.shipping },
                { label: `الطلبات الراجعة (${fmt(r.returned)})`, value: -r.returns },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-white/75">{row.label}</span>
                  <span className={`font-mono font-bold shrink-0 ${row.plus ? "text-emerald-300" : "text-red-300/90"}`}>{fmt(row.value)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.04]">
                <span className="font-black text-white">الصافي</span>
                <span className={`font-mono font-black text-base ${winning ? "text-emerald-300" : "text-red-300"}`}>{fmt(r.net)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
