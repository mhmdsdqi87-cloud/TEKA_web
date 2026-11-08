"use client";

/**
 * Interactive ecosystem map — TEKA core with six orbiting divisions.
 * Pure SVG + framer-motion; keyboard accessible; reduced-motion aware.
 */
import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "@/lib/teka/router";
import { PRODUCT_DIVISIONS } from "@/lib/teka/config";
import { cn } from "@/lib/utils";
import { Cpu, Coins, Package, FlaskConical, Brain, Users } from "lucide-react";

const ICONS: Record<string, typeof Cpu> = {
  TECHNOLOGY: Cpu,
  WEB3: Coins,
  PRODUCTS: Package,
  LABS: FlaskConical,
  INTELLIGENCE: Brain,
  COMMUNITY: Users,
};

const SIZES = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" } as const;

export function EcosystemMap({ compact = false }: { compact?: boolean }) {
  const navigate = useRouter((s) => s.navigate);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const selected = hovered ?? focused;
  const activeDivision = PRODUCT_DIVISIONS.find((d) => d.id === selected);
  const orbitR = compact ? 38 : 39; // percentage radius

  return (
    <div className={cn("relative mx-auto w-full max-w-xl", compact ? "aspect-square max-w-md" : "aspect-square")}>
      {/* Orbit rings */}
      <div className="absolute inset-0 rounded-full border border-white/[0.06]" aria-hidden />
      <div className="absolute inset-[14%] rounded-full border border-dashed border-white/[0.08]" aria-hidden />

      {/* Rotating halo (skip under reduced motion) */}
      {!reduced && (
        <motion.div
          className="absolute inset-[6%] rounded-full border border-transparent"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(227,184,85,0.14) 40deg, transparent 80deg)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
      )}

      {/* Core */}
      <button
        onClick={() => navigate("ecosystem")}
        className="group absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        aria-label="Open TEKA ecosystem overview"
      >
        <motion.div
          whileHover={{ scale: 1.06 }}
          className="glass-gold flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full text-center"
        >
          <Image
            src="/teka-mark.png"
            alt=""
            width={72}
            height={40}
            className="h-auto w-14 sm:w-16"
            style={{ filter: "drop-shadow(0 0 10px rgba(227,184,85,0.4))" }}
          />
          <span className="mono-label mt-1 text-muted-foreground">Core</span>
        </motion.div>
      </button>

      {/* Division nodes */}
      {PRODUCT_DIVISIONS.map((division, i) => {
        const angle = (i / PRODUCT_DIVISIONS.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * orbitR;
        const y = 50 + Math.sin(angle) * orbitR;
        const Icon = ICONS[division.id];
        const isActive = selected === division.id;

        return (
          <motion.button
            key={division.id}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setHovered(division.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused(division.id)}
            onBlur={() => setFocused(null)}
            onClick={() => navigate("ecosystem")}
            aria-label={`${division.name} — open in ecosystem`}
          >
            <motion.div
              animate={isActive ? { scale: 1.12 } : { scale: 1 }}
              className={cn(
                "flex flex-col items-center gap-1.5",
                reduced ? "transition-none" : "transition-transform duration-300"
              )}
            >
              <span
                className={cn(
                  SIZES[compact ? "md" : "lg"],
                  "grid place-items-center rounded-2xl border backdrop-blur-md",
                  isActive
                    ? "border-gold/50 bg-gold/15 shadow-[0_0_30px_-6px_rgba(227,184,85,0.45)]"
                    : "border-white/10 bg-[#101013]/90"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-gold-bright" : "text-silver")} />
              </span>
              <span
                className={cn(
                  "whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide",
                  isActive ? "border-gold/40 bg-gold/10 text-gold-bright" : "border-white/10 bg-black/60 text-muted-foreground"
                )}
              >
                {division.name.replace("TEKA ", "")}
              </span>
            </motion.div>
          </motion.button>
        );
      })}

      {/* Active division caption */}
      <div className="absolute inset-x-0 -bottom-2 translate-y-full pt-3 text-center min-h-12">
        {activeDivision && (
          <motion.p
            key={activeDivision.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground"
          >
            <span className="text-gold-bright font-medium">{activeDivision.code}</span> — {activeDivision.description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
