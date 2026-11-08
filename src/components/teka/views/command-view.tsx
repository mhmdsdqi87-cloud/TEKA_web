"use client";

import { motion } from "framer-motion";
import { usePlatformStatus, useStats, useMarket, useUpdates, usePresence } from "@/lib/teka/hooks";
import { useRouter } from "@/lib/teka/router";
import { StatusBadge, SectionHeading, TekaMark } from "@/components/teka/primitives";
import { MarketWidget } from "@/components/teka/market-widget";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Database,
  Server,
  Globe,
  Coins,
  ArrowUpRight,
  Boxes,
  FlaskConical,
  Rocket,
  Clock3,
  Users,
  ShieldCheck,
  LayoutGrid,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SYSTEM_ICONS: Record<string, typeof Server> = {
  web: Globe,
  api: Server,
  database: Database,
  market: Activity,
  token: Coins,
};

const QUICK_LINKS = [
  { id: "ecosystem", label: "Ecosystem", icon: Boxes, desc: "Discover all divisions" },
  { id: "token", label: "Token", icon: Coins, desc: "Supply & contract info" },
  { id: "technology", label: "Technology", icon: LayoutGrid, desc: "The engine room" },
  { id: "explore", label: "Explore", icon: FileText, desc: "Platform deep-dives" },
] as const;

const UPDATE_ICONS: Record<string, typeof Rocket> = {
  FEATURE: Rocket,
  IMPROVEMENT: ShieldCheck,
  MILESTONE: Activity,
  NOTICE: FileText,
};

const UPDATE_TONES: Record<string, string> = {
  FEATURE: "border-gold/30 bg-gold/10 text-gold-bright",
  IMPROVEMENT: "border-silver/30 bg-silver/10 text-silver",
  MILESTONE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  NOTICE: "border-white/10 bg-white/[0.04] text-muted-foreground",
};

