/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Shield, Plus, Ban, Check, RefreshCw, Key, FileSpreadsheet, Users } from "lucide-react";
import { AccessCode } from "../types";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCodesChange?: () => void;
}

export default function AdminPanel({ isOpen, onClose, onCodesChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"codes" | "add" | "actions">("codes");
  const [codes, setCodes] = useState<AccessCode[]>([]);
  
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

  useEffect(() => {
    if (isOpen) {
      loadCodes();
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen]);

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
      setErrorMessage("يرجى إدخال اسم المشتري أو الجهة المستفيدة.");
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
      setErrorMessage(`كود الدخول [${finalCode}] مستخدم بالفعل! يرجى اختيار رمز آخر.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#040B24] border border-[#D4A017]/30 rounded-2xl overflow-hidden shadow-2xl glass-panel-gold max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#0D1B56]/50">
          <div className="flex items-center gap-2.5 text-[#F0C040]">
            <Shield className="w-5 h-5 text-[#F0C040]" />
            <span className="font-extrabold text-base md:text-lg">بوابة التحكم الإدارية للأعضاء والأكواد</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-white/[0.02] border-b border-white/5 text-center">
          <div className="bg-white/5 border border-white/5 rounded-xl py-2 px-3">
            <span className="text-[10px] text-white/50 block font-semibold">إجمالي الأكواد</span>
            <span className="text-lg font-bold text-white block mt-0.5">{totalCodes}</span>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl py-2 px-3">
            <span className="text-[10px] text-emerald-400 block font-semibold">الأكواد الفعالة</span>
            <span className="text-lg font-bold text-emerald-400 block mt-0.5">{activeCodes}</span>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl py-2 px-3">
            <span className="text-[10px] text-red-400 block font-semibold">الملغية / الموقوفة</span>
            <span className="text-lg font-bold text-red-400 block mt-0.5">{revokedCodes}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 bg-black/25">
          <button
            onClick={() => setActiveTab("codes")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "codes"
                ? "border-[#D4A017] text-[#F0C040] bg-white/[0.02]"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            📋 قائمة الأكواد الحالية
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "add"
                ? "border-[#D4A017] text-[#F0C040] bg-white/[0.02]"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            ➕ إضافة مشترك ومشتري جديد
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-4">
          
          {/* TAB 1: CODES REGISTRY */}
          {activeTab === "codes" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-white/50 pb-1">
                <span>سجل الأكواد الصالحة والملغاة للدليل</span>
                <span>ترتيب الأحدث أولاً</span>
              </div>

              {codes.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  لا توجد أكواد دخول حالية مسجلة بالنظام. يرجى إضافة كود جديد.
                </div>
              ) : (
                <div className="space-y-2">
                  {codes.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        item.isRevoked
                          ? "bg-red-950/15 border-red-900/30 text-white/40"
                          : "bg-white/[0.02] border-white/5 text-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm select-all px-2 py-0.5 rounded ${
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
                        <div className="text-[11px] text-white/60 flex items-center gap-1">
                          <span className="font-semibold text-white/80">{item.buyerName || "بدون اسم"}</span>
                          <span>· تاريخ التسجيل: {item.dateAdded}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRevoke(item.code)}
                          className={`p-1.5 rounded-lg border transition-all text-xs cursor-pointer flex items-center gap-1 ${
                            item.isRevoked
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                          }`}
                          title={item.isRevoked ? "تفعيل الكود مجدداً" : "تعطيل الكود وإلغاء الدخول"}
                        >
                          {item.isRevoked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          <span>{item.isRevoked ? "تفعيل" : "إلغاء"}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCode(item.code)}
                          className="p-1.5 bg-white/5 hover:bg-red-500/15 hover:border-red-500/40 text-white/60 hover:text-red-300 rounded-lg border border-white/10 transition-all text-xs cursor-pointer"
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
                💡 يمكنك توليد كود دخول ذهبي تلقائي للمشتركين الذين اشتروا الدليل يدوياً أو ترغب بمنحهم وصولاً خاصاً.
              </div>

              {/* Input Buyer Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-semibold block">اسم المشتري / الجهة المستفيدة (مثال: علي الرافدين):</label>
                <input
                  type="text"
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  placeholder="أدخل الاسم الثلاثي للمشتري..."
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#D4A017]"
                />
              </div>

              {/* Input Custom Code */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/70 font-semibold block">رمز كود الوصول الاختياري (أو اتركه فارغاً لتوليد كود تلقائي):</label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="مثال: ali#gold (أحرف إنجليزية وأرقام فقط)"
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#D4A017]"
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
              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-gradient-bg text-[#040B24] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-transform shadow-lg shadow-[#D4A017]/25"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء وتوثيق كود الوصول الجديد</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 text-center text-[10px] text-white/40">
          تذكر: جميع الأكواد تحفظ محلياً بالكامل بالمتصفح، ولا يتم إرسالها لأي خادم بعيد لتأمين الخصوصية الكاملة.
        </div>

      </div>
    </div>
  );
}
