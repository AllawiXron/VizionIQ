import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  MessageSquareHeart,
  Send,
  X,
  RotateCcw
} from "lucide-react";

export const IRAQI_MARKET_FEEDBACK_REASONS = [
  { id: "generic_iraqi", label: "عام وغير مخصص للسوق العراقي", icon: "🇮🇶" },
  { id: "pricing_delivery", label: "الحسبة بالدينار أو كروة التوصيل غير دقيقة", icon: "💰" },
  { id: "script_unconvincing", label: "السكريبت غير مقنع للزبون العراقي", icon: "💬" },
  { id: "need_more_steps", label: "أريد خطوات وتفاصيل عملية أكثر", icon: "⚡" },
  { id: "unrelated", label: "مو مرتبط بسؤالي المباشر", icon: "🎯" },
];

export interface MessageFeedbackData {
  rating: "helpful" | "unhelpful";
  reason?: string;
  customNote?: string;
  timestamp?: string;
}

interface AdvisorMessageFeedbackBarProps {
  messageId: string;
  feedback?: MessageFeedbackData;
  onRate: (rating: "helpful" | "unhelpful", reason?: string, customNote?: string) => void;
  onClearFeedback?: () => void;
  onCopy: () => void;
  isCopied: boolean;
  timestamp?: string;
}

export const AdvisorMessageFeedbackBar: React.FC<AdvisorMessageFeedbackBarProps> = ({
  messageId,
  feedback,
  onRate,
  onClearFeedback,
  onCopy,
  isCopied,
  timestamp,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);

  const currentRating = feedback?.rating;
  const currentReason = feedback?.reason;
  const currentCustomNote = feedback?.customNote;

  const handleThumbsUp = () => {
    onRate("helpful", "إجابة مفيدة ومناسبة لواقع السوق العراقي");
    setIsPickerExpanded(false);
    setShowCustomInput(false);
  };

  const handleThumbsDown = () => {
    setIsPickerExpanded(true);
    if (currentRating !== "unhelpful") {
      onRate("unhelpful");
    }
  };

  const handleSelectReason = (reasonLabel: string) => {
    onRate("unhelpful", reasonLabel, customText || currentCustomNote);
  };

  const handleSubmitCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onRate("unhelpful", currentReason || "ملاحظة مخصصة", customText.trim());
    setShowCustomInput(false);
    setCustomText("");
  };

  return (
    <div className="mt-2.5 pt-2 border-t border-white/10 text-xs dir-rtl select-none" data-testid={`feedback-bar-${messageId}`}>
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Rating & Copy Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] text-white/50 hidden sm:inline ml-1 font-medium">
            هل الجواب مفيد؟
          </span>

          {/* Thumbs Up Button */}
          <button
            type="button"
            onClick={handleThumbsUp}
            title="إجابة مفيدة وعملية بالسوق العراقي"
            aria-label="إجابة مفيدة"
            className={`px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] sm:min-h-[34px] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              currentRating === "helpful"
                ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400/40"
                : "bg-white/5 hover:bg-emerald-500/15 border-white/10 text-white/70 hover:text-emerald-300"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${currentRating === "helpful" ? "fill-emerald-400 text-emerald-400" : ""}`} />
            <span>مفيد</span>
          </button>

          {/* Thumbs Down Button */}
          <button
            type="button"
            onClick={handleThumbsDown}
            title="تحتاج تحسين أو غير دقيقة"
            aria-label="تحتاج تحسين"
            className={`px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] sm:min-h-[34px] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              currentRating === "unhelpful"
                ? "bg-rose-500/25 border-rose-400 text-rose-300 shadow-sm ring-1 ring-rose-400/40"
                : "bg-white/5 hover:bg-rose-500/15 border-white/10 text-white/70 hover:text-rose-300"
            }`}
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${currentRating === "unhelpful" ? "fill-rose-400 text-rose-400" : ""}`} />
            <span>يحتاج تحسين</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={onCopy}
            title="نسخ نص الإجابة كاملاً"
            aria-label="نسخ الرد"
            className={`px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] sm:min-h-[34px] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] ${
              isCopied
                ? "bg-amber-500/20 border-amber-400 text-amber-300"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-bold">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white/60" />
                <span>نسخ الرد</span>
              </>
            )}
          </button>
        </div>

        {/* Timestamp & Reset feedback option */}
        <div className="flex items-center gap-2 mr-auto text-white/40 font-mono text-[10px]">
          {currentRating && (
            <button
              type="button"
              onClick={() => {
                onClearFeedback?.();
                setIsPickerExpanded(false);
                setShowCustomInput(false);
              }}
              title="إعادة تعيين التقييم"
              className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تعديل</span>
            </button>
          )}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>

      {/* Helpful Status Banner */}
      {currentRating === "helpful" && (
        <div className="mt-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>عاشت إيدك! تم تسجيل تقييمك لمساعدتنا في تطوير المستشار للسوق العراقي 👍</span>
          </div>
        </div>
      )}

      {/* Unhelpful Reasons Picker (Tailored to Iraqi Market) */}
      {currentRating === "unhelpful" && isPickerExpanded && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#03081E] border border-rose-500/30 text-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-rose-300 font-bold text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <MessageSquareHeart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>شنو النقص بالإجابة حتى نطورها لواقع السوق العراقي؟</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPickerExpanded(false)}
              className="text-white/40 hover:text-white/90 p-0.5 rounded transition"
              title="إخفاء الخيارات"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fast Iraqi Market Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {IRAQI_MARKET_FEEDBACK_REASONS.map((r) => {
              const isSelected = currentReason === r.label;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectReason(r.label)}
                  className={`px-2.5 py-1.5 rounded-lg text-right text-[11px] sm:text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer min-h-[36px] active:scale-95 ${
                    isSelected
                      ? "bg-rose-500/30 border-rose-400 text-white font-bold shadow-sm"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-sm shrink-0">{r.icon}</span>
                  <span className="leading-snug">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Note Toggle & Form */}
          {!showCustomInput ? (
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-[11px] text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ إضافة ملاحظة أو تفاصيل أخرى</span>
              </button>
              {currentReason && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  تم الحفظ: {currentReason}
                </span>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitCustomNote} className="pt-1.5 space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="اكتب ملاحظتك لتحسين الإجابة للسوق العراقي..."
                  className="flex-1 px-3 py-1.5 bg-[#081030] border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:border-[#D4A017] outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <span>إرسال</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {currentCustomNote && (
            <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white/80">
              <span className="text-white/50 block text-[10px]">ملاحظتك المكتوبة:</span>
              <p className="italic">{currentCustomNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Unhelpful collapsed summary if reason chosen but picker hidden */}
      {currentRating === "unhelpful" && !isPickerExpanded && (
        <div className="mt-2 p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] sm:text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400">✍️</span>
            <span>
              تم تسجيل ملاحظتك {currentReason ? `(${currentReason})` : ""}. سنعمل على تحسين جودة الإجابة!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPickerExpanded(true)}
            className="text-[10px] text-rose-300 hover:text-white underline cursor-pointer"
          >
            تعديل الملاحظة
          </button>
        </div>
      )}
    </div>
  );
};
