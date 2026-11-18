import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Clock, Gift, MessageCircle, RotateCcw, Search, ShieldCheck, Star } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";
import { Avatar, FeedPost, PostImage } from "./audience";

// Data-driven lesson visuals for chapter 1 and the chapters after it. Each one takes its words and numbers from the lesson.
const ease = { duration: 0.45, ease: EASE_OUT };
const card = "rounded-2xl bg-white/[0.04] border border-white/[0.09]";

/* ---------- posts: switch between real posts, one per step ---------- */
type PostItem = { tab: string; page: string; src: string; alt: string; caption: string; comments?: string[]; note: string };
function Posts({ d, shown }: { d: { items: PostItem[] }; shown: number }) {
  const i = Math.min(shown, d.items.length) - 1;
  const it = d.items[i];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {d.items.map((x, j) => (
          <span key={x.tab} className={`px-3.5 py-1.5 rounded-xl text-[14px] font-black border transition-colors duration-300 ${j === i ? "bg-white text-[#040e33] border-white" : j < i ? "text-white/70 border-white/25" : "text-white/35 border-white/10"}`}>
            {x.tab}
          </span>
        ))}
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
        <FeedPost page={it.page} creative={<PostImage src={it.src} alt={it.alt} />} caption={it.caption} comments={it.comments} />
      </motion.div>
      <motion.p key={"n" + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 0.3 }} className="text-[16px] sm:text-[17px] text-white/80 leading-relaxed">
        {it.note}
      </motion.p>
    </div>
  );
}

