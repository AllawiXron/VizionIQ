import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  MessageSquare,
  BarChart3,
  BookOpen,
  Copy,
  Check,
  Calendar,
  Calculator,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { StructuredDiagnosticSection } from "../types";
import { parseStructuredAdvisorResponse } from "../utils/diagnosticCalculator";
import { AdvisorActionCard } from "./AdvisorActionCard";

interface StructuredDiagnosticCardProps {
  data?: StructuredDiagnosticSection;
  rawText: string;
  topicId?: string;
  userCode?: string;
  onActionClick: (promptText: string) => void;
  onNavigateChapter?: (chapterId: string) => void;
  onNavigateTool?: (toolId: string, category?: string) => void;
  onShowToast?: (type: "copy" | "saved" | "plan" | "navigate", title: string, description?: string) => void;
  feedback?: {
    rating?: "helpful" | "unhelpful";
    reason?: string;
    onRate?: (rating: "helpful" | "unhelpful") => void;
    onSelectReason?: (reason: string) => void;
  };
  onCopyFull?: () => void;
  isFullCopied?: boolean;
}

export const StructuredDiagnosticCard: React.FC<StructuredDiagnosticCardProps> = ({
  data: passedData,
  rawText,
  topicId,
  userCode,
  onActionClick,
  onNavigateChapter,
  onNavigateTool,
  onShowToast,
  feedback,
  onCopyFull,
  isFullCopied,
}) => {
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const data: StructuredDiagnosticSection = passedData || parseStructuredAdvisorResponse(rawText);

  const handleCopyScript = (script: string) => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    if (onShowToast) {
      onShowToast("copy", "تم نسخ السكربت بنجاح! 📋", "تكدر الآن إرساله للزبون مباشرة.");
    }
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-3.5 my-1 text-slate-100 text-[15px] sm:text-[16px] leading-[1.75] sm:leading-[1.85] break-words [overflow-wrap:anywhere]">

      {/* 1. Diagnosis Overview */}
      {data.diagnosis && (
        <div className="p-3 sm:p-4 rounded-xl bg-[#0F1735]/80 border border-amber-500/25 sm:border-amber-500/30">
          <div className="flex items-center gap-1.5 mb-1.5 text-amber-400 font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>1. التشخيص الشامل لواقع المشروع:</span>
          </div>
          <p className="text-white/90 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
            {data.diagnosis}
          </p>
        </div>
      )}

      {/* 2. Key Metrics Analysis */}
      {data.keyMetrics && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0A122E]/80 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1.5 text-sky-400 font-bold text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 text-sky-400 shrink-0" />
            <span>2. قراءة الأرقام والمؤشرات الحيوية:</span>
          </div>
          <p className="text-white/80 leading-relaxed text-xs whitespace-pre-line">
            {data.keyMetrics}
          </p>
        </div>
      )}

      {/* 3. Probable Causes */}
      {data.probableCauses.length > 0 && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0A122E]/80 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1.5 text-rose-400 font-bold text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>3. الأسباب الجذرية المحتملة:</span>
          </div>
          <ul className="space-y-1 text-xs text-white/80">
            {data.probableCauses.map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. First 3 Steps within 48 Hours */}
      {data.next48HoursSteps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>4. أول 3 خطوات للبدء خلال 48 ساعة:</span>
          </div>
          <div className="space-y-2">
            {data.next48HoursSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20 text-xs text-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Ready-to-use Script / SOP */}
      {data.readyScriptOrSOP && (
        <div className="p-3.5 rounded-xl bg-[#050C22] border border-amber-500/25">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>5. سكربت المحادثة / الإجراء الجاهز للنسخ:</span>
            </div>
            <button               type="button"
              onClick={() => handleCopyScript(data.readyScriptOrSOP)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ السكربت</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-[#030614] rounded-lg border border-white/5 text-[14px] sm:text-[15px] text-amber-100/90 leading-[1.8] font-sans whitespace-pre-line select-all overflow-x-auto max-w-full">
            {data.readyScriptOrSOP}
          </div>
        </div>
      )}

      {/* 6. Metric to Track & 7. Recommended Chapter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.metricToTrack && (
          <div className="p-3 rounded-xl bg-[#060D24] border border-white/10">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>6. المقياس الواجب متابعته:</span>
            </div>
            <p className="text-[14px] text-slate-300 leading-[1.75]">
              {data.metricToTrack}
            </p>
          </div>
        )}

        {data.recommendedChapterOrTool && data.recommendedChapterOrTool.chapterTitle && (
          <div className="p-3 rounded-xl bg-[#060D24] border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
              <BookOpen className="w-4 h-4" />
              <span>7. الفصل المقترح:</span>
            </div>
            <p className="text-[14px] text-slate-300 leading-[1.75]">
              {data.recommendedChapterOrTool.chapterTitle}
            </p>
          </div>
        )}
      </div>

      {/* Optional Clarification Prompt */}
      {data.clarificationQuestion && (
        <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-2.5 text-[14px] text-blue-200 leading-[1.7]">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
          <div>
            <span className="font-bold block mb-0.5 text-xs text-blue-300">سؤال توضيحي من المستشار:</span>
            <span>{data.clarificationQuestion}</span>
          </div>
        </div>
      )}

      {/* Response Action Hierarchy: One primary next action + Secondary actions grouped */}
      <AdvisorActionCard
        topicId={topicId}
        responseText={rawText}
        scriptText={data.readyScriptOrSOP}
        userCode={userCode}
        recommendedChapterId={data.recommendedChapterOrTool?.chapterId}
        recommendedChapterTitle={data.recommendedChapterOrTool?.chapterTitle}
        recommendedToolId={data.recommendedChapterOrTool?.toolId}
        recommendedToolTitle={data.recommendedChapterOrTool?.toolTitle}
        followUpActions={[
          {
            label: "📅 حوّلها إلى خطة 7 أيام",
            prompt: "حوّل هذا التشخيص إلى خطة تنفيذية يومية مفصلة لمدة 7 أيام بالتسلسل.",
          },
          {
            label: "💬 اكتبلي السكربت العراقي",
            prompt: "اكتبلي سكريبت محادثة واتساب كامل وموسع للرد على الزبون العراقي لهذه الحالة بالتحديد.",
          },
          {
            label: "🧮 احسب صافي الربح",
            prompt: "احسبلي صافي الأرباح بالتفصيل بعد خصم كلفة التوصيل 5000 بغداد و7000 محافظات وكلفة الإعلانات ونسبة راجع 15%.",
          },
        ]}
        onExecutePrompt={onActionClick}
        onNavigateChapter={onNavigateChapter}
        onNavigateTool={onNavigateTool}
        onShowToast={onShowToast}
        feedback={feedback}
        onCopyFull={onCopyFull}
        isFullCopied={isFullCopied}
      />
    </div>
  );
};