export function CommandView() {
  const status = usePlatformStatus();
  const stats = useStats();
  const market = useMarket();
  const updates = useUpdates(6);
  const presence = usePresence();
  const navigate = useRouter((s) => s.navigate);

  const liveCount = stats.data?.products.byStatus.live ?? 0;
  const devCount = stats.data?.products.byStatus.development ?? 0;
  const plannedCount = stats.data?.products.byStatus.planned ?? 0;
  const expCount = stats.data?.products.byStatus.experimental ?? 0;
  const total = stats.data?.products.total ?? 1;
  const bar = [
    { label: "Live", value: liveCount, cls: "bg-gold" },
    { label: "In Development", value: devCount, cls: "bg-silver" },
    { label: "Planned", value: plannedCount, cls: "bg-zinc-600" },
    { label: "Experimental", value: expCount, cls: "bg-zinc-700" },
  ];

  return (
    <div className="relative">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="grid-backdrop absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-14 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="mono-label text-gold/80 mb-2 flex items-center gap-3">
                <TekaMark className="h-6 w-auto drop-shadow-[0_0_8px_rgba(227,184,85,0.4)]" />
                TEKA Command Center
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-semibold">
                Mission <span className="gold-text">Control</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
                Real-time platform status, ecosystem statistics and changelog — every number on this
                page comes from the live TEKA API. Simulated or planned values are always labeled.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full glass px-4 py-2" aria-live="polite">
              <Clock3 className="h-3.5 w-3.5 text-gold/70" aria-hidden />
              <span className="mono-label text-muted-foreground">
                {status.data ? new Date(status.data.time).toLocaleTimeString("en-US", { hour12: false }) : "SYNCING…"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* System status grid */}
        <section aria-label="Platform systems status">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-gold" aria-hidden /> Systems Status
            </h2>
            {status.isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Refreshing" />}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {status.isLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : (status.data?.systems ?? []).map((system, i) => {
                  const Icon = SYSTEM_ICONS[system.id] ?? Server;
                  return (
                    <motion.div
                      key={system.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.45 }}
                      className="card-hover glass rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <Icon className="h-5 w-5 text-silver" aria-hidden />
                        <StatusBadge state={system.state} />
                      </div>
                      <h3 className="mt-3 text-sm font-medium">{system.label}</h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{system.detail}</p>
                    </motion.div>
                  );
                })}
          </div>
        </section>

        {/* KPI row */}
        <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              label: "People Exploring",
              value: presence.data ? String(presence.data.active) : "…",
              detail: "Real sessions · 45s window · zero inflation",
            },
            {
              icon: Boxes,
              label: "Ecosystem Units",
              value: stats.data ? String(stats.data.products.total) : "…",
              detail: `${liveCount} live · ${devCount} in development`,
            },
            {
              icon: Activity,
              label: "Market Feed",
              value: market.data?.availability === "UNAVAILABLE" ? "OFFLINE" : market.data ? "LIVE" : "…",
              detail: market.data?.availability === "UNAVAILABLE" ? "Upstream unreachable — will recover automatically" : "CoinGecko · 60s cache",
            },
            {
              icon: FlaskConical,
              label: "Roadmap Progress",
              value: stats.data ? `${Math.round((stats.data.roadmap.completed / stats.data.roadmap.total) * 100)}%` : "…",
              detail: `${stats.data?.roadmap.completed ?? 0} of ${stats.data?.roadmap.total ?? 5} phases complete`,
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="card-hover glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <kpi.icon className="h-4 w-4 text-gold/80" aria-hidden />
              </div>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{kpi.value}</p>
              <p className="mt-0.5 text-xs font-medium text-foreground/90">{kpi.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{kpi.detail}</p>
            </motion.div>
          ))}
        </section>

        {/* Distribution + quick nav */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]" aria-label="Ecosystem composition">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display text-lg font-semibold">Ecosystem Composition</h2>
            <p className="mt-1 text-xs text-muted-foreground">Catalog units by real delivery status</p>

            {/* stacked bar */}
            <div className="mt-6 flex h-3.5 w-full overflow-hidden rounded-full border border-white/[0.07]" role="img" aria-label="Product status distribution bar chart">
              {bar.map((seg) => (
                <div
                  key={seg.label}
                  className={cn(seg.cls, "transition-all duration-700")}
                  style={{ width: `${(seg.value / total) * 100}%` }}
                  title={`${seg.label}: ${seg.value}`}
                />
              ))}
            </div>

            <div className="mt-6 space-y-3.5">
              {bar.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", seg.cls)} aria-hidden />
                    <span className="text-muted-foreground">{seg.label}</span>
                  </span>
                  <span className="tabular-nums text-foreground/90">
                    {seg.value} <span className="text-muted-foreground text-xs">({Math.round((seg.value / total) * 100)}%)</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="hairline my-5" aria-hidden />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(stats.data?.products.byDivision ?? []).map((d) => (
                <div key={d.division} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <p className="font-display text-xl font-semibold tabular-nums text-gold-bright">{d.count}</p>
                  <p className="text-[10px] mono-label text-muted-foreground">{d.division}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display text-lg font-semibold">Quick Navigation</h2>
            <p className="mt-1 text-xs text-muted-foreground">Jump into the ecosystem</p>
            <div className="mt-5 grid gap-2.5">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 text-left transition-all hover:border-gold/35 hover:bg-gold/[0.05]"
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-4.5 w-4.5 h-5 w-5 text-silver group-hover:text-gold-bright transition-colors" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium">{link.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{link.desc}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-gold-bright" aria-hidden />
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Market */}
        <section aria-label="Market feed">
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-gold" aria-hidden /> Market Feed
            </h2>
          </div>
          <MarketWidget />
        </section>

        {/* Changelog */}
        <section aria-label="Platform updates">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold" aria-hidden /> Recent Platform Updates
            </h2>
            <button
              onClick={() => navigate("explore")}
              className="mono-label text-muted-foreground transition-colors hover:text-gold-bright"
            >
              Explore TEKA →
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {updates.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
              : (updates.data?.updates ?? []).map((update, i) => {
                  const Icon = UPDATE_ICONS[update.type] ?? FileText;
                  return (
                    <motion.article
                      key={update.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="card-hover glass rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] mono-label", UPDATE_TONES[update.type])}>
                          <Icon className="h-3 w-3" aria-hidden />
                          {update.type}
                        </span>
                        <time className="text-[11px] text-muted-foreground" dateTime={update.createdAt}>
                          {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                        </time>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold">{update.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{update.body}</p>
                    </motion.article>
                  );
                })}
          </div>
        </section>

        {/* Data policy */}
        <section aria-label="Data policy" className="rounded-2xl border border-gold/15 bg-gold/[0.04] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Data policy:</span> live values on this page are fetched from
              the TEKA API (status, presence, market, catalog). Market prices come from the CoinGecko public API and may
              be cached up to 60s. There are no simulated users, fake transactions or invented statistics anywhere on
              this platform — planned features are labeled as planned.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
