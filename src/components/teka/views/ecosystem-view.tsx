"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/teka/page-shell";
import { EcosystemMap } from "@/components/teka/ecosystem-map";
import { ProductStatusBadge } from "@/components/teka/primitives";
import { useProducts, type Product } from "@/lib/teka/hooks";
import { PRODUCT_DIVISIONS, type DivisionId } from "@/lib/teka/config";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, X, Package, FlaskConical, Brain, Cpu, Coins, Users, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DIVISION_ICONS: Record<string, typeof Cpu> = {
  TECHNOLOGY: Cpu,
  WEB3: Coins,
  PRODUCTS: Package,
  LABS: FlaskConical,
  INTELLIGENCE: Brain,
  COMMUNITY: Users,
};

const STATUS_FILTERS = ["ALL", "LIVE", "DEVELOPMENT", "PLANNED", "EXPERIMENTAL"] as const;

type DivisionFilter = DivisionId | "ALL";

export function EcosystemView() {
  const [division, setDivision] = useState<DivisionFilter>("ALL");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");

  const products = useProducts({
    division: division === "ALL" ? undefined : division,
    status: status === "ALL" ? undefined : status,
    q: query.trim() ? query.trim() : undefined,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products.data?.products ?? []) {
      const list = map.get(p.division) ?? [];
      list.push(p);
      map.set(p.division, list);
    }
    return Array.from(map.entries());
  }, [products.data]);

  const activeDivisionMeta = PRODUCT_DIVISIONS.find((d) => d.id === division);

  return (
    <>
      <PageHeader
        eyebrow="TEKA Ecosystem"
        title={<>One Ecosystem. <span className="gold-text">Infinite Possibilities.</span></>}
        description="A technology ecosystem combining digital products, Web3 infrastructure, intelligence and community — every unit labeled with its real delivery status."
      />

      {/* Interactive map */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8" aria-label="Ecosystem map">
        <div className="glass rounded-3xl px-6 py-10 sm:px-10">
          <EcosystemMap />
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Hover or focus a division to preview it — click to filter the catalog below.
          </p>
        </div>
      </section>

      {/* Catalog controls */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16" aria-label="Ecosystem catalog">
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/75 border-y border-white/[0.05] mb-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Division tabs */}
            <div className="flex gap-1.5 overflow-x-auto scroll-area-styled pb-1 lg:pb-0" role="tablist" aria-label="Filter by division">
              <FilterChip active={division === "ALL"} onClick={() => setDivision("ALL")}>
                All Divisions
              </FilterChip>
              {PRODUCT_DIVISIONS.map((d) => (
                <FilterChip key={d.id} active={division === d.id} onClick={() => setDivision(d.id)}>
                  {d.name.replace("TEKA ", "")}
                </FilterChip>
              ))}
            </div>
            <div className="flex gap-2">
              {/* Status filter */}
              <label className="sr-only" htmlFor="status-filter">Filter by status</label>
              <select
                id="status-filter"
                value={status}
                onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
                className="h-9 rounded-lg border border-white/10 bg-[#101013] px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{s === "ALL" ? "Any status" : s.replace("_", " ")}</option>
                ))}
              </select>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ecosystem…"
                  aria-label="Search ecosystem catalog"
                  className="h-9 w-44 border-white/10 bg-[#101013] pl-8 pr-8 text-xs"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Division intro */}
        <AnimatePresence mode="wait">
          {activeDivisionMeta && (
            <motion.div
              key={activeDivisionMeta.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8 flex items-start gap-4 rounded-2xl border border-gold/15 bg-gold/[0.04] p-5"
            >
              {(() => {
                const Icon = DIVISION_ICONS[activeDivisionMeta.id];
                return <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />;
              })()}
              <div>
                <h2 className="font-display text-lg font-semibold">{activeDivisionMeta.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activeDivisionMeta.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product groups */}
        {products.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : (products.data?.products.length ?? 0) === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">No ecosystem units match these filters.</p>
            <button
              onClick={() => { setDivision("ALL"); setStatus("ALL"); setQuery(""); }}
              className="mt-4 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs text-gold-bright"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map(([divId, items]) => {
              const meta = PRODUCT_DIVISIONS.find((d) => d.id === divId);
              const Icon = DIVISION_ICONS[divId] ?? Package;
              return (
                <div key={divId}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-gold/25 bg-gold/[0.08]">
                      <Icon className="h-4 w-4 text-gold-bright" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{meta?.name ?? divId}</h3>
                      <p className="mono-label text-muted-foreground">{meta?.code} · {items.length} units</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-gold/50 bg-gold/15 text-gold-bright"
          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/25 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const metrics = useMemo<Array<{ label: string; value: string }>>(() => {
    try {
      return product.metrics ? JSON.parse(product.metrics) : [];
    } catch {
      return [];
    }
  }, [product.metrics]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="card-hover group flex flex-col rounded-2xl border border-white/[0.07] bg-[#0b0b0d] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono-label text-muted-foreground/70">{product.category}</span>
        <ProductStatusBadge status={product.status} />
      </div>
      <h4 className="mt-3 font-display text-lg font-semibold leading-snug">{product.name}</h4>
      <p className="mt-1 text-xs font-medium text-gold/80">{product.tagline}</p>
      <p className="mt-2.5 flex-1 text-xs leading-relaxed text-muted-foreground">{product.description}</p>

      {metrics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {metrics.map((m) => (
            <span
              key={m.label}
              className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[10px] text-muted-foreground"
            >
              <span className="text-foreground/80">{m.value}</span> · {m.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors group-hover:text-gold-bright">
        <ArrowUpRight className="h-3 w-3" aria-hidden />
        {product.status === "LIVE" ? "Operational on the platform" : product.status === "DEVELOPMENT" ? "Actively being built" : "On the roadmap — not built yet"}
      </div>
    </motion.article>
  );
}
