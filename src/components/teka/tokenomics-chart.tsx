"use client";

/**
 * Interactive tokenomics donut — Whitepaper v1.0 §6 allocation.
 * SVG donut with hover/tap highlighting + animated arcs.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENOMICS } from "@/lib/teka/config";
import { cn } from "@/lib/utils";

const R = 80;
const C = 2 * Math.PI * R;

export function TokenomicsChart() {
  const [active, setActive] = useState<number | null>(null);
  const total = TOKENOMICS.reduce((s, t) => s + t.percent, 0);

  const segments = useMemo(() => {
    const arr: Array<(typeof TOKENOMICS)[number] & { len: number; offset: number }> = [];
    let acc = 0;
    for (const t of TOKENOMICS) {
      const len = (t.percent / total) * C;
      arr.push({ ...t, len, offset: acc });
      acc += len;
    }
    return arr;
  }, [total]);

  const current = active != null ? TOKENOMICS[active] : null;

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      {/* Donut */}
      <div className="relative mx-auto w-[260px] sm:w-[300px]" role="img" aria-label="TEKA tokenomics allocation donut chart">
        <svg viewBox="0 0 200 200" className="w-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="22" />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.id}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={active === i ? 26 : 20}
              strokeDasharray={`${seg.len - 2} ${C - seg.len + 2}`}
              strokeDashoffset={-seg.offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: active == null || active === i ? 1 : 0.25 }}
              transition={{ duration: 0.35 }}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive((v) => (v === i ? null : i))}
              tabIndex={0}
              role="button"
              aria-label={`${seg.label}: ${seg.percent}%`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive((v) => (v === i ? null : i));
                }
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current ? current.id : "total"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-bold gold-text">{current ? `${current.percent}%` : "100M"}</p>
              <p className="mono-label mt-1 text-muted-foreground max-w-[130px]">
                {current ? current.label : "Total Supply"}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <ul className="space-y-2">
        {TOKENOMICS.map((t, i) => (
          <li key={t.id}>
            <button
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive((v) => (v === i ? null : i))}
              className={cn(
                "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-300",
                active === i ? "border-gold/40 bg-gold/[0.06]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
              )}
              aria-pressed={active === i}
            >
              <span className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} aria-hidden />
                <span>
                  <span className="block text-sm text-foreground">{t.label}</span>
                  <span className="block text-[11px] text-muted-foreground tabular-nums">
                    {t.tokens.toLocaleString("en-US")} TEKA
                  </span>
                </span>
              </span>
              <span className="font-display text-lg font-semibold tabular-nums text-gold-bright">{t.percent}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
