import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Truck,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";
import { BusinessDiagnosticProfile, DiagnosticMetrics } from "../types";
import {
  validateDiagnosticNumericInput,
  calculateDiagnosticMetrics,
  formatIQD,
  normalizeIraqiNumericInput,
} from "../utils/diagnosticCalculator";

interface BusinessDiagnosticStepperProps {
  onComplete: (profile: BusinessDiagnosticProfile, metrics: DiagnosticMetrics) => void;
  onCancel?: () => void;
  initialProfile?: Partial<BusinessDiagnosticProfile>;
  storageKey?: string;
}

const BUSINESS_TYPES = [
  { id: "fashion", label: "ملابس وأزياء وأحذية", icon: "👗" },
  { id: "cosmetics", label: "تجميل، عناية وعطور", icon: "💄" },
  { id: "electronics", label: "إلكترونيات واكسسوارات", icon: "📱" },
  { id: "home", label: "منزل، مطبخ وديكور", icon: "🏠" },
  { id: "supplements", label: "مكملات وصحة ولياقة", icon: "💊" },
  { id: "watches_accessories", label: "ساعات وهدايا واكسسوارات", icon: "⌚" },
  { id: "services", label: "خدمات / دورات / رقمية", icon: "💡" },
  { id: "other", label: "مجال تجاري آخر", icon: "📦" },
];

const SALES_CHANNELS = [
  { id: "instagram", label: "انستغرام ديركت (Instagram)", icon: "📸" },
  { id: "facebook", label: "فيسبوك ماسنجر (Facebook)", icon: "💬" },
  { id: "whatsapp", label: "واتساب بزنس (WhatsApp)", icon: "🟢" },
  { id: "website", label: "متجر إلكتروني / صفحة هبوط", icon: "🌐" },
  { id: "multi", label: "قنوات متعددة بالتوازي", icon: "🔄" },
];

const DELIVERY_AREAS = [
  { id: "all_iraq", label: "كل محافظات العراق (بغداد + 17 محافظة)" },
  { id: "baghdad_only", label: "بغداد وضواحيها فقط" },
  { id: "baghdad_and_center", label: "بغداد والفرات الأوسط" },
  { id: "kurdistan", label: "إقليم كردستان فقط" },
  { id: "south", label: "المحافظات الجنوبية فقط" },
];

const MAIN_PROBLEMS = [
  {
    id: "high_cpa",
    title: "رسائل كثيرة لكن ماكو مبيعات (ضعف الإغلاق)",
    desc: "الزبائن يستفسرون عن السعر ويختفون دون تأكيد الطلب.",
    icon: "🎯",
  },
  {
    id: "ad_cost",
    title: "كلفة الرسالة بالإعلانات مرتفعة جداً (CPA عالي)",
    desc: "الإعلانات تستهلك الميزانية بدون نتائج كافية.",
    icon: "💸",
  },
  {
    id: "high_returns",
    title: "نسبة المرتجعات والراجع عالية بالمحافظات",
    desc: "الطلبات تخرج وتعود راجعة بنسبة تتجاوز 20%-30%.",
    icon: "🚚",
  },
  {
    id: "low_margin",
    title: "هامش الربح ضعيف بعد خصم التوصيل والإعلانات",
    desc: "مبيعات موجودة لكن صافي الربح الحقيقي في نهاية الشهر قليل.",
    icon: "📉",
  },
  {
    id: "scaling",
    title: "صعوبة التوسع وزيادة الميزانية الإعلانية",
    desc: "كلما أرفع الميزانية تخرب النتائج وترتفع التكلفة.",
    icon: "🚀",
  },
  {
    id: "other_problem",
    title: "تحدي آخر يحتاج استشارة مخصصة",
    desc: "أريد تشخيصاً شاملاً لجميع أجزاء مشروعي.",
    icon: "💡",
  },
];

