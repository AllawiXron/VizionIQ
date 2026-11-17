import { useCallback, useEffect, useState } from "react";
import { chaptersList } from "../data/chaptersData";
import { playbooksList } from "../data/playbooksData";
import { guideModules } from "../data/iraqGuideData";

export type Route =
  | { view: "home" }
  | { view: "chapters" }
  | { view: "chapter"; id: string }
  | { view: "solutions" }
  | { view: "solution"; id: string }
  | { view: "guide" }
  | { view: "guideModule"; id: string }
  | { view: "tools" }
  | { view: "market" };

const CHAPTER_IDS = new Set(chaptersList.map((c) => c.id));
const PLAYBOOK_IDS = new Set(playbooksList.map((p) => p.id));
const GUIDE_IDS = new Set(guideModules.map((m) => m.id));

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case "chapters":
      return { view: "chapters" };
    case "chapter":
      return parts[1] && CHAPTER_IDS.has(parts[1]) ? { view: "chapter", id: parts[1] } : { view: "chapters" };
    case "solutions":
      return { view: "solutions" };
    case "solution":
      return parts[1] && PLAYBOOK_IDS.has(parts[1]) ? { view: "solution", id: parts[1] } : { view: "solutions" };
    case "guide":
      return parts[1] && GUIDE_IDS.has(parts[1]) ? { view: "guideModule", id: parts[1] } : { view: "guide" };
    case "tools":
      return { view: "tools" };
    case "market":
      return { view: "market" };
    default:
      return { view: "home" };
  }
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case "chapters":
      return "#/chapters";
    case "chapter":
      return `#/chapter/${route.id}`;
    case "solutions":
      return "#/solutions";
    case "solution":
      return `#/solution/${route.id}`;
    case "guide":
      return "#/guide";
    case "guideModule":
      return `#/guide/${route.id}`;
    case "tools":
      return "#/tools";
    case "market":
      return "#/market";
    default:
      return "#/";
  }
}

export function routeForSection(id: string): Route | null {
  if (CHAPTER_IDS.has(id)) return { view: "chapter", id };
  if (id.startsWith("solution:")) {
    const playbookId = id.slice("solution:".length);
    return PLAYBOOK_IDS.has(playbookId) ? { view: "solution", id: playbookId } : { view: "solutions" };
  }
  if (id.startsWith("guide:")) {
    const moduleId = id.slice("guide:".length);
    return GUIDE_IDS.has(moduleId) ? { view: "guideModule", id: moduleId } : { view: "guide" };
  }
  const legacy = /^ch(\d+)$/.exec(id);
  if (legacy && CHAPTER_IDS.has(`chapter${legacy[1]}`)) return { view: "chapter", id: `chapter${legacy[1]}` };
  switch (id) {
    case "hero-section":
    case "pricing-section":
      return { view: "home" };
    case "contents-section":
    case "chapters-grid-section":
      return { view: "chapters" };
    case "vizion-growth-suite":
    case "roi-calculator":
    case "ad-simulator":
    case "script-simulator":
    case "thirty-day-plan":
      return { view: "tools" };
    case "elite-secrets-section":
    case "iraqi-market-section":
      return { view: "market" };
    default:
      return null;
  }
}

export function sameRoute(a: Route, b: Route): boolean {
  return routeToHash(a) === routeToHash(b);
}

export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { view: "home" } : parseHash(window.location.hash)
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash === hash || (hash === "#/" && !window.location.hash)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = hash;
  }, []);

  return [route, navigate];
}
