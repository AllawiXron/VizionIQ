/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import FadeInUp from "./FadeInUp";
import { 
  Search, 
  Sparkles, 
  ThumbsUp, 
  Flame, 
  DollarSign, 
  Megaphone, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  AlertTriangle, 
  Lightbulb, 
  Shuffle, 
  CheckCircle,
  TrendingDown,
  X
} from "lucide-react";

import { Insight, insightsList } from "../data/insightsData";

export default function IraqiInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [randomInsight, setRandomInsight] = useState<Insight | null>(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  // Load votes from localStorage
  useEffect(() => {
    const storedVotes = localStorage.getItem("iraqi_insights_votes");
    if (storedVotes) {
      try {
        setVotes(JSON.parse(storedVotes));
      } catch (e) {
        console.error("Error parsing votes", e);
      }
    } else {
      // Initialize some realistic seed values for votes
      const seedVotes: Record<string, number> = {};
      insightsList.forEach(insight => {
        // Seed value between 14 and 92
        seedVotes[insight.id] = Math.floor(Math.random() * 78) + 14;
      });
      setVotes(seedVotes);
      localStorage.setItem("iraqi_insights_votes", JSON.stringify(seedVotes));
    }
  }, []);

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVotes = { ...votes };
    currentVotes[id] = (currentVotes[id] || 0) + 1;
    setVotes(currentVotes);
    localStorage.setItem("iraqi_insights_votes", JSON.stringify(currentVotes));
  };

  const categories = [
    { id: "all", label: "🎯 الكل", color: "from-blue-500/20 to-indigo-500/20" },
    { id: "ads", label: "📣 الإعلانات", color: "from-amber-500/20 to-amber-600/30" },
    { id: "sales", label: "💬 المبيعات", color: "from-emerald-500/20 to-emerald-600/30" },
    { id: "pricing", label: "💰 التسعير", color: "from-purple-500/20 to-purple-600/30" },
    { id: "content", label: "🎬 المحتوى", color: "from-pink-500/20 to-pink-600/30" },
    { id: "customers", label: "👥 الزبائن", color: "from-cyan-500/20 to-cyan-600/30" },
    { id: "profits", label: "📈 الأرباح", color: "from-blue-500/20 to-blue-600/30" },
    { id: "mistakes", label: "⚠️ الأخطاء الشائعة", color: "from-red-500/20 to-red-600/30" },
    { id: "newbies", label: "🌱 المشاريع الجديدة", color: "from-teal-500/20 to-teal-600/30" }
  ];

  // Filter insights based on Search and Category
  const filteredInsights = insightsList.filter(insight => {
    const matchesSearch = 
      insight.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      insight.lesson.toLowerCase().includes(searchTerm.toLowerCase()) || 
      insight.practicalAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * insightsList.length);
    setRandomInsight(insightsList[randomIndex]);
    setShowRandomModal(true);
  };

  const toggleExpand = (id: string) => {
    if (expandedInsightId === id) {
      setExpandedInsightId(null);
    } else {
      setExpandedInsightId(id);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16 relative">
      
      {/* SECTION HEADER BANNER - Sleek Dark Aesthetic with Gold Accents */}
      <div className="relative rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-14 border border-[#D4A017]/30 bg-gradient-to-br from-[#0F1735]/90 via-[#040B24] to-[#0D1B56]/90 backdrop-blur-2xl overflow-hidden shadow-[0_0_50px_rgba(212,160,23,0.15)] group">
        <div className="absolute top-0 right-0 w-1.5 sm:w-2 h-full bg-gradient-to-b from-[#F0C040] to-[#D4A017]" />
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#D4A017]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#D4A017]/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-[#1A2B73]/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 justify-between relative z-10">
          <div className="space-y-3 sm:space-y-5 text-right max-w-4xl">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4A017]/20 to-[#D4A017]/5 border border-[#D4A017]/40 text-[11px] sm:text-sm text-[#F0C040] font-black tracking-wide shadow-lg">
              <Flame className="w-3.5 h-3.5 text-[#F0C040] fill-[#D4A017]/50" />
              <span>حقائق يكتشفها أغلب التجار بعد ما يخسرون</span>
            </span>
            <div className="border-r-2 border-[#D4A017]/40 pr-3 sm:pr-5">
              <h3 className="text-xl sm:text-3xl md:text-5xl font-black text-white leading-snug sm:leading-tight drop-shadow-lg">
                دروس وعبَر واقعية <br className="hidden md:block"/> من قلب السوق العراقي اليومي
              </h3>
            </div>
            <p className="text-xs sm:text-base text-white/70 font-light leading-relaxed">
              هذه الدروس ليست نظريات كتب تسويقية مترجمة من الغرب، بل هي عصارة مشاهدات وتجارب عملية لملايين الدنانير التي تم صرفها وخسارتها في محافظات العراق لانتزاع أعلى نسب استلام وحماية هوامش الربح الصافية.
            </p>
          </div>
          <div className="flex flex-row md:flex-col gap-3 sm:gap-5 shrink-0 items-center justify-between w-full md:w-auto p-3 sm:p-6 bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-inner">
            <span className="text-3xl sm:text-6xl md:text-7xl filter drop-shadow-[0_0_20px_rgba(212,160,23,0.3)]">💡</span>
            <button
              onClick={handleRandomize}
              className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D4A017] via-[#F0C040] to-[#D4A017] bg-[length:200%_100%] text-[#040B24] font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(212,160,23,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>حقيقة عشوائية 🎲</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-gradient-to-b from-[#0F1735]/60 to-[#040B24]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[2rem] p-3.5 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-5 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="ابحث عن حقيقة، خطأ شائع، أو كلمة تسويقية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 sm:py-3.5 bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/60 focus:bg-white/[0.03] transition-all text-right shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-3 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Counter Display */}
          <span className="text-xs sm:text-sm text-white/60 font-bold bg-white/[0.03] px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 w-full md:w-auto text-center">
            حقائق: <span className="text-[#F0C040] font-mono font-black text-sm sm:text-lg mx-1">{filteredInsights.length}</span> من أصل <span className="font-mono text-white mx-1">{insightsList.length}</span>
          </span>
        </div>

        {/* Categories Pills Grid */}
        <div className="flex overflow-x-auto gap-2 pt-1 pb-1 no-scrollbar justify-start">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = cat.id === "all" 
              ? insightsList.length 
              : insightsList.filter(i => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/5 border-[#D4A017]/50 text-[#F0C040] shadow-[0_5px_15px_rgba(212,160,23,0.15)]"
                    : "bg-gradient-to-b from-white/[0.04] to-transparent border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${isActive ? "bg-[#D4A017] text-[#040B24]" : "bg-white/10 text-white/50"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INSIGHTS GRID LAYOUT - 2 Column Layout with Stunning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
        {filteredInsights.map((insight, index) => {
          const isExpanded = expandedInsightId === insight.id;
          const voteCount = votes[insight.id] || 0;
          
          return (
            <FadeInUp key={insight.id} delay={Math.min(index * 0.05, 0.3)}>
              <div
                onClick={() => toggleExpand(insight.id)}
                className={`group rounded-2xl sm:rounded-[2rem] border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xl h-full ${
                  isExpanded
                    ? "bg-gradient-to-b from-[#0F1735]/95 to-[#040B24] border-[#D4A017]/50 shadow-[0_15px_40px_rgba(212,160,23,0.15)]"
                    : "bg-gradient-to-b from-[#0F1735]/60 to-[#040B24]/90 border-white/10 hover:border-[#D4A017]/30 backdrop-blur-md"
                }`}
              >
              <div className="p-4 sm:p-7 space-y-3 sm:space-y-5">
                
                {/* Card Top Information */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-xl border uppercase tracking-wider shadow-inner ${
                    insight.category === "ads" ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                    insight.category === "sales" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                    insight.category === "pricing" ? "bg-purple-500/10 text-purple-300 border-purple-500/30" :
                    insight.category === "content" ? "bg-pink-500/10 text-pink-300 border-pink-500/30" :
                    insight.category === "customers" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" :
                    insight.category === "profits" ? "bg-blue-500/10 text-blue-300 border-blue-500/30" :
                    insight.category === "mistakes" ? "bg-red-500/10 text-red-300 border-red-500/30" :
                    "bg-teal-500/10 text-teal-300 border-teal-500/30"
                  }`}>
                    {insight.categoryLabel}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white/[0.02] px-2.5 py-1 rounded-xl border border-white/5">
                    <span className="text-[10px] sm:text-[11px] text-white/40 font-mono">الصعوبة:</span>
                    <span className={`text-[10px] sm:text-[11px] font-black ${
                      insight.difficulty === "بسيط" ? "text-emerald-400" :
                      insight.difficulty === "متوسط" ? "text-[#F0C040]" :
                      "text-red-400"
                    }`}>
                      {insight.difficulty}
                    </span>
                  </div>
                </div>

                {/* Insight Quote Text */}
                <div className="text-right border-r-2 border-[#D4A017]/40 pr-3 sm:pr-4 group-hover:border-[#F0C040] transition-colors duration-300">
                  <p className="fluid-prose font-black text-white leading-relaxed group-hover:text-[#F0C040] transition-colors duration-300">
                    "{insight.text}"
                  </p>
                </div>

                {/* EXPANDABLE CORNER (DIAGNOSTIC DETAILED LESSON) */}
                {isExpanded && (
                  <div className="pt-4 border-t border-white/10 space-y-4 text-right animate-[fadeIn_0.3s_ease]">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black text-white/50 block flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-[#F0C040]"/> تحليل الخلل:</span>
                      <p className="fluid-prose text-white/80 font-light pr-3 border-r border-white/10">
                        {insight.lesson}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-gradient-to-br from-[#D4A017]/10 to-transparent border border-[#D4A017]/30 p-4 sm:p-5 rounded-2xl shadow-inner">
                      <span className="text-[11px] font-black text-[#F0C040] block flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400"/> الحل والخطوة العملية:</span>
                      <p className="fluid-prose text-white/95 font-bold">
                        {insight.practicalAction}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer controls */}
              <div className="px-4 sm:px-7 py-3.5 sm:py-4 bg-gradient-to-t from-black/60 to-transparent border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-white/40 mt-auto">
                
                {/* Interactive VOTE button - 'والله هاي صارت وياي' */}
                <button
                  onClick={(e) => handleVote(insight.id, e)}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-b from-white/10 to-white/5 hover:from-[#D4A017]/20 hover:to-[#D4A017]/10 hover:text-[#F0C040] border border-white/10 hover:border-[#D4A017]/40 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 font-bold cursor-pointer active:scale-95 shadow-lg w-full sm:w-auto"
                  title="نعم، لقد واجهت هذا الموقف في مشروعي سابقاً"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#F0C040]" />
                  <span className="text-xs">والله هاي صارت وياي! 🙋‍♂️</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-black bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                    {voteCount}
                  </span>
                </button>

                <span className="text-[11px] font-bold text-[#F0C040]/80 group-hover:text-[#F0C040] transition-colors flex items-center justify-center sm:justify-end gap-1.5 py-1">
                  <span className="drop-shadow-sm">{isExpanded ? "اضغط للإغلاق" : "كشف الحل العملي"}</span>
                  <span className={`transform transition-transform duration-300 text-[10px] ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                </span>
              </div>

            </div>
          </FadeInUp>
          );
        })}
      </div>

      {/* Empty Search Result feedback */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-b from-[#0F1735]/40 to-black/40 border border-white/10 rounded-[2rem] space-y-4 backdrop-blur-sm shadow-xl">
          <span className="text-6xl block drop-shadow-lg">🔍🏜️</span>
          <h4 className="text-lg font-black text-white">لم نجد أي حقيقة تطابق بحثك</h4>
          <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
            جرب كتابة كلمات مختلفة مثل 'إعلان'، 'سعر'، 'مرتجع'، أو اختر تبويب تصنيف آخر أعلاه.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
            className="text-sm text-[#F0C040] font-black hover:text-white transition-colors cursor-pointer mt-4 inline-flex items-center gap-2 border-b border-[#F0C040]/30 hover:border-white pb-1"
          >
            <Shuffle className="w-4 h-4" />
            إعادة تعيين البحث والتصنيف
          </button>
        </div>
      )}

      {/* RANDOM INSIGHT FEATURE MODAL */}
      <AnimatePresence>
        {showRandomModal && randomInsight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  setShowRandomModal(false);
                }
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-[#0F1735] via-[#040B24] to-[#0D1B56] border border-[#D4A017]/50 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-[0_0_80px_rgba(212,160,23,0.15)] text-right space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto touch-pan-y"
            >
              {/* Mobile Drag Down Bar Indicator */}
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto my-1 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />

              <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#F0C040] to-[#D4A017]" />
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#D4A017]/20 rounded-full blur-[80px] pointer-events-none" />
              
              {/* Modal top decor */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6 relative z-10">
              <button
                onClick={() => setShowRandomModal(false)}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer border border-white/5 shadow-inner hover:-translate-y-0.5"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 text-[#F0C040]">
                <Sparkles className="w-6 h-6 animate-pulse-slow" />
                <span className="text-base font-black tracking-wide drop-shadow-md">حقيقة عشوائية مميزة من واقع السوق</span>
              </div>
            </div>

            <div className="space-y-6 pt-2 relative z-10">
              <span className="inline-block px-4 py-1.5 text-xs font-black bg-gradient-to-r from-[#D4A017]/20 to-[#D4A017]/5 text-[#F0C040] border border-[#D4A017]/40 rounded-xl shadow-lg">
                📁 {randomInsight.categoryLabel}
              </span>

              <p className="text-xl md:text-3xl font-black text-white leading-relaxed drop-shadow-lg pr-4 border-r-4 border-[#D4A017]/60">
                "{randomInsight.text}"
              </p>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent my-8" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[12px] font-black text-white/50 block flex items-center gap-1.5"><HelpCircle className="w-4 h-4"/> المشكلة والخلل الخفي:</span>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-light border-r-2 border-white/10 pr-4">
                    {randomInsight.lesson}
                  </p>
                </div>

                <div className="space-y-2 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 p-6 rounded-2xl shadow-inner">
                  <span className="text-[12px] font-black text-emerald-400 block flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> الحل التكتيكي الفوري:</span>
                  <p className="text-sm md:text-base text-white/95 leading-relaxed font-bold">
                    {randomInsight.practicalAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal action footer */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10 relative z-10">
              <button
                onClick={(e) => handleVote(randomInsight.id, e)}
                className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#D4A017]/20 to-transparent hover:from-[#D4A017]/30 text-[#F0C040] border border-[#D4A017]/40 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>والله هاي صارت وياي!</span>
                <span className="font-mono bg-black/40 px-2 py-0.5 rounded-full text-[12px] border border-[#D4A017]/20">
                  {votes[randomInsight.id] || 0}
                </span>
              </button>

              <button
                onClick={handleRandomize}
                className="px-5 py-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent hover:from-white/20 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:-translate-y-0.5 border border-white/10 hover:border-white/30"
              >
                <Shuffle className="w-4 h-4 text-white/80" />
                <span>عشوائي آخر</span>
              </button>
            </div>

          </motion.div>
        </div>
        )}
      </AnimatePresence>

    </div>
  );
}
