import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Mouse, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Calendar,
  Box,
  Target,
  ShieldCheck,
  Zap,
  AlertOctagon
} from "lucide-react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePainPoint, setActivePainPoint] = useState<number | null>(0);
  const [showPainRelief, setShowPainRelief] = useState(false);

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
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      // Prevent canvas reset on mobile address bar collapse/expand
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
    const maxSparks = isMobile ? 18 : 50;

    for (let i = 0; i < maxSparks; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedY: (Math.random() * -0.3) - 0.1, 
        opacity: Math.random() * 0.6 + 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.01
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        ctx.beginPath();
        
        const xWobble = s.x + Math.sin(s.wobble) * 2;
        
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

    // Trigger pain relief animation after 3 seconds
    const timer = setTimeout(() => setShowPainRelief(true), 3000);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden pt-20 sm:pt-32 pb-16 sm:pb-24 px-3 sm:px-6 text-center select-none bg-grid-pattern" id="hero-section">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80" />

      {/* Ultra Cinematic Background Glows - Mobile Optimized Radial Gradients */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[70vw] h-[70vh] bg-[radial-gradient(circle_at_center,rgba(13,27,86,0.65)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating abstract success shapes */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4A017]/10 to-transparent border border-[#D4A017]/20 backdrop-blur-md hidden lg:flex items-center justify-center pointer-events-none"
      >
        <TrendingUp className="w-8 h-8 text-[#D4A017]/50" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 40, 0], rotate: [0, -15, 5, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[30%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500/5 to-transparent border border-emerald-500/10 backdrop-blur-md hidden lg:flex items-center justify-center pointer-events-none"
      >
        <Target className="w-10 h-10 text-emerald-500/40" />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl z-10 space-y-10 sm:space-y-20 flex flex-col items-center w-full relative"
      >
        

        {/* Hyper-Emotional Headings */}
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-8 max-w-5xl relative z-10 px-1">
          <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-white tracking-tight leading-snug sm:leading-[1.1] drop-shadow-2xl">
            كل الأدوات والأسرار اللي تمنيت تعرفها من <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300">أول يوم ضيعت بي فلوسك</span>…
          </h1>
          
          <div className="relative inline-block mt-2 sm:mt-4">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              className="absolute -bottom-1 sm:-bottom-4 left-0 right-0 h-2.5 sm:h-6 bg-[#D4A017]/30 origin-right -z-10 rounded-full"
            />
            <h2 className="text-3.5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-none gold-gradient-text drop-shadow-[0_0_40px_rgba(212,160,23,0.3)]">
              صارت بمكان واحد!
            </h2>
          </div>
          
          <p className="text-xs sm:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed pt-3 sm:pt-6">
            وداعاً للتخمين، وداعاً للرسائل الفارغة، وداعاً للمرتجعات. <br className="hidden sm:block" />
            <strong className="text-white font-bold">هذا النظام صُمم ليمسك بيدك ويحول مشروعك إلى آلة أرباح حقيقية.</strong>
          </p>

          {/* Executive Metrics Highlight Bar */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1735]/90 to-[#040B24] border border-[#D4A017]/30 backdrop-blur-md text-center shadow-lg hover:border-[#F0C040]/60 transition-all duration-300 group">
              <span className="text-[10px] sm:text-xs text-[#F0C040] font-black block mb-0.5">معدل رفع المبيعات</span>
              <span className="text-lg sm:text-2xl font-black text-white group-hover:text-[#F0C040] transition-colors">+300%</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1735]/90 to-[#040B24] border border-emerald-500/30 backdrop-blur-md text-center shadow-lg hover:border-emerald-400/60 transition-all duration-300 group">
              <span className="text-[10px] sm:text-xs text-emerald-400 font-black block mb-0.5">نسبة المرتجعات</span>
              <span className="text-lg sm:text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">&lt; 8%</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1735]/90 to-[#040B24] border border-[#D4A017]/30 backdrop-blur-md text-center shadow-lg hover:border-[#F0C040]/60 transition-all duration-300 group">
              <span className="text-[10px] sm:text-xs text-[#F0C040] font-black block mb-0.5">عائد الاستثمار المستهدف</span>
              <span className="text-lg sm:text-2xl font-black text-white group-hover:text-[#F0C040] transition-colors">4.5x ROAS</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1735]/90 to-[#040B24] border border-cyan-500/30 backdrop-blur-md text-center shadow-lg hover:border-cyan-400/60 transition-all duration-300 group">
              <span className="text-[10px] sm:text-xs text-cyan-400 font-black block mb-0.5">أدوات تشغيلية حية</span>
              <span className="text-lg sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">13 أداة تفاعلية</span>
            </div>
          </div>
        </motion.div>

        {/* Shimmering Divider */}
        <motion.div variants={itemVariants} className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/50 to-transparent shadow-[0_0_30px_#D4A017]" />

        {/* The Epiphany Letter (Extreme Trust Builder) */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl relative group">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-[#D4A017]/0 via-[#D4A017]/10 to-[#D4A017]/0 rounded-2xl sm:rounded-[2.5rem] blur-xl group-hover:via-[#D4A017]/20 transition-all duration-700" />
          <div className="relative bg-gradient-to-b from-[#0F1735]/90 to-[#040B24]/95 backdrop-blur-2xl border border-[#D4A017]/20 p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] text-right space-y-4 sm:space-y-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D4A017] to-amber-600 flex items-center justify-center shadow-lg shadow-[#D4A017]/20 shrink-0">
                  <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-[#040B24]" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-2xl text-white">رسالة صريحة قبل لا تبدأ..</h3>
                  <p className="text-xs sm:text-sm text-[#F0C040] font-bold">لأن شبعنا خسارة وتعلمنا من أخطائنا</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-6">
              <p className="text-xs sm:text-lg text-white/80 leading-relaxed font-light">
                أعرف تماماً الإحساس الخانق.. تصرف مئات الدولارات على إعلانات فيسبوك، وتجيك عشرات الرسائل تسأل <span className="text-red-400 font-bold px-1.5 py-0.5 bg-red-400/10 rounded-md">"ببيش عيني؟"</span>، ولما تجاوبهم، يختفون كأنهم لم يكونوا.
              </p>
              <p className="text-xs sm:text-lg text-white/80 leading-relaxed font-light">
                أعرف الإحباط اللي يصيبك لما تتصل بزبون وما يرد، أو لما المندوب يرجعلك بضاعة وتتحمل أنت <span className="text-red-400 font-bold">تكلفة الشحن وقهر الخسارة</span>. تحس إنك تدور في حلقة مفرغة، تتعب وتدفع، والمحصلة: صفر أرباح حقيقية بيدك.
              </p>
              
              <div className="relative mt-4 sm:mt-8 p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-900/30 to-transparent border-r-4 border-emerald-50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTYsIDE4NSwgMTI5LCAwLjEpIi8+PC9zdmc+')] opacity-50" />
                <p className="relative z-10 text-xs sm:text-xl text-emerald-50 leading-relaxed font-black">
                  تخيل وياي: كل رسالة تجيك تتحول لطلب مؤكد.. وكل دينار تصرفه بالإعلان يرجعلك أرباح.. والمندوب يسلّمك أرباحك كاش بيدك بدون ما يرجعلك طرد راجع. <span className="text-emerald-400">هذا هو هدف دليل Vizion بالضبط.</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transformational Switch (Pain to Power) */}
        <motion.div variants={itemVariants} className="w-full max-w-5xl pt-6 sm:pt-12 relative">
          <div className="text-center mb-6 sm:mb-12">
             <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-4">لماذا نحن <span className="text-[#F0C040]">طوق النجاة</span> الوحيد لك؟</h3>
             <p className="text-white/60 text-xs sm:text-lg">الفرق بين الخسارة والربح ليس الحظ.. بل النظام التشغيلي.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 text-right relative">
            {/* The Invisible Divider Line */}
            <div className="hidden lg:block absolute left-1/2 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

            {/* PAIN ZONE */}
            <div className="space-y-3 sm:space-y-6 relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/30 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-2">
                <AlertOctagon className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 shrink-0" />
                <h4 className="text-sm sm:text-xl font-black text-red-400">بدون نظامنا (وضعك الحالي)</h4>
              </div>
              
              <ul className="space-y-2.5 sm:space-y-5">
                {[
                  "إعلانات تحرق ميزانيتك على أشخاص غير مهتمين بالشراء فعلياً.",
                  "مرتجعات كارثية تكسر ظهرك وتأكل كل أرباحك وتزيد ديونك.",
                  "رسائل كثيرة تسأل عن السعر بدون أي نية حقيقية لإتمام الطلب.",
                  "عشوائية تامة، تطلق الحملة وتدعي أن تنجح بالصدفة."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.01] border border-white/5 opacity-80">
                    <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-base text-white/70 font-medium leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* POWER ZONE */}
            <div className="space-y-3 sm:space-y-6 relative">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-2 relative z-10">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-400/40 rounded-full animate-ping" />
                    <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 relative z-10 shrink-0" />
                  </div>
                  <h4 className="text-sm sm:text-xl font-black text-emerald-400">مع نظام Vizion (مستقبلك)</h4>
                </div>
                
                <ul className="space-y-2.5 sm:space-y-5 relative z-10">
                  {[
                    "فلترة حادة تقصي الفضوليين، وتجلب لك المشتري الجاهز للدفع.",
                    "نسبة مرتجعات أقل من 10% عبر نظام 'تأكيد الطلب الصارم'.",
                    "سكريبتات إغلاق سيكولوجية تحول محادثة الـ 'شكد السعر' إلى مبيعة.",
                    "لوحة تحكم بالأرقام تخبرك بالضبط متى تضاعف ميزانية إعلانك الرابح."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-900/10 to-transparent border border-emerald-500/20 shadow-lg shadow-emerald-900/5">
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-xs sm:text-base text-emerald-50/90 font-bold leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 10 PAIN POINTS INTERACTIVE ACCORDION */}
        <motion.div variants={itemVariants} className="w-full max-w-5xl space-y-6 sm:space-y-10 pt-8 sm:pt-16 text-right">
          <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-14">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-full bg-[#D4A017]/10 mb-2 border border-[#D4A017]/20">
              <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-[#F0C040]" />
            </div>
            <h3 className="text-xl sm:text-4xl font-black text-white">
              مشاكلك الحالية.. <span className="text-[#F0C040]">لدينا حلها الجذري</span>
            </h3>
            <p className="text-xs sm:text-xl text-white/60 max-w-2xl mx-auto font-light">اضغط على العائق الذي يواجهك الآن، لتكتشف كيف ينسفه النظام بضغطة زر.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {painPoints.map((p, idx) => {
              const isActive = activePainPoint === idx;
              return (
                <div 
                  key={p.id}
                  onClick={() => setActivePainPoint(isActive ? null : idx)}
                  className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl text-right transition-all duration-300 cursor-pointer border relative overflow-hidden group ${
                    isActive 
                      ? "bg-gradient-to-br from-[#D4A017]/15 to-[#040B24] border-[#D4A017]/50 shadow-[0_10px_30px_rgba(212,160,23,0.15)]" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  {isActive && <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#F0C040] to-[#D4A017] shadow-[0_0_15px_#F0C040]" />}
                  
                  <div className="flex items-start gap-2.5 sm:gap-4 justify-between">
                    <div className="flex items-start gap-2.5 sm:gap-4">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${isActive ? 'bg-[#D4A017] text-[#040B24] shadow-[0_0_15px_#D4A017]' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                        {p.id}
                      </div>
                      <h4 className={`text-xs sm:text-lg font-bold leading-relaxed pr-0.5 transition-colors ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{p.title}</h4>
                    </div>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#D4A017]/20 rotate-180' : 'bg-transparent group-hover:bg-white/5'}`}>
                      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isActive ? "text-[#F0C040]" : "text-white/30 group-hover:text-white/60"}`} />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-white/10 text-xs sm:text-base text-white/90 leading-relaxed font-medium">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#F0C040]" />
                            <span className="text-[#F0C040] font-black tracking-wide text-xs sm:text-sm">آلية الحل في النظام:</span>
                          </div>
                          <p className="pr-3 sm:pr-6 border-r-2 border-[#D4A017]/30 text-emerald-50/90 text-xs sm:text-base">{p.solution}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA SECTION */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 sm:gap-10 pt-10 sm:pt-20 pb-6 w-full relative z-20">
          <div className="relative group cursor-pointer w-full max-w-md mx-auto" onClick={() => handleScrollToId("contents-section")}>
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-[#F0C040] via-[#D4A017] to-[#F0C040] rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse-slow" />
            <button className="relative flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 bg-gradient-to-b from-[#F0C040] to-[#D4A017] border border-[#F0C040]/50 text-[#040B24] rounded-2xl sm:rounded-3xl w-full transition-all active:scale-95 shadow-[0_0_40px_rgba(212,160,23,0.3)] cursor-pointer">
              <div className="flex flex-col items-start text-right">
                <span className="text-base sm:text-2xl font-black">ابدأ رحلة الأرباح الآن</span>
                <span className="text-xs sm:text-sm font-bold opacity-80">تصفح النظام التشغيلي بالكامل مجاناً</span>
              </div>
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-180 text-[#040B24]" />
              </div>
            </button>
          </div>

          <button
            onClick={() => handleScrollToId("contents-section")}
            className="flex flex-col items-center gap-2 text-xs text-white/50 hover:text-white transition-colors cursor-pointer group"
          >
            <div className="w-8 h-12 sm:w-10 sm:h-16 border-2 border-white/20 rounded-full flex justify-center pt-1.5 group-hover:border-[#F0C040] transition-colors relative">
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-2.5 sm:w-1.5 sm:h-3 bg-white/60 group-hover:bg-[#F0C040] rounded-full"
              />
            </div>
            <span className="font-bold tracking-wider uppercase group-hover:text-[#F0C040] transition-colors">استكشف التفاصيل بالأسفل</span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
