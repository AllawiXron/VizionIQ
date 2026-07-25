/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { decisionTreesList } from "../data/decisionTreesData";
import { DecisionTreeNode, DiagnosticResult } from "../types";
import { Compass, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Zap, Lightbulb, FileText, Wrench } from "lucide-react";

export default function DecisionTreeViewer() {
  const [currentTree, setCurrentTree] = useState<DecisionTreeNode>(decisionTreesList[0]);
  const [selectedResult, setSelectedResult] = useState<DiagnosticResult | null>(null);

  const handleSelectOption = (option: typeof currentTree.options[0]) => {
    if (option.result) {
      setSelectedResult(option.result);
    }
  };

  const handleReset = () => {
    setSelectedResult(null);
  };

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>محرك تشخيص الأعطال التفاعلي • Decision Trees</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            شجرة القرارات والتشخيص الجذري للاختناقات
          </h3>
        </div>

        {selectedResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة التشخيص</span>
          </button>
        )}
      </div>

      {/* QUESTION STEP STATE */}
      {!selectedResult ? (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-3">
            <h4 className="text-xl md:text-2xl font-black text-white leading-relaxed">
              {currentTree.question}
            </h4>
            <p className="text-xs md:text-sm text-white/60">
              {currentTree.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTree.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-white/10 hover:border-[#D4A017]/60 p-6 rounded-3xl text-right transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Zap className="w-4 h-4 text-white/30 group-hover:text-[#F0C040] transition-colors" />
                </div>
                <h5 className="text-sm md:text-base font-bold text-white group-hover:text-[#F0C040] transition-colors">
                  {opt.label}
                </h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* DIAGNOSTIC RESULT STATE */
        <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
          
          {/* Result Card Header */}
          <div className={`p-6 md:p-8 rounded-3xl border ${
            selectedResult.severity === "critical"
              ? "bg-red-950/30 border-red-500/40 text-red-200"
              : "bg-amber-950/30 border-amber-500/40 text-amber-200"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10">
                تشخيص الخلل: {selectedResult.severity === "critical" ? "عطل حاد يتطلب تدخلاً فورياً" : "عطل متوسط"}
              </span>
            </div>
            <h4 className="text-2xl md:text-3xl font-black text-white mb-2">
              {selectedResult.title}
            </h4>
            <p className="text-xs md:text-sm leading-relaxed text-white/80">
              <strong className="text-[#F0C040]">السبب الجذري:</strong> {selectedResult.rootCause}
            </p>
          </div>

          {/* Action Plan Grid */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
            <h5 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>الخطة العلاجية الدقيقة (Step-by-step Fix):</span>
            </h5>

            <div className="space-y-3">
              {selectedResult.exactActionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs md:text-sm text-white/90">
                  <span className="w-5 h-5 rounded-full bg-[#D4A017] text-[#040B24] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Tool & Swipe Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#D4A017]/15 to-transparent border border-[#D4A017]/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/60 block font-bold">الأداة الموصى بها في الحزمة:</span>
                <span className="text-xs font-bold text-[#F0C040]">{selectedResult.recommendedTool}</span>
              </div>
              <Wrench className="w-5 h-5 text-[#F0C040]" />
            </div>

            {selectedResult.relatedSwipeFileId && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-white/60 block font-bold">السكريبت الجاهز للنسخ:</span>
                  <span className="text-xs font-bold text-white">متوفر في قسم Swipe Files</span>
                </div>
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
