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
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllValidCodes, normalizeCode } from "./LockScreen";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface VizionAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  isVip?: boolean;
  userCode?: string;
  onUpgradeSuccess?: (newVipCode: string) => void;
}

const QUICK_PROMPTS = [
  {
    title: "تقليل الراجع (المحافظات)",
    prompt: "كيف أسطر على نسبة الراجع في الشحن للمحافظات وأقللها لأقل من 10%؟ وما هو سكريبت المكالمات الأنسب؟",
    icon: "📦"
  },
  {
    title: "سكريبت مبيعات الواتساب",
    prompt: "اعطيني سكريبت محادثة واتساب احترافي لإقناع زبون عراقي يرى أن السعر غالي مقارنة بالسوق.",
    icon: "💬"
  },
  {
    title: "حل مشكلة الإعلانات",
    prompt: "الحملة الإعلانية تجيب رسائل هواية على الصفحة بس ماكو مبيعات فعلياً، شنو الخلل بحسب منظومة فيزيون؟",
    icon: "🎯"
  },
  {
    title: "حساب كلفة المنتج والتسعير",
    prompt: "كيف أحسب سعر البيع النهائي بالدينار العراقي لمنتج كلفته 12,000 دينار مع التوصيل والإعلانات لضمان ربح صافي؟",
    icon: "🧮"
  }
];

