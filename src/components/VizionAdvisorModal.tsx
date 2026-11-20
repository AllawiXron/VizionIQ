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
  KeyRound,
  HelpCircle,
  Sliders,
  FileText,
  Compass,
  ChevronRight,
  Package,
  DollarSign,
  PhoneCall,
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
import { normalizeCode } from "./LockScreen";
import { readLessonNotes } from "../lib/lessonNotes";
import { OfferPrice, SubscribeButton } from "./OfferPrice";
import { BusinessDiagnosticStepper } from "./BusinessDiagnosticStepper";
import { AdvisorActionCard } from "./AdvisorActionCard";
import { AdvisorMessageFeedbackBar, MessageFeedbackData } from "./AdvisorMessageFeedbackBar";
import { AdvisorToast, ToastMessage } from "./AdvisorToast";
import { RichMessage, ThinkingDots } from "./advisor/RichMessage";
import { StreamingAnswer } from "./advisor/StreamingAnswer";
import { clearStreamText, revealUpTo, setStreamText } from "../lib/advisor/streamStore";
import { BusinessProfilePanel } from "./advisor/BusinessProfilePanel";
import { useBusinessProfile } from "./advisor/useBusinessProfile";
import { useDictation } from "./advisor/useDictation";
import { AdvisorHttpError, streamAdvisor, type StreamOutcome } from "../lib/advisor/client";
import { prepareImage, type PreparedImage } from "../lib/advisor/images";
import { describeProfileUpdate, parseProfileTags, parseSuggestionTags, profileFilledCount, stripAdvisorTags, type BusinessProfile } from "../lib/advisor/profile";
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
  streaming?: boolean;
  images?: string[];
  profileUpdate?: string[];
  stopped?: boolean;
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
    title: "ضعف الإعلانات وضياع الميزانية",
    icon: "",
    description: "حل مشاكل إعلانات فيسبوك وتيك توك وإنستغرام بالسوق العراقي",
    options: [
      {
        topicId: "topic_ads_low_conversion",
        label: "تجيني رسائل هواية على الإعلان بس محد يشتري",
        subtext: "الزبائن اللي تجيني مو جديين ورسائلهم ما تتحول لطلبات",
        prompt: "إعلاناتي تجيب رسائل واستفسارات هواية وبكلفة مقبولة، بس تقريبا محد يطلب فعليا. شنو التشخيص حسب طريقة فيزيون، وشلون أحل المشكلة بأسرع وقت؟",
        defaultSuggestions: [
          "شلون أعدل محتوى الإعلان وأختار الزبائن الجديين؟",
          "انطيني سكريبت يحول اللي يستفسر إلى زبون يطلب عن طريق واتساب",
          "أرفع السعر لو أغير الاستهداف؟"
        ]
      },
      {
        topicId: "topic_ads_high_cpa",
        label: "كلفة الرسالة كلش عالية (CPA/CPR)",
        subtext: "الميزانية تنصرف بدون ما تجيني استفسارات كافية",
        prompt: "كلفة الرسالة بإعلانات فيسبوك وإنستغرام كلش عالية ودا تاكل من الربح. شلون أنزل كلفة الرسالة بالسوق العراقي وأحسن الـ CTR؟",
        defaultSuggestions: [
          "شلون أسوي أول لقطة بالإعلان (Hook) حتى أوقف المشاهد؟",
          "شنو أفضل استهداف لكل محافظة؟",
          "شلون أعرف إذا المشكلة من المنتج نفسه؟"
        ]
      },
      {
        topicId: "topic_ad_fatigue",
        label: "الحملة تشتغل يومين وبعدين نتائجها تضعف فجأة (Ad Fatigue)",
        subtext: "النتائج تتذبذب والطلبات توقف بعد بداية قوية",
        prompt: "الحملة تبدي قوية بأول 48 ساعة، وبعدها النتائج تضعف والكلفة ترتفع فجأة. شلون أتعامل ويا احتراق الإعلان وأوصل لجمهور عراقي أكبر؟",
        defaultSuggestions: [
          "شلون أطلع أفكار وزوايا إعلانية (Angles) جديدة لنفس المنتج؟",
          "شوكت أزيد الميزانية (Scaling)؟",
          "شلون أقارن أداء محتوى تيك توك بإنستغرام؟"
        ]
      }
    ]
  },
  {
    id: "whatsapp_sales",
    title: "اعتراضات الزبائن وإتمام البيع",
    icon: "",
    description: "سكريبتات الردود وإقناع الزبون العراقي المتردد",
    options: [
      {
        topicId: "topic_sales_price_objection",
        label: "الزبون يكول: 'السعر غالي ومبالغ بيه'",
        subtext: "الزبون يقارن السعر بصفحات ثانية أو ما يشوف إن المنتج يستاهل هالسعر",
        prompt: "الزبون بالواتساب يكول: 'السعر غالي ومبالغ بيه، شفته بغير مكان أرخص'. انطيني أفضل سكريبت أقنعه بقيمة المنتج بدون ما أنزل السعر.",
        defaultSuggestions: [
          "شلون أضيف هدية أو عرض بدون ما تزيد الكلفة علي؟",
          "شسوي إذا الزبون أصر على الخصم؟",
          "سكريبت توضيح الضمان وخدمة ما بعد البيع"
        ]
      },
      {
        topicId: "topic_sales_hesitation",
        label: "الزبون يكول: 'بعدين أردلك خبر / أستشير'",
        subtext: "الزبون يأجل الطلب ويختفي من يعرف السعر والمواصفات",
        prompt: "الزبائن يقرون التفاصيل ويكتبون 'بعدين أردلك خبر' أو 'أشاور أهلي' وبعدها يختفون. شلون أتعامل ويا التأجيل وأخلي الزبون يكمل الطلب بنفس اللحظة؟",
        defaultSuggestions: [
          "سكريبت متابعة الزبون بعد 24 ساعة (Follow-up)",
          "شلون أخلي الزبون يبادر بالطلب بسرعة، بصدق وبدون مبالغة؟",
          "طريقة السؤال الختامي بخيارين (Alternative Choice Close)"
        ]
      },
      {
        topicId: "topic_sales_discount",
        label: "الزبون يصر على الخصم أو التوصيل المجاني",
        subtext: "المساومة على أجور التوصيل وتأثيرها على الربح",
        prompt: "الزبائن بالعراق غالبا يطلبون 'توصيل مجاني' أو 'نزللي السعر'. شلون أحافظ على ربحي وبنفس الوقت أرضي الزبون اللي يريد خصم؟",
        defaultSuggestions: [
          "شلون أكتب عروض البكجات (مثل 1+1 مجانا)؟",
          "سكريبت الرد على طلب التوصيل المجاني",
          "شلون أضيف كلفة التوصيل للسعر بطريقة ذكية؟"
        ]
      }
    ]
  },
  {
    id: "delivery_returns",
    title: "تقليل الطلبات الراجعة ومشاكل التوصيل",
    icon: "",
    description: "نزل نسبة الطلبات الراجعة لأقل من 10% وأكد الطلبات قبل الشحن",
    options: [
      {
        topicId: "topic_delivery_returns",
        label: "الزبون يرفض يستلم الطلب أو يلغي من يتصل بيه المندوب",
        subtext: "خسارة أجور التوصيل والوقت وضياع المنتجات بسبب الطلبات الراجعة",
        prompt: "نسبة الطلبات الراجعة عندي بالمحافظات أكثر من 25%، والزبائن يرفضون يستلمون الطلب من يتصل بيهم المندوب. شنو الخطة العملية حسب طريقة فيزيون حتى أنزل نسبة الراجع لأقل من 10%؟",
        defaultSuggestions: [
          "انطيني سكريبت مكالمة لتأكيد الطلب قبل التوصيل",
          "شلون أتعامل ويا تأخير شركات التوصيل؟",
          "شلون أوقف الطلبات الوهمية والزبائن اللي مو جديين؟"
        ]
      },
      {
        topicId: "topic_delivery_driver",
        label: "المندوب يتأخر والزبون يفقد رغبته بالطلب",
        subtext: "تأخر التوصيل من 4 إلى 6 أيام يخلي الزبون يلغي الطلب",
        prompt: "التوصيل للمحافظات يتأخر من 4 إلى 6 أيام، وخلال هالفترة الزبون يشتري من السوق ويلغي طلبه. شلون أحافظ على حماسه لحد ما يستلم الطلب؟",
        defaultSuggestions: [
          "سكريبت رسائل متابعة بالواتساب لحد ما يوصل الطلب",
          "شلون أختار شركة توصيل أكدر أعتمد عليها بالعراق؟",
          "نظام حوافز للمناديب والزبائن"
        ]
      }
    ]
  },
  {
    id: "pricing_finance",
    title: "التسعير وحساب التكاليف والأرباح",
    icon: "",
    description: "معادلات حساب التكاليف وصافي الأرباح بالدينار العراقي",
    options: [
      {
        topicId: "topic_pricing_profit",
        label: "شلون أسعر منتج كلفته من 10,000 إلى 15,000 دينار حتى أضمن ربح صافي؟",
        subtext: "حساب كلفة الشراء والإعلانات والتوصيل والطلبات الراجعة",
        prompt: "عندي منتج أشتريه بالجملة بـ 12,000 دينار، وأجور التوصيل 5,000. شلون أحدد سعر يجذب الزبون ويبقيلي ربح صافي بعد كلفة الإعلان والطلبات الراجعة؟",
        defaultSuggestions: [
          "احسبلي نقطة التعادل (Break-Even ROAS)",
          "شكد هامش الربح المناسب للمنتجات اليومية؟",
          "شلون أسعر القطعة الثانية والثالثة (Upsell)؟"
        ]
      },
      {
        topicId: "topic_budget_planning",
        label: "الأرباح تختفي بنهاية الشهر وما أعرف وين تروح",
        subtext: "مبيعات عالية بس ماكو سيولة نقدية صافية",
        prompt: "صفحتي تبيع زين ومبيعاتي جيدة، بس بنهاية الشهر ما يبقى بإيدي ربح كاش. شنو المصاريف والثغرات المخفية اللي تاكل أرباح البيع أونلاين بالعراق؟",
        defaultSuggestions: [
          "قائمة مراجعة المصاريف اللي تاكل الربح بدون ما تنتبه إلها (Leak Checklist)",
          "شلون أحسب كلفة الطلبات الراجعة على كل قطعة أبيعها؟",
          "إدارة رأس المال ومتابعة مستحقاتك من شركات التوصيل"
        ]
      }
    ]
  }
];

