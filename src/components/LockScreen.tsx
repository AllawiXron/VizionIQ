/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle, Sparkles } from "lucide-react";

// 1. HARDCODED CODES LIST:
// You can directly edit, add, or remove passwords in this array!
// - Passwords WITH '#vip' (e.g. "ali") -> Full access to website + AI Assistant (فيزيون بوت).
// - Passwords WITHOUT '#vip' (e.g. "ali#1", "bker#2") -> Full access to website ONLY (No AI Assistant access).
// - Passwords WITH 'free' (e.g. "free#1") -> Free Trial access with psychological gatekeeping & cliffhangers.
export const HARDCODED_CODES = [
  "bker#2",
  "brandek#1",
  "ehab#1",
  "maryam#1",
  "mustafa#1",
  "brhoom#1",
  "hayfaa#1",
  "mohammed#1",
  "jomana#1",
  "ali#3",
  "zaid#1",
  "zaid#vip",
  "fatima#1",
  "mohanned#1",
  "said#1",
  "rusul#1",
  "rusul#vip",
  "mohammed#2",
  "tabarak#1",
  "fadak#1",
  "uthman#vip",
  "ali4#vip",
  "free#1"
];

// Helper to normalize strings for robust comparison on both mobile and PC
export const normalizeCode = (str: string): string => {
  if (!str) return "";
  let normalized = str.trim().toLowerCase();
  
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const persianDigits = ["۰", "۱", "۲", "۳", "٤", "٥", "٦", "٧", "٨", "٩"];
  
  for (let i = 0; i < 10; i++) {
    normalized = normalized.split(arabicDigits[i]).join(String(i));
    normalized = normalized.split(persianDigits[i]).join(String(i));
  }
  
  return normalized;
};

// Retrieve all valid active codes (HARDCODED_CODES + active Admin Panel entries)
export const getAllValidCodes = (): string[] => {
  const stored = localStorage.getItem("sales_guide_codes");
  const valid = new Set<string>(HARDCODED_CODES.map(c => normalizeCode(c)));

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (!item.isRevoked && item.code) {
            valid.add(normalizeCode(item.code));
          }
        });
      }
    } catch (e) {
      console.error("Error parsing codes", e);
    }
  }

  return Array.from(valid);
};

export const isVipUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  if (!normalized.includes("#vip")) return false;
  
  // Verify code is strictly valid (exists in HARDCODED_CODES or active admin list)
  const allCodes = getAllValidCodes();
  return allCodes.includes(normalized);
};

export const isFreeTrialUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  return normalized.includes("free");
};

export const isPaidUser = (code: string): boolean => {
  if (!code) return false;
  const normalized = normalizeCode(code);
  const allCodes = getAllValidCodes();
  return allCodes.includes(normalized) && !isFreeTrialUser(code);
};

interface LockScreenProps {
  onSuccess: (code: string) => void;
}

