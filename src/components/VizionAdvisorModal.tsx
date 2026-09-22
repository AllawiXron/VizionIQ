import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  Crown,
  ShieldAlert,
  KeyRound,
  HelpCircle,
  Sliders,
  FileText,
  Compass,
  ChevronRight,
  TrendingDown,
  Package,
  DollarSign,
  PhoneCall,
  Flame,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Calendar,
  Wrench,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllValidCodes, normalizeCode } from "./LockScreen";
import { BusinessDiagnosticStepper } from "./BusinessDiagnosticStepper";
import { StructuredDiagnosticCard } from "./StructuredDiagnosticCard";
import { AdvisorActionCard } from "./AdvisorActionCard";
import { AdvisorToast, ToastMessage } from "./AdvisorToast";
import {
  SavedRecommendation,
  PlanTaskItem,
  getSavedRecommendationsFromStorage,
  removeSavedRecommendationFromStorage,
  get7DayPlanStorageKey,
  trackAdvisorAction
} from "../utils/advisorActionMapper";
import { BusinessDiagnosticProfile, DiagnosticMetrics } from "../types";
import { constructDiagnosticPrompt } from "../utils/diagnosticCalculator";
import { trackEvent } from "../lib/analytics";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestions?: string[];
  topicId?: string;
  requestId?: string;
  isDivider?: boolean;
  isError?: boolean;
  failedPrompt?: { text: string; presetSuggestions?: string[] };
}

interface VizionAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  onNavigateTool?: (toolId: string, category?: string) => void;
  isVip?: boolean;
  userCode?: string;
  onUpgradeSuccess?: (newVipCode: string) => void;
}

// Interactive Problem Diagnosis Tree
interface DiagnosticCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  options: {
    topicId: string;
    label: string;
    subtext: string;
    prompt: string;
    defaultSuggestions: string[];
  }[];
}

const DIAGNOSTIC_CATEGORIES: DiagnosticCategory[] = [
  {
    id: "ads",
    title: "ضعف الإعلانات وهدر الميزانية",
    icon: "🎯",
    description: "حلول مشاكل فيسبوك وتيك توك وانستغرام آدز بالسوق العراقي",
    options: [
      {
        topicId: "topic_ads_low_conversion",
        label: "رسائل كثيرة على الإعلان لكن لا أحد يشتري",
        subtext: "جودة الزبائن ضعيفة والرسائل غير جادة",
        prompt: "إعلاناتي تجلب عدداً كبيراً من الرسائل والاستفسارات بأسعار مناسبة، ولكن نسبة الإغلاق شبه معدومة (محد يشتري فعلياً). ما هو التشخيص العلمي وفق منظومة فيزيون وكيف أحل المشكلة فوراً؟",
        defaultSuggestions: [
          "كيف أعدل محتوى الإعلان وفلترة الزبائن؟",
          "اعطيني سكريبت لتحويل السائل إلى مشترٍ بالواتساب",
          "هل أرفع السعر أم أغير طريقة الاستهداف؟"
        ]
      },
      {
        topicId: "topic_ads_high_cpa",
        label: "كلفة الرسالة مرتفعة جداً (CPA/CPR عالي)",
        subtext: "صرف الميزانية بدون الحصول على عدد استفسارات كافٍ",
        prompt: "كلفة الرسالة في إعلانات الفيسبوك والانستغرام مرتفعة جداً وتستهلك كل هامش الربح. كيف أخفض كلفة الرسالة بالسوق العراقي وأحسن الـ CTR؟",
        defaultSuggestions: [
          "كيف أصيغ الهوك (Hook) البصري الأول للإعلان؟",
          "ما هي أفضل إعدادات استهداف للمحافظات؟",
          "كيف أعرف إذا كان المنتج نفسه هو المشكلة؟"
        ]
      },
      {
        topicId: "topic_ad_fatigue",
        label: "الحملة تنجح يومين ثم ينخفض الأداء فجأة (Ad Fatigue)",
        subtext: "تذبذب النتائج وتوقف الطلبات بعد البداية القوية",
        prompt: "الحملة الإعلانية تبدأ بنتائج قوية أول 48 ساعة ثم ينحدر الأداء وترتفع الكلفة فجأة. كيف أتعامل مع احتراق الإعلان وتوسيع الجمهور العراقي؟",
        defaultSuggestions: [
          "كيف أصنع زوايا إعلانية (Angles) جديدة لنفس المنتج؟",
          "متى يجب زيادة الميزانية (Scaling)؟",
          "كيف أختبر محتوى تيك توك مقابل انستغرام؟"
        ]
      }
    ]
  },
  {
    id: "whatsapp_sales",
    title: "اعتراضات المبيعات وإغلاق الصفقات",
    icon: "💬",
    description: "سكريبتات الردود وإقناع الزبون العراقي المتردد",
    options: [
      {
        topicId: "topic_sales_price_objection",
        label: "الزبون يقول: 'السعر غالي ومبالغ بيه'",
        subtext: "مقارنة السعر بصفحات أخرى أو شعور بعدم الاستحقاق",
        prompt: "الزبون بالواتساب يقول: 'السعر غالي ومبالغ بيه، شفته بغير مكان أرخص'. اعطيني سكريبت الرد الذهبي لإقناعه بالقيمة دون حرق السعر.",
        defaultSuggestions: [
          "كيف أضيف بونص أو عرض إضافي بدون كلفة عالية؟",
          "ماذا أفعل إذا أصر الزبون على الخصم؟",
          "سكريبت تثبيت الضمان وخدمة ما بعد البيع"
        ]
      },
      {
        topicId: "topic_sales_hesitation",
        label: "الزبون يقول: 'بعدين أردلك خبر / استشير'",
        subtext: "تسويف الزبون واختفائه بعد معرفة السعر والمواصفات",
        prompt: "الزبائن يقرأون التفاصيل ثم يكتبون: 'بعدين أردلك خبر' أو 'استشير الأهل' ثم يختفون. كيف أتعامل مع التسويف وأغلق الطلب في نفس اللحظة؟",
        defaultSuggestions: [
          "سكريبت إعادة المتابعة بعد 24 ساعة (Follow-up)",
          "كيف أخلق دافع استعجال (Urgency) حقيقي وأخلاقي؟",
          "طريقة السؤال الختامي البديل (Alternative Choice Close)"
        ]
      },
      {
        topicId: "topic_sales_discount",
        label: "الزبون يطلب خصم أو توصيل مجاني بإصرار",
        subtext: "المساومة على أجور التوصيل وهامش الربح",
        prompt: "الزبائن في العراق دائماً يطلبون 'توصيل مجاني' أو 'تخفيض السعر'. كيف أحافظ على أرباحي وفي نفس الوقت أرضي رغبة الزبون بالخصم؟",
        defaultSuggestions: [
          "كيف أصيغ عروض الحزم (Bundles 1+1 مجاناً)؟",
          "سكريبت الرد على طلب التوصيل المجاني",
          "كيف أدمج كلفة التوصيل بالسعر بطريقة ذكية؟"
        ]
      }
    ]
  },
  {
    id: "delivery_returns",
    title: "تقليل الراجع ومشاكل التوصيل",
    icon: "📦",
    description: "خفض نسبة الإرجاع إلى أقل من 10% وتأكيد الطلبات",
    options: [
      {
        topicId: "topic_delivery_returns",
        label: "الزبون يرفض الاستلام أو يكنسل عند اتصال المندوب",
        subtext: "ضياع أجور التوصيل والجهد وهدر المنتجات بالراجع",
        prompt: "نسبة الراجع عندي في المحافظات تتجاوز 25% والزبائن يرفضون الاستلام عند اتصال المندوب. ما هي الخطة العملية في منظومة فيزيون لتنزيل الراجع لأقل من 10%؟",
        defaultSuggestions: [
          "اعطيني سكريبت مكالمة تأكيد الطلب قبل التوصيل",
          "كيف أتعامل مع تأخير شركات التوصيل؟",
          "كيف أمنع طلبات التجار الوهميين أو غير الجادين؟"
        ]
      },
      {
        topicId: "topic_delivery_driver",
        label: "المندوب يتأخر والزبون يفقد الحماس",
        subtext: "بطء التوصيل 4-6 أيام يؤدي لإلغاء الطلب",
        prompt: "تأخر توصيل الطلبات في المحافظات إلى 4-6 أيام يجعل الزبون يشتري من السوق المحلي ويلغي الطلب. كيف أحافظ على حماس الزبون أثناء فترة التوصيل؟",
        defaultSuggestions: [
          "سكريبت رسائل المتابعة أثناء التوصيل عبر الواتساب",
          "كيف أختار شركة التوصيل الموثوقة بالعراق؟",
          "نظام الحوافز للمناديب والزبائن"
        ]
      }
    ]
  },
  {
    id: "pricing_finance",
    title: "التسعير وحساب الهيكل المالي",
    icon: "🧮",
    description: "معادلات حساب الكلف والأرباح الصافية بالدينار العراقي",
    options: [
      {
        topicId: "topic_pricing_profit",
        label: "كيف أسعر منتج كلفته 10,000 - 15,000 د.ع لضمان ربح صافي؟",
        subtext: "حساب كلفة الشراء + الإعلانات + التوصيل والراجع",
        prompt: "عندي منتج كلفة شرائه من الجملة 12,000 دينار عراقي، وتكلفة التوصيل 5,000 دينار. كيف أسعر المنتج بسعر جذاب ويضمن لي ربحاً صافياً بعد كلفة الإعلانات والراجع؟",
        defaultSuggestions: [
          "احسب لي نقطة التعادل (Break-Even ROAS)",
          "ما هو الهامش الموصى به للمنتجات الاستهلاكية؟",
          "كيف أسعر العرض الثاني والثالث (Upsell Stack)؟"
        ]
      },
      {
        topicId: "topic_budget_planning",
        label: "الأرباح تختفي في نهاية الشهر ولا أعرف أين تذهب",
        subtext: "إيرادات عالية بدون سيولة نقدية صافية",
        prompt: "صفحتي تحقق مبيعات جيدة وحجم إيرادات محترم، لكن نهاية الشهر لا أجد أرباحاً كاش في يدي. ما هي الثغرات المالية الخفية في التجارة الإلكترونية بالعراق؟",
        defaultSuggestions: [
          "قائمة التدقيق المالي للمصاريف الخفية (Leak Checklist)",
          "كيف أحسب كلفة الراجع على كل قطعة مباعة؟",
          "إدارة دورة رأس المال والتحصيل من شركات التوصيل"
        ]
      }
    ]
  }
];

