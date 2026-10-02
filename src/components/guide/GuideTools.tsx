import React, { useId, useMemo, useState } from "react";
import { CalendarDays, Calculator, Truck } from "lucide-react";
import { seasonEvents, type GuideTool, type SeasonEvent } from "../../data/iraqGuideData";

const fmt = (n: number) => `⁦${Math.round(n).toLocaleString("en-US")}⁩`;

function Field({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (n: number) => void; suffix: string; step?: number }) {
  const id = useId();
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-bold text-white/65">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="vz-field w-full rounded-xl pl-14 pr-3 py-2.5 text-sm text-white font-mono text-left min-h-[44px] focus-visible:ring-2 focus-visible:ring-white/60"
          dir="ltr"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/45 pointer-events-none">{suffix}</span>
      </span>
    </label>
  );
}

function Result({ label, value, tone = "plain", hint }: { label: string; value: string; tone?: "good" | "bad" | "plain"; hint?: string }) {
  const color = tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-red-300" : "text-white";
  return (
    <div className="glass-subtle rounded-2xl p-4 space-y-1">
      <p className="text-xs text-white/55 font-bold">{label}</p>
      <p className={`text-lg sm:text-xl font-black font-mono ${color}`}>{value}</p>
      {hint && <p className="text-[11px] text-white/45 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Shell({ icon: Icon, title, children, note }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="glass-elevated glass-edge rounded-3xl p-5 sm:p-7 space-y-5">
      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
        <Icon className="w-5 h-5 text-vz-accent" />
        {title}
      </h3>
      {children}
      {note && <p className="text-[11px] text-white/40 leading-relaxed">{note}</p>}
    </div>
  );
}

/** Landed cost per unit for an import, in dinars at the member's real dollar rate. */
function LandedCost() {
  const [unitPrice, setUnitPrice] = useState(4);
  const [units, setUnits] = useState(200);
  const [freight, setFreight] = useState(350);
  const [customsPct, setCustomsPct] = useState(20);
  const [fees, setFees] = useState(150);
  const [rate, setRate] = useState(1490);

  const goods = unitPrice * units;
  const customs = (goods + freight) * (customsPct / 100);
  const totalUsd = goods + freight + customs + fees;
  const perUnitIqd = units > 0 ? (totalUsd / units) * rate : 0;
  const markup = goods > 0 ? ((totalUsd - goods) / goods) * 100 : 0;

  return (
    <Shell icon={Calculator} title="احسب: كلفة القطعة الواصلة لمخزنك" note="الكمرك هنا محسوب تقريباً على قيمة البضاعة والشحن. النسبة والرسوم الدقيقة يحددها المخلص الكمركي حسب البند.">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="سعر القطعة من المورد" value={unitPrice} onChange={setUnitPrice} suffix="$" step={0.1} />
        <Field label="عدد القطع" value={units} onChange={setUnits} suffix="قطعة" step={10} />
        <Field label="الشحن الكلي" value={freight} onChange={setFreight} suffix="$" step={10} />
        <Field label="نسبة الكمرك" value={customsPct} onChange={setCustomsPct} suffix="%" />
        <Field label="تخليص ونقل ورسوم ثانية" value={fees} onChange={setFees} suffix="$" step={10} />
        <Field label="سعر الدولار اللي تدفع بيه" value={rate} onChange={setRate} suffix="د.ع" step={10} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Result label="كلفة القطعة الواصلة" value={`${fmt(perUnitIqd)} د.ع`} tone="bad" hint="هذا رقمك الحقيقي، مو سعر المورد" />
        <Result label="الزيادة فوك سعر البضاعة" value={`+${Math.round(markup)}%`} hint="شحن + كمرك + رسوم" />
        <Result label="سعر بيع مبدئي (× 3)" value={`${fmt(perUnitIqd * 3)} د.ع`} tone="good" hint="بالدفع عند الاستلام والإعلان، أقل من ×2.5 صعب يربح" />
      </div>
    </Shell>
  );
}

/** What delivery really costs per delivered order, and how much cash sits with the courier. */
function DeliveryCost() {
  const [orders, setOrders] = useState(400);
  const [aov, setAov] = useState(30000);
  const [fee, setFee] = useState(5000);
  const [codPct, setCodPct] = useState(1.5);
  const [refusalPct, setRefusalPct] = useState(20);
  const [refusedFeePct, setRefusedFeePct] = useState(75);
  const [remitDays, setRemitDays] = useState(7);

  const refused = orders * (refusalPct / 100);
  const delivered = orders - refused;
  const deliveryFees = delivered * fee;
  const codFees = delivered * aov * (codPct / 100);
  const refusedFees = refused * fee * (refusedFeePct / 100);
  const monthly = deliveryFees + codFees + refusedFees;
  const perDelivered = delivered > 0 ? monthly / delivered : 0;
  const cashStuck = (delivered / 30) * aov * remitDays;

  return (
    <Shell icon={Truck} title="احسب: كلفة التوصيل الحقيقية وفلوسك العالقة" note="الأرقام الافتراضية من نطاقات 2026 الشائعة. غيّرها لأرقام شركتك.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="طلبات تطلع بالشهر" value={orders} onChange={setOrders} suffix="طلب" step={10} />
        <Field label="متوسط قيمة الطلب" value={aov} onChange={setAov} suffix="د.ع" step={1000} />
        <Field label="كروة التوصيل" value={fee} onChange={setFee} suffix="د.ع" step={500} />
        <Field label="عمولة استلام الكاش" value={codPct} onChange={setCodPct} suffix="%" step={0.5} />
        <Field label="نسبة الرفض" value={refusalPct} onChange={setRefusalPct} suffix="%" />
        <Field label="تدفع على المرفوض (% من الكروة)" value={refusedFeePct} onChange={setRefusedFeePct} suffix="%" step={5} />
        <Field label="كل كم يوم يسلمونك" value={remitDays} onChange={setRemitDays} suffix="يوم" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Result label="كلفة التوصيل بالشهر" value={`${fmt(monthly)} د.ع`} hint="كروة + عمولة كاش + مرفوض" />
        <Result label="الكلفة الحقيقية لكل طلب واصل" value={`${fmt(perDelivered)} د.ع`} tone="bad" hint={`مو ${fmt(fee)} مثل ما تتوقع`} />
        <Result label="فلوسك العالقة عند الشركة" value={`${fmt(cashStuck)} د.ع`} hint="فلوس انباعت بس ما وصلتك بعد" />
      </div>
    </Shell>
  );
}

const KIND_STYLE: Record<SeasonEvent["kind"], { label: string; cls: string }> = {
  sales: { label: "موسم بيع", cls: "bg-emerald-400/15 border-emerald-400/30 text-emerald-200" },
  respect: { label: "احترام المناسبة", cls: "bg-white/[0.07] border-white/15 text-white/80" },
  holiday: { label: "عطلة رسمية", cls: "bg-amber-300/10 border-amber-300/25 text-amber-100" },
  weather: { label: "موسم طقس", cls: "bg-sky-400/10 border-sky-300/25 text-sky-100" },
};

const DAY_MS = 86_400_000;

export function upcomingSeasons(now: Date = new Date(), count = 6): (SeasonEvent & { days: number })[] {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return seasonEvents
    .map((e) => ({ ...e, days: Math.round((Date.parse(`${e.date}T00:00:00Z`) - today) / DAY_MS) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, count);
}

const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("ar-IQ-u-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The next seasons from today, with days left and what to prepare. */
function SeasonCalendar() {
  const [showAll, setShowAll] = useState(false);
  const events = useMemo(() => upcomingSeasons(new Date(), showAll ? 50 : 6), [showAll]);
  return (
    <Shell icon={CalendarDays} title="المواسم الجاية من اليوم" note="التواريخ الهجرية متوقعة وممكن تتغير يوم أو يومين حسب رؤية الهلال.">
      <ol className="space-y-2.5">
        {events.map((e) => {
          const style = KIND_STYLE[e.kind];
          return (
            <li key={`${e.date}-${e.title}`} className="glass-subtle rounded-2xl p-4 flex items-start gap-4">
              <div className="w-16 shrink-0 text-center">
                <p className="text-xl sm:text-2xl font-black text-white font-mono leading-none">{e.days}</p>
                <p className="text-[10px] text-white/50 mt-1">{e.days === 1 ? "يوم" : "يوم باقي"}</p>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-white">{e.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.cls}`}>{style.label}</span>
                </div>
                <p className="text-[11px] text-white/45">{e.approx ? "تقريباً " : ""}{dateLabel(e.date)}</p>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{e.prepare}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {!showAll && (
        <button onClick={() => setShowAll(true)} className="btn btn-glass w-full min-h-[44px] rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
          عرض كل المواسم
        </button>
      )}
    </Shell>
  );
}

export function GuideToolView({ tool }: { tool: GuideTool }) {
  if (tool === "landed-cost") return <LandedCost />;
  if (tool === "delivery-cost") return <DeliveryCost />;
  return <SeasonCalendar />;
}
