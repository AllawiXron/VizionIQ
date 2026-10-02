import React, { useEffect, useMemo, useState } from "react";
import { Brain, Check, RotateCcw, Sparkles } from "lucide-react";
import { PROFILE_FIELDS, profileFilledCount, sanitizeProfile, type BusinessProfile, type ProfileField } from "../../lib/advisor/profile";

/**
 * "ملف مشروعي": everything the advisor knows about this merchant's shop.
 * Filled by hand or learned from the chat; sent with every question so the
 * answers are about their own product, prices and ad numbers.
 */

const GROUPS: { id: ProfileField["group"]; title: string; hint: string }[] = [
  { id: "shop", title: "المشروع", hint: "شنو تبيع ووين" },
  { id: "numbers", title: "أرقام الطلب", hint: "حتى نحسب ربحك الصافي بالضبط" },
  { id: "ads", title: "الإعلانات والمبيعات", hint: "حتى نشخّص كلفة الرسالة والإغلاق" },
  { id: "goals", title: "المشكلة والهدف", hint: "حتى يكون كل جواب موجّه إلك" },
];

const UNIT: Partial<Record<ProfileField["kind"], string>> = { iqd: "د.ع", usd: "$", percent: "%" };

export function BusinessProfilePanel({
  profile,
  onSave,
  onAskAdvisor,
}: {
  profile: BusinessProfile;
  onSave: (p: BusinessProfile) => void;
  onAskAdvisor: (prompt: string) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const d: Record<string, string> = {};
    for (const f of PROFILE_FIELDS) if (profile[f.key] !== undefined) d[f.key] = String(profile[f.key]);
    setDraft(d);
  }, [profile]);

  const filled = profileFilledCount(sanitizeProfile(draft));
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  const dirty = useMemo(() => PROFILE_FIELDS.some((f) => (draft[f.key] ?? "") !== (profile[f.key] !== undefined ? String(profile[f.key]) : "")), [draft, profile]);

  const set = (key: string, value: string) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    onSave(sanitizeProfile(draft));
    setSaved(true);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header with completeness ring */}
        <div className="flex items-center gap-4 rounded-3xl glass-subtle border p-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#vzpg)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
              <defs>
                <linearGradient id="vzpg" x1="0" x2="1">
                  <stop offset="0" stopColor="#5b8eff" />
                  <stop offset="1" stopColor="#2f6bff" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white tabular-nums">{pct}%</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-white">
              <Brain className="w-5 h-5 text-vz-accent" />
              ملف مشروعي
            </div>
            <p className="text-xs sm:text-sm text-white/65 leading-relaxed mt-0.5">
              المستشار يقرا هالملف ويه كل سؤال، فيجاوبك على منتجك وأرقامك إنت مو حجي عام. يتحدث تلقائياً من تذكر معلومة بالمحادثة.
            </p>
          </div>
        </div>

        {GROUPS.map((g) => (
          <section key={g.id} className="rounded-3xl glass-subtle border p-4">
            <div className="mb-3">
              <h3 className="text-sm font-black text-white">{g.title}</h3>
              <p className="text-[11px] text-white/50">{g.hint}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROFILE_FIELDS.filter((f) => f.group === g.id).map((f) => (
                <label key={f.key} className={`flex flex-col gap-1 rounded-2xl bg-black/25 border px-3 py-2 ${draft[f.key] ? "border-vz-blue/35" : "border-white/10"} ${f.kind === "text" && f.group === "goals" ? "sm:col-span-2" : ""}`}>
                  <span className="text-[11px] font-bold text-white/55">{f.label}</span>
                  {f.kind === "choice" ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {f.options!.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => set(f.key, draft[f.key] === o ? "" : o)}
                          className={`px-2.5 py-1 rounded-full text-[12px] font-bold border transition-colors ${draft[f.key] === o ? "bg-vz-blue border-vz-blue text-white" : "border-white/15 text-white/70 hover:bg-white/10"}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <input
                        value={draft[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        inputMode={f.kind === "text" ? "text" : "decimal"}
                        dir={f.kind === "text" ? "rtl" : "ltr"}
                        className="w-full bg-transparent text-white text-sm font-bold outline-none placeholder:text-white/25"
                      />
                      {UNIT[f.kind] && <span className="text-[11px] text-white/45 shrink-0">{UNIT[f.kind]}</span>}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-0 pb-1 pt-2 bg-gradient-to-t from-vz-navy-deep via-vz-navy-deep/90 to-transparent">
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={!dirty && !saved} className="btn btn-primary flex-1 min-h-[46px] rounded-2xl text-sm font-black disabled:opacity-50">
              {saved && !dirty ? <Check className="w-4 h-4" /> : null}
              {saved && !dirty ? "انحفظ الملف" : "احفظ ملف مشروعي"}
            </button>
            <button
              type="button"
              onClick={() => {
                save();
                onAskAdvisor("اقرا ملف مشروعي وگلي وين أكبر خلل بالأرقام، احسبلي ربحي الصافي للطلب، وشنو أول 3 خطوات أسويها هالأسبوع؟");
              }}
              disabled={filled < 3}
              className="btn btn-glass min-h-[46px] rounded-2xl px-4 text-sm font-black disabled:opacity-40"
              title={filled < 3 ? "عبّي 3 معلومات على الأقل" : undefined}
            >
              <Sparkles className="w-4 h-4" />
              شخّص مشروعي
            </button>
            {filled > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("تريد تمسح كل معلومات ملف مشروعك؟")) {
                    setDraft({});
                    onSave({});
                  }
                }}
                className="btn btn-ghost min-h-[46px] rounded-2xl px-3"
                aria-label="مسح الملف"
                title="مسح الملف"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
