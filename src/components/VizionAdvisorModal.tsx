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
  Edit3,
  Brain,
  ImagePlus,
  Mic,
  Square,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT, SPRING_SNAPPY, overlayMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { getAllValidCodes, normalizeCode } from "./LockScreen";
import { BusinessDiagnosticStepper } from "./BusinessDiagnosticStepper";
import { AdvisorActionCard } from "./AdvisorActionCard";
import { AdvisorMessageFeedbackBar, MessageFeedbackData } from "./AdvisorMessageFeedbackBar";
import { AdvisorToast, ToastMessage } from "./AdvisorToast";
import { RichMessage, ThinkingDots } from "./advisor/RichMessage";
import { BusinessProfilePanel } from "./advisor/BusinessProfilePanel";
import { useBusinessProfile } from "./advisor/useBusinessProfile";
import { useDictation } from "./advisor/useDictation";
import { AdvisorHttpError, streamAdvisor } from "../lib/advisor/client";
import { prepareImage, type PreparedImage } from "../lib/advisor/images";
import { describeProfileUpdate, parseProfileTags, parseSuggestionTags, profileFilledCount, stripAdvisorTags } from "../lib/advisor/profile";
import {
  SavedRecommendation,
  PlanTaskItem,
  getSavedRecommendationsFromStorage,
  removeSavedRecommendationFromStorage,
  get7DayPlanStorageKey,
  trackAdvisorAction,
  addRecommendationTo7DayPlanStorage
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
  /** True while the answer is still streaming in. */
  streaming?: boolean;
  /** Small thumbnails of images the merchant attached (full images are never stored). */
  images?: string[];
  /** What the advisor learned and saved to the business profile. */
  profileUpdate?: string[];
  /** The merchant stopped the answer early. */
  stopped?: boolean;
  /** The stream broke after part of the answer arrived. */
  partialError?: string;
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
  text: "هلا بيك يا غالي. أني مستشار فيزيون التكتيكي لمساعدتك بقرارات البيع، التسويق، التسعير بالدينار، وإدارة التوصيل وتقليل الراجع بالسوق العراقي.\n\nتكدر تختار موضوع جاهز أو تطرح سؤالك الميداني مباشرة، ونحسبها وياك ورقة وقلم.",
  timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
  suggestions: [
    "ابدأ تشخيص مشروعي (4 خطوات)",
    "شلون أقلل نسبة الراجع بالمحافظات؟",
    "اكتبلي سكريبت رد على اعتراض 'السعر غالي'",
    "إعلاني يجيب رسائل بس ماكو مبيعات، شنو الحل؟",
    "شلون أسعر منتجي وأحسب الربح الصافي بالدينار؟"
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
  /** Stops the answer that is streaming in. */
  onStop?: () => void;
  attachments?: PreparedImage[];
  onAttach?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (index: number) => void;
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
  onInputFocus,
  onStop,
  attachments = [],
  onAttach,
  onRemoveAttachment
}: ChatInputFormProps) {
  const [inputText, setInputText] = React.useState("");
  const [interim, setInterim] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dictation = useDictation(
    (finalText) => setInputText((prev) => (prev ? `${prev} ${finalText}` : finalText)),
    setInterim
  );
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

  const isSendDisabled = (!inputText.trim() && attachments.length === 0) || isLoading;

  return (
    <div className="w-full flex flex-col gap-2">
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
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer active:scale-[0.97] transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy min-w-[44px] flex items-center justify-center"
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
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 font-semibold text-xs flex items-center justify-center gap-1 min-h-[44px] cursor-pointer active:scale-[0.97] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
          className="p-3 sm:p-3.5 rounded-2xl glass-subtle border text-white animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-vz-accent">
              <Lightbulb className="w-4 h-4 text-vz-accent" />
              <span>أسئلة مقترحة</span>
            </div>
            <button               type="button"
              onClick={onCloseSuggestions}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center gap-1 min-h-[44px] min-w-[44px] cursor-pointer transition active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                className="text-right p-2.5 sm:p-3 rounded-xl bg-black/30 hover:bg-white/[0.06] active:bg-white/10 border border-white/10 hover:border-white/22 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition flex items-center justify-between gap-2.5 min-h-[44px] cursor-pointer group disabled:opacity-50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <span className="leading-snug">{item.label}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-vz-accent/70 group-hover:text-vz-accent shrink-0 transition-transform group-hover:-translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached screenshots */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-1" aria-label="الصور المرفقة">
          {attachments.map((im, i) => (
            <div key={i} className="relative">
              <img src={im.thumb} alt="صورة مرفقة" className="h-14 w-14 rounded-xl object-cover border border-white/20" />
              <button
                type="button"
                onClick={() => onRemoveAttachment?.(i)}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/30 text-white flex items-center justify-center"
                aria-label="شيل الصورة"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <span className="text-[11px] text-white/55 font-bold">المستشار راح يقرا الصورة ويشخّصها</span>
        </div>
      )}
      {dictation.error && <div className="px-2 text-[11px] font-bold text-rose-300">{dictation.error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onAttach?.(e.target.files);
          e.target.value = "";
        }}
      />

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
          className={`px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer shrink-0 min-h-[42px] justify-center active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${ isSuggestionsOpen ? "bg-white/12 border-white/35 text-vz-accent" : "bg-white/5 hover:bg-white/10 border-white/15 text-white/90 hover:text-vz-accent" } focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
        >
          <Lightbulb className="w-4 h-4 text-vz-accent shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">اقتراحات</span>
        </button>

        {onAttach && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || attachments.length >= 3}
            title="أرفق صورة (لقطة من مدير الإعلانات، إعلان، محادثة…)"
            aria-label="أرفق صورة"
            className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] text-vz-accent flex items-center justify-center disabled:opacity-40 transition-colors"
          >
            <ImagePlus className="w-[18px] h-[18px]" />
          </button>
        )}

        {/* 2. Text Input Area: [اكتب سؤالك هنا...] */}
        <div className="flex-1 relative flex items-center min-w-0">
          <textarea 
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onInputFocus}
            onPaste={(e) => {
              const files = Array.from<File>(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
              if (files.length && onAttach) {
                e.preventDefault();
                onAttach(files);
              }
            }}
            placeholder={dictation.listening ? interim || "دا أسمعك… احچي" : attachments.length ? "اكتب شنو تريد أشوف بالصورة (اختياري)" : "اكتب سؤالك هنا..."}
            aria-label="اكتب سؤالك هنا..."
            disabled={isLoading}
            dir="rtl"
            className="w-full ps-4 pe-4 sm:ps-5 sm:pe-5 pl-11 sm:pl-12 py-2.5 sm:py-3 rounded-2xl bg-black/35 border border-white/10 focus:border-white/30 text-white text-xs sm:text-sm placeholder-white/50 outline-none transition-all motion-reduce:transition-none motion-reduce:transform-none dir-rtl text-right resize-none min-h-[42px] max-h-[120px] leading-relaxed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
          />
          {dictation.supported && !isLoading && (
            <button
              type="button"
              onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
              aria-label={dictation.listening ? "وقف التسجيل" : "احچي بدل الكتابة"}
              title={dictation.listening ? "وقف التسجيل" : "احچي بدل الكتابة"}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                dictation.listening ? "bg-rose-500 text-white animate-pulse" : "text-white/55 hover:text-white hover:bg-white/10"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3. Large Send Button: [إرسال] — becomes Stop while an answer streams */}
        {isLoading && onStop ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="وقف الجواب"
            title="وقف الجواب"
            className="btn btn-glass px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 min-h-[44px]"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline font-bold whitespace-nowrap">وقف</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSendDisabled}
            aria-label="إرسال"
            title="إرسال"
            className="btn btn-primary px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-white font-black text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 min-h-[44px]"
          >
            <span className="hidden sm:inline font-bold whitespace-nowrap">إرسال</span>
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-180 text-white shrink-0" />
          </button>
        )}
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
  const [activeTab, setActiveTab] = useState<"chat" | "profile" | "business_diagnostic" | "diagnostic" | "script_gen" | "saved_plan">("chat");
  // What the advisor knows about this merchant's shop (sent with every question).
  const { profile: businessProfile, save: saveBusinessProfile, merge: mergeBusinessProfile } = useBusinessProfile(userCode);
  // Screenshots attached in the composer, sent with the next question.
  const [attachments, setAttachments] = useState<PreparedImage[]>([]);
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
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant" && !m.isDivider && !m.isError)?.id;
  // A regenerate resends text only, so skip it when the last question carried a screenshot.
  const canRegenerate = !([...messages].reverse().find((m) => m.role === "user")?.images?.length);

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
  const stoppedByUserRef = useRef(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const getFeedbackStorageKey = (code?: string) => `vizion_advisor_feedback_${normalizeCode(code)}`;

  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, MessageFeedbackData>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(getFeedbackStorageKey(userCode));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Reload feedback whenever modal opens or userCode changes
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(getFeedbackStorageKey(userCode));
        if (raw) {
          setMessageFeedback(JSON.parse(raw));
        }
      } catch (e) {
        console.warn("Failed to load feedback from localStorage:", e);
      }
    }
  }, [isOpen, userCode]);

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
    reason?: string,
    customNote?: string
  ) => {
    setMessageFeedback((prev) => {
      const updated = {
        ...prev,
        [messageId]: {
          rating,
          reason: reason !== undefined ? reason : prev[messageId]?.reason,
          customNote: customNote !== undefined ? customNote : prev[messageId]?.customNote,
          timestamp: new Date().toISOString(),
        },
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(getFeedbackStorageKey(userCode), JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to write feedback to localStorage:", e);
        }
      }

      return updated;
    });

    trackEvent("advisor_feedback_submitted", {
      rating,
      reason: reason || (rating === "helpful" ? "إجابة مفيدة ومناسبة لواقع السوق العراقي" : undefined),
      customNote,
      messageId,
      topicId: currentTopicRef.current,
    });

    if (rating === "helpful" || reason || customNote) {
      showToast(
        "success",
        rating === "helpful"
          ? "شكراً لتقييمك! سعداء بأن الإجابة أفادتك بالسوق العراقي 👍"
          : "شكراً لملاحظتك! سنعمل على تطوير الإجابات لواقع التجارة بالعراق ✍️"
      );
    }
  };

  const handleClearFeedback = (messageId: string) => {
    setMessageFeedback((prev) => {
      const updated = { ...prev };
      delete updated[messageId];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(getFeedbackStorageKey(userCode), JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to delete feedback from localStorage:", e);
        }
      }
      return updated;
    });
    showToast("success", "تمت إعادة تعيين التقييم، تكدر تقيم من جديد 🔄");
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
    // Only track the visual viewport while the sheet is open: on phones it
    // fires on every scroll frame, and the closed modal must stay idle.
    if (!isOpen || typeof window === "undefined" || !window.visualViewport) return;

    let frame = 0;
    const handleViewportChange = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (window.visualViewport) {
          const next = Math.round(window.visualViewport.height);
          setViewportHeight((prev) => (prev === next ? prev : next));
        }
      });
    };

    handleViewportChange();
    window.visualViewport.addEventListener("resize", handleViewportChange, { passive: true });
    window.visualViewport.addEventListener("scroll", handleViewportChange, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, [isOpen]);

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
    stoppedByUserRef.current = true;
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
    // Screenshots attached in the composer ride along with this question.
    const pendingImages = attachments;
    const text = textToSend?.trim() || (pendingImages.length ? "حلل هذي الصورة وشخّصلي على ضوء مشروعي." : "");

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
    stoppedByUserRef.current = false;
    setIsLoading(true);
    setLastFailedPrompt(null);
    if (pendingImages.length) setAttachments([]);

    trackEvent("advisor_prompt_submitted", { topicId });

    const now = () => new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: now(),
      topicId,
      requestId: clientRequestId,
      images: pendingImages.length ? pendingImages.map((im) => im.thumb) : undefined,
    };
    // The answer streams into this placeholder.
    const botId = (Date.now() + 1).toString();
    const placeholder: Message = { id: botId, role: "assistant", text: "", timestamp: now(), topicId, requestId: clientRequestId, streaming: true };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setActiveTab("chat");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    // Streamed text is buffered and painted ~16 times a second, not per token.
    let streamed = "";
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const paint = () => {
      flushTimer = null;
      const snapshot = streamed;
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: snapshot } : m)));
    };
    const onDelta = (t: string) => {
      streamed += t;
      if (!flushTimer) flushTimer = setTimeout(paint, 60);
    };
    const finalize = (patch: Partial<Message>) => {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...patch, streaming: false } : m)));
    };

    try {
      // Recent history of this topic only, to avoid cross-contamination.
      const history: { role: "user" | "assistant"; text: string; topicId?: string; hadImages?: boolean; images?: { mimeType: string; data: string }[] }[] = messages
        .filter((m) => !m.isDivider && !m.isError && !m.streaming && m.topicId === topicId && m.text)
        .slice(-15)
        .map((m) => ({ role: m.role, text: stripAdvisorTags(m.text), topicId: m.topicId, hadImages: Boolean(m.images?.length) }));
      history.push({
        role: "user",
        text,
        topicId,
        images: pendingImages.length ? pendingImages.map(({ mimeType, data }) => ({ mimeType, data })) : undefined,
      });

      const outcome = await streamAdvisor(
        {
          messages: history,
          requestId: clientRequestId,
          topicContext: options.topicContext || topicId,
          isNewTopic: options.isNewTopic,
          diagnosticProfile: options.diagnosticProfile,
          profile: businessProfile,
          userContext: { isVip, platform: "Vizion Iraq E-Commerce Suite" },
        },
        { onDelta, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const raw = outcome.text;
      const learned = parseProfileTags(raw);
      const changed = mergeBusinessProfile(learned);
      const learnedSummary = changed.length ? describeProfileUpdate(Object.fromEntries(changed.map((k) => [k, learned[k]]))) : [];
      const suggestions = parseSuggestionTags(raw);
      finalize({
        text: stripAdvisorTags(raw),
        requestId: outcome.requestId || clientRequestId,
        suggestions: presetSuggestions || (suggestions.length > 0 ? suggestions : undefined),
        profileUpdate: learnedSummary.length ? learnedSummary : undefined,
        partialError: outcome.error,
      });
      if (learnedSummary.length) showToast("saved", "حدّثت ملف مشروعك 🧠", learnedSummary.join(" • "));
      setLastFailedPrompt(null);
      trackEvent("advisor_answer_completed", { topicId, requestId: outcome.requestId || clientRequestId });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const partial = stripAdvisorTags(streamed);

      if (stoppedByUserRef.current) {
        if (partial.trim()) finalize({ text: partial, stopped: true });
        else setMessages((prev) => prev.filter((m) => m.id !== botId));
        return;
      }
      if (partial.trim()) {
        finalize({ text: partial, partialError: "انقطع الرد بالنص. اضغط 'جواب جديد' حتى أعيده كامل." });
        return;
      }

      console.error("AI Advisor error:", err);
      let errorText = "صار خلل بسيط. جرّب مرة ثانية.";
      if (err?.name === "AbortError") {
        errorText = "الرد طوّل أكثر من العادة بسبب ضغط الخوادم. اضغط 'إعادة المحاولة'.";
      } else if (err instanceof AdvisorHttpError || (err?.message && typeof err.message === "string" && err.message.length > 3 && !err.message.includes("Failed to fetch"))) {
        errorText = err.message;
      } else if (err?.message?.includes("Failed to fetch")) {
        errorText = "تعذر الاتصال بالسيرفر. تأكد من الإنترنت وجرّب مرة ثانية.";
      }

      const errorMessage: Message = {
        id: botId,
        role: "assistant",
        text: errorText,
        timestamp: now(),
        topicId,
        isError: true,
        failedPrompt: { text, presetSuggestions },
        suggestions: ["🎯 تشخيص ضعف إعلاناتي", "📦 خطة تقليل الراجع بالمحافظات", "💬 سكريبت مبيعات الواتساب"],
      };
      setMessages((prev) => prev.map((m) => (m.id === botId ? errorMessage : m)));
      setLastFailedPrompt({ text, presetSuggestions, errorText });
    } finally {
      if (flushTimer) clearTimeout(flushTimer);
      isLoadingRef.current = false;
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessageRef = useRef(handleSendMessage);
  handleSendMessageRef.current = handleSendMessage;

  /** Re-asks the last question for a fresh answer. */
  const handleRegenerate = () => {
    if (isLoadingRef.current) return;
    const lastUserIdx = messages.map((m) => m.role === "user" && !m.isDivider).lastIndexOf(true);
    if (lastUserIdx < 0) return;
    const lastUser = messages[lastUserIdx];
    setMessages((prev) => prev.slice(0, lastUserIdx));
    // Wait a tick so the trimmed history is what gets sent.
    setTimeout(() => handleSendMessageRef.current?.(lastUser.text, undefined, lastUser.topicId), 0);
  };

  /** Adds an action item from an answer to the 7-day plan. */
  const handleAddTaskToPlan = (task: string, topicId?: string) => {
    const result = addRecommendationTo7DayPlanStorage({ title: task.slice(0, 90), details: task, topicId }, userCode);
    if (result.success) {
      showToast("plan", "انضافت لخطتك ✅", "تلگاها بتبويب 'خطتي'");
      refreshSavedData();
      return true;
    }
    return false;
  };

  const handleAttachFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 3 - attachments.length);
    for (const file of list) {
      try {
        const prepared = await prepareImage(file);
        setAttachments((prev) => (prev.length >= 3 ? prev : [...prev, prepared]));
      } catch (e: any) {
        showToast("success", e?.message || "ما گدرت أضيف الصورة");
      }
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

  const currentDiag = DIAGNOSTIC_CATEGORIES.find((c) => c.id === selectedDiagCat) || DIAGNOSTIC_CATEGORIES[0];

  // Opens out of the button/card that summoned it (full-screen on phones).
  const originSheet = useOriginSheet(isOpen, { width: 896, height: 760 });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="advisor-overlay" {...overlayMotion} className="fixed inset-0 z-[100] flex h-[100dvh] items-center justify-center overflow-hidden overscroll-none p-0 sm:p-4 vz-backdrop">
          <motion.div
            ref={modalRef}
            {...originSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisor-modal-title"
            style={
              viewportHeight && typeof window !== "undefined" && window.innerWidth < 640
                ? { height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }
                : undefined
            }
            className={`vizion-advisor-modal ${isCompactLayout ? "vizion-advisor-compact" : ""} relative w-full max-w-4xl h-[100dvh] sm:h-[88vh] min-h-0 glass-elevated glass-edge border-0 sm:border rounded-none sm:rounded-4xl flex flex-col overflow-hidden overscroll-none text-white dir-rtl motion-reduce:transition-none motion-reduce:transform-none`}
          >
            {/* Mobile Pull Indicator */}
            <div className="w-10 h-[5px] bg-white/20 rounded-full mx-auto mt-1.5 mb-1 sm:hidden shrink-0" />

            {/* In-Modal Toast Alerts */}
            <AdvisorToast toast={toast} onDismiss={() => setToast(null)} />

            {/* Calm Header */}
            <div className="px-3 sm:px-6 py-2 sm:py-3 vz-sheet-header flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-vz-blue-light to-vz-blue-deep flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  {isVip && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-[#0c1a4a] rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 id="advisor-modal-title" className="text-xs sm:text-base font-bold text-white tracking-wide truncate">
                      المستشار الذكي <span className="text-vz-accent text-[11px] font-normal hidden sm:inline">| فيزيون AI</span>
                    </h3>
                    {isVip ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-vz-accent border border-white/14 shrink-0">
                        VIP
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-vz-accent border border-white/14 shrink-0">
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
                      className="btn btn-glass px-3 sm:px-3.5 rounded-full text-xs sm:text-sm font-bold gap-1.5 shrink-0 !min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-vz-accent" />
                      <span className="hidden sm:inline">موضوع جديد</span>
                    </button>

                    <button 
                      onClick={handleClearHistory}
                      title="مسح سجل المحادثة"
                      aria-label="مسح السجل"
                      className="vz-close !w-10 !h-10 hover:!text-rose-300 hover:!bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button autoFocus 
                  onClick={onClose}
                  aria-label="إغلاق"
                  title="إغلاق"
                  className="vz-close sm:!w-auto sm:px-3.5 gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-bold">إغلاق</span>
                </button>
              </div>
            </div>

            {/* IF NOT VIP: Render High-Converting AI Advisor Subscription Screen */}
            {!isVip ? (
              <div 
                role="region"
                aria-label="اشتراك المستشار الذكي"
                className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-right"
              >
                {/* Top Header Card */}
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-white/10 via-white/10 to-white/10 border border-white/22 text-xs sm:text-sm font-black text-vz-accent shadow-md">
                    <Sparkles className="w-4 h-4 text-vz-accent animate-pulse" />
                    <span>مستشارك الشخصي للتجارة الإلكترونية بالسوق العراقي</span>
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    اشترك الآن في <span className="text-transparent bg-clip-text bg-gradient-to-r from-vz-blue-light via-white to-vz-blue">المستشار الذكي</span> بـ 14,000 دينار فقط!
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                    احصل على خبير إعلانات ومبيعات يعمل في هاتفك 24 ساعة بدون توقف لتشخيص حملاتك وتوليد سكريبتات إغلاق الصفقات عبر الواتساب.
                  </p>
                </div>

                {/* Price Breakdown & Value Pitch Box */}
                <div className="max-w-xl mx-auto glass border-2 rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-vz-blue-light to-vz-blue text-white font-black text-[11px] sm:text-xs px-4 py-1.5 rounded-br-2xl shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>عرض الاشتراك الشهري الفوري</span>
                  </div>

                  {/* Main Pricing Highlight */}
                  <div className="flex items-center justify-between border-b border-white/14 pb-4 pt-3">
                    <div>
                      <span className="text-xs font-bold text-vz-accent block mb-1">الاشتراك الشهري المباشر</span>
                      <h4 className="text-lg sm:text-2xl font-black text-white">المستشار الذكي (Vizion AI)</h4>
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        فقط 466 د.ع باليوم! (أقل من سعر استكان شاي ☕)
                      </span>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-2xl sm:text-4xl font-black text-vz-accent font-mono tracking-tight">14,000</div>
                      <div className="text-xs font-bold text-vz-accent">د.ع / شهرياً</div>
                    </div>
                  </div>

                  {/* Why it's worth every dinar (Value Comparison) */}
                  <div className="bg-black/30 border border-white/14 rounded-2xl p-3.5 text-xs text-white/90 space-y-2">
                    <div className="flex items-center gap-2 text-vz-accent font-bold text-xs sm:text-sm">
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
                        <span>تكتشف <strong className="text-vz-accent">وين تضيع ميزانيتك</strong> — وتفهم شلون الإعلان والمنتج والزبون مرتبطين ببعض.</span>
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
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:scale-[1.01] active:scale-[0.97] transition cursor-pointer min-h-[50px]"
                    >
                      <Sparkles className="w-5 h-5 text-vz-accent animate-pulse" />
                      <span>اشترك الآن عبر الواتساب (14,000 د.ع / شهرياً) 💬</span>
                    </a>
                    <p className="text-[11px] text-center text-white/60">
                      تواصل مباشر مع الدعم عبر الواتساب: <strong className="text-emerald-400 font-mono">07757851379</strong>
                    </p>
                  </div>
                </div>

                {/* Existing Subscriber Code Entry */}
                <div className="max-w-xl mx-auto glass-subtle p-4 sm:p-5 rounded-2xl border space-y-3 text-right">
                  <div className="space-y-1">
                    <label htmlFor="vip-code-input" className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-vz-accent" />
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
                      className="flex-1 px-3.5 py-2.5 bg-black/35 border border-white/15 rounded-xl text-white text-sm placeholder-white/30 font-mono focus:border-white/35 outline-none text-center sm:text-right min-h-[44px]"
                      aria-label="رمز تفعيل VIP"
                    />

                    <button 
                      type="submit"
                      className="btn btn-primary px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center gap-1.5"
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
                <div className="px-2 sm:px-6 py-2 border-b border-white/[0.06] shrink-0 w-full overflow-hidden">
                  <div className="vizion-advisor-tab-strip flex flex-row flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto w-full no-scrollbar py-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "chat" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "chat" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <MessageSquare className="relative w-4 h-4 shrink-0" />
                      <span className="relative">المحادثة الحرة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "profile" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "profile" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <Brain className="relative w-4 h-4 shrink-0" />
                      <span className="relative">ملف مشروعي</span>
                      <span className="relative min-w-[18px] h-[18px] px-1 rounded-full bg-white/15 text-[10px] font-black flex items-center justify-center tabular-nums">
                        {profileFilledCount(businessProfile)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("business_diagnostic")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "business_diagnostic" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "business_diagnostic" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <Sparkles className="relative w-4 h-4 shrink-0" />
                      <span className="relative">تشخيص مشروعي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("diagnostic")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "diagnostic" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "diagnostic" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <Compass className="relative w-4 h-4 shrink-0" />
                      <span className="relative">مشخّص المشاكل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("script_gen")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "script_gen" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "script_gen" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <FileText className="relative w-4 h-4 shrink-0" />
                      <span className="relative">مولّد السكريبتات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("saved_plan")}
                      className={`relative px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.96] ${
                        activeTab === "saved_plan" ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    >
                      {activeTab === "saved_plan" && <motion.span layoutId="advisor-tab-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-gradient-to-b from-vz-blue-light to-vz-blue-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-8px_rgba(47,107,255,0.6)]" />}
                      <Bookmark className="relative w-4 h-4 shrink-0" />
                      <span className="relative">التوصيات والخطة</span>
                      {(savedRecommendations.length > 0 || planTasks.length > 0) && (
                        <span className="relative px-1.5 rounded-full text-[10px] font-black bg-[#040e33]/10 border border-current/20 ms-1">
                          {savedRecommendations.length + planTasks.filter((t) => !t.completed).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* TAB: GUIDED BUSINESS DIAGNOSTIC STEPPER */}
                {activeTab === "profile" && (
                  <BusinessProfilePanel
                    profile={businessProfile}
                    onSave={(p) => {
                      saveBusinessProfile(p);
                      showToast("saved", "انحفظ ملف مشروعك 🧠", "المستشار راح يستعمله بكل جواب");
                    }}
                    onAskAdvisor={(prompt) => {
                      setActiveTab("chat");
                      handleSendMessage(prompt);
                    }}
                  />
                )}

                {activeTab === "business_diagnostic" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 ">
                    <BusinessDiagnosticStepper
                      storageKey={getProfileStorageKey(userCode)}
                      onCancel={() => setActiveTab("chat")}
                      onComplete={handleCompleteDiagnostic}
                    />
                  </div>
                )}

                {/* TAB 1: DIAGNOSTIC WIZARD (Choose your problem & get instant AI diagnosis) */}
                {activeTab === "diagnostic" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-5">
                    <div className="glass-subtle border rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2 text-vz-accent">
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
                          className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col gap-1 ${ selectedDiagCat === cat.id ? "glass border-white/35 shadow-lg md:shadow-black/40 shadow-xl/15 ring-1 ring-white/60" : "glass-subtle border-white/10 hover:border-white/25 text-white/80" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-bold text-white line-clamp-1">{cat.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Specific Options for Selected Category */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-vz-accent flex items-center gap-1">
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
                            className="w-full text-right p-3.5 sm:p-4 rounded-xl glass-subtle hover:bg-white/[0.06] border hover:border-white/27 transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-between group cursor-pointer disabled:opacity-50 min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                          >
                            <div className="space-y-1 pr-1">
                              <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-vz-accent transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-vz-blue" />
                                <span>{opt.label}</span>
                              </h5>
                              <p className="text-[11px] sm:text-xs text-white/60">
                                {opt.subtext}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pr-3">
                              <span className="text-[11px] font-bold text-slate-200 group-hover:underline hidden sm:inline">
                                تحليل فوري
                              </span>
                              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent group-hover:scale-[1.04] transition-transform">
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
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-5">
                    <div className="glass-subtle border rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2 text-vz-accent">
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
                      <label className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 border border-white/18 flex items-center justify-center text-[10px] text-vz-accent">1</span>
                        <span>ما هو اعتراض الزبون الذي تريد تجاوزه؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SCRIPT_OBJECTIONS.map((obj) => (
                          <button 
                            key={obj.id}
                            onClick={() => setSelectedObjection(obj.id)}
                            className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-2.5 ${ selectedObjection === obj.id ? "glass-subtle border-white/35 shadow-lg md:shadow-black/40 shadow-xl/20 text-white font-bold" : "glass-subtle border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                          >
                            <span className="text-lg">{obj.icon}</span>
                            <span className="text-xs">{obj.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Choose Niche */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 border border-white/18 flex items-center justify-center text-[10px] text-vz-accent">2</span>
                        <span>ما هو مجال أو تخصص متجرك؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SCRIPT_NICHES.map((niche) => (
                          <button 
                            key={niche.id}
                            onClick={() => setSelectedNiche(niche.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col items-center gap-1 ${ selectedNiche === niche.id ? "glass-subtle border-white/35 shadow-lg md:shadow-black/40 shadow-xl/20 text-white font-bold" : "glass-subtle border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
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
                        className="w-full px-4 py-2.5 rounded-xl bg-black/35 border border-white/15 focus:border-white/35 text-white text-xs placeholder-white/30 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                      />
                    </div>

                    {/* Generate Button */}
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isLoading}
                      className="btn btn-primary w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>توليد السكريبت العراقي الآن ⚡</span>
                    </button>
                  </div>
                )}

                {/* TAB: SAVED RECOMMENDATIONS & 7-DAY ACTION PLAN */}
                {activeTab === "saved_plan" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-6">
                    {/* Top Stat Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl glass-subtle border flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-white/60">التوصيات والسكريبتات المحفوظة</span>
                          <h4 className="text-xl font-black text-vz-accent">{savedRecommendations.length} توصية</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/18 flex items-center justify-center text-vz-accent">
                          <Bookmark className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl glass-subtle border flex items-center justify-between">
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
                          <Calendar className="w-5 h-5 text-vz-accent" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            📅 خطة الـ 7 أيام التنفيذية
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {planTasks.length} مهام مضافة
                        </span>
                      </div>

                      {planTasks.length === 0 ? (
                        <div className="p-6 rounded-2xl glass-subtle border text-center space-y-2">
                          <Calendar className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">لم تضف أي توصيات لخطة الـ 7 أيام بعد</p>
                          <p className="text-[11px] text-white/60">
                            عند استشارة مستشار فيزيون، اضغط على زر <strong className="text-vz-accent">"إضافة للخطة 7 أيام"</strong> في بطاقة الإجراءات لتنظيم خطواتك هنا.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {planTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3.5 sm:p-4 rounded-xl border transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-start justify-between gap-3 ${
                                task.completed
                                  ? "glass-subtle border-emerald-500/30 opacity-70"
                                  : "glass-subtle border-white/10 hover:border-white/18"
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <button 
                                  onClick={() => handleToggleTaskCompleted(task.id)}
                                  className={`mt-0.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${ task.completed ? "bg-emerald-500 border-emerald-400 text-white" : "border-white/30 hover:border-white/35 bg-black/20" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                                >
                                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/18 text-vz-accent text-[10px] font-black">
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
                                        className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-vz-blue text-vz-accent hover:text-white border border-white/14 text-[10px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                      >
                                        <Wrench className="w-3 h-3" />
                                        <span>فتح الأداة المرتبطة</span>
                                      </button>
                                    )}
                                    {task.chapterId && (
                                      <button 
                                        onClick={() => onNavigateToSection?.(task.chapterId)}
                                        className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-vz-blue text-slate-200 hover:text-white border border-white/14 text-[10px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                                className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                          <Bookmark className="w-5 h-5 text-vz-accent" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            📌 التوصيات والسكريبتات المحفوظة
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {savedRecommendations.length} عناصر
                        </span>
                      </div>

                      {savedRecommendations.length === 0 ? (
                        <div className="p-6 rounded-2xl glass-subtle border text-center space-y-2">
                          <Bookmark className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">ماكو توصيات محفوظة حتى الآن</p>
                          <p className="text-[11px] text-white/60">
                            اضغط على زر <strong className="text-vz-accent">"حفظ التوصية"</strong> في أي رد أو سكريبت لتجده محفوظاً هنا للرجوع إليه دائماً.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {savedRecommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-4 rounded-xl glass-subtle border hover:border-white/14 transition-all motion-reduce:transition-none motion-reduce:transform-none space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-vz-accent" />
                                    <span>{rec.title}</span>
                                  </h4>
                                  {rec.relevanceReason && (
                                    <p className="text-[11px] text-vz-accent/90 font-medium">
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
                                  className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Script Preview if available */}
                              {rec.scriptText && (
                                <div className="p-3 rounded-lg bg-black/30 border border-white/14 text-white/90 text-xs space-y-2">
                                  <div className="flex items-center justify-between text-[10px] text-vz-accent font-bold">
                                    <span>💬 نص السكريبت الجاهز للزبون:</span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(rec.scriptText || "");
                                        showToast("copy", "تم نسخ السكريبت بنجاح 📋", "تكدر لصقه مباشرة في محادثة الواتساب");
                                      }}
                                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-vz-blue text-vz-accent hover:text-white transition-colors flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                                    className="btn btn-primary px-3 py-1.5 rounded-lg text-white text-xs font-black flex items-center gap-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>فتح الأداة المرتبطة</span>
                                  </button>
                                )}
                                {rec.chapterId && (
                                  <button 
                                    onClick={() => onNavigateToSection?.(rec.chapterId)}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-slate-200 text-slate-200 hover:text-white border border-white/18 text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center gap-1.5 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                      className="vizion-advisor-chat min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 relative"
                    >
                      {!hasUserMessages ? (
                        /* Focused Empty-State Layout */
                        <div className="min-h-full flex flex-col justify-center py-4 my-auto w-full max-w-xl mx-auto">
                          {/* 1. Short Welcome Heading & Icon */}
                          <div className="text-center mb-4 sm:mb-5">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/14 text-vz-accent mb-2.5 shadow-sm">
                              <Bot className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1.5">
                              شنو المشكلة اللي تريد نحلها؟
                            </h3>
                            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                              اكتب مشكلتك بالتجارة، وأنا أرتبلك التشخيص والخطوة الجاية.
                            </p>
                          </div>

                          {/* What makes this advisor different: it knows your shop and reads screenshots */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() => setActiveTab("profile")}
                              className="text-right p-3 rounded-2xl border border-vz-blue/30 bg-vz-blue/10 hover:bg-vz-blue/15 transition-colors flex items-start gap-2.5"
                            >
                              <Brain className="w-5 h-5 text-vz-accent shrink-0 mt-0.5" />
                              <span>
                                <span className="block text-xs sm:text-sm font-black text-white">
                                  {profileFilledCount(businessProfile) >= 3 ? "أعرف مشروعك ✓" : "عرّفني على مشروعك"}
                                </span>
                                <span className="block text-[11px] sm:text-xs text-white/60 leading-relaxed">
                                  {profileFilledCount(businessProfile) >= 3 ? "كل جواب راح يكون على منتجك وأرقامك" : "منتجك وأسعارك وكلفة رسالتك، حتى أحسبلك ربحك بالضبط"}
                                </span>
                              </span>
                            </button>
                            <div className="text-right p-3 rounded-2xl border border-white/10 bg-white/[0.03] flex items-start gap-2.5">
                              <ImagePlus className="w-5 h-5 text-vz-accent shrink-0 mt-0.5" />
                              <span>
                                <span className="block text-xs sm:text-sm font-black text-white">صوّرلي إعلانك</span>
                                <span className="block text-[11px] sm:text-xs text-white/60 leading-relaxed">ارفع لقطة من مدير الإعلانات أو محادثة زبون، أو احچيلي بالمايك</span>
                              </span>
                            </div>
                          </div>

                          {/* Example Questions / Suggestions in Empty State */}
                          <div className="w-full space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-vz-accent pr-1">
                              <Lightbulb className="w-4 h-4 text-vz-accent shrink-0" />
                              <span>أسئلة مقترحة</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                              {EXAMPLE_QUESTIONS.slice(0, 4).map((ex) => (
                                <button 
                                  key={ex.id}
                                  type="button"
                                  onClick={() => handleSendMessage(ex.label, ex.suggestions, ex.topicId)}
                                  disabled={isLoading}
                                  className="w-full min-h-[50px] p-3 rounded-xl glass-subtle hover:bg-white/[0.06] active:bg-white/8 border hover:border-white/18 text-right text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-between gap-3 group cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                >
                                  <span className="text-right leading-snug flex-1">{ex.label}</span>
                                  <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-vz-accent shrink-0 transition-transform group-hover:-translate-x-1" />
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
                                  className="my-3 p-3 rounded-xl glass-subtle border text-white flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-vz-accent">
                                    <Sparkles className="w-4 h-4 text-vz-accent shrink-0" />
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
                                transition={{ duration: 0.4, ease: EASE_OUT }}
                                className={`flex gap-2 sm:gap-2.5 ${
                                  isUser ? "max-w-[85%] sm:max-w-[75%] ms-auto flex-row-reverse" : "max-w-[92%] sm:max-w-[85%] me-auto"
                                }`}
                              >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {isUser ? (
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-vz-blue text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 mt-1 select-none">
                                      أنت
                                    </div>
                                  ) : (
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${msg.isError ? "bg-rose-950/80 border border-rose-500/40 text-rose-300" : "glass-subtle border border-white/15 text-vz-accent"} flex items-center justify-center shrink-0 mt-1 select-none`}>
                                      <Bot className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>

                                {/* Message Box */}
                                <div className="group relative flex-1 min-w-0">
                                  <div
                                    className={`p-3.5 sm:p-4 rounded-2xl text-[15px] sm:text-[16px] leading-[1.8] break-words [overflow-wrap:anywhere] ${
                                      isUser
                                        ? "bg-gradient-to-b from-vz-blue-light to-vz-blue-deep text-white font-medium rounded-tr-md shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_-14px_rgba(47,107,255,0.6)]"
                                        : msg.isError
                                        ? "bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-xs"
                                        : "glass-subtle text-vz-accent rounded-tl-md"
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
                                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition min-h-[44px] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                                              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                              title="استرجاع السؤال للتعديل عليه"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                              <span>تعديل السؤال</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : msg.role === "assistant" ? (
                                      <>
                                        <RichMessage
                                          text={msg.text}
                                          streaming={msg.streaming}
                                          onChapter={(chId) => onNavigateToSection?.(chId)}
                                          onTool={(tId, cat) => onNavigateTool?.(tId, cat)}
                                          onAddTask={(task) => handleAddTaskToPlan(task, msg.topicId)}
                                          onCopy={() => showToast("copy", "انتسخت الرسالة 📋", "الصقها للزبون بالواتساب")}
                                          onSaveProfile={(p) => {
                                            mergeBusinessProfile(p);
                                            showToast("saved", "انحفظت الأرقام بملف مشروعك 🧠");
                                          }}
                                        />
                                        {msg.profileUpdate && msg.profileUpdate.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveTab("profile")}
                                            className="mt-3 w-full text-right rounded-2xl border border-vz-blue/30 bg-vz-blue/10 hover:bg-vz-blue/15 px-3 py-2 text-xs text-vz-accent flex items-start gap-2 transition-colors"
                                          >
                                            <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">
                                              <span className="font-black text-white">حفظت بملف مشروعك: </span>
                                              {msg.profileUpdate.join(" • ")}
                                            </span>
                                          </button>
                                        )}
                                        {(msg.stopped || msg.partialError) && (
                                          <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">
                                            {msg.partialError || "وقفت الجواب بنص الطريق."}
                                          </div>
                                        )}
                                        {!msg.streaming && !isLoading && msg.id === lastAssistantId && canRegenerate && (
                                          <button
                                            type="button"
                                            onClick={handleRegenerate}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[12px] font-bold text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            جواب جديد
                                          </button>
                                        )}
                                        {!msg.streaming && hasUserMessages && (
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
                                    ) : (
                                      <>
                                        {msg.images && msg.images.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 mb-2">
                                            {msg.images.map((src, i) => (
                                              <img key={i} src={src} alt="صورة مرفقة" className="h-20 w-20 object-cover rounded-xl border border-white/30" />
                                            ))}
                                          </div>
                                        )}
                                        <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</div>
                                      </>
                                    )}

                                    {/* Message Footer Actions & Iraqi Market Feedback Bar */}
                                    {!msg.isError && !msg.streaming && (
                                      isUser ? (
                                        <div className="mt-2 pt-1.5 border-t border-black/15 text-[10px] flex items-center justify-between">
                                          <span className="font-mono text-[9px] sm:text-[10px] text-[#040e33]/60 font-semibold">{msg.timestamp}</span>
                                        </div>
                                      ) : (
                                        <AdvisorMessageFeedbackBar
                                          messageId={msg.id}
                                          feedback={messageFeedback[msg.id]}
                                          onRate={(rating, reason, customNote) => handleFeedback(msg.id, rating, reason, customNote)}
                                          onClearFeedback={() => handleClearFeedback(msg.id)}
                                          onCopy={() => {
                                            handleCopy(msg.id, msg.text);
                                            showToast("copy", "تم نسخ الرد بالكامل بنجاح 📋");
                                          }}
                                          isCopied={copiedId === msg.id}
                                          timestamp={msg.timestamp}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Calm Inline Typing Loader with User Question Visible Above */}
                      {isLoading && !messages.some((m) => m.streaming) && (
                        <motion.div
                          role="status"
                          aria-live="polite"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-2 max-w-[92%] sm:max-w-[85%] ml-auto mt-4"
                        >
                          <div className="flex gap-2 sm:gap-2.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full glass-subtle border flex items-center justify-center text-vz-accent shrink-0 mt-1">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="p-3 sm:p-3.5 rounded-2xl glass-subtle border text-vz-accent rounded-tl-xs flex flex-wrap items-center justify-between gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] sm:text-[14px] text-vz-accent font-bold">دا أرتبلك الجواب...</span>
                                <div className="flex gap-1.5 items-center mr-1">
                                  <span className="w-2 h-2 rounded-full bg-vz-blue animate-pulse" />
                                  <span className="w-2 h-2 rounded-full bg-vz-blue animate-pulse delay-150" />
                                  <span className="w-2 h-2 rounded-full bg-vz-blue animate-pulse delay-300" />
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={handleCancelRequest}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-[11px] font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-1 min-h-[44px] min-w-[44px] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
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
                          className="btn btn-primary sticky bottom-3 right-3 sm:right-6 ms-auto z-30 px-3.5 py-2 rounded-full text-white font-black text-xs flex items-center gap-1.5 animate-in fade-in border-[#040e33]"
                        >
                          <span>النزول للأسفل</span>
                          <ChevronDown className="w-4 h-4 text-white" />
                        </button>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div 
                      ref={composerRef}
                      className="vizion-advisor-composer p-2 sm:p-3.5 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] bg-black/25 border-t border-white/[0.07] backdrop-blur-xl relative shrink-0 z-20"
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
                        onStop={handleCancelRequest}
                        attachments={attachments}
                        onAttach={handleAttachFiles}
                        onRemoveAttachment={(i) => setAttachments((prev) => prev.filter((_, j) => j !== i))}
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
                          <ShieldCheck className="w-3 h-3 text-slate-200" /> مخصص ومبرمج للتجارة الإلكترونية بالسوق العراقي
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300/80 bg-emerald-400/[0.06] px-2 py-0.5 rounded-full border border-emerald-400/15 font-sans">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> محفوظ على هاتفك تلقائياً
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};