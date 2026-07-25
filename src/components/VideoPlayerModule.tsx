/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { videoLessonsList } from "../data/videoLessonsData";
import { VideoLesson } from "../types";
import { BookOpen, Clock, CheckCircle2, Sparkles, Zap, ListOrdered } from "lucide-react";

export default function VideoPlayerModule({ chapterId }: { chapterId?: string }) {
  const filteredVideos = chapterId
    ? videoLessonsList.filter((v) => v.chapterId === chapterId)
    : videoLessonsList;

  const [activeLesson, setActiveLesson] = useState<VideoLesson>(filteredVideos[0] || videoLessonsList[0]);

  if (!activeLesson) return null;

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 text-right dir-rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#F0C040]" />
            <span>موجز الشرح والأدلة التنفيذية • Executive Lesson Guides</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            موجز الدروس التطبيقية والخطوات العملية
          </h3>
        </div>
      </div>

      {/* MAIN LESSON GUIDE VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Display Container */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Visual Hero Header */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `linear-gradient(to top, rgba(4,11,36,0.95) 10%, rgba(4,11,36,0.6) 60%, rgba(4,11,36,0.3) 100%), url(${activeLesson.thumbnailUrl})` }} 
            />
            
            <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="px-3.5 py-1 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs shadow-md">
                  الفصل {activeLesson.chapterNumber}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#F0C040]" />
                  مدة القراءة والتطبيق: {activeLesson.duration}
                </span>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#F0C040] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>دليل الدرس والتسلسل التشغيلي</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white drop-shadow-md leading-snug">
                  {activeLesson.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Lesson Meta Summary & Details */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Executive Summary */}
            <div className="space-y-2">
              <h5 className="text-base font-extrabold text-[#F0C040] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4A017]" />
                <span>ملخص الفكرة الجوهرية للدرس:</span>
              </h5>
              <p className="text-sm text-white/85 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {activeLesson.summary}
              </p>
            </div>

            {/* Timestamps / Topic Roadmap */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-extrabold text-white/90 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#F0C040]" />
                <span>محاور الدرس والتسلسل التنفيذي للفكرة:</span>
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {activeLesson.timestamps.map((ts, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-colors"
                  >
                    <span className="text-xs text-white/90 font-medium">{ts.label}</span>
                    <span className="text-[11px] font-mono text-[#F0C040] bg-[#D4A017]/10 px-2 py-0.5 rounded-md border border-[#D4A017]/20 shrink-0">
                      {ts.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أهم المخرجات والنتائج الذهبية (Key Takeaways):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeLesson.keyTakeaways.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 text-xs text-white/90 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Item Box */}
            <div className="bg-gradient-to-r from-[#D4A017]/15 to-amber-500/5 border border-[#D4A017]/40 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-lg">
              <span className="text-xs font-black text-[#F0C040] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F0C040] animate-pulse" />
                <span>الخطوة العملية والواجب الفوري:</span>
              </span>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">{activeLesson.actionItem}</p>
            </div>

          </div>
        </div>

        {/* Lesson List Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="text-xs font-extrabold text-white/70 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4A017]" />
            <span>دروس وموجزات باقي الفصول:</span>
          </h4>
          
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar">
            {videoLessonsList.map((v) => {
              const isActive = v.id === activeLesson.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveLesson(v)}
                  className={`w-full p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-[#D4A017]/15 border-[#D4A017] text-[#F0C040] shadow-md scale-[1.02]"
                      : "bg-white/[0.03] border-white/5 text-white/80 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/50 block font-mono">الفصل {v.chapterNumber}</span>
                    <h5 className="text-xs font-bold leading-snug">{v.title}</h5>
                  </div>
                  <span className="text-[10px] font-mono text-white/60 bg-black/40 px-2 py-0.5 rounded-md border border-white/10 shrink-0">
                    {v.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
