export const FULL_PRICE = 99000;
export const OFFER_PRICE = 49000;
export const OFFER_LAST_DAY = "30 أكتوبر";
export const OFFER_ENDS_AT = new Date("2026-10-31T00:00:00+03:00");

export const STUDENT_COUNT = 266;

export const WHATSAPP_NUMBER = "9647757851379";
export const WHATSAPP_DISPLAY = "07757851379";

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
  daysLeft: number;
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

export const thousands = (iqd: number) => `${Math.round(iqd / 1000)} ألف`;

export function deadlineLabel(state: OfferState): string {
  if (!state.active) return "";
  if (state.daysLeft <= 1) return state.hoursLeft <= 1 ? "آخر ساعة من العرض" : `آخر يوم، باقي ${state.hoursLeft} ساعة`;
  if (state.daysLeft === 2) return "باقي يومين";
  if (state.daysLeft <= 10) return `باقي ${state.daysLeft} أيام`;
  return `باقي ${state.daysLeft} يوم`;
}

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
