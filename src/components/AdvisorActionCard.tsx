import React, { useState } from "react";
import {
  BookOpen,
  Wrench,
  Copy,
  Check,
  Bookmark,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  AdvisorActionConfig,
  getAdvisorActionForTopic,
  resolveAdvisorActionFromContent,
  isValidChapterId,
  isValidToolId,
  saveRecommendationToStorage,
  addRecommendationTo7DayPlanStorage,
  trackAdvisorAction,
} from "../utils/advisorActionMapper";

export const ADVISOR_FEEDBACK_REASONS = [
  "عام وغير مخصص للسوق العراقي",
  "الحسبة بالدينار أو كروة التوصيل غير دقيقة",
  "السكريبت غير مقنع للزبون العراقي",
  "أريد خطوات وتفاصيل عملية أكثر",
  "مو مرتبط بسؤالي المباشر",
];

export interface AdvisorActionCardProps {
  topicId?: string;
  responseText?: string;
  scriptText?: string;
  customRelevanceReason?: string;
  userCode?: string;
  recommendedChapterId?: string;
  recommendedChapterTitle?: string;
  recommendedToolId?: string;
  recommendedToolTitle?: string;
  followUpActions?: Array<{
    label: string;
    prompt: string;
  }>;
  onExecutePrompt?: (prompt: string) => void;
  feedback?: {
    rating?: "helpful" | "unhelpful";
    reason?: string;
    onRate?: (rating: "helpful" | "unhelpful") => void;
    onSelectReason?: (reason: string) => void;
  };
  onCopyFull?: () => void;
  isFullCopied?: boolean;
  onNavigateChapter?: (chapterId: string) => void;
  onNavigateTool?: (toolId: string, category?: string) => void;
  onShowToast?: (type: "copy" | "saved" | "plan" | "navigate", title: string, description?: string) => void;
  className?: string;
  compact?: boolean;
}

