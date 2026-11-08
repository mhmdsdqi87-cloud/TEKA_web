"use client";

/**
 * TEKA hash router — the platform ships as a single-page experience,
 * deep-linkable via `#/ecosystem`, `#/token`, `#/command`, …
 */
import { create } from "zustand";
import { useEffect } from "react";

export const ROUTES = [
  "home",
  "about",
  "ecosystem",
  "technology",
  "token",
  "command",
  "explore",
  "contact",
  "performance",
  "security",
  "premium",
  "global-vision",
] as const;

export type RouteId = (typeof ROUTES)[number];

export const ROUTE_TITLES: Record<RouteId, string> = {
  home: "Home",
  about: "About",
  ecosystem: "Ecosystem",
  technology: "Technology",
  token: "Token",
  command: "Command Center",
  explore: "Explore",
  contact: "Contact",
  performance: "Performance",
  security: "Security",
  premium: "Experience",
  "global-vision": "Global Vision",
};

function parseHash(): RouteId {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const found = ROUTES.find((r) => r === raw);
  return found ?? "home";
}

type RouterState = {
  route: RouteId;
  navigate: (route: RouteId) => void;
  syncFromHash: () => void;
};

export const useRouter = create<RouterState>((set) => ({
  route: "home",
  navigate: (route) => {
    if (typeof window !== "undefined") {
      window.location.hash = `/${route}`;
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    set({ route });
  },
  syncFromHash: () => set({ route: parseHash() }),
}));

/** Subscribes the store to hashchange events (mounted once, app root). */
export function useHashSync() {
  const syncFromHash = useRouter((s) => s.syncFromHash);
  useEffect(() => {
    syncFromHash();
    let previous = useRouter.getState().route;
    const onHash = () => {
      syncFromHash();
      // Deep-link or in-page hash navigation: bring the new view into view.
      if (useRouter.getState().route !== previous) {
        previous = useRouter.getState().route;
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [syncFromHash]);
}
