/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PhoneCall, UserCheck, MessageSquare, Copy, Check, Star } from "lucide-react";
import { phoneScripts } from "../data/chaptersData";

export default function ScriptSimulator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeScript = phoneScripts[activeIndex];

  const handleCopy = () => {
    const textToCopy = activeScript.dialog
      .map(d => `${d.speaker}: ${d.text}`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8 shadow-2xl relative" id="script-simulator">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/10 pb-4 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          💬 تدرب على التعامل مع الزبائن وتجرب أكثر من طريقة حتى تعرف أي أسلوب يجيب طلبات أكثر
        </h3>
        <p className="text-xs text-white/50 mt-1">اضغط على نوع المشتري بالجانب لتعلم كيف تحول المتردد والمشوش لعميل حقيقي يدفع كاش بلهجة عراقية محببة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Selectors (4 Columns) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold text-[#F0C040] block">👤 حدد نمط زبونك بالاتصال:</span>
          {phoneScripts.map((script, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setCopied(false);
              }}
              className={`w-full p-4 rounded-xl text-right border transition-all cursor-pointer flex items-center justify-between ${
                activeIndex === idx
                  ? "bg-[#D4A017]/10 border-[#D4A017] text-[#F0C040] shadow-md"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              <div>
                <h4 className="font-bold text-sm">{script.title}</h4>
                <p className="text-[11px] text-white/50 mt-1 line-clamp-1">{script.customerType}</p>
              </div>
              <PhoneCall className={`w-4 h-4 shrink-0 mr-2 ${activeIndex === idx ? "text-[#F0C040]" : "text-white/40"}`} />
            </button>
          ))}

          {/* Golden Standard COD notice */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mt-4">
            <span className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 fill-[#D4A017]" />
              القاعدة المليونية للـ COD:
            </span>
            <p className="text-[11px] text-white/70 leading-relaxed">
              الاتصال السريع بالعميل (في غضون ٣٠ دقيقة بحد أقصى) يزيد من نسبة استلام الطرود بمعدل ٢٥٪ عن المرتجع المتأخر.
            </p>
          </div>
        </div>

        {/* Right Side: Conversation Script Screen (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Title of selected character */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] bg-amber-500/20 text-[#F0C040] px-2 py-0.5 rounded font-bold">{activeScript.title}</span>
              <p className="text-xs text-white/70 mt-1.5 font-medium">{activeScript.description}</p>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النص الكامل</span>
                </>
              )}
            </button>
          </div>

          {/* Styled Dialog Balloon bubbles */}
          <div className="space-y-4 p-5 bg-black/40 rounded-xl border border-white/10 min-h-[220px] flex flex-col justify-center">
            {activeScript.dialog.map((d, dIdx) => {
              const isAgent = d.speaker === "المبيعات";
              return (
                <div
                  key={dIdx}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    isAgent ? "self-start flex-row" : "self-end flex-row-reverse"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow ${
                      isAgent
                        ? "bg-gradient-to-tr from-[#D4A017] to-[#F0C040] text-[#040B24]"
                        : "bg-zinc-700 text-white"
                    }`}
                  >
                    {isAgent ? "🎧" : "👤"}
                  </div>

                  {/* Speech Bubble */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-white/40 block">
                      {isAgent ? "مسؤول تأكيد الطلبات" : "العميل العراقي"}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? "bg-gradient-to-br from-[#1A2B73] to-[#0D1B56] text-white rounded-tr-none border border-[#D4A017]/20"
                          : "bg-zinc-800 text-white/90 rounded-tl-none border border-white/5"
                      }`}
                    >
                      {d.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expert Tip Notice */}
          <div className="p-4 bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-xl">
            <h5 className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-[#F0C040]" />
              💡 نصيحة الخبير الذهبية:
            </h5>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              {activeScript.tip}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
