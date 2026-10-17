import { describe, expect, it } from "vitest";
import { TRIAL_DEFAULTS, TRIAL_PROBLEMS, diagnose } from "./trial";
import { FULL_PRICE, OFFER_PRICE, deadlineLabel, offerState, subscribeMessage, whatsappLink } from "./offer";
import { playbooksList } from "../data/playbooksData";

describe("trial diagnosis", () => {
  it("uses the playbooks' per-order model", () => {
    const d = diagnose(TRIAL_DEFAULTS);
    // (1 − 20%) × (35,000 − 12,000) − 5,000 − 1,500 ÷ 10%
    expect(d.real).toBeCloseTo(0.8 * 23000 - 5000 - 15000);
    expect(d.thinks).toBe(23000);
    expect(d.cpa).toBe(15000);
  });

  it("'better' doubles orders per 10 (max 5) and caps returns at 10%", () => {
    const d = diagnose(TRIAL_DEFAULTS);
    expect(d.betterCloseOf10).toBe(2);
    expect(d.betterReturnPct).toBe(10);
    expect(d.better).toBeCloseTo(0.9 * 23000 - 5000 - 7500);
    const top = diagnose({ ...TRIAL_DEFAULTS, closeOf10: 5, returnPct: 0 });
    expect(top.better).toBeCloseTo(top.real);
  });

  it("every problem opens a real playbook", () => {
    const ids = new Set(playbooksList.map((p) => p.id));
    for (const p of TRIAL_PROBLEMS) expect(ids.has(p.id)).toBe(true);
  });
});

describe("offer", () => {
  it("is 49k until the end of 30 October (Baghdad), then 99k", () => {
    const during = offerState(new Date("2026-10-30T23:30:00+03:00"));
    expect(during).toMatchObject({ active: true, price: OFFER_PRICE, daysLeft: 1 });
    expect(deadlineLabel(during)).toBe("آخر ساعة من العرض");
    expect(offerState(new Date("2026-10-31T00:00:00+03:00"))).toMatchObject({ active: false, price: FULL_PRICE });
    expect(deadlineLabel(offerState(new Date("2026-10-17T12:00:00+03:00")))).toBe("باقي 14 يوم");
  });

  it("prefills the WhatsApp message", () => {
    const msg = subscribeMessage(["أبيع: عطور"], new Date("2026-10-20T12:00:00+03:00"));
    expect(msg).toContain("أبيع: عطور");
    expect(msg).toContain("49 ألف");
    expect(whatsappLink(msg)).toMatch(/^https:\/\/wa\.me\/9647757851379\?text=/);
  });
});
