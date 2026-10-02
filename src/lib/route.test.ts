import { beforeEach, describe, expect, it } from "vitest";
import { parseHash, routeForSection, routeToHash } from "./route";
import { nextChapterId, stageOf, type CourseProgress } from "./progress";
import { requestTool, takePendingTool } from "./toolRequest";

describe("route", () => {
  it("round-trips every screen through the hash", () => {
    for (const hash of ["#/", "#/chapters", "#/chapter/chapter3", "#/tools", "#/market"]) {
      expect(routeToHash(parseHash(hash))).toBe(hash);
    }
  });

  it("falls back safely on unknown or empty hashes", () => {
    expect(parseHash("")).toEqual({ view: "home" });
    expect(parseHash("#/nope")).toEqual({ view: "home" });
    expect(parseHash("#/chapter/chapter99")).toEqual({ view: "chapters" });
  });

  it("maps the old single-page section ids to screens", () => {
    expect(routeForSection("chapter7")).toEqual({ view: "chapter", id: "chapter7" });
    expect(routeForSection("ch10")).toEqual({ view: "chapter", id: "chapter10" });
    expect(routeForSection("vizion-growth-suite")).toEqual({ view: "tools" });
    expect(routeForSection("elite-secrets-section")).toEqual({ view: "market" });
    expect(routeForSection("contents-section")).toEqual({ view: "chapters" });
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
