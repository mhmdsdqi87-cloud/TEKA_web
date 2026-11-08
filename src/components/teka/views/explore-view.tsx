"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { useRouter, type RouteId } from "@/lib/teka/router";
import { useStats } from "@/lib/teka/hooks";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowUpRight, Gauge, ShieldCheck, Gem, Globe2, Boxes, Coins, Cpu, Users } from "lucide-react";

type Destination = {
  id: RouteId;
  code: string;
  title: string;
  description: string;
  icon: typeof Gauge;
  keywords: string;
};

const DESTINATIONS: Destination[] = [
  { id: "ecosystem", code: "E-01", title: "Ecosystem", description: "Interactive product discovery across all six TEKA divisions.", icon: Boxes, keywords: "products labs web3 community intelligence technology catalog" },
  { id: "token", code: "T-02", title: "Token", description: "TEKA Token facts, tokenomics and testnet contract transparency.", icon: Coins, keywords: "erc-20 supply tokenomics wallet sepolia contract" },
  { id: "technology", code: "C-03", title: "Technology", description: "The stack and engineering standards powering the platform.", icon: Cpu, keywords: "stack next.js api blockchain infrastructure performance" },
  { id: "command", code: "M-04", title: "Command Center", description: "Live status, statistics and platform changelog.", icon: Gauge, keywords: "dashboard status metrics telemetry market live" },
  { id: "performance", code: "P-05", title: "Performance", description: "How TEKA is engineered for speed — with honest labels.", icon: Gauge, keywords: "speed lighthouse optimization loading budget" },
  { id: "security", code: "S-06", title: "Security", description: "Defense in depth across frontend, API and data layers.", icon: ShieldCheck, keywords: "security validation rate limiting wallet safety" },
  { id: "premium", code: "X-07", title: "Experience", description: "The design philosophy behind the TEKA feel.", icon: Gem, keywords: "design premium experience typography motion" },
  { id: "global-vision", code: "G-08", title: "Global Vision", description: "A technology initiative built without borders.", icon: Globe2, keywords: "global world access vision roadmap" },
  { id: "contact", code: "U-09", title: "Community & Contact", description: "Join the official TEKA channels and reach the team.", icon: Users, keywords: "telegram x twitter github contact social community" },
];

export function ExploreView() {
  const navigate = useRouter((s) => s.navigate);
  const stats = useStats();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESTINATIONS.filter(
      (d) => !q || d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.keywords.includes(q)
    );
  }, [query]);

  const highlights = stats.data
    ? [
        { label: "Live units", value: String(stats.data.products.byStatus.live) },
        { label: "Roadmap phases", value: String(stats.data.roadmap.total) },
        { label: "Platform updates", value: String(stats.data.changelog.entries) },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Discover TEKA"
        title={<>Explore <span className="gold-text">TEKA.</span></>}
        description="More than a website — a vision for what comes next. Search the platform and jump anywhere."
      >
        <div className="relative mx-auto mt-8 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the platform — try 'token', 'security', 'market'…"
            aria-label="Search TEKA destinations"
            className="h-12 rounded-full border-white/10 bg-[#101013] pl-11 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {highlights.length > 0 && (
          <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2">
            {highlights.map((h) => (
              <span key={h.label} className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-gold-bright">{h.value}</span> {h.label}
              </span>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6" aria-label="Destinations">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dest, i) => (
            <motion.button
              key={dest.id + dest.code}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(dest.id)}
              className="card-hover group rounded-3xl border border-white/[0.07] bg-[#0b0b0d] p-6 text-left"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/25 bg-gold/[0.08]">
                  <dest.icon className="h-5.5 w-5.5 h-6 w-6 text-gold-bright" aria-hidden />
                </span>
                <span className={cn("mono-label text-muted-foreground/50")}>{dest.code}</span>
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold group-hover:text-gold-bright transition-colors">
                {dest.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dest.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold/80">
                Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass mt-6 rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Nothing matches &ldquo;{query}&rdquo;. Try a broader term.</p>
          </div>
        )}
      </section>
    </>
  );
}
