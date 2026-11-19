import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown, Lock, MessageCircle, Pin, Play, ThumbsUp, X, ZoomIn } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

// Chapter 6 visuals: the page front in 10 seconds, the post under the fold, the shot list, the review screenshot and the order message.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";
const tab = (on: boolean) =>
  `flex-1 min-h-[44px] rounded-xl text-[14px] font-black border transition-colors duration-200 ${on ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`;

function Toggle({ value, set, a, b }: { value: boolean; set: (v: boolean) => void; a: string; b: string }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => set(false)} className={tab(!value)}>{a}</button>
      <button type="button" onClick={() => set(true)} className={tab(value)}>{b}</button>
    </div>
  );
}

/* ---------- profile10: a stranger looks at the page for 10 seconds ---------- */
type Spot = "name" | "bio" | "button" | "highlights" | "pinned";
type Prof = {
  name: string;
  handle: string;
  avatar: string;
  posts: number;
  followers: string;
  bio: string[];
  whatsapp?: boolean;
  highlights: { word: string }[];
  grid: { src: string; alt: string; pin?: boolean; video?: boolean }[];
};
type PQ = { q: string; weak?: string; strong?: string; at: Spot };
type ProfileData = { weak: Prof; strong: Prof; tint: string; questions: PQ[]; weakSay: string; strongSay: string; thumbSay: string };

