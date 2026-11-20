import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  MessageSquareHeart,
  Send,
  X
} from "lucide-react";

export const IRAQI_MARKET_FEEDBACK_REASONS = [
  { id: "generic_iraqi", label: "الإجابة عامة وما تراعي خصوصية السوق العراقي" },
  { id: "pricing_delivery", label: "الحساب بالدينار أو كلفة التوصيل مو دقيق" },
  { id: "script_unconvincing", label: "نص المحادثة مو مقنع للزبون العراقي" },
  { id: "need_more_steps", label: "أحتاج خطوات وتفاصيل عملية أكثر" },
  { id: "unrelated", label: "الإجابة مو مرتبطة بسؤالي بشكل مباشر" },
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
    onRate("helpful", "إجابة مفيدة وتناسب واقع السوق العراقي");
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
    onRate("unhelpful", currentReason || "ملاحظة خاصة", customText.trim());
    setShowCustomInput(false);
    setCustomText("");
  };

  return (
    <div className="mt-2 text-xs dir-rtl select-none" data-testid={`feedback-bar-${messageId}`}>
      {/* three quiet icons under the answer, no labels to read */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleThumbsUp}
          title="الجواب فادني"
          aria-label="الجواب فادني"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            currentRating === "helpful" ? "text-emerald-300 bg-emerald-500/15" : "text-white/45 hover:text-emerald-300 hover:bg-white/[0.06]"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${currentRating === "helpful" ? "fill-emerald-400" : ""}`} />
        </button>
        <button
          type="button"
          onClick={handleThumbsDown}
          title="الجواب يحتاج تعديل"
          aria-label="الجواب يحتاج تعديل"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
            currentRating === "unhelpful" ? "text-rose-300 bg-rose-500/15" : "text-white/45 hover:text-rose-300 hover:bg-white/[0.06]"
          }`}
        >
          <ThumbsDown className={`w-4 h-4 ${currentRating === "unhelpful" ? "fill-rose-400" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onCopy}
          title={isCopied ? "انتسخ" : "انسخ الجواب"}
          aria-label={isCopied ? "انتسخ" : "انسخ الجواب"}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            isCopied ? "text-vz-accent bg-white/10" : "text-white/45 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {currentRating === "helpful" && (
        <div className="mt-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>عاشت إيدك، وصلنا تقييمك وراح يساعدنا نطور المستشار</span>
          </div>
        </div>
      )}

      {currentRating === "unhelpful" && isPickerExpanded && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#040c2a] border border-rose-500/30 text-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-rose-300 font-bold text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <MessageSquareHeart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>شنو اللي ناقص بالإجابة حتى نخليها أنسب لواقع السوق العراقي؟</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {IRAQI_MARKET_FEEDBACK_REASONS.map((r) => {
              const isSelected = currentReason === r.label;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectReason(r.label)}
                  className={`px-2.5 py-1.5 rounded-lg text-right text-[11px] sm:text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer min-h-[36px] active:scale-[0.97] ${
                    isSelected
                      ? "bg-rose-500/30 border-rose-400 text-white font-bold shadow-sm"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="leading-snug">{r.label}</span>
                </button>
              );
            })}
          </div>

          {!showCustomInput ? (
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-[11px] text-vz-accent hover:text-vz-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ إضافة ملاحظة أو تفاصيل ثانية</span>
              </button>
              {currentReason && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  انحفظ: {currentReason}
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
                  placeholder="اكتب ملاحظتك حتى نحسن الإجابة وتناسب السوق العراقي..."
                  className="flex-1 px-3 py-1.5 bg-black/35 border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:border-white/35 outline-none"
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
              <span className="text-white/50 block text-[10px]">ملاحظتك:</span>
              <p className="italic">{currentCustomNote}</p>
            </div>
          )}
        </div>
      )}

      {currentRating === "unhelpful" && !isPickerExpanded && (
        <div className="mt-2 p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] sm:text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <span>
              وصلت ملاحظتك {currentReason ? `(${currentReason})` : ""}. سنعمل على تحسين جودة الإجابة
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
