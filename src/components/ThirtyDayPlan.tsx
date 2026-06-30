/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Calendar, Award, RotateCcw, ChevronRight, Zap } from "lucide-react";
import { defaultDays } from "../data/chaptersData";
import { DayTask } from "../types";

export default function ThirtyDayPlan() {
  const [tasks, setTasks] = useState<DayTask[]>([]);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // Initialize tasks from localStorage or defaults
  useEffect(() => {
    const stored = localStorage.getItem("sales_guide_30day_progress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 30) {
          setTasks(parsed);
          return;
        }
      } catch (e) {
        console.error("Error loading progress", e);
      }
    }

    // Set initial default tasks
    const initialTasks: DayTask[] = defaultDays.map(item => ({
      ...item,
      completed: false
    }));
    setTasks(initialTasks);
    localStorage.setItem("sales_guide_30day_progress", JSON.stringify(initialTasks));
  }, []);

  const handleToggleComplete = (dayNum: number) => {
    const updated = tasks.map(t => {
      if (t.day === dayNum) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem("sales_guide_30day_progress", JSON.stringify(updated));
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في إعادة ضبط تقدم خطة الـ ٣٠ يوماً كلياً؟")) {
      const resetTasks = tasks.map(t => ({ ...t, completed: false }));
      setTasks(resetTasks);
      localStorage.setItem("sales_guide_30day_progress", JSON.stringify(resetTasks));
      setSelectedDayNum(1);
      setActiveWeek(1);
    }
  };

  // Compute stats
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const selectedTask = tasks.find(t => t.day === selectedDayNum);

  // Helper to get week number for a day (1-7 = W1, 8-14 = W2, 15-21 = W3, 22-30 = W4)
  const getWeekForDay = (day: number) => {
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  // Filter tasks for active week
  const filteredTasks = tasks.filter(t => getWeekForDay(t.day) === activeWeek);

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8 shadow-2xl relative" id="thirty-day-plan">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4A017] to-[#F0C040] flex items-center justify-center text-[#040B24] shadow-md shadow-[#D4A017]/25">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-black text-white">📅 امشِ على خطة يومية واضحة مصممة حتى تساعدك توصل لأول 100 طلب بمشروعك</h3>
            <p className="text-[10px] sm:text-xs text-white/50 mt-1">توقف عن العشوائية في العمل! اتبع هذا المسار اليومي المؤسس على واقع السوق العراقي</p>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تصفير الخطة</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#D4A017]" />
        
        <div className="space-y-1.5 w-full md:max-w-[65%]">
          <div className="flex justify-between items-center text-xs font-bold text-white">
            <span className="flex items-center gap-1.5 text-[#F0C040]">
              <Award className="w-4 h-4" />
              معدل الإنجاز الإجمالي: {progressPercent}%
            </span>
            <span className="font-mono text-white/60">{completedCount} من أصل ٣٠ يوماً منجزة</span>
          </div>

          {/* Progress bar container */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-[2px]">
            <div
              className="h-full rounded-full gold-gradient-bg transition-all duration-500 ease-out shadow shadow-[#D4A017]/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-[#D4A017]/10 flex items-center justify-center text-lg">
            {progressPercent === 100 ? "🏆" : progressPercent >= 70 ? "🔥" : progressPercent >= 30 ? "🚀" : "🌱"}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">مستوى الإمبراطورية الحالي:</span>
            <span className="text-[11px] text-[#F0C040] font-medium block">
              {progressPercent === 100
                ? "خبير مبيعات معتمد - جاهز للانطلاق والتحليق!"
                : progressPercent >= 70
                ? "مستوى تشغيل متقدم ومبيعات ممتازة"
                : progressPercent >= 30
                ? "مستوى تأسيس وإعلانات نشطة"
                : "تأسيس ودراسة السوق الأولى"}
            </span>
          </div>
        </div>
      </div>

      {/* Week Selector tabs */}
      <div className="flex justify-start gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-white/5">
        {[1, 2, 3, 4].map(w => (
          <button
            key={w}
            onClick={() => setActiveWeek(w)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeWeek === w
                ? "bg-[#D4A017] text-[#040B24] shadow-md shadow-[#D4A017]/25"
                : "bg-white/5 border border-white/5 hover:bg-white/10 text-white/80"
            }`}
          >
            {w === 1 && "الأسبوع الأول: التأسيس والدراسة"}
            {w === 2 && "الأسبوع الثاني: الإعلانات والتأكيد"}
            {w === 3 && "الأسبوع الثالث: التوسع والأتمتة"}
            {w === 4 && "الأسبوع الرابع: القيادة والأرباح الصافية"}
          </button>
        ))}
      </div>

      {/* Grid: Day boxes vs Day description panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Days grid layout (6 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-semibold text-white/60 block mr-1">📅 اضغط على اليوم للاطلاع وتعديل الحالة:</span>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredTasks.map(t => {
              const isSelected = t.day === selectedDayNum;
              return (
                <div
                  key={t.day}
                  onClick={() => setSelectedDayNum(t.day)}
                  className={`p-3.5 rounded-xl border text-center relative transition-all cursor-pointer flex flex-col justify-between items-center group min-h-[90px] ${
                    isSelected
                      ? "border-[#D4A017] bg-[#D4A017]/10"
                      : t.completed
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  {/* Badge corner */}
                  {t.completed && (
                    <span className="absolute top-1.5 right-1.5 text-emerald-400 font-bold text-[10px]">
                      ✓
                    </span>
                  )}

                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-[#F0C040]" : "text-white/40"}`}>
                    اليوم {t.day}
                  </span>

                  <p className={`text-xs font-bold mt-1 line-clamp-2 leading-relaxed ${isSelected ? "text-[#F0C040]" : t.completed ? "text-emerald-300" : "text-white/90"}`}>
                    {t.title}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(t.day);
                    }}
                    className="mt-2 text-white/40 hover:text-[#F0C040] transition-colors"
                  >
                    {t.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-white/30 hover:text-white/60" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (5 columns) */}
        <div className="lg:col-span-5">
          {selectedTask ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4A017]/5 rounded-full blur-xl pointer-events-none" />

              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs bg-[#D4A017]/10 text-[#F0C040] border border-[#D4A017]/30 px-2.5 py-1 rounded-full font-bold">
                    جدول أعمال اليوم {selectedTask.day}
                  </span>

                  <button
                    onClick={() => handleToggleComplete(selectedTask.day)}
                    className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      selectedTask.completed
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                    }`}
                  >
                    {selectedTask.completed ? "مكتمل" : "تعليم كمنجز"}
                  </button>
                </div>

                <h4 className="text-base font-extrabold text-white leading-relaxed">
                  {selectedTask.title}
                </h4>

                <div className="space-y-2.5 text-xs text-white/80 leading-relaxed">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[#F0C040] font-bold block mb-1">🎯 المهمة المطلوبة:</span>
                    <p className="font-medium text-white/90">{selectedTask.task}</p>
                  </div>

                  <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-white/50 font-bold block mb-1">💡 نصيحة التنفيذ:</span>
                    <p className="font-light text-white/70">{selectedTask.details}</p>
                  </div>
                </div>
              </div>

              {/* Progress tips footer */}
              <div className="border-t border-white/5 pt-3 flex items-center gap-2 text-[11px] text-white/40 mt-4">
                <Zap className="w-4 h-4 text-[#F0C040] shrink-0" />
                <span>قم بتنفيذ المهام يوماً بيوم والتزام الصبر للوصول للهدف.</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex items-center justify-center text-center h-full">
              <span className="text-xs text-white/40">يرجى تحديد يوم من الجدول لاستعراض تفاصيله الإدارية.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