/* ---------- sorter: put each item in its bucket ---------- */
type SortItem = { text: string; who?: string; answer: string; why: string };
function Sorter({ d }: { d: { prompt: string; buckets: { id: string; label: string }[]; items: SortItem[]; done: string } }) {
  const [picks, setPicks] = useState<Record<number, string>>({});
  const right = d.items.filter((it, i) => picks[i] === it.answer).length;
  const all = d.items.every((it, i) => picks[i] === it.answer);
  return (
    <div>
      <p className="text-[15px] sm:text-[16px] text-white/70 leading-relaxed mb-3">{d.prompt}</p>
      <div className="space-y-3">
        {d.items.map((it, i) => {
          const p = picks[i];
          const ok = p === it.answer;
          return (
            <div key={it.text} className={`rounded-2xl border p-3.5 transition-colors duration-300 ${p === undefined ? "bg-white/[0.04] border-white/10" : ok ? "bg-emerald-400/[0.08] border-emerald-300/40" : "bg-red-500/[0.06] border-red-400/30"}`}>
              <div className="flex items-start gap-2.5 mb-2.5">
                {it.who && <Avatar name={it.who} />}
                <p className="flex-1 rounded-2xl bg-white/[0.07] px-3 py-2 text-[15px] sm:text-[16px] text-white leading-relaxed">{it.text}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.buckets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={ok}
                    onClick={() => setPicks((s) => ({ ...s, [i]: b.id }))}
                    className={`min-h-[40px] px-3.5 rounded-xl text-[14px] font-black border transition-colors duration-200 ${
                      p === b.id ? (ok ? "bg-emerald-400/20 border-emerald-300/60 text-white" : "bg-red-500/15 border-red-400/50 text-white") : "bg-white/[0.04] border-white/12 text-white/80 hover:bg-white/[0.09]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {p !== undefined && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-2 text-[14px] font-bold leading-relaxed ${ok ? "text-emerald-200" : "text-red-200"}`}>
                  {ok ? it.why : "مو هنا، جرب مرة ثانية."}
                </motion.p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[15px] font-black text-white/70">
        {right} من {d.items.length}
      </p>
      {all && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-2 text-[16px] font-bold text-emerald-200 leading-relaxed">
          {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- journey: one person over days, each day a post ---------- */
type JourneyStep = { when: string; src: string; alt: string; state: string; note: string };
function Journey({ d, shown }: { d: { steps: JourneyStep[]; end: string }; shown: number }) {
  const n = Math.min(shown, d.steps.length);
  return (
    <div>
      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:right-[22px] before:w-[2px] before:bg-white/12">
        {d.steps.slice(0, n).map((s, i) => (
          <motion.li key={s.when} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={ease} className="relative flex items-start gap-3.5">
            <span className={`relative z-10 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-[13px] font-black ${i === n - 1 ? "bg-white text-[#040e33]" : "bg-vz-blue/40 text-white"}`}>{i + 1}</span>
            <div className={`flex-1 ${card} p-3 flex gap-3`}>
              <img src={s.src} alt={s.alt} width={900} height={1125} loading="lazy" decoding="async" className="w-[92px] sm:w-[120px] h-auto rounded-xl shrink-0 self-start" />
              <div className="min-w-0">
                <p className="text-[13px] font-black text-vz-accent">{s.when}</p>
                <p className="text-[16px] sm:text-[17px] font-black text-white leading-snug mt-0.5">{s.state}</p>
                <p className="text-[14px] sm:text-[15px] text-white/70 leading-relaxed mt-1">{s.note}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
      {n >= d.steps.length && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.3 }} className="mt-4 rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4 text-[16px] font-bold text-emerald-100 leading-relaxed">
          {d.end}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- flip: what the page says vs why people really buy ---------- */
function Flip({ d }: { d: { prompt: string; cards: { product: string; says: string; real: string }[] } }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div>
      <p className="text-[15px] sm:text-[16px] text-white/70 leading-relaxed mb-3">{d.prompt}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {d.cards.map((c, i) => {
          const o = !!open[i];
          return (
            <button key={c.product} type="button" onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))} className={`text-right rounded-2xl border p-4 min-h-[128px] transition-colors duration-300 ${o ? "bg-vz-blue/25 border-vz-blue-light/60" : "bg-white/[0.04] border-white/12 hover:bg-white/[0.08]"}`}>
              <span className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[17px] font-black text-white">{c.product}</span>
                <RotateCcw className="w-4 h-4 text-white/40 shrink-0" />
              </span>
              <motion.span key={o ? "r" : "s"} initial={{ opacity: 0, rotateX: -60 }} animate={{ opacity: 1, rotateX: 0 }} transition={ease} className="block">
                <span className={`block text-[12px] font-black mb-1 ${o ? "text-emerald-200" : "text-white/45"}`}>{o ? "ليش يشتريها فعلا" : "شنو تكتب الصفحة"}</span>
                <span className="block text-[15px] sm:text-[16px] text-white/90 leading-relaxed">{o ? c.real : c.says}</span>
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- checklist: each step you tick shows up on the page ---------- */
type CheckItem = { id: string; title: string; text: string };
function Checklist({ d }: { d: { page: string; items: CheckItem[]; bio: string; phone: string; highlights: string[]; review: string; reply: { comment: string; answer: string } } }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const n = Object.values(on).filter(Boolean).length;
  return (
    <div className="space-y-4">
      <div className="rounded-[22px] bg-[#0a1640] border border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="w-14 h-14 rounded-full bg-vz-blue/40 flex items-center justify-center text-[20px] font-black text-white shrink-0">{d.page.charAt(0)}</span>
          <div className="min-w-0">
            <p className="text-[17px] font-black text-white truncate">{d.page}</p>
            <p className="text-[13px] text-white/50">صفحة جديدة</p>
          </div>
          <span className={`mr-auto px-2.5 py-1 rounded-lg text-[12px] font-black border transition-colors duration-300 ${n >= d.items.length ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/40" : "text-white/40 border-white/10"}`}>ثقة {n} من {d.items.length}</span>
        </div>
        <p className="mt-3 text-[14px] text-white/80 leading-relaxed">
          {d.bio}
          {on.phone && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="block font-bold text-white mt-1">واتساب: <span dir="ltr" className="inline-block">{d.phone}</span></motion.span>}
        </p>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {d.highlights.map((h, i) => {
            const show = (i === 0 && on.check) || (i === 1 && on.reviews) || (i === 2 && on.video);
            return (
              <span key={h} className={`shrink-0 flex flex-col items-center gap-1 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-25"}`}>
                <span className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${show ? "border-vz-blue-light bg-vz-blue/25" : "border-white/20"}`}>
                  {i === 0 ? <ShieldCheck className="w-6 h-6 text-white" /> : i === 1 ? <Star className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
                </span>
                <span className="text-[12px] font-bold text-white/80">{h}</span>
              </span>
            );
          })}
        </div>
        {on.reviews && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-white/[0.06] px-3 py-2 text-[14px] text-white/85 leading-relaxed">
            {d.review}
          </motion.p>
        )}
        {on.reply && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-1.5">
            <p className="rounded-2xl bg-white/[0.06] px-3 py-2 text-[14px] text-white/80">{d.reply.comment}</p>
            <p className="rounded-2xl bg-vz-blue/25 px-3 py-2 text-[14px] text-white mr-6">{d.reply.answer}</p>
          </motion.div>
        )}
      </div>
      <ul className="space-y-2">
        {d.items.map((it) => {
          const v = !!on[it.id];
          return (
            <li key={it.id}>
              <button type="button" onClick={() => setOn((s) => ({ ...s, [it.id]: !s[it.id] }))} className={`w-full text-right flex items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors duration-200 ${v ? "bg-emerald-400/[0.08] border-emerald-300/40" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"}`}>
                <span className={`w-6 h-6 mt-0.5 rounded-lg border-2 flex items-center justify-center shrink-0 ${v ? "bg-emerald-400 border-emerald-300" : "border-white/30"}`}>{v && <Check className="w-4 h-4 text-[#03140c]" strokeWidth={3} />}</span>
                <span>
                  <span className="block text-[16px] font-black text-white">{it.title}</span>
                  <span className="block text-[14px] text-white/70 leading-relaxed mt-0.5">{it.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- adlibrary: the ad library list, sorted by how long each ad has run ---------- */
type LibAd = { page: string; src: string; alt: string; started: string; days: number; line: string; note: string };
function AdLibrary({ d, shown }: { d: { query: string; ads: LibAd[]; sortedNote: string }; shown: number }) {
  const sorted = shown >= 2;
  const list = useMemo(() => (sorted ? [...d.ads].sort((a, b) => b.days - a.days) : d.ads), [d.ads, sorted]);
  return (
    <div>
      <div className="rounded-2xl bg-white text-[#1c1e21] p-3 flex items-center gap-2.5">
        <Search className="w-5 h-5 text-[#65676b] shrink-0" />
        <span className="text-[15px] font-bold flex-1">{d.query}</span>
        <span className="text-[12px] font-bold text-[#65676b] px-2 py-1 rounded-md bg-[#f0f2f5]">العراق</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-white/55">
        <span>{d.ads.length} إعلانات شغالة</span>
        <span className={sorted ? "text-white" : ""}>{sorted ? "مرتبة من الأقدم" : "ترتيب عشوائي"}</span>
      </div>
      <div className="mt-3 space-y-3">
        {list.map((a, i) => (
          <motion.div layout key={a.page} transition={ease} className={`rounded-2xl bg-white text-[#1c1e21] p-3 flex gap-3 ${sorted && i === 0 ? "ring-4 ring-emerald-300/70" : ""}`}>
            <img src={a.src} alt={a.alt} width={900} height={1125} loading="lazy" decoding="async" className="w-[84px] sm:w-[104px] h-auto rounded-lg shrink-0 self-start" />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#1a7f37] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1a7f37]" /> شغال
              </p>
              <p className="text-[15px] font-black mt-0.5">{a.page}</p>
              <p className="text-[13px] text-[#65676b] mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> بدا العرض {a.started}، صارله {a.days} يوم
              </p>
              <p className="text-[14px] text-[#1c1e21] mt-1.5 leading-snug">{a.line}</p>
              {sorted && <p className="text-[13px] font-bold text-[#0b5cad] mt-1.5 leading-snug">{a.note}</p>}
            </div>
          </motion.div>
        ))}
      </div>
      {sorted && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.3 }} className="mt-4 text-[16px] text-white/85 leading-relaxed">
          {d.sortedNote}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- chataudit: a chat with a competitor; tap what they missed ---------- */
type AuditMsg = { from: "me" | "them"; text: string; time: string; flag?: { label: string; why: string } };
function ChatAudit({ d }: { d: { page: string; messages: AuditMsg[]; done: string } }) {
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const flags = d.messages.filter((m) => m.flag).length;
  const found = Object.keys(seen).length;
  return (
    <div>
      <div className="rounded-[22px] overflow-hidden border border-white/10">
        <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-[14px] font-black text-white">{d.page.charAt(0)}</span>
          <span className="text-[15px] font-black text-white">{d.page}</span>
        </div>
        <div className="bg-[#0b141a] p-3 space-y-2">
          {d.messages.map((m, i) => {
            const me = m.from === "me";
            const hit = !!seen[i];
            const Tag = m.flag ? "button" : "div";
            return (
              <div key={i} className={`flex ${me ? "justify-start" : "justify-end"}`}>
                <Tag
                  {...(m.flag ? { type: "button", onClick: () => setSeen((s) => ({ ...s, [i]: true })) } : {})}
                  className={`max-w-[85%] text-right rounded-2xl px-3 py-2 text-[15px] leading-relaxed ${me ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"} ${m.flag && !hit ? "ring-2 ring-amber-300/60" : ""}`}
                >
                  <span className="block">{m.text}</span>
                  <span dir="ltr" className="block text-[11px] text-white/45 mt-0.5 text-left">{m.time}</span>
                  {hit && m.flag && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="block mt-1.5 pt-1.5 border-t border-white/15 text-[13px] text-amber-100">
                      <span className="font-black">{m.flag.label}: </span>
                      {m.flag.why}
                    </motion.span>
                  )}
                </Tag>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-[14px] text-white/60">اضغط على الرسائل المأشرة بالأصفر. لكيت {found} من {flags}.</p>
      {found >= flags && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-2 text-[16px] font-bold text-emerald-200 leading-relaxed">
          {d.done}
        </motion.p>
      )}
    </div>
  );
}

/* ---------- budget: move the money to the days after salaries ---------- */
function Budget({ d }: { d: { total: number; salaryDay: number; note: string } }) {
  const [share, setShare] = useState(50);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  // how easy an order is each day: highest in the week after salaries, lowest just before them
  const ease_ = (day: number) => {
    const since = (day - d.salaryDay + 30) % 30;
    return since < 8 ? 1.35 - since * 0.03 : since > 22 ? 0.62 : 0.95 - (since - 8) * 0.018;
  };
  const strong = days.filter((x) => (x - d.salaryDay + 30) % 30 < 8);
  const perStrong = (d.total * share) / 100 / strong.length;
  const perWeak = (d.total * (100 - share)) / 100 / (30 - strong.length);
  const orders = days.reduce((t, x) => t + (strong.includes(x) ? perStrong : perWeak) * ease_(x), 0) / 10000;
  const even = days.reduce((t, x) => t + (d.total / 30) * ease_(x), 0) / 10000;
  const max = Math.max(perStrong, perWeak);
  return (
    <div>
      <div className={`${card} p-4`}>
        <div dir="ltr" className="flex items-end gap-[3px] h-36" aria-hidden="true">
          {days.map((x) => {
            const amt = strong.includes(x) ? perStrong : perWeak;
            return (
              <div key={x} className="flex-1 flex flex-col justify-end h-full">
                <motion.div animate={{ height: `${(amt / max) * 100}%` }} transition={ease} className={`rounded-t-md ${strong.includes(x) ? "bg-emerald-300" : "bg-white/25"}`} />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/45 font-mono" dir="ltr">
          <span>1</span><span>10</span><span>20</span><span>30</span>
        </div>
        <p className="mt-2 text-[13px] text-white/60"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-300 align-middle ml-1" />الأيام الثمانية بعد نزول الرواتب (يوم {d.salaryDay})</p>
      </div>
      <label className="block mt-4">
        <span className="block text-[15px] font-black text-white mb-2">شكد من ميزانيتك تحطها بأيام بعد الراتب؟ {share}%</span>
        <input type="range" min={27} max={75} step={1} value={share} onChange={(e) => setShare(Number(e.target.value))} className="w-full accent-emerald-300 h-11" />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className={`${card} p-3.5`}>
          <p className="text-[13px] font-bold text-white/50">نفس الصرف كل يوم</p>
          <p className="text-[20px] font-black text-white">{Math.round(even)} طلب</p>
        </div>
        <div className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-3.5">
          <p className="text-[13px] font-bold text-white/50">بتوزيعك</p>
          <motion.p key={Math.round(orders)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[20px] font-black text-emerald-200">{Math.round(orders)} طلب</motion.p>
        </div>
      </div>
      <p className="mt-3 text-[14px] text-white/55 leading-relaxed">{d.note}</p>
    </div>
  );
}

/* ---------- seasons: tap a season, see what to prepare and when ---------- */
type Season = { name: string; when: string; sells: string; prepare: string };
function Seasons({ d }: { d: { seasons: Season[]; rule: string } }) {
  const [i, setI] = useState(0);
  const s = d.seasons[i];
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {d.seasons.map((x, j) => (
          <button key={x.name} type="button" onClick={() => setI(j)} className={`shrink-0 min-h-[44px] px-4 rounded-xl text-[15px] font-black border transition-colors duration-200 ${j === i ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`}>
            {x.name}
          </button>
        ))}
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-4 ${card} p-4 space-y-3`}>
        <p className="text-[13px] font-black text-vz-accent">{s.when}</p>
        <div>
          <p className="text-[13px] font-bold text-white/50">شنو يزيد عليه الطلب</p>
          <p className="text-[16px] text-white leading-relaxed">{s.sells}</p>
        </div>
        <div>
          <p className="text-[13px] font-bold text-white/50">شنو تجهز</p>
          <p className="text-[16px] text-white leading-relaxed">{s.prepare}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-300/[0.08] border border-amber-200/25 px-3 py-2">
          <Gift className="w-4 h-4 text-amber-200 shrink-0" />
          <p className="text-[14px] font-bold text-amber-50/90">{d.rule}</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- provinces: delivery days and returns, sortable ---------- */
type Prov = { name: string; days: string; ret: number; fee: number };
function Provinces({ d }: { d: { rows: Prov[]; start: number; note: string } }) {
  const [by, setBy] = useState<"ret" | "fee">("ret");
  const rows = useMemo(() => [...d.rows].sort((a, b) => a[by] - b[by]), [d.rows, by]);
  const maxRet = Math.max(...d.rows.map((r) => r.ret));
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {([["ret", "رتب حسب الراجع"], ["fee", "رتب حسب الكروة"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setBy(k)} className={`min-h-[40px] px-3.5 rounded-xl text-[14px] font-black border ${by === k ? "bg-white text-[#040e33] border-white" : "bg-white/[0.04] border-white/12 text-white/80"}`}>{l}</button>
        ))}
      </div>
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const first = i < d.start;
          return (
            <motion.li layout key={r.name} transition={ease} className={`rounded-2xl border px-3.5 py-2.5 ${first ? "bg-emerald-400/[0.07] border-emerald-300/30" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-black text-white">{r.name}</span>
                <span className="text-[13px] text-white/60">{r.days}، كروة {r.fee.toLocaleString("en-US")}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div animate={{ width: `${(r.ret / maxRet) * 100}%` }} transition={ease} className={`h-full rounded-full ${r.ret >= 25 ? "bg-red-400" : r.ret >= 15 ? "bg-amber-300" : "bg-emerald-300"}`} />
                </div>
                <span className="text-[13px] font-black text-white w-16 text-left" dir="ltr">{r.ret}% راجع</span>
              </div>
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-3 text-[15px] text-white/80 leading-relaxed">{d.note}</p>
    </div>
  );
}

export const KIT: Record<string, { render: (data: any, shown: number) => React.ReactNode; steps?: (data: any) => number }> = {
  posts: { render: (d, s) => <Posts d={d} shown={s} />, steps: (d) => d.items.length },
  sorter: { render: (d) => <Sorter d={d} /> },
  journey: { render: (d, s) => <Journey d={d} shown={s} />, steps: (d) => d.steps.length },
  flip: { render: (d) => <Flip d={d} /> },
  checklist: { render: (d) => <Checklist d={d} /> },
  adlibrary: { render: (d, s) => <AdLibrary d={d} shown={s} />, steps: () => 2 },
  chataudit: { render: (d) => <ChatAudit d={d} /> },
  budget: { render: (d) => <Budget d={d} /> },
  seasons: { render: (d) => <Seasons d={d} /> },
  provinces: { render: (d) => <Provinces d={d} /> },
};

