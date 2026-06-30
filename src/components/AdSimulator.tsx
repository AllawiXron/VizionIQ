/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Facebook, Instagram, Share2, Heart, MessageCircle, MoreHorizontal, Send, Bookmark, Volume2 } from "lucide-react";

type PlatformType = "facebook" | "instagram" | "tiktok";

export default function AdSimulator() {
  const [platform, setPlatform] = useState<PlatformType>("facebook");
  const [adText, setAdText] = useState("شباك سيارتك يلم تراب والحر يحرق الكشنات؟ 🚗☀️ الحل الأسرع بالعراق وصل! مظلة السيارة العازلة للحرارة والأشعة فوق البنفسجية.\n\n✅ تحمي سيارتك وتبرد الكابينة بـ ٣ دقائق بس.\n✅ توصيل سريع لجميع المحافظات والدفع عند الاستلام!\n\n👇 اطلبها هسة بخصم ٢٥٪ لفترة محدودة!");
  const [headline, setHeadline] = useState("مظلة السيارة العازلة للحرارة — فحص قبل الدفع");
  const [cta, setCta] = useState("اطلب الآن - توصيل سريع");

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8 shadow-2xl relative" id="ad-simulator">
      {/* Glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/10 pb-4 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          🎬 جرب إعلانك وشوف شكله وتأثيره قبل لا تصرف أي دينار على الترويج
        </h3>
        <p className="text-xs text-white/50 mt-1">اختبر مظهر إعلانك على فيسبوك، انستغرام وتيك توك محلياً وتأكد من جاذبيته للجمهور العراقي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Customization Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-semibold text-[#F0C040] block">⚙️ خيارات الإعلان والتعديل</span>

          {/* Preset Formulas */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-[#F0C040] font-bold block">💡 صيغ كتابة إعلانية عراقية ناجحة (اضغط للتجربة):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setHeadline("مقاوم لتراب وعواصف بغداد والجنوب! 🚗🌪️");
                  setAdText("تعبت من غسيل سيارتك كل يوم والتراب يغطيها الصبح؟ 🚗🌪️ عواصف تراب العراق ما ترحم، والحل صار بيدك! غلاف السيارة النانو عازل للغبار والمطر بنسبة 100%.\n\n✅ يحمي الصبغ من الخدوش وأشعة الشمس الحارقة.\n✅ تفصال خاص لكل موديل سيارة (صالون، جيب، بيك اب).\n\n👇 اطلب الحين وافحص خامته وجودته بنفسك قبل ما تدفع للمندوب!");
                  setCta("اطلب الآن - توصيل سريع");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-[#D4A017]/10 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors"
                title="صيغة حل مشكلة الغبار العراقي"
              >
                🌪️ مشكلة الغبار
              </button>
              <button
                onClick={() => {
                  setHeadline("من اليوم ماكو كشخة تخرب بسبب الكشنات! ✨🧥");
                  setAdText("تخيل طالع لموعد أو دوام رسمي وتكتشف ملابسك تملت غبار الكشنات؟ 🤦‍♂️ عيني الغالي، لا تخرب كشختك! مع المكنسة اللاسلكية الذكية بقوة سحب خارقة 9000Pa.\n\n✅ حجمها صغير ومثالية لكشنات وزوايا السيارة.\n✅ شحن USB يدوم لأسابيع.\n✅ التوصيل لباب بيتك مجاني هذا الأسبوع!\n\n👇 اضغط على 'اطلب الآن' واحصل عليها بخصم خاص اليوم!");
                  setCta("تسوق الآن");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-[#D4A017]/10 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors"
                title="صيغة الكشخة وتفادي الغبار"
              >
                ✨ كشخة الملابس
              </button>
              <button
                onClick={() => {
                  setHeadline("اشتري وحدة الك والثانية لبيت أبوك مجاناً! 🎁");
                  setAdText("العراقيين أهل الكرم والهدية الطيبة! لهذا سوينا لكم أقوى عرض عائلي بالعراق: قطعتين من مصباح الحديقة الشمسي العازل للماء بسعر قطعة واحدة! 🏡☀️\n\n✅ يشحن من شمس الصيف الحارة ويشتغل تلقائياً بالليل.\n✅ خامة قوية ومقاومة للأمطار وعواصف الغبار.\n✅ توصيل سريع لبغداد بـ 3 آلاف والمحافظات بـ 5 آلاف فقط!\n\n👇 العرض ساري حتى نفاد الكمية، اضغط واطلب هسة!");
                  setCta("اشتري قطعتين والتوصيل مجاني");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-[#D4A017]/10 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors"
                title="صيغة عرض الكرم العراقي"
              >
                🎁 الكرم العائلي
              </button>
            </div>
          </div>
          
          {/* Platform Selector Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPlatform("facebook")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                platform === "facebook"
                  ? "bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              <Facebook className="w-4 h-4" />
              <span>فيسبوك</span>
            </button>
            <button
              onClick={() => setPlatform("instagram")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                platform === "instagram"
                  ? "bg-[#E1306C]/10 border-[#E1306C] text-[#E1306C]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>إنستغرام</span>
            </button>
            <button
              onClick={() => setPlatform("tiktok")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                platform === "tiktok"
                  ? "bg-black/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              <span className="font-bold">🎵</span>
              <span>تيك توك</span>
            </button>
          </div>

          {/* Ad text input */}
          <div className="space-y-1">
            <label className="text-xs text-white/60 block">نص الإعلان الترويجي (Ad Copy):</label>
            <textarea
              value={adText}
              onChange={(e) => setAdText(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A017] leading-relaxed resize-none"
            />
          </div>

          {/* Ad headline */}
          <div className="space-y-1">
            <label className="text-xs text-white/60 block">عنوان الإعلان الأساسي (Headline):</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A017]"
            />
          </div>

          {/* Ad call to action */}
          <div className="space-y-1">
            <label className="text-xs text-white/60 block">نص زر الإجراء (Call To Action):</label>
            <select
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4A017] appearance-none"
            >
              <option value="اطلب الآن - توصيل سريع">اطلب الآن - توصيل سريع</option>
              <option value="تسوق الآن">تسوق الآن</option>
              <option value="اشتري قطعتين والتوصيل مجاني">اشتري قطعتين والتوصيل مجاني</option>
              <option value="أرسل رسالة">أرسل رسالة بالواتساب</option>
            </select>
          </div>
        </div>

        {/* Right Side: Visual Simulator Preview (7 Columns) */}
        <div className="lg:col-span-7 flex justify-center">
          
          {/* Render Facebook View */}
          {platform === "facebook" && (
            <div className="w-full max-w-[370px] bg-[#1c1d1f] border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs">
              {/* Profile Bar */}
              <div className="p-3 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4A017] to-[#F0C040] flex items-center justify-center font-bold text-[#040B24] text-xs">
                    عراق
                  </div>
                  <div>
                    <h5 className="font-bold text-white flex items-center gap-1 text-[13px]">
                      سوق الرافدين الإلكتروني
                      <span className="text-[#1877F2] text-[10px]">● ممول</span>
                    </h5>
                    <span className="text-[10px] text-white/50">الآن · 🌐</span>
                  </div>
                </div>
                <button className="text-white/60 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Text Description */}
              <div className="p-3 leading-relaxed whitespace-pre-line text-white/90">
                {adText}
              </div>

              {/* Visual Ad Banner */}
              <div className="relative aspect-[4/3] bg-[#0D1B56] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A2B73]/20 via-[#0D1B56]/50 to-black z-0" />
                {/* Simulated product visual overlay */}
                <div className="z-10 text-center p-4">
                  <span className="text-[10px] bg-amber-500/20 text-[#F0C040] border border-[#D4A017]/40 px-2 py-0.5 rounded-full font-bold">خصم ٢٥٪ - الدفع عند الاستلام</span>
                  <div className="text-4xl my-2">🚗🛡️☀️</div>
                  <h6 className="text-sm font-bold text-white tracking-wide">مظلة الزجاج الذكية للسيارات</h6>
                  <p className="text-[10px] text-white/60 mt-1">المظهر الأصلي المضمون في العراق</p>
                </div>
              </div>

              {/* CTA footer bar */}
              <div className="p-3 bg-[#242526] flex justify-between items-center border-t border-white/5">
                <div className="max-w-[70%]">
                  <span className="text-[10px] text-white/50 uppercase block">WWW.ALRAFIDAIN.SHOP</span>
                  <span className="font-bold text-white text-[12px] truncate block">{headline}</span>
                </div>
                <button className="px-3.5 py-1.5 bg-[#3a3b3c] hover:bg-[#4e4f50] font-semibold rounded text-white text-[11px] transition-all whitespace-nowrap">
                  {cta}
                </button>
              </div>

              {/* Social actions */}
              <div className="p-3 flex justify-around items-center border-t border-white/5 text-white/60">
                <button className="flex items-center gap-1.5 hover:text-[#1877F2]">
                  <span>👍</span>
                  <span>أعجبني</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-white">
                  <MessageCircle className="w-4 h-4" />
                  <span>تعليق</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-white">
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </button>
              </div>
            </div>
          )}

          {/* Render Instagram View */}
          {platform === "instagram" && (
            <div className="w-full max-w-[370px] bg-black border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs">
              {/* Header */}
              <div className="p-3 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-500 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">
                      IQ
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-[12px]">alrafidain.shop</h5>
                    <span className="text-[9px] text-white/60 block -mt-0.5">Sponsored</span>
                  </div>
                </div>
                <button className="text-white/60">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Visual Ad Banner */}
              <div className="relative aspect-square bg-[#1A2B73]/40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0" />
                
                {/* Simulated Product layout */}
                <div className="z-10 text-center p-6 space-y-3">
                  <div className="text-5xl">📦✨🚙</div>
                  <h6 className="text-base font-black text-white">{headline}</h6>
                  <p className="text-xs text-[#F0C040] font-bold">التوصيل متوفر لكافة المحافظات العراقية 🇮🇶</p>
                </div>

                {/* Simulated Shop CTA Overlay at the bottom */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-[#3897f0] hover:bg-[#1372d0] flex justify-between items-center px-4 transition-colors z-10 cursor-pointer">
                  <span className="font-bold text-[11px] text-white">{cta}</span>
                  <span className="text-white font-bold text-sm">➔</span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button className="hover:text-red-500"><Heart className="w-5 h-5" /></button>
                  <button><MessageCircle className="w-5 h-5" /></button>
                  <button><Send className="w-5 h-5" /></button>
                </div>
                <button><Bookmark className="w-5 h-5" /></button>
              </div>

              {/* Likes & Captions */}
              <div className="px-3 pb-3 space-y-1.5">
                <span className="font-bold block text-[11px]">843 likes</span>
                <p className="leading-relaxed">
                  <span className="font-bold mr-1 block text-amber-400">alrafidain.shop</span>
                  <span className="text-white/90 whitespace-pre-line">{adText}</span>
                </p>
                <span className="text-[9px] text-white/40 uppercase block mt-1">View all 14 comments</span>
              </div>
            </div>
          )}

          {/* Render TikTok View */}
          {platform === "tiktok" && (
            <div className="w-full max-w-[370px] bg-black border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs relative aspect-[9/16] flex flex-col justify-between">
              
              {/* Top Bar Tabs */}
              <div className="absolute top-4 inset-x-0 flex justify-center gap-4 text-white/60 font-semibold text-xs z-10">
                <span className="hover:text-white cursor-pointer">Following</span>
                <span className="text-white border-b-2 border-white pb-1 font-bold">For You</span>
              </div>

              {/* Immersive Video/Content Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl animate-pulse mb-4">🚀🎥🔥</div>
                <h6 className="text-lg font-bold max-w-[80%] text-white">{headline}</h6>
                <p className="text-xs text-cyan-400 font-medium mt-1">#تسوق_بالعراق #مبيعات_اونلاين</p>
                
                {/* Call to action floating ribbon */}
                <div className="absolute bottom-32 inset-x-4 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-lg flex justify-between items-center transition-all cursor-pointer shadow-lg shadow-cyan-500/30 z-10">
                  <span className="font-bold text-black text-xs">{cta}</span>
                  <span className="text-black font-extrabold">⚡</span>
                </div>
              </div>

              {/* Right Sidebar Interaction Icons */}
              <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-10 text-center">
                
                {/* Avatar with plus */}
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 border border-white flex items-center justify-center text-black font-bold text-xs">
                    ع
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    +
                  </span>
                </div>

                {/* Heart */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:text-red-500">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">12.4K</span>
                </div>

                {/* Message */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">390</span>
                </div>

                {/* Bookmark */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">842</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">Share</span>
                </div>
              </div>

              {/* Bottom Caption and User info */}
              <div className="absolute left-16 right-3 bottom-6 z-10 space-y-1 text-left select-text">
                <h5 className="font-bold text-[13px] text-white text-right">@alrafidain.ads <span className="bg-cyan-400 text-black text-[9px] px-1 rounded ml-1">Sponsored</span></h5>
                <p className="text-white/90 text-right text-[11px] leading-relaxed line-clamp-2" title={adText}>
                  {adText}
                </p>
                <div className="flex items-center gap-2 justify-end text-[10px] text-white/60">
                  <span className="font-mono text-right truncate max-w-[120px]">الموسيقى الأصلية - رافدين</span>
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Rotating Vinyl Icon on bottom right */}
              <div className="absolute right-3 bottom-6 z-10 w-9 h-9 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center animate-spin [animation-duration:4s]">
                <div className="w-4 h-4 rounded-full bg-[#F0C040]" />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
