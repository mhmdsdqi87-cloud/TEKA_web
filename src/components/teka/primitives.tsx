"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUS } from "@/lib/teka/config";

/**
 * TekaMark — the official gold TEKA emblem.
 * The one and only brand mark; use it everywhere instead of letter placeholders.
 */
export function TekaMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/teka-mark.png"
      alt="TEKA emblem"
      width={874}
      height={491}
      priority={priority}
      className={cn("object-contain", className)}
      aria-hidden="true"
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "text-center mx-auto max-w-3xl" : "text-left max-w-2xl",
        className
      )}
    >
      <p className="mono-label text-gold/80 mb-3 flex items-center gap-2 justify-center data-[align=left]:justify-start" data-align={align}>
        {align === "center" && <span className="h-px w-8 bg-gold/40" aria-hidden />}
        {eyebrow}
        <span className="h-px w-8 bg-gold/40" aria-hidden />
      </p>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-balance">
        {title}
      </h2>
      {description && <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">{description}</p>}
    </motion.div>
  );
}

const SYSTEM_STATE_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  OPERATIONAL: { dot: "bg-emerald-400", text: "text-emerald-300", label: "OPERATIONAL" },
  LIVE: { dot: "bg-gold", text: "text-gold-bright", label: "LIVE" },
  TESTNET: { dot: "bg-amber-400", text: "text-amber-300", label: "TESTNET" },
  DEGRADED: { dot: "bg-amber-500", text: "text-amber-400", label: "DEGRADED" },
  OFFLINE: { dot: "bg-red-500", text: "text-red-400", label: "OFFLINE" },
  PLANNED: { dot: "bg-zinc-500", text: "text-zinc-400", label: "PLANNED" },
  DEVELOPMENT: { dot: "bg-silver", text: "text-silver", label: "IN DEVELOPMENT" },
  EXPERIMENTAL: { dot: "bg-silver", text: "text-silver", label: "EXPERIMENTAL" },
};

export function StatusBadge({ state, className }: { state: string; className?: string }) {
  const style = SYSTEM_STATE_STYLES[state] ?? SYSTEM_STATE_STYLES.PLANNED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] mono-label",
        style.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot, (state === "OPERATIONAL" || state === "LIVE") && "pulse-dot")} />
      {style.label}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: string }) {
  const meta = PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] ?? PRODUCT_STATUS.PLANNED;
  const tone: Record<string, string> = {
    gold: "border-gold/30 bg-gold/10 text-gold-bright",
    silver: "border-silver/30 bg-silver/10 text-silver",
    muted: "border-white/10 bg-white/[0.03] text-muted-foreground",
    outline: "border-dashed border-silver/30 text-silver/80",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] mono-label", tone[meta.tone])}>
      {meta.label}
    </span>
  );
}