const SCRIPT_OBJECTIONS = [
  {
    id: "expensive",
    label: "السعر غالي",
    icon: "",
    promptContext: "الزبون يشوف السعر غالي ومبالغ بيه"
  },
  {
    id: "think_later",
    label: "بعدين أردلك خبر",
    icon: "",
    promptContext: "الزبون يكول أستشير أو أردلك خبر بعدين"
  },
  {
    id: "cheaper_elsewhere",
    label: "شفته أرخص بصفحة ثانية",
    icon: "",
    promptContext: "الزبون يقارن منتجك بمنتج مشابه أو تقليد ينباع بصفحة ثانية بسعر أقل"
  },
  {
    id: "quality_fear",
    label: "خايف من الجودة والتوصيل",
    icon: "",
    promptContext: "الزبون خايف المنتج يطلع مو مثل الصورة أو جودته مو زينة"
  },
  {
    id: "confirm_call",
    label: "مكالمة تأكيد قبل التوصيل",
    icon: "",
    promptContext: "مكالمة سريعة لتأكيد العنوان والتأكد من جدية الزبون قبل تسليم الطلب لشركة التوصيل"
  }
];

const SCRIPT_NICHES = [
  { id: "general", label: "منتجات عامة واستهلاكية", icon: "" },
  { id: "fashion", label: "أزياء وملابس", icon: "" },
  { id: "beauty", label: "تجميل وعناية", icon: "" },
  { id: "electronics", label: "إلكترونيات وأجهزة", icon: "" },
  { id: "home", label: "منزل ومطبخ", icon: "" }
];

