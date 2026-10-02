/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collapseMotion, overlayMotion } from "../lib/motion";
import { useOriginSheet } from "../lib/origin";
import { ChipPill, CountUp, ScrollZoom, WordsReveal } from "./ui/Motion";
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
import { isFreeTrialUser } from "./LockScreen";
import { Lock, Crown } from "lucide-react";

export default function IraqiInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [randomInsight, setRandomInsight] = useState<Insight | null>(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  const userCode = typeof window !== "undefined" ? localStorage.getItem("sales_guide_user_code") || "" : "";
  const isFreeTrial = isFreeTrialUser(userCode);

  const triggerUpgradeModal = () => {
    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
  };

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
    { id: "all", label: "🎯 الكل", color: "from-white/10 to-white/10" },
    { id: "ads", label: "📣 الإعلانات", color: "from-white/10 to-white/15" },
    { id: "sales", label: "💬 المبيعات", color: "from-emerald-500/20 to-emerald-600/30" },
    { id: "pricing", label: "💰 التسعير", color: "from-white/10 to-white/15" },
    { id: "content", label: "🎬 المحتوى", color: "from-white/10 to-white/15" },
    { id: "customers", label: "👥 الزبائن", color: "from-white/10 to-white/15" },
    { id: "profits", label: "📈 الأرباح", color: "from-white/10 to-white/15" },
    { id: "mistakes", label: "⚠️ الأخطاء الشائعة", color: "from-red-500/20 to-red-600/30" },
    { id: "newbies", label: "🌱 المشاريع الجديدة", color: "from-white/10 to-white/15" }
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

  // The random-insight sheet grows out of the shuffle button.
  const originSheet = useOriginSheet(showRandomModal, { width: 672 });

  return (
    <div className="space-y-12 md:space-y-16 relative">
      
      {/* SECTION HEADER BANNER — zooms into place as it scrolls in */}
      <ScrollZoom from={0.9}>
      <div className="relative rounded-3xl sm:rounded-4xl p-5 sm:p-8 md:p-14 glass-elevated glass-edge overflow-hidden group">
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-white/45 via-white/10 to-transparent" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 justify-between relative z-10">
          <div className="space-y-3 sm:space-y-5 text-right max-w-4xl">
            <span className="vz-eyebrow text-[11px] sm:text-sm">
              <Flame className="w-3.5 h-3.5 opacity-80" />
              <span>حقائق يكتشفها أغلب التجار بعد ما يخسرون</span>
            </span>
            <div>
              <WordsReveal
                as="h3"
                className="text-xl sm:text-3xl md:text-5xl font-black text-white leading-snug sm:leading-tight"
                segments={["دروس وعبَر واقعية ", { br: "hidden md:block" }, { text: "من قلب السوق العراقي اليومي", className: "vz-silver-text" }]}
              />
            </div>
            <p className="text-xs sm:text-base text-white/70 font-light leading-relaxed">
              هذه الدروس ليست نظريات كتب تسويقية مترجمة من الغرب، بل هي عصارة مشاهدات وتجارب عملية لملايين الدنانير التي تم صرفها وخسارتها في محافظات العراق لانتزاع أعلى نسب استلام وحماية هوامش الربح الصافية.
            </p>
          </div>
          <div className="flex flex-row md:flex-col gap-3 sm:gap-5 shrink-0 items-center justify-between w-full md:w-auto p-4 sm:p-6 glass-subtle rounded-3xl">
            <span className="text-3xl sm:text-6xl md:text-7xl">💡</span>
            <button               onClick={handleRandomize}
              className="btn btn-primary px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>حقيقة عشوائية 🎲</span>
            </button>
          </div>
        </div>
      </div>
      </ScrollZoom>

      {/* FILTER & SEARCH BAR */}
      <div className="glass rounded-3xl sm:rounded-4xl p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-5 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-white/60" />
            <input               type="text"
              placeholder="ابحث عن حقيقة، خطأ شائع، أو كلمة تسويقية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vz-field w-full pl-4 pr-10 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm text-white transition-all motion-reduce:transition-none motion-reduce:transform-none text-right shadow-inner min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            />
            {searchTerm && (
              <button                 onClick={() => setSearchTerm("")}
                className="absolute left-3 top-3 text-white/60 hover:text-white transition-colors min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Counter Display */}
          <span className="text-xs sm:text-sm text-white/55 font-bold glass-subtle px-4 py-2 sm:px-5 sm:py-2.5 rounded-full w-full md:w-auto text-center">
            حقائق: <CountUp value={filteredInsights.length} className="text-white font-mono font-black text-sm sm:text-lg mx-1 inline-block" /> من أصل <span className="font-mono text-white mx-1">{insightsList.length}</span>
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
              <button                 key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                data-active={isActive}
                aria-pressed={isActive}
                className="vz-chip shrink-0 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {isActive && <ChipPill layoutId="insight-category-pill" />}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 rounded-full font-mono font-black ${isActive ? "bg-black/10 text-white" : "bg-white/10 text-white/70"}`}>
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
                className={`group rounded-3xl sm:rounded-4xl overflow-hidden cursor-pointer flex flex-col justify-between h-full glass-interactive ${
                  isExpanded
                    ? "glass-elevated"
                    : "glass"
                }`}
              >
              <div className="p-4 sm:p-7 space-y-3 sm:space-y-5">
                
                {/* Card Top Information */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    insight.category === "ads" ? "bg-white/5 text-vz-accent border-white/14" :
                    insight.category === "sales" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                    insight.category === "pricing" ? "bg-white/5 text-slate-200 border-white/14" :
                    insight.category === "content" ? "bg-white/5 text-slate-200 border-white/14" :
                    insight.category === "customers" ? "bg-white/5 text-slate-200 border-white/14" :
                    insight.category === "profits" ? "bg-white/5 text-slate-200 border-white/14" :
                    insight.category === "mistakes" ? "bg-red-500/10 text-red-300 border-red-500/30" :
                    "bg-white/5 text-slate-200 border-white/14"
                  }`}>
                    {insight.categoryLabel}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
                    <span className="text-[10px] sm:text-[11px] text-white/60 font-mono">الصعوبة:</span>
                    <span className={`text-[10px] sm:text-[11px] font-black ${
                      insight.difficulty === "بسيط" ? "text-emerald-400" :
                      insight.difficulty === "متوسط" ? "text-vz-accent" :
                      "text-red-400"
                    }`}>
                      {insight.difficulty}
                    </span>
                  </div>
                </div>

                {/* Insight Quote Text */}
                <div className="text-right border-r-2 border-white/18 pr-3 sm:pr-4 group-hover:border-white/35 transition-colors duration-300">
                  <p className="fluid-prose font-black text-white leading-relaxed group-hover:text-vz-accent transition-colors duration-300">
                    "{insight.text}"
                  </p>
                </div>

                {/* EXPANDABLE CORNER (DIAGNOSTIC DETAILED LESSON) */}
                <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div key="lesson" {...collapseMotion} className="overflow-hidden">
                  {
                  isFreeTrial && index >= 3 ? (
                    <div className="pt-4 border-t space-y-3 text-center glass p-4 rounded-2xl border">
                      <p className="text-xs text-white/70 blur-[2px] select-none">
                        {insight.lesson}
                      </p>
                      <div className="pt-1">
                        <span className="text-xs font-black text-vz-accent block mb-2">🔒 الحل والخطوات العملية المحمية لهذا الموقف</span>
                        <button                           onClick={(e) => {
                            e.stopPropagation();
                            triggerUpgradeModal();
                          }}
                          className="btn btn-primary px-4 py-2 rounded-xl text-white font-black text-xs inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>ترقية الحساب وكشف الحل الفوري ⚡</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-white/10 space-y-4 text-right animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black text-white/70 block flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-vz-accent"/> تحليل الخلل:</span>
                        <p className="fluid-prose text-white/80 font-light pr-3 border-r border-white/10">
                          {insight.lesson}
                        </p>
                      </div>

                      <div className="space-y-1.5 bg-emerald-400/[0.05] border border-emerald-400/15 p-4 sm:p-5 rounded-2xl">
                        <span className="text-[11px] font-black text-vz-accent block flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400"/> الحل والخطوة العملية:</span>
                        <p className="fluid-prose text-white/95 font-bold">
                          {insight.practicalAction}
                        </p>
                      </div>
                    </div>
                  )}
                  </motion.div>
                )}
                </AnimatePresence>

              </div>

              {/* Card Footer controls */}
              <div className="px-4 sm:px-7 py-3.5 sm:py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-white/60 mt-auto">
                
                {/* Interactive VOTE button - 'والله هاي صارت وياي' */}
                <button                   onClick={(e) => handleVote(insight.id, e)}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-b from-white/10 to-white/5 hover:from-white/10 hover:to-white/5 hover:text-vz-accent border border-white/10 hover:border-white/18 transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 flex items-center justify-center sm:justify-start gap-2 font-bold cursor-pointer active:scale-[0.97] shadow-lg w-full sm:w-auto min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                  title="نعم، لقد واجهت هذا الموقف في مشروعي سابقاً"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-vz-accent" />
                  <span className="text-xs">والله هاي صارت وياي! 🙋‍♂️</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-black bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                    {voteCount}
                  </span>
                </button>

                <span className="text-[11px] font-bold text-vz-accent/80 group-hover:text-vz-accent transition-colors flex items-center justify-center sm:justify-end gap-1.5 py-1">
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
        <div className="text-center py-20 glass to-black/40 border rounded-4xl space-y-4">
          <span className="text-6xl block drop-shadow-lg">🔍🏜️</span>
          <h4 className="text-lg font-black text-white">لم نجد أي حقيقة تطابق بحثك</h4>
          <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
            جرب كتابة كلمات مختلفة مثل 'إعلان'، 'سعر'، 'مرتجع'، أو اختر تبويب تصنيف آخر أعلاه.
          </p>
          <button             onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
            className="text-sm text-vz-accent font-black hover:text-white transition-colors cursor-pointer mt-4 inline-flex items-center gap-2 border-b border-white/14 hover:border-vz-blue-light pb-1 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
          >
            <Shuffle className="w-4 h-4" />
            إعادة تعيين البحث والتصنيف
          </button>
        </div>
      )}

      {/* RANDOM INSIGHT FEATURE MODAL */}
      <AnimatePresence>
        {showRandomModal && randomInsight && (
          <motion.div key="insight-overlay" {...overlayMotion} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 vz-backdrop">
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  setShowRandomModal(false);
                }
              }}
              {...originSheet}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-2xl glass-elevated glass-edge rounded-3xl sm:rounded-4xl p-5 sm:p-8 md:p-12 text-right space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto touch-pan-y"
            >
              {/* Mobile Drag Down Bar Indicator */}
              <div className="w-10 h-[5px] bg-white/25 rounded-full mx-auto my-1 sm:hidden shrink-0 cursor-grab active:cursor-grabbing" />

              <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-white/45 via-white/10 to-transparent" />
              
              {/* Modal top decor */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6 relative z-10">
              <button                 onClick={() => setShowRandomModal(false)}
                aria-label="إغلاق"
                className="vz-close focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 text-vz-accent">
                <Sparkles className="w-6 h-6 animate-pulse-slow" />
                <span className="text-base font-black tracking-wide drop-shadow-md">حقيقة عشوائية مميزة من واقع السوق</span>
              </div>
            </div>

            <div className="space-y-6 pt-2 relative z-10">
              <span className="inline-block px-4 py-1.5 text-xs font-black bg-gradient-to-r from-white/10 to-white/3 text-vz-accent border border-white/18 rounded-xl shadow-lg">
                📁 {randomInsight.categoryLabel}
              </span>

              <p className="text-xl md:text-3xl font-black text-white leading-relaxed drop-shadow-lg pr-4 border-r-2 border-white/27">
                "{randomInsight.text}"
              </p>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent my-8" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[12px] font-black text-white/70 block flex items-center gap-1.5"><HelpCircle className="w-4 h-4"/> المشكلة والخلل الخفي:</span>
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
              <button                 onClick={(e) => handleVote(randomInsight.id, e)}
                className="px-5 py-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent hover:from-white/15 text-vz-accent border border-white/18 transition-all motion-reduce:transition-none motion-reduce:transform-none font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>والله هاي صارت وياي!</span>
                <span className="font-mono bg-black/40 px-2 py-0.5 rounded-full text-[12px] border border-white/9">
                  {votes[randomInsight.id] || 0}
                </span>
              </button>

              <button                 onClick={handleRandomize}
                className="px-5 py-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent hover:from-white/20 text-white font-bold text-sm transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer flex items-center gap-2 shadow-lg hover:-translate-y-0.5 border border-white/10 hover:border-white/30 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
              >
                <Shuffle className="w-4 h-4 text-white/80" />
                <span>عشوائي آخر</span>
              </button>
            </div>

          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
