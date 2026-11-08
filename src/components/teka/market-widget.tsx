"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMarket } from "@/lib/teka/hooks";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, Signal, SignalHigh, SignalZero } from "lucide-react";

function fmtUsd(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(6)}`;
}

function fmtVol(n: number | null) {
  if (n == null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return <div className="h-8 w-24" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / range) * 24 - 2}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" className="h-8 w-24" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "rgba(227,184,85,0.9)" : "rgba(155,163,174,0.8)"}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const AVAILABILITY_META = {
  LIVE: { icon: SignalHigh, text: "Live — CoinGecko", cls: "text-emerald-300" },
  CACHED: { icon: Signal, text: "Cached feed", cls: "text-gold-bright" },
  UNAVAILABLE: { icon: SignalZero, text: "Upstream unavailable", cls: "text-red-400" },
} as const;

export function MarketWidget({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, refetch, isRefetching } = useMarket();
  const [showIrr, setShowIrr] = useState(false);

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const availability = data?.availability ?? "UNAVAILABLE";
  const meta = AVAILABILITY_META[availability];
  const AvailIcon = meta.icon;

  return (
    <div className="glass rounded-2xl p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <AvailIcon className={cn("h-4 w-4", meta.cls)} aria-hidden />
          <span className="mono-label text-muted-foreground">Global Market</span>
          <span className={cn("mono-label", meta.cls)}>{meta.text}</span>
        </div>
        <div className="flex items-center gap-2">
          {data?.fx?.usdToIrr && (
            <button
              onClick={() => setShowIrr((v) => !v)}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
              aria-pressed={showIrr}
            >
              {showIrr ? "USD" : "Toman"}
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
            aria-label="Refresh market data"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {availability === "UNAVAILABLE" ? (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="text-foreground font-medium">Market data is temporarily unavailable</p>
            <p className="mt-1 text-xs leading-relaxed">
              The upstream provider (CoinGecko) could not be reached. TEKA never fabricates prices —
              live data will reappear automatically when the upstream recovers.
            </p>
          </div>
        </div>
      ) : (
        <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {data?.coins.map((coin, i) => {
            const positive = (coin.change24h ?? 0) >= 0;
            const irr = showIrr && data?.fx?.usdToIrr ? coin.usd * data.fx.usdToIrr : null;
            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-gold/10 border border-gold/20 font-display text-[10px] font-bold text-gold-bright">
                      {coin.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-tight">{coin.name}</p>
                      <p className="text-[10px] mono-label text-muted-foreground">{coin.symbol}</p>
                    </div>
                  </div>
                  {coin.history.length > 1 && <Sparkline data={coin.history} positive={positive} />}
                </div>
                <div className="mt-2.5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-base font-semibold tabular-nums">
                      {coin.usd ? (irr ? `${Math.round(irr).toLocaleString("en-US")} ﷼` : fmtUsd(coin.usd)) : "—"}
                    </p>
                    {irr && <p className="text-[10px] text-muted-foreground tabular-nums">{fmtUsd(coin.usd)}</p>}
                  </div>
                  {coin.change24h != null && (
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                        positive ? "bg-emerald-400/10 text-emerald-300" : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {positive ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/70">
        Third-party market data via CoinGecko public API
        {data?.fx?.usdToIrr ? ` · USD/IRR ${data.fx.usdToIrr.toLocaleString("en-US")} (${data.fx.irrLabel}, ${data.fx.source})` : ""} ·
        Not investment advice. TEKA Token is not listed — shown assets are reference markets only.
      </p>
    </div>
  );
}
