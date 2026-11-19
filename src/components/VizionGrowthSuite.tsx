import { NumberField } from "./ui/NumberField";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_SNAPPY, collapseMotion, viewSwapMotion } from "../lib/motion";
import { ChipPill } from "./ui/Motion";
import { PageHeader } from "./ui/PageHeader";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Check,
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
import { takePendingTool, type ToolRequest } from "../lib/toolRequest";

export default function VizionGrowthSuite() {
  const [activeTab, setActiveTab] = useState<string>("diagnostics");
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState<boolean>(false);

  const userCode = typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") || "" : "";
  const isFreeTrial = isFreeTrialUser(userCode);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

  const [t1MonthlyOrders, setT1MonthlyOrders] = useState<number>(100);
  const [t1SellingPrice, setT1SellingPrice] = useState<number>(35000);
  const [t1ProductCost, setT1ProductCost] = useState<number>(12000);
  const [t1MessageCost, setT1MessageCost] = useState<number>(2000);
  const [t1ReturnRate, setT1ReturnRate] = useState<number>(25);
  const [t1ConversionRate, setT1ConversionRate] = useState<number>(8);
  const [t1ShowReport, setT1ShowReport] = useState<boolean>(false);

  const [t2Spend, setT2Spend] = useState<number>(150000);
  const [t2Messages, setT2Messages] = useState<number>(60);
  const [t2Confirmed, setT2Confirmed] = useState<number>(12);
  const [t2Delivered, setT2Delivered] = useState<number>(8);
  const [t2ShowAnalysis, setT2ShowAnalysis] = useState<boolean>(false);

  const [t3Name, setT3Name] = useState<string>("");
  const [t3Niche, setT3Niche] = useState<string>("clothing");
  const [t3ShowAnalysis, setT3ShowAnalysis] = useState<boolean>(false);

  const [t4Messages, setT4Messages] = useState<number>(80);
  const [t4Orders, setT4Orders] = useState<number>(6);
  const [t4ShowReport, setT4ShowReport] = useState<boolean>(false);

  const [t5Cost, setT5Cost] = useState<number>(14000);
  const [t5Price, setT5Price] = useState<number>(38000);
  const [t5Shipping, setT5Shipping] = useState<number>(5000);
  const [t5AdCost, setT5AdCost] = useState<number>(7000);
  const [t5ReturnRate, setT5ReturnRate] = useState<number>(20);

  const [activeCustomer, setActiveCustomer] = useState<string>("ghoster");

  const [t8Margin, setT8Margin] = useState<boolean>(true);
  const [t8Benefit, setT8Benefit] = useState<boolean>(true);
  const [t8Problem, setT8Problem] = useState<boolean>(false);
  const [t8Shorja, setT8Shorja] = useState<boolean>(true);
  const [t8Ship, setT8Ship] = useState<boolean>(true);
  const [t8Video, setT8Video] = useState<boolean>(false);
  const [t8ShowScore, setT8ShowScore] = useState<boolean>(false);

  const [t9Orders, setT9Orders] = useState<number>(120);
  const [t9ReturnRate, setT9ReturnRate] = useState<number>(30);
  const [t9ReturnFee, setT9ReturnFee] = useState<number>(5000);

  const [t10CheckedDays, setT10CheckedDays] = useState<number[]>([1, 2, 3]);
  const [t10SelectedWeek, setT10SelectedWeek] = useState<number>(1);

  const [t11CTR, setT11CTR] = useState<string>("low");
  const [t11Messages, setT11Messages] = useState<string>("low");
  const [t11Speed, setT11Speed] = useState<string>("slow");
  const [t11Delivery, setT11Delivery] = useState<string>("low");
  const [t11ShowResult, setT11ShowResult] = useState<boolean>(false);

  const [t12Budget, setT12Budget] = useState<number>(250000);
  const [t12MsgCost, setT12MsgCost] = useState<number>(1800);
  const [t12ConvRate, setT12ConvRate] = useState<number>(10);

  const [t13TargetProfit, setT13TargetProfit] = useState<number>(1500000);
  const [t13ProfitMargin, setT13ProfitMargin] = useState<number>(15000);

  const [selectedCategory, setSelectedCategory] = useState<"all" | "understand" | "calculate" | "optimize" | "execute">("all");

  useEffect(() => {
    const applyRequest = (detail: ToolRequest | null | undefined) => {
      if (!detail) return;
      if (detail.category) {
        setSelectedCategory(detail.category);
        if (detail.category === "calculate") {
          setActiveTab("pricing-calculator");
        } else if (detail.category === "understand") {
          setActiveTab("diagnostics");
        } else if (detail.category === "optimize") {
          setActiveTab("campaign-advisor");
        } else if (detail.category === "execute") {
          setActiveTab("roadmap");
        }
      }
      if (detail.toolId) {
        setActiveTab(detail.toolId);
      }
    };
    const handleCategoryEvent = (e: Event) => {
      takePendingTool();
      applyRequest((e as CustomEvent<ToolRequest>).detail);
    };

    applyRequest(takePendingTool());
    window.addEventListener("open-tool-category", handleCategoryEvent);
    return () => {
      window.removeEventListener("open-tool-category", handleCategoryEvent);
    };
  }, []);

  const toolCategories = [
    { id: "all" as const, label: "كل الأدوات", icon: "" },
    { id: "understand" as const, label: "١. افهم", icon: "", subtitle: "افهم وضع مشروعك ومنافسيك" },
    { id: "calculate" as const, label: "٢. احسب", icon: "", subtitle: "حاسبات الأرباح والتسعير والميزانية" },
    { id: "optimize" as const, label: "٣. طور", icon: "", subtitle: "طور إعلاناتك ومحادثاتك ومنتجك" },
    { id: "execute" as const, label: "٤. نفذ", icon: "", subtitle: "خطط شغل واضحة ومتابعة يومية" },
  ];

  const toolTabs = [
    { id: "diagnostics", category: "understand" as const, label: "افحص مشروعك", desc: "تأكد من وضع مشروعك وربحيته" },
    { id: "sales-blocker", category: "understand" as const, label: "ليش ماكو مبيعات؟", desc: "اكتشف وين الخلل بمشروعك" },
    { id: "customer-types", category: "understand" as const, label: "دليل أنواع الزبائن", desc: "ردود جاهزة ومقنعة حتى تكمل الطلب" },
    { id: "competitors", category: "understand" as const, label: "محلل المنافسين", desc: "راجع صفحات ومحتوى منافسيك" },

    { id: "pricing-calculator", category: "calculate" as const, label: "حاسبة التسعير والربح", desc: "احسب أسعارك وأرباحك بدقة" },
    { id: "profit-leak", category: "calculate" as const, label: "كاشف تسرب الأرباح", desc: "احسب شكد تخسر بسبب الطلبات الراجعة" },
    { id: "forecaster", category: "calculate" as const, label: "توقع الأرباح", desc: "توقع مبيعاتك قبل لا تطلق الإعلان" },
    { id: "budget-planner", category: "calculate" as const, label: "مخطط الميزانية", desc: "رتب ميزانيتك حتى توصل لهدفك" },

    { id: "campaign-advisor", category: "optimize" as const, label: "مستشار الحملات", desc: "افحص أداء حملاتك الإعلانية" },
    { id: "message-diagnoser", category: "optimize" as const, label: "جودة الرسائل", desc: "وين تخسر الزبون بالمحادثة؟" },
    { id: "product-evaluator", category: "optimize" as const, label: "تقييم المنتج", desc: "افحص منتجك قبل لا تصرف عليه" },
    { id: "ads-library", category: "optimize" as const, label: "مكتبة الإعلانات", desc: "تعلم شلون تشتغل الإعلانات الناجحة" },

    { id: "roadmap", category: "execute" as const, label: "مخطط الـ 100 طلب", desc: "خطة يومية حتى تبدي شغلك بطريقة صحيحة" },
  ];

  const filteredToolTabs = selectedCategory === "all" 
    ? toolTabs 
    : toolTabs.filter(t => t.category === selectedCategory);

  const runDiagnosticsCalculator = () => {
    const estimatedShipped = t1MonthlyOrders;
    const estimatedDelivered = Math.round(t1MonthlyOrders * (1 - t1ReturnRate / 100));
    const estimatedReturned = t1MonthlyOrders - estimatedDelivered;

    const totalRevenue = estimatedDelivered * t1SellingPrice;
    const totalProductCost = t1MonthlyOrders * t1ProductCost;
    const totalShippingPaid = (estimatedDelivered * 5000) + (estimatedReturned * 5000);
    
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

  const getAdAnalysis = () => {
    const costPerMsg = Math.round(t2Spend / t2Messages);
    const convRate = parseFloat(((t2Confirmed / t2Messages) * 100).toFixed(1));
    const deliveryRate = parseFloat(((t2Delivered / t2Confirmed) * 100).toFixed(1));
    
    let verdict = "";
    let warning = "";
    let recommendations: string[] = [];

    if (costPerMsg > 3500) {
      warning = "كلفة الرسالة عندك كلش عالية ومكلفة (أكثر من 3,500 دينار).";
      recommendations.push("إعلانك ما يشد الانتباه وما يخلي الزبون يوقف التصفح. غير بداية الإعلان (أول 3 ثواني) وخليها بفيديو حقيقي وعفوي.");
      recommendations.push("استخدم عبارات تشد الانتباه مثل: 'إذا محتار بالهدية..' أو 'لا تشتري عطور رخيصة قبل لا تشوف هذا..'.");
    } else {
      recommendations.push("كلفة الرسالة عندك ممتازة ومناسبة للسوق العراقي.");
    }

    if (convRate < 5) {
      verdict = "الحملة تصرف ميزانيتك بدون فايدة، والمشكلة غالبا بالردود.";
      recommendations.push("نسبة تحويل الرسائل إلى طلبات ضعيفة كلش (" + convRate + "%). ردودك يا إما بطيئة أو آلية وما بيها تفاعل.");
      recommendations.push("لا تدز السعر للزبون وتسكت. احچي وياه بشكل طبيعي وكأنه شخص تعرفه، واستخدم رسالة صوتية بنبرة مريحة بالواتساب.");
    } else if (convRate >= 5 && convRate < 15) {
      verdict = "أداءك متوسط، وتكدر تحسنه بتغييرات بسيطة بطريقة الرد.";
      recommendations.push("خلي الزبون يختار بين لونين أو قياسين بدل ما تسأله 'تريد لو لا؟' حتى تسهل عليه إكمال الطلب.");
    } else {
      verdict = "ردودك ونسبة تحويل الرسائل إلى طلبات كلش ممتازة ومحترفة";
    }

    if (deliveryRate < 70) {
      warning += "بس نسبة استلام الطلبات عندك ضعيفة (" + deliveryRate + "%).";
      recommendations.push("المناديب يواجهون صعوبة بالوصول للزبائن، أو الزبائن يلغون الطلبات بسبب تأخر التوصيل.");
      recommendations.push("اتصل بالزبائن خلال نص ساعة من يرسلون رسالتهم حتى تأكد الطلب بالتلفون، ولا تسلم أي طلب لشركة التوصيل بدون تأكيد.");
      recommendations.push("دز للزبون فيديو لتجهيز طلبيته بالواتساب قبل الشحن، حتى يتأكد من طلبه ويكون مستعد يستلمه.");
    }

    if (recommendations.length === 0) {
      recommendations.push("الحملة أداؤها ممتاز، زيد ميزانيتها فورا وبشكل تدريجي");
    }

    return { costPerMsg, convRate, deliveryRate, verdict, warning, recommendations };
  };

  const getCompetitorTactics = () => {
    switch (t3Niche) {
      case "clothing":
        return {
          weakness: "أغلب صفحات الملابس تنشر صور جاهزة من مواقع أجنبية أو قياسات مو واضحة، وتنتظر الزبون يراسلها.",
          opportunity: "صور الملابس بفيديو حقيقي على شخص يلبسها أو على مانيكان، بكاميرا تلفونك وبإضاءة طبيعية، ووضح الألوان والخامة بصوتك.",
          hook: "شلون تختار القياس المناسب وتقلل الطلبات الراجعة؟ وخلي الزبون يفحص خامة القطعة كدام المندوب قبل الدفع."
        };
      case "perfumes":
        return {
          weakness: "يركزون على شكل علبة العطر ويبيعون بأسعار مبالغ بيها، بدون ما يوضحون شكد يدوم العطر فعليا.",
          opportunity: "ركز بإعلانك على ثبات العطر وفوحانه بحياة الزبون اليومية (بالشغل، بالحر، بالعرس). وقدم ضمان حقيقي (إذا ما عجبك العطر رجعه ويا المندوب وادفع أجور التوصيل بس).",
          hook: "عطر فواح وتثبت ريحته بالملابس حتى بعد الغسل.. جربه بنفسك وإذا ما عجبك لا تستلمه"
        };
      case "electronics":
        return {
          weakness: "يبيعون أجهزة صينية رخيصة بدون كفالة حقيقية، والزبون يخاف ينضحك عليه من صفحات وهمية.",
          opportunity: "قدم كفالة حقيقية لمدة 6 أشهر أو سنة، وياها ورقة كفالة مطبوعة داخل الكارتون. وصور فيديو تفتح بيه الكارتون وتشغل المنتج بنفسك.",
          hook: "جهاز بكفالة حقيقية لمدة سنة كاملة ويا ضمان استرجاع فوري.. لا تشتري جهاز رخيص بدون كفالة وتندم"
        };
      default:
        return {
          weakness: "صفحات بدون ترتيب، ردودها بطيئة ومحتواها منسوخ من صفحات ثانية.",
          opportunity: "رتب صفحتك بشكل احترافي، وصور تجهيز الطلبيات باسم الزبون، وانشر آراء ومحادثات زبائن حقيقيين بعد موافقتهم.",
          hook: "فيديو تجهيز طلبية لزبوننا من البصرة.. شوف التغليف المرتب وشلون نحافظ على الطلبية"
        };
    }
  };

  const roadmapData = [
    {
      week: 1,
      title: "الأسبوع الأول: تأسيس الشغل وحساب الجدوى المالية",
      days: [
        { day: 1, title: "اختيار المنتج المناسب والتأكد من جدواه وحساب صافي الأرباح بالأرقام." },
        { day: 2, title: "فحص جودة المنتج والتأكد من تحمله للتوصيل للمحافظات البعيدة." },
        { day: 3, title: "التواصل ويا شركتين توصيل ومقارنة أجورهم ونسبة الطلبات الراجعة عندهم." },
        { day: 4, title: "تحديد سعر البيع النهائي وضبط ميزانية الحملة التجريبية بدقة." },
        { day: 5, title: "إنشاء صفحات الإنستغرام والفيسبوك وترتيبها بشكل بسيط ومرتب." },
        { day: 6, title: "كتابة سكريبتات الردود وتجهيز الردود السريعة باللهجة المناسبة." },
        { day: 7, title: "مراجعة كل الخطوات والتأكد من أن كلشي شغال بدون مشاكل تقنية." }
      ]
    },
    {
      week: 2,
      title: "الأسبوع الثاني: تجهيز المحتوى وبداية الإعلانات",
      days: [
        { day: 8, title: "تصوير 3 فيديوهات حقيقية للمنتج بكاميرا الموبايل وبإضاءة زينة." },
        { day: 9, title: "تعديل الفيديوهات والتركيز على أول 3 ثواني حتى تشد انتباه الزبون." },
        { day: 10, title: "تجهيز 3 عروض قوية (عرض توفير، قطعتين، أو توصيل مجاني)." },
        { day: 11, title: "نشر المنشورات وتثبيت أهمها حتى تعطي الزبون ثقة بالصفحة." },
        { day: 12, title: "تجهيز حساب الإعلانات وربط طريقة الدفع (زين كاش أو غيرها)." },
        { day: 13, title: "إطلاق أول حملة تجريبية حتى تختبر تفاعل الناس وكلفة الرسالة." },
        { day: 14, title: "مراجعة نتائج أول يوم من الإعلان وتعديل النصوص إذا احتاجت." }
      ]
    },
    {
      week: 3,
      title: "الأسبوع الثالث: إتمام البيعات وتأكيد الطلبيات",
      days: [
        { day: 15, title: "استخدم أسلوب 'الرسالة الصوتية الدافية' ويا كل زبون يستفسر." },
        { day: 16, title: "ميز الزبائن الجديين عن اللي بس يستفسرون، باستخدام طريقة 'إتمام البيعة بالخيارات'." },
        { day: 17, title: "تأكيد أول 10 طلبيات بالتلفون وتسجيل عناوين الزبائن بدقة." },
        { day: 18, title: "صور فيديو تجهيز الطلبية ودزه للزبون بالواتساب." },
        { day: 19, title: "سلم أول مجموعة طلبيات لمندوب التوصيل وتابع حركتها بالنظام." },
        { day: 20, title: "تعلم شلون تتعامل ويا الزبون اللي يكول 'أفكر وأرجعلك' أو 'غالي'." },
        { day: 21, title: "احسب نسبة الزبائن اللي اشتروا فعليا من مجموع الرسائل وسجل ملاحظاتك." }
      ]
    },
    {
      week: 4,
      title: "الأسبوع الرابع: تقليل الطلبات الراجعة واستلام الأرباح",
      days: [
        { day: 22, title: "راجع كشف المندوب اليومي وتأكد من وصول الطلبيات للمحافظات." },
        { day: 23, title: "اتصل بالزبائن المترددين من يوصل المندوب لمنطقتهم." },
        { day: 24, title: "كون علاقة زينة ويا مناديب المناطق الصعبة حتى تساعد على زيادة نسبة استلام الطلبيات." },
        { day: 25, title: "استلم أول كشف حساب يوضح صافي أرباحك من شركة التوصيل." },
        { day: 26, title: "حلل المشاكل وحدد الأماكن اللي تخسر بيها فلوسك واشتغل على حلها." },
        { day: 27, title: "استلم الطلبيات الراجعة وأعد تغليفها مباشرة حتى تجهزها لزبائن غيرهم." },
        { day: 28, title: "حدد المنتجات اللي حققت أفضل نتائج وزيد ميزانية إعلاناتها بنسبة 50%." },
        { day: 29, title: "جهز عروض خاصة لزبائنك السابقين حتى تشجعهم يشترون مرة ثانية." },
        { day: 30, title: "وصلت لأول 100 طلب، وهسه ابدي رتب شغلك حتى يصير يمشي بنظام واضح." }
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
    <div className="vizion-tools-suite space-y-8 sm:space-y-10 pt-8 sm:pt-12 pb-6 px-4 sm:px-6 max-w-7xl mx-auto relative" id="vizion-growth-suite">
      
      <div className="vizion-tools-header space-y-6 relative z-10">
        <PageHeader
          eyebrow={<><Sparkles className="w-4 h-4" /> الأدوات</>}
          title="احسب أرقامك قبل لا تصرف"
          subtitle="13 أداة تحسبلك كلشي بالدينار العراقي. اختار الأداة من القائمة، دخل أرقامك، وتطلعلك النتيجة مباشرة."
        />

        {isFreeTrial && (
          <div className="glass-elevated glass-edge p-5 sm:p-7 rounded-3xl sm:rounded-4xl space-y-3 text-center relative overflow-hidden my-4 z-20 animate-fade-in">
            <div className="vz-eyebrow text-xs sm:text-sm">
              <Lock className="w-4 h-4 text-vz-accent" />
              <span>إنت هسه بالتجربة المجانية</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              الأدوات تنفتح ويا الاشتراك الكامل
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              بالتجربة تتعرف على شغل كل أداة. بالاشتراك تدخل أرقامك وتحصل على النتيجة.
            </p>
            <button               onClick={triggerUpgradeModal}
              className="btn btn-primary px-6 py-3 rounded-xl text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>افتح كل الأدوات</span>
            </button>
          </div>
        )}
      </div>

      <div className="vizion-tool-categories flex flex-wrap items-center justify-start gap-2 pb-2 relative z-10 px-1">
        {toolCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = cat.id === "all" ? toolTabs.length : toolTabs.filter(t => t.category === cat.id).length;
          return (
            <button               key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (cat.id !== "all") {
                  const firstInCat = toolTabs.find(t => t.category === cat.id);
                  if (firstInCat && !toolTabs.filter(t => t.category === cat.id).some(t => t.id === activeTab)) {
                    setActiveTab(firstInCat.id);
                  }
                }
              }}
              data-active={isActive}
              aria-pressed={isActive}
              className="vz-chip shrink-0 text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {isActive && <ChipPill layoutId="suite-category-pill" />}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/10 text-white font-black' : 'bg-white/10 text-white/60'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="vizion-tool-layout grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        <div className="vizion-tool-picker lg:hidden w-full mb-6 relative z-30">
          <div className="glass-elevated rounded-3xl overflow-hidden">
            <button
              onClick={() => setIsLaunchpadOpen(!isLaunchpadOpen)}
              aria-expanded={isLaunchpadOpen}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.04] transition-colors duration-300 cursor-pointer min-h-[44px] active:bg-white/[0.06] motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <div className="text-right">
                <span className="text-[11px] text-white/50 block font-bold mb-1.5">اختار أداة من القائمة ({filteredToolTabs.length})</span>
                <span className="text-base font-black text-white flex items-center gap-2 drop-shadow-md">
                  {toolTabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isLaunchpadOpen ? 180 : 0 }}
                transition={SPRING_SNAPPY}
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${isLaunchpadOpen ? 'bg-vz-blue text-white' : 'bg-white/[0.07] border border-white/10 text-white/80'}`}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isLaunchpadOpen && (
                <motion.div 
                  {...collapseMotion}
                  className="border-t border-white/[0.07] max-h-[60vh] overflow-y-auto no-scrollbar"
                >
                  <div className="p-4 space-y-2.5">
                    {filteredToolTabs.map((tab) => {
                      const isActive = tab.id === activeTab;
                      return (
                        <button                           key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsLaunchpadOpen(false);
                            setT1ShowReport(false);
                            setT2ShowAnalysis(false);
                            setT3ShowAnalysis(false);
                            setT4ShowReport(false);
                            setT8ShowScore(false);
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors duration-300 cursor-pointer border min-h-[44px] active:scale-[0.98] ${ isActive ? "bg-white/[0.08] border-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white/[0.02] border-white/[0.05] text-white/70 hover:bg-white/[0.05]" } focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60`}
                        >
                          <div className="text-right flex-1">
                            <div className={`text-sm font-black mb-1.5 flex items-center justify-between ${isActive ? "text-vz-accent" : "text-white"}`}>
                              <span>{tab.label}</span>
                              {isFreeTrial && <Lock className="w-3.5 h-3.5 text-vz-accent shrink-0" />}
                            </div>
                            <div className="text-[11px] text-white/70 leading-relaxed font-light">{tab.desc}</div>
                          </div>
                          {isActive && (
                            <div className="w-8 h-8 rounded-full bg-vz-blue flex items-center justify-center shrink-0 ml-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                              <CheckCircle2 className="w-5 h-5 text-white" />
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

        <div className="hidden lg:flex lg:col-span-4 glass glass-edge rounded-4xl p-5 md:p-6 flex-col space-y-4 h-[750px] overflow-hidden relative">
                    <div className="flex items-center justify-between border-b border-white/[0.07] pb-4 px-1">
            <span className="text-[12px] font-bold text-white/55 uppercase tracking-widest">
              الأدوات ({filteredToolTabs.length}):
            </span>
            {selectedCategory !== "all" && (
              <button                 onClick={() => setSelectedCategory("all")}
                className="text-[10px] text-white/60 hover:text-vz-accent transition-colors cursor-pointer min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                عرض الكل
              </button>
            )}
          </div>
          
          <div className="space-y-2 overflow-y-auto pr-2 no-scrollbar flex-1 pb-4">
            {filteredToolTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button                   key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setT1ShowReport(false);
                    setT2ShowAnalysis(false);
                    setT3ShowAnalysis(false);
                    setT4ShowReport(false);
                    setT8ShowScore(false);
                  }}
                  className={`w-full p-4 rounded-2xl text-right transition-colors duration-300 relative cursor-pointer flex items-center justify-between group min-h-[44px] active:scale-[0.98] ${ isActive ? "text-white" : "text-white/70 hover:bg-white/[0.04]" } focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="suite-rail-active"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.04] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_-16px_rgba(0,0,0,0.8)]"
                    />
                  )}
                  <div className="relative flex items-center gap-4">
                    <div className="space-y-1.5 text-right">
                      <h4 className={`font-black text-sm transition-colors duration-300 flex items-center gap-2 ${isActive ? "text-white" : "text-white/85 group-hover:text-white"}`}>
                        <span>{tab.label}</span>
                        {isFreeTrial && <Lock className="w-3.5 h-3.5 text-vz-accent shrink-0" />}
                      </h4>
                      <p className={`text-[10px] transition-colors duration-300 font-light ${isActive ? "text-white/80" : "text-white/60 group-hover:text-white/60"}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  <span className={`relative text-sm transition-all motion-reduce:transition-none motion-reduce:transform-none duration-500 ${isActive ? "text-white -translate-x-1 opacity-100" : "text-white/20 group-hover:text-white/60 opacity-0 group-hover:opacity-100"}`}>
                    ◀
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="vizion-tool-viewport lg:col-span-8 glass glass-edge rounded-4xl p-6 sm:p-8 md:p-12 relative min-h-[750px] flex flex-col justify-between overflow-hidden group">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              {...viewSwapMotion}
              className="space-y-8 w-full relative z-10"
            >
              
            {isFreeTrial ? (
              <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-6 min-h-[550px] my-auto relative z-20">
                <div className="w-20 h-20 rounded-[26px] glass-elevated glass-edge flex items-center justify-center relative group">
                  <Lock className="w-10 h-10 text-vz-accent" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_4px_12px_-4px_rgba(239,68,68,0.6)]">
                    مقفل
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <div className="vz-eyebrow text-xs sm:text-sm">
                    <Crown className="w-4 h-4 text-vz-accent" />
                    <span>مقفولة بالتجربة</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    أداة {toolTabs.find(t => t.id === activeTab)?.label} تنفتح ويا الاشتراك
                  </h3>
                  
                  <p className="text-xs md:text-sm text-white/80 font-light leading-relaxed">
                    تدخل أرقامك وتطلعلك النتيجة بالدينار، والـ 13 أداة كلها تنفتح بنفس الاشتراك.
                  </p>
                </div>

                <div className="w-full max-w-md glass-subtle rounded-3xl p-5 space-y-3 text-right">
                  <span className="text-xs font-black text-vz-accent block border-b border-white/10 pb-2">
                    من ضمن الأدوات:
                  </span>
                  <div className="grid grid-cols-1 gap-y-5 gap-2.5 text-xs text-white/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>افحص مشروعك</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>مستشار الحملات الإعلانية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>حاسبة التسعير والربح الصافي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>اعرف أرباح إعلانك المتوقعة قبل لا تشغله</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>مخطط الميزانية والوصول</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0" />
                      <span>خسائر الطلبات الراجعة</span>
                    </div>
                  </div>
                </div>

                <button                   onClick={triggerUpgradeModal}
                  className="btn btn-primary px-8 py-4 rounded-2xl text-white font-black text-sm md:text-base inline-flex items-center gap-3 group min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                >
                  <Crown className="w-5 h-5 text-white transition-transform" />
                  <span>افتح كل الأدوات</span>
                </button>
              </div>
            ) : (
              <>
              
            {activeTab === "diagnostics" && (
              <div className="space-y-6 text-right">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">أرباحك ووين تروح فلوسك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">افحص مشروعك</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  دخل أرقام مشروعك الحالية حتى نكشفلك بسرعة نقاط القوة، ووين تضيع فلوسك ويقل ربحك بدون ما تنتبه.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">عدد الطلبات بالشهر (اللي تدزها)</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t1MonthlyOrders} onChange={(v) => setT1MonthlyOrders(v)} unit="طلب" step={10} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر البيع للزبون</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t1SellingPrice} onChange={(v) => setT1SellingPrice(v)} unit="د.ع" step={1000} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">بشكد شاري القطعة</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t1ProductCost} onChange={(v) => setT1ProductCost(v)} unit="د.ع" step={500} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">سعر الرسالة بالإعلان</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t1MessageCost} onChange={(v) => setT1MessageCost(v)} unit="د.ع" step={250} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">نسبة الطلبات الراجعة المتوقعة</label>
                    <div className="w-full">
                      <div className="w-full">
  <NumberField className="w-full" value={t1ReturnRate} onChange={(v) => setT1ReturnRate(v)} unit="%" min={0} max={80} step={1} />
</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد من الرسائل تتحول إلى طلبات</label>
                    <div className="w-full">
                      <div className="w-full">
  <NumberField className="w-full" value={t1ConversionRate} onChange={(v) => setT1ConversionRate(v)} unit="%" min={1} max={50} step={1} />
</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => { setT1ShowReport(true); window.setTimeout(() => document.getElementById("t1-report")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>افحص مشروعي ووريني التقرير</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t1ShowReport && (
                  <div id="t1-report" className="scroll-mt-24 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
      <div className="flex justify-end">
        <button onClick={() => {
          navigator.clipboard.writeText(`تقرير التشخيص:
الإيرادات: ${diagResult.totalRevenue.toLocaleString()} د.ع
الصافي: ${diagResult.netProfit.toLocaleString()} د.ع`);
          alert('انتسخ');
        }} className="text-xs text-vz-accent hover:text-white border border-white/14 px-3 py-1 rounded-lg min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">انسخ النتيجة</button>
      </div>
                    <h4 className="text-sm font-black text-vz-accent flex items-center gap-2 border-b border-white/5 pb-2">
                      <span>تقرير فحص الأداء والأرباح:</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-y-5 md:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/60 block">الطلبات المستلمة</span>
                        <span className="text-base font-black text-emerald-400 font-mono">{diagResult.estimatedDelivered} طلب</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/60 block">الطلبات الراجعة</span>
                        <span className="text-base font-black text-red-400 font-mono">{diagResult.estimatedReturned} طلب</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/60 block">ميزانية الإعلان المطلوبة</span>
                        <span className="text-xs sm:text-sm font-black text-vz-accent font-mono">{(diagResult.totalAdSpend).toLocaleString()} دينار</span>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-[10px] text-white/60 block">صافي الربح الفعلي</span>
                        <span className={`text-xs sm:text-sm font-black font-mono ${diagResult.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          <span dir="ltr" className="inline-block">{(diagResult.netProfit).toLocaleString()}</span> دينار
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border-r-2 border-white/35 space-y-2">
                      <span className="text-xs font-bold text-white block">التشخيص الفوري:</span>
                      <ul className="space-y-1.5 text-[11px] text-white/70 leading-relaxed">
                        {t1ReturnRate > 20 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span><strong>الطلبات الراجعة تاكل أرباحك:</strong> نسبة المرتجع عندك ({t1ReturnRate}%) عالية وتخسرك أجور التوصيل وفلوس إعلانات. لازم تأكد طلباتك بالتلفون وتدز فيديوهات للزبون.</span>
                          </li>
                        )}
                        {t1ConversionRate < 10 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span><strong>الرد على الخاص ضعيف:</strong> بس ({t1ConversionRate}%) يشترون من الرسايل. هذا معناه إعلانك يجذب ناس بس تتفرج أو ردك عالخاص يحتاج تعديل سريع.</span>
                          </li>
                        )}
                        {t1SellingPrice - t1ProductCost < 15000 && (
                          <li className="flex items-start gap-1.5 text-red-300">
                            <span><strong>الربح قليل:</strong> الفرق بين سعر الشراء والبيع قليل، وما يغطي أجور التوصيل والإعلانات.</span>
                          </li>
                        )}
                        {t1ReturnRate <= 20 && t1ConversionRate >= 10 && t1SellingPrice - t1ProductCost >= 15000 && (
                          <li className="flex items-start gap-1.5 text-emerald-300">
                            <span><strong>شغلك ممتاز:</strong> الأرقام تبين إن مشروعك قوي. ركز هسه على زيادة ميزانية الإعلان شوي شوي حتى تضاعف مبيعاتك.</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                      <strong>عندك فرصة تزيد أرباحك:</strong> إذا رتبت شغلك ونزلت نسبة الراجع إلى <strong>10%</strong> ورفعت نسبة تأكيد الطلبات إلى <strong>15%</strong>، راح يرتفع صافي ربحك من <span className="font-mono text-white"><span dir="ltr" className="inline-block">{Math.round(diagResult.netProfit).toLocaleString()}</span> دينار</span> لـ <strong className="text-emerald-400 font-mono">{Math.round((t1MonthlyOrders * 0.9 * t1SellingPrice) - (t1MonthlyOrders * t1ProductCost) - (t1MonthlyOrders * 5000) - (Math.round(t1MonthlyOrders / 0.15) * t1MessageCost)).toLocaleString()} دينار</strong>، وبهالشكل تزيد أرباحك بدون ما تصرف أكثر على الإعلانات.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "campaign-advisor" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">بدل ما تخمن وتخسر فلوسك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مستشار الإعلانات الذكي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  دخل أرقام حملتك الإعلانية اللي مشغلها هسه، والنظام راح يحلل النتائج ويحددلك مكان الخلل بالضبط، ويعطيك الحل بسرعة.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد صارف على الإعلان</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t2Spend} onChange={(v) => setT2Spend(v)} unit="د.ع" step={5000} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد رسالة وصلتك</label>
                    <NumberField className="w-full" value={t2Messages} onChange={(v) => setT2Messages(v)} unit="رسالة" step={10} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد طلب أكدته</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t2Confirmed} onChange={(v) => setT2Confirmed(v)} unit="طلب" step={1} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">الطلبات اللي استلمها الزبائن فعليا</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t2Delivered} onChange={(v) => setT2Delivered(v)} unit="طلب" step={1} />
</div>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => setT2ShowAnalysis(true)}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>حلل نتائج الإعلان هسه</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t2ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-vz-accent">النتيجة والتحليل الفني:</h4>
                      <span className="text-xs text-white/60 font-mono">سعر الرسالة عندك: {getAdAnalysis().costPerMsg.toLocaleString()} دينار</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed">
                      النتيجة: <span className="text-vz-accent">{getAdAnalysis().verdict}</span>
                    </p>

                    {getAdAnalysis().warning && (
                      <p className="text-xs text-red-300 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                        <strong>ملاحظة مهمة:</strong> {getAdAnalysis().warning}
                      </p>
                    )}

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-vz-accent block">الخطوات والتعديلات المطلوبة فورا:</span>
                      <ul className="space-y-2 text-xs text-white/80">
                        {getAdAnalysis().recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "competitors" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">افهم السوق وحلل منافسينك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل استراتيجية المنافسين</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  اكتب اسم أي صفحة تنافسك أو مجالها وتبيع نفس منتجاتك، وراح نكشفلك طريقة نشرهم ونقاط ضعفهم اللي تكدر تستغلها حتى تتفوق عليهم.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">اسم صفحة المنافس (اختياري)</label>
                    <input                       type="text"
                      placeholder="مثال: صفحة هدايا فخمة"
                      value={t3Name}
                      onChange={(e) => setT3Name(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs text-right focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">مجال أو نوع بضاعته</label>
                    <select                       value={t3Niche}
                      onChange={(e) => setT3Niche(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <option value="clothing">الملابس والأزياء العصرية</option>
                      <option value="perfumes">العطور ومستحضرات التجميل</option>
                      <option value="electronics">الأجهزة والملحقات الإلكترونية</option>
                      <option value="other">مجالات وهدايا متنوعة</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => setT3ShowAnalysis(true)}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>حلل شغلهم ووريني الفرص</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t3ShowAnalysis && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
                    <h4 className="text-sm font-black text-vz-accent border-b border-white/5 pb-2">
                      خطة التغلب على {t3Name || "هذي الصفحة"}:
                    </h4>

                    <div className="space-y-3 text-xs text-white/80">
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <strong className="text-red-300">نقطة ضعفهم الشائعة:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().weakness}</p>
                      </div>

                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <strong className="text-emerald-300">فرصتك حتى تتميز:</strong>
                        <p className="mt-1 text-white/70 leading-relaxed font-light">{getCompetitorTactics().opportunity}</p>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <strong className="text-vz-accent">بداية الإعلان المقترحة (الخطاف):</strong>
                        <p className="mt-1 text-white/90 italic leading-relaxed font-bold">"{getCompetitorTactics().hook}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "message-diagnoser" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">تجيك رسائل هواي وماكو طلبات؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">محلل جودة الرسائل ونسبتها</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  إذا دتعاني من كثرة الأسئلة وماكو ناس تشتري، دخل عدد الرسائل والطلبات حتى تعرف وين المشكلة بالضبط.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد رسالة توصلك بالمجموع</label>
                    <NumberField className="w-full" value={t4Messages} onChange={(v) => setT4Messages(v)} unit="رسالة" step={10} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد طلب أكدت بنجاح</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t4Orders} onChange={(v) => setT4Orders(v)} unit="طلب" step={1} />
</div>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => { setT4ShowReport(true); window.setTimeout(() => document.getElementById("t4-report")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>حلل الرسائل واكشف الخلل</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t4ShowReport && (
                  <div id="t4-report" className="scroll-mt-24 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down">
      <div className="flex justify-end">
        <button onClick={() => {
          navigator.clipboard.writeText(`تقرير المحادثات:
معدل الإغلاق: ${((t4Orders / t4Messages) * 100).toFixed(1)}%
`);
          alert('انتسخ');
        }} className="text-xs text-vz-accent hover:text-white border border-white/14 px-3 py-1 rounded-lg min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">انسخ النتيجة</button>
      </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-sm font-black text-vz-accent">نتيجة إتمام البيعات:</h4>
                      <span className="text-xs text-white/70 font-mono">نسبة التحويل: {((t4Orders / t4Messages) * 100).toFixed(1)}%</span>
                    </div>

                    {((t4Orders / t4Messages) * 100) < 5 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-300">
                          <strong>وضعك كلش ضعيف:</strong> نسبة التحويل أقل من 5%. الزبائن يدخلون ويسألون وبعدين يطلعون بدون ما يشترون.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span><strong>إعلانك بيه مبالغة:</strong> يمكن الإعلان موضح سعر رخيص كلش أو منتج بمواصفات غير حقيقية، ومن يدخل الزبون ويشوف السعر الحقيقي ينصدم ويطلع.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span><strong>ردودك الآلية والناشفة:</strong> تدز للزبون رد جاهز وطويل. سولف وياه بأسلوب حلو وخلي كلامك مرتب وواضح.</span>
                          </li>
                        </ul>
                      </div>
                    ) : ((t4Orders / t4Messages) * 100) < 12 ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-xs text-vz-accent">
                          <strong>أداءك متوسط:</strong> أكو ناس مهتمة فعلا، بس تخسر نص البيعات لأن ما تتابع الزبون بالشكل الصحيح أو تتردد بتقديم العرض.
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          <li className="flex items-start gap-1.5">
                            <span><strong>استخدم البصمة الصوتية:</strong> جرب تدز بصمة صوتية قصيرة وودودة تشرح بيها تفاصيل التوصيل. هذا ممكن يقنع الزبون المتردد ويخليه يشتري.</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                        <strong>شغلك ممتاز وعلى مستوى</strong> نسبة تأكيد الطلبات تتجاوز الـ 12%، وهاي من أحسن النسب بالسوق. ركز هسه على زيادة ميزانية إعلانك حتى تجيب رسائل أكثر وتضاعف شغلك.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pricing-calculator" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">احسب فلوسك صح قبل لا تشغل الإعلان</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">حاسبة التسعير والربح الصافي</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  أغلب الصفحات تخسر لأن ما تحسب كلفة الطلبات الراجعة. احسب أسعارك وأرباحك وشكد لازم تبيع حتى ما تخسر ولا دينار.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">بشكد شاري القطعة</label>
                    <NumberField className="w-full" value={t5Cost} onChange={(v) => setT5Cost(v)} unit="د.ع" step={500} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">بشكد ناوي تبيع القطعة للزبون</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t5Price} onChange={(v) => setT5Price(v)} unit="د.ع" step={1000} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد أجور التوصيل</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t5Shipping} onChange={(v) => setT5Shipping(v)} unit="د.ع" step={500} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد كلفك الطلب من الإعلان</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t5AdCost} onChange={(v) => setT5AdCost(v)} unit="د.ع" step={500} />
</div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع نسبة الطلبات الراجعة</label>
                    <div className="w-full">
                      <div className="w-full">
  <NumberField className="w-full" value={t5ReturnRate} onChange={(v) => setT5ReturnRate(v)} unit="%" min={0} max={80} step={1} />
</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h4 className="text-xs font-black text-vz-accent border-b border-white/5 pb-2">حساب الأرباح والخسائر لكل قطعة:</h4>

                  {(() => {
                    const returnDec = t5ReturnRate / 100;
                    const deliverDec = 1 - returnDec;
                    
                    const totalAdWastedOnReturnsPerDelivered = (returnDec / deliverDec) * t5AdCost;
                    const totalShippingWastedOnReturnsPerDelivered = (returnDec / deliverDec) * 5000;
                    
                    const netProfitReal = t5Price - t5Cost - t5Shipping - t5AdCost - totalAdWastedOnReturnsPerDelivered - totalShippingWastedOnReturnsPerDelivered;
                    
                    const minSafePrice = Math.round(t5Cost + t5Shipping + t5AdCost + (returnDec / deliverDec) * (t5AdCost + 5000));
                    const ordersToTarget = Math.ceil(1500000 / netProfitReal);

                    return (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/70 block">صافي ربحك الحقيقي من كل طلب</span>
                            <span className={`text-base font-black font-mono ${netProfitReal > 0 ? "text-emerald-400" : "text-red-400"}`}>
                              <span dir="ltr" className="inline-block">{Math.round(netProfitReal).toLocaleString()}</span> دينار
                            </span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/70 block">أقل سعر تكدر تبيع بيه بدون خسارة</span>
                            <span className="text-base font-black text-vz-accent font-mono">{minSafePrice.toLocaleString()} دينار</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-white/70 block">عدد الطلبات اللي تحتاجها حتى تربح (١.٥ مليون)</span>
                            <span className="text-base font-black text-white font-mono">
                              {ordersToTarget > 0 && ordersToTarget < 10000 ? ordersToTarget : "مهمة صعبة"} طلب
                            </span>
                          </div>
                        </div>

                        {netProfitReal <= 0 ? (
                          <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-300">
                            <strong>تنبيه، إنت تخسر</strong> بهالأسعار ونسبة الطلبات الراجعة عندك، إنت فعليا تخسر من كل طلب تدزه. ارفع سعرك أو قلل كلفة الإعلان والطلبات الراجعة بسرعة.
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-300">
                            <strong>تسعيرك ممتاز وآمن</strong> أرباحك الصافية زينة بعد ما حسبنا كل التكاليف وخسائر الطلبات الراجعة. مشروعك هسه جاهز يكبر ويتطور.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === "customer-types" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">ردود جاهزة تساعدك تكمل البيعة</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">أنواع الزبائن وشلون تتعامل وياهم</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  تعرف على أشهر 5 أنواع من الزبائن اللي يراسلون صفحتك، وافهم شلون يفكرون وشنو الرد اللي يقنعهم يشترون مباشرة.
                </p>

                <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-5 gap-2">
                  <button                     onClick={() => setActiveCustomer("ghoster")}
                    className={`p-3 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-[11px] font-bold ${activeCustomer === "ghoster" ? "bg-white/10 border-white/35 text-white" : "bg-white/5 border-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                  >
                    يسأل (بشكد؟) وبعدين يختفي
                  </button>
                  <button                     onClick={() => setActiveCustomer("bargainer")}
                    className={`p-3 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-[11px] font-bold ${activeCustomer === "bargainer" ? "bg-white/10 border-white/35 text-white" : "bg-white/5 border-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                  >
                    (أريد خصم)
                  </button>
                  <button                     onClick={() => setActiveCustomer("hesitant")}
                    className={`p-3 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-[11px] font-bold ${activeCustomer === "hesitant" ? "bg-white/10 border-white/35 text-white" : "bg-white/5 border-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                  >
                    الزبون المتردد
                  </button>
                  <button                     onClick={() => setActiveCustomer("delayed")}
                    className={`p-3 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-[11px] font-bold ${activeCustomer === "delayed" ? "bg-white/10 border-white/35 text-white" : "bg-white/5 border-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                  >
                    (أرجعلك بعدين)
                  </button>
                  <button                     onClick={() => setActiveCustomer("comparer")}
                    className={`p-3 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer text-[11px] font-bold ${activeCustomer === "comparer" ? "bg-white/10 border-white/35 text-white" : "bg-white/5 border-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                  >
                    يقارن ويا غيرك
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  {activeCustomer === "ghoster" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">اللي يسأل عن السعر ويختفي:</span>
                        <p className="text-white/70 text-[10px] mt-0.5">ليش يسوي هيج؟ يحس إن ردك آلي، ويمكن هو بس يستفسر من باب الفضول.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-vz-accent">شلون تتعامل وياه:</strong> لا تكتفي بذكر السعر وتسكت. وضحله شنو اللي يميز العرض، وكله يكدر يفحص المنتج عند الباب حتى يرتاح ويطمن.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">الرد المقترح (انسخه وعدله):</span>
                        <p className="text-white/90">
                          "يا هلا بيك عيني الغالي.. بخصوص العطر، سعره ويا التوصيل والضمان 35 ألف بس. والميزة عدنا إن من يوصلك المندوب، تكدر تفتح الطلبية وتفحصها وتتأكد بنفسك، وإذا ما عجبتك ترجعها بدون ما تدفع أي شي. شكد قطعة تحب نثبتلك عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "bargainer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">اللي يكول (أكو خصم عيني؟ أريده أرخص):</span>
                        <p className="text-white/70 text-[10px] mt-0.5">ليش يسوي هيج؟ يحب يحس إنه حصل على عرض زين وبسعر أقل.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-vz-accent">شلون تتعامل وياه:</strong> لا تكوله "لا" قبل. انطيه عرض ثاني أو هدية (مثل توصيل مجاني للقطعتين) بدل ما تنزل سعر المنتج.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">الرد المقترح (انسخه وعدله):</span>
                        <p className="text-white/90">
                          "عيني فدوة لكلبك، السعر ثابت لأن البضاعة أصلية ومكفولة، بس لعيونك.. إذا تاخذ قطعتين اليوم، نلغي أجور التوصيل ويصير التوصيل مجاني، أو نهديك هدية حلوة وياها. تحب تختار العرض الذهبي؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "hesitant" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">الزبون المتردد / يخاف من النصب:</span>
                        <p className="text-white/70 text-[10px] mt-0.5">ليش يسوي هيج؟ سبق وانضحك عليه من صفحات وهمية، ولهذا ما يثق بسهولة.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-vz-accent">شلون تتعامل وياه:</strong> طمنه من خلال ما توفرله ضمان وتخليه يفحص المنتج كدام المندوب قبل لا يستلمه.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">الرد المقترح (انسخه وعدله):</span>
                        <p className="text-white/90">
                          "من حقك عيني تخاف، السوق هالأيام بيه هواي شغلات مو مضمونة.. ولهذا وفرنالك ميزة الفحص. تفتح الكارتونة وتجرب المنتج بنفسك، وعليه ضمان 6 أشهر من متجرنا. تحب نسجلك حجز اليوم عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "delayed" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">اللي يكول (أفكر وأرجعلك / من أستلم الراتب):</span>
                        <p className="text-white/70 text-[10px] mt-0.5">ليش يتصرف هيج؟ يحتاج سبب قوي يشجعه يحسم قراره ويشتري بدل ما يبقى متردد.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-vz-accent">شلون تتعامل وياه:</strong> وضحله إن الكمية قربت تخلص، أو قدم له عرض يخليه يطلب هسه وتدزله الطلبية بيوم الراتب.
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">الرد المقترح (انسخه وعدله):</span>
                        <p className="text-white/90">
                          "خذ راحتك عيني الغالي.. بس حتى ما يفوتك العرض، بقت عدنا آخر 3 قطع. إذا تحب، نحجزلك قطعة ونخلي التوصيل بموعد راتبك الجاي حتى تستلمها براحتك. شرايك عيني؟"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeCustomer === "comparer" && (
                    <div className="space-y-3 text-xs leading-relaxed text-right">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-red-400 font-bold block">اللي يقارن (شفت بيج ثاني يبيعه أرخص):</span>
                        <p className="text-white/70 text-[10px] mt-0.5">ليش يتصرف هيج؟ يريد يعرف سبب فرق السعر حتى يقتنع إن السعر الأعلى يستاهل.</p>
                      </div>
                      <p className="text-white/80">
                        <strong className="text-vz-accent">شلون تتعامل وياه:</strong> لا تحچي بسوء عن المنافسين. وضحله شنو اللي يخلي سعرك أعلى (جودة الخامة، الضمان، وخدمات ما بعد البيع).
                      </p>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">الرد المقترح (انسخه وعدله):</span>
                        <p className="text-white/90">
                          "أهلا بيك أخي.. صحيح تلكه أنواع أرخص بالإنترنت، بس الفرق عيني بالجودة والضمان. البضاعة الرخيصة ممكن تسببلك مشاكل، وبعدها ما تلكه أحد يجاوبك. ويانا إنت تشتري راحة بالك وضمان حقيقي، وتكدر تفحص المنتج براحتك. ما تسوى تجرب الأصلي عيني؟"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ads-library" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">إعلانات عراقية جابت مبيعات قوية</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">مكتبة الإعلانات الناجحة</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  شوف 3 نماذج لإعلانات حقيقية ناجحة، وتعرف شنو السر ورا نجاحها حتى تستفاد منها بشغلك اليوم.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 hover:border-white/14 rounded-2xl space-y-3 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:transform-none">
                    <h4 className="text-xs font-black text-white">١. إعلان ملابس (بداية تشد الانتباه)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو يبدي بشخص ماسك قميص ويصب عليه مي حتى يثبت للناس إن القميص ما يتبقع.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-vz-accent block">سر نجاحه:</strong> يخلي الزبون يوقف التصفح بأول ثانيتين بحركة مو متوقعة، ويخليه يشوف جودة المنتج بعينه.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-white/14 rounded-2xl space-y-3 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:transform-none">
                    <h4 className="text-xs font-black text-white">٢. إعلان عطور (تجربة من الواقع)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      تصوير عفوي لشخص يدخل للمكتب، وأصدقاؤه يسألونه باستغراب عن ريحة عطره الحلوة.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-vz-accent block">سر نجاحه:</strong> ما يبين كأنه إعلان يريد يبيعك شي. يبين فيديو عادي ومتداول بين الناس، وهذا يزيد ثقة الزبون بيه بشكل كبير.
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 hover:border-white/14 rounded-2xl space-y-3 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:transform-none">
                    <h4 className="text-xs font-black text-white">٣. إعلان هدايا (يلمس المشاعر)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">
                      فيديو مصور بطريقة مرتبة، يبين إيدين تفتح علبة خشبية فخمة، منقوش عليها اسم، بتصوير مريح وجذاب.
                    </p>
                    <div className="text-[10px] bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <strong className="text-vz-accent block">سر نجاحه:</strong> يركز على المشاعر وإحساس الفخر من تقدم هدية مرتبة، ويشجع الزبون يشتري بنهاية الفيديو.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "product-evaluator" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">لا تروج لمنتج يسببلك خسارة بعدين</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">قيم منتجك قبل لا تشغل الإعلان</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  جاوب بصراحة على هاي الـ 6 أسئلة حتى نعطيك تقييم دقيق يوضحلك إذا منتجك عنده فرصة ينجح وينباع زين من خلال الإعلانات.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">ربحك من القطعة أكثر من 15,000 دينار؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Margin(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Margin ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>إي</button>
                      <button onClick={() => setT8Margin(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Margin ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">تكدر تشرح فائدة المنتج وتجذب انتباه الزبون بأول 3 ثواني؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Benefit(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Benefit ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>إي</button>
                      <button onClick={() => setT8Benefit(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Benefit ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">المنتج متوفر بكل مكان بالسوق (مثل الشورجة أو الكرادة) والناس شايفته بكل مكان؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Problem(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Problem ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>إي</button>
                      <button onClick={() => setT8Problem(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Problem ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">المنتج خفيف وسهل التغليف والتوصيل وما ينكسر بسهولة؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Ship(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Ship ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>إي</button>
                      <button onClick={() => setT8Ship(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Ship ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>لا</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-xs text-white font-bold">عندك فيديوهات مصورها بنفسك للمنتج (مو مسروقة)؟</span>
                    <div className="flex gap-2">
                      <button onClick={() => setT8Video(true)} className={`px-3 py-1 rounded-lg text-xs font-bold ${t8Video ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>إي</button>
                      <button onClick={() => setT8Video(false)} className={`px-3 py-1 rounded-lg text-xs font-bold ${!t8Video ? "bg-vz-blue text-white" : "bg-white/5 text-white/60"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}>لا</button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => setT8ShowScore(true)}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>احسب تقييم منتجك هسه</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t8ShowScore && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fade-in-down">
                    {(() => {
                      let score = 0;
                      if (t8Margin) score += 25;
                      if (t8Benefit) score += 25;
                      if (!t8Problem) score += 20;
                      if (t8Ship) score += 15;
                      if (t8Video) score += 15;

                      return (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-black text-white">شكد منتجك جاهز للبيع:</span>
                            <span className="font-mono text-base font-black text-vz-accent">{score} / 100</span>
                          </div>

                          {score >= 75 ? (
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-300 leading-relaxed font-light">
                              <strong>منتجك قوي وجاهز للبيع</strong> متوفر بيه كلشي يساعده ينجح بسرعة. نصيحتنا تبدي تصور فيديوهاتك وتشغل حملتك الإعلانية بدون تردد.
                            </div>
                          ) : score >= 50 ? (
                            <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-vz-accent leading-relaxed font-light">
                              <strong>جاهزيته متوسطة:</strong> المنتج زين، بس بيه شوية مشاكل (مثل الربح القليل أو إنه متوفر بكل مكان بالسوق). حاول تراجع سعرك أو تقدم عرض مميز حتى تتجنب الخسارة.
                            </div>
                          ) : (
                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-red-300 leading-relaxed font-light">
                              <strong>مخاطرة عالية</strong> هذا المنتج ممكن يضيع ميزانيتك لأن ربحه قليل أو توصيله صعب. لا تصرف عليه فلوس بالإعلانات إلا بعد ما تحل هاي المشاكل وتصوره بفيديوهات من تصويرك.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profit-leak" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">وين دتروح فلوسك؟</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">كاشف خسائر الأرباح</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  هواية أصحاب البيجات ما يعرفون شكد يخسرون من كلفة الطلبات الراجعة وغرامات التوصيل. احسب خسارتك من الطلبات الراجعة هسه حتى تلحق توقف هالخسارة.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">مجموع الطلبيات اللي تدزها بالشهر</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t9Orders} onChange={(v) => setT9Orders(v)} unit="طلب" step={10} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">كلفة توصيل الطلبية الراجعة</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t9ReturnFee} onChange={(v) => setT9ReturnFee(v)} unit="د.ع" step={500} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع نسبة الطلبات الراجعة</label>
                    <div className="w-full">
                      <div className="w-full">
  <NumberField className="w-full" value={t9ReturnRate} onChange={(v) => setT9ReturnRate(v)} unit="%" min={0} max={80} step={1} />
</div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const numReturned = Math.round(t9Orders * (t9ReturnRate / 100));
                  const directLossWasted = numReturned * t9ReturnFee;
                  const totalWastedWithAds = numReturned * (t9ReturnFee + 6000);

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-red-400 border-b border-white/5 pb-2">شكد الفلوس اللي تخسرها من مبيعاتك:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">عدد الطلبيات اللي ترجعلك</span>
                          <span className="text-sm font-black text-red-400 font-mono">{numReturned} طلب بالشهر</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">خسارتك من كلفة توصيل الطلبات الراجعة</span>
                          <span className="text-sm font-black text-red-400 font-mono">{(directLossWasted).toLocaleString()} دينار</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">مجموع الفلوس اللي تخسرها بدون ما تحس</span>
                          <span className="text-sm font-black text-vz-accent font-mono">{(totalWastedWithAds).toLocaleString()} دينار</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/60 leading-relaxed font-light">
                        * فكر بيها زين: مبلغ بحدود <strong className="text-red-400 font-mono">{(totalWastedWithAds).toLocaleString()} دينار</strong> يروح من عندك كل شهر بدون فايدة، لأن ما تتابع الزبون وما تأكد الطلبيات بشكل صحيح. من تطبق حلولنا، تكدر توقف هالخسارة وترجع هالفلوس لصافي ربحك مباشرة.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">ابني مشروعك خطوة بخطوة</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">خطة توصل بيها لأول 100 طلب</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  خطة واضحة تمشي عليها يوم بيوم. اختار الأسبوع وتابع مهامك اليومية، وكلما تخلص مهمة اضغط عليها حتى تتابع شكد مشروعك ديتقدم.
                </p>

                <div className="flex justify-between border-b border-white/10 pb-2">
                  {[1, 2, 3, 4].map((wk) => (
                    <button                       key={wk}
                      onClick={() => setT10SelectedWeek(wk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${t10SelectedWeek === wk ? "bg-vz-blue text-white shadow-md" : "text-white/60 hover:text-white"} min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                    >
                      أسبوع {wk}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                  <span className="text-[11px] font-black text-vz-accent block">{currentWeekData.title}:</span>
                  
                  {currentWeekData.days.map((d) => {
                    const isChecked = t10CheckedDays.includes(d.day);
                    return (
                      <div
                        key={d.day}
                        onClick={() => handleToggleDay(d.day)}
                        className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center justify-between group ${isChecked ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isChecked ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/60"}`}>يوم {d.day}</span>
                          <span className="text-xs leading-relaxed font-light">{d.title}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 w-6 text-left ${isChecked ? "text-emerald-400" : "text-white/10"}`}>
                          {isChecked ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : null}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/60 font-light">نسبة إنجاز مشروعك:</span>
                  <strong className="text-vz-accent font-mono">{Math.round((t10CheckedDays.length / 30) * 100)}% ({t10CheckedDays.length} / 30 يوم)</strong>
                </div>
              </div>
            )}

            {activeTab === "sales-blocker" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">اكتشف وين المشكلة خلال 5 دقايق</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">ليش مبيعاتي مو بالمستوى المطلوب؟</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  جاوب بصراحة على هاي الأسئلة الأربعة عن أرقام شغلك هسه، وراح نحددلك بالضبط وين المشكلة وشلون تكدر تحلها مباشرة.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4 text-xs text-right">
                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">١. شكد نسبة النقر على الفيديو مالك؟</label>
                    <select value={t11CTR} onChange={(e) => setT11CTR(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                      <option value="low">ضعيفة (أقل من 1%، أغلب الناس يتجاوزون الفيديو)</option>
                      <option value="medium">متوسطة (من 1% إلى 2%)</option>
                      <option value="high">قوية (أكثر من 2%، التفاعل عالي)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٢. شلون وضع الرسائل اللي توصلك على البيج؟</label>
                    <select value={t11Messages} onChange={(e) => setT11Messages(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                      <option value="low">قليلة كلش، وماكو تفاعل</option>
                      <option value="high">رسائل هواية وتوصل بشكل يومي</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٣. شكد سرعتك وشلون أسلوبك بالرد على الخاص؟</label>
                    <select value={t11Speed} onChange={(e) => setT11Speed(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                      <option value="slow">بطيء (أكثر من ساعتين) أو أستخدم ردود جاهزة وباردة</option>
                      <option value="fast">سريع كلش (أقل من 15 دقيقة) وأرد بأسلوب حلو</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold block">٤. شكد نسبة الزباين اللي يستلمون طلبياتهم من تطلع للتوصيل؟</label>
                    <select value={t11Delivery} onChange={(e) => setT11Delivery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-white/35 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                      <option value="low">ضعيفة (أقل من 70%، والطلبات الراجعة هواية)</option>
                      <option value="high">ممتازة (أكثر من 70% من الزباين يستلمون)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 w-full">
                  <button                     onClick={() => setT11ShowResult(true)}
                    className="btn btn-primary w-full py-3 text-white font-black text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  >
                    <span>اعرف المشكلة وحلها مباشرة</span>
                    <ArrowRight className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                {t11ShowResult && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-in-down text-xs">
                    <h4 className="text-sm font-black text-vz-accent border-b border-white/5 pb-2">تقرير يوضحلك وين المشكلة بمشروعك:</h4>

                    {t11CTR === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>المشكلة الأولى: إعلانك ممل وما بيه بداية تشد الانتباه</strong>
                        <p className="text-white/70 leading-relaxed font-light">الفيديو مالك مو جذاب، ولهذا كلفة الرسالة راح تكون عالية، لأن الناس تتجاوز إعلانك وما تهتم تشوفه. الحل: ارجع صور المنتج بنفسك بكاميرا تلفونك، ووضح فائدته بأول 3 ثواني.</p>
                      </div>
                    )}

                    {t11Messages === "low" && t11CTR !== "low" && (
                      <div className="p-3 bg-white/3 rounded-xl border border-white/5 space-y-1 text-vz-accent">
                        <strong>المشكلة الثانية: الاستهداف مو صحيح أو ميزانية الإعلان قليلة</strong>
                        <p className="text-white/70 leading-relaxed font-light">المشكلة مو بالفيديو، المشكلة يا إما ميزانية الإعلان قليلة أو الاستهداف مو مضبوط بمدير الإعلانات. الحل: شغل حملة رسائل باستهداف مفتوح، وبدون تحديد اهتمامات معقدة، وخلي فيسبوك يوصل للزباين المناسبين.</p>
                      </div>
                    )}

                    {t11Speed === "slow" && t11Messages === "high" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>المشكلة الثالثة: تتأخر بالرد وأسلوبك مو مشجع</strong>
                        <p className="text-white/70 leading-relaxed font-light">ممكن تخسر 80% من مبيعاتك لأنك تخلي الزبون ينتظر بالساعات لحد ما يغير رأيه ويشتري من غيرك. الحل: استخدم أسلوب الرد الصوتي الدافي، وجاوب خلال 15 دقيقة كحد أقصى.</p>
                      </div>
                    )}

                    {t11Delivery === "low" && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1 text-red-300">
                        <strong>المشكلة الرابعة: ما تأكد الطلبيات بشكل صحيح</strong>
                        <p className="text-white/70 leading-relaxed font-light">إنت تطلع طلبيات بدون ما تتواصل ويا الزباين وتتأكد من طلباتهم، وهذا يخلي المندوب يسجلها راجعة وتخسر كلفة التوصيل. الحل: اتصل بالزبون وأكد الطلب مباشرة، ودزله فيديو على الواتساب يبين شلون دتجهز طلبيته.</p>
                      </div>
                    )}

                    {t11CTR === "high" && t11Messages === "high" && t11Speed === "fast" && t11Delivery === "high" && (
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1 text-emerald-300">
                        <strong>مشروعك تمام وشغلك مضبوط</strong>
                        <p className="text-white/70 leading-relaxed font-light">كلشي بشغلك ديمشي بشكل صحيح. ننصحك هسه تزيد ميزانية الإعلان بالتدريج وتضيف منتجات جديدة حتى تضاعف أرباحك.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "forecaster" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">توقع النتائج قبل لا تصرف فلوسك</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">توقع المبيعات والأرباح من الإعلانات</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  قبل لا تشغل أي حملة إعلانية على فيسبوك أو إنستغرام، دخل الميزانية اللي ناوي تصرفها حتى تعرف شكد ممكن تجيك مبيعات وطلبيات وشكد يبقى عندك ربح صافي.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد ميزانية الحملة اللي ناوي تصرفها</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t12Budget} onChange={(v) => setT12Budget(v)} unit="د.ع" step={10000} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع كلفة الرسالة الواحدة</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t12MsgCost} onChange={(v) => setT12MsgCost(v)} unit="د.ع" step={250} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">شكد تتوقع نسبة الرسائل اللي تتحول إلى طلبيات</label>
                    <div className="flex items-center gap-2">
                      <div className="w-full">
  <NumberField className="w-full" value={t12ConvRate} onChange={(v) => setT12ConvRate(v)} unit="%" min={1} max={100} step={1} />
</div>
                      <span className="text-xs font-mono font-bold text-vz-accent shrink-0 w-10 text-left">{t12ConvRate}%</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const expectedMessages = Math.round(t12Budget / t12MsgCost);
                  const expectedOrders = Math.round(expectedMessages * (t12ConvRate / 100));
                  const costPerOrder = expectedOrders > 0 ? Math.round(t12Budget / expectedOrders) : 0;

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-vz-accent border-b border-white/5 pb-2">النتائج المتوقعة للحملة الإعلانية:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">عدد الرسائل المتوقع توصلك</span>
                          <span className="text-sm font-black text-white font-mono">{expectedMessages} رسالة</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">عدد الطلبيات المؤكد تطلعها</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">{expectedOrders} طلب</span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">شكد كلفك الطلب من الإعلان</span>
                          <span className="text-sm font-black text-vz-accent font-mono">{(costPerOrder).toLocaleString()} دينار / طلب</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "budget-planner" && (
              <div className="space-y-6 text-right animate-fade-in">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-vz-accent font-bold">لا تصرف ميزانيتك بدون تخطيط</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">خطط ميزانية إعلاناتك وأرباحك</h3>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-light">
                  حدد صافي الربح اللي تريد تحققه بالشهر، وهامش الربح الصافي من منتجك، والنظام راح يحسبلك ميزانية الإعلانات التقريبية اللي تحتاجها حتى توصل لهدفك.
                </p>

                <div className="grid grid-cols-1 gap-y-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">صافي الربح اللي تريد تحققه بالشهر</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t13TargetProfit} onChange={(v) => setT13TargetProfit(v)} unit="د.ع" step={50000} />
</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 block">صافي ربح القطعة (قبل حساب مصاريف الإعلان)</label>
                    <div className="w-full">
  <NumberField className="w-full" value={t13ProfitMargin} onChange={(v) => setT13ProfitMargin(v)} unit="د.ع" step={500} />
</div>
                  </div>
                </div>

                {(() => {
                  const requiredOrders = Math.ceil(t13TargetProfit / (t13ProfitMargin - 6000));
                  const estimatedBudgetRequired = requiredOrders * 6000;

                  return (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-vz-accent border-b border-white/5 pb-2">الخطة المالية المقترحة حتى تحقق هدفك:</h4>
                      
                      <div className="grid grid-cols-1 gap-y-5 gap-3 text-center text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">عدد الطلبيات اللي لازم تبيعها بالشهر</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {requiredOrders > 0 && requiredOrders < 100000 ? requiredOrders : "هامش ربحك قليل كلش"} طلب
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/60 block">ميزانية الإعلانات التقريبية اللي تحتاجها</span>
                          <span className="text-sm font-black text-vz-accent font-mono">
                            {estimatedBudgetRequired > 0 && estimatedBudgetRequired < 1000000000 ? (estimatedBudgetRequired).toLocaleString() : 0} دينار
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/60 text-center leading-relaxed">
                        * الأرقام المذكورة تقريبية، وتعتمد على دقة الاستهداف، وجودة تصميم الإعلان، وطريقة تعاملك ويا المندوبين وشركات التوصيل.
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

          
        </div>
        
      </div>

    </div>
  );
}