// Presets for Script Generator
const SCRIPT_OBJECTIONS = [
  {
    id: "expensive",
    label: "السعر غالي",
    icon: "💸",
    promptContext: "الزبون يرى أن السعر مرتفع ومبالغ فيه"
  },
  {
    id: "think_later",
    label: "بعدين أردلك خبر",
    icon: "⏳",
    promptContext: "الزبون يراح ويقول استشير أو أردلك خبر لاحقاً"
  },
  {
    id: "cheaper_elsewhere",
    label: "شفته أرخص بصفحة ثانية",
    icon: "🔍",
    promptContext: "الزبون يقارن بصفحة أخرى تبيع منتجاً مشابهاً أو مقلداً بسعر أقل"
  },
  {
    id: "quality_fear",
    label: "خايف من الجودة والتوصيل",
    icon: "🛡️",
    promptContext: "الزبون يخاف أن تكون البضاعة غير مطابقة للصورة أو رديئة"
  },
  {
    id: "confirm_call",
    label: "مكالمة تأكيد قبل التوصيل",
    icon: "📞",
    promptContext: "مكالمة سريعة لتأكيد العنوان والجدية قبل تسليم الطلب لشركة التوصيل"
  }
];

const SCRIPT_NICHES = [
  { id: "general", label: "عام / استهلاكي", icon: "🛍️" },
  { id: "fashion", label: "أزياء وملابس", icon: "👗" },
  { id: "beauty", label: "تجميل وعناية", icon: "💄" },
  { id: "electronics", label: "إلكترونيات وأجهزة", icon: "📱" },
  { id: "home", label: "منزل ومطبخ", icon: "🏠" }
];

// Helper to get or create a unique device ID
const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") return "server_device";
  let devId = localStorage.getItem("vizion_device_uid");
  if (!devId) {
    devId = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem("vizion_device_uid", devId);
  }
  return devId;
};

// Helper to compute storage key for the current device and user
const getChatStorageKey = (code?: string): string => {
  const activeCode = code || (typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") : "") || "";
  const normalized = normalizeCode(activeCode);
  if (normalized) {
    return `vizion_chat_history_user_${normalized}`;
  }
  const deviceId = getOrCreateDeviceId();
  return `vizion_chat_history_device_${deviceId}`;
};

// Helper to compute profile storage key for diagnostic workflow
const getProfileStorageKey = (code?: string): string => {
  const activeCode = code || (typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") : "") || "";
  const normalized = normalizeCode(activeCode);
  if (normalized) {
    return `vizion_user_profile_${normalized}`;
  }
  const deviceId = getOrCreateDeviceId();
  return `vizion_user_profile_${deviceId}`;
};

// 4 Curated Example Questions for Advisor Empty State
const EXAMPLE_QUESTIONS = [
  {
    id: "ex_no_sales",
    label: "عندي رسائل بس ماكو شراء",
    topicId: "topic_ad_messages_no_sales",
    suggestions: [
      "شنو أخطاء الرد السريع على الزبون؟",
      "اعطيني سكريبت فحص جدية الزبون",
      "كيف أقنع الزبون يطلب هسة؟"
    ]
  },
  {
    id: "ex_price_high",
    label: "الزبون يكول السعر غالي",
    topicId: "topic_sales_price_objection",
    suggestions: [
      "اعطيني سكريبت رد على 'السعر غالي'",
      "طريقة صياغة عروض البكجات 1+1",
      "كيف أظهر قيمة المنتج العالية؟"
    ]
  },
  {
    id: "ex_returns",
    label: "نسبة الراجع عندي عالية",
    topicId: "topic_delivery_returns",
    suggestions: [
      "سكريبت مكالمة تأكيد الطلب قبل التوصيل",
      "كيف أتعامل مع تأخير شركة التوصيل؟",
      "نصائح لاختيار شركة توصيل موثوقة"
    ]
  },
  {
    id: "ex_followup",
    label: "أريد سكريبت متابعة للزبون",
    topicId: "topic_sales_hesitation",
    suggestions: [
      "رسالة متابعة بعد 24 ساعة",
      "طريقة تقديم عرض خصم مؤقت",
      "سكريبت إنعاش الزبائن المترددين"
    ]
  }
];

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome-1",
  role: "assistant",
  text: "هلا بيك. هذا مستشار فيزيون لمساعدتك بقرارات البيع والتسويق والتوصيل بالسوق العراقي.\n\nتكدر تختار موضوع من القائمة، أو تكتب سؤالك مباشرة. سجل المحادثة يبقى محفوظ على جهازك حتى ترجعله بوقت ثاني.",
  timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
  suggestions: [
    "ابدأ تشخيص مشروعي (4 خطوات)",
    "شلون أقلل نسبة الراجع بالمحافظات؟",
    "اكتبلي رد على اعتراض: السعر غالي",
    "إعلاني يجيب رسائل بس ماكو مبيعات، شنو الحل؟",
    "شلون أسعر منتجي وأحسب الربح الصافي؟"
  ]
};


interface ChatInputFormProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  isSuggestionsOpen: boolean;
  onToggleSuggestions: () => void;
  onCloseSuggestions: () => void;
  suggestions: { label: string; prompt: string; suggestions?: string[]; topicId?: string }[];
  onSendSuggestion: (prompt: string, suggestions?: string[], topicId?: string) => void;
  lastFailedPrompt?: { text: string; presetSuggestions?: string[]; errorText?: string } | null;
  onRetryLast?: () => void;
  restoredText?: string;
  onTextRestored?: () => void;
  onInputFocus?: () => void;
}

