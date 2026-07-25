/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { caseStudiesList } from "../data/caseStudiesData";
import { CaseStudy } from "../types";
import { Award, MapPin, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, Sparkles, MessageSquare } from "lucide-react";
import FadeInUp from "./FadeInUp";

export default function CaseStudySection() {
  const [selectedCity, setSelectedCity] = useState<string>("جميع المحافظات");
  const [expandedId, setExpandedId] = useState<string | null>(caseStudiesList[0].id);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const cities = ["جميع المحافظات", "بغداد", "البصرة", "أربيل", "النجف وكربلاء", "الموصل"];

  const filteredCaseStudies = selectedCity === "جميع المحافظات"
    ? caseStudiesList
    : caseStudiesList.filter((cs) => cs.city.includes(selectedCity));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>تفكيك التجارب الناجحة • 5-10 Case Studies عراقية</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            دراسات حالة تفصيلية من سوق العراق الفعلي
          </h3>
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedCity === city
                  ? "bg-[#D4A017] text-[#040B24] border-[#D4A017] font-black"
                  : "bg-white/5 text-white/70 hover:text-white border-white/10"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* CASE STUDIES LIST */}
      <div className="space-y-6">
        {filteredCaseStudies.map((cs, idx) => {
          const isExpanded = expandedId === cs.id;
          return (
            <FadeInUp key={cs.id} delay={idx * 0.08}>
              <div
                className="bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-white/10 hover:border-[#D4A017]/40 rounded-3xl overflow-hidden transition-all shadow-lg"
              >
              {/* Card Title Banner (Toggle Header) */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : cs.id)}
                className="w-full p-6 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F0C040] text-[10px] font-bold">
                      {cs.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/60">
                      <MapPin className="w-3 h-3 text-[#D4A017]" />
                      {cs.city}
                    </span>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-white">
                    {cs.title}
                  </h4>
                  <p className="text-xs text-white/50">{cs.businessName}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end text-emerald-400 font-mono font-bold text-xs">
                    <span>ROAS: {cs.afterMetrics.roas}</span>
                    <span className="text-white/60 font-normal">{cs.afterMetrics.dailyOrders}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* EXPANDED CONTENT DETAILS */}
              {isExpanded && (
                <div className="p-6 md:p-8 border-t border-white/10 space-y-6 bg-black/20 animate-[fadeIn_0.3s_ease-out]">
                  
                  {/* Before vs After Metrics Comparison */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <div>
                      <span className="text-[10px] text-white/50 block font-bold">عائد الإعلانات ROAS</span>
                      <span className="text-xs text-red-400 line-through font-mono ml-1">{cs.beforeMetrics.roas}</span>
                      <span className="text-sm text-emerald-400 font-bold font-mono">{cs.afterMetrics.roas}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block font-bold">كلفة الطلب CPA</span>
                      <span className="text-xs text-red-400 line-through font-mono ml-1">{cs.beforeMetrics.cpa}</span>
                      <span className="text-sm text-emerald-400 font-bold font-mono">{cs.afterMetrics.cpa}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block font-bold">نسبة المرتجع الراجع</span>
                      <span className="text-xs text-red-400 line-through font-mono ml-1">{cs.beforeMetrics.returnRate}</span>
                      <span className="text-sm text-emerald-400 font-bold font-mono">{cs.afterMetrics.returnRate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block font-bold">الطلبات اليومية</span>
                      <span className="text-xs text-red-400 line-through font-mono ml-1">{cs.beforeMetrics.dailyOrders}</span>
                      <span className="text-sm text-emerald-400 font-bold font-mono">{cs.afterMetrics.dailyOrders}</span>
                    </div>
                  </div>

                  {/* Problem & Psychology */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-red-400 block">⚠️ التحدي والمشكلة السابقة:</span>
                      <p className="text-xs text-white/80 leading-relaxed">{cs.theProblem}</p>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block">💡 السيكولوجية والحل المطبق:</span>
                      <p className="text-xs text-white/80 leading-relaxed">{cs.thePsychology}</p>
                    </div>
                  </div>

                  {/* Offer Stack */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#F0C040]">حزمة العرض المركب (Offer Stack):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cs.theOfferStack.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs text-white/90">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ad Creative Hook */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-xs font-bold text-[#F0C040] block">🎬 الخطاف الإعلاني الفائز (Hook):</span>
                    <p className="text-xs text-white/80 font-mono leading-relaxed">{cs.adCreativeHook}</p>
                  </div>

                  {/* WhatsApp Script snippet with Copy Button */}
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>مقتطف سكريبت الواتساب الحقيقي:</span>
                      </span>

                      <button
                        onClick={() => handleCopy(cs.whatsappScriptSnippet, cs.id)}
                        className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedScript === cs.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ السكريبت</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-emerald-100 font-mono leading-relaxed dir-rtl">{cs.whatsappScriptSnippet}</p>
                  </div>

                  {/* Key Learnings */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-xs font-bold text-white block">📌 أهم الدروس المستفادة:</span>
                    <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
                      {cs.keyLearnings.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          </FadeInUp>
          );
        })}
      </div>

    </div>
  );
}
