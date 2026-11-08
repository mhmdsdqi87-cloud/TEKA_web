"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useRouter } from "@/lib/teka/router";
import { NEXUS } from "@/lib/teka/config";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Blocks,
  BarChart3,
  Cloud,
  ShieldCheck,
  Zap,
  GraduationCap,
  Users2,
  Award,
  Hammer,
  Globe2,
  Sparkles,
} from "lucide-react";

const STACK = [
  {
    icon: Code2,
    title: "Modern Software",
    body: "Next.js 16 + TypeScript + Tailwind — a typed, component-driven frontend with server-rendered metadata and client-side cinematic transitions.",
    tags: ["Next.js 16", "TypeScript", "Framer Motion"],
  },
  {
    icon: Blocks,
    title: "Blockchain Infrastructure",
    body: "ERC-20 token development on Ethereum — currently a Sepolia testnet deployment, moving through security review before any production step.",
    tags: ["Ethereum", "ERC-20", "Sepolia Testnet"],
  },
  {
    icon: BarChart3,
    title: "Data & Analytics",
    body: "A validated REST API with rate limiting, cached upstream integrations and honest availability reporting — every metric on the platform is sourced.",
    tags: ["REST API", "Prisma + SQLite", "CoinGecko Feed"],
  },
  {
    icon: Cloud,
    title: "Deployment Architecture",
    body: "Persistent storage layer, environment-based configuration and a clean separation between UI, API and data responsibilities.",
    tags: ["Persistent Storage", "Env Config", "Modular Design"],
  },
];

const ENGINEERING = [
  { icon: Zap, title: "Performance Budget", body: "Lazy loading, code splitting and GPU-friendly animation keep the experience fast on every device." },
  { icon: ShieldCheck, title: "Defensive Backend", body: "Zod-validated inputs, per-IP rate limits and structured error envelopes on every endpoint." },
];

const NEXUS_ICONS = [GraduationCap, Globe2, Users2, Hammer, Award, Sparkles];

/* ------------------------------------------------------------------ */
/* TEKA NEXUS — featured live-product showcase                         */
/* ------------------------------------------------------------------ */

function NexusShowcase() {
  const reduced = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8" aria-label="TEKA Nexus — live product">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Ambient glow behind the panel */}
        <div
          className="absolute -inset-6 rounded-[2.5rem] opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 42%, rgba(227,184,85,0.14), transparent 72%)",
          }}
          aria-hidden="true"
        />

        <a
          href={NEXUS.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-gold/[0.1] via-white/[0.02] to-transparent transition-all duration-500 hover:border-gold/50 hover:shadow-[0_30px_90px_-30px_rgba(227,184,85,0.35)] focus-visible:outline-2 active:scale-[0.995] sm:rounded-[2rem]"
          aria-label={`Open ${NEXUS.name} — the TEKA academy (new tab)`}
        >
          {/* Grid + scanline atmosphere */}
          <div className="grid-backdrop absolute inset-0 opacity-80" aria-hidden="true" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(227,184,85,0.12), transparent 65%)",
            }}
            aria-hidden="true"
          />

          {/* HUD corner brackets */}
          <span className="absolute left-4 top-4 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-gold/40 transition-colors duration-500 group-hover:border-gold/80" aria-hidden="true" />
          <span className="absolute right-4 top-4 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-gold/40 transition-colors duration-500 group-hover:border-gold/80" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-gold/40 transition-colors duration-500 group-hover:border-gold/80" aria-hidden="true" />
          <span className="absolute bottom-4 right-4 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-gold/40 transition-colors duration-500 group-hover:border-gold/80" aria-hidden="true" />

          <div className="relative px-6 pb-9 pt-8 text-center sm:px-12 sm:pb-12 sm:pt-12">
            {/* Status row */}
            <div className="flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.07] px-3.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 pulse-dot" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="mono-label text-emerald-300">Live Product</span>
              </span>
              <span className="mono-label hidden text-muted-foreground/60 sm:inline">NODE NEXUS-01 // TEKA GRID</span>
            </div>

            {/* Title block */}
            <div className="relative mx-auto mt-7 max-w-2xl">
              {/* Orbiting ring accent */}
              {!reduced && (
                <div
                  className="spin-cw-70 pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10"
                  aria-hidden="true"
                />
              )}
              <p className="font-display text-sm font-medium tracking-[0.35em] text-gold/70 uppercase" dir="rtl" lang="fa">
                {NEXUS.nativeName}
              </p>
              <h2 className="gold-text mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                TEKA NEXUS
              </h2>
              <p className="mt-3 font-display text-base font-medium text-foreground/90 sm:text-lg">
                {NEXUS.tagline}
              </p>
            </div>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
              {NEXUS.description}
            </p>

            {/* Feature grid */}
            <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3" aria-label="TEKA Nexus features">
              {NEXUS.features.map((feature, i) => {
                const Icon = NEXUS_ICONS[i % NEXUS_ICONS.length];
                return (
                  <li
                    key={feature}
                    className="glass-gold flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-medium text-gold-bright/90 sm:text-[13px]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    {feature}
                  </li>
                );
              })}
            </ul>

            {/* CTA row */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-7 py-3 text-sm font-semibold text-black transition-transform duration-300 group-hover:scale-[1.03]">
                Enter TEKA NEXUS
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground/80">
                teka-nexus.vercel.app
              </span>
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function TechnologyView() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <>
      <PageHeader
        eyebrow="TEKA Technology"
        title={<>The Engine <span className="gold-text">Behind The Future</span></>}
        description="Powering next-generation digital experiences with modern technology — every layer chosen for speed, safety and clarity."
      />

      <NexusShowcase />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 pt-10" aria-label="Technology stack">
        <div className="grid gap-4 md:grid-cols-2">
          {STACK.map((tech, i) => (
            <motion.article
              key={tech.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="card-hover glass rounded-3xl p-7"
            >
              <div className="flex items-start justify-between">
                <tech.icon className="h-7 w-7 text-gold" aria-hidden />
                <span className="mono-label text-muted-foreground/60">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{tech.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{tech.body}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tech.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-silver">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-[#08080a] py-14" aria-label="Engineering standards">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid gap-4 md:grid-cols-2">
          {ENGINEERING.map((e, i) => (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
            >
              <e.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
              <div>
                <h3 className="font-display text-base font-semibold">{e.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6" aria-label="Technology CTA">
        <p className="font-display text-2xl md:text-4xl font-semibold text-balance">
          Innovation is not the future. <span className="gold-text">Innovation creates it.</span>
        </p>
        <button
          onClick={() => navigate("command")}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          See It Running — Command Center
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </section>
    </>
  );
}
