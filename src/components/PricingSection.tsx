/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Bot, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  UserCheck, 
  Star, 
  Flame, 
  Clock, 
  Lock, 
  HelpCircle,
  PhoneCall,
  BadgeCheck
} from "lucide-react";

interface PricingSectionProps {
  onSelectPlan?: (planType: "standard" | "vip") => void;
  onOpenUpgradeModal?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  onOpenUpgradeModal
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "vip">("vip");

  const handleChoose = (plan: "standard" | "vip") => {
    setSelectedPlan(plan);
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    } else {
      // Trigger global modal event if available
      window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
    }
  };

  return (
    <section id="pricing-section" className="py-8 sm:py-16 md:py-20 relative overflow-hidden text-right">
      {/* Background Glow Highlights - Optimized for Mobile Performance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-gradient-to-tr from-[#D4A017]/15 via-amber-600/10 to-transparent rounded-full blur-3xl sm:blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-blue-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-500/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        
        {/* SECTION HEADER & PSYCHOLOGICAL HEADLINE */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4A017]/20 via-amber-500/15 to-[#D4A017]/20 border border-[#D4A017]/50 text-xs sm:text-sm font-black text-[#F0C040] shadow-[0_0_20px_rgba(212,160,23,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-[#F0C040] animate-pulse" />
            <span>اشتراك مرة وحدة مدى الحياة • وبدون أي اشتراك شهري</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight px-2"
          >
            اختار الباقة اللي تناسب شغلك وانضم للـ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C040] via-amber-300 to-[#D4A017] drop-shadow-[0_2px_10px_rgba(240,192,64,0.3)]">1% الأوائل بالسوق</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-base text-white/75 leading-relaxed font-light px-2"
          >
            عدنا باقتين للاشتراك، وكل وحدة مصممة لهدف معين. تدفع مرة وحدة بس وتضمن وصولك الكامل ومدى الحياة لكل تحديثات وخطط الكورس والمنصة.
          </motion.p>
        </div>

        {/* VALUE ANCHORING / PSYCHOLOGICAL COMPARISON BANNER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#0F1735]/95 via-[#162354]/95 to-[#0F1735]/95 border border-[#D4A017]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute -right-10 -bottom-10 w-36 sm:w-48 h-36 sm:h-48 bg-[#D4A017]/10 rounded-full blur-xl group-hover:bg-[#D4A017]/20 transition-all duration-500" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D4A017] via-amber-500 to-amber-700 p-0.5 shrink-0 shadow-lg shadow-[#D4A017]/25">
                <div className="w-full h-full bg-[#040B24] rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-[#F0C040]">
                  <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-base font-black text-white flex items-center gap-2 flex-wrap">
                  <span>ليش هذا الاشتراك يعتبر أوفر استثمار لمشروعك؟</span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    حسبة الأرباح
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs text-white/75 font-light leading-relaxed">
                  خسارة إعلان واحد فاشل ويا كروة الراجع تكلفك أكثر من <span className="text-red-400 font-bold underline decoration-red-400/50">150,000 دينار</span>. بينما اشتراكك ويانا راح يرجعلك فلوسه أضعاف من أول 3 طلبات تبيعها صح وبدون خسائر!
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 sm:gap-3 bg-white/5 hover:bg-white/10 px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/15 text-[11px] sm:text-xs text-[#F0C040] font-bold transition-all shadow-inner">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <span>تدفع مرة وحدة • وينفتحلك الحساب مدى الحياة</span>
            </div>
          </div>
        </motion.div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* TIER 1: STANDARD SUBSCRIPTION */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between p-5 sm:p-8 relative bg-gradient-to-b from-[#0B122E]/95 via-[#0A112B]/90 to-[#040B24] backdrop-blur-md hover:-translate-y-1 ${
              selectedPlan === "standard" 
                ? "border-[#D4A017] shadow-[0_0_35px_rgba(212,160,23,0.2)]" 
                : "border-white/15 hover:border-white/30 shadow-xl"
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 sm:py-1 rounded-full mb-2 border border-amber-400/30 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-amber-300" />
                    <span>الأساس المضبوط لأصحاب المشاريع</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">الاشتراك العادي</h3>
                  <p className="text-[11px] sm:text-xs text-white/60 font-light mt-0.5">يشمل الكورس كامل ويا أدوات المنصة</p>
                </div>
                
                <div className="text-left shrink-0">
                  <div className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">29,000</div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#F0C040]">دينار</div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-block mt-0.5">مدى الحياة</span>
                </div>
              </div>

              {/* What You Learn Bullet Points */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <span className="text-[11px] sm:text-xs font-black text-white/90 uppercase tracking-wider block border-b border-white/10 pb-2">
                  📚 شنو راح تتعلم وتستفاد من المنصة؟
                </span>

                <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-white/85">
                  <li className="flex items-start gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-white font-bold">إعلانات تجيب أرباح:</strong> تعلم شلون تسوي إعلانات مضبوطة تجيب مبيعات حقيقية وتزيد طلباتك.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-white font-bold">تنزيل سعر الرسالة:</strong> شلون تنزل سعر الرسالة مالت الإعلان لأقل شي وبنفس الوقت تجيب زبائن يشترون.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-white font-bold">استهداف الزبون الصح:</strong> شلون توصل للناس الجادة اللي تريد تشتري صدك وتستبعد الفئات اللي ما منها فايدة.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-white font-bold">تحويل الرسايل لطلبات:</strong> شلون تبعد الفضوليين اللي بس يسألون ويغلسون، وتقفل البيعة ويا الزبون.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-white font-bold">أدوات جاهزة لشغلك:</strong> ينفتحلك كلشي تحتاجه مثل فحص الإعلانات، طرق الرد عالزبائن، وحاسبة الأرباح والخسائر.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleChoose("standard")}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/25 text-white font-bold text-xs sm:text-base transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group min-h-[48px]"
            >
              <span>اشترك هسة بالباقة العادية (29,000 دينار)</span>
              <ArrowRight className="w-4 h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* TIER 2: VIP SUBSCRIPTION (FEATURED / POPULAR) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl border-2 border-[#D4A017] shadow-[0_0_50px_rgba(212,160,23,0.3)] flex flex-col justify-between p-5 sm:p-8 relative bg-gradient-to-b from-[#162252] via-[#0F1738] to-[#050B24] backdrop-blur-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Ambient Inner Crown Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#D4A017]/20 rounded-full blur-2xl pointer-events-none" />

            {/* TOP POPULAR BADGE */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D4A017] via-amber-400 to-amber-500 text-[#040B24] font-black text-[11px] sm:text-xs py-1.5 sm:py-2 text-center tracking-wider shadow-lg flex items-center justify-center gap-1.5 border-b border-amber-300/40">
              <Flame className="w-3.5 h-3.5 fill-[#040B24] animate-bounce" />
              <span>🔥 الخيار الأكثر طلباً • VIP</span>
            </div>

            <div className="pt-5 sm:pt-6">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-[#D4A017]/35 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#040B24] bg-gradient-to-r from-[#F0C040] to-amber-400 px-2.5 py-0.5 rounded-full mb-2 shadow-md shadow-[#D4A017]/20">
                    <Crown className="w-3 h-3 fill-[#040B24]" />
                    <span>اشتراك الـ VIP</span>
                  </div>
                  <h3 className="text-lg sm:text-3xl font-black text-white flex items-center gap-2">
                    <span>اشتراك VIP</span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0C040] animate-pulse" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-amber-200/90 font-bold mt-0.5 leading-relaxed">إذا تريد نتيجة سريعة وبدون أخطاء وتوجيه خطوة بخطوة</p>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-2xl sm:text-5xl font-black text-[#F0C040] font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(240,192,64,0.3)]">49,000</div>
                  <div className="text-[11px] sm:text-xs font-bold text-amber-200">دينار</div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-black bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 rounded-md inline-block mt-0.5 shadow-sm">مدى الحياة</span>
                </div>
              </div>

              {/* VIP Perks */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-[#D4A017]/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2 text-[11px] sm:text-xs text-[#F0C040] font-bold shadow-inner">
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0C040] shrink-0" />
                  <span>يشمل كل ميزات الباقة العادية بالكامل + المميزات الجوا:</span>
                </div>

                <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-white">
                  <li className="flex items-start gap-2.5 sm:gap-3 bg-white/[0.06] hover:bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/25 border border-[#D4A017]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F0C040] shadow-sm">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-[#F0C040] font-bold">متابعة مباشرة وياي من تطبق:</strong> أتابعك خطوة بخطوة حتى ما تغلط وتضمن أحسن نتيجة لشغلك.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 bg-white/[0.06] hover:bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/25 border border-[#D4A017]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F0C040] shadow-sm">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-[#F0C040] font-bold">مراجعة إعلاناتك:</strong> أشيك إعلاناتك وطريقة شغلك وأنطيك التعديلات المضبوطة حتى تربح.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 bg-white/[0.06] hover:bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/25 border border-[#D4A017]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F0C040] shadow-sm">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-[#F0C040] font-bold">أجاوب كل أسئلتك أول بأول:</strong> أجاوب على كل استفساراتك بشكل مباشر وبدون أي تأخير.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 bg-white/[0.06] hover:bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/25 border border-[#D4A017]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F0C040] shadow-sm">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-[#F0C040] font-bold">أوكف وياك قبل لا تصرف:</strong> أساعدك تختار المنتج، وترتب الزبائن والعروض قبل لا تصرف أي فلس.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3 bg-white/[0.06] hover:bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/25 border border-[#D4A017]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F0C040] shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span><strong className="text-[#F0C040] font-bold">خطة مخصصة لشغلك:</strong> أرتبلك خطة تمشي عليها تناسب مشروعك إنت بالذات، مو مجرد حجي عام.</span>
                  </li>

                  <li className="flex items-start gap-2.5 sm:gap-3.5 bg-gradient-to-r from-amber-500/25 via-amber-600/15 to-[#040B24] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#D4A017]/70 shadow-[0_4px_20px_rgba(212,160,23,0.15)] relative overflow-hidden">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#D4A017] to-amber-500 flex items-center justify-center shrink-0 mt-0.5 text-[#040B24] font-black shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[#F0C040] font-black block text-xs sm:text-sm flex items-center gap-1.5">
                        🤖 مستشار فيزيون الذكي
                      </span>
                      <span className="text-white/90 text-[11px] sm:text-xs font-light leading-relaxed block mt-0.5">
                        مستشار ذكي متكامل داخل الكورس متدرب على آلاف البيجات والإعلانات الناجحة، يحلل إعلاناتك وينطيك نصائح وتعديلات فورية 24 ساعة!
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* VIP CTA Button */}
            <button
              onClick={() => handleChoose("vip")}
              className="w-full py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D4A017] via-amber-400 to-amber-500 text-[#040B24] font-black text-xs sm:text-base shadow-[0_10px_40px_rgba(212,160,23,0.45)] hover:shadow-[0_15px_50px_rgba(212,160,23,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden min-h-[50px]"
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#040B24] group-hover:rotate-12 transition-transform" />
              <span>انضم لاشتراك الـ VIP هسة واضمن نتائجك (49,000 دينار)</span>
            </button>
          </motion.div>

        </div>

        {/* GUARANTEE & TRUST FOOTER */}
        <div className="max-w-3xl mx-auto pt-8 text-center space-y-4 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/80">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>حساب يتفعل فوراً</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-[#F0C040]" />
              <span>حساب يبقى الك طول العمر</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>تقييم 4.7/5 من أكثر من 73 مشترك</span>
            </span>
          </div>

          <p className="text-[11px] text-white/50 font-light leading-relaxed">
            أول ما تكمل اشتراكك، راح تستلم كود الدخول مالتك مباشرة حتى تفتح كل الكورس وأدوات المنصة بدون أي رسوم مخفية.
          </p>
        </div>

      </div>
    </section>
  );
};