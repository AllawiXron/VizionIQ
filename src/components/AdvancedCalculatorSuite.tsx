/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NumberField } from "./ui/NumberField";
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
    exchangeRate: 1490
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
  const cpaIQD = orders > 0 ? Math.round(totalSpendIQD / orders) : 0;

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
    <div className="vizion-calculator-suite glass-subtle border rounded-3xl sm:rounded-4xl p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="vz-eyebrow text-xs mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>6 حاسبات</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">احسبها قبل لا تقرر</h3>
        </div>
        <p className="text-xs md:text-sm text-white/60 max-w-md leading-relaxed">
          اختار الحاسبة وغيّر الأرقام حسب مشروعك، والنتيجة تتحدث وياك مباشرة.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="vizion-calculator-tabs -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "roas", label: "ربح الحملة", icon: TrendingUp },
          { id: "ltv", label: "قيمة الزبون", icon: DollarSign },
          { id: "scaling", label: "إذا زدت الميزانية", icon: BarChart3 },
          { id: "breakeven", label: "نقطة التعادل", icon: PieChart },
          { id: "margin", label: "تقسيم السعر 50/30/20", icon: Layers },
          { id: "returns", label: "أثر تقليل الراجع", icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button               key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer border ${ isActive ? "bg-vz-blue text-white border-white/35 shadow-lg md:shadow-black/40 shadow-xl/20 font-black" : "bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. ROAS & NET PROFIT CALCULATOR */}
      {activeTab === "roas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Controls Inputs */}
          <div className="lg:col-span-7 order-2 lg:order-1 bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
            <h4 className="text-lg font-bold text-vz-accent flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span>أرقام الحملة (الإعلان بالدولار، والباقي بالدينار)</span>
            </h4>

            <div className="grid grid-cols-1 gap-y-5 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">ميزانية الإعلان باليوم</label>
                <div className="w-full">
  <NumberField className="w-full" value={roasInputs.budgetUSD} onChange={(v) => setRoasInputs({ ...roasInputs, budgetUSD: v })} unit="$" step={5} />
</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">نسبة النقر (CTR)</label>
                <div className="w-full">
  <NumberField className="w-full" value={roasInputs.ctr} onChange={(v) => setRoasInputs({ ...roasInputs, ctr: v })} unit="%" min={0} max={100} step={0.1} />
</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">كلفة القطعة عليك</label>
                <NumberField className="w-full" value={roasInputs.productCostIQD} onChange={(v) => setRoasInputs({ ...roasInputs, productCostIQD: v })} unit="د.ع" step={500} />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">سعر البيع للزبون</label>
                <NumberField className="w-full" value={roasInputs.sellingPriceIQD} onChange={(v) => setRoasInputs({ ...roasInputs, sellingPriceIQD: v })} unit="د.ع" step={1000} />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">كروة التوصيل</label>
                <NumberField className="w-full" value={roasInputs.shippingCostIQD} onChange={(v) => setRoasInputs({ ...roasInputs, shippingCostIQD: v })} unit="د.ع" step={500} />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/70 block font-medium">نسبة الطلبات الواصلة</label>
                <div className="w-full">
  <NumberField className="w-full" value={roasInputs.deliveryRatePct} onChange={(v) => setRoasInputs({ ...roasInputs, deliveryRatePct: v })} unit="%" min={0} max={100} step={1} />
</div>
              </div>
            </div>
          </div>

          {/* Dynamic Results Display */}
          <div className="lg:col-span-5 order-1 lg:order-2 sticky top-4 glass border rounded-3xl p-6 space-y-6">
            <h4 className="text-vz-accent font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3">
              النتيجة باليوم
            </h4>

            <div className="grid grid-cols-1 gap-y-5 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">كل دولار إعلان يرجع (ROAS)</span>
                <span className={`text-3xl font-mono font-black ${Number(roasVal) >= 3 ? "text-emerald-400" : Number(roasVal) >= 2 ? "text-vz-accent" : "text-red-400"}`}>
                  {roasVal}x
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">كلفة الطلب من الإعلان</span>
                <span className="text-3xl font-mono font-black text-vz-accent">
                  {cpaIQD.toLocaleString("en-US")} <span className="text-xs text-white/70">د.ع</span>
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">الطلبات الواصلة من الكلية</span>
                <span className="text-2xl font-mono font-black text-white">
                  {deliveredOrders} / {orders} <span className="text-xs text-white/70">طلب</span>
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-white/60 block font-bold">الفلوس اللي تدخل</span>
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
              <span className="text-xs font-bold block">صافي الربح باليوم بعد كل المصاريف</span>
              <span className="text-3xl font-mono font-black tracking-tight">
                {netProfitIQD.toLocaleString()} د.ع
              </span>
              <span className="text-[10px] block opacity-80 dir-rtl">
                {netProfitIQD >= 0 ? "الحملة رابحة بهالأرقام" : "الحملة خسرانة: كلفة الإعلان عالية أو الهامش قليل"}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. LTV CALCULATOR */}
      {activeTab === "ltv" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl glass border text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة قيمة الزبون مقفولة بالتجربة</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                تعرف بيها شكد يسوى الزبون اللي يرجع يشتري منك. تنفتح ويا الاشتراك الكامل.
              </p>
            </div>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح الحاسبة</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
          <h4 className="text-xl font-bold text-vz-accent">شكد يسوى الزبون الواحد على المدى (LTV)</h4>
          <p className="text-xs md:text-sm text-white/70">
            الزبون اللي يرجع يشتري يسوى أكثر من أول طلب. هنا شكد يطلعلك ربح منه على المدى.
          </p>

          <div className="grid grid-cols-1 gap-y-5 gap-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">معدل قيمة الطلب</label>
                <div className="w-full">
  <NumberField className="w-full" value={ltvInputs.aovIQD} onChange={(v) => setLtvInputs({ ...ltvInputs, aovIQD: v })} unit="د.ع" step={1000} />
</div>
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">كم مرة يشتري الزبون بالسنة</label>
                <NumberField className="w-full" value={ltvInputs.purchaseFreqPerYear} onChange={(v) => setLtvInputs({ ...ltvInputs, purchaseFreqPerYear: v })} unit="مرة" step={1} />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">كم سنة يبقى يشتري منك</label>
                <NumberField className="w-full" value={ltvInputs.lifespanYears} onChange={(v) => setLtvInputs({ ...ltvInputs, lifespanYears: v })} unit="سنة" step={1} />
              </div>
            </div>

            <div className="glass border rounded-3xl p-6 flex flex-col justify-between text-center space-y-4">
              <span className="text-xs text-white/60 font-bold uppercase tracking-wider">ربحك من الزبون الواحد على المدى</span>
              <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400 drop-shadow-md">
                {ltvValueIQD.toLocaleString()} <span className="text-base text-white/70">د.ع</span>
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                يعني تكدر تصرف لحد <span className="text-vz-accent font-bold">{(ltvValueIQD * 0.25).toLocaleString()} د.ع</span> إعلان حتى تجيب هالزبون أول مرة، وتبقى رابح من رجعته.
              </p>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 3. SCALING SIMULATOR */}
      {activeTab === "scaling" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl glass border text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة زيادة الميزانية مقفولة بالتجربة</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                تشوف بيها شنو يصير بربحك إذا زدت ميزانية الإعلان. تنفتح ويا الاشتراك الكامل.
              </p>
            </div>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح الحاسبة</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
          <h4 className="text-xl font-bold text-vz-accent">إذا زدت الميزانية، شنو يصير بربحك؟</h4>
          <p className="text-xs md:text-sm text-white/70">
            إذا زدت صرف الإعلان {scalePct}%، الطلبات ما تزيد بنفس النسبة لأن الإعلان يغلى شوية كل ما تكبّر. هنا الحسبة الواقعية.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white/80">
              <span>الزيادة بالميزانية: +{scalePct}%</span>
              <span>الميزانية الجديدة: {scaledSpendUSD.toFixed(0)}$ باليوم</span>
            </div>
            <div className="w-full">
  <NumberField className="w-full" value={scalePct} onChange={(v) => setScalePct(v)} unit="%" step={5} />
</div>
          </div>

          <div className="grid grid-cols-1 gap-y-5 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-white/60 block font-bold">الطلبات الواصلة باليوم</span>
              <span className="text-3xl font-mono font-black text-white">{scaledDelivered} طلب</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-white/60 block font-bold">الإيرادات المجمعة</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{scaledRevenueIQD.toLocaleString()} د.ع</span>
            </div>
            <div className={`border p-4 rounded-2xl text-center ${scaledProfitIQD >= 0 ? "bg-emerald-950/40 border-emerald-500/40" : "bg-red-950/40 border-red-500/40"}`}>
              <span className="text-[10px] text-white/60 block font-bold">صافي الربح باليوم</span>
              <span className="text-2xl font-mono font-black text-white">{scaledProfitIQD.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 4. BREAK-EVEN CALCULATOR */}
      {activeTab === "breakeven" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl glass border text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة نقطة التعادل مقفولة بالتجربة</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                تعرف بيها كم طلب لازم تبيع بالشهر حتى تغطي مصاريفك الثابتة. تنفتح ويا الاشتراك الكامل.
              </p>
            </div>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح الحاسبة</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
          <h4 className="text-xl font-bold text-vz-accent">كم طلب لازم تبيع بالشهر حتى ما تخسر؟</h4>
          <p className="text-xs md:text-sm text-white/70">
            المصاريف الثابتة (رواتب، إيجار، اشتراكات) تندفع حتى لو ما بعت شي. هنا كم طلب واصل تحتاج حتى تغطيها.
          </p>

          <div className="grid grid-cols-1 gap-y-5 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">مصاريفك الثابتة بالشهر</label>
                <div className="w-full">
  <NumberField className="w-full" value={breakEvenInputs.fixedCostsIQD} onChange={(v) => setBreakEvenInputs({ ...breakEvenInputs, fixedCostsIQD: v })} unit="د.ع" step={10000} />
</div>
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">ربح الطلب الواحد بعد الإعلان والتوصيل</label>
                <NumberField className="w-full" value={breakEvenInputs.unitContributionMarginIQD} onChange={(v) => setBreakEvenInputs({ ...breakEvenInputs, unitContributionMarginIQD: v })} unit="د.ع" step={500} />
              </div>
            </div>

            <div className="glass border rounded-3xl p-6 text-center flex flex-col justify-center space-y-3">
              <span className="text-xs text-white/60 font-bold uppercase">الطلبات اللي تحتاجها بالشهر</span>
              <span className="text-5xl font-mono font-black text-vz-accent">{breakEvenOrdersRequired} <span className="text-base text-white/60">طلب بالشهر</span></span>
              <span className="text-xs text-white/70">يعني تقريباً {Math.ceil(breakEvenOrdersRequired / 30)} طلب باليوم. أي طلب فوق هذا ربح.</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 5. MARGIN OPTIMIZER (50/30/20) */}
      {activeTab === "margin" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl glass border text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة تقسيم السعر مقفولة بالتجربة</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                تقسم بيها سعر البيع على الكلفة والإعلان والربح. تنفتح ويا الاشتراك الكامل.
              </p>
            </div>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح الحاسبة</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
          <h4 className="text-xl font-bold text-vz-accent">تقسيم السعر: قاعدة 50/30/20</h4>
          <p className="text-xs md:text-sm text-white/70">
            اكتب سعر البيع، وتطلعلك الحدود: شكد تكدر تصرف على المنتج والتوصيل، وشكد على الإعلان، وشكد يبقالك ربح.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-white/80 block">سعر البيع للزبون</label>
            <NumberField className="w-full" value={marginSellingPrice} onChange={(v) => setMarginSellingPrice(v)} unit="د.ع" step={1000} />
          </div>

          <div className="grid grid-cols-1 gap-y-5 gap-4 pt-2">
            <div className="bg-slate-900/40 border border-white/14 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-slate-200 block mb-1">50% المنتج والتغليف والتوصيل</span>
              <span className="text-2xl font-mono font-black text-white">{targetCogs.toLocaleString()} د.ع</span>
            </div>

            <div className="bg-slate-900/40 border border-white/14 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-vz-accent block mb-1">30% أعلى كلفة إعلان للطلب</span>
              <span className="text-2xl font-mono font-black text-white">{targetAds.toLocaleString()} د.ع</span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-300 block mb-1">20% ربحك الصافي</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{targetNetProfit.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 6. RETURN RATE IMPACT */}
      {activeTab === "returns" && (
        isFreeTrial ? (
          <div className="p-8 rounded-3xl glass border text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">حاسبة الراجع مقفولة بالتجربة</h4>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                تحسب بيها شكد ترجعلك فلوس إذا قللت الراجع. تنفتح ويا الاشتراك الكامل.
              </p>
            </div>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح الحاسبة</span>
            </button>
          </div>
        ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
          <h4 className="text-xl font-bold text-vz-accent">إذا قللت الراجع، شكد ترجعلك فلوس؟</h4>
          <p className="text-xs md:text-sm text-white/70">
            بمكالمة التأكيد والفحص كدام المندوب ينزل الراجع. هنا شكد يرجعلك بالشهر.
          </p>

          <div className="grid grid-cols-1 gap-y-5 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/80 block mb-1">طلباتك بالشهر</label>
                <div className="w-full">
  <NumberField className="w-full" value={returnRateInputs.monthlyOrders} onChange={(v) => setReturnRateInputs({ ...returnRateInputs, monthlyOrders: v })} unit="طلب" step={10} />
</div>
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">نسبة الراجع هسه</label>
                <NumberField className="w-full" value={returnRateInputs.currentReturnRatePct} onChange={(v) => setReturnRateInputs({ ...returnRateInputs, currentReturnRatePct: v })} unit="%" min={0} max={100} step={1} />
              </div>

              <div>
                <label className="text-xs text-white/80 block mb-1">النسبة اللي تريد توصلها</label>
                <NumberField className="w-full" value={returnRateInputs.targetReturnRatePct} onChange={(v) => setReturnRateInputs({ ...returnRateInputs, targetReturnRatePct: v })} unit="%" min={0} max={100} step={1} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-[#040e33] border border-emerald-500/40 rounded-3xl p-6 text-center flex flex-col justify-center space-y-4">
              <span className="text-xs text-emerald-300 font-bold uppercase">اللي يرجعلك بالشهر</span>
              <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400">
                {monthlySavingsIQD.toLocaleString()} <span className="text-base text-white/70">د.ع</span>
              </span>
              <p className="text-xs text-white/70">
                يعني <span className="text-vz-accent font-bold">{savedReturnsCount} طلب</span> أقل يرجع بالشهر، وكروتها وخسارتها تبقى بجيبك.
              </p>
            </div>
          </div>
        </div>
        )
      )}

    </div>
  );
}
