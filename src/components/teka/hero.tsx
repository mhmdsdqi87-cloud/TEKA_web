"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { AtmosphereCanvas } from "@/components/teka/atmosphere";
import { useRouter } from "@/lib/teka/router";
import { usePresence, useStats } from "@/lib/teka/hooks";
import { ArrowRight, Terminal, ChevronDown } from "lucide-react";

export function Hero() {
  const navigate = useRouter((s) => s.navigate);
  const { data: presence } = usePresence();
  const { data: stats } = useStats();
  const reduced = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden" aria-label="TEKA introduction">
      {/* Atmosphere layers */}
      <div className="absolute inset-0" aria-hidden>
        <div className="grid-backdrop absolute inset-0" />
        <AtmosphereCanvas />
        {/* Shooting stars — occasional meteors across the hero sky */}
        {!reduced && (
          <>
            <span
              className="shooting-star"
              style={{ top: "12%", left: "55%", ["--shooting-angle" as string]: "22deg", ["--shooting-distance" as string]: "48vw", ["--shooting-duration" as string]: "9s", ["--shooting-delay" as string]: "1.5s" }}
            />
            <span
              className="shooting-star"
              style={{ top: "28%", left: "8%", ["--shooting-angle" as string]: "-14deg", ["--shooting-distance" as string]: "40vw", ["--shooting-duration" as string]: "12s", ["--shooting-delay" as string]: "6s" }}
            />
          </>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 38%, rgba(227,184,85,0.09), transparent 70%), radial-gradient(ellipse 90% 60% at 50% 115%, rgba(0,0,0,0.85), transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* System line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full glass px-4 py-1.5"
        >
          <span className="flex h-2 w-2 relative">
            <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-60 pulse-dot" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="mono-label text-muted-foreground">
            TEKA Platform v2.0 — Systems Online
            {presence ? ` · ${presence.active} exploring` : ""}
          </span>
        </motion.div>

        {/* Emblem — the official TEKA mark, floating in zero-G inside orbit rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease, delay: 0.05 }}
          className="relative mx-auto mb-6 h-[104px] w-[186px] sm:h-[128px] sm:w-[228px]"
        >
          {/* Orbit system */}
          {!reduced && (
            <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
              <div className="orbit-ring hero-ring-a" />
              <div className="orbit-ring hero-ring-b" />
            </div>
          )}
          <div className="emblem-halo absolute inset-[-38%]" aria-hidden="true" />
          <div className={reduced ? "" : "emblem-float"}>
            <Image
              src="/teka-mark.png"
              alt="TEKA emblem"
              width={456}
              height={256}
              priority
              className="relative h-full w-full object-contain"
              style={{ filter: "drop-shadow(0 0 34px rgba(227,184,85,0.38))" }}
            />
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 30, letterSpacing: "0.3em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.06em" }}
          transition={{ duration: 1.0, ease, delay: 0.15 }}
          className="font-display text-[19vw] sm:text-8xl md:text-9xl font-bold leading-none"
        >
          <span className="gold-text">TEKA</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="mt-4 font-display text-xl md:text-3xl font-medium text-foreground/90 text-balance"
        >
          Building The Future Of Digital Technology
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.52 }}
          className="mx-auto mt-5 max-w-2xl text-balance text-sm md:text-base leading-relaxed text-muted-foreground"
        >
          A technology ecosystem focused on digital products, innovative tools, blockchain
          infrastructure and future digital experiences — engineered with transparency at its core.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.64 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("ecosystem")}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-7 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Explore Ecosystem
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
          <button
            onClick={() => navigate("command")}
            className="inline-flex items-center gap-2 rounded-full glass px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            <Terminal className="h-4 w-4" aria-hidden />
            Command Center
          </button>
        </motion.div>

        {/* Stat strip — real, sourced numbers only */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.78 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] sm:grid-cols-4"
        >
          {[
            { label: "Total Supply", value: "100M", detail: "Fixed — ERC-20" },
            { label: "Divisions", value: String(stats?.products.total ?? 16), detail: "Ecosystem units" },
            { label: "Live Systems", value: String(stats?.products.byStatus.live ?? 6), detail: "Operational now" },
            { label: "Phases", value: "5", detail: "2 in progress" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0c]/90 px-4 py-4">
              <dt className="order-2 mono-label mt-1 text-muted-foreground">{s.label}</dt>
              <dd className="order-1 font-display text-2xl font-semibold text-foreground">
                {s.value}
                <span className="sr-only"> — {s.detail}</span>
              </dd>
            </div>
          ))}
        </motion.dl>

        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="mt-12 flex justify-center"
            aria-hidden
          >
            <ChevronDown className="h-5 w-5 animate-bounce text-gold/50" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
