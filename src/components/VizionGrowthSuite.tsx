/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  UserCheck,
  BookOpen,
  CheckCircle2,
  Percent,
  TrendingDown,
  Calendar,
  HelpCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Target,
  FileText,
  Lock,
  Crown
} from "lucide-react";
import { isFreeTrialUser } from "./LockScreen";

export default function VizionGrowthSuite() {
  const [activeTab, setActiveTab] = useState<string>("diagnostics");
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState<boolean>(false);

  const userCode = typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") || "" : "";
  const isFreeTrial = isFreeTrialUser(userCode);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  // State for Tool 1: Business Diagnostics Wizard
  const [t1MonthlyOrders, setT1MonthlyOrders] = useState<number>(100);
  const [t1SellingPrice, setT1SellingPrice] = useState<number>(35000);
  const [t1ProductCost, setT1ProductCost] = useState<number>(12000);
  const [t1MessageCost, setT1MessageCost] = useState<number>(2000);
  const [t1ReturnRate, setT1ReturnRate] = useState<number>(25);
  const [t1ConversionRate, setT1ConversionRate] = useState<number>(8);
  const [t1ShowReport, setT1ShowReport] = useState<boolean>(false);

  // State for Tool 2: Smart Ad Campaign Advisor
  const [t2Spend, setT2Spend] = useState<number>(150000);
  const [t2Messages, setT2Messages] = useState<number>(60);
  const [t2Confirmed, setT2Confirmed] = useState<number>(12);
  const [t2Delivered, setT2Delivered] = useState<number>(8);
  const [t2ShowAnalysis, setT2ShowAnalysis] = useState<boolean>(false);

  // State for Tool 3: Competitor Content Strategy Helper
  const [t3Name, setT3Name] = useState<string>("");
  const [t3Niche, setT3Niche] = useState<string>("clothing");
  const [t3ShowAnalysis, setT3ShowAnalysis] = useState<boolean>(false);

  // State for Tool 4: Message Conversion Diagnoser
  const [t4Messages, setT4Messages] = useState<number>(80);
  const [t4Orders, setT4Orders] = useState<number>(6);
  const [t4ShowReport, setT4ShowReport] = useState<boolean>(false);

  // State for Tool 5: Iraqi Pricing & Profit Calculator
  const [t5Cost, setT5Cost] = useState<number>(14000);
  const [t5Price, setT5Price] = useState<number>(38000);
  const [t5Shipping, setT5Shipping] = useState<number>(5000);
  const [t5AdCost, setT5AdCost] = useState<number>(7000);
  const [t5ReturnRate, setT5ReturnRate] = useState<number>(20);

  // State for Tool 6: Iraqi Customer Types Guide
  const [activeCustomer, setActiveCustomer] = useState<string>("ghoster");

  // State for Tool 8: Pre-Ad Product Evaluator
  const [t8Margin, setT8Margin] = useState<boolean>(true);
  const [t8Benefit, setT8Benefit] = useState<boolean>(true);
  const [t8Problem, setT8Problem] = useState<boolean>(false);
  const [t8Shorja, setT8Shorja] = useState<boolean>(true);
  const [t8Ship, setT8Ship] = useState<boolean>(true);
  const [t8Video, setT8Video] = useState<boolean>(false);
  const [t8ShowScore, setT8ShowScore] = useState<boolean>(false);

  // State for Tool 9: Profit Leak Calculator
  const [t9Orders, setT9Orders] = useState<number>(120);
  const [t9ReturnRate, setT9ReturnRate] = useState<number>(30);
  const [t9ReturnFee, setT9ReturnFee] = useState<number>(5000);

  // State for Tool 10: 30-Day Interactive Roadmap
  const [t10CheckedDays, setT10CheckedDays] = useState<number[]>([1, 2, 3]);
  const [t10SelectedWeek, setT10SelectedWeek] = useState<number>(1);

  // State for Tool 11: What's stopping my sales? Diagnostic
  const [t11CTR, setT11CTR] = useState<string>("low"); // low (<1%), medium (1-2%), high (>2%)
  const [t11Messages, setT11Messages] = useState<string>("low"); // low, high
  const [t11Speed, setT11Speed] = useState<string>("slow"); // slow, fast
  const [t11Delivery, setT11Delivery] = useState<string>("low"); // low (<70%), high (>70%)
  const [t11ShowResult, setT11ShowResult] = useState<boolean>(false);

  // State for Tool 12: Campaign Forecasting Tool
  const [t12Budget, setT12Budget] = useState<number>(250000);
  const [t12MsgCost, setT12MsgCost] = useState<number>(1800);
  const [t12ConvRate, setT12ConvRate] = useState<number>(10);

  // State for Tool 13: Ad Budget Planner
  const [t13TargetProfit, setT13TargetProfit] = useState<number>(1500000);
  const [t13ProfitMargin, setT13ProfitMargin] = useState<number>(15000);

  // Constants
  const toolTabs = [
    { id: "diagnostics", label: "🩺 فحص مشروعك", desc: "افحص صحة وربحية شغلك" },
    { id: "campaign-advisor", label: "🤖 مستشار الحملات", desc: "شيك أداء حملاتك الإعلانية" },
    { id: "competitors", label: "🔍 محلل المنافسين", desc: "شيك صفحات ومحتوى اللي ينافسوك" },
    { id: "message-diagnoser", label: "💬 جودة الرسائل", desc: "وين دي يضيع زبونك بالخاص؟" },
    { id: "pricing-calculator", label: "💰 حاسبة التسعير والربح", desc: "احسب أسعارك وأرباحك بالضبط" },
    { id: "customer-types", label: "👥 دليل أنواع الزبائن", desc: "ردود جاهزة ومقنعة لغلق الطلبات" },
    { id: "ads-library", label: "📚 مكتبة الإعلانات", desc: "شلون تشتغل الإعلانات الناجحة" },
    { id: "product-evaluator", label: "📦 تقييم المنتج", desc: "افحص المنتج قبل لا تصرف عليه" },
    { id: "profit-leak", label: "📉 كاشف تسرب الأرباح", desc: "احسب فلوسك الضايعة من الراجع" },
    { id: "roadmap", label: "🎯 مخطط الـ 100 طلب", desc: "خطة يومية حتى تبدي شغلك صح" },
    { id: "sales-blocker", label: "🧠 ليش ماكو مبيعات؟", desc: "اعرف الخلل وين بمشروعك" },
    { id: "forecaster", label: "📈 متوقع الأرباح", desc: "توقع مبيعاتك قبل لا تشغل الإعلان" },
    { id: "budget-planner", label: "💵 مخطط الميزانية", desc: "خطط ميزانيتك حتى توصل لهدفك" }
  ];

  // Helper calculation for Tool 1
  const runDiagnosticsCalculator = () => {
    // Math logic based on Iraqi delivery landscape
    const estimatedShipped = t1MonthlyOrders;
    const estimatedDelivered = Math.round(t1MonthlyOrders * (1 - t1ReturnRate / 100));
    const estimatedReturned = t1MonthlyOrders - estimatedDelivered;

    const totalRevenue = estimatedDelivered * t1SellingPrice;
    const totalProductCost = t1MonthlyOrders * t1ProductCost; // assume product was bought
    const totalShippingPaid = (estimatedDelivered * 5000) + (estimatedReturned * 5000); // 5000 IQD avg shipping fee
    
    // We need to estimate how many messages were generated
    const estimatedMessagesRequired = Math.round(t1MonthlyOrders / (t1ConversionRate / 100));
    const totalAdSpend = estimatedMessagesRequired * t1MessageCost;

    const netProfit = totalRevenue - totalProductCost - totalShippingPaid - totalAdSpend;

    return {
      estimatedDelivered,
      estimatedReturned,
      totalRevenue,
      totalProductCost,
      totalShippingPaid,
      totalAdSpend,
      netProfit,
      estimatedMessagesRequired
    };
  };

  const diagResult = runDiagnosticsCalculator();

  // Helper analysis for Tool 2
  const getAdAnalysis = () => {
    const costPerMsg = Math.round(t2Spend / t2Messages);
    const convRate = parseFloat(((t2Confirmed / t2Messages) * 100).toFixed(1));
    const deliveryRate = parseFloat(((t2Delivered / t2Confirmed) * 100).toFixed(1));
    
    let verdict = "";
    let warning = "";
    let recommendations: string[] = [];

    if (costPerMsg > 3500) {
      warning = "سعر الرسالة مالتك كارثي وغالي كلش (أكثر من 3,500 دينار).";
      recommendations.push("إعلانك ممل أو ما يوكف تصفح الزبون. غير البداية (أول 3 ثواني) بفيديو حقيقي وعفوي.");
      recommendations.push("استخدم عبارات قوية مثل: 'إذا محتار بالهدية..' أو 'لا تشتري عطور رخيصة قبل لا تشوف هذا..'.");
    } else {
      recommendations.push("سعر الرسالة ممتاز ومناسب للسوك مالتنا.");
    }

    if (convRate < 5) {
      verdict = "الحملة دي تحرق ميزانيتك عالخالي والخلل بالردود.";
      recommendations.push("نسبة تحويل الرسائل للطلبات ضعيفة كلش (" + convRate + "%). ردودك لو بطيئة لو آلية وناشفة.");
      recommendations.push("لا تدز رسالة السعر وتسكت. سولف ويا الزبون كأنه صديقك واستخدم بصمة صوت دافية عالواتساب.");
    } else if (convRate >= 5 && convRate < 15) {
      verdict = "شغلك متوسط وتكدر تحسنه بتعديلات بسيطة بالرد.";
      recommendations.push("حاول تخير الزبون بين لونين أو قياسين بدل ما تسأله 'تريد لو لا؟' حتى تقفل الطلب بسرعة.");
    } else {
      verdict = "أداء الردود والتحويل ممتاز جداً ومحترف!";
    }

    if (deliveryRate < 70) {
      warning += " ونسبة استلام الطلبات مالتك تعبانة (" + deliveryRate + "%).";
      recommendations.push("المناديب ديواجهون صعوبة يحصلون الزبون أو الزباين ديبطلون لأن التوصيل يتأخر.");
      recommendations.push("خابر الزبائن خلال نص ساعة من يدزون الرسالة حتى تأكد الطلب تلفونياً ولا تطلع أي طلب بدون تأكيد.");
      recommendations.push("دز فيديو للتعبئة للزبون عالواتساب قبل لا تدز الطرد حتى يحس بمسؤولية ويستلم.");
    }

    if (recommendations.length === 0) {
      recommendations.push("الحملة ممتازة، ضاعف ميزانيتها فوراً بدون تردد!");
    }

    return { costPerMsg, convRate, deliveryRate, verdict, warning, recommendations };
  };

  // Helper analysis for Tool 3
  const getCompetitorTactics = () => {
    switch (t3Niche) {
      case "clothing":
        return {
          weakness: "أغلب بيجات الملابس ينشرون صور أجنبية جاهزة أو قياسات ما مفهومة وينتظرون الزبون عالخاص.",
          opportunity: "صور الملابس بفيديو حقيقي على الموديل أو ملكانة بكاميرا تلفون طبيعية ووضح الألوان والخامة بصوتك.",
          hook: "شلون تختار القياس الصح بدون ما تدوخ بالراجع؟ افحص خامة القطعة كدام المندوب قبل الدفع!"
        };
      case "perfumes":
        return {
          weakness: "يركزون على شكل العلبة ويبيعون بأسعار خيالية بدون ما يوضحون الثباتية الحقيقية للعطر.",
          opportunity: "ركز إعلانك عالثباتية والفوحان بيوميات الزبون (بالشغل، بالحر، بالعرس). وانطي ضمان حقيقي (إذا ما عجبك العطر رجعه للمندوب وادفع بس التوصيل).",
          hook: "عطر فواح يثبت بالهدوم حتى ورا الغسل.. جربه بنفسك وإذا مو صدك لا تستلم!"
        };
      case "electronics":
        return {
          weakness: "يبيعون أجهزة صينية رخيصة بدون كفالة حقيقية، والزبون يخاف من نصب البيجات الوهمية.",
          opportunity: "قدم كفالة حقيقية 6 أشهر أو سنة ويا ورقة كفالة مطبوعة داخل الكارتون. صور فيديو تفتح بي الكارتون وتشغل المنتج بيدك.",
          hook: "جهاز كفالته حقيقية سنة كاملة ويا ضمان استرجاع فوري.. لا تشتري رخيص بدون كفالة وتندم!"
        };
      default:
        return {
          weakness: "بيجات عشوائية، ردود بطيئة ومحتوى ماخوذ من غير صفحات.",
          opportunity: "سوي ترتيب حلو لصفحتك، صور تجهيز الطلبات باسم الزبون، انشر محادثات زبائن حقيقيين يحجون براحتهم.",
          hook: "فيديو تجهيز طلب لزبوننا من البصرة.. شوف التغليف المرتب والأمان!"
        };
    }
  };

  // Tool 10 Roadmap Weeks
  const roadmapData = [
    {
      week: 1,
      title: "الأسبوع الأول: الأساس المضبوط والجدوى المالية",
      days: [
        { day: 1, title: "اختيار وتصفية فكرة المنتج وحساب الأرباح الصافية بالأرقام." },
        { day: 2, title: "فحص جودة المنتج زين وهل يتحمل شحن لمحافظات بعيدة." },
        { day: 3, title: "التواصل ويا شركتين توصيل ومقارنة أسعارهم ونسبة الراجع عدهم." },
        { day: 4, title: "تجهيز السعر النهائي وتحديد ميزانية الحملة التجريبية بالضبط." },
        { day: 5, title: "تأسيس بيجات الانستغرام والفيسبوك بترتيب بسيط وحلو." },
        { day: 6, title: "كتابة سكريبت الردود وتجهيز الردود السريعة بلهجة حلوة." },
        { day: 7, title: "مراجعة شاملة للخطوات والتأكد ماكو أي مشكلة تقنية." }
      ]
    },
    {
      week: 2,
      title: "الأسبوع الثاني: تجهيز المحتوى وبداية الإعلان",
      days: [
        { day: 8, title: "تصوير 3 فيديوهات حقيقية للمنتج بكاميرا موبايل وإضاءة زينة." },
        { day: 9, title: "ترتيب الفيديوهات والتركيز على أول 3 ثواني (الخطاف القوي)." },
        { day: 10, title: "ترتيب 3 عروض قوية (عرض توفير، قطعتين، أو شحن مجاني)." },
        { day: 11, title: "نشر البوستات وتثبيت المهم منها حتى تنطي ثقة للزبون." },
        { day: 12, title: "ترتيب حساب الإعلانات وربط وسيلة الدفع (زين كاش أو غيرها)." },
        { day: 13, title: "تشغيل أول حملة تجريبية حتى تختبر تفاعل الناس وسعر الرسالة." },
        { day: 14, title: "مراجعة نتائج أول يوم من الإعلان وتعديل النصوص إذا احتاجت." }
      ]
    },
    {
      week: 3,
      title: "الأسبوع الثالث: قفل البيعات وتأكيد الطلبات",
      days: [
        { day: 15, title: "استخدام طريقة 'البصمة الصوتية الدافية' ويا كل زبون يستفسر." },
        { day: 16, title: "فرز الزبائن الجادين عن الفضوليين باستخدام طريقة 'قفل البيعة بالخيارات'." },
        { day: 17, title: "تأكيد أول 10 طلبات بالتلفون وتسجيل عنوان الزبون بدقة." },
        { day: 18, title: "تصوير وإرسال 'فيديو التجهيز' للزبائن عالواتساب." },
        { day: 19, title: "تسليم أول وجبة طلبات لمندوب التوصيل ومتابعتها بالنظام." },
        { day: 20, title: "شلون تتعامل ويا الزبون اللي يكول 'أفكر وأرجعلك' أو 'غالي'." },
        { day: 21, title: "حساب نسبة الناس اللي اشترت فعلياً من الرسايل وتسجيل الملاحظات." }
      ]
    },
    {
      week: 4,
      title: "الأسبوع الرابع: مكافحة الراجع واستلام الأرباح",
      days: [
        { day: 22, title: "متابعة كشف المندوب اليومي وتأكيد وصول الطلبات للمحافظات." },
        { day: 23, title: "مخابرة الزبائن المترددين من يوصل المندوب يم بيتهم." },
        { day: 24, title: "ترتيب علاقة زينة ويا المناديب بالمحافظات الصعبة حتى يزيدون الاستلام." },
        { day: 25, title: "استلام أول كشف حساب كأرباح صافية من شركة التوصيل." },
        { day: 26, title: "تحليل المشاكل وعلاج الأماكن اللي ضاعت بيها الفلوس." },
        { day: 27, title: "استلام الطلبات الراجعة وإعادة تغليفها فوراً حتى تطلع لغير زبائن." },
        { day: 28, title: "معرفة المنتجات الناجحة وتصعيد ميزانية إعلانها بنسبة 50%." },
        { day: 29, title: "تجهيز عروض خاصة لزبائنك القدامى حتى يشترون مرة ثانية مجاناً." },
        { day: 30, title: "وصولك لـ 100 طلب الأولى وبداية ترتيب الشغل حتى يمشي تلقائياً." }
      ]
    }
  ];

  const handleToggleDay = (dayNum: number) => {
    if (t10CheckedDays.includes(dayNum)) {
      setT10CheckedDays(t10CheckedDays.filter(d => d !== dayNum));
    } else {
      setT10CheckedDays([...t10CheckedDays, dayNum]);
    }
  };

  const currentWeekData = roadmapData.find(w => w.week === t10SelectedWeek) || roadmapData[0];

  return (
    <div className="space-y-16 py-12 px-4 max-w-7xl mx-auto relative" id="vizion-growth-suite">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4A017]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1A2B73]/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Dynamic Main Header */}
      <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#D4A017]/20 to-[#D4A017]/5 border border-[#D4A017]/30 text-xs md:text-sm text-[#F0C040] font-black shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 animate-pulse-slow" />
          <span>Vizion OS • لوحة التحكم والتشغيل التفاعلية</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">
          لا تتوقع أرقامك.. سيطر على شغلك مثل <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-[#FFE58F] to-[#D4A017]">المحترفين</span>
        </h2>
        
        <p className="text-base md:text-lg text-white/70 leading-relaxed font-light max-w-3xl mx-auto">
          صممنالك نظام متكامل بي <strong className="text-[#F0C040] font-bold">13 أداة ومحاكي ذكي</strong> مرتب على سوكنا بالضبط، حتى تتخذ قراراتك بناءً على أرقام مضبوطة بدل التخمين والشك.
        </p>

        {/* Free Trial Gatekeeping Banner */}
        {isFreeTrial && (
          <div className="bg-gradient-to-r from-amber-950/80 via-[#0F1735] to-amber-950/80 border-2 border-[#D4A017] p-5 sm:p-6 rounded-3xl shadow-2xl space-y-3 text-center relative overflow-hidden my-4 z-20 animate-[fadeIn_0.3s_ease]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/50 text-xs font-black text-[#F0C040]">
              <Lock className="w-4 h-4 text-[#F0C040]" />
              <span>نسخة مجانية للتجربة (Free Trial Mode)</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              إنت هسة دتستعرض الأدوات بنسخة المعاينة
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              أدوات النظام الـ 13 مقفولة جزئياً بهذي النسخة. رقي حسابك حتى تفتح كل الأدوات وتكدر تدخل أرقامك وتحلل حملاتك وتحسب أرباحك الصافية بالضبط.
            </p>
            <button
              onClick={triggerUpgradeModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-xs sm:text-sm shadow-xl shadow-[#D4A017]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#040B24]" />
              <span>افتح المنظومة كاملة ورقي حسابك هسة ⚡</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Tabs Sidebar + Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* MOBILE SELECTOR & LAUNCHPAD (Visible only on mobile/tablet) */}
        <div className="lg:hidden w-full mb-6 relative z-30">
          <div className="bg-gradient-to-b from-[#0F1735]/90 to-[#040B24] border border-[#D4A017]/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setIsLaunchpadOpen(!isLaunchpadOpen)}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <div className="text-right">
                <span className="text-[11px] text-[#F0C040]/70 block font-bold mb-1.5 uppercase tracking-widest animate-pulse">👈 اضغط هنا حتى تبدل الأداة (١٣ أداة)</span>
                <span className="text-base font-black text-white flex items-center gap-2 drop-shadow-md">
                  {toolTabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <div className={`w-12 h-12 shrink-0 rounded-2xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center transition-transform duration-500 shadow-inner ${isLaunchpadOpen ? 'rotate-180 bg-[#D4A017] border-[#D4A017]' : ''}`}>
                <ChevronDown className={`w-6 h-6 transition-colors duration-500 ${isLaunchpadOpen ? 'text-[#040B24]' : 'text-[#F0C040]'}`} />
              </div>
            </button>
            
            {/* Expandable Menu */}
            <AnimatePresence>
              {isLaunchpadOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#D4A017]/20 max-h-[60vh] overflow-y-auto no-scrollbar bg-black/80 backdrop-blur-2xl"
                >
                  <div className="p-4 space-y-2.5">
                    {toolTabs.map((tab) => {
                      const isActive = tab.id === activeTab;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsLaunchpadOpen(false);
                            setT1ShowReport(false);
                            setT2ShowAnalysis(false);
                            setT3ShowAnalysis(false);
                            setT4ShowReport(false);
                            setT8ShowScore(false);
                          }}
                          className={`w-full flex items-center justify-between p-4.5 rounded-xl transition-all duration-300 cursor-pointer border ${
                            isActive 
                              ? "bg-gradient-to-r from-[#D4A017]/20 to-[#040B24] border-[#D4A017]/60 text-[#F0C040] shadow-[0_5px_15px_rgba(212,160,23,0.15)]" 
                              : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.06] hover:border-white/20"
                          }`}
                        >
                          <div className="text-right flex-1">
                            <div className={`text-sm font-black mb-1.5 flex items-center justify-between ${isActive ? "text-[#F0C040]" : "text-white"}`}>
                              <span>{tab.label}</span>
                              {isFreeTrial && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-white/50 leading-relaxed font-light">{tab.desc}</div>
                          </div>
                          {isActive && (
                            <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center shrink-0 ml-3 shadow-[0_0_15px_#D4A017]">
                              <CheckCircle2 className="w-5 h-5 text-[#040B24]" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SIDE BAR / SELECTOR RAIL (4 Columns, hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:col-span-4 bg-gradient-to-b from-[#0F1735]/80 to-[#040B24]/90 backdrop-blur-xl border border-[#D4A017]/20 rounded-[2.5rem] p-5 md:p-6 flex-col space-y-4 shadow-[0_0_50px_rgba(212,160,23,0.05)] h-[750px] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#F0C040] to-transparent opacity-50" />
          <span className="text-[12px] font-black text-[#F0C040] block mr-3 uppercase tracking-widest border-b border-white/10 pb-4">
            ⚙️ أدوات نظام التشغيل والتحكم:
          </span>
          
          <div className="space-y-2 overflow-y-auto pr-2 no-scrollbar flex-1 pb-4">
            {toolTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Reset show status for smoother navigation
                    setT1ShowReport(false);
                    setT2ShowAnalysis(false);
                    setT3ShowAnalysis(false);
                    setT4ShowReport(false);
                    setT8ShowScore(false);
                  }}
                  className={`w-full p-4 rounded-2xl border text-right transition-all duration-400 relative cursor-pointer flex items-center justify-between group overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-l from-[#D4A017]/20 to-[#040B24] border-[#D4A017]/60 text-[#F0C040] shadow-[0_10px_20px_rgba(212,160,23,0.15)] scale-[1.02] z-10"
                      : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="space-y-1.5 text-right">
                      <h4 className={`font-black text-sm transition-colors duration-300 flex items-center gap-2 ${isActive ? "text-[#F0C040]" : "text-white group-hover:text-[#F0C040]"}`}>
                        <span>{tab.label}</span>
                        {isFreeTrial && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </h4>
                      <p className={`text-[10px] transition-colors duration-300 font-light ${isActive ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm transition-all duration-500 ${isActive ? "text-[#F0C040] translate-x-1 opacity-100" : "text-white/20 group-hover:text-white/40 opacity-0 group-hover:opacity-100"}`}>
                    ◀
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT VIEWPORT (8 Columns) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-[#0F1735]/60 to-[#040B24]/90 backdrop-blur-2xl border border-[#D4A017]/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_60px_rgba(212,160,23,0.1)] relative min-h-[750px] flex flex-col justify-between overflow-hidden group">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#D4A017]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#D4A017]/20 transition-all duration-1000" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="space-y-8 w-full relative z-10"
            >
              
            {isFreeTrial ? (
              <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-6 min-h-[550px] my-auto relative z-20">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4A017]/30 via-amber-600/20 to-[#040B24] border-2 border-[#D4A017] flex items-center justify-center shadow-[0_0_50px_rgba(212,160,23,0.35)] relative group animate-bounce">
                  <Lock className="w-10 h-10 text-[#F0C040]" />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                    مقفول
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/15 border border-[#D4A017]/40 text-xs font-black text-[#F0C040]">
                    <Crown className="w-4 h-4 text-[#F0C040]" />
                    <span>الأدوات مقفولة لحساب المعاينة المجانية (free#1)</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    أداة "{toolTabs.find(t => t.id === activeTab)?.label}" ما متوفرة بالنسخة المجانية
                  </h3>
                  
                  <p className="text-xs md:text-sm text-white/80 font-light leading-relaxed">
                    كل الأدوات الـ 13 والحاسبات مقفولة هسة. حتى تكدر تدخل أرقامك وتحلل حملاتك وتحسب أرباحك الصافية بالضبط، رقي حسابك وافتح كلشي.
                  </p>
                </div>

                <div className="w-full max-w-md bg-white/[0.03] border border-[#D4A017]/30 rounded-2xl p-5 space-y-3 text-right">
                  <span className="text-xs font-black text-[#F0C040] block border-b border-white/10 pb-2">
                    ⚡ مميزات المنظومة الكاملة بعد الترقية:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>مقييم سلامة البزنس مالتك</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>مستشار الحملات الإعلانية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>حاسبة التسعير والربح الصافي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>متوقع أرباح الإعلان قبل ما تشغله</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>مخطط الميزانية والوصول</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <span>كاشف تسرب الفلوس المرتجعة</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={triggerUpgradeModal}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 text-[#040B24] font-black text-sm md:text-base shadow-[0_10px_30px_rgba(212,160,23,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-3 group"
                >
                  <Crown className="w-5 h-5 text-[#040B24] group-hover:rotate-12 transition-transform" />
                  <span>افتح الـ 13 أداة ورقي حسابك هسة ⚡</span>
                </button>
              </div>
            ) : (
              <>
              
            {/* TOOL 1: Business Diagnostics Wizard */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6 text-right">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🩺</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">فحص سلامة وربحية مشروعك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مقيِّم البزنس المتكامل</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  دخل أرقام مشروعك الحالية حتى نكشفلك فوراً نقاط قوتك ووين كاعد تضيع فلوسك ويقل ربحك بدون ما تحس.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات بالشهر (اللي تدزها):</label>
                    <input
                      type="number"
                      value={t1MonthlyOrders}
                      onChange={(e) => setT1MonthlyOrders(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر البيع للزبون (دينار):</label>
                    <input
                      type="number"
                      value={t1SellingPrice}
                      onChange={(e) => setT1SellingPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">بيش مشتري القطعة (دينار):</label>
                    <input
                      type="number"
                      value={t1ProductCost}
                      onChange={(e) => setT1ProductCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر الرسالة بالإعلان (دينار):</label>
                    <input
                      type="number"
                      value={t1MessageCost}
                      onChange={(e) => setT1MessageCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">نسبة الراجع المتوقعة (%):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={t1ReturnRate}
                        onChange={(e) => setT1ReturnRate(Number(e.target.value))}
                        className="w-full accent-[#D4A017]"
                      />
                      <span className="text-xs font-mono font-bold text-[#F0C040] shrink-0 w-12 text-left">{t1ReturnRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد من الرسايل تصير طلبات (%):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={t1ConversionRate}
                        onChange={(e) => setT1ConversionRate(Number(e.target.value))}
                        className="w-full accent-[#D4A017]"
                      />
                      <span className="text-xs font-mono font-bold text-[#F0C040] shrink-0 w-12 text-left">{t1ConversionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT1ShowReport(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>افحص مشروعي وشوفني التقرير</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t1ShowReport && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <h4 className="text-sm font-black text-[#F0C040] flex items-center gap-2 border-b border-white/5 pb-2">
                      <span>📊</span>
                      <span>تقرير فحص الأداء والربح:</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">الطلبات المستلمة</span>
                        <span className="text-base font-black text-emerald-400 font-mono">{diagResult.estimatedDelivered} طرد</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">الطلبات الراجعة</span>
                        <span className="text-base font-black text-red-400 font-mono">{diagResult.estimatedReturned} طرد</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">ميزانية الإعلان المطلوبة</span>
                        <span className="text-xs sm:text-sm font-black text-[#F0C040] font-mono">{(diagResult.totalAdSpend).toLocaleString()} دينار</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">صافي الربح الفعلي</span>
                        <span className={`text-xs sm:text-sm font-black font-mono ${diagResult.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {(diagResult.netProfit).toLocaleString()} دينار
                        </span>
                      </div>
                    </div>

                    {/* Verdict Box */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border-r-4 border-[#D4A017] space-y-2">
                      <span className="text-xs font-bold text-white block">التشخيص الفوري:</span>
                      <ul className="space-y-1.5 text-[11px] text-white/70 leading-relaxed">
                        {t1ReturnRate > 20 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>الراجع دياكل أرباحك:</strong> نسبة المرتجع عندك ({t1ReturnRate}%) عالية وتخسرك كروة شحن وفلوس إعلانات. لازم تأكد طلباتك بالتلفون وتدز فيديوهات للزبون.</span>
                          </li>
                        )}
                        {t1ConversionRate < 10 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>الرد عالخاص ضعيف:</strong> بس ({t1ConversionRate}%) يشترون من الرسايل. هذا معناه إعلانك يجذب ناس بس تتفرج أو ردك عالخاص يحتاج تعديل سريع.</span>
                          </li>
                        )}
                        {t1SellingPrice - t1ProductCost < 15000 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>الربح قليل:</strong> الفرق بين سعر الشراء والبيع قليل وما يغطي كروة الشحن والإعلانات.</span>
                          </li>
                        )}
                        {t1ReturnRate <= 20 && t1ConversionRate >= 10 && t1SellingPrice - t1ProductCost >= 15000 && (
                          <li className="flex items-start gap-1.5 text-emerald-300">
                            <span>✔</span>
                            <span><strong>شغلك ممتاز:</strong> الأرقام دتكول مشروعك قوي. ركز هسه على زيادة فلوس الإعلان شوية شوية حتى تضاعف مبيعاتك.</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Future Potential Projection */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                      <strong>💰 فرصة تزيد أرباحك:</strong> إذا رتبت شغلك ونزلت الراجع لـ <strong>10%</strong> وصعدت قفل الطلبات لـ <strong>15%</strong>، راح يطفر ربحك الصافي من <span className="font-mono text-white underline">{Math.round(diagResult.netProfit).toLocaleString()} دينار</span> إلى <strong className="text-emerald-400 font-mono underline">{Math.round((t1MonthlyOrders * 0.9 * t1SellingPrice) - (t1MonthlyOrders * t1ProductCost) - (t1MonthlyOrders * 5000) - (Math.round(t1MonthlyOrders / 0.15) * t1MessageCost)).toLocaleString()} دينار</strong>! وهيج تزيد أرباحك بدون ما تصرف إعلانات أكثر.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TOOL 2: Smart Ad Campaign Advisor */}
            {activeTab === "campaign-advisor" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">بدل ما تخمن وتخسر فلوسك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مستشار الإعلانات الذكي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  دخل أرقام حملتك الإعلانية اللي مشغلها هسه، والنظام راح يحللها ويكشفلك الخلل وين بالضبط وينطيك الحل بسرعة.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد صارف عالإعلان (دينار):</label>
                    <input
                      type="number"
                      value={t2Spend}
                      onChange={(e) => setT2Spend(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد رسايل اجتك:</label>
                    <input
                      type="number"
                      value={t2Messages}
                      onChange={(e) => setT2Messages(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد طلبات أكدتها:</label>
                    <input
                      type="number"
                      value={t2Confirmed}
                      onChange={(e) => setT2Confirmed(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">الطلبات اللي استلموها الزبائن فعلياً:</label>
                    <input
                      type="number"
                      value={t2Delivered}
                      onChange={(e) => setT2Delivered(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT2ShowAnalysis(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>حلل نتائج الإعلان هسة</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t2ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-[#F0C040]">🔍 النتيجة والتحليل الفني:</h4>
                      <span className="text-xs text-white/40 font-mono">سعر الرسالة عندك: {getAdAnalysis().costPerMsg.toLocaleString()} دينار</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed">
                      النتيجة: <span className="text-amber-300">{getAdAnalysis().verdict}</span>
                    </p>

                    {getAdAnalysis().warning && (
                      <p className="text-xs text-red-300 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                        ⚠️ <strong>ملاحظة هامة:</strong> {getAdAnalysis().warning}
                      </p>
                    )}

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#F0C040] block">🛠️ الخطوات والتعديلات المطلوبة فوراً:</span>
                      <ul className="space-y-2 text-xs text-white/80">
                        {getAdAnalysis().recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#F0C040] shrink-0 mt-0.5">✔</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TOOL 3: Competitor Content Strategy Helper */}
            {activeTab === "competitors" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🔍</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">افهم السوك وحلل اللي ينافسوك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل استراتيجية المنافسين</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  اكتب اسم أو مجال أي بيج ينافسك ويبيع نفس منتجاتك، وراح نكشفلك طريقتهم بالنشر ونقاط ضعفهم اللي تكدر تستغلها حتى تتغلب عليهم.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">اسم بيج المنافس (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: بيج الهدايا الفخمة"
                      value={t3Name}
                      onChange={(e) => setT3Name(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-right focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">مجال أو فئة بضاعته:</label>
                    <select
                      value={t3Niche}
                      onChange={(e) => setT3Niche(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:border-[#D4A017] outline-none"
                    >
                      <option value="clothing">الملابس والأزياء العصرية</option>
                      <option value="perfumes">العطور ومستحضرات التجميل</option>
                      <option value="electronics">الأجهزة والملحقات الإلكترونية</option>
                      <option value="other">مجالات وهدايا متنوعة</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT3ShowAnalysis(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>حلل شغله واعرضلي الفرص</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t3ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <h4 className="text-sm font-black text-[#F0C040] border-b border-white/5 pb-2">
                      📋 خطة التغلب على {t3Name || "هذا البيج"}:
                    </h4>

                    <div className="space-y-3 text-xs text-white/80">
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <strong className="text-red-300">🔴 نقطة ضعفهم الشائعة:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().weakness}</p>
                      </div>

                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <strong className="text-emerald-300">🟢 فرصتك حتى تتميز:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().opportunity}</p>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <strong className="text-[#F0C040]">🎯 البداية (الخطاف) المقترحة لإعلانك الجاي:</strong>
                        <p className="mt-1 text-white/90 italic leading-relaxed font-bold">"{getCompetitorTactics().hook}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TOOL 4: Message Conversion Diagnoser */}
            {activeTab === "message-diagnoser" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">💬</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">تجيك رسايل هواي وماكو طلبات؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل جودة ونسبة الرسايل</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  إذا دتعاني من كثرة الأسئلة وماكو ناس تشتري، دخل أرقام الرسايل والطلبات حتى تعرف المشكلة وين بالضبط.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تجيك رسايل كلياً:</label>
                    <input
                      type="number"
                      value={t4Messages}
                      onChange={(e) => setT4Messages(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد طلبات أكدتها بنجاح:</label>
                    <input
                      type="number"
                      value={t4Orders}
                      onChange={(e) => setT4Orders(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT4ShowReport(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>حلل الرسايل واكشف الخلل</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t4ShowReport && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    {/* Diagnostic Score Card */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-[#F0C040]">📝 نتيجة غلق الصفقات:</h4>
                      <span className="text-xs text-white/50 font-mono">نسبة التحويل: {((t4Orders / t4Messages) * 100).toFixed(1)}%</span>
                    </div>

                    {((t4Orders / t4Messages) * 100) < 5 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-300">
                          ⚠️ <strong>وضع كلش تعبان:</strong> نسبة التحويل أقل من 5%. الزبائن يدخلون ويطلعون بدون ما تبيع شي.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span>❌</span>
                            <span><strong>إعلانك بي مبالغة:</strong> يجوز الإعلان مبين بي سعر رخيص كلش أو منتج غير شكل، ومن يطب الزبون وينصدم بالسعر الحقيقي يشرد.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>❌</span>
                            <span><strong>الرد الآلي والناشف:</strong> تدز كليشة جاهزة شطولها للزبون. سولف وياهم بأسلوب حلو ورتب الحجي.</span>
                          </li>
                        </ul>
                      </div>
                    ) : ((t4Orders / t4Messages) * 100) < 12 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300">
                          ⚠️ <strong>أداءك متوسط:</strong> اكو ناس مهتمة صدك، بس دتطير نص البيعات لأن ما دتتابع الزبون عدل لو تتردد بالعرض.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span>✔</span>
                            <span><strong>شغل البصمة الصوتية:</strong> جرب دز بصمة دافية وقصيرة تشرح بيها التوصيل. هذا راح يحول الزبون المتردد لمشتري أكيد.</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                        🎉 <strong>شغلك فول وممتاز!</strong> نسبة قفل الطلبات عابرة الـ 12% وهاي من أحسن النسب بالسوك. ركز هسة تزيد ميزانية إعلانك حتى تجيب رسايل أكثر وتضاعف شغلك.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TOOL 5: Iraqi Pricing & Profit Calculator */}
            {activeTab === "pricing-calculator" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">احسب فلوسك صح قبل لا تشغل الإعلان</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">حاسبة التسعير والربح الصافي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أغلبية البيجات تخسر لأن ما يحسبون كلفة الراجع الضايعة. احسب أسعارك وأرباحك وشكد لازم تبيع حتى ما تخسر ولا دينار.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">بيش مشتري القطعة (جملة - دينار):</label>
                    <input
                      type="number"
                      value={t5Cost}
                      onChange={(e) => setT5Cost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد ناوي تبيعها للزبون (دينار):</label>
                    <input
                      type="number"
                      value={t5Price}
                      onChange={(e) => setT5Price(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد كروة التوصيل (دينار):</label>
                    <input
                      type="number"
                      value={t5Shipping}
                      onChange={(e) => setT5Shipping(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد كلفك الطلب من الإعلان (دينار):</label>
                    <input
                      type="number"
                      value={t5AdCost}
                      onChange={(e) => setT5AdCost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع نسبة الراجع (%):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={t5ReturnRate}
                        onChange={(e) => setT5ReturnRate(Number(e.target.value))}
                        className="w-full accent-[#D4A017]"
                      />
                      <span className="text-xs font-mono font-bold text-[#F0C040] shrink-0 w-12 text-left">{t5ReturnRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📊 حساب الأرباح والخسائر للقطعة:</h4>

                  {/* Math calculation */}
                  {(() => {
                    const returnDec = t5ReturnRate / 100;
                    const deliverDec = 1 - returnDec;
                    
                    const totalAdWastedOnReturnsPerDelivered = (returnDec / deliverDec) * t5AdCost;
                    const totalShippingWastedOnReturnsPerDelivered = (returnDec / deliverDec) * 5000; // 5k courier return penalty
                    
                    const netProfitReal = t5Price - t5Cost - t5Shipping - t5AdCost - totalAdWastedOnReturnsPerDelivered - totalShippingWastedOnReturnsPerDelivered;
                    
                    const minSafePrice = Math.round(t5Cost + t5Shipping + t5AdCost + (returnDec / deliverDec) * (t5AdCost + 5000));
                    const ordersToTarget = Math.ceil(1500000 / netProfitReal);

                    return (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">صافي ربحك الحقيقي لكل طلب</span>
                            <span className={`text-base font-black font-mono ${netProfitReal > 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {Math.round(netProfitReal).toLocaleString()} دينار
                            </span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">أقل سعر تبيع بي حتى ما تخسر</span>
                            <span className="text-base font-black text-amber-400 font-mono">{minSafePrice.toLocaleString()} دينار</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">طلبات تحتاجها لتربح (١.٥ مليون)</span>
                            <span className="text-base font-black text-white font-mono">
                              {ordersToTarget > 0 && ordersToTarget < 10000 ? ordersToTarget : "شغلة صعبة"} طلب
                            </span>
                          </div>
                        </div>

                        {netProfitReal <= 0 ? (
                          <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-300">
                            ⚠️ <strong>تنبيه دتخسر!</strong> بهالأسعار ونسبة الراجع مالتك، إنت دتخسر فعلياً من كل طرد دزه. صعد سعرك أو نزل كلفة الإعلان والراجع بسرعة.
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-300">
                            ✔ <strong>تسعيرك بطل وآمن!</strong> أرباحك الصافية زينة بعد ما شلنا كل الخسائر والراجع. مشروعك هسة جاهز يكبر ويصعد.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TOOL 6: Iraqi Customer Types Guide */}
            {activeTab === "customer-types" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">👥</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">ردود جاهزة تضمنلك البيعة</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">أنواع الزبائن وشلون ترد عليهم</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  اعرف أشهر 5 أنواع من الزبائن اللي يراسلون بيجك، واكتشف شلون تفكر وشنو الرد اللي يقنعهم يشترون مباشرة.
                </p>

                {/* Grid of customers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => setActiveCustomer("ghoster")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "ghoster" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    👻 يسأل (ببيش؟) ويختفي
                  </button>
                  <button
                    onClick={() => setActiveCustomer("bargainer")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "bargainer" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    💵 (أريد خصم)
                  </button>
                  <button
                    onClick={() => setActiveCustomer("hesitant")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "hesitant" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    🧐 الزبون المتردد
                  </button>
                  <button
                    onClick={() => setActiveCustomer("delayed")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "delayed" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    ⏳ (أرجعلك بعدين)
                  </button>
                  <button
                    onClick={() => setActiveCustomer("comparer")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "comparer" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    ⚖️ يقارن ويا البقية
                  </button>
                </div>

                {/* Customer specific detail */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  {activeCustomer === "ghoster" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">👻 اللي يسأل عن السعر ويشرد:</span>
                        <p className="text-white/50 text-[10px] mt-0.5">ليش هيج يسوي؟ يحس ردك آلي ومجرد فضول ديدور.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">شلون تحلها:</strong> لا تنطي السعر وتسكت. اشرح قيمة العرض، وكوله تكدر تفحص المنتج عند الباب حتى يرتاح ويطمئن.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد المقترح (انسخ وعدل):</span>
                        <p className="text-white/90">
                          "يا هلا بيك عيني الغالي.. بخصوص العطر، سعره ويا الشحن والضمان هو 35 ألف بس. والميزة يمنا: المندوب من يوصلك تكدر تفتح الطرد وتفحص وتتأكد بنفسك، وإذا ما عجبك ترجعه بدون ما تدفع أي شي! كم قطعة حاب نثبتلك عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "bargainer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">💵 اللي يكول (أكو خصم عيني؟ أريده أرخص):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">ليش هيج يسوي؟ يحب يحس نفسه حصل شغلة زينة وبسعر أرخص.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">شلون تحلها:</strong> لا تكوله "لا" قبل. انطيه عرض ثاني أو هدية (مثل شحن مجاني للقطعتين) بدل ما تنزل سعر المنتج.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد المقترح (انسخ وعدل):</span>
                        <p className="text-white/90">
                          "عيني فدوة لكلبك السعر قفل لأن البضاعة أصلية ومكفولة، بس لعيونك.. إذا تاخذ قطعتين اليوم، راح نلغي كروة التوصيل ويصير الشحن مجاني! أو نهديك هدية حلوة وياها. تحب العرض الذهبي؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "hesitant" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">🧐 الزبون المتردد / يخاف من النصب:</span>
                        <p className="text-white/50 text-[10px] mt-0.5">ليش هيج يسوي؟ مضروب بوري قبل من بيجات وهمية وميأمن.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">شلون تحلها:</strong> شيل الخوف منه من تنطيه كفالة وتخليه يفحص كدام المندوب قبل ما يستلم.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد المقترح (انسخ وعدل):</span>
                        <p className="text-white/90">
                          "حقك عيني تخاف السوك هاليومين يخوف.. لهذا إحنا وفرنا ميزة الفحص. تفتح الكارتون وتجرب بيدك، وبضمان 6 أشهر من متجرنا. حاب نسجلك حجز اليوم عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "delayed" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">⏳ اللي يكول (أفكر وأرجعلك / من أستلم الراتب):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">ليش هيج يسوي؟ يحتاج حافز قوي حتى يبطل تردد ويقرر يشتري.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">شلون تحلها:</strong> حسسه إن الكمية حتخلص أو انطيه عرض إنو تدز الطلب يوم راتبه.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد المقترح (انسخ وعدل):</span>
                        <p className="text-white/90">
                          "خذ راحتك عيني الغالي.. بس حتى ما يفوتك العرض، بقت عدنا آخر 3 قطع، إذا حاب نحجزلك قطعة ونخلي التوصيل يوم راتبك الجاي حتى تستلمها براحتك، تآمرنا أمر؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "comparer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">⚖️ اللي يقارن (شفت بيج ثاني يبيعه أرخص):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">ليش هيج يسوي؟ يريد يبرر فرق السعر حتى يرتاح نفسياً.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">شلون تحلها:</strong> لا تهاجم المنافسين. بس وضحله ليش إنت أغلى (جودة خامة، ضمان، خدمات ما بعد البيع).
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد المقترح (انسخ وعدل):</span>
                        <p className="text-white/90">
                          "أهلاً بيك أخي.. فعلاً تلكه أنواع أرخص بالإنترنت، بس الفرق عيني بالخامة والضمان. البضاعة الرخيصة تسويلك مشاكل ومحد يجاوبك بعدين. ويانا إنت تشتري راحة بالك وضمان حقيقي، وتجربة فحص براحتك. يسوى تجرب الأصلي لو لا عيني؟"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOOL 7: Real Ads Library */}
            {activeTab === "ads-library" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">📚</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">إعلانات محلية جابت مبيعات قوية</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مكتبة الإعلانات الناجحة</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  شوف 3 نماذج لإعلانات حقيقية ناجحة، وافتهم السر ورا نجاحها حتى تطبقه بشغلك اليوم.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">🎬</span>
                    <h4 className="text-xs font-black text-white">١. إعلان ملابس (بداية قوية)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو يبدي بشخص يلزم قميص ويصب عليه مي حتى يثبت للناس إن القميص ما يتبكع.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> يخلي الزبون يوكف تصفح بأول ثانيتين بحركة غريبة، ويثبتله الجودة كدام عينه.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">🎥</span>
                    <h4 className="text-xs font-black text-white">٢. إعلان عطور (تجربة حقيقية)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      تصوير عادي لشخص يفوت للمكتب وأصدقائه يسألوه متفاجئين من ريحة عطره الطيبة.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> ما يبين إعلان ديبيعلك شي. يبين كأنه فيديو عادي ومنتشر، وهالشي يصعد الثقة حيل.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">📦</span>
                    <h4 className="text-xs font-black text-white">٣. إعلان هدايا (يلعب عالعاطفة)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو مرتب لإيدين تفتح علبة خشبية فخمة محفور عليها اسم بأسلوب مريح وتصوير حلو.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> يركز عالمشاعر وإحساس الفخر من تنطي هدية مرتبة، ويقنع الزبون يشتري بنهاية الفيديو.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 8: Pre-Ad Product Evaluator */}
            {activeTab === "product-evaluator" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">📦</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">لا تروج لمنتج يفشل بعدين</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مقيِّم المنتجات قبل ما تشغل إعلان</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  جاوب بصدق على هاي الـ 6 أسئلة حتى نعطيك تقييم دقيق يوضحلك إذا منتجك راح ينجح وينباع زين بالإعلانات.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">ربحك بالقطعة يعبر الـ 15,000 دينار؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Margin(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Margin ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>إي</button>
                      <button onClick={() => setT8Margin(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Margin ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">تكدر تشرح فائدته وتلزم انتباه الزبون بأول 3 ثواني؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Benefit(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Benefit ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>إي</button>
                      <button onClick={() => setT8Benefit(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Benefit ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">موجود بكل مكان بالسوك (مثل الشورجة أو الكرادة) ومتروس؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Problem(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Problem ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>إي</button>
                      <button onClick={() => setT8Problem(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Problem ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">المنتج وزنه خفيف وسهل التغليف والشحن بدون ما ينكسر؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Ship(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Ship ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>إي</button>
                      <button onClick={() => setT8Ship(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Ship ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">عندك فيديوهات إنت مصورها بيدك للمنتج (مو مسروقة)؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Video(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Video ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>إي</button>
                      <button onClick={() => setT8Video(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Video ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT8ShowScore(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>احسب نتيجة المنتج هسة</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t8ShowScore && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fade-in-down">
                    {/* Calculation of Score */}
                    {(() => {
                      let score = 0;
                      if (t8Margin) score += 25;
                      if (t8Benefit) score += 25;
                      if (!t8Problem) score += 20; // Good if NOT common in Shorja
                      if (t8Ship) score += 15;
                      if (t8Video) score += 15;

                      return (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-black text-white">شكد المنتج مالتك جاهز ينباع:</span>
                            <span className="font-mono text-base font-black text-[#F0C040]">{score} / 100</span>
                          </div>

                          {score >= 75 ? (
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-300 leading-relaxed font-light">
                              🎉 <strong>منتجك بطل وجاهز!</strong> بي كل الشغلات اللي تنجحه بسرعة. نصيحة ابدي صور فيديوهاتك وشغل حملتك فوراً ولا تتردد.
                            </div>
                          ) : score >= 50 ? (
                            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-amber-300 leading-relaxed font-light">
                              ⚠️ <strong>جاهزية نص ونص:</strong> المنتج زين بس بي شوية مشاكل (مثل ربحه قليل أو متروس بالسوك). حاول ترتب سعرك أو تسوي عرض مميز حتى تتجنب الخسارة.
                            </div>
                          ) : (
                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-red-300 leading-relaxed font-light">
                              ❌ <strong>مخاطرة جبيرة!</strong> هذا المنتج ممكن يطير ميزانيتك لأن ربحه قليل أو صعب تشحنه. لا تصرف فلوس إعلان عليه إلا إذا حليت هاي المشاكل وصورت فيديوهاتك بيدك.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TOOL 9: Profit Leak Calculator */}
            {activeTab === "profit-leak" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">📉</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">وين دتطير فلوسك؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">كاشف تسرب الأرباح</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  هواية أصحاب بيجات ما يدرون شكد ديخسرون من كروة الراجع وغرامات التوصيل. احسب خسارتك من الراجع هسة حتى توكف النزيف.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">الطلبات الكلية اللي تدزها بالشهر:</label>
                    <input
                      type="number"
                      value={t9Orders}
                      onChange={(e) => setT9Orders(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">كروة التوصيل للراجع (دينار):</label>
                    <input
                      type="number"
                      value={t9ReturnFee}
                      onChange={(e) => setT9ReturnFee(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع الراجع (%):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={t9ReturnRate}
                        onChange={(e) => setT9ReturnRate(Number(e.target.value))}
                        className="w-full accent-[#D4A017]"
                      />
                      <span className="text-xs font-mono font-bold text-[#F0C040] shrink-0 w-12 text-left">{t9ReturnRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Calculation outcomes */}
                {(() => {
                  const numReturned = Math.round(t9Orders * (t9ReturnRate / 100));
                  const directLossWasted = numReturned * t9ReturnFee;
                  // Including ad spend of say 6000 IQD per order also wasted
                  const totalWastedWithAds = numReturned * (t9ReturnFee + 6000);

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-red-400 border-b border-white/5 pb-2">🚨 حجم تسرب الفلوس من مبيعاتك:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الطرود اللي دترجعلك</span>
                          <span className="text-sm font-black text-red-400 font-mono">{numReturned} طرد بالشهر</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">خسارة كروة الراجع</span>
                          <span className="text-sm font-black text-red-400 font-mono">{(directLossWasted).toLocaleString()} دينار</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">إجمالي فلوسك اللي تطير بالهوى</span>
                          <span className="text-sm font-black text-[#F0C040] font-mono">{(totalWastedWithAds).toLocaleString()} دينار</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/60 leading-relaxed font-light">
                        * فكر بيها زين: ميزانية بقيمة <strong className="text-red-400 font-mono">{(totalWastedWithAds).toLocaleString()} دينار</strong> تروح شهرياً عالفاضي لأن ما تتابع الزبون وما تأكد الطلبات زين. من تطبق الحلول مالتنا راح توكف هذا النزيف وترجع الفلوس لصافي جيبك فوراً.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TOOL 10: 30-Day Interactive Roadmap */}
            {activeTab === "roadmap" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">ابني شغلك خطوة بخطوة</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مخطط شلون توصل لأول 100 طلب</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  خطة مرتبة تمشي بيها يوم بيومه. اختار الأسبوع وتابع مهامك اليومية واضغط عالمهمة من تخلصها حتى تشوف مشروعك شلون يتقدم.
                </p>

                {/* Week selector */}
                <div className="flex justify-between border-b border-white/10 pb-2">
                  {[1, 2, 3, 4].map((wk) => (
                    <button
                      key={wk}
                      onClick={() => setT10SelectedWeek(wk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${t10SelectedWeek === wk ? "bg-[#D4A017] text-[#040B24] shadow-md" : "text-white/60 hover:text-white"}`}
                    >
                      أسبوع {wk}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                  <span className="text-[11px] font-black text-[#F0C040] block">{currentWeekData.title}:</span>
                  
                  {currentWeekData.days.map((d) => {
                    const isChecked = t10CheckedDays.includes(d.day);
                    return (
                      <div
                        key={d.day}
                        onClick={() => handleToggleDay(d.day)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between group ${isChecked ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isChecked ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>يوم {d.day}</span>
                          <span className="text-xs leading-relaxed font-light">{d.title}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 w-6 text-left ${isChecked ? "text-emerald-400" : "text-white/10"}`}>
                          {isChecked ? "✔" : "☐"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress tracker */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/60 font-light">معدل التقدم بمشروعك:</span>
                  <strong className="text-[#F0C040] font-mono">{Math.round((t10CheckedDays.length / 30) * 100)}% ({t10CheckedDays.length} / 30 يوم)</strong>
                </div>
              </div>
            )}

            {/* TOOL 11: What's stopping my sales? Diagnostic */}
            {activeTab === "sales-blocker" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">اعرف وين الخلل بـ 5 دقايق</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">ليش ما دتجيني مبيعات زينة؟</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  جاوب بصدق على هاي الأسئلة الأربعة عن أرقامك هسة، وراح نكشفلك بالضبط الخلل وين صاير بشغلك وشلون تحله فوراً.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-right">
                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">١. شكد نسبة النقر عالفيديو مالتك؟</label>
                    <select value={t11CTR} onChange={(e) => setT11CTR(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">ضعيفة (أقل من 1% - الزباين يعبرون الفيديو)</option>
                      <option value="medium">متوسطة (1% إلى 2%)</option>
                      <option value="high">قوية (أكثر من 2% - التفاعل عالي)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٢. شلون الرسايل اللي تجيك للبيج؟</label>
                    <select value={t11Messages} onChange={(e) => setT11Messages(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">قليلة كلش وميتة</option>
                      <option value="high">رسايل هواية ومستمرة يومية</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٣. شلون سرعتك وطريقتك بالرد عالخاص؟</label>
                    <select value={t11Speed} onChange={(e) => setT11Speed(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="slow">بطيء (أكثر من ساعتين) أو أرد رد جاهز وناشف</option>
                      <option value="fast">سريع جداً (أقل من 15 دقيقة) وبأسلوب حلو وودود</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٤. شكد نسبة استلام طلباتك من تطلع توصيل؟</label>
                    <select value={t11Delivery} onChange={(e) => setT11Delivery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">تعبانة (أقل من 70% راجع هواية)</option>
                      <option value="high">ممتازة (أكثر من 70% الناس تستلم)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT11ShowResult(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>اعرف المشكلة وعالجها فوراً</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t11ShowResult && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down text-xs">
                    <h4 className="text-sm font-black text-[#F0C040] border-b border-white/5 pb-2">🩺 تقرير الخلل وين صاير بمشروعك:</h4>

                    {t11CTR === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 الخلل الأول: إعلانك ممل وما بي بداية قوية</strong>
                        <p className="text-white/70 leading-relaxed font-light">الفيديو مالتك تعبان وكلفة الرسالة راح تكون غالية لأن الناس تعبر إعلانك وما تباوعله. الحل: ارجع صور المنتج بيدك بكاميرا تلفون وبين فائدته بأول 3 ثواني.</p>
                      </div>
                    )}

                    {t11Messages === "low" && t11CTR !== "low" && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1 text-amber-300">
                        <strong>🚨 الخلل الثاني: الاستهداف غلط أو الفلوس قليلة</strong>
                        <p className="text-white/70 leading-relaxed font-light">المشكلة مو بالفيديو، المشكلة بفلوس الإعلان قليلة أو دتستهدف غلط بمدير الإعلانات. الحل: شغل حملة رسائل مفتوحة وبدون ما تحدد اهتمامات معقدة وخلي الفيسبوك يدورلك عالزباين.</p>
                      </div>
                    )}

                    {t11Speed === "slow" && t11Messages === "high" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 الخلل الثالث: دتأخر بالرد وأسلوبك ناشف</strong>
                        <p className="text-white/70 leading-relaxed font-light">دتخسر 80% من مبيعاتك لأنك تعوف الزبون ينتظر ساعات لحد ما يطير واهسه. الحل: استخدم 'البصمة الصوتية الدافية' وجاوب خلال 15 دقيقة كحد أقصى.</p>
                      </div>
                    )}

                    {t11Delivery === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 الخلل الرابع: ما دتأكد الطلبات زين</strong>
                        <p className="text-white/70 leading-relaxed font-light">إنت دتطلع طلبيات عشوائية وبدون ما تخابرهم وتأكد عليهم، فهالشي يخلي المندوب يسجلها راجع وتخسر كروة. الحل: خابر أكد الطلب فوراً ودز فيديو للواتساب يبين تجهيز طلبهم.</p>
                      </div>
                    )}

                    {t11CTR === "high" && t11Messages === "high" && t11Speed === "fast" && t11Delivery === "high" && (
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1 text-emerald-300">
                        <strong>🎉 مشروعك لوز وشغلك مضبوط!</strong>
                        <p className="text-white/70 leading-relaxed font-light">كل الشغل ديشتغل تمام. ننصحك هسه تزيد ميزانية الإعلان شوية شوية وتجيب منتجات جديدة حتى تضاعف أرباحك.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TOOL 12: Campaign Forecasting Tool */}
            {activeTab === "forecaster" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">📈</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">توقع النتائج قبل لا تصرف وتخسر</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">متوقع المبيعات والأرباح الإعلانية</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  قبل لا تشغل أي حملة ترويجية عالفيس أو الانستا، دخل الميزانية اللي ناوي تصرفها حتى تشوف شكد تتوقع مبيعات وطلبات وصافي فلوس راح تجيك.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد ناوي تصرف عالحملة (دينار):</label>
                    <input
                      type="number"
                      value={t12Budget}
                      onChange={(e) => setT12Budget(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع سعر الرسالة (دينار):</label>
                    <input
                      type="number"
                      value={t12MsgCost}
                      onChange={(e) => setT12MsgCost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد نسبة الرسايل اللي تصير طلبات (%):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={t12ConvRate}
                        onChange={(e) => setT12ConvRate(Number(e.target.value))}
                        className="w-full accent-[#D4A017]"
                      />
                      <span className="text-xs font-mono font-bold text-[#F0C040] shrink-0 w-10 text-left">{t12ConvRate}%</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const expectedMessages = Math.round(t12Budget / t12MsgCost);
                  const expectedOrders = Math.round(expectedMessages * (t12ConvRate / 100));
                  const costPerOrder = expectedOrders > 0 ? Math.round(t12Budget / expectedOrders) : 0;

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📋 نتائج توقع أرباح الحملة:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الرسايل اللي راح تجيك متوقعة</span>
                          <span className="text-sm font-black text-white font-mono">{expectedMessages} رسالة</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الطلبات المؤكدة اللي راح تطلعها</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">{expectedOrders} طلب</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">شكد كلفك الطلب من الإعلان</span>
                          <span className="text-sm font-black text-amber-400 font-mono">{(costPerOrder).toLocaleString()} دينار / طلب</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TOOL 13: Ad Budget Planner */}
            {activeTab === "budget-planner" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">💵</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">لا تصرف فلوسك مخربط</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مخطط ميزانية الإعلان والفلوس</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  حدد الأرباح الصافية اللي تريد توصللها بالشهر وهامش ربح منتجك الصافي، والنظام راح يخططلك الميزانية الإعلانية التقريبية اللي تحتاجها حتى توصل لهدفك.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">صافي الربح اللي تريد تطلعه بالشهر (دينار):</label>
                    <input
                      type="number"
                      value={t13TargetProfit}
                      onChange={(e) => setT13TargetProfit(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">هامش ربح القطعة الصافي (قبل لا تحسب الإعلان) (دينار):</label>
                    <input
                      type="number"
                      value={t13ProfitMargin}
                      onChange={(e) => setT13ProfitMargin(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                </div>

                {(() => {
                  const requiredOrders = Math.ceil(t13TargetProfit / (t13ProfitMargin - 6000)); // assuming 6000 IQD avg ad cost per order
                  const estimatedBudgetRequired = requiredOrders * 6000;

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📋 الخطة المالية المقترحة لهدفك:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الطلبات اللي لازم تبيعها بالشهر</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {requiredOrders > 0 && requiredOrders < 100000 ? requiredOrders : "هامش ربحك قليل كلش"} طلب
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">ميزانية الإعلان التقريبية اللي تحتاجها</span>
                          <span className="text-sm font-black text-[#F0C040] font-mono">
                            {estimatedBudgetRequired > 0 && estimatedBudgetRequired < 1000000000 ? (estimatedBudgetRequired).toLocaleString() : 0} دينار
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/40 text-center leading-relaxed">
                        * الأرقام الفوك تقريبية وتعتمد على جودة استهدافك وتصميم إعلانك وشلون تتعامل ويا المناديب والتوصيل.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
            </>
            )}

          </motion.div>
          </AnimatePresence>

          {/* Golden Footer branding for Vizion OS */}
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/45">
            <span>نظام فيزيون المتكامل • Vizion OS</span>
            <span>بيانات مضبوطة وحاسبات شغالة 100%</span>
          </div>
          
        </div>
        
      </div>

    </div>
  );
}