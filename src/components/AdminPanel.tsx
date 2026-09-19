/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Shield,
  Plus,
  Ban,
  Check,
  RefreshCw,
  Key,
  FileSpreadsheet,
  Users,
  BarChart3,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import { AccessCode } from "../types";
import {
  getAnalyticsSummary,
  clearAnalyticsData,
  AnalyticsSummary
} from "../lib/analytics";
import {
  runAdvisorEvaluationSuite,
  ADVISOR_EVALUATION_DATASET,
  AdvisorEvaluationSuiteResult
} from "../utils/advisorEvaluator";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCodesChange?: () => void;
}

export default function AdminPanel({ isOpen, onClose, onCodesChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"codes" | "add" | "analytics_eval">("codes");
  const [codes, setCodes] = useState<AccessCode[]>([]);
  
  // Analytics and Evaluation state
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [evalResult, setEvalResult] = useState<AdvisorEvaluationSuiteResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Form states
  const [newBuyerName, setNewBuyerName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCodes = () => {
    const stored = localStorage.getItem("sales_guide_codes");
    if (stored) {
      try {
        setCodes(JSON.parse(stored));
      } catch (e) {
        console.error("Error reading codes in admin panel", e);
      }
    }
  };

  const loadAnalytics = () => {
    setAnalytics(getAnalyticsSummary());
  };

  useEffect(() => {
    if (isOpen) {
      loadCodes();
      loadAnalytics();
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = runAdvisorEvaluationSuite();
      setEvalResult(res);
      setIsEvaluating(false);
    }, 400);
  };

  if (!isOpen) return null;

  const saveCodes = (updatedCodes: AccessCode[]) => {
    setCodes(updatedCodes);
    localStorage.setItem("sales_guide_codes", JSON.stringify(updatedCodes));
    if (onCodesChange) onCodesChange();
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newBuyerName.trim()) {
      setErrorMessage("رجاءً إدخال اسم المشتري أو الجهة المستفيدة.");
      return;
    }

    // Generate code or use custom code
    let finalCode = customCode.trim().toLowerCase();
    if (!finalCode) {
      // Auto-generate ali#1 style or user#random
      const transliterated = newBuyerName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .substring(0, 5);
      
      const randomNum = Math.floor(Math.random() * 900) + 100;
      finalCode = `${transliterated}#${randomNum}`;
    }

    // Check duplicates
    if (codes.some(c => c.code === finalCode)) {
      setErrorMessage(`كود الدخول [${finalCode}] مستخدم بالفعل! رجاءً اختيار رمز آخر.`);
      return;
    }

    const newCodeItem: AccessCode = {
      code: finalCode,
      isRevoked: false,
      buyerName: newBuyerName.trim(),
      dateAdded: new Date().toLocaleDateString("ar-IQ")
    };

    const updated = [newCodeItem, ...codes];
    saveCodes(updated);

    setSuccessMessage(`تم إنشاء كود الدخول للمشترك [${newBuyerName}] بنجاح! الكود: ${finalCode}`);
    setNewBuyerName("");
    setCustomCode("");
  };

  const handleToggleRevoke = (codeToToggle: string) => {
    const updated = codes.map(c => {
      if (c.code === codeToToggle) {
        return { ...c, isRevoked: !c.isRevoked };
      }
      return c;
    });
    saveCodes(updated);
  };

  const handleDeleteCode = (codeToDelete: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الرمز [${codeToDelete}] نهائياً؟`)) {
      const updated = codes.filter(c => c.code !== codeToDelete);
      saveCodes(updated);
    }
  };

  // Stats calculation
  const totalCodes = codes.length;
  const revokedCodes = codes.filter(c => c.isRevoked).length;
  const activeCodes = totalCodes - revokedCodes;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm safe-area-top safe-area-bottom">
          {/* Modal Card */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-[#040B24] border border-[#D4A017]/30 rounded-2xl overflow-hidden shadow-2xl glass-panel-gold max-h-[94dvh] sm:max-h-[90vh] flex flex-col dir-rtl touch-pan-y my-auto"
          >
            {/* Mobile Drag Down Bar Indicator */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-1 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />
            
            {/* Modal Header */}
        <div className="flex justify-between items-center px-3.5 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#0D1B56]/50">
          <div className="flex items-center gap-2 text-[#F0C040] min-w-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0C040] shrink-0" />
            <span className="font-extrabold text-xs sm:text-base md:text-lg truncate">بوابة التحكم بالأعضاء والأكواد</span>
          </div>
          <button             onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 px-2.5 sm:px-6 py-2.5 sm:py-4 bg-white/[0.02] border-b border-white/5 text-center">
          <div className="bg-white/5 border border-white/5 rounded-xl py-1.5 sm:py-2 px-1 sm:px-3">
            <span className="text-[8px] sm:text-[10px] text-white/70 block font-semibold truncate">إجمالي الأكواد</span>
            <span className="text-sm sm:text-lg font-bold text-white block mt-0.5">{totalCodes}</span>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl py-1.5 sm:py-2 px-1 sm:px-3">
            <span className="text-[8px] sm:text-[10px] text-emerald-400 block font-semibold truncate">الأكواد الفعالة</span>
            <span className="text-sm sm:text-lg font-bold text-emerald-400 block mt-0.5">{activeCodes}</span>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl py-1.5 sm:py-2 px-1 sm:px-3">
            <span className="text-[8px] sm:text-[10px] text-red-400 block font-semibold truncate">الملغية والموقوفة</span>
            <span className="text-sm sm:text-lg font-bold text-red-400 block mt-0.5">{revokedCodes}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 bg-black/25 overflow-x-auto no-scrollbar">
          <button             onClick={() => setActiveTab("codes")}
            className={`flex-1 min-w-[90px] py-2 sm:py-3 text-[10px] sm:text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none border-b-2 cursor-pointer whitespace-nowrap px-1 ${ activeTab === "codes" ? "border-[#D4A017] text-[#F0C040] bg-white/[0.02]" : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.01]" } min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            📋 الأكواد
          </button>
          <button             onClick={() => setActiveTab("add")}
            className={`flex-1 min-w-[90px] py-2 sm:py-3 text-[10px] sm:text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none border-b-2 cursor-pointer whitespace-nowrap px-1 ${ activeTab === "add" ? "border-[#D4A017] text-[#F0C040] bg-white/[0.02]" : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.01]" } min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            ➕ إضافة مشترِ
          </button>
          <button             onClick={() => {
              setActiveTab("analytics_eval");
              loadAnalytics();
            }}
            className={`flex-1 min-w-[90px] py-2 sm:py-3 text-[10px] sm:text-xs font-bold transition-all motion-reduce:transition-none motion-reduce:transform-none border-b-2 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap px-1 ${ activeTab === "analytics_eval" ? "border-[#D4A017] text-[#F0C040] bg-white/[0.02]" : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.01]" } min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
          >
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>التحليلات والتقييم</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 no-scrollbar space-y-4">
          
          {/* TAB 1: CODES REGISTRY */}
          {activeTab === "codes" && (
            <div className="space-y-4">
              {/* Quick Export Box */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5 text-right w-full sm:w-auto">
                  <h4 className="text-xs font-bold text-[#F0C040] flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#D4A017]" />
                    <span>تصدير كافة نصوص ومحتوى الموقع بالكامل (JSON)</span>
                  </h4>
                  <p className="text-[10px] text-white/60">
                    تكدر تنزيل ملف شامل لجميع الفصول، الدروس، الدراسات، وسكريبتات السوايب لتعديل الصياغة أو اللهجة.
                  </p>
                </div>
                <a                   href="/all_website_texts.json"
                  download="all_website_texts.json"
                  className="px-4 py-2 bg-[#D4A017] hover:bg-amber-400 text-[#040B24] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-lg transition-all motion-reduce:transition-none motion-reduce:transform-none hover:scale-105 min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تحميل ملف JSON كامل ⚡</span>
                </a>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-xs text-white/70 pb-1">
                <span>سجل الأكواد الصالحة والملغاة</span>
                <span>الأحدث أولاً</span>
              </div>

              {codes.length === 0 ? (
                <div className="py-12 text-center text-white/60 text-xs">
                  ماكو أكواد دخول حالية مسجلة بالنظام. رجاءً إضافة كود جديد.
                </div>
              ) : (
                <div className="space-y-2">
                  {codes.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all motion-reduce:transition-none motion-reduce:transform-none ${
                        item.isRevoked
                          ? "bg-red-950/15 border-red-900/30 text-white/60"
                          : "bg-white/[0.02] border-white/5 text-white"
                      }`}
                    >
                      <div className="space-y-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-xs sm:text-sm select-all px-2 py-0.5 rounded ${
                            item.isRevoked ? "bg-red-950 text-red-400 line-through" : "bg-white/10 text-[#F0C040]"
                          }`}>
                            {item.code}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            item.isRevoked ? "bg-red-950/80 text-red-400" : "bg-emerald-950/80 text-emerald-400"
                          }`}>
                            {item.isRevoked ? "ملغي" : "نشط"}
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/60 flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-white/80">{item.buyerName || "بدون اسم"}</span>
                          <span>· تاريخ التسجيل: {item.dateAdded}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-0 border-white/5 pt-2 sm:pt-0">
                        <button                           onClick={() => handleToggleRevoke(item.code)}
                          className={`px-2.5 py-1.5 rounded-lg border transition-all motion-reduce:transition-none motion-reduce:transform-none text-xs cursor-pointer flex items-center gap-1 ${ item.isRevoked ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]`}
                          title={item.isRevoked ? "تفعيل الكود مجدداً" : "تعطيل الكود وإلغاء الدخول"}
                        >
                          {item.isRevoked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          <span>{item.isRevoked ? "تفعيل" : "إلغاء"}</span>
                        </button>
                        <button                           onClick={() => handleDeleteCode(item.code)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-red-500/15 hover:border-red-500/40 text-white/60 hover:text-red-300 rounded-lg border border-white/10 transition-all motion-reduce:transition-none motion-reduce:transform-none text-xs cursor-pointer min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                          title="حذف نهائي"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW BUYER/CODE */}
          {activeTab === "add" && (
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-2 text-xs text-[#F0C040] leading-relaxed">
                💡 تكدر توليد كود دخول ذهبي تلقائي للمشتركين الذين اشتروا الدليل يدوياً أو ترغب بمنحهم وصولاً خاصاً.
              </div>

              {/* Input Buyer Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-semibold block">اسم المشتري / الجهة المستفيدة (مثال: علي الرافدين):</label>
                <input                   type="text"
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  placeholder="أدخل الاسم الثلاثي للمشتري..."
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A017] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
              </div>

              {/* Input Custom Code */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-semibold block">رمز كود الوصول الاختياري (أو اتركه فارغاً لتوليد كود تلقائي):</label>
                <input                   type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="مثال: ali#gold (أحرف إنجليزية وأرقام فقط)"
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#D4A017] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                />
              </div>

              {/* Error / Success feedback */}
              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  🎉 {successMessage}
                </div>
              )}

              {/* Submit */}
              <button                 type="submit"
                className="w-full py-3 rounded-xl gold-gradient-bg text-[#040B24] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-transform shadow-lg md:shadow-[#D4A017] shadow-xl/25 min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء وتوثيق كود الوصول الجديد</span>
              </button>
            </form>
          )}

          {/* TAB 3: ANALYTICS & QUALITY EVALUATION */}
          {activeTab === "analytics_eval" && (
            <div className="space-y-5">
              {/* Privacy Notice Banner */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">نظام تحليلات وتقييم يحترم الخصوصية 100%</p>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    يتم تسجيل الأحداث الحركية العامة فقط بدون تخزين نصوص الرسائل الخاصة، أرقام هواتف الزبائن، أو مفاتيح API.
                  </p>
                </div>
              </div>

              {/* Feedback Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-white/70 block font-semibold">إجمالي التفاعلات المسجلة</span>
                  <span className="text-lg font-extrabold text-white block mt-0.5">
                    {analytics?.totalEvents || 0}
                  </span>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-white/70 block font-semibold">تقييمات المستشار</span>
                  <span className="text-lg font-extrabold text-[#F0C040] block mt-0.5">
                    {analytics?.feedback.total || 0}
                  </span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-400 block font-semibold flex items-center justify-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>مفيد</span>
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400 block mt-0.5">
                    {analytics?.feedback.helpfulCount || 0}
                  </span>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-rose-400 block font-semibold flex items-center justify-center gap-1">
                    <ThumbsDown className="w-3 h-3" />
                    <span>مو مفيد</span>
                  </span>
                  <span className="text-lg font-extrabold text-rose-400 block mt-0.5">
                    {analytics?.feedback.unhelpfulCount || 0}
                  </span>
                </div>
              </div>

              {/* Unhelpful Reasons Breakdown (if any) */}
              {analytics && Object.keys(analytics.feedback.reasonsBreakdown).length > 0 && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">
                    ملاحظات عدم الرضا الشائعة:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analytics.feedback.reasonsBreakdown).map(([reason, count]) => (
                      <span key={reason} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-medium border border-rose-500/30">
                        {reason}: <strong className="font-bold">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Breakdown Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/80 flex items-center justify-between">
                  <span>سجل استخدام مسارات المنصة:</span>
                  <button                     onClick={() => {
                      clearAnalyticsData();
                      loadAnalytics();
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>تصفير السجل</span>
                  </button>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">زيارة المنصة:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.landing_viewed || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">بدء التشخيص:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.diagnosis_started || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">إكمال التشخيص:</span>
                    <span className="font-bold text-emerald-400 font-mono">{analytics?.eventsByType.diagnosis_completed || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">فصول مفتوحة:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.chapter_opened || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">أدوات نمو مفتوحة:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.tool_opened || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">تمارين منجزة:</span>
                    <span className="font-bold text-amber-400 font-mono">{analytics?.eventsByType.exercise_completed || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">استفسارات المستشار:</span>
                    <span className="font-bold text-[#F0C040] font-mono">{analytics?.eventsByType.advisor_prompt_submitted || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">إجابات مكتملة:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.advisor_answer_completed || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">إجابات منسوخة:</span>
                    <span className="font-bold text-emerald-300 font-mono">{analytics?.eventsByType.advisor_answer_copied || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">توصيات مفتوحة:</span>
                    <span className="font-bold text-white font-mono">{analytics?.eventsByType.advisor_recommendation_opened || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">مهام الخطة المنجزة:</span>
                    <span className="font-bold text-emerald-400 font-mono">{analytics?.eventsByType.plan_step_completed || 0}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-[11px]">خطط مكتملة 100%:</span>
                    <span className="font-bold text-[#F0C040] font-mono">{analytics?.eventsByType.plan_completed || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quality Evaluation Benchmark Suite */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-[#F0C040] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#F0C040]" />
                      <span>مجموعة التقييم المعياري لجودة المستشار (8 حالات & 6 معايير)</span>
                    </h4>
                    <p className="text-[10px] text-white/60">
                      فحص آلي يشمل: التسعير، ضعف التحويل، المرتجع، كفاءة الإعلانات، صفحة الهبوط، سكريبتات الواتساب، الأسئلة الغامضة، وعزل السياقات المتتالية.
                    </p>
                  </div>

                  <button                     onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="px-4 py-2 rounded-xl gold-gradient-bg text-[#040B24] font-black text-xs flex items-center justify-center gap-1.5 shadow-lg md:shadow-[#D4A017] shadow-xl/20 hover:scale-105 active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer disabled:opacity-50 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الفحص...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>تشغيل فحص الجودة الآلي ⚡</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Evaluation Results Display */}
                {evalResult && (
                  <div className="space-y-3 animate-in fade-in">
                    {/* Overall Summary Bar */}
                    <div className="p-3.5 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                          {evalResult.averageScore}%
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            معدل الجودة والامتثال الكلي
                          </span>
                          <span className="text-[11px] text-emerald-300 font-semibold">
                            نجاح {evalResult.passedTests} من أصل {evalResult.totalTests} حالات فحص معيارية ({Math.round((evalResult.passedTests / evalResult.totalTests) * 100)}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-white/70 flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded-lg">
                          تاريخ الفحص: {new Date(evalResult.timestamp).toLocaleTimeString("ar-IQ")}
                        </span>
                      </div>
                    </div>

                    {/* Benchmark Test Cases List */}
                    <div className="space-y-2">
                      {evalResult.reports.map((report) => {
                        const isExpanded = expandedTestId === report.testCaseId;
                        return (
                          <div
                            key={report.testCaseId}
                            className={`rounded-xl border transition-all motion-reduce:transition-none motion-reduce:transform-none overflow-hidden ${
                              report.passedAll
                                ? "bg-white/[0.02] border-white/10"
                                : "bg-rose-950/20 border-rose-500/30"
                            }`}
                          >
                            <button                               onClick={() => setExpandedTestId(isExpanded ? null : report.testCaseId)}
                              className="w-full p-3 flex items-center justify-between text-right cursor-pointer hover:bg-white/5 transition-colors min-h-[44px] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
                            >
                              <div className="flex items-center gap-2.5">
                                {report.passedAll ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {report.titleAr}
                                  </span>
                                  <span className="text-[10px] text-white/70 block font-mono">
                                    {report.category}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                                  report.overallScore >= 90
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}>
                                  {report.overallScore}/100
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-white/60" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-white/60" />
                                )}
                              </div>
                            </button>

                            {/* Detailed Rubric Breakdown */}
                            {isExpanded && (
                              <div className="p-3 bg-black/40 border-t border-white/5 space-y-2 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">1. صلة الموضوع:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.topicRelevance.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.topicRelevance.feedbackAr}</p>
                                  </div>

                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">2. عزل السياق والتلوث:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.noContextContamination.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.noContextContamination.feedbackAr}</p>
                                  </div>

                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">3. الخطوة الإجرائية الواضحة:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.concreteNextAction.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.concreteNextAction.feedbackAr}</p>
                                  </div>

                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">4. صحة الحسابات والأرقام:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.correctCalculations.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.correctCalculations.feedbackAr}</p>
                                  </div>

                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">5. قياس الغموض والاستفسار:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.appropriateUncertainty.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.appropriateUncertainty.feedbackAr}</p>
                                  </div>

                                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white/80">6. اللهجة العراقية المهنية:</span>
                                      <span className="text-emerald-400 font-bold">{report.criteria.iraqiArabicOutput.score}%</span>
                                    </div>
                                    <p className="text-white/60 text-[10px]">{report.criteria.iraqiArabicOutput.feedbackAr}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 text-center text-[10px] text-white/60">
          تذكر: جميع الأكواد تحفظ محلياً بالكامل بالمتصفح، ولا يتم إرسالها لأي خادم بعيد لتأمين الخصوصية الكاملة.
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
