import React, { useState } from "react";
import { Facebook, Instagram, Share2, Heart, MessageCircle, MoreHorizontal, Send, Bookmark, Volume2, ThumbsUp } from "lucide-react";

type PlatformType = "facebook" | "instagram" | "tiktok";

export default function AdSimulator() {
  const [platform, setPlatform] = useState<PlatformType>("facebook");
  const [adText, setAdText] = useState("شباك سيارتك يتغبر والحر يحرق الكشنات؟ الحل وصل مظلة السيارة العازلة للحرارة والأشعة فوق البنفسجية.\n\nتحمي سيارتك وتخفف الحرارة داخلها بـ ٣ دقائق بس.\nتوصيل سريع لكل المحافظات والدفع عند الاستلام\n\nاطلبها هسه بخصم ٢٥٪ ولفترة محدودة");
  const [headline, setHeadline] = useState("مظلة السيارة العازلة للحرارة، افحصها قبل لا تدفع");
  const [cta, setCta] = useState("اطلب هسه - توصيل سريع");

  return (
    <div className="w-full glass rounded-3xl sm:rounded-4xl glass-edge border p-3.5 sm:p-6 md:p-8 relative" id="ad-simulator">

      <div className="border-b border-white/10 pb-4 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          جرب إعلانك وشوف شلون راح يطلع ويأثر على الناس قبل لا تصرف ولا دينار على الترويج
        </h3>
        <p className="text-xs text-white/70 mt-1">شوف إعلانك شلون يطلع على فيسبوك وإنستغرام وتيك توك، وتأكد من جاذبيته للجمهور العراقي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-semibold text-vz-accent block">خيارات الإعلان والتعديل</span>

          <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-vz-accent font-bold block">نماذج إعلانات عراقية ناجحة (اضغط وجرب):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button                 onClick={() => {
                  setHeadline("تتحمل غبار وعواصف بغداد والجنوب");
                  setAdText("تعبت من غسل سيارتك كل يوم وبالصبح تلكاها متغطية بالتراب؟ عواصف التراب بالعراق ما ترحم، بس الحل صار يمك غلاف السيارة النانو يحميها من الغبار والمطر بنسبة 100%.\n\nيحافظ على صبغ السيارة من الخدوش وأشعة الشمس القوية.\nتفصيل خاص حسب موديل سيارتك (صالون، جيب، بيك اب).\n\nاطلب هسه وافحص الخامة والجودة بنفسك قبل لا تدفع للمندوب");
                  setCta("اطلب هسه - توصيل سريع");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-white/5 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                title="صيغة حل مشكلة الغبار بالعراق"
              >
                مشكلة الغبار
              </button>
              <button                 onClick={() => {
                  setHeadline("من اليوم غبار الكشنات ما يخرب كشختك");
                  setAdText("تخيل طالع لموعد أو للدوام الرسمي، وفجأة تكتشف ملابسك كلها متغبرة من الكشنات؟ عيني الغالي، لا تخلي الغبار يخرب كشختك ويا المكنسة اللاسلكية الذكية بقوة سحب 9000Pa.\n\nحجمها صغير وتوصل لكشنات وزوايا السيارة.\nتشتغل بشحن USB ويدوم شحنها لأسابيع.\nالتوصيل لباب بيتك مجاني هذا الأسبوع\n\nاضغط على اطلب هسه وخذها بخصم خاص اليوم");
                  setCta("تسوق هسه");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-white/5 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                title="صيغة الكشخة والتخلص من الغبار"
              >
                كشخة الملابس
              </button>
              <button                 onClick={() => {
                  setHeadline("اشتري وحدة إلك والثانية هدية لبيت أبوك");
                  setAdText("العراقيين أهل الكرم والذوق بالهدايا ولهذا سوينا إلكم أقوى عرض عائلي بالعراق: قطعتين من مصباح الحديقة الشمسي المقاوم للماء بسعر قطعة وحدة\n\nيشتغل بطاقة الشمس حتى بأيام الصيف الحارة، وينور وحده بالليل.\nخامة قوية وتتحمل المطر وعواصف الغبار.\nالتوصيل لبغداد بـ 3 آلاف والمحافظات بـ 5 آلاف بس\n\nالعرض مستمر لحد ما تخلص الكمية، اضغط واطلب هسه");
                  setCta("اشتري قطعتين والتوصيل علينا");
                }}
                className="py-1.5 px-1 bg-white/5 hover:bg-white/5 border border-white/5 rounded-lg text-[9px] text-white font-medium truncate text-center cursor-pointer transition-colors min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
                title="صيغة عرض الكرم العراقي"
              >
                الكرم العائلي
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button               onClick={() => setPlatform("facebook")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${ platform === "facebook" ? "bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2]" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
            >
              <Facebook className="w-4 h-4" />
              <span>فيسبوك</span>
            </button>
            <button               onClick={() => setPlatform("instagram")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${ platform === "instagram" ? "bg-[#E1306C]/10 border-[#E1306C] text-[#E1306C]" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
            >
              <Instagram className="w-4 h-4" />
              <span>إنستغرام</span>
            </button>
            <button               onClick={() => setPlatform("tiktok")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer ${ platform === "tiktok" ? "bg-black/40 border-cyan-400 text-cyan-300 md:shadow-[0_0_10px_rgba(0,0,0,0.44)] shadow-xl" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" } min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy`}
            >
              <span>تيك توك</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/60 block">نص الإعلان (Ad Copy):</label>
            <textarea               value={adText}
              onChange={(e) => setAdText(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/35 leading-relaxed resize-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/60 block">عنوان الإعلان (Headline):</label>
            <input               type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/35 min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/60 block">نص زر الإجراء (Call To Action):</label>
            <select               value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full text-xs p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/35 appearance-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"
            >
              <option value="اطلب هسه - توصيل سريع">اطلب هسه - توصيل سريع</option>
              <option value="تسوق هسه">تسوق هسه</option>
              <option value="اشتري قطعتين والتوصيل علينا">اشتري قطعتين والتوصيل علينا</option>
              <option value="راسلنا">راسلنا على الواتساب</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-7 flex justify-center">
          
          {platform === "facebook" && (
            <div className="w-full max-w-[370px] bg-[#1c1d1f] border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs">
              <div className="p-3 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-vz-blue-light to-vz-blue-deep flex items-center justify-center font-bold text-white text-xs">
                    العراق
                  </div>
                  <div>
                    <h5 className="font-bold text-white flex items-center gap-1 text-[13px]">
                      سوق الرافدين الإلكتروني
                      <span className="text-[#1877F2] text-[10px]">● إعلان ممول</span>
                    </h5>
                    <span className="text-[10px] text-white/70">هسه ·</span>
                  </div>
                </div>
                <button className="text-white/60 hover:text-white min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 leading-relaxed whitespace-pre-line text-white/90">
                {adText}
              </div>

              <div className="relative aspect-[4/3] bg-[#222224] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#343436]/20 via-[#222224]/50 to-black z-0" />
                <div className="z-10 text-center p-4">
                  <span className="text-[10px] bg-white/10 text-vz-accent border border-white/18 px-2 py-0.5 rounded-full font-bold">خصم ٢٥٪ - الدفع عند الاستلام</span>
                  <h6 className="text-sm font-bold text-white tracking-wide">مظلة الزجاج الذكية للسيارات</h6>
                  <p className="text-[10px] text-white/60 mt-1">المظهر الأصلي المضمون بالعراق</p>
                </div>
              </div>

              <div className="p-3 bg-[#242526] flex justify-between items-center border-t border-white/5">
                <div className="max-w-[70%]">
                  <span className="text-[10px] text-white/70 uppercase block">WWW.ALRAFIDAIN.SHOP</span>
                  <span className="font-bold text-white text-[12px] truncate block">{headline}</span>
                </div>
                <button className="px-3.5 py-1.5 bg-[#3a3b3c] hover:bg-[#4e4f50] font-semibold rounded text-white text-[11px] transition-all motion-reduce:transition-none motion-reduce:transform-none whitespace-nowrap min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  {cta}
                </button>
              </div>

              <div className="p-3 flex justify-around items-center border-t border-white/5 text-white/60">
                <button className="flex items-center gap-1.5 hover:text-[#1877F2] min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  <ThumbsUp className="w-4 h-4" />
                  <span>إعجاب</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  <MessageCircle className="w-4 h-4" />
                  <span>تعليق</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </button>
              </div>
            </div>
          )}

          {platform === "instagram" && (
            <div className="w-full max-w-[370px] bg-black border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs">
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
                <button className="text-white/60 min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-square bg-[#343436]/40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0" />
                
                <div className="z-10 text-center p-6 space-y-3">
                  <h6 className="text-base font-black text-white">{headline}</h6>
                  <p className="text-xs text-vz-accent font-bold">التوصيل متوفر لكل المحافظات العراقية</p>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-10 bg-[#3897f0] hover:bg-[#1372d0] flex justify-between items-center px-4 transition-colors z-10 cursor-pointer">
                  <span className="font-bold text-[11px] text-white">{cta}</span>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button className="hover:text-red-500 min-h-[44px] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy"><Heart className="w-5 h-5" /></button>
                  <button  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy min-h-[44px] active:scale-[0.97] transition-all"><MessageCircle className="w-5 h-5" /></button>
                  <button  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy min-h-[44px] active:scale-[0.97] transition-all"><Send className="w-5 h-5" /></button>
                </div>
                <button  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy min-h-[44px] active:scale-[0.97] transition-all"><Bookmark className="w-5 h-5" /></button>
              </div>

              <div className="px-3 pb-3 space-y-1.5">
                <span className="font-bold block text-[11px]">843 likes</span>
                <p className="leading-relaxed">
                  <span className="font-bold mr-1 block text-vz-accent">alrafidain.shop</span>
                  <span className="text-white/90 whitespace-pre-line">{adText}</span>
                </p>
                <span className="text-[9px] text-white/60 uppercase block mt-1">View all 14 comments</span>
              </div>
            </div>
          )}

          {platform === "tiktok" && (
            <div className="w-full max-w-[370px] bg-black border border-white/10 rounded-2xl shadow-xl overflow-hidden text-white text-xs relative aspect-[9/16] flex flex-col justify-between">
              
              <div className="absolute top-4 inset-x-0 flex justify-center gap-4 text-white/60 font-semibold text-xs z-10">
                <span className="hover:text-white cursor-pointer">Following</span>
                <span className="text-white border-b-2 border-white pb-1 font-bold">For You</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-0 flex flex-col items-center justify-center p-6 text-center">
                <h6 className="text-lg font-bold max-w-[80%] text-white">{headline}</h6>
                <p className="text-xs text-cyan-400 font-medium mt-1">#تسوق_بالعراق #مبيعات_اونلاين</p>
                
                <div className="absolute bottom-32 inset-x-4 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-lg flex justify-between items-center transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer shadow-lg shadow-black/40 z-10">
                  <span className="font-bold text-black text-xs">{cta}</span>
                </div>
              </div>

              <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-10 text-center">
                
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 border border-white flex items-center justify-center text-black font-bold text-xs">
                    ع
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    +
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:text-red-500">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">12.4K</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">390</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">842</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/80 mt-1">Share</span>
                </div>
              </div>

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

              <div className="absolute right-3 bottom-6 z-10 w-9 h-9 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center animate-spin [animation-duration:4s]">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
