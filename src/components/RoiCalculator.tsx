/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Calculator, DollarSign, ArrowRightLeft, TrendingUp, Info } from "lucide-react";
import { CalculatorInputs, CalculatorResults } from "../types";

export default function RoiCalculator() {
  const [currency, setCurrency] = useState<"USD" | "IQD">("USD");
  const exchangeRate = 1450; // 1 USD = 1450 IQD

  const [inputs, setInputs] = useState<CalculatorInputs>({
    budget: 300,
    cpm: 2.5,
    ctr: 2.1,
    cvr: 1.5,
    productCost: 6,
    shippingCost: 3.5,
    sellingPrice: 25,
    deliveryRate: 70
  });

  const [results, setResults] = useState<CalculatorResults>({
    impressions: 0,
    clicks: 0,
    orders: 0,
    deliveredOrders: 0,
    cpc: 0,
    cpa: 0,
    totalSpend: 0,
    productSourcingCost: 0,
    shippingCostTotal: 0,
    revenue: 0,
    netProfit: 0,
    roi: 0
  });

  const handleInputChange = (key: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Convert values based on current active currency selection
  const formatValue = (value: number, isCurrency: boolean = true) => {
    if (!isCurrency) return value.toLocaleString("ar-IQ");
    if (currency === "IQD") {
      return (value * exchangeRate).toLocaleString("ar-IQ") + " د.ع";
    }
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  useEffect(() => {
    const budget = inputs.budget;
    const cpm = inputs.cpm;
    const ctr = inputs.ctr / 100;
    const cvr = inputs.cvr / 100;
    const productCost = inputs.productCost;
    const shippingCost = inputs.shippingCost;
    const sellingPrice = inputs.sellingPrice;
    const deliveryRate = inputs.deliveryRate / 100;

    // 1. Calculate Impressions (Budget / CPM * 1000)
    const impressions = cpm > 0 ? (budget / cpm) * 1000 : 0;

    // 2. Calculate Clicks (Impressions * CTR)
    const clicks = impressions * ctr;

    // 3. Calculate Orders (Clicks * CVR)
    const orders = Math.floor(clicks * cvr);

    // 4. Delivered Orders (Orders * Delivery Success Rate)
    const deliveredOrders = Math.floor(orders * deliveryRate);

    // 5. Cost Per Click (CPC) (Budget / Clicks)
    const cpc = clicks > 0 ? budget / clicks : 0;

    // 6. Cost Per Order (CPA) (Budget / Orders)
    const cpa = orders > 0 ? budget / orders : 0;

    // 7. Costs breakdown
    const productSourcingCost = deliveredOrders * productCost;
    // In Iraq, failed delivery still costs shipping, usually a return penalty of around $1.5
    const failedOrders = orders - deliveredOrders;
    const returnCostPenalty = 1.5; // average return penalty per package in Iraq
    const shippingCostTotal = (deliveredOrders * shippingCost) + (failedOrders * returnCostPenalty);

    // 8. Total revenue (Delivered * Selling Price)
    const revenue = deliveredOrders * sellingPrice;

    // 9. Net Profit
    const netProfit = revenue - budget - productSourcingCost - shippingCostTotal;

    // 10. ROI / ROAS
    const roi = budget > 0 ? (netProfit / budget) * 100 : 0;

    setResults({
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      orders,
      deliveredOrders,
      cpc,
      cpa,
      totalSpend: budget,
      productSourcingCost,
      shippingCostTotal,
      revenue,
      netProfit,
      roi
    });
  }, [inputs]);

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden" id="roi-calculator">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center border border-[#D4A017]/20 flex-shrink-0">
            <Calculator className="w-5 h-5 text-[#F0C040]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight">📊 احسب أرباحك وخسائرك المتوقعة قبل ما تطلق الحملة وتعرف إذا تستاهل تصرف عليها أو لا</h3>
            <p className="text-[10px] sm:text-xs text-white/50 mt-1">أدخل تكاليف منتجك والشحن والترويج مسبقاً، واحمِ رأس مالك من الحملات الفاشلة في السوق العراقي</p>
          </div>
        </div>

        {/* Currency Switcher */}
        <button
          onClick={() => setCurrency(currency === "USD" ? "IQD" : "USD")}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs text-[#F0C040] transition-all cursor-pointer font-medium w-full sm:w-auto justify-center"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>تغيير العملة: {currency === "USD" ? "الدينار العراقي (IQD)" : "الدولار الأمريكي ($)"}</span>
        </button>
      </div>

      {/* Grid Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Inputs (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-sm font-semibold text-[#F0C040] flex items-center gap-2 mb-2">
            ⚙️ مدخلات حملتك التجريبية ({currency === "USD" ? "بالدولار" : "بالدينار العراقي"})
          </h4>

          {/* Input: Budget */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">الميزانية الإعلانية الإجمالية</span>
              <span className="text-[#F0C040] font-mono">{formatValue(inputs.budget)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="10"
              value={inputs.budget}
              onChange={(e) => handleInputChange("budget", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: CPM */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">تكلفة الألف ظهور (CPM)</span>
              <span className="text-[#F0C040] font-mono">{formatValue(inputs.cpm)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={inputs.cpm}
              onChange={(e) => handleInputChange("cpm", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: CTR */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">نسبة النقر إلى الظهور (CTR)</span>
              <span className="text-[#F0C040] font-mono">{inputs.ctr}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5"
              step="0.1"
              value={inputs.ctr}
              onChange={(e) => handleInputChange("ctr", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: CVR */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">معدل التحويل للمتجر (CVR)</span>
              <span className="text-[#F0C040] font-mono">{inputs.cvr}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="6"
              step="0.1"
              value={inputs.cvr}
              onChange={(e) => handleInputChange("cvr", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: Product Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">تكلفة شراء السلعة (سعر الجملة)</span>
              <span className="text-[#F0C040] font-mono">{formatValue(inputs.productCost)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="0.5"
              value={inputs.productCost}
              onChange={(e) => handleInputChange("productCost", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: Shipping Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">تكلفة شحن وتوصيل الطرد الفردي</span>
              <span className="text-[#F0C040] font-mono">{formatValue(inputs.shippingCost)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={inputs.shippingCost}
              onChange={(e) => handleInputChange("shippingCost", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: Selling Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">سعر بيع السلعة النهائي للزبون</span>
              <span className="text-[#F0C040] font-mono">{formatValue(inputs.sellingPrice)}</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="1"
              value={inputs.sellingPrice}
              onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value))}
              className="w-full accent-[#D4A017] cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Input: Delivery Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/70 font-medium">نسبة نجاح التسليم والاستلام (Delivery Success)</span>
              <span className="text-emerald-400 font-bold">{inputs.deliveryRate}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="1"
              value={inputs.deliveryRate}
              onChange={(e) => handleInputChange("deliveryRate", parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>
        </div>

        {/* Results (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Main Profit Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 left-0 w-2 h-full gold-gradient-bg" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-white/50 block font-semibold uppercase tracking-wider">صافي الأرباح المتوقعة</span>
                <span className={`text-4xl md:text-5xl font-black mt-2 inline-block tracking-tight ${results.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatValue(results.netProfit)}
                </span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${results.netProfit >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>العائد ROI: {results.roi.toFixed(1)}%</span>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3">
              <Info className="w-3.5 h-3.5 text-[#F0C040]" />
              <span>* تم خصم {formatValue(results.shippingCostTotal)} مصاريف شحن وتسوية طرود مرتجعة (بمعدل غرامة $1.5 للطرد المسترجع).</span>
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-white/50 block font-semibold">إجمالي عدد النقرات</span>
              <span className="text-lg font-bold text-white mt-1 block font-mono">{results.clicks.toLocaleString("ar-IQ")}</span>
              <span className="text-[10px] text-white/45 block mt-0.5">تكلفة النقرة CPC: {formatValue(results.cpc)}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-white/50 block font-semibold">الطلبات الكلية بالمتجر</span>
              <span className="text-lg font-bold text-[#F0C040] mt-1 block font-mono">{results.orders} طلب</span>
              <span className="text-[10px] text-white/45 block mt-0.5">تكلفة الاستحواذ CPA: {formatValue(results.cpa)}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-white/50 block font-semibold">الطرود المستلمة فعلياً</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block font-mono">{results.deliveredOrders} طرد</span>
              <span className="text-[10px] text-emerald-400/70 block mt-0.5">نسبة استلام: {inputs.deliveryRate}%</span>
            </div>

          </div>

          {/* Details Cost Breakdown Sheet */}
          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3 text-xs">
            <h5 className="text-xs font-bold text-[#F0C040] border-b border-white/5 pb-2">📊 قائمة الدخل والتدفق المالي المتوقع:</h5>
            
            <div className="flex justify-between">
              <span className="text-white/60">إجمالي المبيعات والإيرادات (Revenue):</span>
              <span className="text-emerald-400 font-bold font-mono">{formatValue(results.revenue)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">تكلفة الترويج الإعلاني (Facebook Ads Spend):</span>
              <span className="text-red-400 font-medium font-mono">-{formatValue(results.totalSpend)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">تكلفة شراء المنتجات المستلمة (Sourcing Cost):</span>
              <span className="text-red-400 font-medium font-mono">-{formatValue(results.productSourcingCost)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">تكلفة الشحن لشركات الشحن + غرامة المرتجعات:</span>
              <span className="text-red-400 font-medium font-mono">-{formatValue(results.shippingCostTotal)}</span>
            </div>

            <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
              <span className="text-[#F0C040]">الربح الصافي النهائي (Net Income):</span>
              <span className={`font-mono text-sm ${results.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatValue(results.netProfit)}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
