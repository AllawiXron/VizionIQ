import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Calculator,
  BookOpen,
  Bot,
  AlertTriangle,
  Zap,
  AlertOctagon,
  ShieldCheck,
  Compass,
  ArrowDown
} from "lucide-react";

interface HeroProps {
  onOpenAdvisor?: () => void;
  onSelectPath?: (path: "learn" | "diagnose" | "calculate") => void;
  onScrollToSection?: (id: string) => void;
}

export default function Hero({ onOpenAdvisor, onSelectPath, onScrollToSection }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePainPoint, setActivePainPoint] = useState<number | null>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return null;
    }
    return 0;
  });

  // Sparkles background effect - subtle and lightweight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      if (Math.abs(newWidth - width) > 30 || Math.abs(newHeight - height) > 120) {
        width = canvas.width = newWidth;
        height = canvas.height = newHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    interface Spark {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const sparks: Spark[] = [];
    const isMobile = window.innerWidth < 768;
    const maxSparks = isMobile ? 12 : 30;

    for (let i = 0; i < maxSparks; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        speedY: (Math.random() * -0.25) - 0.08, 
        opacity: Math.random() * 0.4 + 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        ctx.beginPath();
        
        const xWobble = s.x + Math.sin(s.wobble) * 1.5;
        
        ctx.arc(xWobble, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 160, 23, ${s.opacity})`;
        ctx.fill();

        s.y += s.speedY;
        s.wobble += s.wobbleSpeed;
        
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleScrollToId = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
      return;
    }
    const nextSection = document.getElementById(id);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEntryChoice = (choice: "learn" | "diagnose" | "calculate") => {
    if (onSelectPath) {
      onSelectPath(choice);
      return;
    }
    if (choice === "learn") {
      handleScrollToId("contents-section");
    } else if (choice === "diagnose") {
      if (onOpenAdvisor) {
        onOpenAdvisor();
      } else {
        window.dispatchEvent(new CustomEvent("open-vip-advisor"));
      }
    } else if (choice === "calculate") {
      handleScrollToId("vizion-growth-suite");
      window.dispatchEvent(new CustomEvent("open-tool-category", { detail: { category: "calculate" } }));
    }
  };

  const handlePrimaryCTA = () => {
    if (onOpenAdvisor) {
      onOpenAdvisor();
    } else {
      window.dispatchEvent(new CustomEvent("open-vip-advisor"));
    }
  };

  const painPoints = [
    {
      id: 1,
      title: "أصرف على الإعلانات وتجي رسائل، بس بالنهاية ماكو مبيعات.",
      solution: "المشكلة مو بالجمهور ولا بفيسبوك، المشكلة إنك تستهدف استهدافاً عاماً بدون فلترة، وتصرف على زوار فضوليين بدل المشترين الفعليين. ستتعلم كيفية تصفية الزبائن الجادين بالإعلان نفسه."
    },
    {
      id: 2,
      title: "الناس كلها تسأل عن السعر وبعدين تختفي، ولا واحد يشتري.",
      solution: "لأن أسلوب الرد تقليدي أو جاف. سنمنحك سكريبت الحوار العراقي المقنع الذي يركز على قيمة المنتج أولاً ثم يخير الزبون بين خيارين لحسم البيعة فوراً."
    },
    {
      id: 3,
      title: "ما أعرف إذا حملتي الإعلانية ناجحة لو دي أضيع فلوسي.",
      solution: "التخمين عدو التجارة. سنمنحك لوحة أرقام واضحة (CTR, CPA, ROAS) تكشف لك بدقة: أوقف هذا الإعلان فوراً أو ضاعف ميزانيته لأنه رابح."
    },
    {
      id: 4,
      title: "نسبة المرتجع في المحافظات عالية وتاكل أرباحي كلها.",
      solution: "نظام 'التأكيد الصارم' وفلترة العناوين قبل التوصيل يخفض الراجع من 25% إلى أقل من 8%، مع سكريبت إعادة تثبيت الطلب هاتفياً."
    },
    {
      id: 5,
      title: "أشوف المنافسين يبيعون أكثر مني وما أعرف شنو الشي اللي يسووه صح.",
      solution: "السر في 'هندسة العرض' وبناء زوايا إعلانية توقف الزبون في أول ثانيتين. سنوفر لك أدوات تحليل عروض المنافسين وصياغة عروض لا تُقاوم."
    },
    {
      id: 6,
      title: "أريد أبدأ مشروعي، بس خايف أخسر لأن ما أفهم بالتسويق.",
      solution: "خطة الـ 30 يوماً التنفيذية ترتب لك خطواتك يوماً بيوم: من اختيار المنتج وحساب تكاليفه، حتى توصيل أول طلب واستلام الأرباح نقداً."
    },
    {
      id: 7,
      title: "كل حملة أسويها أحس نفسي أخمن وما أعرف شنو الخطوة الجاية.",
      solution: "النظام ينقلك من العشوائية إلى لغة الأرقام. 13 أداة وحاسبة تفاعلية تجعلك تتحرك بثقة وتعرف أين يذهب كل دينار تصرفه."
    },
    {
      id: 8,
      title: "أريد أزيد مبيعاتي، بس ما أعرف وين المشكلة بالضبط.",
      solution: "الخلل يكون في واحدة من أربع مراحل: (الإعلان، الرد على الرسائل، تأكيد الطلب، أو جودة التوصيل). أداة التشخيص السريع تحدد موقع الخلل خلال 3 دقائق."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" }
    }
  };

  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] w-full flex flex-col items-center overflow-hidden pt-16 sm:pt-24 pb-14 sm:pb-20 px-3 sm:px-6 text-center select-none bg-grid-pattern dir-rtl" id="hero-section">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-60" />

      {/* Ambient Radial Background Glows - Calm & Performance Balanced */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-[radial-gradient(circle_at_center,rgba(13,27,86,0.45)_0%,transparent_70%)] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl z-10 space-y-6 sm:space-y-10 flex flex-col items-center w-full relative"
      >
        
        {/* Top Operational OS Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0F1735]/90 border border-[#D4A017]/40 text-xs sm:text-sm text-[#F0C040] font-bold shadow-md backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
          <span>منظومة التشغيل العملية للتجارة الإلكترونية في العراق</span>
        </motion.div>

        {/* Primary Clear Hero Value Proposition */}
        <motion.div variants={itemVariants} className="space-y-3 sm:space-y-5 max-w-4xl relative z-10 px-2 flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.6rem] font-black text-white tracking-tight leading-snug sm:leading-[1.18] drop-shadow-xl">
            نظام عملي للتاجر العراقي <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-[#FFE58F] to-[#D4A017]">
              حتى يبيع أكثر ويعرف وين تروح فلوسه
            </span>
          </h1>
          
          <p className="text-xs sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
            شخّص مشكلتك، احسب ربحك الصافي، وخذ خطوة واضحة اليوم — من خلال كورس عملي، 13 أداة وحاسبة بالدينار، ومستشار ذكي للسوق العراقي.
          </p>

          {/* Focused Primary & Secondary CTAs (Easy to tap, >= 44px) */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto w-full">
            {/* Primary Action */}
            <button               onClick={handlePrimaryCTA}
              className="w-full sm:w-auto flex-1 min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A017] via-amber-500 to-amber-600 hover:from-amber-400 hover:to-[#D4A017] text-[#040B24] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg md:shadow-[#D4A017] shadow-xl/25 hover:scale-[1.02] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer border border-[#F0C040]/40 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              aria-label="ابدأ تشخيص مشروعك — 3 دقائق"
            >
              <Zap className="w-5 h-5 text-[#040B24] fill-[#040B24]" />
              <span>ابدأ تشخيص مشروعك — 3 دقائق</span>
            </button>

            {/* Secondary Action */}
            <button               onClick={() => handleScrollToId("contents-section")}
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer active:scale-95 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
              aria-label="استكشف الفصول"
            >
              <BookOpen className="w-4 h-4 text-[#F0C040]" />
              <span>استكشف الفصول</span>
            </button>
          </div>

          {/* First Screen Value Communication Grid (Above the fold - no long scroll required) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl pt-2 sm:pt-3">
            <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="text-sm sm:text-base">📚</span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5">11 فصلاً عملياً</span>
              <span className="text-[10px] text-white/70 hidden xs:inline">من الفكرة للتسليم</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="text-sm sm:text-base">🧮</span>
              <span className="text-xs sm:text-sm font-black text-[#F0C040] mt-0.5">13 أداة وحاسبة</span>
              <span className="text-[10px] text-white/70 hidden xs:inline">أرباح بالدينار</span>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-[#D4A017]/5 border border-[#D4A017]/30 flex flex-col items-center justify-center text-center">
              <span className="text-sm sm:text-base">⚡</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">تشخيص بـ 3 دقائق</span>
              <span className="text-[10px] text-white/70 hidden xs:inline">مستشار ذكي فوري</span>
            </div>
          </div>
        </motion.div>

        {/* 3 PRIMARY ENTRY CHOICES (FAST-TRACK 60-SECOND PILLARS) */}
        <motion.div variants={itemVariants} className="w-full pt-4 sm:pt-6">
          <div className="text-center mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-black text-[#F0C040] uppercase tracking-wider block">
              حدد هدفك الآن للبدء مباشرة:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 text-right">
            
            {/* Entry Choice 1: Learn from scratch */}
            <div
              onClick={() => handleEntryChoice("learn")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleEntryChoice("learn");
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="أريد أتعلم من الصفر"
              className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0F1735]/90 to-[#0A122E]/90 border border-white/10 hover:border-[#D4A017]/60 transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(212,160,23,0.15)] shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-[#D4A017] group-hover:text-[#040B24] group-hover:border-[#D4A017] transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:transform-none">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    مسار منظم
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#F0C040] transition-colors mb-1.5">
                  “أريد أتعلم من الصفر”
                </h3>
                <p className="hidden sm:block text-xs sm:text-sm text-white/70 leading-relaxed font-light mb-4">
                  ادخل في مسار الفصول الـ 11 المرتبة في 4 مراحل: من التأسيس وصناعة العرض حتى إطلاق الإعلانات وإدارة التوصيل.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0C040] pt-3 border-t border-white/5">
                <span>تصفح مسار الفصول</span>
                <ArrowRight className="w-3.5 h-3.5 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Entry Choice 2: Diagnose a current problem */}
            <div
              onClick={() => handleEntryChoice("diagnose")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleEntryChoice("diagnose");
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="عندي مشكلة حالياً"
              className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#141A38] to-[#0A122E] border border-[#D4A017]/40 hover:border-[#D4A017] transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(212,160,23,0.25)] shadow-xl cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A017]/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#D4A017] to-amber-600 flex items-center justify-center text-[#040B24] font-black shadow-md md:shadow-[#D4A017] shadow-xl/30 group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#D4A017]/20 text-[#F0C040] border border-[#D4A017]/40">
                    ⚡ تشخيص فوري 3 دقائق
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#F0C040] transition-colors mb-1.5">
                  “عندي مشكلة حالياً”
                </h3>
                <p className="hidden sm:block text-xs sm:text-sm text-white/70 leading-relaxed font-light mb-4">
                  راجع عالي؟ رسائل بلا شراء؟ ميزانية محروقة؟ اطلب تحليل فوري من مستشار فيزيون الذكي المخصص لواقع السوق العراقي.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0C040] pt-3 border-t border-[#D4A017]/20">
                <span>شخّص مشكلتك الآن</span>
                <ArrowRight className="w-3.5 h-3.5 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Entry Choice 3: Calculate numbers */}
            <div
              onClick={() => handleEntryChoice("calculate")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleEntryChoice("calculate");
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="أريد أحسب أرقامي"
              className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0F1735]/90 to-[#0A122E]/90 border border-white/10 hover:border-emerald-500/60 transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)] shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#040B24] group-hover:border-emerald-500 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:transform-none">
                    <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    حاسبات تفاعلية
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors mb-1.5">
                  “أريد أحسب أرقامي”
                </h3>
                <p className="hidden sm:block text-xs sm:text-sm text-white/70 leading-relaxed font-light mb-4">
                  احسب هامش ربحك الصافي، تكلفة الراجع بالمحافظات، وسعر بيعك المطلوب بالدينار العراقي قبل أن تطلق الإعلان.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-3 border-t border-white/5">
                <span>فتح حاسبة الأرباح والتسعير</span>
                <ArrowRight className="w-3.5 h-3.5 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* Shimmering Subtle Divider */}
        <motion.div variants={itemVariants} className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

        {/* The Epiphany Letter (Extreme Trust Builder & Empathy) */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl relative group text-right">
          <div className="relative bg-gradient-to-b from-[#0F1735]/80 to-[#040B24]/95 border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl text-right space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center text-[#F0C040] shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-xl text-white">رسالة صريحة قبل أن تبدأ..</h3>
                <p className="text-xs sm:text-sm text-[#F0C040] font-bold">ليش يفشل 90% من التجار على السوشيال ميديا بالعراق؟</p>
              </div>
            </div>
            
            <div className="space-y-3 text-xs sm:text-base text-white/80 leading-relaxed font-light">
              <p>
                أعرف تماماً الإحساس الخانق.. تصرف مئات الدولارات على إعلانات فيسبوك وانستغرام، وتصلك عشرات الرسائل تسأل <span className="text-red-300 font-bold px-1.5 py-0.5 bg-red-500/10 rounded">"ببيش السعر؟"</span>، ثم يختفون كأنهم لم يكونوا.
              </p>
              <p>
                وأعرف الإحباط عندما يتصل المندوب ويخبرك أن الزبون ألغى الطلب أو لم يرد على الاتصال، لتتحمل أنت <span className="text-red-300 font-bold">كروة التوصيل والراجع</span>.
              </p>
              
              <div className="p-3.5 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-transparent border-r-4 border-emerald-400">
                <p className="text-xs sm:text-base text-emerald-100 font-bold">
                  الفرق بين التاجر الخاسر والتاجر الرابح ليس الحظ.. بل <strong className="text-emerald-300 font-black">النظام التشغيلي المنضبط</strong> الذي يفلتر الزبائن، يغلق الصفقات بالهاتف، ويحمي الأرباح الصافية.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 8 PAIN POINTS ACCORDION (Interactive Problem-Solver) */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl space-y-4 pt-4 sm:pt-8 text-right">
          <div className="text-center space-y-1.5 mb-6">
            <h3 className="text-lg sm:text-2xl font-black text-white">
              مشاكلك الشائعة.. <span className="text-[#F0C040]">وحلولها العملية في النظام</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/60">اضغط على أي عائق يواجهك الآن لاكتشاف طريقة معالجته فوراً:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {painPoints.map((p, idx) => {
              const isActive = activePainPoint === idx;
              return (
                <div 
                  key={p.id}
                  onClick={() => setActivePainPoint(isActive ? null : idx)}
                  className={`p-3.5 sm:p-5 rounded-2xl text-right transition-all motion-reduce:transition-none motion-reduce:transform-none duration-200 cursor-pointer border relative overflow-hidden ${
                    isActive 
                      ? "bg-gradient-to-br from-[#162252] to-[#0D1638] border-[#D4A017]/60 shadow-md md:shadow-[#D4A017] shadow-xl/10" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${isActive ? 'bg-[#D4A017] text-[#040B24]' : 'bg-white/5 text-white/70'}`}>
                        {p.id}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold leading-relaxed pr-0.5 ${isActive ? 'text-white' : 'text-white/80'}`}>{p.title}</h4>
                    </div>
                    <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center transition-all motion-reduce:transition-none motion-reduce:transform-none ${isActive ? 'rotate-180 text-[#F0C040]' : 'text-white/60'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-white/10 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                          <p className="pr-2 border-r-2 border-[#D4A017]">{p.solution}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Scroll Prompt to Chapters */}
        <motion.div variants={itemVariants} className="pt-6 pb-2">
          <button             onClick={() => handleScrollToId("contents-section")}
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-[#F0C040] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          >
            <span>استكشف تفاصيل الفصول والـ 4 مراحل بالأسفل</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
