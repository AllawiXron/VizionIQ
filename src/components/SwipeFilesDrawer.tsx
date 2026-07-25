/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { swipeFilesList } from "../data/swipeFilesData";
import { SwipeFile } from "../types";
import { FolderDown, Copy, Check, Search, Download, FileText, MessageSquare, PhoneCall, CheckSquare } from "lucide-react";

export default function SwipeFilesDrawer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "الكل (جميع الملفات)" },
    { id: "ad_copy", label: "نصوص الإعلانات (Ad Copy)" },
    { id: "whatsapp_script", label: "سكريبتات الواتساب" },
    { id: "confirmation_call", label: "مكالمة تأكيد الطلب" },
    { id: "product_page", label: "قوالب صفحات المنتجات" },
    { id: "checklist", label: "قوائم الفحص والخطط" }
  ];

  const filteredFiles = swipeFilesList.filter((sf) => {
    const matchesCategory = selectedCategory === "all" || sf.category === selectedCategory;
    const matchesSearch = sf.title.includes(searchTerm) || sf.content.includes(searchTerm) || sf.description.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTxt = (file: SwipeFile) => {
    const element = document.createElement("a");
    const fileBlob = new Blob([`${file.title}\n\n${file.description}\n\n---\n\n${file.content}`], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-[#0A122E] border border-[#D4A017]/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl space-y-6 sm:space-y-8 text-right">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#F0C040] text-xs font-bold mb-2">
            <FolderDown className="w-3.5 h-3.5" />
            <span>خزانة الموارد وسوايب فايلز • Swipe Files & Templates</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            ملفات السوايب الجاهزة للنسخ والاستخدام الفوري
          </h3>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث في السكريبتات والنصوص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#D4A017] rounded-xl px-4 py-2 pr-9 text-xs text-white placeholder-white/40 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-white/40 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? "bg-[#D4A017] text-[#040B24] border-[#D4A017] font-black"
                : "bg-white/5 text-white/70 hover:text-white border-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FILES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFiles.map((sf) => (
          <div
            key={sf.id}
            className="bg-gradient-to-br from-[#0F1735] to-[#040B24] border border-white/10 hover:border-[#D4A017]/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#F0C040] font-bold">
                  {sf.category}
                </span>
                {sf.dialect && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    لهجة: {sf.dialect}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white leading-snug">
                {sf.title}
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {sf.description}
              </p>

              {/* Code/Text Container */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white/90 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap dir-rtl no-scrollbar">
                {sf.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => handleCopy(sf.content, sf.id)}
                className="flex-1 py-2.5 bg-[#D4A017] hover:bg-amber-400 text-[#040B24] font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                {copiedId === sf.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ النص للذاكرة</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadTxt(sf)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all"
                title="تنزيل كملف نصي .txt"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