export const BusinessDiagnosticStepper: React.FC<BusinessDiagnosticStepperProps> = ({
  onComplete,
  onCancel,
  initialProfile,
  storageKey = "vizion_user_business_profile",
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form Profile State
  const [businessType, setBusinessType] = useState<string>(initialProfile?.businessType || "fashion");
  const [productOrService, setProductOrService] = useState<string>(initialProfile?.productOrService || "");
  const [salesChannel, setSalesChannel] = useState<string>(initialProfile?.salesChannel || "instagram");
  const [sellingPriceStr, setSellingPriceStr] = useState<string>(
    initialProfile?.sellingPrice ? String(initialProfile.sellingPrice) : ""
  );
  const [productCostStr, setProductCostStr] = useState<string>(
    initialProfile?.productCost ? String(initialProfile.productCost) : ""
  );
  const [dailyMessagesStr, setDailyMessagesStr] = useState<string>(
    initialProfile?.dailyMessages ? String(initialProfile.dailyMessages) : ""
  );
  const [dailyOrdersStr, setDailyOrdersStr] = useState<string>(
    initialProfile?.dailyOrders ? String(initialProfile.dailyOrders) : ""
  );
  const [returnRateStr, setReturnRateStr] = useState<string>(
    initialProfile?.returnRate ? String(initialProfile.returnRate) : ""
  );
  const [deliveryAreas, setDeliveryAreas] = useState<string>(
    initialProfile?.deliveryAreas || "كل محافظات العراق (بغداد + 17 محافظة)"
  );
  const [mainProblem, setMainProblem] = useState<string>(
    initialProfile?.mainProblem || "رسائل كثيرة لكن ماكو مبيعات (ضعف الإغلاق)"
  );
  const [notes, setNotes] = useState<string>(initialProfile?.notes || "");

  // Load saved profile on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessType) setBusinessType(parsed.businessType);
        if (parsed.productOrService) setProductOrService(parsed.productOrService);
        if (parsed.salesChannel) setSalesChannel(parsed.salesChannel);
        if (parsed.sellingPrice) setSellingPriceStr(String(parsed.sellingPrice));
        if (parsed.productCost) setProductCostStr(String(parsed.productCost));
        if (parsed.dailyMessages) setDailyMessagesStr(String(parsed.dailyMessages));
        if (parsed.dailyOrders) setDailyOrdersStr(String(parsed.dailyOrders));
        if (parsed.returnRate) setReturnRateStr(String(parsed.returnRate));
        if (parsed.deliveryAreas) setDeliveryAreas(parsed.deliveryAreas);
        if (parsed.mainProblem) setMainProblem(parsed.mainProblem);
        if (parsed.notes) setNotes(parsed.notes);
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  // Derived numeric values for live calculation
  const parsedSellingPrice = normalizeIraqiNumericInput(sellingPriceStr);
  const parsedProductCost = normalizeIraqiNumericInput(productCostStr);
  const parsedDailyMessages = normalizeIraqiNumericInput(dailyMessagesStr);
  const parsedDailyOrders = normalizeIraqiNumericInput(dailyOrdersStr);
  const parsedReturnRate = normalizeIraqiNumericInput(returnRateStr);

  const currentMetrics = calculateDiagnosticMetrics({
    sellingPrice: parsedSellingPrice,
    productCost: parsedProductCost,
    dailyMessages: parsedDailyMessages,
    dailyOrders: parsedDailyOrders,
    returnRate: parsedReturnRate,
  });

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!productOrService.trim()) {
        errors.productOrService = "رجاءً كتابة اسم المنتج أو الخدمة باختصار (مثال: حقائب نسائية، ساعات رجالية).";
      }
    } else if (step === 2) {
      const priceVal = validateDiagnosticNumericInput(sellingPriceStr, "سعر البيع", { min: 1000 });
      if (!priceVal.isValid) {
        errors.sellingPrice = priceVal.error || "رجاءً إدخال سعر بيع صحيح بالدينار.";
      }

      const costVal = validateDiagnosticNumericInput(productCostStr, "كلفة المنتج", { min: 0 });
      if (!costVal.isValid) {
        errors.productCost = costVal.error || "رجاءً إدخال كلفة صحيحة للمنتج بالدينار.";
      }

      if (priceVal.isValid && costVal.isValid && priceVal.value !== null && costVal.value !== null) {
        if (costVal.value >= priceVal.value) {
          errors.productCost = "كلفة المنتج يجب أن تكون أقل من سعر البيع لتحقيق هامش ربح.";
        }
      }
    } else if (step === 3) {
      if (dailyMessagesStr.trim()) {
        const msgVal = validateDiagnosticNumericInput(dailyMessagesStr, "عدد الرسائل", { min: 0 });
        if (!msgVal.isValid) errors.dailyMessages = msgVal.error!;
      }
      if (dailyOrdersStr.trim()) {
        const orderVal = validateDiagnosticNumericInput(dailyOrdersStr, "عدد الطلبات", { min: 0 });
        if (!orderVal.isValid) errors.dailyOrders = orderVal.error!;
      }
      if (returnRateStr.trim()) {
        const retVal = validateDiagnosticNumericInput(returnRateStr, "نسبة المرتجعات", { min: 0, max: 100 });
        if (!retVal.isValid) errors.returnRate = retVal.error!;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit();
      }
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    const profile: BusinessDiagnosticProfile = {
      businessType,
      productOrService: productOrService.trim(),
      salesChannel,
      sellingPrice: parsedSellingPrice,
      productCost: parsedProductCost,
      dailyMessages: parsedDailyMessages,
      dailyOrders: parsedDailyOrders,
      returnRate: parsedReturnRate,
      deliveryAreas,
      mainProblem,
      notes: notes.trim(),
    };

    // Save profile locally
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch {
      // Storage safe ignore
    }

    onComplete(profile, currentMetrics);
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="vizion-diagnostic-stepper flex flex-col h-full max-h-[85vh] bg-[#0A101D] text-slate-100 rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-b border-amber-500/20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300">
                شخّص مشروعك مع مستشار فيزيون
              </h2>
              <p className="text-xs text-slate-400">
                تشخيص ذكي مبني على أرقام وسيكولوجية السوق العراقي
              </p>
            </div>
          </div>
          {onCancel && (
            <button               onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            >
              إلغاء والعودة للمحادثة
            </button>
          )}
        </div>

        {/* Progress Bar & Stepper Indicators */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>الخطوة {currentStep} من 4</span>
            <span>
              {currentStep === 1 && "هوية المشروع وقناة البيع"}
              {currentStep === 2 && "الأسعار والتكلفة بالدينار"}
              {currentStep === 3 && "الرسائل والطلبات والتوصيل"}
              {currentStep === 4 && "التحدي الأساسي للتشخيص"}
            </span>
            <span className="text-amber-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Body - Step Content */}
      <div className="vizion-diagnostic-body flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
        {/* Step 1: Business Identity & Sales Channel */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                1. ما هو مجال ونوع مشروعك التجاري؟
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUSINESS_TYPES.map((type) => {
                  const isSelected = businessType === type.label;
                  return (
                    <button                     
                      key={type.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setBusinessType(type.label)}
                      className={`p-3 rounded-xl border text-right transition flex flex-col items-start gap-1.5 relative ${ isSelected ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm" : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-2 right-2" />
                      )}
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs font-semibold">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="diag-product-service" className="block text-sm font-semibold text-slate-200 mb-1.5">
                2. ما هو المنتج أو الخدمة التي تبيعها حالياً؟ <span className="text-amber-400">*</span>
              </label>
              <input                 
                id="diag-product-service"
                type="text"
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                placeholder="مثال: فساتين نسائية تركية، ساعات يد ضد الماء، كوزمتك عناية بالبشرة..."
                aria-describedby={validationErrors.productOrService ? "diag-error-product" : undefined}
                aria-invalid={!!validationErrors.productOrService}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              />
              {validationErrors.productOrService && (
                <p id="diag-error-product" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {validationErrors.productOrService}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                3. ما هي قناة البيع واستقبال الزبائن الأساسية؟
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SALES_CHANNELS.map((ch) => {
                  const isSelected = salesChannel === ch.label;
                  return (
                    <button                     
                      key={ch.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSalesChannel(ch.label)}
                      className={`p-3 rounded-xl border text-right transition flex items-center gap-2.5 ${ isSelected ? "bg-amber-500/15 border-amber-400 text-amber-200" : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700" } min-h-[44px] min-w-[44px] flex items-center justify-between active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{ch.icon}</span>
                        <span className="text-xs font-medium">{ch.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Costs in IQD */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> التسعير بالدينار العراقي:
              </span>
              <p>
                أدخل الأرقام بالدينار (تكدر كتابة 25000 أو 25 ألف). سنحسب لك الهامش الإجمالي للقطعة فوراً.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diag-selling-price" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  متوسط سعر البيع للزبون (د.ع) <span className="text-amber-400">*</span>
                </label>
                <input                   
                  id="diag-selling-price"
                  type="text"
                  value={sellingPriceStr}
                  onChange={(e) => setSellingPriceStr(e.target.value)}
                  placeholder="مثال: 35000 د.ع أو 35 ألف"
                  aria-describedby={validationErrors.sellingPrice ? "diag-error-selling-price" : undefined}
                  aria-invalid={!!validationErrors.sellingPrice}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
                {parsedSellingPrice !== null && (
                  <p className="text-xs text-amber-300/90 mt-1">
                    القيمة المحسوبة: {formatIQD(parsedSellingPrice)}
                  </p>
                )}
                {validationErrors.sellingPrice && (
                  <p id="diag-error-selling-price" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validationErrors.sellingPrice}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="diag-product-cost" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  كلفة شراء أو تجهيز القطعة (د.ع) <span className="text-amber-400">*</span>
                </label>
                <input                   
                  id="diag-product-cost"
                  type="text"
                  value={productCostStr}
                  onChange={(e) => setProductCostStr(e.target.value)}
                  placeholder="مثال: 12000 د.ع أو 12 ألف"
                  aria-describedby={validationErrors.productCost ? "diag-error-product-cost" : undefined}
                  aria-invalid={!!validationErrors.productCost}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
                {parsedProductCost !== null && (
                  <p className="text-xs text-amber-300/90 mt-1">
                    القيمة المحسوبة: {formatIQD(parsedProductCost)}
                  </p>
                )}
                {validationErrors.productCost && (
                  <p id="diag-error-product-cost" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validationErrors.productCost}
                  </p>
                )}
              </div>
            </div>

            {/* Live Gross Margin Card */}
            {currentMetrics.grossMargin !== null && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    الهامش الإجمالي الأولي للقطعة (Gross Profit):
                  </span>
                  <span className="text-base font-bold text-amber-300">
                    {formatIQD(currentMetrics.grossMargin)} ({currentMetrics.grossMarginPercent}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>ملاحظة وفرضيات الحساب:</strong> هذا الهامش الإجمالي قبل خصم أجور التوصيل (5K-7K د.ع)، كلفة الإعلانات (CPA)، ونسبة المرتجعات.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Messages, Orders & Delivery Areas */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diag-daily-messages" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  كم رسالة أو استفسار يوصلك يومياً؟
                </label>
                <input                   
                  id="diag-daily-messages"
                  type="text"
                  value={dailyMessagesStr}
                  onChange={(e) => setDailyMessagesStr(e.target.value)}
                  placeholder="مثال: 30 رسالة/يوم"
                  aria-describedby={validationErrors.dailyMessages ? "diag-error-daily-messages" : undefined}
                  aria-invalid={!!validationErrors.dailyMessages}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
                {validationErrors.dailyMessages && (
                  <p id="diag-error-daily-messages" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1">{validationErrors.dailyMessages}</p>
                )}
              </div>

              <div>
                <label htmlFor="diag-daily-orders" className="block text-sm font-semibold text-slate-200 mb-1.5">
                  كم طلب مؤكد ومغلق يومياً تقريباً؟
                </label>
                <input                   
                  id="diag-daily-orders"
                  type="text"
                  value={dailyOrdersStr}
                  onChange={(e) => setDailyOrdersStr(e.target.value)}
                  placeholder="مثال: 3 طلبات/يوم"
                  aria-describedby={validationErrors.dailyOrders ? "diag-error-daily-orders" : undefined}
                  aria-invalid={!!validationErrors.dailyOrders}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
                {validationErrors.dailyOrders && (
                  <p id="diag-error-daily-orders" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1">{validationErrors.dailyOrders}</p>
                )}
              </div>
            </div>

            {/* Live Conversion Rate Preview */}
            {currentMetrics.conversionRate !== null && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">معدل تحويل الرسائل إلى طلبات:</span>
                  <span className="text-xs text-amber-400 font-semibold">{currentMetrics.conversionRateLabel}</span>
                </div>
                <span className="text-lg font-bold text-amber-300">
                  {currentMetrics.conversionRate}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="diag-return-rate" className="text-sm font-semibold text-slate-200">
                    نسبة المرتجعات (إن كنت تعرفها)
                  </label>
                  <span className="text-[11px] text-slate-500">اختياري</span>
                </div>
                <input                   
                  id="diag-return-rate"
                  type="text"
                  value={returnRateStr}
                  onChange={(e) => setReturnRateStr(e.target.value)}
                  placeholder="مثال: 15%"
                  aria-describedby={validationErrors.returnRate ? "diag-error-return-rate" : undefined}
                  aria-invalid={!!validationErrors.returnRate}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
                {validationErrors.returnRate && (
                  <p id="diag-error-return-rate" role="alert" aria-live="polite" className="text-xs text-rose-400 mt-1">{validationErrors.returnRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  نطاق التوصيل الجغرافي
                </label>
                <select                   value={deliveryAreas}
                  onChange={(e) => setDeliveryAreas(e.target.value)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                >
                  {DELIVERY_AREAS.map((a) => (
                    <option key={a.id} value={a.label} className="bg-slate-900 text-slate-100">
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Main Challenge & Review */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                ما هو التحدي الأكبر والمشكلة التي تريد حلها فوراً؟
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MAIN_PROBLEMS.map((prob) => (
                  <button                     key={prob.id}
                    type="button"
                    onClick={() => setMainProblem(prob.title)}
                    className={`p-3 rounded-xl border text-right transition flex items-start gap-2.5 ${ mainProblem === prob.title ? "bg-amber-500/15 border-amber-400 text-amber-200" : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                  >
                    <span className="text-xl mt-0.5">{prob.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{prob.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{prob.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-200">
                  أي تفاصيل أو ملاحظات إضافية تود إخبار المستشار بها؟
                </label>
                <span className="text-[11px] text-slate-500">اختياري</span>
              </div>
              <textarea                 value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="مثال: أصرف 15$ يومياً إعلانات فيسبوك، والتوصيل مع شركة الأمانة، والزبائن أكثرهم من البصرة والنجف..."
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              />
            </div>

            {/* Diagnostic Summary Badge */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>جاهز لإرسال الملف واستخراج خطة الـ 48 ساعة وسكريبت الإغلاق العراقي.</span>
              </div>
                        <span className="text-amber-400 font-bold hidden sm:inline">مستشار فيزيون جاهز</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="vizion-diagnostic-footer p-4 bg-[#0F172A] border-t border-slate-800/80 flex items-center justify-between gap-3">
        {currentStep > 1 ? (
          <button             type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          >
            <ArrowRight className="w-4 h-4" />
            السابق
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <button               type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button               type="button"
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/30 transition transform hover:scale-[1.02] min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              ابدأ تشخيص مشروعي الآن
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