function ChatInputForm({ 
  onSend, 
  isLoading, 
  isSuggestionsOpen,
  onToggleSuggestions,
  onCloseSuggestions,
  suggestions,
  onSendSuggestion,
  lastFailedPrompt,
  onRetryLast,
  restoredText,
  onTextRestored,
  onInputFocus
}: ChatInputFormProps) {
  const [inputText, setInputText] = React.useState("");
  const lastDraftRef = React.useRef("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Restore text when requested (e.g. from retry or edit button)
  React.useEffect(() => {
    if (restoredText !== undefined && restoredText !== "") {
      setInputText(restoredText);
      onTextRestored?.();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 50);
    }
  }, [restoredText, onTextRestored]);

  // Dynamic auto-resize for textarea up to 120px
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 44), 120);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

  // When loading finishes (success or failure), restore textarea to enabled state & resize
  React.useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 44), 120);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    lastDraftRef.current = trimmed;
    onSend(trimmed);
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter creates a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = !inputText.trim() || isLoading;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* 1. Loading State in Iraqi Arabic */}
      {isLoading && (
        <div 
          role="status" 
          aria-live="polite"
          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-[#D4A017]/30 text-[#F0C040] text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F0C040]" />
            <span>دا أرتبلك الجواب...</span>
          </div>
          <span className="text-[10px] text-amber-200/70 font-sans hidden xs:inline">لحظات ويجهز رد فيزيون</span>
        </div>
      )}

      {/* 2. Failure State Banner with visible Retry & Restore actions */}
      {!isLoading && lastFailedPrompt && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in shadow-md"
        >
          <div className="flex items-center gap-2" role="alert" aria-live="assertive">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm">{lastFailedPrompt.errorText || "صار خلل بسيط. جرّب مرة ثانية."}</span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {onRetryLast && (
              <button                 type="button"
                onClick={onRetryLast}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer active:scale-95 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24] min-w-[44px] flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            )}
            <button               type="button"
              onClick={() => {
                setInputText(lastFailedPrompt.text || lastDraftRef.current);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 font-semibold text-xs flex items-center justify-center gap-1 min-h-[44px] cursor-pointer active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              title="استرجاع النص للتعديل عليه"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل السؤال</span>
            </button>
          </div>
        </div>
      )}

      {/* Explicit Suggestions Panel (Max 4, compact 2-col grid, complete phrases, hideable) */}
      {isSuggestionsOpen && suggestions && suggestions.length > 0 && (
        <div 
          role="region"
          aria-label="أسئلة مقترحة"
          className="p-3 sm:p-3.5 rounded-2xl bg-[#081030] border border-[#D4A017]/40 shadow-xl text-white animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F0C040]">
              <Lightbulb className="w-4 h-4 text-[#F0C040]" />
              <span>أسئلة مقترحة</span>
            </div>
            <button               type="button"
              onClick={onCloseSuggestions}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center gap-1 min-h-[44px] min-w-[44px] cursor-pointer transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              aria-label="إخفاء الاقتراحات"
              title="إخفاء الاقتراحات"
            >
              <X className="w-3.5 h-3.5" />
              <span>إخفاء الاقتراحات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.slice(0, 4).map((item, idx) => (
              <button                 key={idx}
                type="button"
                onClick={() => {
                  onCloseSuggestions();
                  onSendSuggestion(item.prompt, item.suggestions, item.topicId);
                }}
                disabled={isLoading}
                className="text-right p-2.5 sm:p-3 rounded-xl bg-[#040B24] hover:bg-[#0E1B48] active:bg-[#D4A017]/20 border border-white/10 hover:border-[#D4A017]/50 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition flex items-center justify-between gap-2.5 min-h-[44px] cursor-pointer group disabled:opacity-50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              >
                <span className="leading-snug">{item.label}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-[#F0C040]/70 group-hover:text-[#F0C040] shrink-0 transition-transform group-hover:-translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Composer Form: [اقتراحات] [اكتب سؤالك هنا...] [إرسال] */}
      <form onSubmit={handleSubmit} dir="rtl" className="flex items-end gap-1.5 sm:gap-2 relative w-full">
        {/* Invisible live region for screen readers */}
        <div aria-live="polite" className="sr-only">
          {isLoading ? "جاري المعالجة، رجاءً الانتظار..." : ""}
        </div>

        {/* 1. Explicit Suggestions Action Button: [اقتراحات] */}
        <button 
          type="button"
          onClick={onToggleSuggestions}
          title={isSuggestionsOpen ? "إخفاء الاقتراحات" : "اقتراحات"}
          aria-label={isSuggestionsOpen ? "إخفاء الاقتراحات" : "اقتراحات"}
          aria-expanded={isSuggestionsOpen}
          className={`px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer shrink-0 min-h-[42px] justify-center active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] ${ isSuggestionsOpen ? "bg-[#D4A017]/25 border-[#D4A017] text-[#F0C040]" : "bg-white/5 hover:bg-white/10 border-white/15 text-white/90 hover:text-[#F0C040]" } focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
        >
          <Lightbulb className="w-4 h-4 text-[#F0C040] shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">اقتراحات</span>
        </button>

        {/* 2. Text Input Area: [اكتب سؤالك هنا...] */}
        <div className="flex-1 relative flex items-center min-w-0">
          <textarea 
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onInputFocus}
            placeholder="اكتب سؤالك هنا..."
            aria-label="اكتب سؤالك هنا..."
            disabled={isLoading}
            dir="rtl"
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#040B24] border border-white/15 focus:border-[#D4A017] text-white text-xs sm:text-sm placeholder-white/50 outline-none transition-all motion-reduce:transition-none motion-reduce:transform-none dir-rtl text-right resize-none min-h-[42px] max-h-[120px] leading-relaxed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          />
        </div>

        {/* 3. Large Send Button: [إرسال] */}
        <button 
          type="submit"
          disabled={isSendDisabled}
          aria-label="إرسال"
          title="إرسال"
          className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#D4A017] hover:bg-amber-400 active:bg-amber-500 text-[#040B24] font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all motion-reduce:transition-none motion-reduce:transform-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 min-h-[42px] justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24] min-w-[42px]"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#040B24]" />
          ) : (
            <>
              <span className="font-bold whitespace-nowrap">إرسال</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-180 text-[#040B24] shrink-0" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export const VizionAdvisorModal: React.FC<VizionAdvisorModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  onNavigateTool,
  isVip = false,
  userCode = "",
  onUpgradeSuccess
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap and Escape handler
  useEffect(() => {
    if (!isOpen) return;

    // Capture the element that was focused before opening the modal
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Focus first element on open if nothing is focused yet
    if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        setTimeout(() => {
          (focusableElements[0] as HTMLElement).focus();
        }, 100);
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus when modal closes
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose]);

  // Tabs: 'chat' | 'business_diagnostic' | 'diagnostic' | 'script_gen' | 'saved_plan'
  const [activeTab, setActiveTab] = useState<"chat" | "business_diagnostic" | "diagnostic" | "script_gen" | "saved_plan">("chat");
  const [selectedDiagCat, setSelectedDiagCat] = useState<string>("ads");
  
  // Toast Notification System
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: "success" | "copy" | "saved" | "plan" | "navigate", title: string, description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description
    });
  };

  // Saved Recommendations & 7-Day Plan State
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([]);
  const [planTasks, setPlanTasks] = useState<PlanTaskItem[]>([]);

  const refreshSavedData = () => {
    if (typeof window === "undefined") return;
    try {
      const recs = getSavedRecommendationsFromStorage(userCode);
      setSavedRecommendations(recs);

      const planKey = get7DayPlanStorageKey(userCode);
      const savedPlan = localStorage.getItem(planKey);
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (Array.isArray(parsed)) {
          setPlanTasks(parsed);
        }
      } else {
        setPlanTasks([]);
      }
    } catch (e) {
      console.warn("Failed to load saved recommendations/plan:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshSavedData();
    }
  }, [isOpen, userCode, activeTab]);

  const handleToggleTaskCompleted = (taskId: string) => {
    if (typeof window === "undefined") return;
    try {
      const updated = planTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      setPlanTasks(updated);
      const planKey = get7DayPlanStorageKey(userCode);
      localStorage.setItem(planKey, JSON.stringify(updated));
      const target = updated.find((t) => t.id === taskId);
      if (target?.completed) {
        showToast("success", "أحسنت! أتممت هذه المهمة 🎯", target.task);
      }
    } catch (e) {
      console.warn("Failed to update plan task:", e);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (typeof window === "undefined") return;
    try {
      const updated = planTasks.filter((t) => t.id !== taskId);
      setPlanTasks(updated);
      const planKey = get7DayPlanStorageKey(userCode);
      localStorage.setItem(planKey, JSON.stringify(updated));
      showToast("success", "تم حذف المهمة من الخطة");
    } catch (e) {
      console.warn("Failed to delete task:", e);
    }
  };

  const handleDeleteRecommendation = (recId: string) => {
    removeSavedRecommendationFromStorage(recId, userCode);
    refreshSavedData();
    showToast("success", "تم حذف التوصية من المحفوظات");
  };
  
  // Script Generator States
  const [selectedObjection, setSelectedObjection] = useState<string>("expensive");
  const [selectedNiche, setSelectedNiche] = useState<string>("general");
  const [customProductNote, setCustomProductNote] = useState<string>("");

  // Load initial messages from localStorage specific to this device & user
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storageKey = getChatStorageKey(userCode);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to load saved chat history:", e);
      }
    }
    return [];
  });

  // Track if any user questions have been sent
  const hasUserMessages = messages.some((m) => m.role === "user");

  // Re-sync messages when userCode changes or modal opens
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storageKey = getChatStorageKey(userCode);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to sync chat history for code:", e);
      }
    }
  }, [userCode, isOpen]);

  // Persist messages whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        const storageKey = getChatStorageKey(userCode);
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn("Failed to save chat history to localStorage:", e);
      }
    }
  }, [messages, userCode]);

  // State for active topic isolation
  const [currentTopicId, setCurrentTopicId] = useState<string>(() => `topic_${Date.now()}`);
  const currentTopicRef = useRef<string>(currentTopicId);
  useEffect(() => {
    currentTopicRef.current = currentTopicId;
  }, [currentTopicId]);

    const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<
      string,
      {
        rating: "helpful" | "unhelpful";
        reason?: string;
        showReasonPicker?: boolean;
      }
    >
  >({});

  const FEEDBACK_REASONS = [
    "عام جداً",
    "مو مرتبط بسؤالي",
    "الحساب غير واضح",
    "أريد تفاصيل أكثر",
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    trackEvent("advisor_answer_copied", {
      topicId: currentTopicRef.current,
      messageId: id,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFeedback = (
    messageId: string,
    rating: "helpful" | "unhelpful",
    reason?: string
  ) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [messageId]: {
        rating,
        reason: reason || prev[messageId]?.reason,
        showReasonPicker: rating === "unhelpful" && !reason,
      },
    }));

    trackEvent("advisor_feedback_submitted", {
      rating,
      reason: reason || (rating === "helpful" ? "مفيد ودقيق" : undefined),
      messageId,
      topicId: currentTopicRef.current,
    });

    if (rating === "helpful" || reason) {
      showToast(
        "success",
        rating === "helpful"
          ? "شكراً لتقييمك! ساعدتنا في تحسين المستشار 👍"
          : "شكراً لملاحظتك! سنعمل على تطوير الإجابات ✍️"
      );
    }
  };

  const [vipUpgradeInput, setVipUpgradeInput] = useState("");
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<{ text: string; presetSuggestions?: string[]; errorText?: string } | null>(null);
  const [restoredText, setRestoredText] = useState<string>("");
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
  const [isCompactLayout, setIsCompactLayout] = useState(false);

  useEffect(() => {
    const element = modalRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateLayout = () => setIsCompactLayout(element.getBoundingClientRect().width < 850);
    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen]);

  // The advisor is a full-screen mobile surface. Lock the course page behind it
  // so users never get a second document scrollbar while reading the chat.
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [isOpen]);

  // Computed suggestions for explicit "اقتراحات" action (max 4, complete readable phrases, topic IDs preserved)
  const activeSuggestions = React.useMemo(() => {
    // 1. If latest assistant message has contextual suggestions, offer those
    const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant" && !m.isError && m.suggestions && m.suggestions.length > 0);
    if (latestAssistant && latestAssistant.suggestions && latestAssistant.suggestions.length > 0) {
      return latestAssistant.suggestions.slice(0, 4).map((sug) => ({
        label: sug,
        prompt: sug,
        topicId: latestAssistant.topicId || currentTopicRef.current
      }));
    }

    // 2. Otherwise provide the 4 core example questions with preserved topic IDs
    return EXAMPLE_QUESTIONS.slice(0, 4).map((ex) => ({
      label: ex.label,
      prompt: ex.label,
      suggestions: ex.suggestions,
      topicId: ex.topicId
    }));
  }, [messages]);
  const composerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevIsLoadingRef = useRef(isLoading);
  const isInitialOpenRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const chat = chatScrollRef.current;
    if (!chat) return;

    chat.scrollTo({
      top: chat.scrollHeight,
      behavior,
    });
    setShowScrollBottomBtn(false);
  };

  const handleChatScroll = () => {
    const chat = chatScrollRef.current;
    if (!chat) return;
    const isFarFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight > 150;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  // ResizeObserver for smooth tracking when AI content height changes dynamically
  useEffect(() => {
    const chat = chatScrollRef.current;
    if (!chat || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (isLoadingRef.current) {
        const isNearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 250;
        if (isNearBottom) {
          chat.scrollTop = chat.scrollHeight;
        }
      }
    });

    observer.observe(chat);
    return () => observer.disconnect();
  }, [activeTab, isOpen]);

  // Monitor visualViewport resize (e.g. mobile virtual keyboard)
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };

    handleViewportChange();
    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !isVip || activeTab !== "chat") {
      isInitialOpenRef.current = true;
      return;
    }

    const messagesCountChanged = messages.length > prevMessagesLengthRef.current;
    const responseFinished = prevIsLoadingRef.current && !isLoading;
    const isInitial = isInitialOpenRef.current;

    // Maintain scroll position when user is reading older messages.
    // Only scroll to newest response when user sends a message, new response finishes, or initial open.
    if (isInitial || messagesCountChanged || responseFinished) {
      scrollToBottom(isInitial ? "auto" : "smooth");
      isInitialOpenRef.current = false;
    }

    prevMessagesLengthRef.current = messages.length;
    prevIsLoadingRef.current = isLoading;
  }, [messages.length, isLoading, isOpen, isVip, activeTab]);

  // Clean up any ongoing request when unmounting or closing
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [isOpen]);

  // Parse AI message to extract suggestions
  const parseResponseSuggestions = (rawText: string): { cleanText: string; suggestions: string[] } => {
    const suggestionMatch = rawText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
    if (suggestionMatch && suggestionMatch[1]) {
      const suggestions = suggestionMatch[1]
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const cleanText = rawText.replace(/\[SUGGESTIONS:\s*(.*?)\]/gi, "").trim();
      return { cleanText, suggestions };
    }

    // Default fallback suggestions if not returned in tags
    return {
      cleanText: rawText,
      suggestions: [
        "اعطيني سكريبت عملي قابل للنسخ",
        "كيف أطبق هذا في حملتي الإعلانية؟",
        "ما هو الخطأ الشائع الذي يجب تجنبه؟"
      ]
    };
  };

  const handleVipUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);
    setUpgradeSuccessMsg(null);

    const trimmed = vipUpgradeInput.trim();
    if (!trimmed) {
      setUpgradeError("الرجاء إدخال رمز التفعيل للمتابعة.");
      return;
    }

    const normalizedInput = normalizeCode(trimmed);
    if (!normalizedInput.includes("#ai")) {
      setUpgradeError("الرمز المدخل لا يتضمن صلاحية المستشار الذكي (يجب أن يحتوي على #ai).");
      return;
    }

    const validCodes = getAllValidCodes();
    const isValid = validCodes.includes(normalizedInput);

    if (isValid) {
      setUpgradeSuccessMsg("تم تفعيل اشتراك المستشار الذكي بنجاح! جاري فتح النظام...");
      localStorage.setItem("sales_guide_user_code", trimmed);
      setTimeout(() => {
        if (onUpgradeSuccess) {
          onUpgradeSuccess(trimmed);
        }
      }, 1000);
    } else {
      setUpgradeError("الرمز المدخل غير صحيح أو غير مفعل.");
    }
  };

  // Start clean topic
  const handleStartNewTopic = () => {
    // Ask for confirmation only if existing conversation data would be lost
    const hasUserMessages = messages.some((m) => m.role === "user");
    if (hasUserMessages) {
      const confirmed = confirm("هل تريد بدء موضوع جديد ومسح المحادثة الحالية؟");
      if (!confirmed) return;
    }

    const newTopicId = `topic_${Date.now()}`;
    setCurrentTopicId(newTopicId);
    currentTopicRef.current = newTopicId;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isLoadingRef.current = false;
      setIsLoading(false);
    }

    const newTopicMessage: Message = {
      id: `topic_${Date.now()}`,
      role: "assistant",
      text: "بدأنا موضوع جديد. اكتب سؤالك هسه.",
      timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
      isDivider: true,
      topicId: newTopicId,
      suggestions: [
        "🎯 تشخيص ضعف نتائج الإعلانات",
        "💬 سكريبت الرد على 'السعر غالي'",
        "📦 خطة تقليل نسبة الراجع للمحافظات",
        "🧮 معادلة تسعير المنتج لضمان الأرباح"
      ]
    };

    setMessages([newTopicMessage]);
    setLastFailedPrompt(null);
    setIsSuggestionsOpen(false);
    setActiveTab("chat");
    showToast("success", "بدأنا موضوع جديد. اكتب سؤالك هسه.");
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isLoadingRef.current = false;
    setIsLoading(false);
  };

  const handleCompleteDiagnostic = (profile: BusinessDiagnosticProfile, metrics: DiagnosticMetrics) => {
    setActiveTab("chat");
    const prompt = constructDiagnosticPrompt(profile, metrics);
    handleSendMessage(
      prompt,
      [
        "📅 حوّلها إلى خطة 7 أيام",
        "💬 اكتبلي السكربت العراقي",
        "🧮 احسب صافي الربح",
        "📖 افتح الفصل المرتبط"
      ],
      {
        topicContext: `تشخيص مشروع: ${profile.productOrService || profile.businessType}`,
        diagnosticProfile: profile
      }
    );
  };

  const handleSendMessage = async (
    textToSend?: string,
    presetSuggestions?: string[],
    optionsOrTopicId?: string | {
      overrideTopicId?: string;
      isNewTopic?: boolean;
      topicContext?: string;
      diagnosticProfile?: BusinessDiagnosticProfile;
    }
  ) => {
    const text = textToSend?.trim() || "";
    
    // Prevent duplicate submissions
    if (!text || isLoadingRef.current) return;

    // Automatically hide suggestions when a message is sent
    setIsSuggestionsOpen(false);

    // Support quick trigger from suggestions: "⚡ ابدأ تشخيص مشروعي الشامل"
    if (text.includes("ابدأ تشخيص مشروعي") || text.includes("شخّص مشروعي")) {
      setActiveTab("business_diagnostic");
      return;
    }

    const options = typeof optionsOrTopicId === "object" ? optionsOrTopicId : { overrideTopicId: optionsOrTopicId };
    const topicId = options.overrideTopicId || currentTopicRef.current;
    const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    isLoadingRef.current = true;
    setIsLoading(true);
    setLastFailedPrompt(null);

    trackEvent("advisor_prompt_submitted", { topicId });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
      topicId: topicId,
      requestId: clientRequestId
    };

    setMessages((prev) => [...prev, userMessage]);
        setActiveTab("chat"); // Auto switch to chat to see the answer

    // Setup AbortController with 90s timeout (ample time for deep diagnostics & high load)
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 90000);

    try {
      // Build past history strictly filtered to current topic to avoid cross-contamination
      const topicMessages = messages
        .filter((m) => !m.isDivider && m.topicId === topicId)
        .slice(-6); // Sliding window of max 6 recent turns

      const historyPayload = topicMessages.map((m) => ({
        role: m.role,
        text: m.text.replace(/\[SUGGESTIONS:\s*.*?\]/gi, "").trim(),
        topicId: m.topicId
      }));

      // Append current user message
      historyPayload.push({ role: "user", text: text, topicId });

      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": clientRequestId
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: historyPayload,
          requestId: clientRequestId,
          topicContext: options.topicContext || topicId,
          isNewTopic: options.isNewTopic,
          diagnosticProfile: options.diagnosticProfile,
          userContext: {
            isVip,
            platform: "Vizion Iraq E-Commerce Suite"
          }
        })
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        const cleanText = responseText.replace(/<[^>]*>?/gm, "").trim();
        throw new Error(`خطأ في استجابة السيرفر (كود ${response.status}): ${cleanText.slice(0, 150) || "ماكو تفاصيل"}`);
      }

      if (!response.ok) {
        const errorDetails = data.details ? ` (${data.details})` : "";
        throw new Error((data.error || "Failed to fetch response") + errorDetails);
      }

      const rawReply = data.reply || "عذراً، حدث خطأ أثناء معالجة الطلب.";
      const { cleanText, suggestions } = parseResponseSuggestions(rawReply);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: cleanText,
        timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        topicId: topicId,
        requestId: data.requestId || clientRequestId,
        suggestions: presetSuggestions || (suggestions.length > 0 ? suggestions : undefined)
      };

      setMessages((prev) => [...prev, botMessage]);
      setLastFailedPrompt(null);
      trackEvent("advisor_answer_completed", {
        topicId,
        requestId: data.requestId || clientRequestId
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("AI Advisor error:", err);

      let errorText = "صار خلل بسيط. جرّب مرة ثانية.";
      if (err?.name === "AbortError") {
        errorText = "استغرقت الاستجابة وقتاً أطول من المعتاد بسبب ضغط الخوادم المؤقت. يرجى الضغط على زر 'إعادة المحاولة'.";
      } else if (err?.message && typeof err.message === "string" && err.message.length > 3 && !err.message.includes("Failed to fetch")) {
        errorText = err.message;
      } else if (err?.message?.includes("Failed to fetch")) {
        errorText = "تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الخادم وإضافة GEMINI_API_KEY في إعدادات البيئة ثم إعادة المحاولة.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: errorText,
        timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        topicId: topicId,
        isError: true,
        failedPrompt: { text, presetSuggestions },
        suggestions: [
          "🎯 تشخيص ضعف إعلاناتي",
          "📦 خطة تقليل الراجع بالمحافظات",
          "💬 سكريبت مبيعات الواتساب"
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLastFailedPrompt({ text, presetSuggestions, errorText });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleGenerateScript = () => {
    const objObj = SCRIPT_OBJECTIONS.find((o) => o.id === selectedObjection);
    const nicheObj = SCRIPT_NICHES.find((n) => n.id === selectedNiche);

    let topicId = "topic_sales_price_objection";
    if (selectedObjection === "expensive") topicId = "topic_sales_price_objection";
    else if (selectedObjection === "think_later") topicId = "topic_sales_hesitation";
    else if (selectedObjection === "cheaper_elsewhere") topicId = "topic_competitors";
    else if (selectedObjection === "quality_fear") topicId = "topic_sales_price_objection";
    else if (selectedObjection === "confirm_call") topicId = "topic_delivery_confirmation";

    const prompt = `اعطيني سكريبت رد احترافي مكتوب باللهجة العراقية المفهومة والودية للتعامل مع اعتراض: "${objObj?.label}" (${objObj?.promptContext}) لمتجر يعمل في مجال: "${nicheObj?.label}".
${customProductNote.trim() ? `ملاحظات إضافية عن المنتج: ${customProductNote.trim()}` : ""}
المطلوب:
1. صياغة سكريبت محادثة واتساب مباشر جاهز للنسخ والإرسال.
2. نصيحة ذهبية لمنع خسارة الزبون وإغلاق البيعة فوراً.`;

    handleSendMessage(
      prompt,
      [
        "اعطني خيار رد بديل لنفس الاعتراض",
        "كيف أضيف عرض حزمة (Bundle) مقنع؟",
        "سكريبت المتابعة في حال لم يرد الزبون"
      ],
      topicId
    );
  };

  const handleClearHistory = () => {
    if (confirm("هل أنت متأكد من مسح محادثة المستشار الذكي المحفوظة على هذا الجهاز؟")) {
      setMessages([]);
      if (typeof window !== "undefined") {
        try {
          const storageKey = getChatStorageKey(userCode);
          localStorage.removeItem(storageKey);
        } catch (e) {
          console.warn("Failed to clear local chat history:", e);
        }
      }
      showToast("success", "تم مسح المحادثة بنجاح");
    }
  };

  if (!isOpen) return null;

  const currentDiag = DIAGNOSTIC_CATEGORIES.find((c) => c.id === selectedDiagCat) || DIAGNOSTIC_CATEGORIES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex h-[100dvh] items-center justify-center overflow-hidden overscroll-none p-0 sm:p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisor-modal-title"
            style={
              viewportHeight && typeof window !== "undefined" && window.innerWidth < 640
                ? { height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }
                : undefined
            }
            className={`vizion-advisor-modal ${isCompactLayout ? "vizion-advisor-compact" : ""} relative w-full max-w-4xl h-[100dvh] sm:h-[88vh] min-h-0 bg-[#040B24] border-0 sm:border border-[#D4A017]/30 rounded-none sm:rounded-3xl shadow-xl flex flex-col overflow-hidden overscroll-none text-white dir-rtl motion-reduce:transition-none motion-reduce:transform-none`}
          >
            {/* Mobile Pull Indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto my-1 sm:hidden shrink-0" />

            {/* In-Modal Toast Alerts */}
            <AdvisorToast toast={toast} onDismiss={() => setToast(null)} />

            {/* Calm Header */}
            <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#081030] border-b border-white/10 flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center text-[#F0C040]">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  {isVip && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-[#040B24] rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 id="advisor-modal-title" className="text-xs sm:text-base font-bold text-white tracking-wide truncate">
                      المستشار الذكي <span className="text-[#F0C040] text-[11px] font-normal hidden sm:inline">| فيزيون AI</span>
                    </h3>
                    {isVip ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#D4A017]/20 text-[#F0C040] border border-[#D4A017]/30 shrink-0">
                        VIP
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/60 font-normal truncate hidden sm:block">
                    مستشارك الرقمي المباشر لتحليل وتطوير مشروعك
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {isVip && (
                  <>
                    <button 
                      onClick={handleStartNewTopic}
                      title="بدء موضوع استشارة جديد"
                      aria-label="موضوع جديد"
                      className="px-2 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F0C040] border border-[#D4A017]/30 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 min-h-[38px] justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
                      <span className="hidden sm:inline">موضوع جديد</span>
                    </button>

                    <button 
                      onClick={handleClearHistory}
                      title="مسح سجل المحادثة"
                      aria-label="مسح السجل"
                      className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition-colors border border-white/5 cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button autoFocus 
                  onClick={onClose}
                  aria-label="إغلاق"
                  title="إغلاق"
                  className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-transparent sm:bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors sm:border border-white/10 cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center gap-1 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040]"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs font-bold">إغلاق</span>
                </button>
              </div>
            </div>

            {/* IF NOT VIP: Render High-Converting AI Advisor Subscription Screen */}
            {!isVip ? (
              <div 
                role="region"
                aria-label="اشتراك المستشار الذكي"
                className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24] space-y-6 text-right"
              >
                {/* Top Header Card */}
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4A017]/20 via-amber-500/20 to-[#D4A017]/20 border border-[#D4A017]/50 text-xs sm:text-sm font-black text-[#F0C040] shadow-md">
                    <Sparkles className="w-4 h-4 text-[#F0C040] animate-pulse" />
                    <span>مستشارك الشخصي للتجارة الإلكترونية بالسوق العراقي</span>
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    اشترك الآن في <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-amber-300 to-[#D4A017]">المستشار الذكي</span> بـ 14,000 دينار فقط!
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                    احصل على خبير إعلانات ومبيعات يعمل في هاتفك 24 ساعة بدون توقف لتشخيص حملاتك وتوليد سكريبتات إغلاق الصفقات عبر الواتساب.
                  </p>
                </div>

                {/* Price Breakdown & Value Pitch Box */}
                <div className="max-w-xl mx-auto bg-gradient-to-br from-[#0F1738] via-[#162252] to-[#0D1638] border-2 border-[#D4A017] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-[#D4A017] to-amber-500 text-[#040B24] font-black text-[11px] sm:text-xs px-4 py-1.5 rounded-br-2xl shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-[#040B24]" />
                    <span>عرض الاشتراك الشهري الفوري</span>
                  </div>

                  {/* Main Pricing Highlight */}
                  <div className="flex items-center justify-between border-b border-[#D4A017]/30 pb-4 pt-3">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block mb-1">الاشتراك الشهري المباشر</span>
                      <h4 className="text-lg sm:text-2xl font-black text-white">المستشار الذكي (Vizion AI)</h4>
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        فقط 466 د.ع باليوم! (أقل من سعر استكان شاي ☕)
                      </span>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-2xl sm:text-4xl font-black text-[#F0C040] font-mono tracking-tight">14,000</div>
                      <div className="text-xs font-bold text-amber-200">د.ع / شهرياً</div>
                    </div>
                  </div>

                  {/* Why it's worth every dinar (Value Comparison) */}
                  <div className="bg-[#040B24]/80 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-white/90 space-y-2">
                    <div className="flex items-center gap-2 text-[#F0C040] font-bold text-xs sm:text-sm">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                      <span>حسبة بسيطة: ليش هذا الاشتراك يوفر عليك ثروة؟</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed">
                      حملة إعلانية واحدة فاشلة بالفيسبوك تضيع عليك <strong className="text-rose-400">50,000 إلى 100,000 دينار</strong>. المستشار الذكي يحميك من الخسارة بحسبة تسعير واحدة أو سكريبت رد واحد بالواتساب ويرجعلك المبلغ أضعاف من أول يوم!
                    </p>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-black text-white/90 block border-b border-white/10 pb-1.5">
                      ✨ شنو ينفتحلك فوراً بعد الاشتراك؟
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-white/90">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>تشخيص <strong className="text-rose-400">الخلل الحقيقي</strong> (سعر، منتج، استهداف، لو محادثة) قبل لا تغير إعلانك للمرة العاشرة.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>تحليل <strong className="text-white">المحادثات الفاشلة</strong> — دخل المحادثة للمستشار وراح يكشفلك أخطاءك وينطيك الرد الصح.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>حل مشكلة <strong className="text-white">الزبون الي يسأل ويختفي</strong> — وسكريبتات تخلي المتردد يشتري فوراً.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>تكتشف <strong className="text-[#F0C040]">وين تضيع ميزانيتك</strong> — وتفهم شلون الإعلان والمنتج والزبون مرتبطين ببعض.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong className="text-white">خبير بصفك 24 ساعة</strong> — مو بس تتعلم تسويق، تتعلم شلون تفهم مشروعك وتحل مشاكله.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instant Subscribe via WhatsApp Button */}
                  <div className="pt-2 space-y-3">
                    <a 
                      href="https://wa.me/9647757851379?text=مرحباً،%20أريد%20الاشتراك%20في%20المستشار%20الذكي%20بـ%2014,000%20دينار%20عراقي%20شهرياً"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:scale-[1.01] active:scale-95 transition cursor-pointer min-h-[50px]"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>اشترك الآن عبر الواتساب (14,000 د.ع / شهرياً) 💬</span>
                    </a>
                    <p className="text-[11px] text-center text-white/60">
                      تواصل مباشر مع الدعم عبر الواتساب: <strong className="text-emerald-400 font-mono">07757851379</strong>
                    </p>
                  </div>
                </div>

                {/* Existing Subscriber Code Entry */}
                <div className="max-w-xl mx-auto bg-[#081030] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3 text-right">
                  <div className="space-y-1">
                    <label htmlFor="vip-code-input" className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#F0C040]" />
                      <span>عندك رمز تفعيل الاشتراك؟ أدخله هنا:</span>
                    </label>
                    <p className="text-[11px] text-white/60">أدخل الرمز الذي استلمته عبر الواتساب للتفعيل الفوري.</p>
                  </div>

                  <form onSubmit={handleVipUpgrade} className="flex flex-col sm:flex-row gap-2">
                    <input 
                      id="vip-code-input"
                      type="text"
                      value={vipUpgradeInput}
                      onChange={(e) => setVipUpgradeInput(e.target.value)}
                      placeholder="VIZION-VIP-XXXX#vip"
                      className="flex-1 px-3.5 py-2.5 bg-[#040B24] border border-white/15 rounded-xl text-white text-sm placeholder-white/30 font-mono focus:border-[#D4A017] outline-none text-center sm:text-right min-h-[44px]"
                      aria-label="رمز تفعيل VIP"
                    />

                    <button 
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#D4A017] hover:bg-amber-500 text-[#040B24] font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <span>تفعيل الرمز</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </form>

                  {upgradeError && (
                    <div role="alert" className="p-2.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{upgradeError}</span>
                    </div>
                  )}

                  {upgradeSuccessMsg && (
                    <div role="status" className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{upgradeSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mode Selector - Universal Responsive Horizontal Pill Tab Bar */}
                <div className="px-2 sm:px-6 py-2 bg-[#081030] border-b border-white/10 shrink-0 w-full overflow-hidden">
                  <div className="vizion-advisor-tab-strip flex flex-row flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto w-full no-scrollbar py-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                        activeTab === "chat"
                          ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black shadow-md scale-[1.02]"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>المحادثة الحرة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("business_diagnostic")}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                        activeTab === "business_diagnostic"
                          ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black shadow-md scale-[1.02]"
                          : "bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#F0C040] border border-[#D4A017]/30"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>تشخيص مشروعي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("diagnostic")}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                        activeTab === "diagnostic"
                          ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black shadow-md scale-[1.02]"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                      }`}
                    >
                      <Compass className="w-4 h-4 shrink-0" />
                      <span>مشخّص المشاكل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("script_gen")}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                        activeTab === "script_gen"
                          ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black shadow-md scale-[1.02]"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>مولّد السكريبتات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("saved_plan")}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
                        activeTab === "saved_plan"
                          ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black shadow-md scale-[1.02]"
                          : "bg-[#0A122E]/80 hover:bg-[#D4A017]/10 text-white/80 border border-white/10"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 text-[#F0C040] shrink-0" />
                      <span>التوصيات والخطة</span>
                      {(savedRecommendations.length > 0 || planTasks.length > 0) && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#D4A017] text-[#040B24] shadow-sm ms-1">
                          {savedRecommendations.length + planTasks.filter((t) => !t.completed).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* TAB: GUIDED BUSINESS DIAGNOSTIC STEPPER */}
                {activeTab === "business_diagnostic" && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24]">
                    <BusinessDiagnosticStepper
                      storageKey={getProfileStorageKey(userCode)}
                      onCancel={() => setActiveTab("chat")}
                      onComplete={handleCompleteDiagnostic}
                    />
                  </div>
                )}

                {/* TAB 1: DIAGNOSTIC WIZARD (Choose your problem & get instant AI diagnosis) */}
                {activeTab === "diagnostic" && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24] space-y-5">
                    <div className="bg-[#0F1735]/80 border border-[#D4A017]/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-2 text-[#F0C040]">
                        <Compass className="w-5 h-5" />
                        <h4 className="text-sm sm:text-base font-black text-white">
                          اختر التحدي الذي يواجه مشروعك حالياً:
                        </h4>
                      </div>
                      <p className="text-xs text-white/70">
                        حدد القسم والمشكلة المحددة وسيقوم مستشار فيزيون بتحليل السبب وتقديم الحلول والسكريبتات فوراً.
                      </p>
                    </div>

                    {/* Categories Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DIAGNOSTIC_CATEGORIES.map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => setSelectedDiagCat(cat.id)}
                          className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col gap-1 ${ selectedDiagCat === cat.id ? "bg-gradient-to-b from-[#162252] to-[#0D1638] border-[#D4A017] shadow-lg md:shadow-[#D4A017] shadow-xl/15 ring-1 ring-[#D4A017]" : "bg-[#0A122E]/70 border-white/10 hover:border-white/25 text-white/80" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-bold text-white line-clamp-1">{cat.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Specific Options for Selected Category */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F0C040] flex items-center gap-1">
                          <span>{currentDiag.icon}</span>
                          <span>اختر الحالة الدقيقة لمشروعك:</span>
                        </span>
                        <span className="text-[11px] text-white/70 font-mono">
                          {currentDiag.options.length} خيارات متاحة
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {currentDiag.options.map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleSendMessage(opt.prompt, opt.defaultSuggestions, opt.topicId)}
                            disabled={isLoading}
                            className="w-full text-right p-3.5 sm:p-4 rounded-xl bg-[#0F1735]/90 hover:bg-[#162252] border border-white/10 hover:border-[#D4A017]/60 transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-md min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                          >
                            <div className="space-y-1 pr-1">
                              <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F0C040] transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                                <span>{opt.label}</span>
                              </h5>
                              <p className="text-[11px] sm:text-xs text-white/60">
                                {opt.subtext}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pr-3">
                              <span className="text-[11px] font-bold text-[#D4A017] group-hover:underline hidden sm:inline">
                                تحليل فوري
                              </span>
                              <div className="w-7 h-7 rounded-lg bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040] group-hover:scale-110 transition-transform">
                                <ArrowLeft className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INSTANT SCRIPT GENERATOR (Choose objection & generate copy-paste script) */}
                {activeTab === "script_gen" && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24] space-y-5">
                    <div className="bg-[#0F1735]/80 border border-[#D4A017]/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-2 text-[#F0C040]">
                        <FileText className="w-5 h-5" />
                        <h4 className="text-sm sm:text-base font-black text-white">
                          مولّد سكريبتات إغلاق الصفقات بالسوق العراقي 💬
                        </h4>
                      </div>
                      <p className="text-xs text-white/70">
                        اختر نوع الاعتراض ومجال المنتج، وسيكتب لك مستشار فيزيون سكريبت محادثة جاهز للنسخ والإرسال للزبون على الواتساب أو عبر الاتصال.
                      </p>
                    </div>

                    {/* 1. Choose Objection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[10px] text-[#F0C040]">1</span>
                        <span>ما هو اعتراض الزبون الذي تريد تجاوزه؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SCRIPT_OBJECTIONS.map((obj) => (
                          <button 
                            key={obj.id}
                            onClick={() => setSelectedObjection(obj.id)}
                            className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-2.5 ${ selectedObjection === obj.id ? "bg-[#162252] border-[#D4A017] shadow-lg md:shadow-[#D4A017] shadow-xl/20 text-white font-bold" : "bg-[#0A122E]/70 border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                          >
                            <span className="text-lg">{obj.icon}</span>
                            <span className="text-xs">{obj.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Choose Niche */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[10px] text-[#F0C040]">2</span>
                        <span>ما هو مجال أو تخصص متجرك؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SCRIPT_NICHES.map((niche) => (
                          <button 
                            key={niche.id}
                            onClick={() => setSelectedNiche(niche.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col items-center gap-1 ${ selectedNiche === niche.id ? "bg-[#162252] border-[#D4A017] shadow-lg md:shadow-[#D4A017] shadow-xl/20 text-white font-bold" : "bg-[#0A122E]/70 border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                          >
                            <span className="text-base">{niche.icon}</span>
                            <span className="text-[11px]">{niche.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Custom Product Note (Optional) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                        <span>ملاحظات إضافية أو اسم المنتج (اختياري):</span>
                        <span className="text-[10px] text-white/60">مثال: ساعة ذكية ضد الماء بسعر 25 ألف</span>
                      </label>
                      <input 
                        type="text"
                        value={customProductNote}
                        onChange={(e) => setCustomProductNote(e.target.value)}
                        placeholder="اكتب اسم المنتج أو السعر إذا أردت تخصيص السكريبت بدقة..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#040B24] border border-white/15 focus:border-[#D4A017] text-white text-xs placeholder-white/30 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                      />
                    </div>

                    {/* Generate Button */}
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] font-black text-sm flex items-center justify-center gap-2 shadow-xl md:shadow-[#D4A017] shadow-xl/25 hover:scale-[1.01] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer disabled:opacity-50 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>توليد السكريبت العراقي الآن ⚡</span>
                    </button>
                  </div>
                )}

                {/* TAB: SAVED RECOMMENDATIONS & 7-DAY ACTION PLAN */}
                {activeTab === "saved_plan" && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24] space-y-6">
                    {/* Top Stat Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-[#0F1735]/90 border border-[#D4A017]/30 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-white/60">التوصيات والسكريبتات المحفوظة</span>
                          <h4 className="text-xl font-black text-[#F0C040]">{savedRecommendations.length} توصية</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#F0C040]">
                          <Bookmark className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0F1735]/90 border border-[#D4A017]/30 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-white/60">مهام خطة الـ 7 أيام المنجزة</span>
                          <h4 className="text-xl font-black text-emerald-400">
                            {planTasks.filter((t) => t.completed).length} / {planTasks.length} مكتملة
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Section 1: 7-Day Plan Tasks */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[#F0C040]" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            📅 خطة الـ 7 أيام التنفيذية
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {planTasks.length} مهام مضافة
                        </span>
                      </div>

                      {planTasks.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#0A122E]/60 border border-white/10 text-center space-y-2">
                          <Calendar className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">لم تضف أي توصيات لخطة الـ 7 أيام بعد</p>
                          <p className="text-[11px] text-white/60">
                            عند استشارة مستشار فيزيون، اضغط على زر <strong className="text-[#F0C040]">"إضافة للخطة 7 أيام"</strong> في بطاقة الإجراءات لتنظيم خطواتك هنا.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {planTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3.5 sm:p-4 rounded-xl border transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-start justify-between gap-3 ${
                                task.completed
                                  ? "bg-[#0A122E]/40 border-emerald-500/30 opacity-70"
                                  : "bg-[#0F1735]/90 border-white/10 hover:border-[#D4A017]/40"
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <button 
                                  onClick={() => handleToggleTaskCompleted(task.id)}
                                  className={`mt-0.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${ task.completed ? "bg-emerald-500 border-emerald-400 text-[#040B24]" : "border-white/30 hover:border-[#D4A017] bg-black/20" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                                >
                                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F0C040] text-[10px] font-black">
                                      {task.day}
                                    </span>
                                    <h4 className={`text-xs sm:text-sm font-bold ${task.completed ? "line-through text-white/70" : "text-white"}`}>
                                      {task.task}
                                    </h4>
                                  </div>
                                  {task.description && (
                                    <p className="text-[11px] text-white/60 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Direct Actions in Plan item */}
                                  <div className="pt-2 flex flex-wrap gap-2">
                                    {task.toolId && (
                                      <button 
                                        onClick={() => onNavigateTool?.(task.toolId)}
                                        className="px-2.5 py-1 rounded-lg bg-[#D4A017]/15 hover:bg-[#D4A017] text-[#F0C040] hover:text-[#040B24] border border-[#D4A017]/30 text-[10px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                      >
                                        <Wrench className="w-3 h-3" />
                                        <span>فتح الأداة المرتبطة</span>
                                      </button>
                                    )}
                                    {task.chapterId && (
                                      <button 
                                        onClick={() => onNavigateToSection?.(task.chapterId)}
                                        className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        <span>مراجعة الفصل</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                title="حذف المهمة"
                                className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Saved Recommendations & Scripts */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-5 h-5 text-[#F0C040]" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            📌 التوصيات والسكريبتات المحفوظة
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {savedRecommendations.length} عناصر
                        </span>
                      </div>

                      {savedRecommendations.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#0A122E]/60 border border-white/10 text-center space-y-2">
                          <Bookmark className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">ماكو توصيات محفوظة حتى الآن</p>
                          <p className="text-[11px] text-white/60">
                            اضغط على زر <strong className="text-[#F0C040]">"حفظ التوصية"</strong> في أي رد أو سكريبت لتجده محفوظاً هنا للرجوع إليه دائماً.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {savedRecommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-4 rounded-xl bg-[#0F1735]/90 border border-white/10 hover:border-[#D4A017]/30 transition-all motion-reduce:transition-none motion-reduce:transform-none space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
                                    <span>{rec.title}</span>
                                  </h4>
                                  {rec.relevanceReason && (
                                    <p className="text-[11px] text-[#F0C040]/90 font-medium">
                                      💡 {rec.relevanceReason}
                                    </p>
                                  )}
                                  <span className="text-[9px] text-white/60 font-mono">
                                    حُفظت بتاريخ: {new Date(rec.savedAt).toLocaleDateString("ar-IQ")}
                                  </span>
                                </div>

                                <button 
                                  onClick={() => handleDeleteRecommendation(rec.id)}
                                  title="حذف التوصية"
                                  className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Script Preview if available */}
                              {rec.scriptText && (
                                <div className="p-3 rounded-lg bg-[#040B24] border border-[#D4A017]/30 text-white/90 text-xs space-y-2">
                                  <div className="flex items-center justify-between text-[10px] text-[#F0C040] font-bold">
                                    <span>💬 نص السكريبت الجاهز للزبون:</span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(rec.scriptText || "");
                                        showToast("copy", "تم نسخ السكريبت بنجاح 📋", "تكدر لصقه مباشرة في محادثة الواتساب");
                                      }}
                                      className="px-2 py-0.5 rounded bg-[#D4A017]/20 hover:bg-[#D4A017] text-[#F0C040] hover:text-[#040B24] transition-colors flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>نسخ السكريبت</span>
                                    </button>
                                  </div>
                                  <p className="whitespace-pre-wrap font-sans text-white/80 text-[11px] leading-relaxed">
                                    {rec.scriptText}
                                  </p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {rec.toolId && (
                                  <button 
                                    onClick={() => onNavigateTool?.(rec.toolId)}
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4A017] to-amber-600 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] text-xs font-black transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>فتح الأداة المرتبطة</span>
                                  </button>
                                )}
                                {rec.chapterId && (
                                  <button 
                                    onClick={() => onNavigateToSection?.(rec.chapterId)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1.5 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>مراجعة الفصل</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: INTERACTIVE CHAT (Default Chat view with Dynamic Suggestions) */}
                {activeTab === "chat" && (
                  <>
                    {/* Messages Scroll Area / Focused Empty State */}
                    <div 
                      aria-live="polite"
                      aria-atomic="false"
                      ref={chatScrollRef}
                      onScroll={handleChatScroll}
                      className="vizion-advisor-chat min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 bg-[#040B24] relative"
                    >
                      {!hasUserMessages ? (
                        /* Focused Empty-State Layout */
                        <div className="min-h-full flex flex-col justify-center py-4 my-auto w-full max-w-xl mx-auto">
                          {/* 1. Short Welcome Heading & Icon */}
                          <div className="text-center mb-4 sm:mb-5">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017]/20 to-amber-500/10 border border-[#D4A017]/30 text-[#F0C040] mb-2.5 shadow-sm">
                              <Bot className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1.5">
                              شنو المشكلة اللي تريد نحلها؟
                            </h3>
                            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                              اكتب مشكلتك بالتجارة، وأنا أرتبلك التشخيص والخطوة الجاية.
                            </p>
                          </div>

                          {/* Example Questions / Suggestions in Empty State */}
                          <div className="w-full space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F0C040] pr-1">
                              <Lightbulb className="w-4 h-4 text-[#F0C040] shrink-0" />
                              <span>أسئلة مقترحة</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                              {EXAMPLE_QUESTIONS.slice(0, 4).map((ex) => (
                                <button 
                                  key={ex.id}
                                  type="button"
                                  onClick={() => handleSendMessage(ex.label, ex.suggestions, ex.topicId)}
                                  disabled={isLoading}
                                  className="w-full min-h-[50px] p-3 rounded-xl bg-[#081030] hover:bg-[#0E1B48] active:bg-[#D4A017]/15 border border-white/10 hover:border-[#D4A017]/40 text-right text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-between gap-3 group cursor-pointer shadow-sm active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                >
                                  <span className="text-right leading-snug flex-1">{ex.label}</span>
                                  <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-[#F0C040] shrink-0 transition-transform group-hover:-translate-x-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 sm:space-y-6">
                          {messages.map((msg) => {
                            // 1. Clean New Topic Notice (No duplicate suggestions)
                            if (msg.isDivider) {
                              return (
                                <motion.div
                                  key={msg.id}
                                  role="status"
                                  aria-live="polite"
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="my-3 p-3 rounded-xl bg-[#081030] border border-[#D4A017]/30 text-white flex items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F0C040]">
                                    <Sparkles className="w-4 h-4 text-[#F0C040] shrink-0" />
                                    <span>بدأنا موضوع جديد. اكتب سؤالك هسه أو اختر من الاقتراحات.</span>
                                  </div>
                                </motion.div>
                              );
                            }

                            // 2. Standard Chat Message Display
                            const isUser = msg.role === "user";
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`flex gap-2 sm:gap-2.5 ${
                                  isUser ? "max-w-[85%] sm:max-w-[75%] ms-auto flex-row-reverse" : "max-w-[92%] sm:max-w-[85%] me-auto"
                                }`}
                              >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {isUser ? (
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#D4A017] text-[#040B24] font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 mt-1 select-none">
                                      أنت
                                    </div>
                                  ) : (
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${msg.isError ? "bg-rose-950/80 border border-rose-500/40 text-rose-300" : "bg-[#0A122E] border border-white/15 text-[#F0C040]"} flex items-center justify-center shrink-0 mt-1 select-none`}>
                                      <Bot className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>

                                {/* Message Box */}
                                <div className="group relative flex-1 min-w-0">
                                  <div
                                    className={`p-3.5 sm:p-4 rounded-2xl text-[15px] sm:text-[16px] leading-[1.8] break-words [overflow-wrap:anywhere] ${
                                      isUser
                                        ? "bg-[#D4A017]/10 text-[#F0C040] font-medium rounded-tr-xs"
                                        : msg.isError
                                        ? "bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-xs"
                                        : "bg-[#081030] text-slate-100 rounded-tl-xs"
                                    }`}
                                  >
                                    {/* Error State Card */}
                                    {msg.isError ? (
                                      <div 
                                        role="alert" 
                                        aria-live="assertive"
                                        className="p-3.5 sm:p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-100 text-xs sm:text-sm space-y-3"
                                      >
                                        <div className="flex items-start gap-2 text-rose-300 font-bold text-sm sm:text-base">
                                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                          <span className="leading-relaxed">{msg.text || "صار خلل بسيط. جرّب مرة ثانية."}</span>
                                        </div>

                                        {msg.failedPrompt?.text && (
                                          <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 text-rose-200/90 text-xs">
                                            <span className="text-[10px] text-rose-300/70 block mb-0.5 font-medium">سؤالك المحفوظ:</span>
                                            <p className="line-clamp-2 italic font-sans">{msg.failedPrompt.text}</p>
                                          </div>
                                        )}

                                        <div className="pt-1 flex flex-wrap items-center gap-2">
                                          <button 
                                            type="button"
                                            onClick={() => handleSendMessage(msg.failedPrompt?.text || "", msg.failedPrompt?.presetSuggestions, msg.topicId)}
                                            disabled={isLoading}
                                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition min-h-[44px] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                          >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>إعادة المحاولة</span>
                                          </button>
                                          {msg.failedPrompt?.text && (
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                setRestoredText(msg.failedPrompt!.text);
                                                showToast("copy", "تم استرجاع السؤال للتعديل ✏️");
                                              }}
                                              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                                              title="استرجاع السؤال للتعديل عليه"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                              <span>تعديل السؤال</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : msg.role === "assistant" && (msg.text.includes("التشخيص") || msg.text.includes("أول 3 خطوات") || msg.text.includes("الأسباب المحتملة")) ? (
                                      <StructuredDiagnosticCard
                                        rawText={msg.text}
                                        topicId={msg.topicId}
                                        userCode={userCode}
                                        onActionClick={(prompt) => handleSendMessage(prompt)}
                                        onNavigateChapter={(chId) => onNavigateToSection?.(chId)}
                                        onNavigateTool={(tId, cat) => onNavigateTool?.(tId, cat)}
                                        onShowToast={showToast}
                                        feedback={{
                                          rating: messageFeedback[msg.id]?.rating,
                                          reason: messageFeedback[msg.id]?.reason,
                                          onRate: (rating) => handleFeedback(msg.id, rating),
                                          onSelectReason: (reason) => handleFeedback(msg.id, "unhelpful", reason),
                                        }}
                                        onCopyFull={() => {
                                          handleCopy(msg.id, msg.text);
                                          showToast("copy", "تم نسخ الرد بالكامل بنجاح 📋");
                                        }}
                                        isFullCopied={copiedId === msg.id}
                                      />
                                    ) : (
                                      <>
                                        <div className="whitespace-pre-wrap font-sans space-y-2 break-words [overflow-wrap:anywhere]">
                                          {msg.text.split("\n").map((line, lIdx) => {
                                            const isScriptLine = line.includes("📞") || line.includes("💬") || line.includes("السكريبت:");
                                            const parts = line.split(/(\*\*.*?\*\*)/g);

                                            return (
                                              <div
                                                key={lIdx}
                                                className={`relative ${
                                                  line.startsWith("- ") || line.startsWith("• ")
                                                    ? "my-1 pr-2"
                                                    : line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")
                                                    ? `my-1.5 font-bold ${isUser ? "text-[#F0C040]" : "text-white"}`
                                                    : isScriptLine
                                                    ? "my-2 p-3 bg-[#030614] border-r-2 border-[#D4A017] rounded-lg text-amber-200 text-[14px] sm:text-[15px] font-mono leading-[1.8] overflow-x-auto max-w-full"
                                                    : "my-0.5"
                                                }`}
                                              >
                                                <div className={isScriptLine ? "pl-8 overflow-x-auto" : ""}>
                                                  {parts.map((part, pIdx) => {
                                                    if (part.startsWith("**") && part.endsWith("**")) {
                                                      return (
                                                        <strong
                                                          key={pIdx}
                                                          className={isUser ? "font-bold text-[#F0C040]" : "text-white font-bold"}
                                                        >
                                                          {part.slice(2, -2)}
                                                        </strong>
                                                      );
                                                    }
                                                    return part;
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Action Recommendations Card for Standard Assistant Responses */}
                                        {msg.role === "assistant" && !msg.isError && hasUserMessages && (
                                          <div className="mt-3">
                                            <AdvisorActionCard
                                              topicId={msg.topicId}
                                              responseText={msg.text}
                                              userCode={userCode}
                                              onNavigateChapter={(chId) => onNavigateToSection?.(chId)}
                                              onNavigateTool={(tId, cat) => onNavigateTool?.(tId, cat)}
                                              onShowToast={showToast}
                                              feedback={{
                                                rating: messageFeedback[msg.id]?.rating,
                                                reason: messageFeedback[msg.id]?.reason,
                                                onRate: (rating) => handleFeedback(msg.id, rating),
                                                onSelectReason: (reason) => handleFeedback(msg.id, "unhelpful", reason),
                                              }}
                                              onCopyFull={() => {
                                                handleCopy(msg.id, msg.text);
                                                showToast("copy", "تم نسخ الرد بالكامل بنجاح 📋");
                                              }}
                                              isFullCopied={copiedId === msg.id}
                                            />
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Message Footer Actions */}
                                    {!msg.isError && (
                                      <div className={`mt-2 pt-1.5 border-t ${isUser ? "border-black/15" : "border-white/10"} text-[10px] flex items-center justify-between`}>
                                        <span className={`font-mono text-[9px] sm:text-[10px] ${isUser ? "text-[#040B24]/60 font-semibold" : "text-white/60"}`}>{msg.timestamp}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Calm Inline Typing Loader with User Question Visible Above */}
                      {isLoading && (
                        <motion.div
                          role="status"
                          aria-live="polite"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-2 max-w-[92%] sm:max-w-[85%] ml-auto mt-4"
                        >
                          <div className="flex gap-2 sm:gap-2.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0A122E] border border-white/15 flex items-center justify-center text-[#F0C040] shrink-0 mt-1">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0A122E] border border-white/10 text-slate-100 rounded-tl-xs flex flex-wrap items-center justify-between gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] sm:text-[14px] text-[#F0C040] font-bold">دا أرتبلك الجواب...</span>
                                <div className="flex gap-1.5 items-center mr-1">
                                  <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
                                  <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse delay-150" />
                                  <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse delay-300" />
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={handleCancelRequest}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-[11px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-1 min-h-[44px] min-w-[44px] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                              >
                                <X className="w-3 h-3" />
                                <span>إلغاء الطلب</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Scroll to Bottom Floating Action */}
                      {showScrollBottomBtn && (
                        <button
                          type="button"
                          onClick={() => scrollToBottom("smooth")}
                          className="sticky bottom-3 right-3 sm:right-6 ms-auto z-30 px-3.5 py-2 rounded-full bg-[#D4A017] hover:bg-amber-400 text-[#040B24] font-black text-xs shadow-xl flex items-center gap-1.5 active:scale-95 transition-all animate-in fade-in cursor-pointer border border-[#040B24]"
                        >
                          <span>النزول للأسفل</span>
                          <ChevronDown className="w-4 h-4 text-[#040B24]" />
                        </button>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div 
                      ref={composerRef}
                      className="vizion-advisor-composer p-2 sm:p-3.5 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] bg-[#060D24] border-t border-white/10 relative shrink-0 z-20"
                    >
                      <ChatInputForm 
                        onSend={(text) => handleSendMessage(text)} 
                        isLoading={isLoading} 
                        isSuggestionsOpen={isSuggestionsOpen}
                        onToggleSuggestions={() => setIsSuggestionsOpen((prev) => !prev)}
                        onCloseSuggestions={() => setIsSuggestionsOpen(false)}
                        suggestions={activeSuggestions}
                        onSendSuggestion={(prompt, suggestions, topicId) => {
                          setIsSuggestionsOpen(false);
                          handleSendMessage(prompt, suggestions, topicId);
                        }}
                        lastFailedPrompt={lastFailedPrompt}
                        onRetryLast={() => {
                          if (lastFailedPrompt) {
                            handleSendMessage(lastFailedPrompt.text, lastFailedPrompt.presetSuggestions);
                          }
                        }}
                        restoredText={restoredText}
                        onTextRestored={() => setRestoredText("")}
                        onInputFocus={() => {
                          const chat = chatScrollRef.current;
                          if (chat) {
                            const isNearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 150;
                            if (isNearBottom) {
                              setTimeout(() => {
                                scrollToBottom("smooth");
                              }, 120);
                            }
                          }
                        }}
                      />

                      <div className="mt-1.5 hidden sm:flex flex-wrap justify-between items-center px-1 text-[9px] sm:text-[10px] text-white/60 gap-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#D4A017]" /> مخصص ومبرمج للتجارة الإلكترونية بالسوق العراقي
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20 font-sans">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> محفوظ على هاتفك تلقائياً
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};