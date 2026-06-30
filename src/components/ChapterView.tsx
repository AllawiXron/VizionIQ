/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, HelpCircle, Star, ShieldCheck, Phone, Compass, ArrowLeftRight, Clock, MapPin, Users } from "lucide-react";
import { citiesData, commonProblems, diagnosticSteps, trustChecklist } from "../data/chaptersData";

// Import custom interactive sub-components
import RoiCalculator from "./RoiCalculator";
import AdSimulator from "./AdSimulator";
import ScriptSimulator from "./ScriptSimulator";
import ThirtyDayPlan from "./ThirtyDayPlan";

interface ChapterViewProps {
  key?: string;
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

export default function ChapterView({ id, number, title, subtitle, icon, description }: ChapterViewProps) {
  return (
    <section
      id={id}
      className="py-8 md:py-16 border-b border-white/5 relative scroll-mt-16 overflow-hidden"
    >

      {/* Subtle Background Chapter Number Graphic for Cinematic Feel */}
      <div className="absolute top-12 left-6 text-[110px] md:text-[180px] font-black text-white/[0.015] select-none pointer-events-none font-sans leading-none">
        {id === "chapter1" && "01"}
        {id === "chapter2" && "02"}
        {id === "chapter3" && "03"}
        {id === "chapter4" && "04"}
        {id === "chapter5" && "05"}
        {id === "chapter6" && "06"}
        {id === "chapter7" && "07"}
        {id === "chapter8" && "08"}
        {id === "chapter9" && "09"}
      </div>

      {/* Chapter Banner Hero */}
      <div className="relative glass-panel rounded-2xl p-5 md:p-10 mb-6 md:mb-10 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-1.5 h-full gold-gradient-bg" />
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-bold text-[#F0C040] uppercase tracking-widest bg-[#D4A017]/10 px-3 py-1 rounded-full border border-[#D4A017]/20">
            {number}
          </span>
          <span className="text-2xl">{icon}</span>
        </div>

        <h2 className="text-2xl md:text-3.5xl font-extrabold text-white leading-tight mb-3">
          {title}
        </h2>
        
        <p className="text-sm md:text-base text-[#F0F4FF]/75 leading-relaxed font-light max-w-3xl">
          {subtitle}
        </p>

        <div className="w-16 h-[2px] bg-[#D4A017]/40 my-4" />
        
        <p className="text-xs md:text-sm text-[#F0F4FF]/55 leading-relaxed font-light">
          {description}
        </p>
      </div>

      {/* Dynamic Content Switching Based on Chapter ID */}

      {/* 1. UNDERSTANDING THE IRAQI MARKET */}
      {id === "chapter1" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:border-white/10 shadow-lg">
              <span className="text-2xl mb-1 block">👥</span>
              <span className="text-2xl md:text-3xl font-black text-[#F0C040] font-mono">43M+</span>
              <span className="text-xs text-white/50 block mt-1 font-semibold">إجمالي سكان العراق</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:border-white/10 shadow-lg">
              <span className="text-2xl mb-1 block">📶</span>
              <span className="text-2xl md:text-3xl font-black text-[#F0C040] font-mono">32M+</span>
              <span className="text-xs text-white/50 block mt-1 font-semibold">مستخدمي الإنترنت النشطين</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:border-white/10 shadow-lg">
              <span className="text-2xl mb-1 block">💵</span>
              <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">99%</span>
              <span className="text-xs text-white/50 block mt-1 font-semibold">الدفع نقدًا عند الاستلام (COD)</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:border-white/10 shadow-lg">
              <span className="text-2xl mb-1 block">📦</span>
              <span className="text-2xl md:text-3xl font-black text-[#F0C040] font-mono">18</span>
              <span className="text-xs text-white/50 block mt-1 font-semibold">تغطية شحن لكافة المحافظات</span>
            </div>
          </div>

          {/* Regional Table with Shipping Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F0C040] flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              أرقام الشحن والقدرة الشرائية بحسب المحافظة العراقية لعام ٢٠٢٦:
            </h4>
            
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl bg-black/30">
              <table className="w-full text-right text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-[#0D1B56] border-b border-white/10 text-[#F0C040] font-bold text-center">
                    <th className="py-3 px-4 text-right">المحافظة</th>
                    <th className="py-3 px-4">متوسط تكلفة الشحن</th>
                    <th className="py-3 px-4">مدة التوصيل المعتادة</th>
                    <th className="py-3 px-4">القوة الشرائية والاهتمام</th>
                    <th className="py-3 px-4">نسبة الطلبيات الكلية بالعراق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-center">
                  {citiesData.map((city, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 text-right font-bold text-white">{city.name}</td>
                      <td className="py-3 px-4 text-white/90 font-mono">{city.shippingCost}</td>
                      <td className="py-3 px-4 text-white/80">{city.deliveryTime}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          city.power === "عالية جداً" || city.power === "عالية"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}>
                          {city.power}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#F0C040]">{city.activeRatio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-white/40">* تذكر أن نسبة الاستلام والالتزام تكون في بغداد الأعلى نظراً لسرعة الشحن ووفرة وسائل الاتصال والمندوبين.</p>
          </div>

          {/* Callout Information boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Callout: Success Style (Green) */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 flex gap-4 items-start shadow-md">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h5 className="text-sm font-bold text-emerald-300">نصيحة الاستحواذ الذهبية:</h5>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  المواسم الذهبية في العراق تتمركز حول **شهر رمضان وعيد الفطر** و**بداية الشتاء** و**رأس السنة الميلادية**. في هذه الفترات، تزيد المبيعات بنسبة تفوق ٢٥٠٪، والجمهور يكون مستعداً للدفع الفوري مقابل العروض الحزمية المغرية.
                </p>
              </div>
            </div>

            {/* Callout: Danger Style (Red) */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/25 flex gap-4 items-start shadow-md">
              <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1.5">
                <h5 className="text-sm font-bold text-red-300">تحذير تجاري خطير:</h5>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  تجنب طلب دفع عربون مسبق عبر مكاتب الصيرفة أو رصيد آسيا سيل من الزبون العادي! هذا يدمر الثقة فوراً ويؤدي لإلغاء الطلبيات بنسبة ٩٠٪. الثقة في العراق تُبنى فقط على مبدأ الدفع عند الاستلام الكامل (COD) وفحص السلعة.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. DIAGNOSING ISSUES */}
      {id === "chapter2" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Step Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F0C040] block">🛠️ خطوات تتبع الخلل الإعلاني الممنهج (Diagnostic Flow):</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connector Line on Desktop */}
              <div className="hidden md:block absolute top-[28px] inset-x-8 h-[2px] bg-white/10 -z-10" />

              {diagnosticSteps.map((step, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 relative shadow hover:border-[#D4A017]/30 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4A017] to-[#F0C040] text-[#040B24] font-black text-xs flex items-center justify-center mb-3">
                    {step.step}
                  </div>
                  <h5 className="font-bold text-white text-xs mb-1.5">{step.title}</h5>
                  <p className="text-[11px] text-white/60 leading-relaxed font-light mb-2">{step.desc}</p>
                  <div className="text-[10px] bg-black/40 p-2 rounded text-[#F0C040] leading-normal font-mono font-medium">
                    {step.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Callout List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F0C040] block">🔍 المشاكل الأربع الأكثر شيوعاً وعلاجاتها السريعة:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonProblems.map((prob, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex gap-4 items-start shadow ${
                    prob.level === "danger"
                      ? "bg-red-500/5 border-red-500/25"
                      : "bg-amber-500/5 border-amber-500/25"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${
                    prob.level === "danger" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    ⚠️
                  </div>
                  <div className="space-y-1.5">
                    <h5 className={`text-xs font-bold ${prob.level === "danger" ? "text-red-300" : "text-amber-300"}`}>
                      {prob.problem}
                    </h5>
                    <p className="text-[11px] text-white/50 block font-medium">الأعراض: {prob.symptom}</p>
                    <p className="text-xs text-white/80 leading-relaxed font-light">العلاج الفوري: {prob.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AD ACCOUNT SETUP */}
      {id === "chapter3" && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-[#F0C040] leading-relaxed">
            📢 <strong>تنبيه مالي مهم جداً:</strong> عند فتح الحساب الإعلاني على فيسبوك، يفضّل إعداده بعملة <strong>الدولار الأمريكي ($)</strong> وليس بالدينار العراقي. بطاقات الدفع الإلكتروني العراقية (مثل زين كاش، ماستركارد الرافدين، فيزا كارد طيف أو الهدى) تحسب سعر الصرف المعتمد بالدولار بشكل أفضل وبلا فجوات ضريبية إضافية بالتحويل.
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-[#1877F2]/40 transition-all text-right shadow-md">
              <span className="text-2xl mb-2">🔵</span>
              <h5 className="font-bold text-white text-sm mb-1">فيسبوك إعلانات</h5>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">المنصة الملكية في العراق لكافة الفئات السنية من ١٨ إلى ٦٥ سنة. الأنسب لبيع السلع الاستهلاكية وأدوات المنزل والسيارات.</p>
              <span className="text-[9px] text-[#F0C040] font-bold mt-3 bg-white/10 px-2 py-0.5 rounded-full inline-block w-max">قوة شراء: عالية جداً</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-[#E1306C]/40 transition-all text-right shadow-md">
              <span className="text-2xl mb-2">🟣</span>
              <h5 className="font-bold text-white text-sm mb-1">إنستغرام إعلانات</h5>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">جمهور نسائي وشبابي ضخم جداً خصوصاً في بغداد والمنطقة الكردية والموصل. الأنسب للأزياء، مستحضرات التجميل، والساعات.</p>
              <span className="text-[9px] text-[#F0C040] font-bold mt-3 bg-white/10 px-2 py-0.5 rounded-full inline-block w-max">قوة شراء: ممتازة</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400/40 transition-all text-right shadow-md">
              <span className="text-2xl mb-2">⚫</span>
              <h5 className="font-bold text-white text-sm mb-1">تيك توك إعلانات</h5>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">انفجار استهلاكي مذهل للشباب والمراهقين. الأنسب للمنتجات الغريبة ذات المظهر البصري والحل السريع للمشاكل اليومية.</p>
              <span className="text-[9px] text-[#F0C040] font-bold mt-3 bg-white/10 px-2 py-0.5 rounded-full inline-block w-max">قوة شراء: متوسطة</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all text-right shadow-md">
              <span className="text-2xl mb-2">🟢</span>
              <h5 className="font-bold text-white text-sm mb-1">واتساب المبيعات</h5>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">السر المحفز للمبيعات! توجيه العملاء إلى واتساب للأعمال (WhatsApp Business) يسهل إقناع المشتري المتخوف وإتمام الدفع.</p>
              <span className="text-[9px] text-[#F0C040] font-bold mt-3 bg-white/10 px-2 py-0.5 rounded-full inline-block w-max">معدل تحويل: خارق</span>
            </div>

          </div>

          {/* هدف الحملة setblock */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#F0C040]" />
              🎯 إعداد هدف الحملة (Campaign Objective):
            </h5>
            
            <div className="space-y-3">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                <span className="font-bold text-[#F0C040] sm:w-1/3">هدف الحملة لمن يبيع بالرسائل (بدون موقع):</span>
                <span className="text-white/80 sm:w-2/3 leading-relaxed">
                  تحديد الهدف كـ <strong>"Sales" (المبيعات)</strong> أو <strong>"Engagement" (التفاعل)</strong> وتوجيه الزبائن إلى <strong>"Messages" (الرسائل)</strong>.
                </span>
              </div>
              
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                <span className="font-bold text-white/50 sm:w-1/3">هدف الحملة لمن يملك موقع ويب:</span>
                <span className="text-white/50 sm:w-2/3 leading-relaxed">
                  تحديد الهدف كـ <strong>"Sales" (المبيعات)</strong> وتوجيه زوار الإعلانات إلى <strong>"Website" (موقع الويب)</strong> مع تهيئة كود بكسل التتبع.
                </span>
              </div>
            </div>

            {/* Callout cg (Success / Green) */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/25 flex gap-3 items-start text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h6 className="font-bold text-emerald-300">💡 إذا ما عندك موقع شراء، هذا هو الإعداد الصحيح لك:</h6>
                <p className="text-white/80 leading-relaxed">
                  بما أن أغلب البيع في العراق يعتمد بالكامل على محادثات تطبيقات المراسلة، فإن اختيار هدف "الرسائل" يوجه ميزانيتك مباشرة للأشخاص الأكثر حماسة لفتح محادثة فعلية والاستفسار عن منتجك، بدلاً من إرسال زوار عشوائيين لموقع غير مهيأ.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#F0C040]" />
              💡 إعدادات الاستهداف الجغرافي السليم:
            </h5>
            <p className="text-xs text-white/80 leading-relaxed font-light">
              لتبدأ بأمان، أنشئ حملتك الإعلانية واستهدف في البداية <strong>المحافظات الكبرى ذات التوصيل السريع</strong> (بغداد، البصرة، أربيل، بابل، النجف) واستثنِ المناطق الوعرة أو الحدودية لتقليل تكاليف الإرجاع والوصول بالبداية. احرص على استخدام الاستهداف الواسع (Broad Targeting) دون فلاتر اهتمامات معقدة بالبداية لتسمح لفيسبوك بالبحث عن المشتري بذكاء وحرية كاملة.
            </p>
          </div>
        </div>
      )}

      {/* 4. CAMPAIGN STRUCTURE */}
      {id === "chapter4" && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ABO Strategy */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#F0C040] bg-white/10 px-2.5 py-1 rounded-full">استراتيجية ABO</span>
                <span className="text-[10px] text-white/50">Ad Set Budget Optimization</span>
              </div>
              <h5 className="text-base font-bold text-white">التحكم الفردي بالميزانية (أفضل لاختبار المنتجات)</h5>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                في هذه الطريقة، تحدد لكل مجموعة إعلانية ميزانية يومية مخصصة (مثلاً $5 لكل مجموعة). هذه الطريقة ممتازة عند اختبار كروت إعلانية متعددة أو جمهورين مختلفين للتأكد من صرف متساوٍ وعادل على كافة الأفكار دون انحياز الخوارزمية لواحد على حساب الآخر.
              </p>
            </div>

            {/* CBO Strategy */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#F0C040] bg-white/10 px-2.5 py-1 rounded-full">استراتيجية CBO</span>
                <span className="text-[10px] text-white/50">Campaign Budget Optimization</span>
              </div>
              <h5 className="text-base font-bold text-white">تحسين ميزانية الحملة بالكامل (أفضل للتوسع والسكيلنغ)</h5>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                في هذه الطريقة، تحدد ميزانية شاملة للحملة بالكامل (مثلاً $30 باليوم) ويقوم فيسبوك بتوزيع الأموال ديناميكياً على المجموعات الإعلانية الأفضل أداءً وتفاعلاً. ممتازة جداً لمضاعفة المبيعات والتوسيع الهيكلي والاعتماد على الذكاء الاصطناعي لـ Meta.
              </p>
            </div>

          </div>

          {/* خطوات إنشاء الحملة خطوة بخطوة */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#F0C040]" />
              ⚙️ خطوات إنشاء الحملة خطوة بخطوة لعام ٢٠٢٦:
            </h5>

            {/* Callout cw (Amber/Warning) */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start text-xs">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h6 className="font-bold text-amber-300">⚠️ تنبيه حاسم للمسوقين بالرسائل:</h6>
                <p className="text-white/80 leading-relaxed">
                  إذا تبيع عن طريق الرسائل وما عندك موقع شراء، تجاوز الخطوتين ٢ و٣ بالكامل — هذي خاصة لمن يبيع من موقع ويب. وتوجه مباشرة للخطوة البديلة (الخطوة ٢-مكرر) لتأمين حملتك ومحادثاتك.
                </p>
              </div>
            </div>

            {/* Steps timeline */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs flex items-center justify-center">١</span>
                  <span className="font-bold text-white text-xs">الخطوة الأولى: تحديد إعدادات الحملة الأساسية</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-light mr-8">
                  أنشئ حملة جديدة في مدير الإعلانات (Ads Manager)، وحدد هدف المبيعات أو التفاعل العام، وفعل الميزانية على مستوى الحملة (CBO) أو المجموعات (ABO).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 opacity-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 font-black text-xs flex items-center justify-center">٢</span>
                  <span className="font-bold text-white/50 text-xs line-through">الخطوة الثانية: تثبيت البكسل (Pixel Installation)</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-light mr-8">
                  [تجاوزها إذا تبيع بالرسائل] ربط وتثبيت كود البكسل على موقعك الإلكتروني لتتبع زيارات المشترين وصفحة إتمام الطلب الشاملة.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 opacity-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 font-black text-xs flex items-center justify-center">٣</span>
                  <span className="font-bold text-white/50 text-xs line-through">الخطوة الثالثة: ربط واجهة أحداث الخادم (Conversions API)</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-light mr-8">
                  [تجاوزها إذا تبيع بالرسائل] إرسال بيانات الشراء مباشرة من السيرفر إلى فيسبوك لضمان تطابق الأحداث وتفادي عوائق حظر متصفحات iOS.
                </p>
              </div>

              {/* Step 2-alt */}
              <div className="p-4 bg-[#D4A017]/5 rounded-xl border border-[#D4A017]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-6 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs flex items-center justify-center shrink-0">٢-مكرر</span>
                  <span className="font-bold text-[#F0C040] text-xs">الخطوة البديلة: ربط واتساب بزر الإعلان (Click to WhatsApp/Messages)</span>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed font-light mr-10">
                  إذا كنت تبيع بالمحادثات، في مستوى المجموعة الإعلانية اختر <strong>"Messaging Apps"</strong> كوجهة للحملة الإعلانية، وحدد حساب <strong>WhatsApp Business</strong> أو Messenger المربوط بصفحتك. في مستوى الإعلان، اختر زر الدعوة لاتخاذ إجراء (CTA) ليكون <strong>"Send Message" (إرسال رسالة)</strong> لتوجيه الزبون فوراً لبدء المحادثة بنقرة واحدة!
                </p>
              </div>
            </div>
          </div>

          {/* Quick budget structure table */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h5 className="text-xs font-bold text-white">📋 نموذج هيكلة حملة مبيعات (Sales Campaign) مقترحة للبلد:</h5>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-right text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-[#0D1B56] text-[#F0C040] font-bold text-center border-b border-white/10">
                    <th className="py-2.5 px-3 text-right">مستوى الحملة</th>
                    <th className="py-2.5 px-3">النوع المقترح</th>
                    <th className="py-2.5 px-3">الميزانية التقديرية للبدء</th>
                    <th className="py-2.5 px-3">الجمهور والهدف بالبلد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-center leading-relaxed">
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">حملة المبيعات الرئيسية</td>
                    <td className="py-2.5 px-3 font-mono text-[#F0C040]">CBO Campaign</td>
                    <td className="py-2.5 px-3 font-mono">$5 - $8 يومياً</td>
                    <td className="py-2.5 px-3">العراق بالكامل (إيقاف من يرفض الشراء بالتحليل)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">المجموعة الإعلانية 1</td>
                    <td className="py-2.5 px-3">Broad Targeting</td>
                    <td className="py-2.5 px-3">مفتوحة من الحملة</td>
                    <td className="py-2.5 px-3">نساء ورجال ٢٢-٤٥ سنة بدون اهتمامات محددة</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">المجموعة الإعلانية 2</td>
                    <td className="py-2.5 px-3">Interest Targeting</td>
                    <td className="py-2.5 px-3">مفتوحة من الحملة</td>
                    <td className="py-2.5 px-3">استهداف المهتمين بالتسوق والماركات والموضة</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. AD DESIGN & CREATIVE PRODUCTION */}
      {id === "chapter5" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Theory card */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h5 className="text-sm font-bold text-[#F0C040]">🎬 معادلة الفيديو الإعلاني العراقي الخارق (الفوز السريع):</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-emerald-400">01. الخطاف البصري (First 3s):</span>
                <p className="text-white/70 font-light leading-relaxed">ابدأ بفيديو يثير المشكلة فوراً بلغة عراقية صريحة. مثلاً: (الكهربا طفت والجو جهنم؟ هذا هو المبرد الذكي المحمول..)</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-amber-400">02. الاستعراض والبرهان (Show Product):</span>
                <p className="text-white/70 font-light leading-relaxed">استعرض طريقة استخدام المنتج بسهولة. أظهر تفاصيل الخامة والجودة الحقيقية باليد لتزيل شكوك التقليد السلعي.</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-cyan-400">03. العرض والضمان (Offer & Call):</span>
                <p className="text-white/70 font-light leading-relaxed">ادعُ العميل للطلب مباشرة. وضّح: (التوصيل مجاني ولفحص قبل الدفع). لا تجبر العميل على تخمين السعر فهذا يفقده اهتمامه.</p>
              </div>
            </div>
          </div>

          {/* Interactive Ad Simulator */}
          <AdSimulator />
        </div>
      )}

      {/* 6. TRUST BUILDING */}
      {id === "chapter6" && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Checklist items */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#F0C040]">🤝 العوامل الذهبية الخمسة لبناء الثقة الكاملة في متجرك:</h4>
              
              <div className="space-y-2.5">
                {trustChecklist.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-white/95 leading-relaxed font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Design guidance callouts */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-semibold text-[#F0C040] block">⚡ تحسين سرعة صفحة الهبوط على شبكات الموبايل:</span>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                أغلب زوار موقعك في العراق يتصفحون باستخدام باقات الهواتف المحمولة للإنترنت (زين، كورك، آسيا سيل) والتي قد تكون بطيئة أو متقلبة بالمناطق البعيدة.
              </p>
              <div className="space-y-2.5 text-[11px] text-[#F0C040] leading-relaxed font-semibold">
                <p>🚀 ١. اضغط كل الصور للامتداد WebP لتقليص الوزن بنسبة ٨٠٪.</p>
                <p>🚀 ٢. لا تضع فيديوهات إعلانية ثقيلة تعمل تلقائياً بالموقع. ارفعها على يوتيوب أو صغر جودتها.</p>
                <p>🚀 ٣. ألغِ كافة الحقول غير الضرورية في السلة. الاسم ورقم الهاتف والمحافظة فقط كافيان جداً لإتمام الشحن.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. DELIVERY & SHIPPING MANAGING (COD) */}
      {id === "chapter7" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Operations workflow */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F0C040]" />
              دورة حياة الطلب الهاتفي الناجح في العراق (Cash On Delivery):
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="font-bold text-[#F0C040] block mb-1">١. الاستقبال والتحقق:</span>
                <p className="text-white/70 font-light leading-relaxed">استلم الطلب من المتجر. اتصل فوراً بالزبون لتأكيد المقاس أو اللون والعنوان الدقيق وموقع التوصيل الدقيق.</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="font-bold text-[#F0C040] block mb-1">٢. الفرز والإرسال:</span>
                <p className="text-white/70 font-light leading-relaxed">غلّف المنتج بإتقان وضع كود المشتري في مكان واضح. سلّمه لمندوب شركة الشحن في نفس اليوم لتسريع الخروج.</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="font-bold text-[#F0C040] block mb-1">٣. التذكير والتسلم:</span>
                <p className="text-white/70 font-light leading-relaxed">أرسل رسالة واتساب للزبون يوم خروج المندوب: (مندوبنا بالدرب يرجى تجهيز الكاش). لرفع نسبة التسليم ومنع تراجع العميل.</p>
              </div>
            </div>
          </div>

          {/* Interactive Telephone Sales Script Selector */}
          <ScriptSimulator />
        </div>
      )}

      {/* 8. ANALYTICS & STATS CALCULATION */}
      {id === "chapter8" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Formula metrics explanations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1 shadow">
              <span className="text-xs text-[#F0C040] font-bold block">CTR (نسبة النقر للظهور)</span>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">يقيس جاذبية الإعلان الإبداعي. الهدف الذهبي أن يكون أعلى من **1.5%**. إذا كان أقل، غير الفيديو فوراً.</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1 shadow">
              <span className="text-xs text-emerald-400 font-bold block">CPM (تكلفة الألف ظهور)</span>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">توضح مدى المنافسة ونظافة الحساب. في العراق CPM الصحيح والممتاز يقع بين **$1.5 إلى $3.5**.</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-1 shadow">
              <span className="text-xs text-red-400 font-bold block">CPA (تكلفة الاستحواذ للطلب)</span>
              <p className="text-[11px] text-white/70 leading-relaxed font-light">المقياس الأهم لمقدار ربحك. تكلفة الطلب المثالية بالمتجر في العراق يجب ألا تفوق **$3 إلى $4.5** بحد أقصى.</p>
            </div>
          </div>

          {/* Table 1: Website KPIs */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h5 className="text-sm font-bold text-[#F0C040] flex items-center gap-2">
              <span>📊</span>
              <span>مؤشرات قياس الأداء للمواقع الإلكترونية (بكسل الشراء)</span>
            </h5>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-right text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-[#0D1B56] text-[#F0C040] font-bold text-center border-b border-white/10">
                    <th className="py-2.5 px-3 text-right">المؤشر (KPI)</th>
                    <th className="py-2.5 px-3">ماذا يقيس</th>
                    <th className="py-2.5 px-3">الهدف المثالي بالعراق l لعام ٢٠٢٦</th>
                    <th className="py-2.5 px-3">علامة الخطر وعلاجها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-center leading-relaxed">
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">نسبة النقر (CTR)</td>
                    <td className="py-2.5 px-3 text-white/70">مدى جاذبية وجودة الفيديو الإعلاني</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">أعلى من ١.٥٪</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أقل من ١٪ ← الفيديو والخطاف يحتاج تعديل فوري</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">تكلفة الظهور (CPM)</td>
                    <td className="py-2.5 px-3 text-white/70">المنافسة ونقاء حسابك الإعلاني</td>
                    <td className="py-2.5 px-3 font-mono text-white">$١.٥ – $٣.٥</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أعلى من $٥ ← غيّر الحساب أو وسّع الاستهداف الجغرافي</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">تكلفة النقرة (CPC)</td>
                    <td className="py-2.5 px-3 text-white/70">مدى كفاءة استدراج النقرات وسهولتها</td>
                    <td className="py-2.5 px-3 font-mono text-white">$٠.٠٥ – $٠.١٥</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أعلى من $٠.٣٠ ← غيّر العرض أو حسّن جودة الصور المصغرة</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">معدل التحويل (CVR)</td>
                    <td className="py-2.5 px-3 text-white/70">كفاءة صفحة الهبوط وسهولة الطلب</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">٢٪ – ٥٪</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أقل من ١٪ ← صفحة الهبوط بطيئة أو العرض غير مغرٍ</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">العائد الإعلاني (ROAS)</td>
                    <td className="py-2.5 px-3 text-white/70">ربحية الحملة الإجمالية الصافية</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">أكثر من ٣ أضعاف</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أقل من ١.٥ ضعف ← تكلفة الاستحواذ عالية جداً بالنسبة لسعر السلعة</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">تكرار الإعلان (Frequency)</td>
                    <td className="py-2.5 px-3 text-white/70">عدد مرات ظهور الإعلان للشخص الواحد</td>
                    <td className="py-2.5 px-3 font-mono text-white">١.٢ – ١.٨</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أعلى من ٢.٥ ← الجمهور ملّ من الإعلان ووجب تغييره بالكامل</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Messaging KPIs */}
          <div className="p-5 rounded-2xl bg-[#D4A017]/5 border border-[#D4A017]/20 space-y-4">
            <h5 className="text-sm font-bold text-[#F0C040] flex items-center gap-2">
              <span>📊</span>
              <span>مؤشرات قياس الأداء لمن يبيع بالرسائل (بدون موقع)</span>
            </h5>
            <div className="overflow-x-auto rounded-xl border border-[#D4A017]/10 bg-black/40">
              <table className="w-full text-right text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-[#0D1B56] text-[#F0C040] font-bold text-center border-b border-[#D4A017]/10">
                    <th className="py-2.5 px-3 text-right">المؤشر (KPI)</th>
                    <th className="py-2.5 px-3">ماذا يقيس</th>
                    <th className="py-2.5 px-3">الهدف المثالي بالعراق l لعام ٢٠٢٦</th>
                    <th className="py-2.5 px-3">علامة الخطر وعلاجها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-center leading-relaxed">
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">تكلفة الرسالة الواحدة (Cost per Message)</td>
                    <td className="py-2.5 px-3 text-white/70">كم يكلفك كل شخص يبدأ محادثة وياك</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">$٠.٣ – $١</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أعلى من $٢ ← الاستهداف أو الإعلان يحتاج تعديل فوري</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">نسبة الرد (Response Rate)</td>
                    <td className="py-2.5 px-3 text-white/70">كم نسبة من راسلوك ردّيت عليهم بسرعة</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">أكثر من ٩٠٪ خلال ساعة</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أقل من ٧٥٪ ← تخسر زبائن بسبب التأخير وتكاسل المبيعات</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">نسبة التحويل من رسالة لبيع (Message-to-Sale)</td>
                    <td className="py-2.5 px-3 text-white/70">كم من كل ١٠ محادثات تنتهي ببيع فعلي</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">٢ – ٤ من كل ١٠ محادثات</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أقل من ٢ محادثات ← المشكلة بطريقة الرد وكيفية التفاوض مو بالإعلان</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-right font-bold text-white">زمن الرد المتوسط (Avg Response Time)</td>
                    <td className="py-2.5 px-3 text-white/70">كم يستغرق ردك على أول رسالة تصلك</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">أقل من ١٥ دقيقة</td>
                    <td className="py-2.5 px-3 text-red-400 font-mono font-bold">أعلى من ١ ساعة ← نسبة كبيرة من الزبائن يبردون ويروحون للمنافسين</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive ROI Calculator */}
          <RoiCalculator />
        </div>
      )}

      {/* 9. 30 DAY PLAN */}
      {id === "chapter9" && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          {/* Interactive 30 Day Plan Calendars and progress */}
          <ThirtyDayPlan />
        </div>
      )}

      {/* 10. PRIVATE MESSAGES SALES SECRETS */}
      {id === "ch10" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out] px-4 md:px-0">
          
          {/* Welcome Alert */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed shadow-lg">
            🚀 <strong>دليل إغلاق المبيعات بالرسائل (The Closing Script):</strong> إذا چانت حملتك تجيب آلاف الرسائل بس مبيعاتك حيل قليلة، فالمشكلة مو بجودة الجمهور ولا بالمنصة، وإنما بطريقة حوارك وإغلاقك للصفقة وية الزبون. بهاي الصفحة راح نكشفلك الأسرار الحقيقية علمود تحول الاستفسار البسيط لطلب فعلي ودفع كاش بأسلوب عراقي لبق ومقنع.
          </div>

          {/* Interactive Chat Selector / Script Preview */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F0C040] flex items-center gap-2">
              <span>💬</span>
              <span>الفرق بين الرد التقليدي (اللي يطرد الزبون) والرد الاحترافي العراقي (اللي يسد البيعة):</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bad approach */}
              <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3 shadow-md">
                <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">❌ الأسلوب البارد والجاف (اللي يضيع عليك فلوس الإعلان):</span>
                <div className="space-y-2 text-xs leading-relaxed text-white/60">
                  <p><strong>الزبون:</strong> عيني ببيش هذا؟</p>
                  <p><strong>الصفحة:</strong> بـ ٢٥ ألف حبيبي، والشحن ٥ آلاف.</p>
                  <p><strong>الزبون:</strong> غالي.. بالتوفيق عيني.</p>
                  <p><strong>الصفحة:</strong> (تتجاهل الرسالة أو ترسل نقاط عشوائية...)</p>
                </div>
                <p className="text-[10px] text-red-300/80 leading-normal font-light pt-2 border-t border-white/5">
                  * النتيجة: الزبون يبرد وينسى السالفة كلها، لأن حس إنك بس تريد تبيعه وتأخذ فلوسه بدون ما تقدم له أي قيمة أو اهتمام.
                </p>
              </div>

              {/* Good approach */}
              <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-3 shadow-md">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">✅ أسلوب "بناء القيمة وتسهيل الشروة" (طريقة محترفي بغداد وأربيل والبصرة):</span>
                <div className="space-y-2 text-xs leading-relaxed text-white/90">
                  <p><strong>الزبون:</strong> عيني ببيش هذا؟</p>
                  <p><strong>الصفحة:</strong> يا مية هلا بيك عيني، منور الصفحة! هذا المنتج سعره ٢٥ ألف دينار بس، ويجي وياه ضمان حقيقي مدة ٣٠ يوم كاملة ضد أي خلل. والأحلى من هذا، اليوم عدنا عرض خاص لفترة محدودة: التوصيل مجاني بالكامل لكل محافظات العراق، وفوكاها راح تجيك هدية مميزة وية الطلب مالتك. تحب نحجزلك اللون الأسود الكشخة لو الرصاصي العملي؟</p>
                  <p><strong>الزبون:</strong> حلو والله، لعد احجزلي الأسود فدوة لعينك.</p>
                </div>
                <p className="text-[10px] text-emerald-300/80 leading-normal font-light pt-2 border-t border-white/5">
                  * النتيجة: هنا أنت ذوبت الخوف عند الزبون بالضمان الحقيقي، وبنفس الوقت شلت عائق التوصيل وحولته لعرض مجاني، وبالأخير خيرته بين خيارين للشراء بدال ما تخيره بين يشتري أو لا!
                </p>
              </div>
            </div>
          </div>

          {/* Core Rules Setblock */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 shadow-lg">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              <span>القواعد الذهبية لإغلاق البيعات بالرسائل وية الزبون العراقي:</span>
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5 shadow-sm">
                <span className="font-bold text-[#F0C040]">١. الرد الفوري والصاروخي (First Response Speed):</span>
                <p className="text-white/70 font-light leading-relaxed">الزبون العراقي من يراسل يكون بحالة حماس عاطفي لحظي علمود يشتري. إذا تأخرت عليه بالرد أكثر من ١٠ إلى ١٥ دقيقة، راح يبرد ويروح لصفحة ثانية ويشتري منها وتطير عليك البيعة.</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5 shadow-sm">
                <span className="font-bold text-[#F0C040]">٢. لا تسكت.. اختم دائماً بسؤال مفتوح:</span>
                <p className="text-white/70 font-light leading-relaxed">أبد لا تنهي كلامك وية الزبون بنقطة أو جملة تسد الحوار. دائماً اختم بسؤال يخليه يجاوبك، مثل: "تحب نوصله إلك لعنوانك اليوم؟" أو "يا حجم يناسبك أكثر عيني علمود نجهزه؟".</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5 shadow-sm">
                <span className="font-bold text-[#F0C040]">٣. شيل الخوف بمبدأ "افحص وعاين":</span>
                <p className="text-white/70 font-light leading-relaxed">الزبون العراقي هواية انقرص من الصفحات الوهمية ويخاف من الغش. طمنه من البداية وكول له بكل ثقة: "تدلل عيني، من يوصلك المندوب افتح الطرد وافحص البضاعة براحتك، وإذا ما عجبتك لا تستلمها ولا تدفع أي شي!".</p>
              </div>
            </div>
          </div>

          {/* Callout type cd (Danger) */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/25 flex gap-3 items-start text-xs shadow-md">
            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="space-y-1">
              <h6 className="font-bold text-red-300">🚨 تجنب هاي الأغلاط اللي تموت المبيعات:</h6>
              <p className="text-white/80 leading-relaxed">
                أبد لا تستخدم الردود الآلية الطويلة والجافة اللي تخلي الزبون يحس نفسه جاي يحچي وية روبوت بارد، وابتعد تماماً عن سالفة "السعر عالخاص" لأنها تضوج الزبون العراقي وتخليه يحس بوجود غش أو تلاعب بأسعار البضاعة، ودائماً خليك واضح وصريح من أول كلمة.
              </p>
            </div>
          </div>

          {/* Step list style of Chapter View */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 shadow-lg">
            <h5 className="text-xs font-bold text-white">📋 خطة المتابعة (Follow-up) الذكية وية الزبائن المترددين:</h5>
            <div className="space-y-3">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex gap-4 text-xs shadow-sm">
                <span className="font-mono text-[#F0C040] font-bold">بعد ٢٤ ساعة:</span>
                <p className="text-white/80">إذا الزبون استفسر واختفى، دزله رسالة لطيفة: "مساء الخير عيني الطيب.. حبيت أنبهك إنو بقت آخر ٣ قطع من هاي الوجبة والطلب عليها حيل قوي اليوم، إذا بعدك حاب نحجزلنا قطعة ونجهزها إلك علمود نلحق نطلعها وية وجبة التوصيل مالت اليوم؟"</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex gap-4 text-xs shadow-sm">
                <span className="font-mono text-[#F0C040] font-bold">بعد ٤٨ ساعة:</span>
                <p className="text-white/80">دزله صورة أو فيديو حقيقي لزبون ثاني استلم المنتج مالتنا وهو فرحان بيه، واكتبله: "يا مية هلا بيك عيني.. شوف أبو فهد الغالي من بغداد اليوم استلم نفس السلعة وحيل فرح بجودتها وكفاءتها.. رأيك يهمنا هواية يا طيب!"</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 11. ADVANCED MESSAGES ADS */}
      {id === "ch11" && (
        <div className="space-y-10 animate-[fadeIn_0.5s_ease-out] px-4 md:px-0">
          
          {/* Welcome Alert */}
          <div className="p-5 rounded-2xl bg-[#D4A017]/5 border border-[#D4A017]/20 text-xs text-[#F0C040] leading-relaxed shadow-lg">
            🔥 <strong>أسرار مخفية بمدير الإعلانات (Ads Manager):</strong> بهاي الصفحة راح ندخل بغميق تكتيكات فيسبوك المكتومة علمود تشغل إعلانات رسائل احترافية ترفع بيها أرباحك الصافية وتنزل تكلفة الرسالة الواحدة لأقل سعر ممكن بسوق العراق.
          </div>

          {/* Steps style */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F0C040]">🛠️ تكتيكات الاستهداف والجماهير المتقدمة لحملات الرسائل:</h4>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs flex items-center justify-center">١</span>
                  <span className="font-bold text-white text-xs">بناء جمهور مخصص من مراسلي الصفحة (Custom Audience):</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-light mr-8">
                  من تبويب الجماهير (Audiences)، سوي جمهور مخصص يستهدف "كل الناس اللي دزوا رسائل لصفحتك" (People who sent a message to your page) بآخر ٣٠ أو ٩٠ يوم. هذولة همة أنقى جمهور دافي ومهتم بيك وباللي تبيعه بكل العراق!
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs flex items-center justify-center">٢</span>
                  <span className="font-bold text-white text-xs">تشغيل ميزة الجمهور الشبيه (Lookalike Audience 1%-2%):</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-light mr-8">
                  سوي جمهور شبيه بنسبة ١٪ إلى ٢٪ يعتمد على جمهور مراسلي الصفحة السابقين اللي سويناه بالخطوة الأولى. هنا ذكاء فيسبوك الاصطناعي راح يفتر بكل المحافظات العراقية علمود يدورلك على مئات الآلاف من الناس الجدد اللي يمتلكون نفس السلوك الشرائي والاهتمامات لزبائنك الحاليين بالضبط!
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4A017] text-[#040B24] font-black text-xs flex items-center justify-center">٣</span>
                  <span className="font-bold text-white text-xs">تكتيك تكرار المجموعات الإعلانية الفائزة (Ad Set Duplication):</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-light mr-8">
                  إذا شفت عندك مجموعة إعلانية جاي تجيبلك رسائل بسعر رخيص وحلو (مثلاً أقل من ٠.٥$ للرسالة)، لتلعب بالميزانية مالتها وتزيدها هواية فجأة لأن هذا الشي يخرب شغل الخوارزميات ويطير الأداء. الحل الصح هو تسوي تكرار (Duplicate) للمجموعة الفائزة ٢ إلى ٣ مرات بنفس الميزانية علمود تضمن استقرار التكلفة الرخيصة وتوسع وصولك.
                </p>
              </div>
            </div>
          </div>

          {/* Callouts list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* callout cg */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 flex gap-4 items-start shadow-md text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h5 className="font-bold text-emerald-300">💡 سر التجديد والربح المستدام بالعراق:</h5>
                <p className="text-white/80 leading-relaxed font-light">
                  كلش ضروري تجرب فيديو أو تصميم إعلاني (Ad Creative) جديد كل أسبوع. بالسوق العراقي، الإعلانات تستهلك وتتعب (Ad Fatigue) بسرعة رهيبة لأن الزبون العراقي يتصفح هواية وبصري لدرجة كبيرة. علمود هيچ، من تنزل فيديو قصير جديد ومرتب كل أسبوع راح تحافظ على تكلفة الرسائل مالتك رخيصة ومستقرة طول السنة.
                </p>
              </div>
            </div>

            {/* callout cw */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 flex gap-4 items-start shadow-md text-xs">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h5 className="font-bold text-amber-300">⚠️ تكتيك الاستهداف المفتوح (Broad Targeting):</h5>
                <p className="text-white/80 leading-relaxed font-light">
                  لتخنق الإعلان مالتك وتضيقه بهواية اهتمامات وتفاصيل دقيقة. خوارزميات فيسبوك اليوم تشتغل بأفضل كفاءة وتوصل لأقوى المشترين من تعوف الاستهداف مالتك مفتوح وواسع (Broad Targeting) لكل العراق، وتخلي محتوى الفيديو والخطاب الواضح اللي بيه هو اللي يفلتر المشتري الجاد والمهتم عن المتفرج العادي اللي بس يعلق.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
