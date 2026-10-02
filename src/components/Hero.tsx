import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "motion/react";
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
import { CountUp, Magnetic, Reveal, RevealGroup, RevealItem, WordsReveal } from "./ui/Motion";
import { EASE_OUT, SPRING, SPRING_SNAPPY, allowBlur, collapseMotion } from "../lib/motion";

interface HeroProps {
  onOpenAdvisor?: () => void;
  onSelectPath?: (path: "learn" | "diagnose" | "calculate") => void;
  onScrollToSection?: (id: string) => void;
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506]";

export default function Hero({ onOpenAdvisor, onSelectPath, onScrollToSection }: HeroProps) {
  const [activePainPoint, setActivePainPoint] = useState<number | null>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return null;
    }
    return 0;
  });

  // Scroll-linked depth: content drifts slower than the page and the lighting shifts.
  // Phones get a lighter version (smaller drift, no fade) so reading is never disturbed.
  const reduceMotion = useReducedMotion();
  const desktopDepth = !reduceMotion && allowBlur();
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 640], [0, reduceMotion ? 0 : desktopDepth ? 64 : 28]);
  const contentOpacity = useTransform(scrollY, [0, 560], [1, desktopDepth ? 0.35 : 1]);
  const contentScale = useTransform(scrollY, [0, 640], [1, desktopDepth ? 0.975 : 1]);
  const lightY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 180]);
  const lightScale = useTransform(scrollY, [0, 900], [1, reduceMotion ? 1 : 1.25]);
  const lightOpacity = useTransform(scrollY, [0, 900], [1, 0.45]);
  const sideLightX = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : -90]);

  // Staged entrance: each tier rises out of a soft blur, ~0.9s end to end.
  const blur = allowBlur();
  const rise = (delay: number, extra: Record<string, number> = {}) => ({
    initial: { opacity: 0, y: 18, filter: blur ? "blur(10px)" : "blur(0px)", ...extra },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: EASE_OUT },
  });

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

  const entryChoices = [
    {
      id: "learn" as const,
      aria: "أريد أتعلم من الصفر",
      icon: BookOpen,
      badge: "مسار منظم",
      title: "“أريد أتعلم من الصفر”",
      desc: "ادخل في مسار الفصول الـ 11 المرتبة في 4 مراحل: من التأسيس وصناعة العرض حتى إطلاق الإعلانات وإدارة التوصيل.",
      cta: "تصفح مسار الفصول",
      featured: false,
    },
    {
      id: "diagnose" as const,
      aria: "عندي مشكلة حالياً",
      icon: Bot,
      badge: "⚡ تشخيص فوري 3 دقائق",
      title: "“عندي مشكلة حالياً”",
      desc: "راجع عالي؟ رسائل بلا شراء؟ ميزانية محروقة؟ اطلب تحليل فوري من مستشار فيزيون الذكي المخصص لواقع السوق العراقي.",
      cta: "شخّص مشكلتك الآن",
      featured: true,
    },
    {
      id: "calculate" as const,
      aria: "أريد أحسب أرقامي",
      icon: Calculator,
      badge: "حاسبات تفاعلية",
      title: "“أريد أحسب أرقامي”",
      desc: "احسب هامش ربحك الصافي، تكلفة الراجع بالمحافظات، وسعر بيعك المطلوب بالدينار العراقي قبل أن تطلق الإعلان.",
      cta: "فتح حاسبة الأرباح والتسعير",
      featured: false,
    },
  ];

  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] w-full flex flex-col items-center overflow-hidden pt-24 sm:pt-32 pb-14 sm:pb-20 px-3 sm:px-6 text-center select-none dir-rtl" id="hero-section">
      {/* Hero lighting — static gradients moved by scroll (no render loop) */}
      <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      <motion.div
        aria-hidden="true"
        style={{ y: lightY, scale: lightScale, opacity: lightOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
        className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[140vw] sm:w-[90vw] max-w-[1400px] h-[90vh] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.035)_35%,transparent_68%)] will-change-transform"
      />
      <motion.div
        aria-hidden="true"
        style={{ x: sideLightX }}
        className="absolute top-[18%] -right-[10%] w-[55vw] h-[55vh] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(175,182,205,0.07)_0%,transparent_65%)]"
      />

      <div className="max-w-5xl z-10 space-y-8 sm:space-y-12 flex flex-col items-center w-full relative">

        {/* ABOVE THE FOLD — drifts back as the page moves forward */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
          className="flex flex-col items-center space-y-6 sm:space-y-9 w-full origin-top will-change-transform"
        >
          {/* Top Operational OS Badge */}
          <motion.div {...rise(0.12)} className="vz-eyebrow text-xs sm:text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe" />
            <span>منظومة التشغيل العملية للتجارة الإلكترونية في العراق</span>
          </motion.div>

          {/* Primary Clear Hero Value Proposition */}
          <div className="space-y-4 sm:space-y-6 max-w-4xl relative z-10 px-2 flex flex-col items-center">
            <WordsReveal
              as="h1"
              trigger="mount"
              delay={0.18}
              stagger={0.055}
              className="text-[1.7rem] sm:text-5xl md:text-6xl lg:text-[4.1rem] font-black text-white tracking-tight leading-[1.3] sm:leading-[1.15]"
              segments={[
                "نظام عملي للتاجر العراقي ",
                { br: "hidden sm:block" },
                { text: "حتى يبيع أكثر ويعرف وين تروح فلوسه", className: "vz-silver-text" },
              ]}
            />

            <motion.p {...rise(0.55)} className="text-sm sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-normal leading-relaxed">
              شخّص مشكلتك، احسب ربحك الصافي، وخذ خطوة واضحة اليوم — من خلال كورس عملي، 13 أداة وحاسبة بالدينار، ومستشار ذكي للسوق العراقي.
            </motion.p>

            {/* Focused Primary & Secondary CTAs (Easy to tap, >= 44px) */}
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.92, filter: blur ? "blur(10px)" : "blur(0px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.9, delay: 0.65, opacity: { duration: 0.5, delay: 0.65, ease: EASE_OUT }, filter: { duration: 0.5, delay: 0.65, ease: EASE_OUT } }}
              className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto w-full">
              {/* Primary Action */}
              <Magnetic className="w-full sm:w-auto sm:flex-1" strength={0.2} max={7}>
                <button
                  onClick={handlePrimaryCTA}
                  className={`btn btn-primary w-full min-h-[50px] sm:min-h-[54px] px-6 sm:px-8 rounded-full text-sm sm:text-base gap-2.5 ${focusRing}`}
                  aria-label="ابدأ تشخيص مشروعك — 3 دقائق"
                >
                  <Zap className="w-[18px] h-[18px] fill-current" />
                  <span>ابدأ تشخيص مشروعك — 3 دقائق</span>
                </button>
              </Magnetic>

              {/* Secondary Action */}
              <button
                onClick={() => handleScrollToId("contents-section")}
                className={`btn btn-glass w-full sm:w-auto min-h-[50px] sm:min-h-[54px] px-6 sm:px-8 rounded-full text-sm sm:text-base font-bold ${focusRing}`}
                aria-label="استكشف الفصول"
              >
                <BookOpen className="w-4 h-4 opacity-80" />
                <span>استكشف الفصول</span>
              </button>
            </motion.div>

            {/* First Screen Value Communication Grid (Above the fold - no long scroll required) */}
            <motion.div {...rise(0.78)} className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl pt-1 sm:pt-2">
              {[
                { icon: "📚", before: "", num: 11, after: " فصلاً عملياً", sub: "من الفكرة للتسليم", tone: "text-white" },
                { icon: "🧮", before: "", num: 13, after: " أداة وحاسبة", sub: "أرباح بالدينار", tone: "text-white" },
                { icon: "⚡", before: "تشخيص بـ ", num: 3, after: " دقائق", sub: "مستشار ذكي فوري", tone: "text-emerald-300" },
              ].map((stat) => (
                <div key={stat.sub} className="p-2.5 sm:p-3.5 rounded-2xl glass-subtle flex flex-col items-center justify-center text-center">
                  <span className="text-sm sm:text-base">{stat.icon}</span>
                  <span className={`text-xs sm:text-sm font-black mt-0.5 ${stat.tone}`}>
                    {stat.before}<CountUp value={stat.num} />{stat.after}
                  </span>
                  <span className="text-[10px] text-white/50 hidden xs:inline">{stat.sub}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* 3 PRIMARY ENTRY CHOICES (FAST-TRACK 60-SECOND PILLARS) */}
        <div className="w-full pt-2 sm:pt-4 relative z-10">
          <motion.div {...rise(0.85)} className="text-center mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-bold text-white/50 block">
              حدد هدفك الآن للبدء مباشرة:
            </span>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.9 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 text-right"
          >
            {entryChoices.map((choice) => {
              const Icon = choice.icon;
              return (
                <motion.div
                  key={choice.id}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.92, rotateX: 8 },
                    visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 220, damping: 19, mass: 0.9, opacity: { duration: 0.5, ease: EASE_OUT } } },
                  }}
                  className="h-full"
                  style={{ transformPerspective: 1200 }}
                >
                  <div
                    onClick={() => handleEntryChoice(choice.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleEntryChoice(choice.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={choice.aria}
                    data-tilt
                    className={`group h-full p-5 sm:p-6 rounded-3xl cursor-pointer flex flex-col justify-between glass-interactive ${
                      choice.featured ? "glass-elevated glass-edge" : "glass"
                    } ${focusRing}`}
                  >
                    <div className="glass-depth">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                            choice.featured
                              ? "bg-gradient-to-b from-white to-zinc-300 text-[#050506] shadow-[inset_0_1px_0_#fff,0_8px_20px_-8px_rgba(255,255,255,0.35)]"
                              : "bg-white/[0.06] border border-white/10 text-white/80 group-hover:text-white group-hover:bg-white/10"
                          }`}
                        >
                          <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${
                            choice.id === "calculate"
                              ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                              : choice.featured
                                ? "bg-white/10 text-white border-white/15"
                                : "bg-white/[0.04] text-white/60 border-white/[0.08]"
                          }`}
                        >
                          {choice.badge}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
                        {choice.title}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-white/55 leading-relaxed font-light mb-4">
                        {choice.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 group-hover:text-white pt-3.5 border-t border-white/[0.07] transition-colors">
                      <span>{choice.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform rotate-180 transition-transform duration-500 group-hover:-translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Subtle Divider */}
        <Reveal className="w-full max-w-md vz-hairline" y={0} scale={1} />

        {/* The Epiphany Letter (Extreme Trust Builder & Empathy) */}
        <Reveal className="w-full max-w-4xl relative text-right">
          <div className="relative glass glass-edge p-5 sm:p-9 rounded-3xl text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-white/[0.07] pb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/85 shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-xl text-white">رسالة صريحة قبل أن تبدأ..</h3>
                <p className="text-xs sm:text-sm text-white/55 font-bold">ليش يفشل 90% من التجار على السوشيال ميديا بالعراق؟</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-base text-white/75 leading-relaxed font-light">
              <p>
                أعرف تماماً الإحساس الخانق.. تصرف مئات الدولارات على إعلانات فيسبوك وانستغرام، وتصلك عشرات الرسائل تسأل <span className="text-red-300 font-bold px-1.5 py-0.5 bg-red-500/10 rounded-md">"ببيش السعر؟"</span>، ثم يختفون كأنهم لم يكونوا.
              </p>
              <p>
                وأعرف الإحباط عندما يتصل المندوب ويخبرك أن الزبون ألغى الطلب أو لم يرد على الاتصال، لتتحمل أنت <span className="text-red-300 font-bold">كروة التوصيل والراجع</span>.
              </p>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-emerald-400/[0.07] to-transparent border border-emerald-400/15 border-r-2 border-r-emerald-400/70">
                <p className="text-xs sm:text-base text-emerald-50/90 font-bold">
                  الفرق بين التاجر الخاسر والتاجر الرابح ليس الحظ.. بل <strong className="text-emerald-300 font-black">النظام التشغيلي المنضبط</strong> الذي يفلتر الزبائن، يغلق الصفقات بالهاتف، ويحمي الأرباح الصافية.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 8 PAIN POINTS ACCORDION (Interactive Problem-Solver) */}
        <div className="w-full max-w-4xl space-y-4 pt-4 sm:pt-8 text-right">
          <Reveal className="text-center space-y-1.5 mb-6">
            <h3 className="text-lg sm:text-3xl font-black text-white">
              مشاكلك الشائعة.. <span className="vz-silver-text">وحلولها العملية في النظام</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/50 mx-auto">اضغط على أي عائق يواجهك الآن لاكتشاف طريقة معالجته فوراً:</p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start" stagger={0.05}>
            {painPoints.map((p, idx) => {
              const isActive = activePainPoint === idx;
              return (
                <RevealItem key={p.id}>
                  <motion.div
                    layout="position"
                    onClick={() => setActivePainPoint(isActive ? null : idx)}
                    className={`p-4 sm:p-5 rounded-2xl text-right cursor-pointer relative overflow-hidden transition-[background-color,border-color,box-shadow] duration-500 ${
                      isActive
                        ? "glass-elevated"
                        : "glass-subtle hover:bg-white/[0.055] hover:border-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black transition-colors duration-500 ${isActive ? 'bg-white text-[#050506]' : 'bg-white/[0.06] text-white/60'}`}>
                          {p.id}
                        </div>
                        <h4 className={`text-xs sm:text-sm font-bold leading-relaxed pr-0.5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/75'}`}>{p.title}</h4>
                      </div>
                      <motion.div
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={SPRING_SNAPPY}
                        className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${isActive ? 'text-white' : 'text-white/45'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div {...collapseMotion} className="overflow-hidden">
                          <div className="pt-3 mt-3 border-t border-white/[0.08] text-xs sm:text-sm text-white/70 leading-relaxed">
                            <p className="pr-3 border-r-2 border-emerald-400/60">{p.solution}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>

        {/* Scroll Prompt to Chapters */}
        <Reveal className="pt-6 pb-2">
          <button
            onClick={() => handleScrollToId("contents-section")}
            className={`btn btn-ghost px-4 rounded-full text-xs font-bold group ${focusRing}`}
          >
            <span>استكشف تفاصيل الفصول والـ 4 مراحل بالأسفل</span>
            <ArrowDown className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
          </button>
        </Reveal>

      </div>
    </div>
  );
}
