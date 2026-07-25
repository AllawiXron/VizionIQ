/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { scenarioChallengesList } from "../data/scenariosData";
import { ScenarioChallenge } from "../types";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, HelpCircle, RefreshCw, Trophy } from "lucide-react";

export default function ScenarioQuizModal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentScenario = scenarioChallengesList[currentIndex];

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (hasAnswered) return;
    setSelectedOptionId(optId);
    setHasAnswered(true);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < scenarioChallengesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setHasAnswered(false);
    setScore(0);
  };

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl space-y-6 sm:space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>تحديات السيناريوهات الواقعية • Scenario Challenges</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            اختبارات اتخاذ القرار والتكتيك بالسوق
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 font-bold">النتيجة: {score} / {scenarioChallengesList.length}</span>
          <button
            onClick={handleReset}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs cursor-pointer"
            title="إعادة الاختبار"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SCENARIO CARD */}
      <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Scenario Background */}
        <div className="bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F0C040] text-xs font-bold">
              المستوى: {currentScenario.difficulty}
            </span>
            <span className="text-xs text-white/50 font-mono">تحدي {currentIndex + 1} من {scenarioChallengesList.length}</span>
          </div>

          <h4 className="text-xl md:text-2xl font-black text-white">
            {currentScenario.title}
          </h4>

          <p className="text-xs md:text-sm text-white/80 leading-relaxed">
            {currentScenario.scenarioDescription}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-white/70 font-mono">
              <strong>الميزانية المتاحة:</strong> {currentScenario.budget}
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-white/70 font-mono">
              <strong>المقاييس الحالية:</strong> {currentScenario.metricsGiven}
            </div>
          </div>
        </div>

        {/* Question */}
        <h5 className="text-base font-bold text-[#F0C040]">
          {currentScenario.question}
        </h5>

        {/* Options */}
        <div className="space-y-3">
          {currentScenario.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const showCorrect = hasAnswered && opt.isCorrect;
            const showWrong = hasAnswered && isSelected && !opt.isCorrect;

            return (
              <div key={opt.id} className="space-y-2">
                <button
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                  disabled={hasAnswered}
                  className={`w-full p-5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    showCorrect
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                      : showWrong
                      ? "bg-red-950/60 border-red-500 text-red-200"
                      : isSelected
                      ? "bg-[#D4A017]/20 border-[#D4A017] text-white"
                      : "bg-white/5 border-white/10 hover:border-white/30 text-white/90"
                  }`}
                >
                  <span className="text-xs md:text-sm font-bold leading-relaxed">{opt.label}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  {showWrong && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                </button>

                {/* Feedback Explanation */}
                {hasAnswered && (isSelected || opt.isCorrect) && (
                  <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                    opt.isCorrect ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200" : "bg-red-950/40 border-red-500/30 text-red-200"
                  }`}>
                    {opt.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Scenario Button */}
        {hasAnswered && currentIndex < scenarioChallengesList.length - 1 && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-[#D4A017] hover:bg-amber-400 text-[#040B24] font-black rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl"
          >
            <span>التحدي التالي</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        )}

      </div>

    </div>
  );
}
