/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { 
  Sparkles, 
  Mouse, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  Flame, 
  Target, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Calendar,
  AlertOctagon
} from "lucide-react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePainPoint, setActivePainPoint] = useState<number | null>(0);

  // Sparkles background effect
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
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    interface Spark {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }

    const sparks: Spark[] = [];
    const maxSparks = 45;

    for (let i = 0; i < maxSparks; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedY: (Math.random() * -0.15) - 0.05, // Drifts up slowly
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 160, 23, ${s.opacity})`;
        ctx.fill();

        // Update position
        s.y += s.speedY;
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
    const nextSection = document.getElementById(id);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const painPoints = [
    {
      id: 1,
      title: "أصرف على الإعلانات وتجي رسائل، بس بالنهاية ماكو مبيعات.",
      solution: "المشكلة مو بالجمهور ولا بالفيسبوك، المشكلة إنك جاي تستهدف استهداف عام بدون تصفية، وتصرف على زوار يطقطقون بدل المشترين الفعليين. راح تتعلم شلون تسوي فلترة تلقائية بالإعلان نفسه."
    },
    {
      id: 2,
      title: "الناس كلها تسأل عن السعر وبعدين تختفي، ولا واحد يشتري.",
      solution: "لأن أسلوب ردك آلي وجاف ويحسسهم إنك بس تريد فلوسهم. راح نعطيك سكريبت الحوار العراقي المقنع اللي يبني قيمة المنتج أولاً ثم يخير الزبون بين لونين أو عرضين حتى يسد البيعة فوراً."
    },
    {
      id: 3,
      title: "ما أعرف إذا حملتي الإعلانية ناجحة لو دي أضيع فلوسي.",
      solution: "التخمين هو عدو البزنس. راح نعطيك لوحة تحكم ومقاييس حقيقية (CTR, CPA) تفهمك لغة الأرقام وتكولك بوضوح: الإعلان هذا طفيه فوراً لأن ديخسرك، أو هذا زيد ميزانيته لأنه رابح."
    },
    {
      id: 4,
      title: "ما أعرف شكد لازم أصرف حتى الإعلان يجيب نتيجة.",
      solution: "أغلب المبتدئين يبلشون بميزانية عشوائية ويخسرون. بأدواتنا المحاسبية، راح تخطط حملتك مسبقاً وتحدد الميزانية التجريبية والصافية بدقة بناءً على تكلفة الشحن والمنتج وهامشك المطلق."
    },
    {
      id: 5,
      title: "أشوف المنافسين يبيعون أكثر مني وما أعرف شنو الشي اللي دي يسووه صح.",
      solution: "السر مو بالسحر، السر بـ 'هندسة العرض' وصناعة الإعلانات الإبداعية اللي توقف تصفح العميل بالثانية الأولى. راح نكشفلك طرق التجسس القانوني وتحليل زواياهم الإعلانية لتتفوق عليهم."
    },
    {
      id: 6,
      title: "أريد أبدأ مشروعي، بس خايف أخسر لأن ما أفهم بالتسويق.",
      solution: "الخوف طبيعي لمن تكون الرؤية مغبشة. هنا سوينا خطة الـ 30 يوماً المرتبة يوماً بيوم، تبلش وياك من اختيار المنتج وحساب الجدوى، لحد ما تشحن أول طرد وتستلم كاشك بيدك."
    },
    {
      id: 7,
      title: "تجيني رسائل هواي، بس كلها استفسارات وناس فضوليين.",
      solution: "حملات الترويج البسيطة تجيب ناس فضوليين يبحثون عن المتعة البصرية. بنظامنا، راح تتعلم شلون توجه حملاتك للمشترين الجادين من خلال صياغة الإعلان وتكتيكات الجماهير المخصصة."
    },
    {
      id: 8,
      title: "كل حملة أسويها أحس نفسي أخمن وما أعرف شنو دي أسوي.",
      solution: "راح ننقل عملك من مبدأ 'يا ريت تنجح' إلى علم 'الأرقام الدقيقة'. الحاسبات والأنظمة التفاعلية اللي وفرناها بالصفحة راح تخليك تمشي بثقة تامة كأنك خبير متمرس."
    },
    {
      id: 9,
      title: "أصرف على الترويج وما أعرف إذا راح أربح أو أخسر.",
      solution: "لهذا السبب وفرنا حاسبة العائد والطلبات المرتجعة التفاعلية. تدخل تكلفة إعلانك والشحن ونسبة المرتجع، وهي تطلعلك صافي ربحك الحقيقي قبل لا تدفع لفيسبوك دولار واحد."
    },
    {
      id: 10,
      title: "أريد أزيد مبيعاتي، بس ما أعرف وين المشكلة بالضبط.",
      solution: "الخلل يكون بواحدة من أربع نقاط: (الإعلان، صفحة الهبوط، التأكيد الهاتفي، أو جودة التوصيل). راح نعطيك دليل تشخيص الأعطال اللي يحددلك الخلل وين بالضبط ويعطيك حله بـ 5 دقائق."
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-24 pb-12 px-4 sm:px-6 text-center select-none" id="hero-section">
      {/* Sparks Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />

      {/* Luxury Cinematic Glow Blobs */}
      <div className="absolute top-[5%] right-[5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#D4A017]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#0D1B56]/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl z-10 space-y-12 flex flex-col items-center w-full">
        
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 shadow shadow-[#D4A017]/5 text-xs text-[#F0C040] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
          <span>هذا مو كورس إعلانات عادي.. هذا نظام تشغيل كامل لمشروعك الإلكتروني بالعراق</span>
        </div>

        {/* Headings */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
           كل الأدوات والأشياء اللي تمنيت أعرفها من أول يوم بديت مشروعي…
          </h1>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none gold-gradient-text">
           صارت اليوم بمكان واحد!
          </h2>
        </div>

        {/* Shimmering Divider Line */}
        <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent shadow-[0_0_10px_#D4A017]" />

        {/* Empathy Pitch / Storyteller copy */}
        <div className="max-w-2xl bg-white/[0.02] border border-white/5 p-6 rounded-2xl text-right space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-[#F0C040] font-bold text-sm mb-1">
            <Flame className="w-5 h-5 text-[#F0C040]" />
            <span>رسالة من رائد أعمال عراقي يعيش نفس معاناتك اليومية...</span>
          </div>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
            أدري بيك.. تصرف مئات الدولارات على الترويج بفيسبوك وانستغرام، وتجيك رسائل هواي تسأل <strong className="text-white">"ببيش عيني؟"</strong> أو <strong className="text-white">"السعر فدوة"</strong>، ومن تجاوبهم يختفون وما يرجعون. أدري بيك تنقهر من المندوب يرجعلك طرود مرتجعة وتخسر فلوس شحنها وإعلاناتها، وتحس إنك جاي تدور بدوامة فارغة ومخفية الأرباح.
          </p>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-bold border-r-2 border-[#D4A017] pr-3">
            هذا الدليل والأدوات اللي كدامك مو نظريات غربية مترجمة ولا كلام مكرر من يوتيوب. هذا نظام تشغيل واقعي، صممته وعجنته بدم السوق العراقي، علمود يخليك توقف هدر الفلوس، وتفلتر الزباين المترددين، وتتحكم بأرباحك وطلباتك بالمليم.
          </p>
        </div>

        {/* OS vs COURSE SECTION */}
        <div className="w-full max-w-3xl space-y-4 pt-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
            <span>🛡️</span>
            <span>ليش هذا الدليل مختلف تماماً عن أي كورس باليوتيوب؟</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            {/* YouTube / Normal Course */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-2 border-b border-red-500/10 pb-2">
                <XCircle className="w-4 h-4" />
                <span>فيديوهات اليوتيوب والكورسات التقليدية:</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-white/60 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>معلومات عامة ومتفرقة من عشرات الأشخاص والدول المختلفة تخليك محتار شنو تطبق.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>شرح نظري ممل لمدير الإعلانات بدون فهم لواقع ومحافظات العراق.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>تخزين معلومات بالدماغ بدون أي أدوات مساعدة تحسبلك الأرقام والجدوى.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>يركزون بس على 'شلون تشغل إعلان' وينسون الردود، التأكيد الهاتفي، والمرتجعات.</span>
                </li>
              </ul>
            </div>

            {/* This Operating System */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
              <h4 className="text-xs font-bold text-[#F0C040] flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>نظام التشغيل المحلي الخاص بنا:</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-white/95 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>منهجية خطوة بخطوة:</strong> نظام كامل ومرتب ياخذك من الصفر لحد ما يثبت بزنسك.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>أدوات عملية تفاعلية:</strong> حاسبات ومحاكيات ذكية تبرمجلك أرقامك قبل لا تصرف فلس.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>مكافحة المرتجعات:</strong> حل حقيقي لمشكلة الـ COD بالعراق يقلل المرتجعات لأقل من 10%.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>سكريبتات جاهزة:</strong> ردود بغدادية وعراقية حية تقنع المشتري بمجرد ما يفتح الخاص.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 10 PAIN POINTS INTERACTIVE GRID */}
        <div className="w-full max-w-4xl space-y-4 pt-6 text-right">
          <div className="text-center space-y-2">
            <h3 className="text-base sm:text-xl font-bold text-[#F0C040] flex items-center justify-center gap-2">
              <AlertOctagon className="w-5 h-5 text-[#F0C040]" />
              <span>هل تعاني من وحدة من هاي المشاكل الـ 10 بالعراق؟</span>
            </h3>
            <p className="text-[11px] text-white/50 max-w-lg mx-auto">اضغط على أي مشكلة علمود تكتشف شلون راح يحلها الك نظامنا اليوم</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {painPoints.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => setActivePainPoint(activePainPoint === idx ? null : idx)}
                className={`p-4 rounded-xl text-right transition-all duration-300 cursor-pointer border ${
                  activePainPoint === idx 
                    ? "bg-[#D4A017]/10 border-[#D4A017] shadow-lg" 
                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-2.5 justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-bold text-[#F0C040] bg-white/5 px-2 py-0.5 rounded-md mt-0.5">{p.id}</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{p.title}</h4>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#F0C040] transform transition-transform shrink-0 ${activePainPoint === idx ? "rotate-180" : ""}`} />
                </div>
                
                {activePainPoint === idx && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-white/80 leading-relaxed font-light animate-fade-in-down">
                    <span className="text-[#F0C040] font-bold">الحل العملي بالدليل: </span>
                    {p.solution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OUTCOME-BASED FEATURE HIGH-LEVEL HIGHLIGHT */}
        <div className="w-full max-w-3xl space-y-4 pt-8 text-center">
          <h3 className="text-base sm:text-lg font-bold text-white">
            🚀 خمس أدوات تفاعلية صممتها إلك بالصفحة علمود تضمن نجاحك:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div 
              onClick={() => handleScrollToId("ad-simulator")}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-all cursor-pointer text-center group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🎬</div>
              <h4 className="text-[11px] font-extrabold text-white group-hover:text-[#F0C040]">محاكي الإعلانات</h4>
              <p className="text-[9px] text-white/40 mt-1 leading-normal">جرب إعلانك وشوف شكله وتأثيره قبل لا تصرف أي دينار على الترويج.</p>
            </div>

            <div 
              onClick={() => handleScrollToId("script-simulator")}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-all cursor-pointer text-center group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">💬</div>
              <h4 className="text-[11px] font-extrabold text-white group-hover:text-[#F0C040]">محاكي المحادثات</h4>
              <p className="text-[9px] text-white/40 mt-1 leading-normal">تدرب على التعامل مع الزبائن وتجرب أكثر من طريقة لتجيب طلبات مبيعات.</p>
            </div>

            <div 
              onClick={() => handleScrollToId("roi-calculator")}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-all cursor-pointer text-center group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📊</div>
              <h4 className="text-[11px] font-extrabold text-white group-hover:text-[#F0C040]">حاسبة الأرباح</h4>
              <p className="text-[9px] text-white/40 mt-1 leading-normal">احسب أرباحك وخسائرك المتوقعة قبل ما تطلق الحملة وتعرف إذا تسوى.</p>
            </div>

            <div 
              onClick={() => handleScrollToId("roi-calculator")}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-all cursor-pointer text-center group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📦</div>
              <h4 className="text-[11px] font-extrabold text-white group-hover:text-[#F0C040]">حاسبة المرتجعات</h4>
              <p className="text-[9px] text-white/40 mt-1 leading-normal">اكتشف شكد فلوس دي تخسر بسبب الطلبات المرتجعة والإلغاءات.</p>
            </div>

            <div 
              onClick={() => handleScrollToId("thirty-day-plan")}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#D4A017]/30 transition-all cursor-pointer text-center group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📅</div>
              <h4 className="text-[11px] font-extrabold text-white group-hover:text-[#F0C040]">خطة الـ 30 يوماً</h4>
              <p className="text-[9px] text-white/40 mt-1 leading-normal">امشِ على خطة يومية واضحة مصممة لتساعدك توصل لأول 100 طلب بمشروعك.</p>
            </div>
          </div>
        </div>

        {/* Action Button & Scroll Indicator */}
        <div className="flex flex-col items-center gap-6 pt-4">
          <button
            onClick={() => handleScrollToId("contents-section")}
            className="flex items-center gap-2 px-6 py-3.5 gold-gradient-bg hover:opacity-90 text-[#040B24] font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <span>ابدأ اليوم، وخلي كل دينار تصرفه يكون محسوب.</span>
            <ArrowRight className="w-4 h-4 transform rotate-180" />
          </button>

          <button
            onClick={() => handleScrollToId("contents-section")}
            className="flex flex-col items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer group"
          >
            <Mouse className="w-4 h-4 text-[#F0C040] animate-bounce" />
            <span className="font-bold tracking-widest group-hover:text-[#F0C040] transition-colors">انزل لعرض محتويات النظام والأدوات التفاعلية</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-[#F0C040] transition-colors" />
          </button>
        </div>

      </div>
    </div>
  );
}