export const AdvisorActionCard: React.FC<AdvisorActionCardProps> = ({
  topicId,
  responseText = "",
  scriptText,
  customRelevanceReason,
  userCode,
  recommendedChapterId,
  recommendedChapterTitle,
  recommendedToolId,
  recommendedToolTitle,
  followUpActions,
  onExecutePrompt,
  feedback,
  onCopyFull,
  isFullCopied = false,
  onNavigateChapter,
  onNavigateTool,
  onShowToast,
  className = "",
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedFullLocal, setCopiedFullLocal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  // Resolve base action config
  const actionConfig: AdvisorActionConfig = topicId
    ? getAdvisorActionForTopic(topicId)
    : resolveAdvisorActionFromContent(responseText || scriptText || "");

  // Prioritize explicit recommendations from Structured Diagnosis if valid
  const effectiveChapterId = (recommendedChapterId && isValidChapterId(recommendedChapterId))
    ? recommendedChapterId
    : actionConfig.chapterId;
  const effectiveChapterTitle = recommendedChapterTitle || actionConfig.chapterTitleAr || "الفصل الموصى به";
  const hasValidChapter = isValidChapterId(effectiveChapterId);

  const effectiveToolId = (recommendedToolId && isValidToolId(recommendedToolId))
    ? recommendedToolId
    : actionConfig.toolId;
  const effectiveToolTitle = recommendedToolTitle || actionConfig.toolTitleAr || "الأداة الموصى بها";
  const hasValidTool = isValidToolId(effectiveToolId);

  // Check if response contains an applicable script
  const hasScript = Boolean(
    scriptText ||
    responseText.includes("💬") ||
    responseText.includes("📞") ||
    responseText.includes("السكربت") ||
    responseText.includes("السكريبت")
  );

  const relevanceLabel = customRelevanceReason || actionConfig.relevanceReasonAr;

  // Handlers
  const handleCopyScript = () => {
    const textToCopy = scriptText || responseText;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopiedScript(true);
    trackAdvisorAction("copy_script", actionConfig.topicId);

    if (onShowToast) {
      onShowToast(
        "copy",
        "تم نسخ السكريبت بنجاح! 📋",
        "تكدر الآن لصقه وإرساله للزبون مباشرة."
      );
    }
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyFull = () => {
    if (onCopyFull) {
      onCopyFull();
      return;
    }
    const textToCopy = responseText || scriptText || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFullLocal(true);
    if (onShowToast) {
      onShowToast(
        "copy",
        "تم نسخ نص الإجابة كاملاً 📋",
        "تم حفظ محتوى التوصية في الحافظة."
      );
    }
    setTimeout(() => setCopiedFullLocal(false), 2500);
  };

  const isFullCopiedState = isFullCopied || copiedFullLocal;

  const handleSaveRecommendation = () => {
    const title = actionConfig.topicNameAr || "توصية من مستشار فيزيون";
    const res = saveRecommendationToStorage(
      {
        title,
        reason: relevanceLabel,
        text: responseText || scriptText || "",
        topicId: actionConfig.topicId,
        chapterId: hasValidChapter ? effectiveChapterId : undefined,
        chapterTitle: effectiveChapterTitle,
        toolId: hasValidTool ? effectiveToolId : undefined,
        toolTitle: effectiveToolTitle,
        script: scriptText,
      },
      userCode
    );

    if (res.success) {
      setSaved(true);
      trackAdvisorAction("save_recommendation", actionConfig.topicId);

      if (onShowToast) {
        onShowToast(
          "saved",
          "تم حفظ التوصية بنجاح 💾",
          "تمت إضافة هذه التوصية إلى سجل توصياتك المحفوظة للرجوع إليها بأي وقت."
        );
      }
    }
  };

  const handleAddToPlan = () => {
    const title = actionConfig.topicNameAr || "توصية المستشار الذكي";
    const details =
      actionConfig.defaultTaskForPlan ||
      (responseText ? responseText.slice(0, 140) + "..." : "تطبيق توصية مستشار فيزيون الذكي.");

    const res = addRecommendationTo7DayPlanStorage(
      {
        title,
        details,
        topicId: actionConfig.topicId,
        toolId: hasValidTool ? effectiveToolId : undefined,
        chapterId: hasValidChapter ? effectiveChapterId : undefined,
      },
      userCode
    );

    if (res.success) {
      setAddedToPlan(true);
      trackAdvisorAction("add_to_plan", actionConfig.topicId);

      if (onShowToast) {
        onShowToast(
          "plan",
          "تمت الإضافة لخطة 7 أيام 📅",
          "ستظهر هذه المهمة ضمن خطتك التنفيذية الأسبوعية لمتابعة إنجازها."
        );
      }
    }
  };

  const handleOpenTool = () => {
    if (!hasValidTool || !effectiveToolId) return;
    trackAdvisorAction("open_tool", effectiveToolId);

    if (onShowToast) {
      onShowToast(
        "navigate",
        `جاري فتح ${effectiveToolTitle} 🛠️`,
        "تم حفظ جلسة المستشار الذكي وتكدر العودة إليها في أي وقت."
      );
    }

    if (onNavigateTool) {
      onNavigateTool(effectiveToolId, actionConfig.toolCategory);
    }
  };

  const handleOpenChapter = () => {
    if (!hasValidChapter || !effectiveChapterId) return;
    trackAdvisorAction("open_chapter", effectiveChapterId);

    if (onShowToast) {
      onShowToast(
        "navigate",
        `جاري فتح ${effectiveChapterTitle} 📖`,
        "تم حفظ محادثتك مع المستشار الذكي تلقائياً."
      );
    }

    if (onNavigateChapter) {
      onNavigateChapter(effectiveChapterId);
    }
  };

  // Determine ONE Primary Action:
  // Priority 1: Interactive Tool -> "افتح الأداة: ..."
  // Priority 2: In-depth Chapter -> "راجع الفصل: ..."
  // Priority 3: Ready Script -> "انسخ السكريبت"
  // Priority 4: 7-Day Plan -> "أضفها لخطة 7 أيام"
  const primaryType: "tool" | "chapter" | "script" | "plan" = hasValidTool
    ? "tool"
    : hasValidChapter
    ? "chapter"
    : hasScript
    ? "script"
    : "plan";

  // Determine relevant secondary actions
  const hasSecondaryActions = true;

  return (
    <div
      className={`rounded-2xl bg-[#060D26] border border-white/10 p-3.5 sm:p-4 text-slate-100 dir-rtl space-y-3 ${className}`}
      data-testid="advisor-action-card"
    >
      {/* 1. Subtle relevance indicator */}
      {relevanceLabel && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F0C040]">
            <Sparkles className="w-3.5 h-3.5 text-[#F0C040] shrink-0" />
            <span>الخطوة التالية الموصى بها:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {relevanceLabel}
          </p>
        </div>
      )}

      {/* 2. One Primary Next Action (The ONLY Gold Button on the card) */}
      <div className="pt-0.5">
        {primaryType === "tool" && (
          <button             type="button"
            onClick={handleOpenTool}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 active:bg-amber-500 text-[#040B24] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            title={`افتح الأداة: ${effectiveToolTitle}`}
          >
            <span className="flex items-center gap-2 text-right">
              <Wrench className="w-4 h-4 text-[#040B24] shrink-0" />
              <span>افتح الأداة: {effectiveToolTitle}</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-[#040B24] shrink-0" />
          </button>
        )}

        {primaryType === "chapter" && (
          <button             type="button"
            onClick={handleOpenChapter}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 active:bg-amber-500 text-[#040B24] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            title={`راجع الفصل: ${effectiveChapterTitle}`}
          >
            <span className="flex items-center gap-2 text-right">
              <BookOpen className="w-4 h-4 text-[#040B24] shrink-0" />
              <span>راجع الفصل: {effectiveChapterTitle}</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-[#040B24] shrink-0" />
          </button>
        )}

        {primaryType === "script" && (
          <button             type="button"
            onClick={handleCopyScript}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 active:bg-amber-500 text-[#040B24] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            title="انسخ السكريبت الجاهز للتطبيق"
          >
            <span className="flex items-center gap-2 text-right">
              {copiedScript ? <Check className="w-4 h-4 text-[#040B24] shrink-0" /> : <Copy className="w-4 h-4 text-[#040B24] shrink-0" />}
              <span>{copiedScript ? "تم نسخ السكريبت بنجاح ✓" : "انسخ السكريبت الجاهز للتطبيق"}</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-[#040B24] shrink-0" />
          </button>
        )}

        {primaryType === "plan" && (
          <button             type="button"
            onClick={handleAddToPlan}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 active:bg-amber-500 text-[#040B24] text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            title="أضفها لخطة 7 أيام"
          >
            <span className="flex items-center gap-2 text-right">
              {addedToPlan ? <CheckCircle2 className="w-4 h-4 text-[#040B24] shrink-0" /> : <Calendar className="w-4 h-4 text-[#040B24] shrink-0" />}
              <span>{addedToPlan ? "مضافة لخطة 7 أيام ✓" : "أضفها لخطة 7 أيام"}</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-[#040B24] shrink-0" />
          </button>
        )}
      </div>

      {/* 3. “خيارات إضافية” button & disclosure (min-h-[44px], accessible toggle) */}
      {hasSecondaryActions && (
        <div>
          <button             type="button"
            onClick={() => setShowSecondary(!showSecondary)}
            aria-expanded={showSecondary}
            aria-controls="advisor-secondary-actions"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 border border-white/10 text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          >
            <span>خيارات إضافية</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                showSecondary ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSecondary && (
            <div
              id="advisor-secondary-actions"
              className="mt-2 pt-2 border-t border-white/10 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {/* Secondary: Save recommendation */}
              <button                 type="button"
                onClick={handleSaveRecommendation}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ saved ? "bg-amber-950/40 border-amber-500/40 text-amber-300" : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
              >
                <span className="flex items-center gap-2 text-right">
                  <Bookmark className={`w-4 h-4 text-amber-400 shrink-0 ${saved ? "fill-amber-400" : ""}`} />
                  <span>{saved ? "تم حفظ التوصية في سجلك ✓" : "حفظ التوصية في سجلك"}</span>
                </span>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Secondary: Open Chapter if not primary */}
              {primaryType !== "chapter" && hasValidChapter && (
                <button                   type="button"
                  onClick={handleOpenChapter}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24] active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-2 text-right">
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>راجع الفصل: {effectiveChapterTitle}</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Secondary: Open Tool if not primary */}
              {primaryType !== "tool" && hasValidTool && (
                <button                   type="button"
                  onClick={handleOpenTool}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24] active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-2 text-right">
                    <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>افتح الأداة: {effectiveToolTitle}</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Secondary: Add to 7-Day Plan if not primary */}
              {primaryType !== "plan" && (
                <button                   type="button"
                  onClick={handleAddToPlan}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ addedToPlan ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                >
                  <span className="flex items-center gap-2 text-right">
                    {addedToPlan ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{addedToPlan ? "مضافة لخطة 7 أيام ✓" : "أضفها لخطة 7 أيام"}</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Secondary: Copy response */}
              <button                 type="button"
                onClick={handleCopyFull}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ isFullCopiedState ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
              >
                <span className="flex items-center gap-2 text-right">
                  {isFullCopiedState ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span>{isFullCopiedState ? "تم نسخ الإجابة بنجاح ✓" : "نسخ نص الإجابة كاملاً"}</span>
                </span>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Secondary: Copy Script if not primary */}
              {hasScript && primaryType !== "script" && (
                <button                   type="button"
                  onClick={handleCopyScript}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ copiedScript ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                >
                  <span className="flex items-center gap-2 text-right">
                    {copiedScript ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{copiedScript ? "تم نسخ السكريبت بنجاح ✓" : "نسخ السكريبت الجاهز للتطبيق"}</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Secondary: Follow-up action prompts */}
              {followUpActions && followUpActions.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-[11px] text-slate-400 block font-medium">متابعات وأسئلة سريعة:</span>
                  <div className="flex flex-col gap-1.5">
                    {followUpActions.map((action, idx) => (
                      <button                         key={idx}
                        type="button"
                        onClick={() => onExecutePrompt?.(action.prompt)}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] text-right focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                      >
                        <span>{action.label}</span>
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary: Feedback controls (Compact and secondary) */}
              {feedback && feedback.onRate && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] text-slate-400 block font-medium">تقييم جودة الإجابة:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button                       type="button"
                      onClick={() => feedback.onRate?.("helpful")}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ feedback.rating === "helpful" ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 font-bold" : "bg-white/5 hover:bg-emerald-500/10 border-white/10 text-slate-300 hover:text-emerald-300" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                    >
                      <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>إجابة مفيدة</span>
                    </button>

                    <button                       type="button"
                      onClick={() => feedback.onRate?.("unhelpful")}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer min-h-[44px] ${ feedback.rating === "unhelpful" ? "bg-rose-950/50 border-rose-500/50 text-rose-300 font-bold" : "bg-white/5 hover:bg-rose-500/10 border-white/10 text-slate-300 hover:text-rose-300" } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                    >
                      <ThumbsDown className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>إجابة غير مفيدة</span>
                    </button>
                  </div>

                  {feedback.rating === "unhelpful" && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-lg space-y-1.5 animate-in fade-in">
                      <span className="text-[11px] text-rose-300 font-bold block">
                        {feedback.reason ? `السبب المسجل: ${feedback.reason}` : "ما هو السبب لتحسين الإجابة؟"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ADVISOR_FEEDBACK_REASONS.map((reason) => (
                          <button                             key={reason}
                            type="button"
                            onClick={() => feedback.onSelectReason?.(reason)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] ${ feedback.reason === reason ? "bg-rose-500/30 border-rose-400 text-white font-bold" : "bg-white/5 border-white/10 text-rose-200/90 hover:bg-white/10 hover:text-white" } focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
