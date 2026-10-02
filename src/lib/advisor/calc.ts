/**
 * Unit economics for one Iraqi COD order, computed in code so the advisor's
 * numbers are exact (the model proposes inputs in a ```calc block, the UI
 * computes and lets the merchant tweak them live).
 *
 * Model (per delivered order):
 *   returns per delivered order   = r / (1 − r)
 *   each return wastes             = delivery fee + the ad cost that won it
 *   net profit                     = price − product − delivery − CPA − returnShare
 *   break-even CPA                 = (1 − r)(price − product) − delivery
 * which matches the course formula (صافي الربح = السعر − الكلفة − الإعلان − التوصيل − مخصص الراجع).
 */

export interface CalcInput {
  price: number;
  productCost: number;
  delivery: number;
  /** Ad cost per confirmed order, IQD. Derived from cost per message when absent. */
  cpa?: number;
  /** USD per message. */
  costPerMessage?: number;
  /** % of messages that become confirmed orders. */
  closeRate?: number;
  /** % of shipped orders that come back. */
  returnRate: number;
  usdRate: number;
  ordersPerDay?: number;
}

export interface CalcResult {
  cpa: number;
  returnShare: number;
  net: number;
  marginPct: number;
  breakEvenCpa: number;
  /** Highest cost per message (USD) that still breaks even, if close rate is known. */
  breakEvenCostPerMessage?: number;
  /** Lowest close rate (%) that breaks even at the current cost per message. */
  breakEvenCloseRate?: number;
  monthlyNet?: number;
  verdict: "profit" | "thin" | "loss";
}

export const DEFAULT_USD_RATE = 1500;

const num = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[,،\s$%]/g, "")) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Reads a ```calc JSON block from the model; tolerant of extra keys and strings. */
export function parseCalcBlock(raw: string): CalcInput | null {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw.trim());
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const price = num(obj.price);
  if (!price) return null;
  return {
    price,
    productCost: num(obj.productCost) ?? 0,
    delivery: num(obj.delivery ?? obj.deliveryCost) ?? 5000,
    cpa: num(obj.cpa),
    costPerMessage: num(obj.costPerMessage),
    closeRate: num(obj.closeRate),
    returnRate: Math.min(90, num(obj.returnRate) ?? 10),
    usdRate: num(obj.usdRate) ?? DEFAULT_USD_RATE,
    ordersPerDay: num(obj.ordersPerDay),
  };
}

export function computeUnitEconomics(input: CalcInput): CalcResult {
  const r = Math.min(0.9, Math.max(0, input.returnRate / 100));
  const closeRate = input.closeRate && input.closeRate > 0 ? input.closeRate / 100 : undefined;
  const cpa =
    input.cpa !== undefined && input.cpa > 0
      ? input.cpa
      : input.costPerMessage !== undefined && closeRate
        ? (input.costPerMessage * input.usdRate) / closeRate
        : 0;
  const returnShare = (r / (1 - r)) * (input.delivery + cpa);
  const net = input.price - input.productCost - input.delivery - cpa - returnShare;
  const breakEvenCpa = (1 - r) * (input.price - input.productCost) - input.delivery;
  const marginPct = input.price > 0 ? (net / input.price) * 100 : 0;
  const breakEvenCostPerMessage = closeRate && breakEvenCpa > 0 ? (breakEvenCpa * closeRate) / input.usdRate : undefined;
  const breakEvenCloseRate =
    input.costPerMessage !== undefined && input.costPerMessage > 0 && breakEvenCpa > 0 ? ((input.costPerMessage * input.usdRate) / breakEvenCpa) * 100 : undefined;
  const monthlyNet = input.ordersPerDay ? net * input.ordersPerDay * 30 : undefined;
  const verdict: CalcResult["verdict"] = net <= 0 ? "loss" : marginPct < 12 ? "thin" : "profit";
  return { cpa, returnShare, net, marginPct, breakEvenCpa, breakEvenCostPerMessage, breakEvenCloseRate, monthlyNet, verdict };
}

/** "12,600 د.ع"; negatives keep the sign attached to the number in RTL text. */
export const formatIqd = (n: number) => `${n < 0 ? "\u2066−" : "\u2066"}${Math.round(Math.abs(n)).toLocaleString("en-US")}\u2069 د.ع`;
