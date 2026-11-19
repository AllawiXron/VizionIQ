import React, { useState } from "react";
import { motion } from "motion/react";
import { Bookmark, Check, MessageCircle, Send, ThumbsUp, X } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";

const ease = { duration: 0.45, ease: EASE_OUT };

type Act = "pass" | "stop" | "msg" | "save";

const ACT_STYLE: Record<Act, { label: string; cls: string }> = {
  pass: { label: "تجاوز", cls: "bg-white/[0.06] text-white/45 border-white/10" },
  stop: { label: "توقف", cls: "bg-emerald-400/15 text-emerald-200 border-emerald-300/35" },
  msg: { label: "راسل", cls: "bg-vz-blue/30 text-white border-vz-blue-light/50" },
  save: { label: "حفظ", cls: "bg-amber-300/15 text-amber-100 border-amber-200/35" },
};

export function Avatar({ name, tone = "bg-white/10 text-white/80" }: { name: string; tone?: string }) {
  return (
    <span className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[14px] font-black ${tone}`} aria-hidden="true">
      {name.replace(/^(أم|أبو)\s/, "").charAt(0)}
    </span>
  );
}

export function FeedPost({
  page,
  creative,
  caption,
  comments,
}: {
  page: string;
  creative: React.ReactNode;
  caption: React.ReactNode;
  comments?: string[];
}) {
  return (
    <div className="relative rounded-[22px] overflow-hidden bg-[#0a1640] border border-white/10 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        <Avatar name={page} tone="bg-vz-blue/35 text-white" />
        <div className="min-w-0">
          <p className="text-[15px] font-black text-white leading-tight truncate">{page}</p>
          <p className="text-[12px] font-bold text-white/45">إعلان ممول</p>
        </div>
      </div>
      <div className="relative">{creative}</div>
      <div className="px-4 pt-3 pb-2 text-[15px] text-white/85 leading-[1.75]">{caption}</div>
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-white/[0.07] text-[13px] font-bold text-white/45">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> إعجاب</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> تعليق</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-white/80"><Send className="w-3.5 h-3.5" /> راسلنا</span>
      </div>
      {comments && comments.length > 0 && (
        <div className="px-4 pb-4 pt-1 space-y-2">
          {comments.map((c, i) => (
            <motion.p
              key={c}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ease, delay: 0.5 + i * 0.35 }}
              className="inline-block max-w-full rounded-2xl bg-white/[0.07] px-3.5 py-2 text-[14px] text-white/85 leading-relaxed ml-auto"
            >
              {c}
            </motion.p>
          ))}
        </div>
      )}
    </div>
  );
}

export function Num({ n }: { n: number }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...ease, delay: 0.15 + n * 0.15 }}
      className="inline-flex w-7 h-7 rounded-full bg-white text-[#040e33] text-[14px] font-black items-center justify-center shrink-0 align-middle"
    >
      {n}
    </motion.span>
  );
}

type Zone = { x: number; y: number; w: number; h: number };

// the lesson's example posts are real designed posts (1080x1350), shown as images. Zones are in % of the post.
export function PostImage({ src, alt, ring, marks }: { src: string; alt: string; ring?: Zone | null; marks?: { n: number; x: number; y: number }[] }) {
  return (
    <div className="relative overflow-hidden bg-black/20">
      <img src={src} alt={alt} width={900} height={1125} decoding="async" className="block w-full h-auto" />
      {ring && (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ left: `${ring.x}%`, top: `${ring.y}%`, width: `${ring.w}%`, height: `${ring.h}%`, opacity: 1 }}
          transition={ease}
          className="absolute rounded-xl ring-[3px] ring-white shadow-[0_0_0_9999px_rgba(2,8,35,0.45)]"
        />
      )}
      {marks?.map((m) => (
        <span key={m.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
          <Num n={m.n} />
        </span>
      ))}
    </div>
  );
}

const SUNSHADE_STRONG = "/lesson/sunshade-strong.webp";
const SUNSHADE_STRONG_ALT = "إعلان مظلات بغداد: إيد موظف تنسحب من ستيرن حار بموقف مكشوف، ومكتوب سيارتك تصير فرن من تطلع من الدوام؟";
const ZONES: Record<string, Zone> = {
  scene: { x: 3, y: 16, w: 94, h: 70 },
  headline: { x: 30, y: 2, w: 67, h: 13.5 },
  reassure: { x: 4.5, y: 88.5, w: 40, h: 8 },
};

const PASSERS: Record<"generic" | "target", { name: string; role: string; act: Act; note: string }[]> = {
  generic: [
    { name: "مصطفى", role: "طالب جامعة", act: "pass", note: "تجاوز الإعلان بنص ثانية" },
    { name: "حسين", role: "موظف بدائرة حكومية", act: "pass", note: "عنده نفس المشكلة، بس ما حس إن الإعلان يحچي وياه" },
    { name: "أم زهراء", role: "ربة بيت", act: "pass", note: "تجاوزت الإعلان" },
    { name: "كرار", role: "سايق تكسي", act: "pass", note: "تجاوز" },
    { name: "نور", role: "موظفة بالوزارة", act: "pass", note: "تجاوزت الإعلان" },
    { name: "أبو علي", role: "متقاعد", act: "stop", note: "وقف ثانيتين وكمل يتفرج" },
  ],
  target: [
    { name: "حسين", role: "موظف بدائرة حكومية", act: "msg", note: "شاف الفيديو كله وراسل: تنفع لسيارة يارس؟" },
    { name: "كرار", role: "سايق تكسي", act: "stop", note: "وقف 9 ثواني وعلق: بيش؟" },
    { name: "نور", role: "موظفة بالوزارة", act: "stop", note: "وقفت وذكرت زوجها بالتعليقات" },
    { name: "أبو علي", role: "متقاعد", act: "save", note: "حفظت المنشور حتى ترجعله بعدين" },
    { name: "مصطفى", role: "طالب جامعة", act: "pass", note: "تجاوز الإعلان، لأن ما عنده سيارة" },
    { name: "أم زهراء", role: "ربة بيت", act: "pass", note: "تجاوزت الإعلان" },
  ],
};

const CROWD = 40;
const STOPPED = { generic: [17], target: [2, 5, 9, 13, 17, 21, 24, 28, 31, 35, 38] };
const MESSAGED = { generic: [] as number[], target: [5, 13, 24, 35] };

function Crowd({ which }: { which: "generic" | "target" }) {
  const stop = STOPPED[which].length;
  const msg = MESSAGED[which].length;
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/[0.08] p-4">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-1.5" aria-hidden="true">
        {Array.from({ length: CROWD }, (_, i) => {
          const m = MESSAGED[which].includes(i);
          const s = STOPPED[which].includes(i);
          return (
            <motion.span
              key={`${which}-${i}`}
              initial={{ opacity: 0, scaleY: 0.4 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ ...ease, delay: 0.15 + i * 0.025 }}
              className={`h-6 rounded-full ${m ? "bg-vz-blue-light" : s ? "bg-emerald-300" : "bg-white/15"}`}
            />
          );
        })}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...ease, delay: 1.3 }} className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="text-[15px] text-white/60">من أصل 40 شخص مروا على الإعلان:</span>
        <span className="text-[17px] font-black text-emerald-200">وكف {stop}</span>
        <span className="text-[17px] font-black text-white">راسل {msg}</span>
      </motion.div>
    </div>
  );
}

function Passers({ which }: { which: "generic" | "target" }) {
  return (
    <ul className="space-y-2">
      {PASSERS[which].map((p, i) => (
        <motion.li
          key={`${which}-${p.name}`}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...ease, delay: 0.2 + i * 0.28 }}
          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 border ${p.act === "pass" ? "bg-white/[0.02] border-white/[0.05]" : "bg-white/[0.06] border-white/12"}`}
        >
          <Avatar name={p.name} />
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] font-black text-white leading-tight">{p.name}، <span className="font-bold text-white/55">{p.role}</span></span>
            <span className={`block text-[13px] leading-snug mt-0.5 ${p.act === "pass" ? "text-white/40" : "text-white/75"}`}>{p.note}</span>
          </span>
          <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-[12px] font-black ${ACT_STYLE[p.act].cls}`}>{ACT_STYLE[p.act].label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

const TARGET_CAPTION = (
  <>
    موظف وسيارتك تبقى بالشمس من 8 لـ 2؟ المظلة تنفتح بثانية وتنطوي بالصندوك، والستيرن يبقى تكدر تمسكه عادي.{" "}
    <span className="font-bold text-white">تفحصها كدام المندوب قبل لا تدفع.</span>
  </>
);

export function FeedTest({ shown = 1 }: { shown?: number }) {
  const which = shown >= 2 ? "target" : "generic";
  if (shown >= 3) {
    return (
      <div className="space-y-4">
        <FeedPost
          page="مظلات بغداد"
          creative={<PostImage src={SUNSHADE_STRONG} alt={SUNSHADE_STRONG_ALT} marks={[{ n: 1, x: 17, y: 65 }, { n: 2, x: 28, y: 8.5 }, { n: 3, x: 46.5, y: 93 }]} />}
          caption={TARGET_CAPTION}
        />
        <ol className="space-y-2.5">
          {[
            ["اللقطة", "موقف يعرفه: سيارته واقفة بالشمس، والساعة 2 الظهر. شاف نفسه بالمشهد قبل لا يقرا أي شي."],
            ["الجملة", "استخدمنا كلمته هو: فرن. مو حرارة المقصورة ولا جودة عالية."],
            ["الطمأنة", "جاوبناه على الشي اللي مخليه يأجل الطلب بسطر واحد: يفحصها قبل لا يدفع."],
          ].map(([k, v], i) => (
            <motion.li key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 0.5 + i * 0.15 }} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white text-[#040e33] text-[15px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-[16px] sm:text-[18px] text-white/85 leading-[1.75]"><span className="font-black text-white">{k}: </span>{v}</p>
            </motion.li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["الإعلان العام", "وقف 1، راسل 0", "text-white/60"],
            ["إعلان الموظف", "وقف 11، راسل 4", "text-emerald-200"],
          ].map(([k, v, c]) => (
            <div key={k} className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5">
              <p className="text-[13px] font-bold text-white/50">{k}</p>
              <p className={`text-[17px] font-black ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-white/40">محاكاة توضيحية لـ 40 شخص، حتى تلاحظ الفرق بنفسك.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
      <motion.div key={which} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
        <p className="text-[14px] font-black text-white/55 mb-2">{which === "generic" ? "الإعلان الأول: يحچي ويا الكل" : "الإعلان الثاني: يحچي ويا شخص محدد"}</p>
        {which === "generic" ? (
          <FeedPost
            page="مظلات بغداد"
            creative={<PostImage src="/lesson/sunshade-generic.webp" alt="منشور مظلات بغداد: صورة المظلة على خلفية بيضاء، مظلة سيارة تناسب كل أنواع السيارات، جودة عالية وسعر مناسب، 25 ألف" />}
            caption="متوفرة بكل القياسات، للطلب راسلونا."
          />
        ) : (
          <FeedPost page="مظلات بغداد" creative={<PostImage src={SUNSHADE_STRONG} alt={SUNSHADE_STRONG_ALT} />} caption={TARGET_CAPTION} />
        )}
      </motion.div>
      <div className="space-y-3">
        <p className="text-[14px] font-black text-white/55">شنو كان رد فعل الناس</p>
        <Passers which={which} />
        <Crowd which={which} />
      </div>
    </div>
  );
}

