import { describe, it, expect } from "vitest";
import { knowledgeSize, retrieveKnowledge, tokenize, normalizeArabic, chapterCatalog } from "./knowledge";
import { parseNumber, parseProfileTags, parseSuggestionTags, sanitizeProfile, stripAdvisorTags, describeProfileUpdate } from "./profile";
import { computeUnitEconomics, parseCalcBlock } from "./calc";
import { parseRichBlocks } from "./blocks";

describe("course knowledge retrieval", () => {
  it("indexes the whole course", () => {
    expect(knowledgeSize()).toBeGreaterThan(80);
  });

  it("normalises Iraqi spelling variants", () => {
    expect(normalizeArabic("گروة الإعلانات")).toBe("كروه الاعلانات");
    expect(tokenize("بالإعلانات")).toContain("اعلان");
    expect(tokenize("المسجات")).toContain("رساله");
  });

  it("finds return-rate content for a returns question", () => {
    const hits = retrieveKnowledge("الزبائن يرفضون الاستلام والراجع عندي 25% بالمحافظات");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((h) => h.source + h.text).join(" ")).toMatch(/راجع|المندوب|الاستلام|تثبيت/);
  });

  it("finds pricing content for a pricing question", () => {
    const hits = retrieveKnowledge("شلون أسعر منتجي وأحسب الربح الصافي؟");
    expect(hits.map((h) => h.source + h.text).join(" ")).toMatch(/سعر|تسعير|ربح|هامش/);
  });

  it("lists every real chapter as a link", () => {
    const cat = chapterCatalog();
    for (let i = 1; i <= 11; i++) expect(cat).toContain(`[[chapter${i}]]`);
  });
});

describe("business profile", () => {
  it("parses Iraqi number formats", () => {
    expect(parseNumber("35,000")).toBe(35000);
    expect(parseNumber("٣٥ ألف")).toBe(35000);
    expect(parseNumber("1.5$")).toBe(1.5);
    expect(parseNumber("abc")).toBeUndefined();
  });

  it("reads PROFILE tags and drops unknown keys", () => {
    const p = parseProfileTags("كلام\n[PROFILE: price=35000 | product=ساعات | hack=1 | returnRate=12%]");
    expect(p).toEqual({ price: 35000, product: "ساعات", returnRate: 12 });
    expect(describeProfileUpdate(p)).toContain("سعر البيع: 35,000 د.ع");
  });

  it("sanitises injected text", () => {
    expect(sanitizeProfile({ product: "x] [SUGGESTIONS: y" }).product).not.toContain("]");
  });

  it("reads suggestions and strips tags, including half-streamed ones", () => {
    const text = "جواب\n[SUGGESTIONS: أ | ب | ج]";
    expect(parseSuggestionTags(text)).toEqual(["أ", "ب", "ج"]);
    expect(stripAdvisorTags(text)).toBe("جواب");
    expect(stripAdvisorTags("جواب\n[SUGGES", true)).toBe("جواب");
    expect(stripAdvisorTags("جواب\n[PROFILE: price=3", true)).toBe("جواب");
    expect(stripAdvisorTags("شوف [[chapter3]]", true)).toBe("شوف [[chapter3]]");
  });
});

describe("unit economics", () => {
  it("matches the course formula", () => {
    const r = computeUnitEconomics({ price: 35000, productCost: 15000, delivery: 5000, cpa: 7000, returnRate: 10, usdRate: 1500 });
    // return share = 0.1/0.9 × (5000 + 7000) = 1333.3
    expect(Math.round(r.returnShare)).toBe(1333);
    expect(Math.round(r.net)).toBe(35000 - 15000 - 5000 - 7000 - 1333);
    // break-even CPA = 0.9 × 20000 − 5000
    expect(r.breakEvenCpa).toBe(13000);
    expect(r.verdict).toBe("profit");
  });

  it("derives CPA from cost per message and close rate", () => {
    const r = computeUnitEconomics({ price: 25000, productCost: 12000, delivery: 5000, costPerMessage: 2, closeRate: 5, returnRate: 15, usdRate: 1500 });
    expect(r.cpa).toBe(60000); // $2 × 1500 / 5%
    expect(r.verdict).toBe("loss");
    expect(r.breakEvenCostPerMessage).toBeCloseTo(((0.85 * 13000 - 5000) * 0.05) / 1500, 5);
  });

  it("parses calc blocks defensively", () => {
    expect(parseCalcBlock('{"price": "35,000", "productCost": 15000}')?.price).toBe(35000);
    expect(parseCalcBlock("not json")).toBeNull();
    expect(parseCalcBlock('{"productCost": 1}')).toBeNull();
  });
});

describe("rich answer blocks", () => {
  it("splits markdown, script and calc blocks", () => {
    const blocks = parseRichBlocks('مقدمة\n```script\nهلا عيني\n```\nبعدين\n```calc\n{"price":1}\n```');
    expect(blocks.map((b) => b.type)).toEqual(["markdown", "script", "markdown", "calc"]);
    expect(blocks[1].content).toBe("هلا عيني");
  });

  it("treats an unclosed fence while streaming as still open", () => {
    const blocks = parseRichBlocks("مقدمة\n```script\nهلا", true);
    expect(blocks[1]).toMatchObject({ type: "script", content: "هلا", open: true });
  });
});