export const VizionAdvisorModal: React.FC<VizionAdvisorModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  isVip = true,
  userCode = "",
  onUpgradeSuccess
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "أهلاً بك عزيزي التاجر في **فيزيون بوت (Vizion AI Advisor)**! 🤖✨\n\nأنا مستشارك الرقمي المدرب خصيصاً على كتاب وإستراتيجيات منظومة **فيزيون للتجارة الإلكترونية بالسوق العراقي**.\n\nيمكنك سؤالي عن:\n- 🎯 **حلول ضعف المبيعات وهدر الإعلانات**\n- 💬 **سكريبتات الواتساب والمكالمات لإغلاق الصفقات**\n- 📦 **طرق تقليل نسبة الراجع وتحسين التوصيل**\n- 📊 **التسعير وإدارة الهيكل المالي بالدينار العراقي**\n\nكيف أستطيع مساعدتك اليوم؟ اختر سؤالاً سريعاً أو اكتب مشكلتك التجارية بالأسفل:",
      timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vipUpgradeInput, setVipUpgradeInput] = useState("");
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && isVip) {
      scrollToBottom();
    }
  }, [messages, isOpen, isVip]);

  const handleVipUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);
    setUpgradeSuccessMsg(null);

    const trimmed = vipUpgradeInput.trim();
    if (!trimmed) {
      setUpgradeError("الرجاء إدخال رمز VIP للمتابعة.");
      return;
    }

    const normalizedInput = normalizeCode(trimmed);
    if (!normalizedInput.includes("#vip")) {
      setUpgradeError("الرمز المدخل لا يتضمن صلاحية VIP (يجب أن يحتوي على #vip).");
      return;
    }

    const validCodes = getAllValidCodes();
    const isValid = validCodes.includes(normalizedInput);

    if (isValid) {
      setUpgradeSuccessMsg("تم تفعيل حساب VIP بنجاح! جاري فتح المستشار الذكي...");
      localStorage.setItem("sales_guide_user_code", trimmed);
      setTimeout(() => {
        if (onUpgradeSuccess) {
          onUpgradeSuccess(trimmed);
        }
      }, 1000);
    } else {
      setUpgradeError("رمز VIP المدخل غير موجود في قائمة كلمات المرور المعتمد.");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      // Build past history
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));
      historyPayload.push({ role: "user", text: text });

      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = data.details ? ` (${data.details})` : "";
        throw new Error((data.error || "Failed to fetch response") + errorDetails);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply || "عذراً، حدث خطأ أثناء معالجة الطلب.",
        timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("AI Advisor error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: `⚠️ ${err.message || "عذراً، تعذر الاتصال بالمستشار الذكي في هذه اللحظة. يرجى التأكد من تشغيل السيرفر وإضافة GEMINI_API_KEY."}`,
        timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm("هل أنت تأكد من مسح محادثة المستشار الذكي؟")) {
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          text: "تم مسح المحادثة. يمكنك بدء سؤال جديد الآن 💡",
          timestamp: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl h-[100dvh] sm:h-[85vh] bg-[#040B24] border-0 sm:border border-[#D4A017]/40 rounded-none sm:rounded-3xl shadow-[0_25px_70px_rgba(212,160,23,0.25)] flex flex-col overflow-hidden text-white dir-rtl touch-pan-y"
          >
            {/* Mobile Drag Down Bar Indicator */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-1 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Top Metallic Gold Header */}
            <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#0F1735] via-[#0A122E] to-[#040B24] border-b border-[#D4A017]/30 flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D4A017] to-amber-600 p-[1px] shadow-lg shadow-[#D4A017]/20 flex items-center justify-center">
                    <div className="w-full h-full bg-[#040B24] rounded-[11px] sm:rounded-[15px] flex items-center justify-center text-[#F0C040]">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  {isVip ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-[#040B24] rounded-full animate-ping" />
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-amber-500 border-2 border-[#040B24] rounded-full flex items-center justify-center text-[8px]">🔒</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-lg font-black text-white tracking-wide">
                      فيزيون بوت <span className="text-[#F0C040] text-[10px] sm:text-xs font-mono font-normal hidden sm:inline">| Vizion AI Advisor</span>
                    </h3>
                    {isVip ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-[#D4A017]/20 text-[#F0C040] border border-[#D4A017]/40 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> VIP نشط
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" /> حصري لـ VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/60 font-light mt-0.5 line-clamp-1">
                    {isVip ? "مستشارك التجاري الذكي المخصص للسوق العراقي" : "ميزة مساعد الذكاء الاصطناعي تتطلب حساب VIP"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isVip && (
                  <button
                    onClick={handleClearHistory}
                    title="مسح السجل"
                    className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IF NOT VIP: Render VIP Restricted Screen */}
            {!isVip ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24] space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#D4A017] via-amber-500 to-amber-700 p-[2px] shadow-[0_0_40px_rgba(212,160,23,0.35)] flex items-center justify-center">
                    <div className="w-full h-full bg-[#040B24] rounded-[22px] flex items-center justify-center text-[#F0C040]">
                      <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0C040] animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute -bottom-2 -right-2 p-2 bg-[#040B24] border border-[#D4A017] rounded-full text-[#F0C040]">
                    <Lock className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-3 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-xs font-bold text-[#F0C040]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ميزة خاصة بأعضاء VIP فقط</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    مستشار الذكاء الاصطناعي (فيزيون بوت) غير متاح لحسابك
                  </h3>
                </div>

                {/* VIP Code Entry / Upgrade Form */}
                <form onSubmit={handleVipUpgrade} className="w-full max-w-md bg-[#0F1735] p-5 sm:p-6 rounded-2xl border border-[#D4A017]/30 space-y-4 shadow-xl">
                  <div className="text-right space-y-1">
                    <label className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#F0C040]" />
                      <span>هل تمتلك رمز دخول VIP؟ أدخله للترقية الفورية:</span>
                    </label>
                    <p className="text-[10px] text-white/50">أدخل رمز المرور الخاص بك الذي ينتهي بـ #vip للوصول للذكاء الاصطناعي.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={vipUpgradeInput}
                      onChange={(e) => setVipUpgradeInput(e.target.value)}
                      placeholder=""
                      className="flex-1 px-4 py-3 bg-[#040B24] border border-white/15 rounded-xl text-white text-sm placeholder-white/30 font-mono focus:border-[#D4A017] outline-none text-center sm:text-right"
                    />

                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-black text-xs sm:text-sm shadow-lg shadow-[#D4A017]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      تفعيل VIP ⚡
                    </button>
                  </div>

                  {upgradeError && (
                    <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2 text-right">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{upgradeError}</span>
                    </div>
                  )}

                  {upgradeSuccessMsg && (
                    <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 text-right">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{upgradeSuccessMsg}</span>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <>

          {/* Quick Prompt Bar */}
          <div className="px-2.5 py-2 sm:px-4 sm:py-3 bg-[#081030] border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-[#F0C040] whitespace-nowrap flex items-center gap-1 pl-1.5 border-l border-white/10 shrink-0">
              <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F0C040]" /> أسئلة شائعة:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-[#D4A017]/20 border border-white/10 hover:border-[#D4A017]/40 text-[11px] sm:text-xs text-white/80 hover:text-white transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span>{qp.icon}</span>
                <span>{qp.title}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-[#040B24] via-[#081030] to-[#040B24]">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 sm:gap-3 max-w-[95%] sm:max-w-[82%] ${
                  msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.role === "user" ? (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-[#D4A017] flex items-center justify-center text-[#040B24] font-black text-[10px] sm:text-xs shadow-md">
                      أنت
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#0F1735] border border-[#D4A017]/50 flex items-center justify-center text-[#F0C040] shadow-md">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                </div>

                {/* Message Box */}
                <div className="group relative">
                  <div
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#D4A017] to-amber-600 text-[#040B24] font-medium shadow-lg shadow-[#D4A017]/10 rounded-tl-none"
                        : "bg-[#0F1735]/90 border border-white/10 text-white/90 shadow-xl rounded-tr-none backdrop-blur-sm"
                    }`}
                  >
                    {/* Render message text with simple line breaks & bold formatting */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text.split("\n").map((line, lIdx) => {
                        // Render bold text safely
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lIdx} className={line.startsWith("- ") || line.startsWith("• ") ? "my-0.5 pl-1.5" : "my-0.5"}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                  <strong key={pIdx} className={msg.role === "user" ? "font-black text-[#040B24]" : "text-[#F0C040] font-black"}>
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    <div className={`mt-1.5 text-[9px] sm:text-[10px] flex items-center justify-between ${msg.role === "user" ? "text-[#040B24]/70 font-mono" : "text-white/40 font-mono"}`}>
                      <span>{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#F0C040] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-[80%] ml-auto"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#0F1735] border border-[#D4A017]/50 flex items-center justify-center text-[#F0C040] shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0F1735]/90 border border-[#D4A017]/30 text-white/80 rounded-tr-none flex items-center gap-2">
                  <span className="text-xs text-[#F0C040] font-bold">فيزيون بوت يفكر ويحلل...</span>
                  <div className="flex gap-1 items-center mr-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4A017] animate-ping" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4A017] animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4A017] animate-pulse delay-200" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-2.5 sm:p-4 bg-[#081030] border-t border-[#D4A017]/20 relative shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اسأل فيزيون بوت..."
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#040B24] border border-white/10 focus:border-[#D4A017] text-white text-xs sm:text-sm placeholder-white/40 outline-none transition-all dir-rtl disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D4A017] to-amber-500 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4A017]/20 active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>إرسال</span>
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-1.5 sm:mt-2.5 flex justify-between items-center px-1 text-[9px] sm:text-[11px] text-white/40">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4A017]" /> معتمد للسوق العراقي
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px]">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F0C040]" /> Gemini 3.6
              </span>
            </div>
          </div>
          </>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