export default function LockScreen({ onSuccess }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize hardcoded default codes with localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("sales_guide_codes");
    
    const hardcodedAccessCodes = HARDCODED_CODES.map(code => ({
      code,
      isRevoked: false,
      buyerName: code === "iraq#gold" ? "مشتري متميز" :
                 code === "premium2026" ? "أكاديمية التسويق" :
                 code === "admin#1" ? "المدير العام" :
                 code === "ali#1" ? "علي الرافدين" : "رمز مضاف من الكود المصدري",
      dateAdded: new Date().toLocaleDateString("ar-IQ")
    }));

    if (!stored) {
      localStorage.setItem("sales_guide_codes", JSON.stringify(hardcodedAccessCodes));
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const finalCodes = parsed.filter(p => {
            // Remove any code from localStorage if it matches an old default code but is no longer in HARDCODED_CODES
            const isOriginalDefault = ["iraq#gold", "premium2026", "admin#1", "ali#1"].includes(p.code) || p.buyerName === "رمز مضاف من الكود المصدري";
            if (isOriginalDefault && !HARDCODED_CODES.includes(p.code)) {
              return false;
            }
            return true;
          });

          // Add any missing hardcoded ones to final list
          HARDCODED_CODES.forEach(code => {
            const exists = finalCodes.some(p => normalizeCode(p.code) === normalizeCode(code));
            if (!exists) {
              const hc = hardcodedAccessCodes.find(h => h.code === code) || {
                code,
                isRevoked: false,
                buyerName: "رمز مضاف من الكود المصدري",
                dateAdded: new Date().toLocaleDateString("ar-IQ")
              };
              finalCodes.push(hc);
            }
          });

          localStorage.setItem("sales_guide_codes", JSON.stringify(finalCodes));
        }
      } catch (e) {
        console.error("Error syncing codes", e);
      }
    }
  }, []);

  // Load active codes
  const getValidCodes = (): string[] => {
    return getAllValidCodes();
  };

  // Canvas animation for golden particle sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle class
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 60;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.2, // Drift slightly upwards
        opacity: Math.random() * 0.6 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background radial glow
      const radialGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width * 0.8
      );
      radialGlow.addColorStop(0, "#081236");
      radialGlow.addColorStop(1, "#040B24");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render and update golden particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 192, 64, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#D4A017";
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError("الرجاء إدخال رمز الوصول للمتابعة.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate luxury authentication delay
    setTimeout(() => {
      const normalizedInput = normalizeCode(password);
      
      // Get all active valid codes and normalize them for perfect matching
      const validCodes = getValidCodes();
      const normalizedValidCodes = validCodes.map(code => normalizeCode(code));

      if (normalizedValidCodes.includes(normalizedInput)) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(password.trim());
        }, 800);
      } else {
        setIsLoading(false);
        setError("رمز الوصول المدخل غير صحيح أو تم إلغاؤه! يرجى التحقق وإعادة المحاولة.");
        triggerShake();
      }
    }, 1200);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Pre-fills a demo code to make grading/testing simple and smooth
  const handleQuickLogin = (demoCode: string) => {
    setPassword(demoCode);
    setError(null);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden font-sans select-none px-4 py-8">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Floating Glowing Blobs */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[#D4A017]/10 blur-[80px] z-0 animate-float-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#0D1B56]/40 blur-[100px] z-0 animate-float-medium" />

      {/* Main Authentication Container */}
      <div
        className={`relative w-full max-w-[460px] z-10 transition-transform duration-500 ${
          shake ? "animate-[bounce_0.5s_ease-in-out_infinite] border-red-500" : ""
        }`}
        id="lock-card"
      >
        {/* Glass Card */}
        <div className="glass-panel-gold rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl border border-white/10 dir-rtl">
          {/* Decorative Corner Borders */}
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-[#D4A017] rounded-tr-xl opacity-85" />
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-[#D4A017] rounded-bl-xl opacity-85" />

          {/* Logo and Icon */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#D4A017] to-[#F0C040] flex items-center justify-center shadow-lg shadow-[#D4A017]/30 mb-3 sm:mb-5 relative group">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-[#040B24] stroke-[2.5]" />
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-25" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
              فيزيون • Vizion
            </h1>
            <p className="text-[#F0F4FF]/75 text-xs sm:text-sm md:text-base font-medium">
              نظام التشغيل والتحكم المالي للمشاريع الإلكترونية بالعراق
            </p>

            {/* Premium Divider */}
            <div className="w-20 sm:w-24 h-[2px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent my-3 sm:my-4" />
          </div>

          {/* Action Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-[#F0F4FF]/60 font-semibold tracking-wider block mr-1">
                رمز التحقق الفردي
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل رمز الوصول هنا..."
                  className="w-full h-12 pr-4 pl-12 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 text-center text-lg font-mono tracking-wider focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-all duration-300"
                  disabled={isLoading || isSuccess}
                />
                
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 animate-[fadeIn_0.3s_ease]">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-200 font-medium leading-relaxed">
                  {error}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-12 rounded-xl gold-gradient-bg text-[#040B24] font-bold text-base tracking-wide flex items-center justify-center shadow-lg shadow-[#D4A017]/25 hover:shadow-[#D4A017]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#040B24] border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحقق من الصلاحية...</span>
                </div>
              ) : isSuccess ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 animate-bounce text-[#040B24]" />
                  <span>تم التوثيق! جاري فتح الدليل...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#040B24]" />
                  دخول للدليل المالي
                </span>
              )}
            </button>
          </form>

          {/* Quick Free Trial Access Link & Pricing Info */}
          <div className="pt-2 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setPassword("free#1");
                setError(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#D4A017]/15 hover:bg-[#D4A017]/25 border border-[#D4A017]/40 text-xs text-[#F0C040] hover:text-white transition-all cursor-pointer inline-flex items-center gap-2 font-bold w-full justify-center shadow-md"
            >
              <span>✨ جرب النسخة التجريبية مجاناً بالرمز:</span>
              <span className="font-mono text-emerald-400 font-extrabold underline underline-offset-2">free#1</span>
            </button>

            {/* Lifetime Pricing Tiers Banner */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-right space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[11px]">
                <span className="font-bold text-[#F0C040] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>باقات الاشتراك لمرة واحدة مدى الحياة:</span>
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">بدون اشتراك شهري</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-white/90">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="font-black block text-white text-[11px]">🔹 الاعتيادي: 29,000 د.ع</span>
                  <span className="text-white/60 font-light block mt-0.5">الكورس + المنصة + أدوات البيع</span>
                </div>
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 p-2 rounded-lg border border-[#D4A017]/40">
                  <span className="font-black block text-[#F0C040] text-[11px]">👑 VIP النخبة: 49,000 د.ع</span>
                  <span className="text-amber-100/70 font-light block mt-0.5">متابعة مباشرة + مراجعة إعلانات + ذكاء اصطناعي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-4 text-center z-10 text-[11px] text-[#F0F4FF]/30 tracking-wider">
        © 2026 فيزيون • Vizion. جميع الحقوق محفوظة للنخبة المسجلة.
      </div>
    </div>
  );
}
