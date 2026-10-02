import { beforeEach, describe, expect, it } from "vitest";
import { parseHash, routeForSection, routeToHash } from "./route";
import { nextChapterId, stageOf, type CourseProgress } from "./progress";
import { requestTool, takePendingTool } from "./toolRequest";
import { chapterPlaybook, playbooksList } from "../data/playbooksData";
import { chaptersList } from "../data/chaptersData";
import { guideModules, playbookGuide, seasonEvents } from "../data/iraqGuideData";
import { upcomingSeasons } from "../components/guide/GuideTools";

describe("Iraq guide data", () => {
  it("every module is complete, sourced and links to real content", () => {
    const chapterIds = new Set(chaptersList.map((c) => c.id));
    const playbookIds = new Set(playbooksList.map((p) => p.id));
    const ids = new Set<string>();
    for (const m of guideModules) {
      expect(ids.has(m.id)).toBe(false);
      ids.add(m.id);
      expect(m.stats.length).toBeGreaterThanOrEqual(3);
      expect(m.sections.length).toBeGreaterThanOrEqual(3);
      expect(m.checklist.length).toBeGreaterThanOrEqual(4);
      expect(m.sources.length).toBeGreaterThanOrEqual(3);
      for (const s of m.sources) expect(s.url).toMatch(/^https:\/\//);
      for (const p of m.relatedPlaybooks) expect(playbookIds.has(p)).toBe(true);
      for (const c of m.relatedChapters) expect(chapterIds.has(c)).toBe(true);
    }
    for (const [pb, gids] of Object.entries(playbookGuide)) {
      expect(playbookIds.has(pb)).toBe(true);
      for (const g of gids) expect(ids.has(g)).toBe(true);
    }
  });

  it("season dates are valid and the calendar only shows upcoming ones, soonest first", () => {
    for (const e of seasonEvents) expect(Number.isNaN(Date.parse(e.date))).toBe(false);
    const up = upcomingSeasons(new Date("2026-10-02T12:00:00Z"), 3);
    expect(up[0].title).toBe("بداية موسم الشتاء");
    expect(up[0].days).toBe(30);
    expect(up.map((e) => e.days)).toEqual([...up.map((e) => e.days)].sort((a, b) => a - b));
    expect(upcomingSeasons(new Date("2030-01-01T00:00:00Z"))).toHaveLength(0);
  });
});

describe("playbooks data", () => {
  it("every playbook is complete and links to real chapters", () => {
    const chapterIds = new Set(chaptersList.map((c) => c.id));
    const ids = new Set<string>();
    for (const pb of playbooksList) {
      expect(ids.has(pb.id)).toBe(false);
      ids.add(pb.id);
      expect(pb.causes.length).toBeGreaterThanOrEqual(4);
      expect(pb.steps.length).toBeGreaterThanOrEqual(5);
      expect(pb.scripts.length).toBeGreaterThanOrEqual(2);
      expect(pb.plan).toHaveLength(7);
      for (const ch of pb.relatedChapters) expect(chapterIds.has(ch)).toBe(true);
    }
  });

  it("every chapter points to an existing playbook", () => {
    const ids = new Set(playbooksList.map((p) => p.id));
    for (const ch of chaptersList) expect(ids.has(chapterPlaybook[ch.id])).toBe(true);
  });
});

describe("route", () => {
  it("round-trips every screen through the hash", () => {
    for (const hash of ["#/", "#/chapters", "#/chapter/chapter3", "#/solutions", "#/solution/ghosting", "#/guide", "#/guide/delivery", "#/tools", "#/market"]) {
      expect(routeToHash(parseHash(hash))).toBe(hash);
    }
  });

  it("falls back safely on unknown or empty hashes", () => {
    expect(parseHash("")).toEqual({ view: "home" });
    expect(parseHash("#/nope")).toEqual({ view: "home" });
    expect(parseHash("#/chapter/chapter99")).toEqual({ view: "chapters" });
    expect(parseHash("#/solution/nope")).toEqual({ view: "solutions" });
    expect(parseHash("#/guide/nope")).toEqual({ view: "guide" });
  });

  it("maps the old single-page section ids to screens", () => {
    expect(routeForSection("chapter7")).toEqual({ view: "chapter", id: "chapter7" });
    expect(routeForSection("ch10")).toEqual({ view: "chapter", id: "chapter10" });
    expect(routeForSection("vizion-growth-suite")).toEqual({ view: "tools" });
    expect(routeForSection("elite-secrets-section")).toEqual({ view: "market" });
    expect(routeForSection("contents-section")).toEqual({ view: "chapters" });
    expect(routeForSection("solution:returns")).toEqual({ view: "solution", id: "returns" });
    expect(routeForSection("guide:importing")).toEqual({ view: "guideModule", id: "importing" });
    expect(routeForSection("something-else")).toBeNull();
  });
});

describe("progress", () => {
  const p = (done: string[], last: string | null): CourseProgress => ({ done, last });

  it("starts with chapter 1", () => {
    expect(nextChapterId(p([], null))).toBe("chapter1");
  });

  it("continues the chapter that was left unfinished", () => {
    expect(nextChapterId(p(["chapter1"], "chapter4"))).toBe("chapter4");
  });

  it("moves past a finished chapter to the next unfinished one", () => {
    expect(nextChapterId(p(["chapter1", "chapter2"], "chapter1"))).toBe("chapter3");
    expect(nextChapterId(p(["chapter11"], "chapter11"))).toBe("chapter1");
  });

  it("returns null when every chapter is done", () => {
    const all = Array.from({ length: 11 }, (_, i) => `chapter${i + 1}`);
    expect(nextChapterId(p(all, "chapter11"))).toBeNull();
  });

  it("knows each chapter's stage", () => {
    expect(stageOf("chapter5")?.index).toBe(1);
    expect(stageOf("chapter11")?.index).toBe(3);
  });
});

describe("tool requests", () => {
  beforeEach(() => {
    takePendingTool();
  });

  it("keeps a request until the tools screen takes it", () => {
    // No window in the node test environment: stub the event target.
    const g = globalThis as unknown as { window?: unknown; CustomEvent?: unknown };
    const hadWindow = "window" in g;
    if (!hadWindow) g.window = { dispatchEvent: () => true };
    if (!g.CustomEvent) g.CustomEvent = class { constructor(public type: string, public init?: unknown) {} };
    requestTool({ toolId: "pricing-calculator" });
    expect(takePendingTool()).toEqual({ toolId: "pricing-calculator" });
    expect(takePendingTool()).toBeNull();
    if (!hadWindow) delete g.window;
  });
});
