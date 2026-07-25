/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calculator, TrendingUp, DollarSign, PieChart, ShieldAlert, Layers, ArrowRight, CheckCircle2, RefreshCw, BarChart3, HelpCircle, Lock, Crown } from "lucide-react";
import { isFreeTrialUser } from "./LockScreen";

export default function AdvancedCalculatorSuite() {
  const [activeTab, setActiveTab] = useState<
    "roas" | "ltv" | "scaling" | "breakeven" | "margin" | "cac_ltv" | "pricing" | "budget" | "returns"
  >("roas");

  const userCode = typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") || "" : "";
  const isFreeTrial = isFreeTrialUser(userCode);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  // 1. ROAS & Net Profit State
  const [roasInputs, setRoasInputs] = useState({
    budgetUSD: 30,
    cpm: 2.2,
    ctr: 1.8,
    cvr: 3.5,
    productCostIQD: 15000,
    shippingCostIQD: 4000,
    sellingPriceIQD: 38000,
    deliveryRatePct: 88,
    exchangeRate: 1530
  });

  // ROAS Calculations
  const totalSpendIQD = roasInputs.budgetUSD * roasInputs.exchangeRate;
  const impressions = (roasInputs.budgetUSD / roasInputs.cpm) * 1000;
  const clicks = Math.round(impressions * (roasInputs.ctr / 100));
  const orders = Math.round(clicks * (roasInputs.cvr / 100));
  const deliveredOrders = Math.round(orders * (roasInputs.deliveryRatePct / 100));
  const revenueIQD = deliveredOrders * roasInputs.sellingPriceIQD;
  const productTotalIQD = orders * roasInputs.productCostIQD; // cost for all sourced items
  const shippingTotalIQD = orders * roasInputs.shippingCostIQD;
  const totalCostsIQD = totalSpendIQD + productTotalIQD + shippingTotalIQD;
  const netProfitIQD = revenueIQD - totalCostsIQD;
  const roasVal = totalSpendIQD > 0 ? (revenueIQD / totalSpendIQD).toFixed(2) : "0";
  const cpaUSD = orders > 0 ? (roasInputs.budgetUSD / orders).toFixed(2) : "0";

  // 2. LTV Calculator State
  const [ltvInputs, setLtvInputs] = useState({
    aovIQD: 42000,
    purchaseFreqPerYear: 2.4,
    lifespanYears: 2,
    grossMarginPct: 40
  });
  const ltvValueIQD = Math.round(ltvInputs.aovIQD * ltvInputs.purchaseFreqPerYear * ltvInputs.lifespanYears * (ltvInputs.grossMarginPct / 100));

  // 3. Scaling Simulator State
  const [scalePct, setScalePct] = useState(100); // 100% = double ad spend
  const scaledSpendUSD = roasInputs.budgetUSD * (1 + scalePct / 100);
  // Account for slight CPM/CPA degradation during scaling (10% efficiency loss per 100% scale)
  const efficiencyMultiplier = 1 - (scalePct / 100) * 0.12;
  const scaledOrders = Math.round(orders * (1 + scalePct / 100) * Math.max(0.6, efficiencyMultiplier));
  const scaledDelivered = Math.round(scaledOrders * (roasInputs.deliveryRatePct / 100));
  const scaledRevenueIQD = scaledDelivered * roasInputs.sellingPriceIQD;
  const scaledSpendIQD = scaledSpendUSD * roasInputs.exchangeRate;
  const scaledCostsIQD = scaledSpendIQD + (scaledOrders * (roasInputs.productCostIQD + roasInputs.shippingCostIQD));
  const scaledProfitIQD = scaledRevenueIQD - scaledCostsIQD;

  // 4. Break-Even Calculator State
  const [breakEvenInputs, setBreakEvenInputs] = useState({
    fixedCostsIQD: 600000, // Monthly salaries, software, office
    unitContributionMarginIQD: 14000 // Price - COGS - Shipping - CPA
  });
  const breakEvenOrdersRequired = breakEvenInputs.unitContributionMarginIQD > 0
    ? Math.ceil(breakEvenInputs.fixedCostsIQD / breakEvenInputs.unitContributionMarginIQD)
    : 0;

  // 5. Margin Optimizer (50/30/20) State
  const [marginSellingPrice, setMarginSellingPrice] = useState(40000);
  const targetCogs = marginSellingPrice * 0.50; // 50%
  const targetAds = marginSellingPrice * 0.30;  // 30%
  const targetNetProfit = marginSellingPrice * 0.20; // 20%

  // 6. Return Rate Impact State
  const [returnRateInputs, setReturnRateInputs] = useState({
    monthlyOrders: 300,
    currentReturnRatePct: 18,
    targetReturnRatePct: 6,
    returnShippingFeeIQD: 4500,
    itemSellingPriceIQD: 35000
  });
  const currentReturnsCount = Math.round(returnRateInputs.monthlyOrders * (returnRateInputs.currentReturnRatePct / 100));
  const targetReturnsCount = Math.round(returnRateInputs.monthlyOrders * (returnRateInputs.targetReturnRatePct / 100));
  const savedReturnsCount = currentReturnsCount - targetReturnsCount;
  const monthlySavingsIQD = savedReturnsCount * (returnRateInputs.returnShippingFeeIQD + returnRateInputs.itemSellingPriceIQD * 0.15); // Saved shipping + unrecoverable repackaging

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>منظومة الحسابات المالية المتقدمة • 9 حواسب متفاعلة</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            جناح الآلات الحاسبة واختبار السيناريوهات المالي
          </h3>
        </div>
        <p className="text-xs md:text-sm text-white/60 max-w-md">
          اختر الأداة واضبط السلايدرات لمعرفة الرياضيات الصافية لبزنسك وتجنب اتخاذ قرارات مبنية على التخمين.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "roas", label: "أرباح ROAS الصافية", icon: TrendingUp },
          { id: "ltv", label: "القيمة العمرية LTV", icon: DollarSign },
          { id: "scaling", label: "محاكي التوسع الإعلاني", icon: BarChart3 },
          { id: "breakeven", label: "نقطة التعادل Break-Even", icon: PieChart },
          { id: "margin", label: "مطور الهوامش 50/30/20", icon: Layers },
          { id: "returns", label: "أثر خفض المرتجع", icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#D4A017] text-[#040B24] border-[#D4A017] shadow-lg shadow-[#D4A017]/20 font-black"
                  : "bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. ROAS & NET PROFIT CALCULATOR */}
      {activeTab === "roas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-[fadeIn_0.3s_ease-out]">
          
          {/* Controls Inputs */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
            <h4 className="text-lg font-bold text-[#F0C040] flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span>مدخلات الحملة والتكاليف بالدينار والـ $</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">الميزانية اليومية الإعلانية ($)</label>
                <input
                  type="number"
                  value={roasInputs.budgetUSD}
                  onChange={(e) => setRoasInputs({ ...roasInputs, budgetUSD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">نسبة النقر CTR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={roasInputs.ctr}
                  onChange={(e) => setRoasInputs({ ...roasInputs, ctr: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">تكلفة الشراء للقطعة (د.ع)</label>
                <input
                  type="number"
                  step="500"
                  value={roasInputs.productCostIQD}
                  onChange={(e) => setRoasInputs({ ...roasInputs, productCostIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">سعر بيع القطعة للزبون (د.ع)</label>
                <input
                  type="number"
                  step="1000"
                  value={roasInputs.sellingPriceIQD}
                  onChange={(e) => setRoasInputs({ ...roasInputs, sellingPriceIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">أجور الشحن للمحافظات (د.ع)</label>
                <input
                  type="number"
                  step="500"
                  value={roasInputs.shippingCostIQD}
                  onChange={(e) => setRoasInputs({ ...roasInputs, shippingCostIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">نسبة الاستلام والنجاح (%)</label>
                <input
                  type="number"
                  value={roasInputs.deliveryRatePct}
                  onChange={(e) => setRoasInputs({ ...roasInputs, deliveryRatePct: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Results Display */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0F1A42] to-[#040B24] border border-[#D4A017]/40 rounded-3xl p-6 space-y-6 shadow-xl">
            <h4 className="text-[#F0C040] font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3">
              نتائج الرياضيات الصافية اليومية
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">العائد الإعلاني ROAS</span>
                <span className={`text-3xl font-mono font-black ${Number(roasVal) >= 3 ? "text-emerald-400" : Number(roasVal) >= 2 ? "text-amber-400" : "text-red-400"}`}>
                  {roasVal}x
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">كلفة الطلب CPA</span>
                <span className="text-3xl font-mono font-black text-[#F0C040]">
                  ${cpaUSD}
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">إجمالي الطلبات الفردية</span>
                <span className="text-2xl font-mono font-black text-white">
                  {deliveredOrders} / {orders} <span className="text-xs text-white/50">طرد</span>
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">الإيرادات المجمعة</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  {revenueIQD.toLocaleString()} <span className="text-[10px]">د.ع</span>
                </span>
              </div>
            </div>

            {/* Total Net Profit Banner */}
            <div className={`p-5 rounded-2xl border text-center space-y-1 ${
              netProfitIQD >= 0
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}>
              <span className="text-xs font-bold block">صافي الربح اليومي الخالص (بعد كل التكاليف):</span>
              <span className="text-3xl font-mono font-black tracking-tight">
                {netProfitIQD.toLocaleString()} د.ع
              </span>
              <span className="text-[10px] block opacity-80 dir-rtl">
                {netProfitIQD >= 0 ? "✅ خطة مربحة وجاهزة للتنفيذ" : "⚠️ خطة خاسرة بسبب ارتفاع كلفة الإعلان أو انخفاض الهامش"}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. LTV CALCULATOR */}
      {activeTab === "ltv" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة LTV مقفلة في النسخة التجريبية</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                حاسبة القيمة العمرية وهوامش إعادة الشراء متاحة فقط للحسابات الكاملة. ترقية حسابك تتيح لك الوصول الفوري لجميع الـ 9 حواسب مئوية وتجارية.
              </p>
            </div>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>فتح حاسبة LTV وجميع الأدوات الآن ⚡</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <h4 className="text-xl font-bold text-[#F0C040]">حاسبة القيمة العمرية للعميل (Customer Lifetime Value - LTV)</h4>
          <p className="text-xs md:text-sm text-white/70">
            احسب كم القيمة المالية الإجمالية التي يدفعها لك الزبون العراقي على مدار علاقتهم ببراندك عند نجاح تطبيق استراتيجية إعادة الشراء.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">متوسط قيمة الطلب الواحد AOV (د.ع)</label>
                <input
                  type="number"
                  step="1000"
                  value={ltvInputs.aovIQD}
                  onChange={(e) => setLtvInputs({ ...ltvInputs, aovIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">عدد مرات الشراء سنوياً للزبون الواحد</label>
                <input
                  type="number"
                  step="0.1"
                  value={ltvInputs.purchaseFreqPerYear}
                  onChange={(e) => setLtvInputs({ ...ltvInputs, purchaseFreqPerYear: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">مدة ولاء الزبون بالسنوات</label>
                <input
                  type="number"
                  value={ltvInputs.lifespanYears}
                  onChange={(e) => setLtvInputs({ ...ltvInputs, lifespanYears: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0F1A42] to-[#040B24] border border-[#D4A017]/40 rounded-3xl p-6 flex flex-col justify-between text-center space-y-4">
              <span className="text-xs text-white/60 font-bold uppercase tracking-wider">القيمة العمرية الصافية LTV</span>
              <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400 drop-shadow-md">
                {ltvValueIQD.toLocaleString()} <span className="text-base text-white/70">د.ع</span>
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                معنى هذا الرقم: يمكنك صرف حتى <span className="text-[#F0C040] font-bold">{(ltvValueIQD * 0.25).toLocaleString()} د.ع</span> للاستحواذ على هذا الزبون المرة الأولى، وستظل مربحاً جداً بفضل إعادة الشراء!
              </p>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 3. SCALING SIMULATOR */}
      {activeTab === "scaling" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">محاكي التوسع الإعلاني مقفل في النسخة التجريبية</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                محاكي مضاعفة الميزانية والتوقع المالي لحملات فيسبوك وانستغرام متاح فقط للحسابات المسجلة بالكامل.
              </p>
            </div>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>ترقية الحساب وفتح محاكي التوسع الآن ⚡</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <h4 className="text-xl font-bold text-[#F0C040]">محاكي ومحسّن التوسع الإعلاني (Scaling Simulator)</h4>
          <p className="text-xs md:text-sm text-white/70">
            "ماذا يحدث لأرباحي الصافية إذا قمت بمضاعفة صرف الإعلانات بنسبة {scalePct}%؟"
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white/80">
              <span>نسبة زيادة المصرف الإعلاني: +{scalePct}%</span>
              <span>المصرف الجديد: ${scaledSpendUSD.toFixed(0)} / يومياً</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={scalePct}
              onChange={(e) => setScalePct(Number(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-white/60 block font-bold">الطلبات اليومية المتوقعة</span>
              <span className="text-3xl font-mono font-black text-white">{scaledDelivered} طرد</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-white/60 block font-bold">الإيرادات المجمعة</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{scaledRevenueIQD.toLocaleString()} د.ع</span>
            </div>
            <div className={`border p-4 rounded-2xl text-center ${scaledProfitIQD >= 0 ? "bg-emerald-950/40 border-emerald-500/40" : "bg-red-950/40 border-red-500/40"}`}>
              <span className="text-[10px] text-white/60 block font-bold">صافي الأرباح المتوقعة</span>
              <span className="text-2xl font-mono font-black text-white">{scaledProfitIQD.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 4. BREAK-EVEN CALCULATOR */}
      {activeTab === "breakeven" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة نقطة التعادل مقفلة في النسخة التجريبية</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                حاسبة تحديد عدد الشحنات المطلوبة لتغطية المصاريف الثابتة متاح للحسابات الكاملة.
              </p>
            </div>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>ترقية الحساب وفتح الآلة الحاسبة ⚡</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <h4 className="text-xl font-bold text-[#F0C040]">حاسبة نقطة التعادل الشهرية (Break-Even Orders)</h4>
          <p className="text-xs md:text-sm text-white/70">
            كم عدد الطلبات الواجب بيعها وتسليمها شهرياً لتغطي كافة التكاليف الثابتة (رواتب، إيجار، اشتراكات، إعلانات) وتصل لـ 0$ خسارة؟
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">إجمالي المصاريف الثابتة شهرياً (د.ع)</label>
                <input
                  type="number"
                  step="50000"
                  value={breakEvenInputs.fixedCostsIQD}
                  onChange={(e) => setBreakEvenInputs({ ...breakEvenInputs, fixedCostsIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">ربح القطعة الواحدة قبل المصاريف الثابتة (د.ع)</label>
                <input
                  type="number"
                  step="1000"
                  value={breakEvenInputs.unitContributionMarginIQD}
                  onChange={(e) => setBreakEvenInputs({ ...breakEvenInputs, unitContributionMarginIQD: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0F1A42] to-[#040B24] border border-[#D4A017]/40 rounded-3xl p-6 text-center flex flex-col justify-center space-y-3">
              <span className="text-xs text-white/60 font-bold uppercase">عدد الطلبات المطلوبة لنقطة التعادل</span>
              <span className="text-5xl font-mono font-black text-[#F0C040]">{breakEvenOrdersRequired} <span className="text-base text-white/60">طلب/شهرياً</span></span>
              <span className="text-xs text-white/70">أي بمعدل حوالي {Math.ceil(breakEvenOrdersRequired / 30)} طلبات يومياً.</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 5. MARGIN OPTIMIZER (50/30/20) */}
      {activeTab === "margin" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">مطور الهوامش 50/30/20 مقفل في النسخة التجريبية</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                أداة تقسيم الهوامش وحساب كلفة الشراء والإعلانات وصافي الربح ممتلكات كاملة.
              </p>
            </div>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>ترقية الحساب والوصول الفوري ⚡</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <h4 className="text-xl font-bold text-[#F0C040]">مطور ومحسّن الهوامش المالية (قاعدة 50/30/20)</h4>
          <p className="text-xs md:text-sm text-white/70">
            أدخل سعر البيع المستهدف لترى كيف يجب توزيع الميزانية بين كلفة المنتج والشحن والإعلانات والصافي.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-white/80 block">سعر البيع المستهدف للزبون (د.ع)</label>
            <input
              type="number"
              step="1000"
              value={marginSellingPrice}
              onChange={(e) => setMarginSellingPrice(Number(e.target.value))}
              className="w-full max-w-xs bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-blue-950/40 border border-blue-500/30 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-blue-300 block mb-1">50% كلفة الشراء والتغليف والشحن</span>
              <span className="text-2xl font-mono font-black text-white">{targetCogs.toLocaleString()} د.ع</span>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-300 block mb-1">30% حد الأقصى لكلفة الإعلان (CPA)</span>
              <span className="text-2xl font-mono font-black text-white">{targetAds.toLocaleString()} د.ع</span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-300 block mb-1">20% صافي أرباح خالص لك</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{targetNetProfit.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 6. RETURN RATE IMPACT */}
      {activeTab === "returns" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-[#D4A017]/40 text-center space-y-4 shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة أثر خفض المرتجع مقفلة في النسخة التجريبية</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                احسب المبالغ المستردة عند خفض المرتجع لـ 6%. متاح في الاشتراك الكامل.
              </p>
            </div>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>ترقية الحساب وفتح الحسبة الآن ⚡</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <h4 className="text-xl font-bold text-[#F0C040]">حاسبة أثر خفض المرتجع على الأرباح الصافية</h4>
          <p className="text-xs md:text-sm text-white/70">
            اكتشف كم من الأموال المهدورة يمكنك استعادتها فوراً عند تطبيق تكتيكات المكالمة الذهبية وتقليص المرتجع.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">إجمالي الشحنات الشهرية</label>
                <input
                  type="number"
                  value={returnRateInputs.monthlyOrders}
                  onChange={(e) => setReturnRateInputs({ ...returnRateInputs, monthlyOrders: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">نسبة المرتجع الحالية (%)</label>
                <input
                  type="number"
                  value={returnRateInputs.currentReturnRatePct}
                  onChange={(e) => setReturnRateInputs({ ...returnRateInputs, currentReturnRatePct: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">النسبة المستهدفة بعد تطبيق الدليل (%)</label>
                <input
                  type="number"
                  value={returnRateInputs.targetReturnRatePct}
                  onChange={(e) => setReturnRateInputs({ ...returnRateInputs, targetReturnRatePct: Number(e.target.value) })}
                  className="w-full bg-[#040B24] border border-white/15 rounded-xl p-3 text-white font-mono text-sm text-left dir-ltr"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-[#040B24] border border-emerald-500/40 rounded-3xl p-6 text-center flex flex-col justify-center space-y-4">
              <span className="text-xs text-emerald-300 font-bold uppercase">الأرباح المكتسبة والأموال الموفرة شهرياً</span>
              <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400">
                {monthlySavingsIQD.toLocaleString()} <span className="text-base text-white/70">د.ع</span>
              </span>
              <p className="text-xs text-white/70">
                تقليص المرتجع يمنع ضياع <span className="text-[#F0C040] font-bold">{savedReturnsCount} شحنات</span> مهدورة شهرياً ويعيدها لأرباحك المباشرة!
              </p>
            </div>
          </div>
        </div>
        )
      )}

    </div>
  );
}
