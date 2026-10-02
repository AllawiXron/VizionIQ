/**
 * Tiny hash router for the member area. Each destination is its own screen
 * (home, chapter list, one chapter, tools, market insights) instead of one
 * endless page, and the browser/phone back button moves between them.
 */
import { useCallback, useEffect, useState } from "react";
import { chaptersList } from "../data/chaptersData";

export type Route =
  | { view: "home" }
  | { view: "chapters" }
  | { view: "chapter"; id: string }
  | { view: "tools" }
  | { view: "market" };

const CHAPTER_IDS = new Set(chaptersList.map((c) => c.id));

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case "chapters":
      return { view: "chapters" };
    case "chapter":
      return parts[1] && CHAPTER_IDS.has(parts[1]) ? { view: "chapter", id: parts[1] } : { view: "chapters" };
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
    case "tools":
      return "#/tools";
    case "market":
      return "#/market";
    default:
      return "#/";
  }
}

/**
 * Maps the old single-page section ids (still used by the advisor's chapter
 * links and a few components) to a screen.
 */
export function routeForSection(id: string): Route | null {
  if (CHAPTER_IDS.has(id)) return { view: "chapter", id };
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
      // Same screen: just return to its top.
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = hash;
  }, []);

  return [route, navigate];
}