const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") return "server_device";
  let devId = localStorage.getItem("vizion_device_uid");
  if (!devId) {
    devId = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem("vizion_device_uid", devId);
  }
  return devId;
};

const getChatStorageKey = (code?: string): string => {
  const activeCode = code || (typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") : "") || "";
  const normalized = normalizeCode(activeCode);
  if (normalized) {
    return `vizion_chat_history_user_${normalized}`;
  }
  const deviceId = getOrCreateDeviceId();
  return `vizion_chat_history_device_${deviceId}`;
};

const getProfileStorageKey = (code?: string): string => {
  const activeCode = code || (typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") : "") || "";
  const normalized = normalizeCode(activeCode);
  if (normalized) {
    return `vizion_user_profile_${normalized}`;
  }
  const deviceId = getOrCreateDeviceId();
  return `vizion_user_profile_${deviceId}`;
};

const EXAMPLE_QUESTIONS = [
  {
    id: "ex_no_sales",
    label: "تجيني رسائل بس ماكو طلبات",
    topicId: "topic_ad_messages_no_sales",
    suggestions: [
      "شنو الأخطاء بالرد السريع على الزبون؟",
      "انطيني سكريبت أتأكد بيه من جدية الزبون",
      "شلون أقنع الزبون يكمل الطلب هسه؟"
    ]
  },
  {
    id: "ex_price_high",
    label: "الزبون يكول السعر غالي",
    topicId: "topic_sales_price_objection",
    suggestions: [
      "انطيني سكريبت للرد على 'السعر غالي'",
      "شلون أصيغ عروض البكجات 1+1؟",
      "شلون أوضح قيمة المنتج للزبون؟"
    ]
  },
  {
    id: "ex_returns",
    label: "نسبة الطلبات الراجعة عندي عالية",
    topicId: "topic_delivery_returns",
    suggestions: [
      "سكريبت مكالمة تأكيد الطلب قبل التوصيل",
      "شلون أتعامل ويا تأخير شركة التوصيل؟",
      "نصائح لاختيار شركة توصيل تكدر تعتمد عليها"
    ]
  },
  {
    id: "ex_followup",
    label: "أريد سكريبت لمتابعة الزبون",
    topicId: "topic_sales_hesitation",
    suggestions: [
      "رسالة متابعة بعد 24 ساعة",
      "شلون أقدم عرض خصم لفترة محدودة؟",
      "سكريبت لإرجاع الزبائن المترددين"
    ]
  }
];

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome-1",
  role: "assistant",
  text: "هلا بيك. أني مستشارك التكتيكي من فيزيون، أساعدك تاخذ قرارات صح بالبيع والتسويق والتسعير بالدينار، وتنظيم التوصيل وتقليل الطلبات الراجعة بالسوق العراقي.\n\nتكدر تختار موضوع من المواضيع الجاهزة أو تكتبلي مشكلتك بالشغل مباشرة، ونحسبها وياك خطوة بخطوة.",
  timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
  suggestions: [
    "ابدأ تشخيص مشروعي (4 خطوات)",
    "شلون أقلل نسبة الطلبات الراجعة بالمحافظات؟",
    "اكتبلي سكريبت للرد على اعتراض 'السعر غالي'",
    "إعلاني يجيب رسائل بس ماكو طلبات، شنو الحل؟",
    "شلون أسعر منتجي وأحسب صافي الربح بالدينار؟"
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

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 44), 120);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = (!inputText.trim() && attachments.length === 0) || isLoading;

  return (
    <div className="w-full flex flex-col gap-2">
      {!isLoading && lastFailedPrompt && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in shadow-md"
        >
          <div className="flex items-center gap-2" role="alert" aria-live="assertive">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm">{lastFailedPrompt.errorText || "صار خلل بسيط، جرب مرة ثانية."}</span>
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
              title="رجع النص حتى أعدله"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل السؤال</span>
            </button>
          </div>
        </div>
      )}

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

      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-1" aria-label="الصور المرفقة">
          {attachments.map((im, i) => (
            <div key={i} className="relative">
              <img src={im.thumb} alt="صورة مرفقة" className="h-14 w-14 rounded-xl object-cover border border-white/20" />
              <button
                type="button"
                onClick={() => onRemoveAttachment?.(i)}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/30 text-white flex items-center justify-center"
                aria-label="إزالة الصورة"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <span className="text-[11px] text-white/55 font-bold">المستشار راح يقرا الصورة ويحللها</span>
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

      <form onSubmit={handleSubmit} dir="rtl" className="flex items-end gap-1.5 sm:gap-2 relative w-full">
        <div aria-live="polite" className="sr-only">
          {isLoading ? "نعالج الطلب، انتظر شوي..." : ""}
        </div>

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
            title="أرفق صورة (لقطة من مدير الإعلانات، إعلان، محادثة...)"
            aria-label="أرفق صورة"
            className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] text-vz-accent flex items-center justify-center disabled:opacity-40 transition-colors"
          >
            <ImagePlus className="w-[18px] h-[18px]" />
          </button>
        )}

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
            placeholder={dictation.listening ? interim || "أسمعك... احچي" : attachments.length ? "اكتبلي شنو تريد أفحص بالصورة (اختياري)" : "اكتب سؤالك هنا..."}
            aria-label="اكتب سؤالك هنا..."
            disabled={isLoading}
            dir="rtl"
            className="w-full ps-4 pe-4 sm:ps-5 sm:pe-5 pl-11 sm:pl-12 py-2.5 sm:py-3 rounded-2xl bg-black/35 border border-white/10 focus:border-white/30 text-white text-xs sm:text-sm placeholder-white/50 outline-none transition-all motion-reduce:transition-none motion-reduce:transform-none dir-rtl text-right resize-none min-h-[42px] max-h-[120px] leading-relaxed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
          />
          {dictation.supported && !isLoading && (
            <button
              type="button"
              onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
              aria-label={dictation.listening ? "إيقاف التسجيل" : "احچي بدل ما تكتب"}
              title={dictation.listening ? "إيقاف التسجيل" : "احچي بدل ما تكتب"}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                dictation.listening ? "bg-rose-500 text-white animate-pulse" : "text-white/55 hover:text-white hover:bg-white/10"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoading && onStop ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="إيقاف الجواب"
            title="إيقاف الجواب"
            className="btn btn-glass px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 min-h-[44px]"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline font-bold whitespace-nowrap">إيقاف</span>
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

interface AnswerHandlers {
  onChapter: (chapterId: string) => void;
  onTool: (toolId: string, category?: string) => void;
  onCopy: () => void;
  onSaveProfile: (p: BusinessProfile) => void;
  addTask: (task: string, topicId?: string) => boolean | void;
}

const FinishedAnswer = React.memo(function FinishedAnswer({ text, topicId, handlers }: { text: string; topicId?: string; handlers: AnswerHandlers }) {
  const onAddTask = React.useCallback((task: string) => handlers.addTask(task, topicId), [handlers, topicId]);
  return (
    <RichMessage
      text={text}
      onChapter={handlers.onChapter}
      onTool={handlers.onTool}
      onAddTask={onAddTask}
      onCopy={handlers.onCopy}
      onSaveProfile={handlers.onSaveProfile}
    />
  );
});

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

  useEffect(() => {
    if (!isOpen) return;

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
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState<"chat" | "profile" | "business_diagnostic" | "diagnostic" | "script_gen" | "saved_plan">("chat");
  const { profile: businessProfile, save: saveBusinessProfile, merge: mergeBusinessProfile } = useBusinessProfile(userCode);
  const [attachments, setAttachments] = useState<PreparedImage[]>([]);
  const [selectedDiagCat, setSelectedDiagCat] = useState<string>("ads");
  
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: "success" | "copy" | "saved" | "plan" | "navigate", title: string, description?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      description
    });
  };

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
        showToast("success", "عاشت إيدك، كملت هالمهمة", target.task);
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
      showToast("success", "انحذفت المهمة من الخطة");
    } catch (e) {
      console.warn("Failed to delete task:", e);
    }
  };

  const handleDeleteRecommendation = (recId: string) => {
    removeSavedRecommendationFromStorage(recId, userCode);
    refreshSavedData();
    showToast("success", "انحذفت التوصية من المحفوظات");
  };
  
  const [selectedObjection, setSelectedObjection] = useState<string>("expensive");
  const [selectedNiche, setSelectedNiche] = useState<string>("general");
  const [customProductNote, setCustomProductNote] = useState<string>("");

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

  const hasUserMessages = messages.some((m) => m.role === "user");
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant" && !m.isDivider && !m.isError)?.id;
  const canRegenerate = !([...messages].reverse().find((m) => m.role === "user")?.images?.length);

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
      reason: reason || (rating === "helpful" ? "إجابة مفيدة وتناسب واقع السوق العراقي" : undefined),
      customNote,
      messageId,
      topicId: currentTopicRef.current,
    });

    if (rating === "helpful" || reason || customNote) {
      showToast(
        "success",
        rating === "helpful"
          ? "شكرا على تقييمك، يسعدنا إن الإجابة فادتك بشغلك بالسوق العراقي"
          : "شكرا على ملاحظتك، راح نشتغل على تطوير الإجابات حتى تناسب واقع التجارة بالعراق"
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
    showToast("success", "رجعنا التقييم، تكدر تقيم من جديد");
  };

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

  const activeSuggestions = React.useMemo(() => {
    const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant" && !m.isError && m.suggestions && m.suggestions.length > 0);
    if (latestAssistant && latestAssistant.suggestions && latestAssistant.suggestions.length > 0) {
      return latestAssistant.suggestions.slice(0, 4).map((sug) => ({
        label: sug,
        prompt: sug,
        topicId: latestAssistant.topicId || currentTopicRef.current
      }));
    }

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

  useEffect(() => {
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

    if (isInitial && !messages.some((m) => m.role === "user")) {
      // a fresh chat opens on its greeting and starter questions, not halfway down them
      chatScrollRef.current?.scrollTo({ top: 0 });
      isInitialOpenRef.current = false;
    } else if (isInitial || messagesCountChanged || responseFinished) {
      scrollToBottom(isInitial ? "auto" : "smooth");
      isInitialOpenRef.current = false;
    }

    prevMessagesLengthRef.current = messages.length;
    prevIsLoadingRef.current = isLoading;
  }, [messages.length, isLoading, isOpen, isVip, activeTab]);

  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [isOpen]);

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

    return {
      cleanText: rawText,
      suggestions: [
        "انطيني سكريبت عملي أكدر أنسخه وأستخدمه",
        "شلون أطبق هالشي بحملتي؟",
        "شنو الغلط الشائع اللي الكل يوكع بيه بهالحالة؟"
      ]
    };
  };


  const handleStartNewTopic = () => {
    const hasUserMessages = messages.some((m) => m.role === "user");
    if (hasUserMessages) {
      const confirmed = confirm("تريد تبدي موضوع جديد وتمسح المحادثة الحالية؟");
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
      text: "بدينا موضوع جديد. اكتب سؤالك هسه.",
      timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
      isDivider: true,
      topicId: newTopicId,
      suggestions: [
        "تشخيص ضعف نتائج الإعلانات",
        "سكريبت الرد على 'السعر غالي'",
        "خطة لتقليل الطلبات الراجعة بالمحافظات",
        "معادلة تسعير المنتج حتى تضمن ربحك"
      ]
    };

    setMessages([newTopicMessage]);
    setLastFailedPrompt(null);
    setIsSuggestionsOpen(false);
    setActiveTab("chat");
    showToast("success", "بدينا موضوع جديد. اكتب سؤالك هسه.");
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
        "حولها إلى خطة لمدة 7 أيام",
        "اكتبلي السكريبت باللهجة العراقية",
        "احسبلي صافي الربح",
        "افتح الفصل المرتبط بالمشكلة"
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
    const pendingImages = attachments;
    const text = textToSend?.trim() || (pendingImages.length ? "حلل هالصورة وشخص المشكلة حسب وضع مشروعي." : "");

    if (!text || isLoadingRef.current) return;

    setIsSuggestionsOpen(false);

    if (text.includes("ابدأ تشخيص مشروعي") || text.includes("شخصلي مشروعي")) {
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
    const botId = (Date.now() + 1).toString();
    const placeholder: Message = { id: botId, role: "assistant", text: "", timestamp: now(), topicId, requestId: clientRequestId, streaming: true };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setActiveTab("chat");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 170000);

    let streamed = "";
    let shownLen = 0;
    let lastShownAt = Date.now();
    let frame: number | null = null;
    let waitTimer: ReturnType<typeof setTimeout> | null = null;
    const stopPainting = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (waitTimer) clearTimeout(waitTimer);
      frame = null;
      waitTimer = null;
    };
    const paint = () => {
      frame = null;
      const next = revealUpTo(streamed, shownLen, Date.now() - lastShownAt);
      if (next > shownLen) {
        shownLen = next;
        lastShownAt = Date.now();
        setStreamText(botId, streamed.slice(0, next));
      }
      if (shownLen < streamed.length && !waitTimer) {
        waitTimer = setTimeout(() => {
          waitTimer = null;
          schedulePaint();
        }, 90);
      }
    };
    const schedulePaint = () => {
      if (frame === null) frame = requestAnimationFrame(paint);
    };
    const onDelta = (t: string) => {
      streamed += t;
      schedulePaint();
    };
    const finalize = (patch: Partial<Message>) => {
      stopPainting();
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...patch, streaming: false } : m)));
      clearStreamText(botId);
    };

    try {
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

      const payload = {
        messages: history,
        requestId: clientRequestId,
        topicContext: options.topicContext || topicId,
        isNewTopic: options.isNewTopic,
        diagnosticProfile: options.diagnosticProfile,
        profile: businessProfile,
        userContext: { isVip, platform: "Vizion Iraq E-Commerce Suite" },
        code: userCode,
        lessonNotes: readLessonNotes(),
      };
      let outcome: StreamOutcome;
      try {
        outcome = await streamAdvisor(payload, { onDelta, signal: controller.signal });
      } catch (e) {
        if (controller.signal.aborted || !streamed.trim()) throw e;
        outcome = { text: "", cut: true };
      }
      for (let round = 0; round < 2 && !controller.signal.aborted && streamed.trim() && (outcome.truncated || outcome.cut || outcome.error); round++) {
        try {
          const more = await streamAdvisor({ ...payload, continueFrom: streamed }, { onDelta, signal: controller.signal });
          outcome = { ...more, requestId: outcome.requestId };
        } catch (e) {
          if (controller.signal.aborted) throw e;
          outcome = { ...outcome, error: "انقطع الجواب بالنص. اضغط 'جواب جديد' حتى أعيده إلك كامل." };
          break;
        }
      }
      clearTimeout(timeoutId);

      const raw = streamed;
      const learned = parseProfileTags(raw);
      const changed = mergeBusinessProfile(learned);
      const learnedSummary = changed.length ? describeProfileUpdate(Object.fromEntries(changed.map((k) => [k, learned[k]]))) : [];
      const suggestions = parseSuggestionTags(raw);
      finalize({
        text: stripAdvisorTags(raw),
        requestId: outcome.requestId || clientRequestId,
        suggestions: presetSuggestions || (suggestions.length > 0 ? suggestions : undefined),
        profileUpdate: learnedSummary.length ? learnedSummary : undefined,
        partialError: outcome.error || (outcome.truncated || outcome.cut ? "الجواب طويل وانقطع بالنص. اضغط 'جواب جديد' أو اكتبلي 'كمل'." : undefined),
      });
      if (learnedSummary.length) showToast("saved", "تم تحديث ملف مشروعك", learnedSummary.join("، "));
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
        finalize({ text: partial, partialError: "انقطع الجواب بالنص. اضغط 'جواب جديد' حتى أعيده إلك كامل." });
        return;
      }

      console.error("AI Advisor error:", err);
      let errorText = "صار خلل بسيط، جرب مرة ثانية.";
      if (err?.name === "AbortError") {
        errorText = "الجواب أخذ وقت أطول من المعتاد بسبب ضغط السيرفرات. اضغط 'إعادة المحاولة'.";
      } else if (err instanceof AdvisorHttpError || (err?.message && typeof err.message === "string" && err.message.length > 3 && !err.message.includes("Failed to fetch"))) {
        errorText = err.message;
      } else if (err?.message?.includes("Failed to fetch")) {
        errorText = "ما كدرنا نتصل بالسيرفر. تأكد من اتصال الإنترنت وجرب مرة ثانية.";
      }

      const errorMessage: Message = {
        id: botId,
        role: "assistant",
        text: errorText,
        timestamp: now(),
        topicId,
        isError: true,
        failedPrompt: { text, presetSuggestions },
        suggestions: ["شخصلي ضعف إعلاناتي", "خطة لتقليل الطلبات الراجعة بالمحافظات", "سكريبتات مبيعات الواتساب"],
      };
      setMessages((prev) => prev.map((m) => (m.id === botId ? errorMessage : m)));
      setLastFailedPrompt({ text, presetSuggestions, errorText });
    } finally {
      stopPainting();
      clearStreamText(botId);
      isLoadingRef.current = false;
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessageRef = useRef(handleSendMessage);
  handleSendMessageRef.current = handleSendMessage;

  const answerDepsRef = useRef({ onNavigateToSection, onNavigateTool, showToast, mergeBusinessProfile, addTask: (_t: string, _topic?: string): boolean | void => undefined });
  answerDepsRef.current = { onNavigateToSection, onNavigateTool, showToast, mergeBusinessProfile, addTask: (t: string, topic?: string) => handleAddTaskToPlan(t, topic) };
  const answerHandlers = React.useMemo(
    () => ({
      onChapter: (chId: string) => answerDepsRef.current.onNavigateToSection?.(chId),
      onTool: (tId: string, cat?: string) => answerDepsRef.current.onNavigateTool?.(tId, cat),
      onCopy: () => answerDepsRef.current.showToast("copy", "تم نسخ الرسالة", "الصقها للزبون مباشرة بالواتساب"),
      onSaveProfile: (p: BusinessProfile) => {
        answerDepsRef.current.mergeBusinessProfile(p);
        answerDepsRef.current.showToast("saved", "انحفظت الأرقام بملف مشروعك");
      },
      addTask: (task: string, topicId?: string) => answerDepsRef.current.addTask(task, topicId),
    }),
    []
  );
  const keepPinnedToBottom = React.useCallback(() => {
    const chat = chatScrollRef.current;
    if (!chat) return;
    if (chat.scrollHeight - chat.scrollTop - chat.clientHeight < 320) chat.scrollTop = chat.scrollHeight;
  }, []);

  const handleRegenerate = () => {
    if (isLoadingRef.current) return;
    const lastUserIdx = messages.map((m) => m.role === "user" && !m.isDivider).lastIndexOf(true);
    if (lastUserIdx < 0) return;
    const lastUser = messages[lastUserIdx];
    setMessages((prev) => prev.slice(0, lastUserIdx));
    setTimeout(() => handleSendMessageRef.current?.(lastUser.text, undefined, lastUser.topicId), 0);
  };

  const handleAddTaskToPlan = (task: string, topicId?: string) => {
    const result = addRecommendationTo7DayPlanStorage({ title: task.slice(0, 90), details: task, topicId }, userCode);
    if (result.success) {
      showToast("plan", "انضافت إلى خطتك", "تلكاها بتبويب 'خطتي'");
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
        showToast("success", e?.message || "ما كدرنا نضيف الصورة");
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

    const prompt = `اعطيني سكريبت رد احترافي مكتوب باللهجة العراقية المفهومة والودية للتعامل مع اعتراض: "${objObj?.label}" (${objObj?.promptContext}) لمتجر يشتغل بمجال: "${nicheObj?.label}".
${customProductNote.trim() ? `ملاحظات إضافية عن المنتج: ${customProductNote.trim()}` : ""}
المطلوب:
1. صياغة سكريبت محادثة واتساب مباشر جاهز للنسخ والإرسال.
2. نصيحة ذهبية لمنع خسارة الزبون وإغلاق البيعة فورا.`;

    handleSendMessage(
      prompt,
      [
        "انطيني رد ثاني لنفس اعتراض الزبون",
        "شلون أضيف عرض باكج يخلي الزبون يقتنع؟",
        "سكريبت متابعة إذا الزبون ما رد"
      ],
      topicId
    );
  };

  const handleClearHistory = () => {
    if (confirm("متأكد تريد تمسح محادثة المستشار المحفوظة على هالجهاز؟")) {
      setMessages([]);
      if (typeof window !== "undefined") {
        try {
          const storageKey = getChatStorageKey(userCode);
          localStorage.removeItem(storageKey);
        } catch (e) {
          console.warn("Failed to clear local chat history:", e);
        }
      }
      showToast("success", "انمسحت المحادثة");
    }
  };

  const currentDiag = DIAGNOSTIC_CATEGORIES.find((c) => c.id === selectedDiagCat) || DIAGNOSTIC_CATEGORIES[0];

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
            <div className="w-10 h-[5px] bg-white/20 rounded-full mx-auto mt-1.5 mb-1 sm:hidden shrink-0" />

            <AdvisorToast toast={toast} onDismiss={() => setToast(null)} />

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
                    مستشارك الرقمي حتى يحلل مشروعك ويساعدك تطوره
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {isVip && (
                  <>
                    <button 
                      onClick={handleStartNewTopic}
                      title="بدء استشارة بموضوع جديد"
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

            {!isVip ? (
              <div role="region" aria-label="المستشار متوفر ويا الاشتراك الكامل" className="flex-1 overflow-y-auto p-4 sm:p-8 text-right">
                <div className="max-w-xl mx-auto space-y-5">
                  <div className="text-center space-y-3">
                    <div className="vz-eyebrow text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-vz-accent" />
                      <span>المستشار متوفر ويا الاشتراك الكامل</span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">اكتبله مشكلتك، وراح يجاوبك حسب أرقام مشروعك</h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">مو مجرد جواب عام: يسألك عن سعر منتجك وكلفته وإعلانك، ويحددلك وين المشكلة وشنو الخطوة الجاية.</p>
                  </div>
                  <ul className="glass rounded-3xl p-5 space-y-2.5 text-xs sm:text-sm text-white/90">
                    {[
                      "دزله صورة إعلانك أو محادثة ما كدرت تكمل بيها البيعة، وهو يوضحلك وين الغلط وشنو الرد المناسب",
                      "يحسبلك سعر البيع وحد الخسارة بالدينار قبل لا تصرف فلوسك",
                      "يدلك على الفصل والحل اللي يناسب مشكلتك بالضبط",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="glass-elevated glass-edge rounded-3xl p-5 sm:p-6 space-y-4">
                    <p className="text-sm font-black text-white">الاشتراك الكامل: الكورس + الحلول + الأدوات + المستشار</p>
                    <OfferPrice size="md" />
                    <SubscribeButton />
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("open-upgrade-modal"))}
                      className="btn btn-ghost w-full min-h-[44px] rounded-2xl text-xs text-white/70 gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      مشترك وعندك الرمز؟ افتح حسابك
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                      <span className="relative">المحادثة المفتوحة</span>
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
                      <span className="relative">تشخيص المشاكل</span>
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
                      <span className="relative">مولد السكريبتات</span>
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

                {activeTab === "profile" && (
                  <BusinessProfilePanel
                    profile={businessProfile}
                    onSave={(p) => {
                      saveBusinessProfile(p);
                      showToast("saved", "انحفظ ملف مشروعك", "المستشار راح يعتمد عليه بكل جواب يقدمه إلك");
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

                {activeTab === "diagnostic" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-5">
                    <div className="glass-subtle border rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2 text-vz-accent">
                        <Compass className="w-5 h-5" />
                        <h4 className="text-sm sm:text-base font-black text-white">
                          اختار المشكلة اللي تواجه مشروعك حاليا:
                        </h4>
                      </div>
                      <p className="text-xs text-white/70">
                        حدد القسم والمشكلة اللي تواجهك، ومستشار فيزيون يحلل السبب ويقدم إلك الحلول والسكريبتات مباشرة.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DIAGNOSTIC_CATEGORIES.map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => setSelectedDiagCat(cat.id)}
                          className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col gap-1 ${ selectedDiagCat === cat.id ? "glass border-white/35 shadow-lg md:shadow-black/40 shadow-xl/15 ring-1 ring-white/60" : "glass-subtle border-white/10 hover:border-white/25 text-white/80" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                        >
                          <span className="text-xs font-bold text-white line-clamp-1">{cat.title}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-vz-accent flex items-center gap-1">
                          <span>حدد وضع مشروعك بالضبط:</span>
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
                                تحليل مباشر
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

                {activeTab === "script_gen" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-5">
                    <div className="glass-subtle border rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2 text-vz-accent">
                        <FileText className="w-5 h-5" />
                        <h4 className="text-sm sm:text-base font-black text-white">
                          مولد سكريبتات إتمام البيع بالسوق العراقي
                        </h4>
                      </div>
                      <p className="text-xs text-white/70">
                        اختار نوع اعتراض الزبون ومجال منتجك، والمستشار يكتبلك سكريبت جاهز تنسخه وتدزه للزبون بالواتساب أو تستخدمه بالمكالمة.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 border border-white/18 flex items-center justify-center text-[10px] text-vz-accent">1</span>
                        <span>شنو الاعتراض اللي تريد ترد عليه؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SCRIPT_OBJECTIONS.map((obj) => (
                          <button 
                            key={obj.id}
                            onClick={() => setSelectedObjection(obj.id)}
                            className={`p-3 rounded-xl border text-right transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-2.5 ${ selectedObjection === obj.id ? "glass-subtle border-white/35 shadow-lg md:shadow-black/40 shadow-xl/20 text-white font-bold" : "glass-subtle border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                          >
                            <span className="text-xs">{obj.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-vz-accent flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 border border-white/18 flex items-center justify-center text-[10px] text-vz-accent">2</span>
                        <span>شنو مجال متجرك؟</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SCRIPT_NICHES.map((niche) => (
                          <button 
                            key={niche.id}
                            onClick={() => setSelectedNiche(niche.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex flex-col items-center gap-1 ${ selectedNiche === niche.id ? "glass-subtle border-white/35 shadow-lg md:shadow-black/40 shadow-xl/20 text-white font-bold" : "glass-subtle border-white/10 hover:border-white/25 text-white/70" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
                          >
                            <span className="text-[11px]">{niche.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                        <span>ملاحظات إضافية أو اسم المنتج (اختياري):</span>
                        <span className="text-[10px] text-white/60">مثال: ساعة ذكية ضد الماء بسعر 25 ألف</span>
                      </label>
                      <input 
                        type="text"
                        value={customProductNote}
                        onChange={(e) => setCustomProductNote(e.target.value)}
                        placeholder="اكتب اسم المنتج أو سعره إذا تريد أخلي السكريبت مناسب إلك أكثر..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/35 border border-white/15 focus:border-white/35 text-white text-xs placeholder-white/30 outline-none min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                      />
                    </div>

                    <button 
                      onClick={handleGenerateScript}
                      disabled={isLoading}
                      className="btn btn-primary w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>اكتبلي السكريبت</span>
                    </button>
                  </div>
                )}

                {activeTab === "saved_plan" && (
                  <div className="flex-1 overflow-y-auto animate-fade-in p-4 sm:p-6 space-y-6">
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
                          <span className="text-xs text-white/60">المهام المنجزة من خطة الـ 7 أيام</span>
                          <h4 className="text-xl font-black text-emerald-400">
                            {planTasks.filter((t) => t.completed).length} / {planTasks.length} مكتملة
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-vz-accent" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            خطة العمل لمدة 7 أيام
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {planTasks.length} مهام مضافة
                        </span>
                      </div>

                      {planTasks.length === 0 ? (
                        <div className="p-6 rounded-2xl glass-subtle border text-center space-y-2">
                          <Calendar className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">لحد هسه ما ضفت أي توصية لخطة الـ 7 أيام</p>
                          <p className="text-[11px] text-white/60">
                            من تسأل المستشار، اضغط على زر <strong className="text-vz-accent">"إضافة إلى خطة الـ 7 أيام"</strong> الموجود ببطاقة الإجراءات، ورتب خطوات شغلك هنا.
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

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-5 h-5 text-vz-accent" />
                          <h3 className="text-sm sm:text-base font-black text-white">
                            التوصيات والسكريبتات المحفوظة
                          </h3>
                        </div>
                        <span className="text-xs text-white/70 font-mono">
                          {savedRecommendations.length} عناصر
                        </span>
                      </div>

                      {savedRecommendations.length === 0 ? (
                        <div className="p-6 rounded-2xl glass-subtle border text-center space-y-2">
                          <Bookmark className="w-8 h-8 text-white/60 mx-auto" />
                          <p className="text-xs text-white/70 font-semibold">لحد هسه ما عندك توصيات محفوظة</p>
                          <p className="text-[11px] text-white/60">
                            اضغط على زر <strong className="text-vz-accent">"حفظ التوصية"</strong> بأي جواب أو سكريبت يعجبك، وراح تلكاه محفوظ هنا وتكدر ترجعله بأي وقت.
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
                                      {rec.relevanceReason}
                                    </p>
                                  )}
                                  <span className="text-[9px] text-white/60 font-mono">
                                    حفظت بتاريخ: {new Date(rec.savedAt).toLocaleDateString("ar-IQ")}
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

                              {rec.scriptText && (
                                <div className="p-3 rounded-lg bg-black/30 border border-white/14 text-white/90 text-xs space-y-2">
                                  <div className="flex items-center justify-between text-[10px] text-vz-accent font-bold">
                                    <span>نص السكريبت الجاهز حتى تدزه للزبون:</span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(rec.scriptText || "");
                                        showToast("copy", "تم نسخ السكريبت", "تكدر تلصقه مباشرة بمحادثة الواتساب");
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

                {activeTab === "chat" && (
                  <>
                    <div 
                      aria-live="polite"
                      aria-atomic="false"
                      ref={chatScrollRef}
                      onScroll={handleChatScroll}
                      className="vizion-advisor-chat min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 relative"
                    >
                      {!hasUserMessages ? (
                        <div className="min-h-full flex flex-col justify-center py-4 my-auto w-full max-w-xl mx-auto">
                          <div className="text-center mb-4 sm:mb-5">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/14 text-vz-accent mb-2.5 shadow-sm">
                              <Bot className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1.5">
                              شنو المشكلة اللي تريد نحلها؟
                            </h3>
                            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                              اكتبلي مشكلتك بالتجارة، وأنا أرتبلك التشخيص وأحددلك الخطوة الجاية.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() => setActiveTab("profile")}
                              className="text-right p-3 rounded-2xl border border-vz-blue/30 bg-vz-blue/10 hover:bg-vz-blue/15 transition-colors flex items-start gap-2.5"
                            >
                              <Brain className="w-5 h-5 text-vz-accent shrink-0 mt-0.5" />
                              <span>
                                <span className="block text-xs sm:text-sm font-black text-white">
                                  {profileFilledCount(businessProfile) >= 3 ? "أعرف تفاصيل مشروعك ✓" : "عرفني على مشروعك"}
                                </span>
                                <span className="block text-[11px] sm:text-xs text-white/60 leading-relaxed">
                                  {profileFilledCount(businessProfile) >= 3 ? "كل جواب راح يكون حسب منتجك وأرقامك" : "منتجك وأسعارك وكلفة رسالتك، حتى أحسبلك الربح بشكل دقيق"}
                                </span>
                              </span>
                            </button>
                            <div className="text-right p-3 rounded-2xl border border-white/10 bg-white/[0.03] flex items-start gap-2.5">
                              <ImagePlus className="w-5 h-5 text-vz-accent shrink-0 mt-0.5" />
                              <span>
                                <span className="block text-xs sm:text-sm font-black text-white">دزلي صورة إعلانك</span>
                                <span className="block text-[11px] sm:text-xs text-white/60 leading-relaxed">ارفع لقطة من مدير الإعلانات أو محادثة ويا زبون، أو احچيلي بالمايك</span>
                              </span>
                            </div>
                          </div>

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
                          {messages.map((msg, msgIndex) => {
                            const settledClass = msgIndex < messages.length - 3 ? " vz-msg-settled" : "";
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
                                    <span>بدينا موضوع جديد. اكتب سؤالك هسه أو اختار من الاقتراحات.</span>
                                  </div>
                                </motion.div>
                              );
                            }

                            const isUser = msg.role === "user";
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: EASE_OUT }}
                                className={`flex gap-2 sm:gap-2.5 ${
                                  isUser ? "max-w-[85%] sm:max-w-[75%] ms-auto flex-row-reverse" : "max-w-[92%] sm:max-w-[85%] me-auto"
                                }${settledClass}`}
                              >
                                <div className="flex-shrink-0">
                                  {isUser ? (
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-vz-blue text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 mt-1 select-none">
                                      إنت
                                    </div>
                                  ) : (
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${msg.isError ? "bg-rose-950/80 border border-rose-500/40 text-rose-300" : "glass-subtle border border-white/15 text-vz-accent"} flex items-center justify-center shrink-0 mt-1 select-none`}>
                                      <Bot className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>

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
                                    {msg.isError ? (
                                      <div 
                                        role="alert" 
                                        aria-live="assertive"
                                        className="p-3.5 sm:p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-100 text-xs sm:text-sm space-y-3"
                                      >
                                        <div className="flex items-start gap-2 text-rose-300 font-bold text-sm sm:text-base">
                                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                          <span className="leading-relaxed">{msg.text || "صار خلل بسيط، جرب مرة ثانية."}</span>
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
                                                showToast("copy", "رجعنالك السؤال حتى تكدر تعدله");
                                              }}
                                              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                                              title="رجع السؤال حتى أعدله"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                              <span>تعديل السؤال</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : msg.role === "assistant" ? (
                                      <>
                                        {msg.streaming ? (
                                          <StreamingAnswer
                                            id={msg.id}
                                            onChapter={answerHandlers.onChapter}
                                            onTool={answerHandlers.onTool}
                                            onCopy={answerHandlers.onCopy}
                                            onSaveProfile={answerHandlers.onSaveProfile}
                                            onGrow={keepPinnedToBottom}
                                          />
                                        ) : (
                                          <FinishedAnswer text={msg.text} topicId={msg.topicId} handlers={answerHandlers} />
                                        )}
                                        {msg.profileUpdate && msg.profileUpdate.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveTab("profile")}
                                            className="mt-3 w-full text-right rounded-2xl border border-vz-blue/30 bg-vz-blue/10 hover:bg-vz-blue/15 px-3 py-2 text-xs text-vz-accent flex items-start gap-2 transition-colors"
                                          >
                                            <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">
                                              <span className="font-black text-white">انحفظ بملف مشروعك: </span>
                                              {msg.profileUpdate.join("، ")}
                                            </span>
                                          </button>
                                        )}
                                        {(msg.stopped || msg.partialError) && (
                                          <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">
                                            {msg.partialError || "توقف الجواب بنص الطريق."}
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
                                                showToast("copy", "تم نسخ الرد بالكامل");
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
                                            showToast("copy", "تم نسخ الرد بالكامل");
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
                                <span className="text-[13px] sm:text-[14px] text-vz-accent font-bold">أجهزلك الجواب...</span>
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
                          <ShieldCheck className="w-3 h-3 text-slate-200" /> مصمم ومجهز خصيصا للتجارة الإلكترونية بالسوق العراقي
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300/80 bg-emerald-400/[0.06] px-2 py-0.5 rounded-full border border-emerald-400/15 font-sans">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> ينحفظ تلقائيا على تلفونك
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