const RINGS = [
  { label: "الشخص اللي تحچي وياه", people: [["حسين", "موظف ببغداد، يركن سيارته بالشمس من 8 لـ 2"]] },
  {
    label: "عندهم نفس المشكلة، ولهذا يحسون إن الكلام يحچي عنهم",
    people: [
      ["كرار", "سايق تكسي، سيارته تبقى بالشارع طول اليوم"],
      ["نور", "موظفة، تركن سيارتها بموقف الوزارة المكشوف"],
      ["علي", "مندوب مبيعات، يظل ينزل ويصعد من السيارة بنص الظهر"],
      ["أبو مريم", "أب يوصل جهاله من المدرسة الساعة 1"],
    ],
  },
  {
    label: "يشترون المنتج حتى يهدوه لغيرهم",
    people: [
      ["أم حسين", "شافت الإعلان وطلبته لابنها"],
      ["زميل حسين", "شاف تعليقها وطلب وحدة إله"],
    ],
  },
  { label: "مو زبونك، وهذا شي طبيعي", people: [["مصطفى", "طالب، ما عنده سيارة"]] },
];

function Ring({ level, shown, children }: { level: number; shown: number; children?: React.ReactNode }) {
  const ring = RINGS[level];
  const visible = level === 0 || shown > level || (level === RINGS.length - 1 && shown >= RINGS.length - 1);
  const outer = level === RINGS.length - 1;
  const border = ["border-vz-blue-light/70", "border-vz-blue-light/40", "border-white/20", "border-white/12 border-dashed"][level];
  const fill = ["bg-vz-blue/25", "bg-vz-blue/[0.1]", "bg-white/[0.03]", "bg-transparent"][level];
  return (
    <div className={`rounded-[26px] border-2 ${border} ${fill} p-2.5 sm:p-3.5 transition-colors duration-500`}>
      {visible ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={ease} className={`mb-2.5 ${outer ? "opacity-60" : ""}`}>
          <p className={`text-[13px] font-black mb-2 ${level === 0 ? "text-white" : "text-vz-accent"}`}>{ring.label}</p>
          <div className="flex flex-wrap gap-2">
            {ring.people.map(([n, r], i) => (
              <motion.span
                key={n}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ease, delay: 0.1 + i * 0.12 }}
                className={`inline-flex items-center gap-2 rounded-2xl px-2.5 py-1.5 ${level === 0 ? "bg-white text-[#040e33]" : "bg-white/[0.07] text-white"}`}
              >
                <span className="text-[14px] font-black">{n}</span>
                <span className={`text-[12px] font-bold ${level === 0 ? "text-[#040e33]/70" : "text-white/60"}`}>{r}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="h-8" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

export function Ripple({ shown = 1 }: { shown?: number }) {
  const buyers = shown >= 3 ? 7 : shown >= 2 ? 5 : 1;
  return (
    <div>
      <Ring level={3} shown={shown}>
        <Ring level={2} shown={shown}>
          <Ring level={1} shown={shown}>
            <Ring level={0} shown={shown} />
          </Ring>
        </Ring>
      </Ring>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5">
          <p className="text-[13px] font-bold text-white/50">الإعلان يحچي ويا</p>
          <p className="text-[22px] font-black text-white">شخص واحد</p>
        </div>
        <div className="rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-3.5">
          <p className="text-[13px] font-bold text-white/50">الناس المحتمل يشترون</p>
          <motion.p key={buyers} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[22px] font-black text-emerald-200">
            {buyers}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

const SLOTS = [
  {
    q: "منو هو؟",
    lead: "زبوني هو",
    options: [
      { t: "أي شخص عنده سيارة", ok: false, why: "هذا يشمل الكل. ما تكدر تكتب جملة وحدة توصل لكل شخص عنده سيارة." },
      { t: "موظف ببغداد يركن سيارته بالشمس من 8 لـ 2", ok: true, why: "تكدر تتصوره: وين يشتغل، وين يركن سيارته، وشوكت يرجعلها ويلكاها حارة." },
      { t: "رجال أعمارهم من 25 لـ 45 سنة", ok: false, why: "هذا يحدد العمر والجنس، ويفيدك بالاستهداف، بس ما يوضحلك شلون يقضي يومه." },
    ],
  },
  {
    q: "شنو المشكلة بكلامه هو؟",
    lead: "مشكلته إنه",
    options: [
      { t: "يحتاج مظلة للسيارة", ok: false, why: "هذا اسم المنتج، مو المشكلة. محد يصحى الصبح ويحس إنه محتاج مظلة." },
      { t: "حرارة السيارة عالية", ok: false, why: "هذا وصفك إنت كبياع، هو ما يحچي بهالطريقة." },
      { t: "السيارة تصير فرن والستيرن ما ينلزم", ok: true, why: "هاي نفس الكلمات اللي يستخدمها، ومن يقراها يعرف إنك تحچي عن مشكلته." },
    ],
  },
  {
    q: "شنو يريد بالنتيجة؟",
    lead: "يريد",
    options: [
      { t: "يركب سيارته بنص الظهر بدون لا يحترك", ok: true, why: "هاي النتيجة اللي يتخيلها، وهي المشهد اللي لازم يشوفه بالفيديو." },
      { t: "مظلة جودتها عالية", ok: false, why: "هاي صفة بالمنتج، مو الشي اللي يتمناه الزبون." },
      { t: "سعر رخيص", ok: false, why: "السعر مهم، بس مو النتيجة اللي يحلم بيها. هو يريد سيارته ما تصير حارة." },
    ],
  },
  {
    q: "شنو الشي اللي يخاف منه؟",
    lead: "بس خايف",
    options: [
      { t: "ما عنده أي خوف، يريد يشتري", ok: false, why: "كل زبون يشتري أونلاين عنده مخاوف، وإذا ما جاوبت على مخاوفه ممكن يأجل الطلب وينساه." },
      { t: "يخاف من الإعلانات", ok: false, why: "مو خايف من الإعلان نفسه، خايف على فلوسه ومن المنتج اللي راح يشتريه." },
      { t: "تطلع نوعيتها تعبانة وتنكسر بعد شهر", ok: true, why: "هذا الخوف اللي يخليه يتردد، وتكدر تطمنه وتخليه يفحصها كدام المندوب." },
    ],
  },
];

export function SentenceBuilder() {
  const [slot, setSlot] = useState(0);
  const [wrong, setWrong] = useState<Record<string, boolean>>({});
  const [firstTry, setFirstTry] = useState(0);
  const [note, setNote] = useState<{ ok: boolean; why: string } | null>(null);
  const done = slot >= SLOTS.length;
  const pick = (o: (typeof SLOTS)[number]["options"][number]) => {
    if (o.ok) {
      const clean = !SLOTS[slot].options.some((x) => wrong[`${slot}-${x.t}`]);
      if (clean) setFirstTry((n) => n + 1);
      setNote({ ok: true, why: o.why });
      setTimeout(() => {
        setSlot((s) => s + 1);
        setNote(null);
      }, 1100);
    } else {
      setWrong((w) => ({ ...w, [`${slot}-${o.t}`]: true }));
      setNote({ ok: false, why: o.why });
    }
  };
  return (
    <div>
      <div className="glass-elevated rounded-3xl p-4 sm:p-6 space-y-2.5 min-h-[168px]">
        {SLOTS.map((s, i) => {
          const right = s.options.find((o) => o.ok)!;
          const filled = i < slot;
          const current = i === slot;
          return (
            <p key={s.q} className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 transition-opacity duration-300 ${filled || current ? "opacity-100" : "opacity-30"}`}>
              <span className="text-[16px] sm:text-[18px] font-bold text-white/55 shrink-0">{s.lead}</span>
              {filled ? (
                <motion.span initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={ease} className="px-2.5 py-0.5 rounded-xl bg-white text-[#040e33] text-[17px] sm:text-[20px] font-black leading-[1.6]">
                  {right.t}
                </motion.span>
              ) : (
                <span className={`inline-block min-w-[120px] h-8 rounded-xl border-2 border-dashed ${current ? "border-vz-blue-light/70 bg-vz-blue/15" : "border-white/15"}`} />
              )}
            </p>
          );
        })}
      </div>
      {!done ? (
        <div className="mt-5">
          <p className="text-[18px] sm:text-[21px] font-black text-white mb-3">
            {slot + 1} من 4: {SLOTS[slot].q}
          </p>
          <div className="grid gap-2.5">
            {SLOTS[slot].options.map((o) => {
              const isWrong = wrong[`${slot}-${o.t}`];
              const isRight = note?.ok && o.ok;
              return (
                <button
                  key={o.t}
                  type="button"
                  disabled={isWrong || !!note?.ok}
                  onClick={() => pick(o)}
                  className={`w-full text-right min-h-[52px] rounded-2xl px-4 py-3 border text-[16px] sm:text-[18px] font-bold leading-relaxed transition-colors duration-200 flex items-center justify-between gap-3 ${
                    isRight
                      ? "bg-emerald-400/15 border-emerald-300/60 text-white"
                      : isWrong
                        ? "bg-red-500/[0.07] border-red-400/30 text-white/45 line-through decoration-red-300/50"
                        : "bg-white/[0.05] border-white/12 text-white hover:bg-white/[0.09]"
                  }`}
                >
                  <span>{o.t}</span>
                  {isRight && <Check className="w-5 h-5 text-emerald-300 shrink-0" strokeWidth={3} />}
                  {isWrong && <X className="w-5 h-5 text-red-300 shrink-0" />}
                </button>
              );
            })}
          </div>
          {note && (
            <motion.p key={note.why} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className={`mt-3 text-[16px] font-bold leading-relaxed ${note.ok ? "text-emerald-200" : "text-red-200"}`}>
              {note.why}
            </motion.p>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-5 rounded-2xl bg-emerald-400/[0.08] border border-emerald-300/25 p-4">
          <p className="text-[18px] font-black text-emerald-200 mb-1">الجملة كاملة. جاوبت صح من أول مرة {firstTry} من 4.</p>
          <p className="text-[16px] text-white/75 leading-relaxed">هسه كل جزء من كلام الزبون راح يصير جزء من إعلانك. بالخطوة الجاية راح تشوف شلون.</p>
        </motion.div>
      )}
    </div>
  );
}

const MAP = [
  { part: "موظف ببغداد يركن سيارته بالشمس من 8 لـ 2", becomes: "أول لقطة", detail: "سيارة بموقف مكشوف، والساعة 2 الظهر. يشوف نفسه بالمشهد قبل لا يقرا أي كلمة." },
  { part: "السيارة تصير فرن والستيرن ما ينلزم", becomes: "أول جملة", detail: "سيارتك تصير فرن من تطلع من الدوام؟ نفس كلامه، بس بصيغة سؤال." },
  { part: "يركب سيارته بنص الظهر بدون لا يحترك", becomes: "اللقطة الثانية", detail: "يفتح المظلة بثانية، ومن يرجع من الدوام يمسك الستيرن بشكل طبيعي." },
  { part: "تطلع نوعيتها تعبانة وتنكسر بعد شهر", becomes: "آخر سطر", detail: "تفحصها كدام المندوب قبل لا تدفع. طمناه على مخاوفه قبل لا يسأل." },
];

export function SentenceToAd({ shown = 1 }: { shown?: number }) {
  const cur = Math.min(shown, MAP.length) - 1;
  const frame = (n: number, label: string) => (
    <div className={`rounded-xl p-2.5 text-center border transition-colors duration-300 ${cur === 2 && n >= 2 ? "bg-white text-[#040e33] border-white" : "bg-white/[0.05] border-white/10 text-white/70"}`}>
      <p className="text-[11px] font-black opacity-70">لقطة {n}</p>
      <p className="text-[13px] font-bold leading-snug">{label}</p>
    </div>
  );
  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {MAP.map((m, i) => (
          <li
            key={m.part}
            className={`rounded-2xl px-3.5 py-2.5 border transition-all duration-300 ${
              i === cur ? "bg-white/[0.09] border-white/30" : i < cur ? "bg-white/[0.03] border-white/[0.06] opacity-60" : "bg-transparent border-white/[0.05] opacity-30"
            }`}
          >
            <p className="text-[15px] sm:text-[16px] font-bold text-white leading-relaxed">
              <span className="font-black text-vz-accent">{i + 1}. </span>
              {m.part}
            </p>
            {i === cur && (
              <motion.p key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="text-[15px] text-white/75 leading-relaxed mt-1">
                <span className="font-black text-emerald-200">تصير {m.becomes}: </span>
                {m.detail}
              </motion.p>
            )}
          </li>
        ))}
      </ol>
      <FeedPost
        page="مظلات بغداد"
        creative={<PostImage src={SUNSHADE_STRONG} alt={SUNSHADE_STRONG_ALT} ring={cur === 0 ? ZONES.scene : cur === 1 ? ZONES.headline : cur === 3 ? ZONES.reassure : null} />}
        caption={
          <>
            <span className="grid grid-cols-3 gap-2 mb-3">
              {frame(1, "السيارة واقفة بالشمس")}
              {frame(2, "تنفتح بثانية")}
              {frame(3, "يمسك الستيرن")}
            </span>
            موظف وسيارتك تبقى بالشمس من 8 لـ 2؟ المظلة تنفتح بثانية وتنطوي بالصندوك.{" "}
            <span className={`font-bold rounded-md px-1 transition-colors duration-300 ${cur === 3 ? "bg-white text-[#040e33]" : "text-white"}`}>تفحصها كدام المندوب قبل لا تدفع.</span>
          </>
        }
      />
    </div>
  );
}

export function BeforeAfterPost({ shown = 1 }: { shown?: number }) {
  const after = shown >= 2;
  return (
    <div className="space-y-4">
      <div className="flex gap-2" aria-hidden="true">
        {["قبل", "بعد"].map((t, i) => (
          <span key={t} className={`px-4 py-1.5 rounded-xl text-[14px] font-black border transition-colors duration-300 ${(i === 1) === after ? "bg-white text-[#040e33] border-white" : "text-white/45 border-white/12"}`}>
            {t}
          </span>
        ))}
      </div>
      <motion.div key={after ? "a" : "b"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
        {after ? (
          <FeedPost
            page="رتبها"
            creative={<PostImage src="/lesson/organizer-strong.webp" alt="إعلان رتبها: نفس الجرار، نصه مرتب بالمنظم ونصه متروس، الساعة 7:20 و7:21، ومكتوب كل صبح تدورين على الروج؟" />}
            caption="إذا مكياجج متروس بالجرار وكل صبح تتعبين وإنت تدورين على الروج، هذا المنظم يخلي كلشي كدامج ومرتب بمكانه."
            comments={["والله هذا آني، كل صبح أعاني من هاي السالفة", "يجي باللون الأبيض؟ ويوصل للنجف؟", "شوفي، هذا بالضبط اللي حكيتلج عنه"]}
          />
        ) : (
          <FeedPost
            page="رتبها"
            creative={<PostImage src="/lesson/organizer-generic.webp" alt="منشور رتبها: صورة المنظم على خلفية بيضاء، منظم مكياج أنيق يناسب كل بيت، السعر بالخاص" />}
            caption="منظم مكياج أنيق يناسب كل بيت. متوفر بأكثر من لون، والسعر بالخاص."
            comments={["بيش؟", "السعر"]}
          />
        )}
      </motion.div>
      <p className="text-[16px] sm:text-[17px] text-white/75 leading-relaxed">
        {after
          ? "هسه الناس بدت تحچي عن نفسها وتكول: هذا آني. وأسئلتهم صارت عن اللون والتوصيل، يعني بدوا يفكرون يشترون."
          : "التعليقات كلها تسأل عن السعر وبس. محد حچى عن نفسه، لأن المنشور ما كان موجه لشخص معين."}
      </p>
    </div>
  );
}

const THREE = [
  { id: "emp", who: "الموظف", day: "يركن سيارته بالشمس من 8 لـ 2", line: "سيارتك تصير فرن من تطلع من الدوام؟", where: "ببغداد، بوقت الدوام وبعده" },
  { id: "mom", who: "الأم", day: "توصل جهالها من المدرسة بنص الظهر", line: "ابنج يصعد للسيارة ويحترك من الكرسي؟", where: "قبل الدوام المدرسي وبعده" },
  { id: "taxi", who: "سايق التكسي", day: "سيارته بالشارع طول اليوم", line: "الراكب يصعد ويكلك شغل المبردة على أعلى شي؟", where: "بأوقات الزحمة، بكل المحافظات" },
];

const toWho = (w: string) => (w.startsWith("ال") ? `لل${w.slice(2)}` : `ل${w}`);

export function ThreeCustomers() {
  const [pick, setPick] = useState<string | null>(null);
  const chosen = THREE.find((t) => t.id === pick);
  const rest = THREE.filter((t) => t.id !== pick);
  return (
    <div>
      <div className="grid gap-3">
        {THREE.map((t) => {
          const on = pick === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setPick(t.id)}
              className={`w-full text-right rounded-3xl p-4 sm:p-5 border transition-colors duration-200 ${
                on ? "bg-vz-blue/25 border-vz-blue-light/70" : pick ? "bg-white/[0.03] border-white/[0.07] opacity-70" : "bg-white/[0.05] border-white/12 hover:bg-white/[0.08]"
              }`}
            >
              <span className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-[18px] sm:text-[20px] font-black text-white">{t.who}</span>
                <span className="text-[13px] font-bold text-white/50">{t.day}</span>
              </span>
              <span className="block text-[16px] sm:text-[18px] font-bold text-white/90 leading-relaxed">{t.line}</span>
              <span className="block text-[13px] text-white/45 mt-1">يظهر: {t.where}</span>
            </button>
          );
        })}
      </div>
      {chosen ? (
        <motion.div key={chosen.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] p-4 space-y-2">
          <p className="text-[16px] text-white/85 leading-relaxed"><span className="font-black text-emerald-200">الإعلان الأول: </span>{chosen.who}، وكل الكلام إله.</p>
          <p className="text-[16px] text-white/70 leading-relaxed"><span className="font-black text-white">بعد ما يمر عليه: </span>إعلان ثاني {toWho(rest[0].who)}، وثالث {toWho(rest[1].who)}. نفس المظلة، بس كل إعلان بجملته.</p>
          <p className="text-[14px] text-white/45 leading-relaxed">ماكو اختيار غلط هنا. الغلط الوحيد إنك تحاول تحچي ويا الثلاثة بإعلان واحد.</p>
        </motion.div>
      ) : (
        <p className="mt-4 text-[15px] text-white/55">اختار شخص واحد وتبدي بيه.</p>
      )}
    </div>
  );
}

const COMMENTS = [
  { t: "بيش؟", tag: null, why: "سؤال عن السعر، ما يكشفلك أي شي عن مشكلته." },
  { t: "آني موظفة وسيارتي من الصبح للظهر تبقى بالشمس، من أصعد ما أكدر أمسك الستيرن", tag: "مشكلة", take: "أصعد وما أكدر أمسك الستيرن" },
  { t: "تتحمل شمس البصرة لو تذوب؟", tag: "خوف", take: "تتحمل لو تذوب؟" },
  { t: "شوف هاي حيدر", tag: null, why: "منشن لصديق. يفرحه، بس ما يفيدك تعرف أي شي عن الزبون." },
  { t: "اشتريت وحدة قبل من بيج ثاني وانكسرت بالشهر الثاني", tag: "خوف", take: "انكسرت بالشهر الثاني" },
  { t: "تنفع لسيارة توسان؟", tag: "سؤال", take: "تنفع لسيارتي؟" },
  { t: "الله يرزقكم", tag: null, why: "دعوة حلوة، بس ما تكشفلك أي شي عن الزبون." },
  { t: "الجهال يحترقون من حزام الأمان بالصيف", tag: "مشكلة", take: "الجهال يحترقون من الحزام" },
];
const NEED = COMMENTS.filter((c) => c.tag).length;

export function CommentsMine() {
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const tap = (c: (typeof COMMENTS)[number]) => {
    if (!c.tag) {
      setMiss(c.why ?? null);
      return;
    }
    setMiss(null);
    setFound((f) => (f.includes(c.t) ? f : [...f, c.t]));
  };
  const done = found.length >= NEED;
  return (
    <div>
      <p className="text-[15px] sm:text-[16px] text-white/70 leading-relaxed mb-3">هاي تعليقات على إعلان منافس يبيع نفس المظلة. اضغط على كل تعليق حتى تعرف شنو يكشفلك عن مشكلة الزبون أو خوفه أو السؤال اللي يخليه يأجل الطلب.</p>
      <div className="rounded-3xl bg-[#0a1640] border border-white/10 p-3 sm:p-4 space-y-2">
        {COMMENTS.map((c, i) => {
          const got = found.includes(c.t);
          return (
            <button
              key={c.t}
              type="button"
              onClick={() => tap(c)}
              disabled={got}
              className={`w-full flex items-start gap-2.5 text-right rounded-2xl px-2 py-1.5 transition-colors duration-200 ${got ? "" : "hover:bg-white/[0.04]"}`}
            >
              <Avatar name={["زينب", "رسل", "حيدر", "مرتضى", "سجاد", "أمير", "هدى", "أم علي"][i]} />
              <span className={`flex-1 rounded-2xl px-3 py-2 text-[15px] leading-relaxed border transition-colors duration-200 ${got ? "bg-emerald-400/12 border-emerald-300/40 text-white" : "bg-white/[0.06] border-transparent text-white/85"}`}>
                {c.t}
              </span>
            </button>
          );
        })}
      </div>
      {miss && (
        <motion.p key={miss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[15px] font-bold text-amber-100/90">
          {miss}
        </motion.p>
      )}
      <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] p-4">
        <p className="text-[14px] font-black text-white/60 mb-2.5 flex items-center gap-2">
          <Bookmark className="w-4 h-4" /> دفتر كلام الزبون، {found.length} من {NEED}
        </p>
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {found.map((t) => {
            const c = COMMENTS.find((x) => x.t === t)!;
            return (
              <motion.span key={t} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={ease} className="inline-flex items-center gap-2 rounded-xl bg-white text-[#040e33] px-2.5 py-1">
                <span className="text-[11px] font-black rounded-md bg-[#040e33]/10 px-1.5 py-0.5">{c.tag}</span>
                <span className="text-[14px] font-black">{c.take}</span>
              </motion.span>
            );
          })}
        </div>
        {done && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease} className="mt-3 text-[15px] text-emerald-200 font-bold leading-relaxed">
            هاي جمل تكدر تستخدمها بإعلانك، ومكتوبة بنفس كلام الزبون. وانتبه: تعليق الجهال يفتحلك فئة ثانية من الزباين، وهي الأمهات.
          </motion.p>
        )}
      </div>
    </div>
  );
}

export const AUDIENCE_VISUALS: Record<string, { render: (shown: number) => React.ReactNode; steps?: number }> = {
  "feed-test": { render: (s) => <FeedTest shown={s} />, steps: 3 },
  ripple: { render: (s) => <Ripple shown={s} />, steps: 3 },
  "sentence-builder": { render: () => <SentenceBuilder /> },
  "sentence-to-ad": { render: (s) => <SentenceToAd shown={s} />, steps: 4 },
  "before-after-post": { render: (s) => <BeforeAfterPost shown={s} />, steps: 2 },
  "three-customers": { render: () => <ThreeCustomers /> },
  "comments-mine": { render: () => <CommentsMine /> },
};
