/**
 * The one paid plan and its launch discount. Every price on the site reads
 * from here, so changing the price or the deadline is a one-line edit.
 */

export const FULL_PRICE = 99000;
export const OFFER_PRICE = 49000;
/** Last day of the discount, shown to members. */
export const OFFER_LAST_DAY = "30 أكتوبر";
/** The discount ends at midnight Baghdad time (UTC+3) after the last day. */
export const OFFER_ENDS_AT = new Date("2026-10-31T00:00:00+03:00");

/** Paying members so far; shown as social proof. Update it as it grows. */
export const STUDENT_COUNT = 266;

export const WHATSAPP_NUMBER = "9647757851379";
export const WHATSAPP_DISPLAY = "07757851379";

/** What the 49k plan opens, in the order members care about. */
export const PLAN_INCLUDES = [
  "الكورس كامل: 11 فصل بالترتيب، من اختيار المنتج لحد تكبير الشغل",
  "كل الحلول: خطوات، رسائل جاهزة تنسخها، وخطة 7 أيام لكل مشكلة",
  "الدليل العراقي كامل: الدفع، التوصيل، الكمرك، المواسم والقانون",
  "13 أداة وحاسبة بالدينار العراقي",
  "مستشار فيزيون الذكي: تكتبله مشكلتك ويجاوبك على أرقام مشروعك",
  "متابعة مباشرة ومراجعة إعلاناتك",
];

export interface OfferState {
  active: boolean;
  price: number;
  /** Whole days left, counting today (1 on the last day). 0 once ended. */
  daysLeft: number;
  /** Hours left; only meaningful on the last day. */
  hoursLeft: number;
}

export function offerState(now: Date = new Date()): OfferState {
  const ms = OFFER_ENDS_AT.getTime() - now.getTime();
  if (ms <= 0) return { active: false, price: FULL_PRICE, daysLeft: 0, hoursLeft: 0 };
  return {
    active: true,
    price: OFFER_PRICE,
    daysLeft: Math.ceil(ms / 86_400_000),
    hoursLeft: Math.ceil(ms / 3_600_000),
  };
}

/** "49 ألف" / "99 ألف" */
export const thousands = (iqd: number) => `${Math.round(iqd / 1000)} ألف`;

/** One line for the deadline: "باقي 3 أيام" / "آخر يوم! باقي 5 ساعات". */
export function deadlineLabel(state: OfferState): string {
  if (!state.active) return "";
  if (state.daysLeft <= 1) return state.hoursLeft <= 1 ? "آخر ساعة من العرض" : `آخر يوم! باقي ${state.hoursLeft} ساعة`;
  if (state.daysLeft === 2) return "باقي يومين";
  if (state.daysLeft <= 10) return `باقي ${state.daysLeft} أيام`;
  return `باقي ${state.daysLeft} يوم`;
}

/** The message a member sends to subscribe, prefilled in WhatsApp. */
export function subscribeMessage(extraLines: string[] = [], now: Date = new Date()): string {
  const state = offerState(now);
  const priceLine = state.active
    ? `أريد أشترك بالكورس الكامل بـ ${thousands(state.price)} (عرض لحد ${OFFER_LAST_DAY}).`
    : `أريد أشترك بالكورس الكامل بـ ${thousands(state.price)}.`;
  return ["هلا، جربت كورس viZion المجاني.", ...extraLines, priceLine].join("\n");
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
