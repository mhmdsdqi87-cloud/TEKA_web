"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useRouter } from "@/lib/teka/router";
import { ArrowRight, Code2, Blocks, BarChart3, Cloud, ShieldCheck, Zap } from "lucide-react";

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

export function TechnologyView() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <>
      <PageHeader
        eyebrow="TEKA Technology"
        title={<>The Engine <span className="gold-text">Behind The Future</span></>}
        description="Powering next-generation digital experiences with modern technology — every layer chosen for speed, safety and clarity."
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16" aria-label="Technology stack">
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
