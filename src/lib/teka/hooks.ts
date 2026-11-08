"use client";

/**
 * Typed API client + TanStack Query hooks for the TEKA backend.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export type StatusPayload = {
  platform: { name: string; version: string; state: string };
  systems: Array<{ id: string; label: string; state: string; detail: string }>;
  presence: { activeSessions: number; window: string; policy: string };
  time: string;
};

export type StatsPayload = {
  products: {
    total: number;
    byStatus: { live: number; development: number; planned: number; experimental: number };
    byDivision: Array<{ division: string; count: number }>;
  };
  roadmap: { total: number; completed: number };
  changelog: { entries: number };
  metrics: Array<{ key: string; label: string; value: string; detail: string | null; source: string }>;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  division: string;
  tagline: string;
  description: string;
  status: "LIVE" | "DEVELOPMENT" | "PLANNED" | "EXPERIMENTAL";
  category: string;
  metrics: string | null;
  featured: boolean;
  order: number;
};

export type RoadmapPhase = {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  period: string;
  order: number;
};

export type PlatformUpdate = {
  id: string;
  title: string;
  body: string;
  type: string;
  version: string | null;
  createdAt: string;
};

export type MarketPayload = {
  availability: "LIVE" | "CACHED" | "UNAVAILABLE";
  source: string;
  fetchedAt: string;
  fx: { usdToIrr: number | null; irrLabel: string; source: string } | null;
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    usd: number;
    change24h: number | null;
    usd24hVolume: number | null;
    history: number[];
  }>;
};

export type PresencePayload = {
  active: number;
  displayed: number;
  windowSeconds: number;
  policy?: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function usePlatformStatus() {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => api<StatusPayload>("/api/status"),
    refetchInterval: 30_000,
  });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => api<StatsPayload>("/api/stats"), staleTime: 60_000 });
}

export function useProducts(filter?: { division?: string; status?: string; q?: string }) {
  const params = new URLSearchParams();
  if (filter?.division) params.set("division", filter.division);
  if (filter?.status) params.set("status", filter.status);
  if (filter?.q) params.set("q", filter.q);
  const qs = params.toString();
  return useQuery({
    queryKey: ["products", filter ?? {}],
    queryFn: () => api<{ count: number; products: Product[] }>(`/api/products${qs ? `?${qs}` : ""}`),
    staleTime: 60_000,
  });
}

export function useRoadmap() {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: () => api<{ count: number; phases: RoadmapPhase[] }>("/api/roadmap"),
    staleTime: 120_000,
  });
}

export function useUpdates(limit = 6) {
  return useQuery({
    queryKey: ["updates", limit],
    queryFn: () => api<{ count: number; updates: PlatformUpdate[] }>(`/api/updates?limit=${limit}`),
    refetchInterval: 60_000,
  });
}

export function useMarket() {
  return useQuery({
    queryKey: ["market"],
    queryFn: () => api<MarketPayload>("/api/market"),
    refetchInterval: 45_000,
  });
}

export function usePresence(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["presence"],
    queryFn: () => api<PresencePayload>("/api/presence"),
    refetchInterval: 15_000,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    const sessionId =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("teka-session") ??
          (() => {
            const id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
            window.localStorage.setItem("teka-session", id);
            return id;
          })())
        : null;
    if (!sessionId) return;

    const beat = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ["presence"] }))
        .catch(() => undefined);
    };
    beat();
    const timer = setInterval(beat, 20_000);
    return () => clearInterval(timer);
  }, [enabled, queryClient]);

  return query;
}

export function useContactSubmit() {
  return useMutation({
    mutationFn: (payload: { name: string; email: string; topic: string; message: string }) =>
      fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const json = (await res.json()) as ApiEnvelope<{ id: string; receivedAt: string }>;
        if (!json.ok) throw new Error(json.error.message);
        return json.data;
      }),
  });
}