function Profile10({ d }: { d: ProfileData }) {
  const [strong, setStrong] = useState(false);
  const [t, setT] = useState(-1);
  const p = strong ? d.strong : d.weak;
  const running = t >= 0 && t < 10;
  const per = 10 / d.questions.length;
  const active = running ? Math.min(d.questions.length - 1, Math.floor(t / per)) : -1;
  const seen = t < 0 ? 0 : t >= 10 ? d.questions.length : active;
  const answered = d.questions.filter((q) => (strong ? q.strong : q.weak)).length;
  useEffect(() => {
    setT(-1);
  }, [strong]);
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setT((v) => Math.round((v + 0.1) * 10) / 10), 100);
    return () => clearTimeout(id);
  }, [t, running]);
  const lit = (s: Spot) => {
    if (active < 0) return "";
    const q = d.questions[active];
    if (q.at !== s) return "";
    return (strong ? q.strong : q.weak) ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white rounded-md" : "ring-2 ring-red-400 ring-offset-2 ring-offset-white rounded-md";
  };
  return (
    <div className="space-y-4">
      <Toggle value={strong} set={setStrong} a="قبل الترتيب" b="بعد الترتيب" />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,300px)_1fr] items-start">
        <div className="mx-auto w-full max-w-[300px] rounded-[26px] overflow-hidden bg-white text-[#14171c] border border-white/12 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
          <motion.div key={strong ? "s" : "w"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="p-3.5 space-y-3">
            <p className="text-[14px] font-black text-center" dir="ltr">{p.handle}</p>
            <div className="flex items-center gap-4">
              <img src={p.avatar} alt={`صورة بيج ${p.name}`} className="w-[68px] h-[68px] rounded-full object-cover border border-black/10 shrink-0" />
              <div className="flex-1 grid grid-cols-2 text-center">
                <span className="text-[15px] font-black leading-tight">{p.posts}<span className="block text-[11px] font-bold text-black/55">منشور</span></span>
                <span className="text-[15px] font-black leading-tight">{p.followers}<span className="block text-[11px] font-bold text-black/55">متابع</span></span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className={`w-fit text-[14px] font-black ${lit("name")}`}>{p.name}</p>
              <div className={`text-[13px] leading-snug ${lit("bio")}`}>
                {p.bio.map((l) => <p key={l}>{l}</p>)}
              </div>
            </div>
            <div className={`flex gap-1.5 ${lit("button")}`}>
              <span className="flex-1 rounded-lg bg-[#e9ebee] py-1.5 text-center text-[12px] font-black">متابعة</span>
              <span className="flex-1 rounded-lg bg-[#e9ebee] py-1.5 text-center text-[12px] font-black">{p.whatsapp ? "واتساب" : "مراسلة"}</span>
            </div>
            <div className={`flex gap-2.5 min-h-[62px] ${lit("highlights")}`}>
              {p.highlights.length === 0 && <p className="self-center text-[12px] text-black/40">ماكو هايلايتس</p>}
              {p.highlights.map((h) => (
                <span key={h.word} className="flex flex-col items-center gap-1">
                  <span className="w-[46px] h-[46px] rounded-full p-[2px] border border-black/15">
                    <span className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: d.tint, color: "#f4efe6" }}>{h.word}</span>
                  </span>
                  <span className="text-[10px] font-bold text-black/70">{h.word}</span>
                </span>
              ))}
            </div>
          </motion.div>
          <div className={`grid grid-cols-3 gap-[2px] ${lit("pinned")}`}>
            {p.grid.map((g, i) => (
              <span key={i} className="relative aspect-[3/4] bg-black/10 overflow-hidden">
                <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                {g.pin && (
                  <span className="absolute top-1 right-1 rounded-full bg-black/55 p-1" aria-hidden="true">
                    <Pin className="w-3 h-3 text-white" />
                  </span>
                )}
                {g.video && (
                  <span className="absolute top-1 left-1 rounded-full bg-black/55 p-1" aria-hidden="true">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setT(0)}
            disabled={running}
            className="w-full min-h-[48px] rounded-xl bg-white text-[#040e33] text-[15px] font-black disabled:opacity-60"
          >
            {running ? <span dir="ltr">0:{String(Math.max(0, Math.ceil(10 - t))).padStart(2, "0")}</span> : t >= 10 ? "عيد الـ 10 ثواني" : "ابدي الـ 10 ثواني"}
          </button>
          <div className="space-y-2">
            {d.questions.map((q, i) => {
              const ans = strong ? q.strong : q.weak;
              const done = i < seen;
              const now = i === active;
              return (
                <div key={q.q} className={`${card} p-3 transition-colors duration-300 ${now ? "border-white/40" : ""}`}>
                  <p className="flex items-center gap-2 text-[15px] font-black text-white">
                    {done || now ? (
                      ans ? <Check className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" /> : <X className="w-4 h-4 text-red-300 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/25 shrink-0" aria-hidden="true" />
                    )}
                    {q.q}
                  </p>
                  {(done || now) && (
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-1 text-[14px] leading-relaxed ${ans ? "text-emerald-100/90" : "text-red-200/90"}`}>
                      {ans ?? "ما لكى الجواب بالواجهة"}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
          {t >= 10 && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${strong ? "text-emerald-200" : "text-red-200"}`}>
              {answered} من {d.questions.length}. {strong ? d.strongSay : d.weakSay}
            </motion.p>
          )}
        </div>
      </div>
      <div className={`${card} p-4 flex flex-wrap items-center gap-x-6 gap-y-3`}>
        <p className="w-full text-[14px] font-bold text-white/70">نفس الصورتين بحجم ظفر الإبهام، مثل ما تبين بالتعليقات:</p>
        {[d.weak, d.strong].map((x, i) => (
          <span key={x.handle} className="flex items-center gap-2.5">
            <img src={x.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-white/20" />
            <span className={`text-[14px] font-bold ${i ? "text-emerald-200" : "text-red-200"}`}>{i ? "تنقري" : "ما تنقري"}</span>
          </span>
        ))}
        <p className="w-full text-[14px] text-white/70 leading-relaxed">{d.thumbSay}</p>
      </div>
    </div>
  );
}

/* ---------- postfold: the post as it shows in the feed, cut after two lines ---------- */
type FPost = { lines: string[]; more: string[]; src: string; alt: string; inbox: string[] };
function PostFold({ d }: { d: { page: string; weak: FPost; strong: FPost; weakSay: string; strongSay: string } }) {
  const [strong, setStrong] = useState(false);
  const [open, setOpen] = useState(false);
  const p = strong ? d.strong : d.weak;
  useEffect(() => setOpen(false), [strong]);
  return (
    <div className="space-y-4">
      <Toggle value={strong} set={setStrong} a="صورة المورد والسعر بالخاص" b="المنشور المرتب" />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,320px)_1fr] items-start">
        <motion.div key={strong ? "s" : "w"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mx-auto w-full max-w-[320px] rounded-2xl overflow-hidden bg-white text-[#14171c] border border-white/12">
          <div className="flex items-center gap-2.5 p-3">
            <span className="w-9 h-9 rounded-full bg-[#16243d] text-white text-[14px] font-black flex items-center justify-center">{d.page.charAt(0)}</span>
            <span className="leading-tight">
              <span className="block text-[14px] font-black">{d.page}</span>
              <span className="text-[11px] text-black/50">ممول</span>
            </span>
          </div>
          <div className="px-3 pb-3 text-[14px] leading-relaxed">
            {p.lines.map((l) => <p key={l}>{l}</p>)}
            {open && p.more.map((l, i) => (
              <motion.p key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: i * 0.05 }} className={l === "" ? "h-2" : ""}>
                {l}
              </motion.p>
            ))}
            {!open && p.more.length > 0 && (
              <button type="button" onClick={() => setOpen(true)} className="font-black text-black/55 min-h-[32px]">
                ... عرض المزيد
              </button>
            )}
          </div>
          <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className="w-full aspect-[4/5] object-cover" />
          <div className="flex justify-around border-t border-black/10 py-2 text-[12px] font-bold text-black/60" aria-hidden="true">
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />أعجبني</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />تعليق</span>
            <span className="flex items-center gap-1">واتساب</span>
          </div>
        </motion.div>
        <div className="space-y-3">
          <p className="text-[14px] font-bold text-white/60">الخاص اليوم</p>
          {p.inbox.map((m, i) => (
            <motion.p key={(strong ? "s" : "w") + m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.3 + i * 0.25 }} className="w-fit max-w-full rounded-2xl bg-white/[0.08] px-3.5 py-2 text-[15px] text-white/90">
              {m}
            </motion.p>
          ))}
          <motion.p key={"say" + strong} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.4 + p.inbox.length * 0.25 }} className={`text-[16px] font-bold leading-relaxed ${strong ? "text-emerald-200" : "text-red-200"}`}>
            {strong ? d.strongSay : d.weakSay}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

/* ---------- shotlist: each customer question gets its own shot ---------- */
type Shot = { q: string; title: string; src: string; alt: string; say: string };
function ShotList({ d }: { d: { page: string; supplier: { src: string; alt: string; say: string }; shots: Shot[]; done: string } }) {
  const [cur, setCur] = useState(-1);
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const n = Object.keys(seen).length;
  const show = cur < 0 ? d.supplier : d.shots[cur];
  const pick = (i: number) => {
    setCur(i);
    setSeen((s) => ({ ...s, [i]: true }));
  };
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,290px)_1fr] items-start">
      <div className="space-y-3">
        <motion.div key={cur} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={ease} className="relative mx-auto w-full max-w-[290px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/12 bg-black">
          <img src={show.src} alt={show.alt} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute top-2.5 right-2.5 rounded-lg bg-black/65 px-2.5 py-1 text-[12px] font-black text-white">{cur < 0 ? "صورة المورد" : d.shots[cur].title}</span>
        </motion.div>
        <motion.p key={"s" + cur} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.15 }} className={`text-[15px] leading-relaxed ${cur < 0 ? "text-red-200" : "text-white/85"}`}>
          {show.say}
        </motion.p>
      </div>
      <div className="space-y-3">
        <p className="text-[14px] font-bold text-white/70 leading-relaxed">أسئلة الزبون. اضغط على كل سؤال وشوف اللقطة اللي تجاوبه</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div animate={{ width: `${(n / d.shots.length) * 100}%` }} transition={ease} className="h-full rounded-full bg-emerald-300" />
          </div>
          <span className="text-[14px] font-black text-white shrink-0">{n} من {d.shots.length}</span>
        </div>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
          {d.shots.map((s, i) => (
            <button
              key={s.q}
              type="button"
              onClick={() => pick(i)}
              className={`min-h-[52px] rounded-xl border px-3 py-2 text-right transition-colors duration-200 ${cur === i ? "bg-white text-[#040e33] border-white" : seen[i] ? "bg-white/[0.07] border-emerald-300/40 text-white" : "bg-white/[0.04] border-white/12 text-white/85"}`}
            >
              <span className="block text-[14px] font-black leading-snug">{s.q}</span>
              {seen[i] && <span className={`block text-[12px] font-bold ${cur === i ? "text-[#040e33]/60" : "text-emerald-200/80"}`}>{s.title}</span>}
            </button>
          ))}
        </div>
        {n === d.shots.length && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[16px] font-bold text-emerald-200 leading-relaxed">
            {d.done}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/* ---------- redact: ask first, then cover the name, the number and the photo with a full box ---------- */
type Part = "avatar" | "name" | "phone";
type RedactData = {
  page: string;
  name: string;
  phone: string;
  photo: { src: string; alt: string };
  review: string;
  ask: string;
  yes: string;
  from: string;
  penSay: string;
  noAsk: string;
  left: string;
  done: string;
};
function Redact({ d }: { d: RedactData }) {
  const [tool, setTool] = useState<"pen" | "box">("pen");
  const [cover, setCover] = useState<Partial<Record<Part, "pen" | "box">>>({});
  const [asked, setAsked] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [tried, setTried] = useState(false);
  const parts: Part[] = ["avatar", "name", "phone"];
  const allBox = parts.every((p) => cover[p] === "box");
  const anyPen = parts.some((p) => cover[p] === "pen");
  const ok = asked && allBox;
  const hit = (p: Part) => setCover((c) => ({ ...c, [p]: tool }));
  const mask = (p: Part) =>
    cover[p] === "box" ? "bg-[#111] text-transparent" : cover[p] === "pen" ? (zoom ? "bg-black/35" : "bg-black/70") : "";
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTool("pen")} className={tab(tool === "pen")}>قلم شفاف</button>
        <button type="button" onClick={() => setTool("box")} className={tab(tool === "box")}>مستطيل معبى</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,320px)_1fr] items-start">
        <div className="mx-auto w-full max-w-[320px] rounded-2xl overflow-hidden bg-[#efeae2] text-[#14171c] border border-white/12">
          <div className="bg-[#1f4d43] overflow-hidden">
          <div className={`flex items-center gap-2.5 px-3 py-2.5 text-white transition-transform duration-300 origin-right ${zoom ? "scale-[1.6]" : ""}`}>
            <button type="button" onClick={() => hit("avatar")} aria-label="غط الصورة الشخصية" className={`relative w-9 h-9 rounded-full overflow-hidden shrink-0 ${cover.avatar === "box" ? "bg-[#111]" : "bg-[#c9b8a6]"}`}>
              {cover.avatar !== "box" && <span className="absolute inset-0 flex items-center justify-center text-[14px] font-black text-[#3b2d22]">{d.name.charAt(0)}</span>}
              {cover.avatar === "pen" && <span className={`absolute inset-0 ${mask("avatar")}`} />}
            </button>
            <span className="leading-tight min-w-0">
              <button type="button" onClick={() => hit("name")} aria-label="غط الاسم" className={`block text-[14px] font-black px-1 rounded ${mask("name")}`}>{d.name}</button>
              <button type="button" onClick={() => hit("phone")} aria-label="غط الرقم" className={`block text-[12px] text-white/80 px-1 rounded ${mask("phone")}`} dir="ltr">{d.phone}</button>
            </span>
          </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="ml-auto w-[78%] rounded-xl bg-white p-1.5">
              <img src={d.photo.src} alt={d.photo.alt} loading="lazy" className="w-full aspect-[4/5] object-cover rounded-lg" />
            </div>
            <p className="ml-auto w-fit max-w-[85%] rounded-xl bg-white px-3 py-2 text-[13px] leading-relaxed">{d.review}</p>
            {asked && (
              <>
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mr-auto w-fit max-w-[85%] rounded-xl bg-[#d9fdd3] px-3 py-2 text-[13px] leading-relaxed">{d.ask}</motion.p>
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.8 }} className="ml-auto w-fit max-w-[85%] rounded-xl bg-white px-3 py-2 text-[13px] leading-relaxed">{d.yes}</motion.p>
              </>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[15px] text-white/75 leading-relaxed">اختار الأداة واضغط على الصورة الشخصية والاسم والرقم حتى تغطيهن.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAsked(true)} disabled={asked} className="min-h-[44px] px-4 rounded-xl border border-white/15 bg-white/[0.05] text-[14px] font-black text-white disabled:opacity-50">
              {asked ? "طلبت الإذن" : "اطلب الإذن بالنشر"}
            </button>
            <button type="button" onClick={() => setZoom((z) => !z)} className="min-h-[44px] px-4 rounded-xl border border-white/15 bg-white/[0.05] text-[14px] font-black text-white flex items-center gap-2">
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
              {zoom ? "رجع الحجم" : "كبر السكرين"}
            </button>
            <button type="button" onClick={() => setTried(true)} className="min-h-[44px] px-5 rounded-xl bg-white text-[#040e33] text-[14px] font-black">
              انشر بالهايلايت
            </button>
          </div>
          {anyPen && zoom && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">{d.penSay}</motion.p>
          )}
          {tried && !ok && (
            <motion.p key={String(asked) + allBox} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] font-bold text-red-200 leading-relaxed">
              {!asked ? d.noAsk : d.left}
            </motion.p>
          )}
          {tried && ok && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="space-y-3">
              <div className="relative w-full max-w-[220px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/12">
                <img src={d.photo.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-3 bottom-4 rounded-xl bg-white/95 p-3 text-[#14171c]">
                  <p className="text-[12px] leading-relaxed">{d.review}</p>
                  <p className="mt-1 text-[11px] font-bold text-black/55">{d.from}</p>
                </div>
                <span className="absolute top-2 right-3 text-[11px] font-black text-white drop-shadow">{d.page}</span>
              </div>
              <p className="flex items-start gap-2 text-[16px] font-bold text-emerald-200 leading-relaxed">
                <Lock className="w-4 h-4 mt-1.5 shrink-0" aria-hidden="true" />
                {d.done}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- ordermsg: what the order message holds decides whether the courier finds the house ---------- */
type OField = { id: string; label: string; value: string; ask: string; courier?: boolean };
type OrderData = { fields: OField[]; weakHas: string[]; how: { src: string; alt: string }; minutes: number; badSay: string; okSay: string };
function OrderMsg({ d }: { d: OrderData }) {
  const [has, setHas] = useState<Record<string, boolean>>(() => Object.fromEntries(d.weakHas.map((k) => [k, true])));
  const [how, setHow] = useState(false);
  useEffect(() => {
    setHas(how ? Object.fromEntries(d.fields.map((f) => [f.id, true])) : Object.fromEntries(d.weakHas.map((k) => [k, true])));
  }, [how]);
  const missing = d.fields.filter((f) => !has[f.id]);
  const lost = missing.some((f) => f.courier);
  return (
    <div className="space-y-4">
      <Toggle value={how} set={setHow} a="للطلب راسلنا أو علق" b="هايلايت طريقة الطلب" />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr] items-start">
        {how ? (
          <motion.img key="how" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} src={d.how.src} alt={d.how.alt} className="mx-auto w-full max-w-[240px] aspect-[9/16] object-cover rounded-2xl border border-white/12" />
        ) : (
          <div className={`${card} p-4 space-y-2`}>
            <p className="text-[14px] font-bold text-white/70">اضغط على المعلومة حتى تضيفها لرسالة الزبون أو تشيلها:</p>
            {d.fields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHas((h) => ({ ...h, [f.id]: !h[f.id] }))}
                className={`w-full min-h-[44px] flex items-center gap-2 rounded-xl border px-3 text-right text-[14px] font-bold transition-colors duration-200 ${has[f.id] ? "border-emerald-300/40 bg-white/[0.07] text-white" : "border-white/12 text-white/60"}`}
              >
                {has[f.id] ? <Check className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" /> : <span className="w-4 h-4 rounded border border-white/30 shrink-0" aria-hidden="true" />}
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2.5">
          <p className="text-[14px] font-bold text-white/60">رسالة الزبون</p>
          <motion.div layout className="w-fit max-w-full rounded-2xl bg-white/[0.08] px-3.5 py-2.5 text-[15px] text-white/90 leading-relaxed">
            {d.fields.filter((f) => has[f.id]).map((f) => <p key={f.id}>{f.value}</p>)}
            {d.fields.every((f) => !has[f.id]) && <p>أريد أطلب</p>}
          </motion.div>
          {missing.map((f, i) => (
            <motion.p key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.15 + i * 0.12 }} className="mr-auto w-fit max-w-full rounded-2xl bg-[#1d3a7a]/70 px-3.5 py-2 text-[14px] text-white/90">
              {f.ask}
            </motion.p>
          ))}
          <div className={`${card} p-3.5 flex flex-wrap gap-x-6 gap-y-1`}>
            <span className="text-[14px] text-white/70">رسائل رايحة جاية: <b className="text-white">{missing.length * 2}</b></span>
            <span className="text-[14px] text-white/70">وقت ضايع تقريبا: <b className="text-white">{missing.length * d.minutes} دقيقة</b></span>
          </div>
          <motion.p key={String(lost) + missing.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className={`text-[16px] font-bold leading-relaxed ${missing.length ? "text-red-200" : "text-emerald-200"}`}>
            {missing.length ? (lost ? d.badSay : "المعلومات ناقصة، فلازم ترجع تسأل قبل لا تثبت الطلب.") : d.okSay}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export const KIT6 = {
  profile10: { render: (d: ProfileData) => <Profile10 d={d} /> },
  postfold: { render: (d) => <PostFold d={d} /> },
  shotlist: { render: (d) => <ShotList d={d} /> },
  redact: { render: (d: RedactData) => <Redact d={d} /> },
  ordermsg: { render: (d: OrderData) => <OrderMsg d={d} /> },
};
