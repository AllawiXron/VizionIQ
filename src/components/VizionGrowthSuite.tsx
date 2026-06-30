/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  FileText
} from "lucide-react";

export default function VizionGrowthSuite() {
  const [activeTab, setActiveTab] = useState<string>("diagnostics");
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState<boolean>(false);

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
    { id: "diagnostics", label: "🩺 فحص مشروعك", desc: "افحص صحة وربحية عملك" },
    { id: "campaign-advisor", label: "🤖 مستشار الحملات", desc: "حلل أداء حملاتك الإعلانية" },
    { id: "competitors", label: "🔍 محلل المنافسين", desc: "حلل صفحات ومحتوى المنافسين" },
    { id: "message-diagnoser", label: "💬 تحليل جودة الرسائل", desc: "وين دي يضيع زبونك بالخاص؟" },
    { id: "pricing-calculator", label: "💰 حاسبة التسعير والربح", desc: "حدد الأسعار والربحية بالأرقام" },
    { id: "customer-types", label: "👥 دليل أنواع الزبائن", desc: "ردود عراقية مقنعة لغلق الصفقات" },
    { id: "ads-library", label: "📚 مكتبة الإعلانات", desc: "تفكيك إعلانات حقيقية ناجحة" },
    { id: "product-evaluator", label: "📦 تقييم المنتج", desc: "افحص المنتج قبل صرف الميزانية" },
    { id: "profit-leak", label: "📉 كاشف تسرب الأرباح", desc: "احسب الفلوس الضائعة من المرتجعات" },
    { id: "roadmap", label: "🎯 مخطط الـ 100 طلب", desc: "خطة يومية للبدء والانطلاق" },
    { id: "sales-blocker", label: "🧠 ليش ماكو مبيعات؟", desc: "حدد الخلل الفعلي بمشروعك" },
    { id: "forecaster", label: "📈 متوقع الأرباح", desc: "توقع مبيعاتك قبل تفعيل الترويج" },
    { id: "budget-planner", label: "💵 مخطط ميزانية الإعلان", desc: "خطط ميزانيتك للوصول لهدفك المالي" }
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
      warning = "سعر الرسالة مالتك كارثي ومكلف جداً (أكثر من 3,500 دينار).";
      recommendations.push("إعلانك ممل أو ما يوقف تصفح الزبون. غير الخطاف (أول 3 ثوانٍ) بفيديو حقيقي وعفوي.");
      recommendations.push("استخدم خطافات بغدادية قوية مثل: 'إذا محتار بالهدية..' أو 'لا تشتري عطور صينية رخيصة قبل ما تشوف هذا..'.");
    } else {
      recommendations.push("سعر الرسالة ممتاز ومناسب للسوق العراقي.");
    }

    if (convRate < 5) {
      verdict = "الحملة دي تحرق ميزانيتك بالكامل والخلل بالردود أو الفلترة.";
      recommendations.push("نسبة تحويل الرسائل للطلبات ضعيفة جداً (" + convRate + "%). ردودك لو بطيئة لو آلية وجافة.");
      recommendations.push("تجنب إرسال رسائل السعر مباشرة والسكوت. تفاعل مع الزبون كصديق واستخدم بصمة صوتية دافئة بالواتساب.");
    } else if (convRate >= 5 && convRate < 15) {
      verdict = "الأداء متوسط وممكن تحسنه ببعض التعديلات البسيطة بالرد.";
      recommendations.push("حاول تخير الزبون بين لونين أو قياسين بدل ما تسأله 'تريد لو لا؟' لإتمام الطلب بسرعة.");
    } else {
      verdict = "أداء الردود والتحويل ممتاز جداً ومحترف!";
    }

    if (deliveryRate < 70) {
      warning += " ونسبة استلام الطرود مالتك ضعيفة حيل (" + deliveryRate + "%).";
      recommendations.push("المناديب ديواجهون صعوبة بالتواصل أو الزباين ديلغون الطلب بسبب تأخر التوصيل.");
      recommendations.push("اتصل بالزبائن خلال نصف ساعة من إرسال الرسالة لتأكيد الطلب تليفونياً ولا تشحن بدون تأكيد هاتفي صارم.");
      recommendations.push("أرسل فيديو التعبئة الشخصي للزبون على الواتساب قبل إرسال الطرد لبناء الالتزام الأخلاقي.");
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
          weakness: "أغلب صفحات الملابس العراقية ينشرون صور مستوردة جاهزة أو قياسات غير واضحة وينتظرون على الخاص.",
          opportunity: "صور الملابس بفيديو حقيقي على الموديل أو المانيكان بكاميرا هاتف طبيعية ووضح الألوان والخامة بالصوت العراقي الصريح.",
          hook: "شلون تختار القياس الصحيح بدون ما تبهذل روحك بالمرتجع؟ فحص خامة الدشداشة/القميص قبل الدفع!"
        };
      case "perfumes":
        return {
          weakness: "يركزون على شكل العلبة الخارجي ويبيعون بأسعار خيالية بدون توضيح ثباتية العطر الفعلية.",
          opportunity: "ركز إعلانك على الثباتية والفوحان بالمواقف اليومية (بالمكتب، بالحر، بالعرس). واعرض ضمان حقيقي (إذا ما عجبك العطر رجعه للمندوب وادفع بس التوصيل).",
          hook: "عطر عراقي فواح يثبت بالهدوم حتى بعد الغسيل.. جربه بنفسك وإذا مو حقيقي لا تستلم!"
        };
      case "electronics":
        return {
          weakness: "يبيعون أجهزة صينية رخيصة بدون كفالة فعلية، والزبون العراقي يخاف من نصب الصفحات.",
          opportunity: "قدم كفالة حقيقية لمدة 6 أشهر أو سنة كاملة مع ورقة كفالة مطبوعة داخل الطرد. صور فيديو فك الصندوق وتشغيل المنتج بيدك.",
          hook: "جهاز كفالته حقيقية سنة كاملة بضمان استرجاع فوري.. لا تشتري رخيص بدون كفالة!"
        };
      default:
        return {
          weakness: "صفحات عشوائية، ردود بطيئة ومحتوى مسروق من صفحات تيك توك أجنبية.",
          opportunity: "اصنع هوية بصرية مريحة، صور التعبئة وتجهيز الطرود باسم الزبون، انشر آراء زبائن حقيقيين يتكلمون بلهجة عراقية.",
          hook: "فيديو تعبئة طرد خاص بزبوننا من البصرة.. شاهد دقة التغليف وجودة الأمان!"
        };
    }
  };

  // Tool 10 Roadmap Weeks
  const roadmapData = [
    {
      week: 1,
      title: "الأسبوع الأول: الأساس المتين والجدوى المالية",
      days: [
        { day: 1, title: "اختيار وتصفية فكرة المنتج وحساب الجدوى وصافي الأرباح بالأرقام." },
        { day: 2, title: "فحص جودة المنتج ميكانيكياً وصلاحيته للشحن لمحافظات العراق البعيدة." },
        { day: 3, title: "التواصل مع شركتين توصيل ومقارنة أسعار الشحن ونسب المرتجعات لديهم." },
        { day: 4, title: "تجهيز السعر النهائي وتحديد ميزانية الحملة التجريبية بدقة." },
        { day: 5, title: "تأسيس صفحات التواصل الاجتماعي (انستغرام وفيسبوك) بهوية بصرية بسيطة." },
        { day: 6, title: "كتابة سكريبت الردود العراقي الأول وتجهيز الردود السريعة بلهجة ودية." },
        { day: 7, title: "مراجعة شاملة لأساسيات السوق العراقي والتحقق من عدم وجود مشاكل تقنية." }
      ]
    },
    {
      week: 2,
      title: "الأسبوع الثاني: صناعة المحتوى الإبداعي وفيديو الخطاف العراقي",
      days: [
        { day: 8, title: "تصوير 3 فيديوهات حقيقية للمنتج بكاميرا هاتف ممتازة وإضاءة جيدة." },
        { day: 9, title: "مونتاج الفيديوهات مع التركيز على أول 3 ثوانٍ (الخطاف العراقي القوي)." },
        { day: 10, title: "صناعة 3 عروض جذابة (عرض التوفير، العرض الثنائي، أو الشحن المجاني)." },
        { day: 11, title: "نشر المحتوى وتجهيز المنشورات المثبتة على الصفحة لتعطي انطباع ثقة." },
        { day: 12, title: "إعداد حساب Meta Ads وتفعيل وسيلة الدفع (زين كاش أو كارت كارد)." },
        { day: 13, title: "إطلاق أول حملة تفاعلية تجريبية لاختبار استجابة وسعر الرسالة للجمهور." },
        { day: 14, title: "تحليل نتائج أول 24 ساعة من الإعلان وتعديل النصوص حسب التفاعل." }
      ]
    },
    {
      week: 3,
      title: "الأسبوع الثالث: إغلاق الصفقات بالردود الذكية وتفعيل تأكيد المبيعات",
      days: [
        { day: 15, title: "تطبيق استراتيجية 'بصمة الصوت البغدادية الدافئة' مع كل زبون مستفسر." },
        { day: 16, title: "فرز الزبائن الجادين عن الفضوليين باستخدام تكتيك 'سد البيعة بالخيارات'." },
        { day: 17, title: "تأكيد أول 10 طلبات هاتفياً والاتصال بالزبون فوراً لتسجيل عنوانه بدقة." },
        { day: 18, title: "تصوير وإرسال 'فيديو التعبئة الشخصي' للزبائن عبر واتساب." },
        { day: 19, title: "تسليم الوجبة الأولى من الطرود لمندوب شركة الشحن ومتابعة التحديث الميداني." },
        { day: 20, title: "التعامل الذكي مع سيناريو 'أفكر وأرجعلك' و 'السعر غالي عيني'." },
        { day: 21, title: "حساب نسبة التحويل الفعالة من الرسائل إلى طلبات مؤكدة وتدوين الملاحظات." }
      ]
    },
    {
      week: 4,
      title: "الأسبوع الرابع: مكافحة المرتجعات واسترداد رأس المال والمضاعفة",
      days: [
        { day: 22, title: "متابعة كشف المندوب اليومي وتأكيد وصول الطرود لزبائن الجنوب والشمال." },
        { day: 23, title: "الاتصال الهاتفي بالزبائن المترددين عند وصول المندوب لباب بيتهم فوراً." },
        { day: 24, title: "تفعيل خطوة 'الحافز المالي لمندوب التوصيل' في المحافظات الصعبة لرفع الاستلام." },
        { day: 25, title: "سحب أول دفعة كاش كأرباح صافية مستلمة من شركة الشحن." },
        { day: 26, title: "تحليل كاشف تسرب الأرباح ومعالجة الثقوب التي ضاع فيها الكاش." },
        { day: 27, title: "فرز الطلبات المرتجعة وإعادة تعبئتها فوراً لزبائن آخرين لمنع ركود المخزون." },
        { day: 28, title: "تحديد المنتجات الرابحة والمباشرة بمضاعفة ميزانية الحملة بنسبة 50%." },
        { day: 29, title: "تجهيز العروض الحصرية لزبائنك السابقين لإعادة استهدافهم مجاناً." },
        { day: 30, title: "بلوغ عتبة الـ 100 طلب الأولى بنجاح والبدء ببرمجة نظام العمل التلقائي." }
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
    <div className="space-y-12 py-8 px-4 max-w-7xl mx-auto" id="vizion-growth-suite">
      
      {/* Dynamic Main Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-xs text-[#F0C040] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vizion OS • لوحة التحكم والتشغيل المالي والتسويقي التفاعلية</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
          لا تخمن أرقامك.. تحكّم بمشروعك مثل المحترفين
        </h2>
        
        <p className="text-sm text-white/60 leading-relaxed font-light">
          صممنا لك نظاماً تفاعلياً متكاملاً يحتوي على <strong className="text-[#F0C040]">13 أداة ومحاكياً ذكياً</strong> مبنياً بالكامل على واقع السوق العراقي، لمساعدتك على اتخاذ قراراتك بناءً على الأرقام الصارمة بدلاً من التخمين والشك اليومي.
        </p>
      </div>

      {/* Main Grid: Tabs Sidebar + Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MOBILE SELECTOR & LAUNCHPAD (Visible only on mobile/tablet) */}
        <div className="lg:hidden w-full space-y-3 mb-4 text-right">
          
          {/* Active Tool Label & Launchpad Toggle Button */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1735]/60 to-[#040B24]/90 border border-white/10 p-3 rounded-2xl shadow-lg">
            <div className="text-right">
              <span className="text-[10px] text-white/40 block leading-none mb-1 font-medium">الأداة النشطة حالياً:</span>
              <span className="text-sm font-black text-[#F0C040] flex items-center gap-1.5 justify-end">
                <span>{toolTabs.find(t => t.id === activeTab)?.label}</span>
              </span>
            </div>
            
            <button
              onClick={() => setIsLaunchpadOpen(!isLaunchpadOpen)}
              className="px-3.5 py-2 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/30 hover:border-[#D4A017]/50 rounded-xl text-[#F0C040] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4A017]/2"
            >
              <span>{isLaunchpadOpen ? "إغلاق اللوحة ✕" : "عرض كل الأدوات (١٣) 🔍"}</span>
            </button>
          </div>

          {/* 1. Horizontal Swipeable Ribbon */}
          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-2">
            <div className="flex overflow-x-auto gap-2 pb-1.5 pt-1 px-1 no-scrollbar scroll-smooth" style={{ direction: 'rtl' }}>
              {toolTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsLaunchpadOpen(false); // Close launchpad when a tool is selected
                      // Reset show status for smoother navigation
                      setT1ShowReport(false);
                      setT2ShowAnalysis(false);
                      setT3ShowAnalysis(false);
                      setT4ShowReport(false);
                      setT8ShowScore(false);
                    }}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-gradient-to-l from-[#D4A017] to-amber-500 text-[#040B24] border-[#D4A017] shadow-md shadow-[#D4A017]/10 scale-102"
                        : "bg-white/[0.03] border-white/5 text-white/80 hover:bg-white/10 hover:border-white/15"
                    }`}
                  >
                    <span>{tab.label.split(" ")[0]}</span> {/* Emoji */}
                    <span>{tab.label.substring(tab.label.indexOf(" ") + 1)}</span> {/* Text */}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-white/30 text-center mt-1.5 font-light flex items-center justify-center gap-1">
              <span>← اسحب لليمين واليسار للتنقل السريع بين الأدوات الـ ١٣ →</span>
            </div>
          </div>

          {/* 2. Expandable Launchpad Grid */}
          {isLaunchpadOpen && (
            <div className="bg-gradient-to-b from-[#0F1735]/95 to-[#040B24]/98 border border-[#D4A017]/40 rounded-2xl p-4 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-10">
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4A017]/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="text-right mb-4 border-b border-white/10 pb-3 flex justify-between items-center">
                <span className="text-[10px] text-white/40">اضغط على أي أداة لتفعيلها فوراً:</span>
                <h4 className="text-xs font-black text-[#F0C040] uppercase tracking-wider flex items-center gap-1.5 justify-end">
                  <span>لوحة اختيار الأدوات المباشرة</span>
                  <span>⚙️</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {toolTabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsLaunchpadOpen(false); // Close after selection
                        // Reset show status for smoother navigation
                        setT1ShowReport(false);
                        setT2ShowAnalysis(false);
                        setT3ShowAnalysis(false);
                        setT4ShowReport(false);
                        setT8ShowScore(false);
                      }}
                      className={`p-3 rounded-xl border text-right transition-all duration-200 cursor-pointer flex flex-col justify-between h-[95px] ${
                        isActive
                          ? "bg-gradient-to-bl from-[#D4A017]/20 to-[#040B24] border-[#D4A017] text-[#F0C040] shadow-md shadow-[#D4A017]/5"
                          : "bg-white/[0.02] border-white/5 text-white/80 hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      <span className="text-lg block mb-1">{tab.label.split(" ")[0]}</span>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black block truncate leading-tight">
                          {tab.label.substring(tab.label.indexOf(" ") + 1)}
                        </span>
                        <span className="text-[9px] text-white/45 block line-clamp-1 font-light leading-none">
                          {tab.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDE BAR / SELECTOR RAIL (4 Columns, hidden on mobile/tablet) */}
        <div className="hidden lg:block lg:col-span-4 bg-gradient-to-b from-[#0F1735]/60 to-[#040B24]/90 border border-white/5 rounded-3xl p-4 md:p-5 space-y-3 shadow-2xl h-[650px] overflow-y-auto pr-1 no-scrollbar">
          <span className="text-[11px] font-black text-[#F0C040] block mr-1 uppercase tracking-wider">
            ⚙️ أدوات نظام التشغيل والتحكم (Vizion OS Tools):
          </span>
          
          <div className="space-y-1.5">
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
                  className={`w-full p-3.5 rounded-2xl border text-right transition-all duration-300 relative cursor-pointer flex items-center justify-between group overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-l from-[#D4A017]/15 to-[#040B24] border-[#D4A017] text-[#F0C040] shadow-xl shadow-[#D4A017]/5 scale-[1.01]"
                      : "bg-white/[0.01] border-white/5 text-white/70 hover:bg-white/[0.03] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="space-y-0.5 text-right">
                      <h4 className="font-extrabold text-xs text-white group-hover:text-[#F0C040] transition-colors">
                        {tab.label}
                      </h4>
                      <p className="text-[9px] text-white/40 group-hover:text-white/60 transition-colors">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] transition-transform ${isActive ? "text-[#F0C040] translate-x-1" : "text-white/20 group-hover:text-white/40"}`}>
                    ◀
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT VIEWPORT (8 Columns) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-[#0F1735]/40 to-black/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative min-h-[650px] flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-6">
            
            {/* TOOL 1: Business Diagnostics Wizard */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🩺</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">فحص سلامة وربحية مشروعك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مقيِّم البزنس العراقي المتكامل</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أدخل أرقام مشروعك الحالية لنكشف لك فوراً عن نقاط القوة الخفية وأماكن نزيف الأموال التي قد تؤدي لخسارة رأس مالك دون أن تشعر.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات شهرياً (المرسلة والمؤكدة):</label>
                    <input
                      type="number"
                      value={t1MonthlyOrders}
                      onChange={(e) => setT1MonthlyOrders(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر بيع المنتج النهائي للزبون (د.ع):</label>
                    <input
                      type="number"
                      value={t1SellingPrice}
                      onChange={(e) => setT1SellingPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">تكلفة شراء المنتج من المورد جملة (د.ع):</label>
                    <input
                      type="number"
                      value={t1ProductCost}
                      onChange={(e) => setT1ProductCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">متوسط تكلفة الرسالة الواحدة بالإعلان (د.ع):</label>
                    <input
                      type="number"
                      value={t1MessageCost}
                      onChange={(e) => setT1MessageCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">نسبة الطلبات المرتجعة من التوصيل (%):</label>
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
                    <label className="text-xs font-bold text-white/80 block">نسبة تحويل الرسائل إلى طلبات مؤكدة (%):</label>
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
                    <span>افحص مشروعي واعرض التقرير المفصل الآن</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t1ShowReport && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <h4 className="text-sm font-black text-[#F0C040] flex items-center gap-2 border-b border-white/5 pb-2">
                      <span>📊</span>
                      <span>تقرير فحص الأداء والربحية للمشروع:</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">المبيعات المستلمة</span>
                        <span className="text-base font-black text-emerald-400 font-mono">{diagResult.estimatedDelivered} طرد</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">الطرود المرتجعة</span>
                        <span className="text-base font-black text-red-400 font-mono">{diagResult.estimatedReturned} طرد</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">ميزانية الإعلان المطلوبة</span>
                        <span className="text-xs sm:text-sm font-black text-[#F0C040] font-mono">{(diagResult.totalAdSpend).toLocaleString()} د.ع</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/40 block">صافي الربح الفعلي</span>
                        <span className={`text-xs sm:text-sm font-black font-mono ${diagResult.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {(diagResult.netProfit).toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>

                    {/* Verdict Box */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border-r-4 border-[#D4A017] space-y-2">
                      <span className="text-xs font-bold text-white block">التشخيص الفني المباشر:</span>
                      <ul className="space-y-1.5 text-[11px] text-white/70 leading-relaxed">
                        {t1ReturnRate > 20 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>المرتجعات تأكل أرباحك:</strong> نسبة المرتجعات مالتك ({t1ReturnRate}%) مرتفعة جداً وتسبب خسارة في كلف الشحن والإعلانات الضائعة. تحتاج تفعيل الرد الهاتفي وفيديو الواتساب فوراً.</span>
                          </li>
                        )}
                        {t1ConversionRate < 10 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>الرد على الرسائل ضعيف:</strong> نسبة تحويل الرسائل ({t1ConversionRate}%) منخفضة. هذا يعني أن إعلاناتك تجذب الفضوليين أو أن الرد بالخاص يحتاج معالجة جذرية وسريعة.</span>
                          </li>
                        )}
                        {t1SellingPrice - t1ProductCost < 15000 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span>❌</span>
                            <span><strong>هامش الربح ضيق:</strong> الفرق بين سعر الشراء والبيع قليل جداً ولا يغطي كلف الشحن والإعلانات المرتفعة بالعراق.</span>
                          </li>
                        )}
                        {t1ReturnRate <= 20 && t1ConversionRate >= 10 && t1SellingPrice - t1ProductCost >= 15000 && (
                          <li className="flex items-start gap-1.5 text-emerald-300">
                            <span>✔</span>
                            <span><strong>هيكل مشروعك ممتاز:</strong> الأرقام تدل على مشروع ذو أساس قوي. ركز على زيادة ميزانية الإعلان تدريجياً لمضاعفة مبيعاتك وأرباحك.</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Future Potential Projection */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                      <strong>💰 فرصة تحسين الكاش لمشروعك:</strong> إذا نجحت في تطبيق نظامنا وخفضت المرتجعات إلى <strong>10%</strong> وحسّنت تحويل الرسائل إلى <strong>15%</strong>، فإن صافي أرباحك الشهري المتوقع سيرتفع من <span className="font-mono text-white underline">{Math.round(diagResult.netProfit).toLocaleString()} د.ع</span> إلى <strong className="text-emerald-400 font-mono underline">{Math.round((t1MonthlyOrders * 0.9 * t1SellingPrice) - (t1MonthlyOrders * t1ProductCost) - (t1MonthlyOrders * 5000) - (Math.round(t1MonthlyOrders / 0.15) * t1MessageCost)).toLocaleString()} د.ع</strong>! أي زيادة صافية ممتازة دون زيادة ميزانية الإعلان.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">بدل التخمين وخسارة رأس المال</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مستشار الحملات الإعلانية الذكي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أدخل بيانات حملتك الإعلانية الحالية أو التجريبية، وسيقوم النظام الذكي بتحليلها وتشخيص الخلل الدقيق وإعطائك الحل بلهجة عملية سريعة.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">الميزانية المصروفة بالإعلان (د.ع):</label>
                    <input
                      type="number"
                      value={t2Spend}
                      onChange={(e) => setT2Spend(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الرسائل المستلمة بالإعلان:</label>
                    <input
                      type="number"
                      value={t2Messages}
                      onChange={(e) => setT2Messages(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات المؤكدة تلفونياً:</label>
                    <input
                      type="number"
                      value={t2Confirmed}
                      onChange={(e) => setT2Confirmed(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات المستلمة والمسلمة فعلياً:</label>
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
                    <span>حلل نتائج حملتي الإعلانية الآن</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t2ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-[#F0C040]">🔍 نتائج التحليل الفني للحملة:</h4>
                      <span className="text-xs text-white/40 font-mono">سعر الرسالة الفعلي: {getAdAnalysis().costPerMsg.toLocaleString()} د.ع</span>
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
                      <span className="text-xs font-bold text-[#F0C040] block">🛠️ الخطوات والتعديلات العملية المطلوبة فوراً:</span>
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
                    <span className="text-[10px] text-[#F0C040] font-bold">افهم السوق وحلل خصومك قانونياً</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل استراتيجية المنافسين</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أدخل اسم أو مجال صفحة أي منافس محلي يبيع نفس منتجاتك، وسنكشف لك أسلوبه في النشر ونقاط ضعفه التي يمكنك استغلالها فوراً للتفوق عليه.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">اسم صفحة المنافس (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: متجر الهدايا الفخمة"
                      value={t3Name}
                      onChange={(e) => setT3Name(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-right focus:border-[#D4A017] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">مجال أو فئة مشروع المنافس:</label>
                    <select
                      value={t3Niche}
                      onChange={(e) => setT3Niche(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:border-[#D4A017] outline-none"
                    >
                      <option value="clothing">الملابس والأزياء العصرية</option>
                      <option value="perfumes">العطور ومستحضرات التجميل</option>
                      <option value="electronics">الأجهزة والملحقات الإلكترونية</option>
                      <option value="other">مجالات وهدايا أخرى متنوعة</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT3ShowAnalysis(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>حلل استراتيجية المنافس واعرض الفرص</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t3ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <h4 className="text-sm font-black text-[#F0C040] border-b border-white/5 pb-2">
                      📋 خطة التغلب على {t3Name || "المنافس المتواجد بالسوق"}:
                    </h4>

                    <div className="space-y-3 text-xs text-white/80">
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <strong className="text-red-300">🔴 نقطة الضعف الشائعة لديهم:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().weakness}</p>
                      </div>

                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <strong className="text-emerald-300">🟢 فرصتك المتاحة للتميز:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().opportunity}</p>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <strong className="text-[#F0C040]">🎯 الخطاف المقترح لإعلانك القادم:</strong>
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
                    <span className="text-[10px] text-[#F0C040] font-bold">تجيك رسائل هواي وماكو طلبات؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل جودة ونسبة تحويل الرسائل</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  إذا كنت تعاني من كثرة المستفسرين وقلة المشترين الفعليين بالخاص، أدخل أرقام الرسائل والطلبات لتعرف المشكلة الحقيقية أين تكمن بالضبط.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الرسائل الواردة الكلية:</label>
                    <input
                      type="number"
                      value={t4Messages}
                      onChange={(e) => setT4Messages(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات التي تم إغلاقها بنجاح:</label>
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
                    <span>حلل جودة الرسائل واكشف الخلل</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t4ShowReport && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    {/* Diagnostic Score Card */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-[#F0C040]">📝 تشخيص معدل غلق الصفقات:</h4>
                      <span className="text-xs text-white/50 font-mono">نسبة التحويل: {((t4Orders / t4Messages) * 100).toFixed(1)}%</span>
                    </div>

                    {((t4Orders / t4Messages) * 100) < 5 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-300">
                          ⚠️ <strong>وضع حرج للغاية:</strong> نسبة التحويل أقل من 5%. الزبائن يدخلون ويخرجون مباشرة دون حوار مثمر.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span>❌</span>
                            <span><strong>المحتوى مظلل أو خاطئ:</strong> قد يكون الإعلان يوحي بسعر رخيص جداً أو منتج مختلف، وعندما يعرفون السعر الحقيقي يغادرون فوراً.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>❌</span>
                            <span><strong>طريقة الرد الآلي:</strong> إرسال كليشة جاهزة طويلة جداً ومملة تنفر الزبون. تواصل معهم بطريقة ودية مخصصة.</span>
                          </li>
                        </ul>
                      </div>
                    ) : ((t4Orders / t4Messages) * 100) < 12 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300">
                          ⚠️ <strong>أداء متوسط:</strong> هناك اهتمام حقيقي، ولكنك تفقد نصف المبيعات بسبب غياب المتابعة الصارمة أو التردد في العرض.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span>✔</span>
                            <span><strong>تفعيل بصمة الصوت:</strong> جرب إرسال بصمة صوتية دافئة قصيرة بالخاص لشرح تفاصيل الشحن. هذا يحول الزبون المتردد لمشترٍ جاد.</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                        🎉 <strong>أداء ممتاز وخارق!</strong> نسبة غلق الصفقات تتجاوز 12% وهي من أفضل المعدلات في العراق. ركز الآن على زيادة ميزانية إعلاناتك لجلب المزيد من الرسائل ومضاعفة حجم تجارتك.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">المعادلة المالية الصحيحة قبل إطلاق الإعلان</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">حاسبة التسعير والربح الصافي العراقي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  معظم أصحاب الصفحات يفشلون لأنهم لا يحسبون كلف المرتجعات المهدورة. احسب تسعيرك وأرباحك ومعدل نقطة التعادل بدقة المليم.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">تكلفة شراء المنتج جملة (د.ع):</label>
                    <input
                      type="number"
                      value={t5Cost}
                      onChange={(e) => setT5Cost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر بيع المنتج المستهدف (د.ع):</label>
                    <input
                      type="number"
                      value={t5Price}
                      onChange={(e) => setT5Price(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">تكلفة شحن شركة التوصيل (د.ع):</label>
                    <input
                      type="number"
                      value={t5Shipping}
                      onChange={(e) => setT5Shipping(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">تكلفة الإعلان الترويجية لكل طلب مؤكد (د.ع):</label>
                    <input
                      type="number"
                      value={t5AdCost}
                      onChange={(e) => setT5AdCost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-white/80 block">معدل الطلبات المرتجعة المتوقع (%):</label>
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
                  <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📊 كشف حساب الأرباح والخسائر للمنتج:</h4>

                  {/* Math calculation */}
                  {(() => {
                    const returnDec = t5ReturnRate / 100;
                    const deliverDec = 1 - returnDec;
                    
                    // Net profit per delivered order considering return loss
                    // Total revenue = price
                    // We pay product cost for delivered and returned (assuming returned can be resold, but we pay courier return fee, say 5,000 for returned)
                    // If we pay 5,000 IQD courier fee for returned, and also ad cost is wasted on returned
                    const totalAdWastedOnReturnsPerDelivered = (returnDec / deliverDec) * t5AdCost;
                    const totalShippingWastedOnReturnsPerDelivered = (returnDec / deliverDec) * 5000; // 5k courier return penalty
                    
                    const netProfitReal = t5Price - t5Cost - t5Shipping - t5AdCost - totalAdWastedOnReturnsPerDelivered - totalShippingWastedOnReturnsPerDelivered;
                    
                    const minSafePrice = Math.round(t5Cost + t5Shipping + t5AdCost + (returnDec / deliverDec) * (t5AdCost + 5000));
                    const ordersToTarget = Math.ceil(1500000 / netProfitReal);

                    return (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">صافي الربح الحقيقي لكل طلب</span>
                            <span className={`text-base font-black font-mono ${netProfitReal > 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {Math.round(netProfitReal).toLocaleString()} د.ع
                            </span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">أقل سعر بيع لتجنب الخسارة</span>
                            <span className="text-base font-black text-amber-400 font-mono">{minSafePrice.toLocaleString()} د.ع</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/50 block">طلبات مطلوبة لربح (١.٥ مليون)</span>
                            <span className="text-base font-black text-white font-mono">
                              {ordersToTarget > 0 && ordersToTarget < 10000 ? ordersToTarget : "غير ممكن"} طلب
                            </span>
                          </div>
                        </div>

                        {netProfitReal <= 0 ? (
                          <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-300">
                            ⚠️ <strong>تنبيه خسارة مالية!</strong> بهذا السعر ونسبة المرتجعات مالتك، أنت تخسر فعلياً من كل طرد تشحنه. يرجى رفع السعر أو خفض تكلفة الإعلان والمرتجعات فوراً.
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-300">
                            ✔ <strong>تسعير ممتاز وآمن!</strong> أرباحك الصافية ممتازة بعد احتساب الخسائر اللوجستية والمرتجعات. مشروعك جاهز ومصمم للنمو السريع.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">سكريبتات رد عراقية تضمن غلق الصفقات</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">دليل أنواع الزبائن العراقيين</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  تعرف على أشهر 5 زبائن يراسلون صفحتك يومياً، واكتشف الخوف الخفي لديهم والردود الحقيقية المكتوبة بلهجة ودية تقنعهم بالشراء مباشرة.
                </p>

                {/* Grid of customers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => setActiveCustomer("ghoster")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "ghoster" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    👻 زبون (ببيش؟) ويختفي
                  </button>
                  <button
                    onClick={() => setActiveCustomer("bargainer")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "bargainer" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    💵 زبون (أريد خصم)
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
                    ⏳ زبون (أرجعلك بعدين)
                  </button>
                  <button
                    onClick={() => setActiveCustomer("comparer")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-[11px] font-bold ${activeCustomer === "comparer" ? "bg-[#D4A017]/20 border-[#D4A017] text-white" : "bg-white/5 border-white/5 text-white/60"}`}
                  >
                    ⚖️ زبون المقارنة
                  </button>
                </div>

                {/* Customer specific detail */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  {activeCustomer === "ghoster" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">👻 الزبون الذي يسأل عن السعر ويختفي مباشرة:</span>
                        <p className="text-white/50 text-[10px] mt-0.5">سبب المشكلة: يشعر بأن الرد آلي ويريد فقط تلبية فضوله البصري.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">السر النفسي للحل:</strong> لا تعط السعر الجاف وتسكت. قدم قيمة العرض، واعرض ميزة فحص المنتج عند الباب لبناء الأمان الفوري.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد البغدادي المقترح (سكريبت):</span>
                        <p className="text-white/90">
                          "يا هلا بيك عيني الغالي.. بخصوص العطر الفواح، سعره مع الشحن والضمان كامل هو 35 ألف فقط. وميزة متجرنا الأهم: المندوب من يوصلك تكدر تفتح الطرد وتفحص ريحة العطر وتتأكد بنفسك، وإذا ما عجبك ترجعه ويا المندوب بدون ما تدفع أي شي! كم علبة حاب نثبتلك عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "bargainer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">💵 زبون (أكو خصم عيني؟ أريده أرخص):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">سبب المشكلة: يعشق إحساس الفوز بالصفقات والخصم النفسي.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">السر النفسي للحل:</strong> لا تقل "لا" مباشرة. قدم له عرضاً ثنائياً أو هدية مضافة (مثل الشحن المجاني للقطعتين) بدلاً من خفض قيمة منتجك المفرد.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد البغدادي المقترح (سكريبت):</span>
                        <p className="text-white/90">
                          "عيني فدوة لعينك السعر محدد لأن الخامة أصلية ومكفولة، بس لعيونك الطيبة.. إذا تاخذ قطعتين اليوم، راح نلغي كلفة التوصيل تماماً ويصير الشحن مجاني لعنوانك! أو نهديك وياها هدية تليق بيك. تفضل عيني تختار العرض الذهبي؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "hesitant" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">🧐 الزبون المتردد / خايف من النصب وجودة المنتج:</span>
                        <p className="text-white/50 text-[10px] mt-0.5">سبب المشكلة: تعرض للنصب مسبقاً من صفحات عشوائية غير موثوقة.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">السر النفسي للحل:</strong> أزل الخوف تماماً عبر تقديم كفالة مكتوبة وضمان الفحص الميداني الفوري قبل الاستلام.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد البغدادي المقترح (سكريبت):</span>
                        <p className="text-white/90">
                          "حقك عيني تخاف السوق هاليومين بيه شغلات هواي.. لهذا السبب وفرنا ميزة الفحص عند الاستلام. تفتح الطرد وتجرب المادة بإيدك وباب بيتكم، وبضمان حقيقي 6 أشهر كاملة من متجرنا بورقة كفالة مختومة داخل الكارتون. حاب نسجلك حجز اليوم عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "delayed" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">⏳ زبون (أفكر وأرجعلك / من يجي الراتب):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">سبب المشكلة: يحتاج حافزاً نفسياً حاسماً لإنهاء التردد والمماطلة.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">السر النفسي للحل:</strong> اصنع شعوراً بالندرة وضيق الوقت (Scarcity) أو اعرض تأجيل الشحن ليوم الراتب مجاناً.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد البغدادي المقترح (سكريبت):</span>
                        <p className="text-white/90">
                          "فكر براحتك عيني الغالي.. بس علمود ما تفوتك الفرصة، بقت عندنا آخر 3 قطع بهذا العرض والسعر الحالي، إذا حاب نحجزلج قطعة ونبرمج شحنها لعنوانك يوصلك حصراً بيوم راتبك الجاي وتستلمها برغبتك، تآمرنا أمر؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "comparer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">⚖️ زبون المقارنة (شفت صفحة ثانية تبيعه أرخص منكم):</span>
                        <p className="text-white/50 text-[10px] mt-0.5">سبب المشكلة: يريد تبرير فرق السعر ليشعر بالراحة.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-[#F0C040]">السر النفسي للحل:</strong> لا تهاجم المنافسين. بل برر فرق السعر بوضوح بجودة الخامة، والضمان، وخدمات ما بعد البيع.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">💬 الرد البغدادي المقترح (سكريبت):</span>
                        <p className="text-white/90">
                          "أهلاً بيك أخي.. فعلاً تكدر تلاقي أنواع أرخص بالإنترنت، بس الفرق عيني بالخامة والضمان. المنتجات الرخيصة تسبب مشاكل بعد أسبوع وما تلاقي أحد يجاوبك بالخاص. ويانا أنت تشتري راحة بالك وضمان حقيقي، وتجربة فحص ممتازة عند الباب قبل لا تدفع فلس واحد. يسوى تجرب الأصلي لو لا عيني؟"
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
                    <span className="text-[10px] text-[#F0C040] font-bold">نماذج حملات محلية حققت ملايين الأرباح</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مكتبة الإعلانات العراقية الحقيقية</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  تصفح 3 إعلانات عراقية واقعية وناجحة، وافهم السر الدقيق والتكنيك الفني المستخدم وراء نجاحها لتطبيقه بمشروعك الإلكتروني اليوم.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">🎬</span>
                    <h4 className="text-xs font-black text-white">١. إعلان الملابس (خطاف التصفية)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو يبدأ بمذيع عراقي يمسك قميصاً ويسكب عليه الماء ليثبت جودته ضد البقع.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> يوقف تصفح العميل خلال أول ثانيتين عبر إثارة فضول بصري صادم، ويثبت الجودة بشكل قاطع وميداني.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">🎥</span>
                    <h4 className="text-xs font-black text-white">٢. إعلان العطور (زاوية التحدي)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      تصوير عفوي لشخص يدخل مكتباً ويسأل الزملاء بدهشة عن سر الرائحة الفواحة الطيبة.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> لا يبدو كإعلان بيعي بارد. بل يشبه المحتوى العفوي الممتع (UGC)، مما يزيد الثقة بنسبة 400%.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-[#D4A017]/30 rounded-2xl space-y-3 transition-all">
                    <span className="text-2xl">📦</span>
                    <h4 className="text-xs font-black text-white">٣. إعلان الهدايا (خطاف الأمان)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو يظهر يدين تقومان بفتح علبة خشبية فاخرة محفورة بالاسم بأسلوب سينمائي مريح.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-[#F0C040] block">سر نجاحه:</strong> يركز على المشاعر وإحساس الهيبة والفخر عند إعطاء الهدية، ويسد البيعة بنهاية الفيديو تلقائياً.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">لا تروج لمنتج فاشل مسبقاً</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مقيِّم المنتجات قبل الترويج</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أجب عن الأسئلة الستة التالية بصدق لنعطيك تقييماً دقيقاً لمدى صلاحية منتجك للنجاح والبيع عبر الإعلانات في العراق.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">هل هامش ربح المنتج يتجاوز 15,000 دينار؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Margin(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Margin ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>نعم</button>
                      <button onClick={() => setT8Margin(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Margin ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">هل يمكنك شرح فائدة المنتج وصدم الزبون بأول 3 ثوانٍ؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Benefit(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Benefit ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>نعم</button>
                      <button onClick={() => setT8Benefit(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Benefit ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">هل المنتج متوفر بسهولة بالأسواق المحلية العادية (الشورجة أو الكرادة)؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Problem(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Problem ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>نعم</button>
                      <button onClick={() => setT8Problem(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Problem ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">هل وزن المنتج خفيف وسهل الشحن والتغليف بدون تلف؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Ship(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Ship ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>نعم</button>
                      <button onClick={() => setT8Ship(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Ship ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">هل تملك فيديوهات تصوير شخصية حقيقية للمنتج (غير مسروقة)؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Video(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Video ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>نعم</button>
                      <button onClick={() => setT8Video(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Video ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/60"}`}>لا</button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT8ShowScore(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>احسب نتيجة تقييم جودة المنتج</span>
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
                            <span className="font-black text-white">درجة جاهزية المنتج للترويج:</span>
                            <span className="font-mono text-base font-black text-[#F0C040]">{score} / 100</span>
                          </div>

                          {score >= 75 ? (
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-300 leading-relaxed font-light">
                              🎉 <strong>منتج خارق وجاهز للإعلانات!</strong> يمتلك كل مقومات النجاح والانتشار السريع. ننصح بالبدء بصناعة فيديوهات ترويجية وإطلاق الحملة فوراً دون تردد.
                            </div>
                          ) : score >= 50 ? (
                            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-amber-300 leading-relaxed font-light">
                              ⚠️ <strong>جاهزية متوسطة:</strong> المنتج جيد ولكنه يواجه بعض التحديات (مثل قلة الهامش أو توافره بكثرة بالشورجة). حاول تعديل سعرك أو صناعة زاوية عرض مبتكرة لتفادي الخسارة مسبقاً.
                            </div>
                          ) : (
                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-red-300 leading-relaxed font-light">
                              ❌ <strong>مخاطرة عالية جداً!</strong> هذا المنتج قد يحرق ميزانيتك بالكامل بسبب ضعف هوامش الربح أو صعوبة شحنه. لا ننصح بصرف كلف الترويج عليه إلا بعد معالجة هذه الثغرات وتوفير تصوير حقيقي.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">أين يختفي كاش مبيعاتك؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">كاشف تسرب الأرباح اللوجستي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  معظم التجار في العراق لا يعرفون حجم الخسائر الفعلية الناتجة عن أجور الراجع والغرامات اللوجستية لشركات التوصيل. احسب نزيف كاشك الآن.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">الطلبات الكلية المشحونة شهرياً:</label>
                    <input
                      type="number"
                      value={t9Orders}
                      onChange={(e) => setT9Orders(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">أجور توصيل الراجع للشركة (د.ع):</label>
                    <input
                      type="number"
                      value={t9ReturnFee}
                      onChange={(e) => setT9ReturnFee(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">نسبة المرتجع المتوقعة (%):</label>
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
                      <h4 className="text-xs font-black text-red-400 border-b border-white/5 pb-2">🚨 حجم تسرب كاش مبيعاتك الفعلي:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الطرود المرتجعة المرفوضة</span>
                          <span className="text-sm font-black text-red-400 font-mono">{numReturned} طرد شهرياً</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">خسارة أجور التوصيل للراجع</span>
                          <span className="text-sm font-black text-red-400 font-mono">{(directLossWasted).toLocaleString()} د.ع</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">إجمالي كاشك المحروق بالهواء</span>
                          <span className="text-sm font-black text-[#F0C040] font-mono">{(totalWastedWithAds).toLocaleString()} د.ع</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/60 leading-relaxed font-light">
                        * فكر فيها عيني: ميزانية بقيمة <strong className="text-red-400 font-mono">{(totalWastedWithAds).toLocaleString()} د.ع</strong> تذهب شهرياً للعدم بسبب غياب المتابعة وتأكيد الطلبات وسوء تنسيق المندوبين. تطبيقك لحلول نظامنا سيحمي هذا الكاش ويرجعه لصافي جيبك فوراً.
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
                    <span className="text-[10px] text-[#F0C040] font-bold">بناء خطوة بخطوة بدون ارتباك وتخبط</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مخطط الوصول لأول 100 طلب تجاري</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  خارطة طريق تفاعلية مرتبة يوماً بيوم. حدد الأسبوع لتتابع مهامك اليومية واضغط على المهمة لتسجيل إنجازها ومراقبة تقدم مشروعك.
                </p>

                {/* Week selector */}
                <div className="flex justify-between border-b border-white/10 pb-2">
                  {[1, 2, 3, 4].map((wk) => (
                    <button
                      key={wk}
                      onClick={() => setT10SelectedWeek(wk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${t10SelectedWeek === wk ? "bg-[#D4A017] text-[#040B24] shadow-md" : "text-white/60 hover:text-white"}`}
                    >
                      الأسبوع {wk}
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
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isChecked ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>اليوم {d.day}</span>
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
                  <span className="text-white/60 font-light">معدل التقدم الإجمالي لمشروعك:</span>
                  <strong className="text-[#F0C040] font-mono">{Math.round((t10CheckedDays.length / 30) * 100)}% ({t10CheckedDays.length} / 30 يوماً)</strong>
                </div>
              </div>
            )}

            {/* TOOL 11: What's stopping my sales? Diagnostic */}
            {activeTab === "sales-blocker" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">🧠</span>
                  <div>
                    <span className="text-[10px] text-[#F0C040] font-bold">تحديد العطل الأساسي بمشروعك بـ 5 دقائق</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">ليش ما دي أحقق مبيعات كافية؟</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  جاوب بصدق على الأسئلة الأربعة البسيطة التالية حول أرقامك الحالية، وسنكشف لك بدقة هندسية أين يقع العطل الأساسي بمشروعك وكيفية إصلاحه فوراً.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-right">
                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">١. كم نسبة النقر على إعلانك (CTR)؟</label>
                    <select value={t11CTR} onChange={(e) => setT11CTR(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">ضعيفة (أقل من 1% - الزباين يعبرون إعلانك)</option>
                      <option value="medium">متوسطة (1% إلى 2%)</option>
                      <option value="high">قوية (أكثر من 2% - تفاعل عالي جداً)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٢. كيف حجم الرسائل التي تصل لصفحتك؟</label>
                    <select value={t11Messages} onChange={(e) => setT11Messages(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">قليل جداً وشبه معدوم</option>
                      <option value="high">رسائل كثيرة ومستمرة يومياً</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٣. كيف سرعة وأسلوب ردك على الرسائل؟</label>
                    <select value={t11Speed} onChange={(e) => setT11Speed(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="slow">بطيء (أكثر من ساعتين) أو رد آلي جاف</option>
                      <option value="fast">سريع جداً (أقل من 15 دقيقة) وبأسلوب بشري ودود</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٤. كم نسبة استلام وتوصيل طرودك الميدانية؟</label>
                    <select value={t11Delivery} onChange={(e) => setT11Delivery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#D4A017] outline-none">
                      <option value="low">ضعيفة (أقل من 70% مرتجعات كثيرة)</option>
                      <option value="high">ممتازة (أكثر من 70% استلام عالي)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setT11ShowResult(true)}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>كافح المشكلة وشخّص العطل فوراً</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t11ShowResult && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down text-xs">
                    <h4 className="text-sm font-black text-[#F0C040] border-b border-white/5 pb-2">🩺 تقرير تشخيص الأعطال الهندسية لمشروعك:</h4>

                    {t11CTR === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 العطل الأول: ضعف المحتوى الإبداعي والخطاف الإعلاني</strong>
                        <p className="text-white/70 leading-relaxed font-light">إعلانك ممل جداً وتكلفة الرسالة ستكون غالية لأن الزبائن العراقيين يتجاهلونه أثناء التصفح. حل العطل: أعد تصوير المنتج بيدك بكاميرا تلفون واعرض فائدته الصادمة بأول 3 ثوانٍ فورا.</p>
                      </div>
                    )}

                    {t11Messages === "low" && t11CTR !== "low" && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1 text-amber-300">
                        <strong>🚨 العطل الثاني: سوء إعداد الاستهداف أو ميزانية الترويج</strong>
                        <p className="text-white/70 leading-relaxed font-light">المشكلة ليست بالفيديو، بل بحجم الصرف أو سوء اختيار الجمهور بمدير الإعلانات. حل العطل: أطلق حملة رسائل (Messages Campaign) واسعة بدون تحديد اهتمامات معقدة واترك خوارزمية فيسبوك تفلتر الزبائن.</p>
                      </div>
                    )}

                    {t11Speed === "slow" && t11Messages === "high" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 العطل الثالث: بطء وجفاف ردود خدمة العملاء بالخاص</strong>
                        <p className="text-white/70 leading-relaxed font-light">تخسر 80% من الكاش لأنك تترك الزبون ينتظر لساعات حتى تبرد رغبته بالشراء تماماً. حل العطل: تفعيل ميزة 'بصمة الصوت الدافئة' والرد خلال 15 دقيقة كحد أقصى.</p>
                      </div>
                    )}

                    {t11Delivery === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>🚨 العطل الرابع: ضعف نظام التأكيد والالتزام اللوجستي</strong>
                        <p className="text-white/70 leading-relaxed font-light">أنت تقوم بشحن طرود عشوائية دون تواصل هاتفي صارم للتأكيد، مما يجعل المندوب يسجلها مرتجعاً تالفاً. حل العطل: تفعيل مكالمة التأكيد الفورية وفيديو التعبئة الشخصي للواتساب.</p>
                      </div>
                    )}

                    {t11CTR === "high" && t11Messages === "high" && t11Speed === "fast" && t11Delivery === "high" && (
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1 text-emerald-300">
                        <strong>🎉 مشروعك فائق الصحة والأمان اللوجستي!</strong>
                        <p className="text-white/70 leading-relaxed font-light">كافة الأركان الأربعة تعمل بجاذبية تامة. ننصح بزيادة الميزانية الإعلانية تدريجياً وإضافة منتجات رابحة مكملة لمضاعفة أرباحك الصافية.</p>
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
                    <span className="text-[10px] text-[#F0C040] font-bold">توقع نتائج حملتك قبل لا تدفع فلس واحد</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">متوقع المبيعات والأرباح الإعلانية</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  قبل أن تقوم بإطلاق وتفعيل أي حملة ترويجية بفيسبوك أو انستغرام، أدخل ميزانيتك المقترحة لترى حجم المبيعات المتوقعة والطلبات والصافي المالي.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">ميزانية الإعلان المقترحة (د.ع):</label>
                    <input
                      type="number"
                      value={t12Budget}
                      onChange={(e) => setT12Budget(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر الرسالة المتوقع (د.ع):</label>
                    <input
                      type="number"
                      value={t12MsgCost}
                      onChange={(e) => setT12MsgCost(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">نسبة تحويل الرسائل للطلبات (%):</label>
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
                      <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📋 نتائج التوقع المالي المستقبلي للحملة:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الرسائل المتوقعة للحملة</span>
                          <span className="text-sm font-black text-white font-mono">{expectedMessages} رسالة</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">الطلبات المؤكدة المتوقعة</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">{expectedOrders} طلب</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">تكلفة الإعلان الفعلي للطلب</span>
                          <span className="text-sm font-black text-amber-400 font-mono">{(costPerOrder).toLocaleString()} د.ع / طلب</span>
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
                    <span className="text-[10px] text-[#F0C040] font-bold">لا تصرف ميزانيتك بعشوائية وضياع</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مخطط ميزانية الترويج والتمويل الإعلاني</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  حدد صافي الأرباح المالية التي ترغب بتحقيقها شهرياً وهامش ربح المنتج الصافي، وسيقوم النظام بتخطيط الميزانية الإعلانية التقريبية التي تحتاجها للوصول لهدفك المالي.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">صافي الربح الشهري المطلوب تحقيقه (د.ع):</label>
                    <input
                      type="number"
                      value={t13TargetProfit}
                      onChange={(e) => setT13TargetProfit(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-left focus:border-[#D4A017] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">هامش ربح المنتج الصافي (قبل كلف الإعلان) (د.ع):</label>
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
                      <h4 className="text-xs font-black text-[#F0C040] border-b border-white/5 pb-2">📋 الخطة المالية الإعلانية المقترحة لهدفك:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">المبيعات المطلوبة شهرياً للهدف</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {requiredOrders > 0 && requiredOrders < 100000 ? requiredOrders : "هامش ربح منخفض جداً"} طلب
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/40 block">ميزانية الإعلان التقريبية المطلوبة</span>
                          <span className="text-sm font-black text-[#F0C040] font-mono">
                            {estimatedBudgetRequired > 0 && estimatedBudgetRequired < 1000000000 ? (estimatedBudgetRequired).toLocaleString() : 0} د.ع
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/40 text-center leading-relaxed">
                        * الأرقام أعلاه تقريبية وتعتمد على جودة استهدافك وتصميم إعلانك ونظام التوصيل الفعلي لديك.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

          {/* Golden Footer branding for Vizion OS */}
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/45">
            <span>نظام فيزيون التشغيلي المتكامل • Vizion OS</span>
            <span>بيانات محلية دقيقة وحاسبات ذكية بنسبة 100%</span>
          </div>
          
        </div>
        
      </div>

    </div>
  );
}
